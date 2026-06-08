import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { getServerConfig } from "@/lib/config/server";
import type { SavedJob, StoredJobData } from "@/lib/storage/types";

export type { SavedJob, StoredJobData } from "@/lib/storage/types";

const FILES = {
  data: "data.json",
  markdown: "post.md",
  html: "post.html",
} as const;

function resolveJobDir(jobId: string): string {
  const config = getServerConfig();
  const safeId = jobId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeId || safeId !== jobId) {
    throw new Error(`jobId inválido: "${jobId}"`);
  }
  return resolve(process.cwd(), config.outputsDir, safeId);
}

/**
 * Writes a fresh job (overwrites any existing files for that jobId).
 */
export async function writeJob(args: {
  jobId: string;
  data: StoredJobData;
  markdown: string;
  html: string;
}): Promise<void> {
  const dir = resolveJobDir(args.jobId);
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(join(dir, FILES.data), JSON.stringify(args.data, null, 2), "utf8"),
    writeFile(join(dir, FILES.markdown), args.markdown, "utf8"),
    writeFile(join(dir, FILES.html), args.html, "utf8"),
  ]);
}

export async function readJob(jobId: string): Promise<SavedJob | null> {
  const dir = resolveJobDir(jobId);
  if (!existsSync(dir)) return null;

  const [dataRaw, markdown, html] = await Promise.all([
    readFile(join(dir, FILES.data), "utf8"),
    readFile(join(dir, FILES.markdown), "utf8"),
    readFile(join(dir, FILES.html), "utf8"),
  ]);

  return {
    jobId,
    data: JSON.parse(dataRaw) as StoredJobData,
    markdown,
    html,
  };
}

/**
 * Persists a manual edit. Rewrites post.md and post.html, bumps updatedAt in data.json.
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
