import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { hasAdminAccess } from "@/app/lib/adminAuth";

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

function sanitizeColorImages(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const cleanKey = String(key || "").trim().toLowerCase();
    const cleanVal = String(val || "").trim();
    if (cleanKey && cleanVal) {
      result[cleanKey] = cleanVal;
    }
  }
  return result;
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
    if (!hasAdminAccess(req, ["admin", "staff"])) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin or Staff access required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ প্রোডাক্ট ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateFields: Record<string, unknown> = {};
    const unsetFields: Record<string, "" | 1> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json(
          { success: false, message: "প্রোডাক্টের নাম খালি রাখা যাবে না" },
          { status: 400 }
        );
      }
      updateFields.name = name;
    }

    if (body.category !== undefined) {
      updateFields.category = String(body.category).trim();
    }

    if (body.subCategory !== undefined) {
      updateFields.subCategory = String(body.subCategory).trim();
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, message: "সঠিক প্রোডাক্ট প্রাইস দিন" },
          { status: 400 }
        );
      }
      updateFields.price = price;
    }

    if (body.oldPrice !== undefined) {
      if (body.oldPrice === "" || body.oldPrice === null) {
        unsetFields.oldPrice = "";
      } else {
        const oldPrice = Number(body.oldPrice);
        if (!Number.isFinite(oldPrice) || oldPrice < 0) {
          return NextResponse.json(
            { success: false, message: "সঠিক পুরনো প্রাইস দিন" },
            { status: 400 }
          );
        }
        updateFields.oldPrice = oldPrice;
      }
    }

    if (body.badge !== undefined) {
      updateFields.badge = String(body.badge).trim();
    }

    if (body.specs !== undefined) {
      updateFields.specs = String(body.specs).trim();
    }

    if (body.description !== undefined) {
      updateFields.description = String(body.description).trim();
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isFinite(stock)) {
        return NextResponse.json(
          { success: false, message: "সঠিক স্টক সংখ্যা দিন" },
          { status: 400 }
        );
      }
      updateFields.stock = Math.max(0, Math.floor(stock));
    }

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

    if (body.colorImages !== undefined) {
      updateFields.colorImages = sanitizeColorImages(body.colorImages);
    }

    const mongoUpdate: Record<string, unknown> = {};
    if (Object.keys(updateFields).length > 0) {
      mongoUpdate.$set = updateFields;
    }
    if (Object.keys(unsetFields).length > 0) {
      mongoUpdate.$unset = unsetFields;
    }

    if (Object.keys(mongoUpdate).length === 0) {
      return NextResponse.json(
        { success: false, message: "আপডেট করার মতো কোনো ডেটা পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    const updated = await Product.findByIdAndUpdate(id, mongoUpdate, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    if (
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError
    ) {
      return NextResponse.json(
        { success: false, message: "ইনপুট ডেটা সঠিক নয়" },
        { status: 400 }
      );
    }
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!hasAdminAccess(req, ["admin"])) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Admin can delete products",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await context.params;

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