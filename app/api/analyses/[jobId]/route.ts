import { NextResponse } from "next/server";
import { renderHtml } from "@/lib/renderers/html";
import { updateJobMarkdown } from "@/lib/storage/local-output-store";
import {
  deleteAnalysis,
  getAnalysis,
  updateAnalysisMarkdown,
} from "@/lib/storage/mongo-analysis-store";
import type { GenerateResponse } from "@/lib/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  try {
    const doc = await getAnalysis(jobId);
    if (!doc) {
      return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
    }

    const response: GenerateResponse = {
      jobId: doc.jobId,
      markdown: doc.markdown,
      html: doc.html,
      data: doc.data,
      seo: doc.data.seo,
      warnings: doc.data.quality.warnings,
      providerUsed: doc.data.providerUsed as GenerateResponse["providerUsed"],
      modelUsed: doc.modelUsed,
    };
    return NextResponse.json(response);
  } catch (cause) {
    return NextResponse.json(
      { error: `Falha ao ler análise: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;

  let body: { markdown?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (typeof body.markdown !== "string" || body.markdown.trim().length === 0) {
    return NextResponse.json(
      { error: "Campo 'markdown' obrigatório e não vazio." },
      { status: 400 },
    );
  }

  const existing = await getAnalysis(jobId);
  if (!existing) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const html = renderHtml(body.markdown);
  await updateAnalysisMarkdown({ jobId, markdown: body.markdown, html });

  try {
    await updateJobMarkdown({ jobId, markdown: body.markdown, html });
  } catch (cause) {
    console.error(`Falha ao sincronizar análise ${jobId} no disco local:`, cause);
  }

  return NextResponse.json({ jobId, markdown: body.markdown, html });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  try {
    const deleted = await deleteAnalysis(jobId);
    if (!deleted) {
      return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ jobId, deleted: true });
  } catch (cause) {
    return NextResponse.json(
      { error: `Falha ao excluir análise: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}
