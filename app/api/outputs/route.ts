import { NextResponse } from "next/server";
import { listJobs } from "@/lib/storage/mongo-output-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await listJobs();
    return NextResponse.json({ jobs });
  } catch (cause) {
    return NextResponse.json(
      { error: `Falha ao listar jobs: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}
