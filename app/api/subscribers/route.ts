import { NextResponse } from "next/server";
import mongoose, { Schema, model, models } from "mongoose";

const SubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Subscriber =
  models.Subscriber || model("Subscriber", SubscriberSchema);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await connectDB();
    const subscribers = await Subscriber.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, subscribers });
  } catch (err) {
    console.error("GET /api/subscribers error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already subscribed!",
      });
    }

    const created = await Subscriber.create({ email });
    return NextResponse.json({
      success: true,
      subscriber: created,
      message: "Subscribed successfully!",
    });
  } catch (err) {
    console.error("POST /api/subscribers error:", err);
    return NextResponse.json(
      { success: false, message: "Could not save subscription." },
      { status: 500 }
    );
  }
}