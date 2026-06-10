import "server-only";
import { getAnalysesCollection, type AnalysisDocument } from "@/lib/db/mongo";
import type { StoredJobData } from "./local-output-store";

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

export interface ListAnalysesArgs {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListAnalysesResult {
  items: AnalysisSummary[];
  total: number;
  page: number;
  limit: number;
}

const SUMMARY_PROJECTION = {
  _id: 0,
  jobId: 1,
  title: 1,
  institutions: 1,
  "data.sourceFilename": 1,
  providerUsed: 1,
  modelUsed: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

/**
 * Inserts or replaces an analysis document, keyed by jobId.
 */
export async function saveAnalysis(args: {
  jobId: string;
  data: StoredJobData;
  markdown: string;
  html: string;
}): Promise<void> {
  const collection = await getAnalysesCollection();
  const now = new Date().toISOString();
  const doc: AnalysisDocument = {
    jobId: args.jobId,
    data: args.data,
    markdown: args.markdown,
    html: args.html,
    title: args.data.extraction.blogTitle,
    institutions: args.data.extraction.institutions,
    providerUsed: args.data.providerUsed,
    modelUsed: args.data.modelUsed,
    createdAt: args.data.createdAt ?? now,
    updatedAt: args.data.updatedAt ?? now,
  };

  await collection.replaceOne({ jobId: args.jobId }, doc, { upsert: true });
}

/**
 * Lists analyses as lightweight summaries, optionally filtered by a text search.
 */
export async function listAnalyses(args: ListAnalysesArgs = {}): Promise<ListAnalysesResult> {
  const collection = await getAnalysesCollection();
  const page = Math.max(1, args.page ?? 1);
  const limit = Math.min(100, Math.max(1, args.limit ?? 20));
  const filter = buildSearchFilter(args.search);

  const [docs, total] = await Promise.all([
    collection
      .find(filter, { projection: SUMMARY_PROJECTION })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return { items: docs.map(toSummary), total, page, limit };
}

export async function getAnalysis(jobId: string): Promise<AnalysisDocument | null> {
  const collection = await getAnalysesCollection();
  return collection.findOne({ jobId }, { projection: { _id: 0 } });
}

/**
 * Updates the markdown/html of an existing analysis and bumps updatedAt.
 */
export async function updateAnalysisMarkdown(args: {
  jobId: string;
  markdown: string;
  html: string;
}): Promise<void> {
  const collection = await getAnalysesCollection();
  const now = new Date().toISOString();
  await collection.updateOne(
    { jobId: args.jobId },
    { $set: { markdown: args.markdown, html: args.html, updatedAt: now, "data.updatedAt": now } },
  );
}

export async function deleteAnalysis(jobId: string): Promise<boolean> {
  const collection = await getAnalysesCollection();
  const result = await collection.deleteOne({ jobId });
  return result.deletedCount > 0;
}

function buildSearchFilter(search?: string): Record<string, unknown> {
  const term = search?.trim();
  if (!term) return {};
  const regex = { $regex: term, $options: "i" };
  return { $or: [{ title: regex }, { institutions: regex }] };
}

function toSummary(doc: Pick<AnalysisDocument, "jobId" | "title" | "institutions" | "providerUsed" | "modelUsed" | "createdAt" | "updatedAt"> & { data?: { sourceFilename?: string } }): AnalysisSummary {
  return {
    jobId: doc.jobId,
    title: doc.title,
    institutions: doc.institutions ?? [],
    sourceFilename: doc.data?.sourceFilename ?? "",
    providerUsed: doc.providerUsed,
    modelUsed: doc.modelUsed,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
