import type { AiPipelineResult } from "@/lib/ai/schemas";

export interface StoredJobData extends AiPipelineResult {
  jobId: string;
  sourceFilename: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedJob {
  jobId: string;
  data: StoredJobData;
  markdown: string;
  html: string;
}

export interface JobSummary {
  jobId: string;
  title: string;
  sourceFilename: string;
  createdAt: string;
  updatedAt?: string;
}
