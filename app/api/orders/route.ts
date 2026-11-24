import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { Order } from "@/app/models/Order";

const BRAND_NAME = "MAVÉRON";

type IncomingOrderItem = {
  productId?: string;
  name?: string;
  price?: number | string;
  quantity?: number | string;
  size?: string;
  color?: string;
  image?: string;
};

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    return "0" + digits.slice(3, 13);
  }
  return digits;
}

function isValidBdPhone11(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const rawOrderId = String(searchParams.get("orderId") || "").trim();
    const rawPhone = String(searchParams.get("phone") || "").trim();

    const cleanOrderId = rawOrderId.replace(/^#/, "").trim();
    const cleanPhone = normalizePhone(rawPhone);

    // Require BOTH Order ID and Phone Number for public order tracking
    if (!cleanOrderId || !cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Both Order ID and Phone Number are required to track an order.",
        },
        { status: 400 }
      );
    }

    if (!isValidBdPhone11(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 11-digit phone number.",
        },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = mongoose.Types.ObjectId.isValid(
      cleanOrderId
    )
      ? { _id: cleanOrderId }
      : { orderId: new RegExp(`^${escapeRegex(cleanOrderId)}$`, "i") };

    const candidates = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const matchedOrders = candidates.filter((ord: Record<string, unknown>) => {
      const ordPhone = normalizePhone(String(ord?.phone || ""));
      return ordPhone.length > 0 && ordPhone === cleanPhone;
    });

    return NextResponse.json({
      success: true,
      orders: matchedOrders,
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Failed to fetch orders: ${detail}` },
      { status: 500 }
    );
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const customerName = String(body?.customerName || "").trim();
    const normalizedPhone = normalizePhone(String(body?.phone || "").trim());
    const address = String(body?.address || "").trim();
    const totalAmount = Number(body?.totalAmount ?? 0);

    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid customer name is required." },
        { status: 400 }
      );
    }

    if (!isValidBdPhone11(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 11-digit Bangladesh phone number (e.g. 017XXXXXXXX) is required.",
        },
        { status: 400 }
      );
    }

    if (!address || address.length < 6) {
      return NextResponse.json(
        { success: false, message: "Valid delivery address is required." },
        { status: 400 }
      );
    }

    const rawItems: IncomingOrderItem[] = Array.isArray(body?.items)
      ? body.items
      : [];

    if (rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one item is required to place an order." },
        { status: 400 }
      );
    }

    const sanitizedItems = rawItems.map((item) => {
      const pid = item?.productId ? String(item.productId) : "";
      const validObjectId =
        pid && mongoose.Types.ObjectId.isValid(pid) ? pid : undefined;

      return {
        ...(validObjectId ? { productId: validObjectId } : {}),
        name: String(item?.name || `${BRAND_NAME} Product`).trim(),
        price: Math.max(0, Number(item?.price) || 0),
        quantity: Math.max(1, Number(item?.quantity) || 1),
        size: String(item?.size || ""),
        color: String(item?.color || ""),
        image: String(item?.image || ""),
      };
    });

    const requestedStatus = String(body?.status || "").trim();
    const resolvedStatus = ALLOWED_STATUSES.includes(requestedStatus)
      ? requestedStatus
      : "Pending";

    const orderPayload: Record<string, unknown> = {
      customerName,
      phone: normalizedPhone,
      address,
      items: sanitizedItems,
      totalAmount: Math.max(0, totalAmount),
      status: resolvedStatus,
    };

    if (body?.district) {
      orderPayload.district = String(body.district).trim();
    }
    if (body?.paymentMethod) {
      orderPayload.paymentMethod = String(body.paymentMethod).trim();
    }

    const order = await Order.create(orderPayload);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: `Order validation failed: ${error.message}`,
        },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid field format (${error.path}): ${error.message}`,
        },
        { status: 400 }
      );
    }

    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Failed to create order: ${detail}` },
      { status: 500 }
    );
  }
}