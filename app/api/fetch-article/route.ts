import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RequestSchema = z.object({
  url: z.string().url("URL inválida. Informe uma URL completa (ex: https://exemplo.com.br/blog/post)."),
});

/** Strips noisy structural blocks and returns plain text from raw HTML. */
function extractArticleText(html: string): string {
  let content = html;

  // Prefer <article> > <main> to avoid nav/header/footer noise
  const articleMatch = /<article[^>]*>([\s\S]*?)<\/article>/i.exec(html);
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  if (articleMatch?.[1]) content = articleMatch[1];
  else if (mainMatch?.[1]) content = mainMatch[1];

  // Strip noisy blocks even if they leaked into the selected region
  const noisePattern =
    /<(script|style|nav|header|footer|aside|form|noscript)[\s\S]*?<\/\1>/gi;
  content = content.replace(noisePattern, "");

  // Strip all remaining HTML tags → plain text
  const text = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });

  // Collapse whitespace and trim
  return text.replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo inválido. Envie JSON com o campo 'url'." },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "URL inválida." },
      { status: 400 },
    );
  }

  const { url } = parsed.data;

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MedCofBot/1.0; +https://grupomedcof.com.br)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Não foi possível acessar a página (HTTP ${response.status}).` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "A URL não retornou uma página HTML. Verifique o endereço e tente novamente." },
        { status: 400 },
      );
    }

    html = await response.text();
  } catch (cause) {
    const message =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "A página demorou muito para responder. Tente novamente."
        : `Falha ao acessar a URL: ${(cause as Error).message}`;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const text = extractArticleText(html);

  if (text.length < 100) {
    return NextResponse.json(
      { error: "Não foi possível extrair conteúdo suficiente da página. Tente usar a opção 'Colar Texto'." },
      { status: 422 },
    );
  }

  return NextResponse.json({ text });
}
