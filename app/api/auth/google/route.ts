import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getSiteUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return req.nextUrl.origin.replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not configured" },
      { status: 500 }
    );
  }

  const siteUrl = getSiteUrl(req);
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  const state = crypto.randomBytes(24).toString("hex");
  const nextPath = req.nextUrl.searchParams.get("next") || "/";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl.toString());

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: siteUrl.startsWith("https://"),
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  };

  res.cookies.set("google_oauth_state", state, cookieOptions);
  res.cookies.set("oauth_next_path", safeNext, cookieOptions);

  return res;
}