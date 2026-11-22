import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { Order } from "@/app/models/Order";

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

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Failed to fetch orders: ${detail}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const customerName = String(body?.customerName || "").trim();
    const phone = String(body?.phone || "").trim();
    const address = String(body?.address || "").trim();
    const totalAmount = Number(body?.totalAmount ?? 0);

    const rawItems: IncomingOrderItem[] = Array.isArray(body?.items)
      ? body.items
      : [];

    const sanitizedItems = rawItems.map((item) => {
      const pid = item?.productId ? String(item.productId) : "";
      const validObjectId =
        pid && mongoose.Types.ObjectId.isValid(pid) ? pid : undefined;

      return {
        ...(validObjectId ? { productId: validObjectId } : {}),
        name: String(item?.name || "ZAVERO Product").trim(),
        price: Number(item?.price) || 0,
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
      phone,
      address,
      items: sanitizedItems,
      totalAmount,
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