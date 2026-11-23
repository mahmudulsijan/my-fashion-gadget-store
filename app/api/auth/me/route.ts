import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignedSessionToken(
  token: string | undefined,
  secret: string
): Record<string, unknown> | null {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Record<string, unknown>;

    if (typeof parsed.exp === "number" && Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const authSecret = process.env.AUTH_SECRET?.trim();
  if (!authSecret) {
    return NextResponse.json(
      { success: false, user: null, message: "Missing AUTH_SECRET" },
      { status: 500 }
    );
  }

  const token = req.cookies.get("auth_session")?.value;
  const payload = verifySignedSessionToken(token, authSecret);

  if (!payload || typeof payload.email !== "string") {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      email: payload.email,
      name:
        typeof payload.name === "string" && payload.name.trim()
          ? payload.name.trim()
          : payload.email.split("@")[0],
      avatar: typeof payload.avatar === "string" ? payload.avatar : "",
      provider: typeof payload.provider === "string" ? payload.provider : "google",
    },
  });
}