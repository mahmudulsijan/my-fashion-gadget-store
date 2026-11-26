import crypto from "crypto";
import { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "maveron_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSigningSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  return secret;
}

export function createAdminSessionToken(now = Date.now()): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const exp = now + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", iat: now, exp }),
    "utf8"
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  const secret = getSigningSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(sigB64, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { role?: string; exp?: number };

    if (parsed.role !== "admin") return false;
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifyAdminSessionToken(cookieToken)) {
    return true;
  }

  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifyAdminSessionToken(bearerToken)) {
      return true;
    }
  }

  return false;
}