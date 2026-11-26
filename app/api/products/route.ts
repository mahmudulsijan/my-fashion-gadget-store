import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { isAdminRequest } from "@/app/lib/adminAuth";

function normalizeSizes(rawSizes: unknown): string[] {
  if (Array.isArray(rawSizes)) {
    return rawSizes.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof rawSizes === "string") {
    return rawSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeColors(rawColors: unknown): string[] {
  if (Array.isArray(rawColors)) {
    return rawColors.map((c) => String(c).trim()).filter(Boolean);
  }
  if (typeof rawColors === "string") {
    return rawColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeImages(rawImages: unknown, fallbackImage?: unknown): string[] {
  const list: string[] = [];
  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      const cleaned = String(item || "").trim();
      if (cleaned && !list.includes(cleaned)) {
        list.push(cleaned);
      }
    }
  }
  const fallback = String(fallbackImage || "").trim();
  if (fallback && !list.includes(fallback)) {
    list.unshift(fallback);
  }
  return list;
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const subCategory = body.subCategory
      ? String(body.subCategory).trim()
      : undefined;
    const price = Number(body.price);
    const oldPrice =
      body.oldPrice !== undefined && body.oldPrice !== "" && body.oldPrice !== null
        ? Number(body.oldPrice)
        : undefined;

    const finalImages = normalizeImages(body.images, body.image);
    const primaryImage = finalImages[0] || String(body.image || "").trim();
    const colors = normalizeColors(body.colors);
    const sizes = normalizeSizes(body.sizes);

    if (!name || !category || Number.isNaN(price) || !primaryImage) {
      return NextResponse.json(
        { success: false, message: "নাম, ক্যাটাগরি, দাম এবং ছবি আবশ্যক" },
        { status: 400 }
      );
    }

    const created = await Product.create({
      name,
      category,
      subCategory,
      price,
      oldPrice,
      image: primaryImage,
      images: finalImages,
      badge: body.badge ? String(body.badge).trim() : undefined,
      sizes,
      colors,
      specs: body.specs ? String(body.specs).trim() : undefined,
      description: body.description ? String(body.description).trim() : "",
      stock: Number.isNaN(Number(body.stock)) ? 10 : Number(body.stock),
    });

    return NextResponse.json(
      { success: true, product: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}