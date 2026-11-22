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

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await connectDB();
    const subscribers = await Subscriber.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formatted = subscribers.map((item) => ({
      _id: String(item._id),
      email: String(item.email || ""),
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString()
        : undefined,
    }));

    return NextResponse.json(
      { success: true, subscribers: formatted },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/subscribers error:", err);
    return NextResponse.json(
      { success: false, subscribers: [], message: "Failed to load subscribers" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const existing = await Subscriber.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          alreadySubscribed: true,
          message: "You are already subscribed!",
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const created = await Subscriber.create({ email });
    return NextResponse.json(
      {
        success: true,
        subscriber: {
          _id: String(created._id),
          email: created.email,
          createdAt: created.createdAt
            ? new Date(created.createdAt).toISOString()
            : undefined,
        },
        message: "Subscribed successfully!",
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("POST /api/subscribers error:", err);
    return NextResponse.json(
      { success: false, message: "Could not save subscription." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = String(searchParams.get("id") || "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Subscriber ID is required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subscriber ID format" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const deleted = await Subscriber.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, deletedId: id, message: "Subscriber removed" },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("DELETE /api/subscribers error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to remove subscriber" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}