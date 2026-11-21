import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { Product } from "@/app/models/Product";

function normalizeSizes(rawSizes: unknown): string[] {
  if (Array.isArray(rawSizes)) {
    return rawSizes
      .flatMap((item) => String(item).split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof rawSizes === "string") {
    return rawSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch product";
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

async function updateProductHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const allowedFields: Record<string, unknown> = {};

    if (typeof body.name === "string") allowedFields.name = body.name.trim();
    if (typeof body.category === "string")
      allowedFields.category = body.category.trim();
    if (typeof body.subCategory === "string")
      allowedFields.subCategory = body.subCategory.trim();
    if (typeof body.price === "number" && !Number.isNaN(body.price))
      allowedFields.price = body.price;
    if (typeof body.oldPrice === "number" && !Number.isNaN(body.oldPrice))
      allowedFields.oldPrice = body.oldPrice;
    if (typeof body.image === "string") allowedFields.image = body.image.trim();
    if (typeof body.badge === "string") allowedFields.badge = body.badge.trim();
    if (body.sizes !== undefined) allowedFields.sizes = normalizeSizes(body.sizes);
    if (typeof body.specs === "string") allowedFields.specs = body.specs.trim();
    if (typeof body.description === "string")
      allowedFields.description = body.description.trim();
    if (typeof body.stock === "number" && !Number.isNaN(body.stock)) {
      allowedFields.stock = Math.max(0, body.stock);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update product";
    console.error("UPDATE /api/products/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateProductHandler(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateProductHandler(req, context);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id).lean();
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete product";
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}