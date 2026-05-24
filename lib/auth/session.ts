import { AUTH_CONFIG } from "./config";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let cachedKey: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_CONFIG.sessionSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return cachedKey;
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Generates a session token containing the expiration timestamp, signed with HMAC-SHA256.
 * Format: <base64url(payload)>.<base64url(signature)>
 */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    exp: Date.now() + AUTH_CONFIG.cookieMaxAgeSeconds * 1000,
  });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const signature = await sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies signature and expiration of a session token. Returns true if valid and unexpired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  try {
    const expected = await sign(payloadB64);
    if (!timingSafeEqualStrings(signature, expected)) return false;
    const payloadJson = decoder.decode(fromBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Constant-time comparison to mitigate timing-based attacks on the signature.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
