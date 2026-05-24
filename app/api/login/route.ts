import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { createSessionToken, timingSafeEqualStrings } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_ERROR = "Credenciais inválidas.";

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const userOk = timingSafeEqualStrings(username, AUTH_CONFIG.username);
  const passOk = timingSafeEqualStrings(password, AUTH_CONFIG.password);
  if (!userOk || !passOk) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_CONFIG.cookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_CONFIG.cookieMaxAgeSeconds,
  });
  return response;
}
