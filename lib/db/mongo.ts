import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { getServerConfig } from "@/lib/config/server";
import type { StoredJobData } from "@/lib/storage/types";

export interface AnalysisDocument {
  jobId: string;
  data: StoredJobData;
  markdown: string;
  html: string;
  title: string;
  institutions: string[];
  providerUsed: string;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDocument {
  _id: string;
  data: StoredJobData;
  markdown: string;
  html: string;
  createdAt: string;
  updatedAt?: string;
}

interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  indexesReady: boolean;
}

const globalForMongo = globalThis as unknown as { __mongoCache?: MongoCache };
const cache: MongoCache =
  globalForMongo.__mongoCache ?? { client: null, promise: null, indexesReady: false };
globalForMongo.__mongoCache = cache;

/**
 * Returns a connected MongoClient, reusing a cached connection across hot-reloads and invocations.
 */
async function getClient(): Promise<MongoClient> {
  const { mongo } = getServerConfig();
  if (!mongo.uri) {
    throw new Error("MONGODB_URI não configurado. Defina-o em .env.local.");
  }

  if (cache.client) return cache.client;
  if (!cache.promise) {
    cache.promise = new MongoClient(mongo.uri).connect();
  }
  cache.client = await cache.promise;
  return cache.client;
}

export async function getDb(): Promise<Db> {
  const { mongo } = getServerConfig();
  const client = await getClient();
  return client.db(mongo.db);
}

/**
 * Returns the analyses collection, ensuring required indexes exist.
 */
export async function getAnalysesCollection(): Promise<Collection<AnalysisDocument>> {
  const { mongo } = getServerConfig();
  const db = await getDb();
  const collection = db.collection<AnalysisDocument>(mongo.collection);
  if (!cache.indexesReady) {
    await Promise.all([
      collection.createIndex({ jobId: 1 }, { unique: true }),
      collection.createIndex({ title: "text", institutions: "text" }),
      collection.createIndex({ createdAt: -1 }),
    ]);
    cache.indexesReady = true;
  }
  return collection;
}

export async function getJobsCollection(): Promise<Collection<JobDocument>> {
  const db = await getDb();
  return db.collection<JobDocument>("jobs");
}
