import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

function normalizePhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    return "0" + digits.slice(3, 13);
  }
  return digits;
}

function maskPhone(raw: string): string {
  const clean = normalizePhone(raw);
  if (clean.length < 7) return "***";
  return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
}

function maskAddress(raw: string): string {
  const text = String(raw || "").trim();
  if (!text) return "";
  if (text.length <= 12) return `${text.slice(0, 3)}***${text.slice(-2)}`;
  return `${text.slice(0, 8)} •••••• ${text.slice(-6)}`;
}

function maskCustomerName(raw: string): string {
  const parts = String(raw || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) {
    const p = parts[0];
    return p.length <= 2 ? `${p[0]}*` : `${p.slice(0, 2)}***`;
  }
  return `${parts[0]} ${parts[parts.length - 1][0]}***`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrderId = (searchParams.get("orderId") || "")
      .trim()
      .replace(/^#/, "");
    const cleanPhone = normalizePhone(searchParams.get("phone") || "");

    if (!rawOrderId || !cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and Phone Number are both required.",
        },
        { status: 400 }
      );
    }

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const queryConditions: Record<string, unknown>[] = [{ orderId: rawOrderId }];
    if (mongoose.Types.ObjectId.isValid(rawOrderId)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(rawOrderId) });
    }

    const candidates = await Order.find({
      $or: queryConditions,
    })
      .select(
        "_id orderId customerName phone address items totalAmount status createdAt"
      )
      .lean();

    const matchedOrders = (candidates || [])
      .filter((doc) => {
        const docPhone = normalizePhone(String(doc.phone || ""));
        const docOrderId = String(doc.orderId || "").trim().toLowerCase();
        const docObjectId = String(doc._id || "").trim().toLowerCase();
        const targetId = rawOrderId.toLowerCase();

        const idMatched = docOrderId === targetId || docObjectId === targetId;
        const phoneMatched = docPhone === cleanPhone;
        return idMatched && phoneMatched;
      })
      .map((doc) => ({
        _id: String(doc._id),
        orderId: doc.orderId ? String(doc.orderId) : undefined,
        customerName: maskCustomerName(String(doc.customerName || "")),
        maskedPhone: maskPhone(String(doc.phone || "")),
        maskedAddress: maskAddress(String(doc.address || "")),
        items: Array.isArray(doc.items)
          ? doc.items.map((item: Record<string, unknown>) => ({
              name: String(item.name || ""),
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              size: item.size ? String(item.size) : undefined,
              color: item.color ? String(item.color) : undefined,
            }))
          : [],
        totalAmount: Number(doc.totalAmount) || 0,
        status: String(doc.status || "Pending"),
        createdAt: doc.createdAt
          ? new Date(doc.createdAt as string | Date).toISOString()
          : undefined,
      }));

    return NextResponse.json({
      success: true,
      orders: matchedOrders,
    });
  } catch (error) {
    console.error("GET /api/orders/track error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track order." },
      { status: 500 }
    );
  }
}