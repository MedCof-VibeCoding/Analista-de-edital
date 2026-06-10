import "server-only";
import { getJobsCollection, type JobDocument } from "@/lib/db/mongo";
import type { JobSummary, SavedJob, StoredJobData } from "@/lib/storage/types";

export type { JobSummary, SavedJob, StoredJobData } from "@/lib/storage/types";

function toSavedJob(doc: JobDocument): SavedJob {
  return {
    jobId: doc._id,
    data: doc.data,
    markdown: doc.markdown,
    html: doc.html,
  };
}

/**
 * Writes a fresh job, overwriting any existing document with the same jobId.
 */
export async function writeJob(args: {
  jobId: string;
  data: StoredJobData;
  markdown: string;
  html: string;
}): Promise<void> {
  const collection = await getJobsCollection();
  await collection.updateOne(
    { _id: args.jobId },
    {
      $set: {
        data: args.data,
        markdown: args.markdown,
        html: args.html,
        createdAt: args.data.createdAt,
        updatedAt: args.data.updatedAt,
      },
    },
    { upsert: true },
  );
}

export async function readJob(jobId: string): Promise<SavedJob | null> {
  const collection = await getJobsCollection();
  const doc = await collection.findOne({ _id: jobId });
  return doc ? toSavedJob(doc) : null;
}

/**
 * Persists a manual edit: rewrites markdown/html and bumps updatedAt.
 */
export async function updateJobMarkdown(args: {
  jobId: string;
  markdown: string;
  html: string;
}): Promise<SavedJob> {
  const existing = await readJob(args.jobId);
  if (!existing) {
    throw new Error(`Job não encontrado: ${args.jobId}`);
  }

  const updated: StoredJobData = {
    ...existing.data,
    updatedAt: new Date().toISOString(),
  };

  await writeJob({
    jobId: args.jobId,
    data: updated,
    markdown: args.markdown,
    html: args.html,
  });

  return { jobId: args.jobId, data: updated, markdown: args.markdown, html: args.html };
}

/**
 * Returns job metadata ordered by creation date (newest first) for the history view.
 */
export async function listJobs(limit = 50): Promise<JobSummary[]> {
  const collection = await getJobsCollection();
  const docs = await collection
    .find({}, { projection: { markdown: 0, html: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    jobId: doc._id,
    title: doc.data.seo.seoTitle,
    sourceFilename: doc.data.sourceFilename,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}
