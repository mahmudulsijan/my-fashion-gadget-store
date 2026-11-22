import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateFields: Record<string, unknown> = {};

    if (body.name !== undefined) updateFields.name = String(body.name).trim();
    if (body.category !== undefined)
      updateFields.category = String(body.category).trim();
    if (body.subCategory !== undefined)
      updateFields.subCategory = String(body.subCategory).trim();
    if (body.price !== undefined) updateFields.price = Number(body.price);
    if (body.oldPrice !== undefined) {
      updateFields.oldPrice =
        body.oldPrice === "" || body.oldPrice === null
          ? undefined
          : Number(body.oldPrice);
    }
    if (body.badge !== undefined)
      updateFields.badge = String(body.badge).trim();
    if (body.specs !== undefined)
      updateFields.specs = String(body.specs).trim();
    if (body.description !== undefined)
      updateFields.description = String(body.description).trim();
    if (body.stock !== undefined)
      updateFields.stock = Math.max(0, Number(body.stock) || 0);

    if (body.images !== undefined) {
      const cleanedImages = parseStringList(body.images);
      updateFields.images = cleanedImages;
      if (cleanedImages.length > 0) {
        updateFields.image = cleanedImages[0];
      } else if (body.image !== undefined) {
        updateFields.image = String(body.image).trim();
      }
    } else if (body.image !== undefined) {
      updateFields.image = String(body.image).trim();
    }

    if (body.colors !== undefined) {
      updateFields.colors = parseStringList(body.colors);
    }

    if (body.sizes !== undefined) {
      updateFields.sizes = parseStringList(body.sizes);
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট ID" },
        { status: 400 }
      );
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "ডিলিট সফল হয়েছে" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}