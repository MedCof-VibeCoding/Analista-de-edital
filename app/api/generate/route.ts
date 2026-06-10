import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { runPipeline } from "@/lib/ai/pipeline";
import { AiProviderError, getProvider } from "@/lib/ai/providers";
import { getServerConfig, isProviderName } from "@/lib/config/server";
import { PdfExtractionError, extractPdfText } from "@/lib/pdf/extract-text";
import { renderHtml } from "@/lib/renderers/html";
import { renderMarkdown } from "@/lib/renderers/markdown";
import { writeJob, type StoredJobData } from "@/lib/storage/local-output-store";
import { saveAnalysis } from "@/lib/storage/mongo-analysis-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const config = getServerConfig();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Corpo inválido. Envie multipart/form-data com 'file' e 'provider'." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Campo 'file' ausente ou inválido." },
      { status: 400 },
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Arquivo precisa ser um PDF (application/pdf)." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
  }

  if (file.size > config.maxPdfBytes) {
    const maxMb = (config.maxPdfBytes / (1024 * 1024)).toFixed(0);
    return NextResponse.json(
      { error: `Arquivo excede o limite de ${maxMb} MB.` },
      { status: 400 },
    );
  }

  const requestedProvider = (formData.get("provider")?.toString() ?? "").trim().toLowerCase();
  const providerName = requestedProvider.length > 0 ? requestedProvider : config.defaultProvider;
  if (!isProviderName(providerName)) {
    return NextResponse.json(
      { error: `Provider inválido: "${providerName}". Use openai, gemini ou deepseek.` },
      { status: 400 },
    );
  }

  let provider;
  try {
    provider = getProvider(providerName);
  } catch (cause) {
    if (cause instanceof AiProviderError && cause.code === "MISSING_KEY") {
      return NextResponse.json({ error: cause.message }, { status: 400 });
    }
    throw cause;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  let pdfResult;
  try {
    pdfResult = await extractPdfText(buffer);
  } catch (cause) {
    if (cause instanceof PdfExtractionError) {
      const status = cause.code === "PARSE_FAILED" ? 400 : 422;
      return NextResponse.json({ error: cause.message }, { status });
    }
    throw cause;
  }

  let pipelineResult;
  try {
    pipelineResult = await runPipeline({
      provider,
      extractedText: pdfResult.text,
      filename: file.name,
    });
  } catch (cause) {
    if (cause instanceof AiProviderError) {
      return NextResponse.json(
        { error: `Erro do provedor ${cause.provider}: ${cause.message}` },
        { status: 502 },
      );
    }
    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Resposta da IA não corresponde ao schema esperado: ${cause.message}` },
        { status: 502 },
      );
    }
    throw cause;
  }

  const markdown = renderMarkdown({
    extraction: pipelineResult.extraction,
    seo: pipelineResult.seo,
  });
  const html = renderHtml(markdown);
  const jobId = nanoid(10);
  const data: StoredJobData = {
    ...pipelineResult,
    jobId,
    sourceFilename: file.name,
    createdAt: new Date().toISOString(),
  };

  await writeJob({ jobId, data, markdown, html });

  try {
    await saveAnalysis({ jobId, data, markdown, html });
  } catch (cause) {
    console.error(`Falha ao persistir análise ${jobId} no MongoDB:`, cause);
  }

  return NextResponse.json({
    jobId,
    markdown,
    html,
    data,
    seo: pipelineResult.seo,
    warnings: pipelineResult.quality.warnings,
    providerUsed: pipelineResult.providerUsed,
    modelUsed: pipelineResult.modelUsed,
  });
}
