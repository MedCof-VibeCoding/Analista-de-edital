import { NextResponse } from "next/server";
import { renderHtml } from "@/lib/renderers/html";
import { updateJobMarkdown } from "@/lib/storage/local-output-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    const html = renderHtml(body.markdown);
    const saved = await updateJobMarkdown({ jobId, markdown: body.markdown, html });
    return NextResponse.json(saved);
  } catch (cause) {
    const message = (cause as Error).message;
    const status = message.includes("não encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
