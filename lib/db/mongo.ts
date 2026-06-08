import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { getServerConfig } from "@/lib/config/server";
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
}
