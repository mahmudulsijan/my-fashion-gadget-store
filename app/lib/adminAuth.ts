import crypto from "crypto";
import { NextRequest } from "next/server";

export type AdminSessionRole = "admin" | "staff";

export interface AdminSessionPayload {
  role: AdminSessionRole;
  adminId: string;
  actorName: string;
  iat: number;
  exp: number;
}

export const ADMIN_SESSION_COOKIE = "maveron_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSigningSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function createAdminSessionToken(
  now = Date.now(),
  role: AdminSessionRole = "admin",
  adminId = role === "staff"
    ? process.env.STAFF_ID || "staff-operations"
    : process.env.ADMIN_ID || "admin-owner",
  actorName = role === "staff"
    ? process.env.STAFF_NAME || "Order & Inventory Staff"
    : process.env.ADMIN_NAME || "Store Owner"
): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const exp = now + SESSION_TTL_MS;
  const payloadObj: AdminSessionPayload = {
    role,
    adminId,
    actorName,
    iat: now,
    exp,
  };
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString(
    "base64url"
  );

  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(
  token?: string | null
): AdminSessionPayload | null {
  if (!token) return null;
  const secret = getSigningSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(sigB64, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length) return false as unknown as null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as Partial<AdminSessionPayload>;

    if (parsed.role !== "admin" && parsed.role !== "staff") return null;
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }

    return {
      role: parsed.role,
      adminId:
        typeof parsed.adminId === "string" && parsed.adminId
          ? parsed.adminId
          : parsed.role === "staff"
          ? "staff-operations"
          : "admin-owner",
      actorName:
        typeof parsed.actorName === "string" && parsed.actorName
          ? parsed.actorName
          : parsed.role === "staff"
          ? "Order & Inventory Staff"
          : "Store Owner",
      iat: typeof parsed.iat === "number" ? parsed.iat : Date.now(),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function getAdminSession(req: NextRequest): AdminSessionPayload | null {
  const cookieToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const fromCookie = verifyAdminSessionToken(cookieToken);
  if (fromCookie) return fromCookie;

  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    const fromBearer = verifyAdminSessionToken(bearerToken);
    if (fromBearer) return fromBearer;
  }

  return null;
}

export function hasAdminAccess(
  req: NextRequest,
  allowedRoles: AdminSessionRole[] = ["admin", "staff"]
): boolean {
  const session = getAdminSession(req);
  if (!session) return false;
  return allowedRoles.includes(session.role);
}

export function isAdminRequest(req: NextRequest): boolean {
  return hasAdminAccess(req, ["admin", "staff"]);
}