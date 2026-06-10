import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { getServerConfig } from "@/lib/config/server";
<<<<<<< HEAD
import type { StoredJobData } from "@/lib/storage/local-output-store";

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

async function getDb(): Promise<Db> {
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
=======
import type { StoredJobData } from "@/lib/storage/types";

export interface JobDocument {
  _id: string;
  data: StoredJobData;
  markdown: string;
  html: string;
  createdAt: string;
  updatedAt?: string;
}

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/**
 * Returns a shared MongoClient connection, caching the promise on globalThis so
 * hot-reload in dev and serverless invocations reuse a single pool.
 */
function getClientPromise(): Promise<MongoClient> {
  const { uri } = getServerConfig().mongo;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada. Defina-a no ambiente para usar o MongoDB.");
  }

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(getServerConfig().mongo.dbName);
}

export async function getJobsCollection(): Promise<Collection<JobDocument>> {
  const db = await getDb();
  return db.collection<JobDocument>("jobs");
>>>>>>> 206a690294c269f25f3c57cf1b18badd3a66180a
}
