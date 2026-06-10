import type { ProviderName } from "@/lib/config/server";
import type {
  AiPipelineResult,
  NoticeExtraction,
  QualityWarning,
  SeoMeta,
  SocialOutput,
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

export interface AnalysisSummary {
  jobId: string;
  title: string;
  institutions: string[];
  sourceFilename: string;
  providerUsed: string;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisListResponse {
  items: AnalysisSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface SocialResponse {
  reels: string;
  carousel: string[];
  caption: string;
  tweet: string;
  providerUsed: ProviderName;
  modelUsed: string;
}

export type { NoticeExtraction, QualityWarning, SeoMeta, SocialOutput };
