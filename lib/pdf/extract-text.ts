import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

const MIN_EXTRACTABLE_CHARS = 500;

export interface PdfExtractionResult {
  text: string;
  numPages: number;
  charCount: number;
}

export class PdfExtractionError extends Error {
  readonly code: "EMPTY" | "TOO_SHORT" | "PARSE_FAILED";

  constructor(code: PdfExtractionError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "PdfExtractionError";
  }
}

/**
 * Extracts text from a PDF buffer using unpdf (pure JS, serverless-friendly).
 * Throws PdfExtractionError if the document yields no meaningful text — likely a scanned PDF.
 */
export async function extractPdfText(buffer: Uint8Array): Promise<PdfExtractionResult> {
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;
  try {
    pdf = await getDocumentProxy(buffer);
  } catch (cause) {
    throw new PdfExtractionError(
      "PARSE_FAILED",
      `Não foi possível interpretar o PDF: ${(cause as Error).message}`,
    );
  }

  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  const joinedText = (Array.isArray(text) ? text.join("\n") : text).trim();

  if (joinedText.length === 0) {
    throw new PdfExtractionError(
      "EMPTY",
      "O PDF não contém texto extraível. Provavelmente é uma imagem escaneada.",
    );
  }

  if (joinedText.length < MIN_EXTRACTABLE_CHARS) {
    throw new PdfExtractionError(
      "TOO_SHORT",
      `O texto extraído (${joinedText.length} caracteres) é muito curto para gerar um post. Verifique se o PDF possui texto selecionável.`,
    );
  }

  return {
    text: joinedText,
    numPages: totalPages,
    charCount: joinedText.length,
  };
}
