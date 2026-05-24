import { NextResponse } from "next/server";
import { readJob } from "@/lib/storage/local-output-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  try {
    const job = await readJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job não encontrado." }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (cause) {
    return NextResponse.json(
      { error: `Falha ao ler job: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}
