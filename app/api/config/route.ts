import { NextResponse } from "next/server";
import {
  getServerConfig,
  listAvailableProviders,
} from "@/lib/config/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getServerConfig();
  const availableProviders = listAvailableProviders(config);

  return NextResponse.json({
    defaultProvider: config.defaultProvider,
    availableProviders,
    allProviders: ["openai", "gemini", "deepseek"],
    models: {
      openai: config.openai.model,
      gemini: config.gemini.model,
      deepseek: config.deepseek.model,
    },
    maxPdfBytes: config.maxPdfBytes,
  });
}
