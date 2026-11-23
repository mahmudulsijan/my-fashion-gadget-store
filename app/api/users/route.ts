import { NextRequest, NextResponse } from "next/server";
import mongoose, { Schema, Model } from "mongoose";
import { connectDB } from "@/app/lib/mongodb";

interface IUser {
  name: string;
  email: string;
  provider: string;
  district?: string;
  address?: string;
  verified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: { type: String, default: "email", trim: true },
    district: { type: String, trim: true },
    address: { type: String, trim: true },
    verified: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

// অ্যাডমিন প্যানেলে সব লগইন/রেজিস্টার ইউজার আনার জন্য
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .sort({ lastLoginAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার লিস্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// ইউজার লগইন বা রেজিস্টার করলে MongoDB-তে upsert/save করার জন্য
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "ইমেইল আবশ্যক" },
        { status: 400 }
      );
    }

    const name =
      String(body?.name || "").trim() || email.split("@")[0] || "Customer";
    const provider = String(body?.provider || "email").trim();
    const district = body?.district ? String(body.district).trim() : undefined;
    const address = body?.address ? String(body.address).trim() : undefined;
    const verified =
      typeof body?.verified === "boolean" ? body.verified : true;

    const updateFields: Record<string, unknown> = {
      name,
      provider,
      verified,
      lastLoginAt: new Date(),
    };
    if (district !== undefined) updateFields.district = district;
    if (address !== undefined) updateFields.address = address;

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: updateFields,
        $setOnInsert: { email },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার তথ্য সেভ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// অ্যাডমিন থেকে ইউজার ডিলিট করার জন্য (/api/users?id=... বা ?email=...)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "id অথবা email প্রয়োজন" },
        { status: 400 }
      );
    }

    const deleted = id
      ? await User.findByIdAndDelete(id)
      : await User.findOneAndDelete({ email: email!.trim().toLowerCase() });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ইউজার ডিলিট করা হয়েছে",
    });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}