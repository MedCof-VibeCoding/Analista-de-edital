import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_CONFIG.cookieName,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
