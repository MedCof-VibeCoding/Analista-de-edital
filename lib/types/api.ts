import type { ProviderName } from "@/lib/config/server";
import type {
  AiPipelineResult,
  NoticeExtraction,
  QualityWarning,
  SeoMeta,
} from "@/lib/ai/schemas";

export type { ProviderName };

export interface GenerateResponse {
  jobId: string;
  markdown: string;
  html: string;
  data: AiPipelineResult & {
    jobId: string;
    sourceFilename: string;
    createdAt: string;
    updatedAt?: string;
  };
  seo: SeoMeta;
  warnings: QualityWarning[];
  providerUsed: ProviderName;
  modelUsed: string;
}

export interface ConfigResponse {
  defaultProvider: ProviderName;
  availableProviders: ProviderName[];
  allProviders: ProviderName[];
  models: Record<ProviderName, string>;
  maxPdfBytes: number;
}

export interface SavedJobResponse {
  jobId: string;
  data: GenerateResponse["data"];
  markdown: string;
  html: string;
}

export type { NoticeExtraction, QualityWarning, SeoMeta };
