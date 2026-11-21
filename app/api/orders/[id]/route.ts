import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getOrderModel = (): any => {
  if (mongoose.models.Order) {
    return mongoose.models.Order;
  }
  const OrderSchema = new mongoose.Schema(
    {
      customerName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      items: [
        {
          productId: String,
          name: String,
          price: Number,
          quantity: Number,
          size: String,
          image: String,
        },
      ],
      totalAmount: { type: Number, required: true },
      status: { type: String, default: "Pending" },
    },
    { timestamps: true }
  );
  return mongoose.model("Order", OrderSchema);
};

async function ensureDbConnected() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  await mongoose.connect(uri);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const Order = getOrderModel();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch order";
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const Order = getOrderModel();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.status === "string" && body.status.trim()) {
      updates.status = body.status.trim();
    }
    if (typeof body.address === "string" && body.address.trim()) {
      updates.address = body.address.trim();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update order";
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const Order = getOrderModel();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(id).lean();
    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete order";
    console.error("DELETE /api/orders/[id] error:", err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}