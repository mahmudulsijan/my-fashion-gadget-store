import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/app/lib/adminAuth";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_ATTEMPTS = 6;
const loginRateLimitMap = new Map<string, RateLimitEntry>();

function isPasswordMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || "local-client";
  return `admin-login:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = loginRateLimitMap.get(key);
  if (!existing || now > existing.resetAt) {
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const existing = loginRateLimitMap.get(key);
  if (!existing || now > existing.resetAt) {
    loginRateLimitMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }
  existing.count += 1;
}

function clearRateLimit(key: string) {
  loginRateLimitMap.delete(key);
}

function resolveRoleAndActor(password: string): {
  role: "admin" | "staff";
  adminId: string;
  actorName: string;
} | null {
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const staffPassword = process.env.STAFF_PASSWORD || "";

  if (adminPassword && isPasswordMatch(password, adminPassword)) {
    return {
      role: "admin",
      adminId: process.env.ADMIN_ID || "admin-owner",
      actorName: process.env.ADMIN_NAME || "Store Owner",
    };
  }

  if (staffPassword && isPasswordMatch(password, staffPassword)) {
    return {
      role: "staff",
      adminId: process.env.STAFF_ID || "staff-operations",
      actorName: process.env.STAFF_NAME || "Order & Inventory Staff",
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const rateKey = getClientKey(req);
  const rateCheck = checkRateLimit(rateKey);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `অনেকবার ভুল পাসওয়ার্ড চেষ্টা করা হয়েছে। ${rateCheck.retryAfterSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSec) },
      }
    );
  }

  try {
    const body = await req.json();
    const password = String(body?.password || "");

    if (!password) {
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        { success: false, message: "পাসওয়ার্ড দিন" },
        { status: 400 }
      );
    }

    const identity = resolveRoleAndActor(password);
    if (!identity) {
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        { success: false, message: "Invalid admin or staff password" },
        { status: 401 }
      );
    }

    clearRateLimit(rateKey);

    const loginTime = new Date().toISOString();
    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Admin session secret is not configured" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: "Authenticated",
      role: identity.role,
      adminId: identity.adminId,
      loginTime,
      user: {
        id: identity.adminId,
        name: identity.actorName,
        role: identity.role,
      },
    });

    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const logoutTime = new Date().toISOString();
  const res = NextResponse.json({
    success: true,
    message: "Logged out",
    logoutTime,
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}