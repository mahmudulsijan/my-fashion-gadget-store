import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import OtpCode from "@/app/models/OtpCode";

const BRAND_NAME = "MAVÉRON";

function signSession(payload: string, secret: string): string {
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "ইমেইল এবং কোড উভয়ই প্রয়োজন" },
        { status: 400 }
      );
    }

    const record = await OtpCode.findOne({ identifier: email });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "কোড পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      await OtpCode.deleteOne({ _id: record._id });
      return NextResponse.json(
        { success: false, message: "কোডের মেয়াদ শেষ হয়ে গেছে, নতুন কোড নিন" },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      await OtpCode.deleteOne({ _id: record._id });
      return NextResponse.json(
        { success: false, message: "অনেকবার ভুল কোড দেওয়া হয়েছে, নতুন কোড নিন" },
        { status: 429 }
      );
    }

    if (record.code !== code) {
      record.attempts += 1;
      await record.save();
      return NextResponse.json(
        { success: false, message: "ভুল ভেরিফিকেশন কোড" },
        { status: 400 }
      );
    }

    await OtpCode.deleteOne({ _id: record._id });

    const now = new Date();
    const defaultName = email.split("@")[0] || `${BRAND_NAME} Member`;

    let savedUser: Record<string, unknown> = {
      name: defaultName,
      email,
      provider: "email",
      verified: true,
    };

    try {
      const db = mongoose.connection.db;
      if (db) {
        const usersCollection = db.collection("users");
        const existing = await usersCollection.findOne({ email });

        await usersCollection.updateOne(
          { email },
          {
            $set: {
              email,
              name:
                typeof existing?.name === "string" && existing.name.trim()
                  ? existing.name.trim()
                  : defaultName,
              provider:
                typeof existing?.provider === "string" && existing.provider.trim()
                  ? existing.provider
                  : "email",
              verified: true,
              lastLoginAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          { upsert: true }
        );

        const updatedDoc = await usersCollection.findOne({ email });
        if (updatedDoc) {
          savedUser = {
            _id: String(updatedDoc._id),
            name: String(updatedDoc.name || defaultName),
            email: String(updatedDoc.email || email),
            provider: String(updatedDoc.provider || "email"),
            verified: Boolean(updatedDoc.verified ?? true),
            lastLoginAt: updatedDoc.lastLoginAt,
          };
        }
      }
    } catch (userSaveErr) {
      console.error("Failed to upsert verified user into users collection:", userSaveErr);
    }

    const secret = process.env.AUTH_SECRET || "dev-secret-change-in-production";
    const sessionData = JSON.stringify({
      email,
      loginAt: Date.now(),
    });
    const token = signSession(sessionData, secret);

    const res = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে",
      user: savedUser,
    });

    res.cookies.set("auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth/verify-code error:", error);
    return NextResponse.json(
      { success: false, message: "কোড যাচাই করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}