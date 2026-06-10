import { NextResponse } from "next/server";
import { listAnalyses } from "@/lib/storage/mongo-analysis-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  try {
    const result = await listAnalyses({
      search,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
    });
    return NextResponse.json(result);
  } catch (cause) {
    return NextResponse.json(
      { error: `Falha ao listar análises: ${(cause as Error).message}` },
      { status: 500 },
    );
  }
}
