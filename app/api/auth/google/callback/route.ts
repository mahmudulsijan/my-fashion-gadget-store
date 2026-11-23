import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getSiteUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return req.nextUrl.origin.replace(/\/+$/, "");
}

function createSignedSessionToken(payload: Record<string, unknown>, secret: string): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export async function GET(req: NextRequest) {
  const siteUrl = getSiteUrl(req);
  const nextCookie = req.cookies.get("oauth_next_path")?.value || "/";
  const safeNext = nextCookie.startsWith("/") ? nextCookie : "/";

  const redirectWithError = (errorCode: string) => {
    const url = new URL(`${siteUrl}${safeNext}`);
    url.searchParams.set("auth_error", errorCode);
    const res = NextResponse.redirect(url.toString());
    res.cookies.delete("google_oauth_state");
    res.cookies.delete("oauth_next_path");
    return res;
  };

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const savedState = req.cookies.get("google_oauth_state")?.value;

  if (error) {
    return redirectWithError(error);
  }

  if (!code || !state || !savedState || state !== savedState) {
    return redirectWithError("invalid_oauth_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const authSecret = process.env.AUTH_SECRET?.trim();

  if (!clientId || !clientSecret || !authSecret) {
    return redirectWithError("missing_auth_config");
  }

  try {
    const redirectUri = `${siteUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return redirectWithError("token_exchange_failed");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string | undefined;

    if (!accessToken) {
      return redirectWithError("missing_access_token");
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return redirectWithError("userinfo_failed");
    }

    const profile = await profileRes.json();
    const email = (profile.email as string | undefined)?.toLowerCase().trim();

    if (!email) {
      return redirectWithError("email_not_provided");
    }

    // প্রয়োজনে এখানে connectDB() ও User.findOneAndUpdate(...) দিয়ে MongoDB-তে ইউজার সেভ/আপডেট করতে পারেন

    const sessionPayload = {
      email,
      name: profile.name || email.split("@")[0],
      avatar: profile.picture || "",
      provider: "google",
      googleId: profile.sub,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const sessionToken = createSignedSessionToken(sessionPayload, authSecret);
    const successUrl = new URL(`${siteUrl}${safeNext}`);
    successUrl.searchParams.set("auth_success", "google");

    const res = NextResponse.redirect(successUrl.toString());

    res.cookies.set("auth_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: siteUrl.startsWith("https://"),
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    res.cookies.delete("google_oauth_state");
    res.cookies.delete("oauth_next_path");

    return res;
  } catch {
    return redirectWithError("oauth_callback_error");
  }
}