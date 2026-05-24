import "server-only";
import {
  NoticeExtractionSchema,
  QualityReportSchema,
  SeoSchema,
  type AiPipelineResult,
} from "./schemas";
import { SYSTEM_PROMPT } from "./prompts/system";
import { buildExtractNoticePrompt } from "./prompts/extract-notice";
import { buildSeoPrompt } from "./prompts/seo";
import { buildQualityCheckPrompt } from "./prompts/quality-check";
import type { AiProvider } from "./providers/types";

export interface RunPipelineInput {
  provider: AiProvider;
  extractedText: string;
  filename: string;
  currentDate?: string;
}

/**
 * Orchestrates the 3 sequential AI calls (extract → seo → quality-check) using the injected provider.
 */
export async function runPipeline(input: RunPipelineInput): Promise<AiPipelineResult> {
  const currentDate = input.currentDate ?? new Date().toISOString().slice(0, 10);

  const extraction = await input.provider.generateStructured({
    schema: NoticeExtractionSchema,
    schemaName: "NoticeExtraction",
    system: SYSTEM_PROMPT,
    user: buildExtractNoticePrompt({
      extractedText: input.extractedText,
      filename: input.filename,
      currentDate,
    }),
  });

  const seo = await input.provider.generateStructured({
    schema: SeoSchema,
    schemaName: "SeoMeta",
    system: SYSTEM_PROMPT,
    user: buildSeoPrompt({ extraction, currentDate }),
  });

  const quality = await input.provider.generateStructured({
    schema: QualityReportSchema,
    schemaName: "QualityReport",
    system: SYSTEM_PROMPT,
    user: buildQualityCheckPrompt({
      extraction,
      extractedText: input.extractedText,
    }),
  });

  return {
    extraction,
    seo,
    quality,
    providerUsed: input.provider.name,
    modelUsed: input.provider.model,
  };
}
