import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: String },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true },
    photo: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: "reviews" }
);

const ReviewModel =
  mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const productId = req.nextUrl.searchParams.get("productId");

    const query = productId
      ? {
          $or: [
            { productId },
            { productId: { $exists: false } },
            { productId: null },
          ],
        }
      : {};

    const docs = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();

    const reviews = docs.map((doc: any) => ({
      id: String(doc._id),
      productId: doc.productId ? String(doc.productId) : undefined,
      name: String(doc.name || ""),
      rating: Number(doc.rating) || 5,
      comment: String(doc.comment || ""),
      photo: doc.photo ? String(doc.photo) : undefined,
      createdAt: doc.createdAt || null,
    }));

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const comment = String(body?.comment || "").trim();
    const rating = Math.min(5, Math.max(1, Number(body?.rating) || 5));

    if (!name || !comment) {
      return NextResponse.json(
        { success: false, message: "Name and comment are required" },
        { status: 400 }
      );
    }

    const created = await ReviewModel.create({
      productId: body?.productId ? String(body.productId) : undefined,
      name,
      rating,
      comment,
      photo: body?.photo ? String(body.photo) : undefined,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      review: {
        id: String(created._id),
        productId: created.productId,
        name: created.name,
        rating: created.rating,
        comment: created.comment,
        photo: created.photo,
        createdAt: created.createdAt,
      },
    });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review id is required" },
        { status: 400 }
      );
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await ReviewModel.findByIdAndDelete(id);
    } else {
      await ReviewModel.deleteOne({ id });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/reviews error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}