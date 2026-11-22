import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/app/lib/mongodb";
import OtpCode from "@/app/models/OtpCode";
import { sendLoginOtpEmail } from "@/app/lib/mailer";

function generateSixDigitCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "সঠিক ইমেইল ঠিকানা দিন" },
        { status: 400 }
      );
    }

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpCode.deleteMany({ identifier: email });
    await OtpCode.create({
      identifier: email,
      code,
      expiresAt,
      attempts: 0,
    });

    await sendLoginOtpEmail(email, code);

    return NextResponse.json({
      success: true,
      message: "আপনার ইমেইলে ৬ ডিজিটের লগইন কোড পাঠানো হয়েছে",
    });
  } catch (error) {
    console.error("POST /api/auth/send-code error:", error);
    return NextResponse.json(
      { success: false, message: "কোড পাঠাতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}