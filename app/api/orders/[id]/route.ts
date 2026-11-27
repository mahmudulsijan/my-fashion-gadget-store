import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { Order } from "@/app/models/Order";
import { getAdminSession, hasAdminAccess } from "@/app/lib/adminAuth";

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const session = getAdminSession(req);
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin or Staff access required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    const nowIso = new Date().toISOString();

    if (typeof body.status === "string" && body.status.trim()) {
      const nextStatus = body.status.trim();
      if (!ALLOWED_STATUSES.includes(nextStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid order status" },
          { status: 400 }
        );
      }
      updates.status = nextStatus;
      updates.statusUpdatedAt = nowIso;
    }

    if (typeof body.address === "string" && body.address.trim()) {
      updates.address = body.address.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    updates.lastUpdatedByRole = session.role;
    updates.lastUpdatedById = session.adminId;
    updates.lastUpdatedAt = nowIso;

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
      updatedBy: {
        role: session.role,
        adminId: session.adminId,
        at: nowIso,
      },
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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasAdminAccess(req, ["admin"])) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Admin can delete orders",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await context.params;

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