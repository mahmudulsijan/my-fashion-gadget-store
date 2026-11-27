import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { Order } from "@/app/models/Order";
import Product from "@/app/models/Product";
import { hasAdminAccess } from "@/app/lib/adminAuth";

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

// Rate limiting & duplicate spam guard config
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 4;
const DUPLICATE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes for same phone

const rateLimitStore = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown-ip";
}

function isRateLimited(key: string, now: number): boolean {
  const timestamps = rateLimitStore.get(key) || [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitStore.set(key, recent);
    return true;
  }
  recent.push(now);
  rateLimitStore.set(key, recent);
  return false;
}

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

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function calculateDeliveryCharge(
  subtotal: number,
  district?: string,
  address?: string
): number {
  if (subtotal <= 0) return 0;

  const combined = `${district || ""} ${address || ""}`.toLowerCase();
  const isInsideMymensingh =
    combined.includes("mymensingh") || combined.includes("ময়মনসিংহ");

  return isInsideMymensingh ? 70 : 130;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const hasOrderIdParam = searchParams.has("orderId");
    const hasPhoneParam = searchParams.has("phone");
    const hasEmailParam = searchParams.has("email");

    const rawOrderId = String(searchParams.get("orderId") || "").trim();
    const rawPhone = String(searchParams.get("phone") || "").trim();
    const rawEmail = String(searchParams.get("email") || "")
      .trim()
      .toLowerCase();

    if (hasOrderIdParam || hasPhoneParam) {
      const cleanOrderId = rawOrderId.replace(/^#/, "").trim();
      const cleanPhone = normalizePhone(rawPhone);

      if (hasOrderIdParam || rawOrderId) {
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

        const candidates = await Order.find(filter)
          .sort({ createdAt: -1 })
          .lean();

        const matchedOrders = candidates.filter(
          (ord: Record<string, unknown>) => {
            const ordPhone = normalizePhone(String(ord?.phone || ""));
            return ordPhone.length > 0 && ordPhone === cleanPhone;
          }
        );

        return NextResponse.json({
          success: true,
          orders: matchedOrders,
        });
      }

      // Customer account orders lookup by phone and/or email
      const orConditions: Record<string, unknown>[] = [];
      if (cleanPhone) {
        orConditions.push({ phone: cleanPhone });
      }
      if (rawEmail) {
        orConditions.push({
          email: new RegExp(`^${escapeRegex(rawEmail)}$`, "i"),
        });
      }

      if (orConditions.length === 0) {
        return NextResponse.json({ success: true, orders: [] });
      }

      const accountOrders = await Order.find({ $or: orConditions })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        orders: accountOrders,
      });
    }

    if (hasEmailParam && rawEmail) {
      const ordersByEmail = await Order.find({
        email: new RegExp(`^${escapeRegex(rawEmail)}$`, "i"),
      })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        orders: ordersByEmail,
      });
    }

    if (!hasAdminAccess(req, ["admin", "staff"])) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Admin or Staff access required",
        },
        { status: 401 }
      );
    }

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
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const clientIp = getClientIp(req);

    if (isRateLimited(`ip:${clientIp}`, now)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many order requests from this connection. Please wait a minute and try again.",
        },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await req.json();

    const customerName = String(body?.customerName || "").trim();
    const customerEmail = body?.email
      ? String(body.email).trim().toLowerCase()
      : "";
    const normalizedPhone = normalizePhone(String(body?.phone || "").trim());
    const address = String(body?.address || "").trim();
    const district = body?.district ? String(body.district).trim() : "";

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

    if (isRateLimited(`phone:${normalizedPhone}`, now)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many orders attempted with this phone number. Please try again after a minute.",
        },
        { status: 429 }
      );
    }

    const cooldownCutoff = new Date(now - DUPLICATE_COOLDOWN_MS);
    const recentOrder = await Order.findOne({
      phone: normalizedPhone,
      status: { $ne: "Cancelled" },
      createdAt: { $gte: cooldownCutoff },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (recentOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An order was recently placed with this phone number. Please wait a few minutes before placing another order.",
        },
        { status: 429 }
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
        {
          success: false,
          message: "At least one item is required to place an order.",
        },
        { status: 400 }
      );
    }

    const sanitizedItems = [];
    let verifiedSubtotal = 0;

    for (const item of rawItems) {
      const pid = item?.productId ? String(item.productId).trim() : "";
      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or missing product reference in cart items.",
          },
          { status: 400 }
        );
      }

      const dbProduct = await Product.findById(pid).lean();
      if (!dbProduct) {
        return NextResponse.json(
          {
            success: false,
            message: `Product not found in catalog (${pid}).`,
          },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.floor(Number(item?.quantity) || 1));
      const availableStock =
        typeof dbProduct.stock === "number" ? dbProduct.stock : 10;

      if (availableStock <= 0 || qty > availableStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${dbProduct.name}". Available: ${Math.max(
              0,
              availableStock
            )}.`,
          },
          { status: 400 }
        );
      }

      const trustedPrice = Math.max(0, Number(dbProduct.price) || 0);
      verifiedSubtotal += trustedPrice * qty;

      const productImages = Array.isArray(dbProduct.images)
        ? dbProduct.images
        : [];
      const fallbackImage = String(
        dbProduct.image || productImages[0] || item?.image || ""
      ).trim();

      sanitizedItems.push({
        productId: String(dbProduct._id),
        name: String(dbProduct.name || `${BRAND_NAME} Product`).trim(),
        price: trustedPrice,
        quantity: qty,
        size: String(item?.size || "").trim(),
        color: String(item?.color || "").trim(),
        image: fallbackImage,
      });
    }

    const deliveryCharge = calculateDeliveryCharge(
      verifiedSubtotal,
      district,
      address
    );
    const verifiedTotalAmount = verifiedSubtotal + deliveryCharge;

    const rawPaymentType = String(body?.paymentType || "partial_cod").trim();
    const paymentType =
      rawPaymentType === "full_online" || rawPaymentType === "full_cod"
        ? rawPaymentType
        : "partial_cod";

    const advancePaidAmount =
      paymentType === "full_online"
        ? verifiedTotalAmount
        : paymentType === "full_cod"
        ? 0
        : deliveryCharge;

    const codDueAmount = Math.max(0, verifiedTotalAmount - advancePaidAmount);

    const senderNumber = body?.advanceSenderNumber
      ? normalizePhone(String(body.advanceSenderNumber).trim())
      : "";
    const trxId = body?.advanceTrxId ? String(body.advanceTrxId).trim() : "";

    if (advancePaidAmount > 0 && (!senderNumber || !trxId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sender number and Transaction ID (TrxID) are required for advance delivery charge payment.",
        },
        { status: 400 }
      );
    }

    const checkoutAt = body?.checkoutAt ? String(body.checkoutAt) : nowIso;

    const orderPayload: Record<string, unknown> = {
      customerName,
      phone: normalizedPhone,
      address,
      items: sanitizedItems,
      subtotalAmount: verifiedSubtotal,
      deliveryCharge,
      advancePaidAmount,
      codDueAmount,
      paymentType,
      advancePaymentStatus:
        advancePaidAmount > 0 ? "pending_verification" : "verified",
      totalAmount: verifiedTotalAmount,
      status: "Pending",
      checkoutAt,
      orderTime: nowIso,
    };

    if (customerEmail) {
      orderPayload.email = customerEmail;
    }
    if (district) {
      orderPayload.district = district;
    }
    if (body?.paymentMethod) {
      orderPayload.paymentMethod = String(body.paymentMethod).trim();
    }
    if (senderNumber) {
      orderPayload.advanceSenderNumber = senderNumber;
    }
    if (trxId) {
      orderPayload.advanceTrxId = trxId;
    }

    const order = await Order.create(orderPayload);
    return NextResponse.json(
      {
        success: true,
        order,
        timestamps: {
          checkoutAt,
          orderTime: nowIso,
        },
        pricing: {
          subtotal: verifiedSubtotal,
          deliveryCharge,
          advancePaidAmount,
          codDueAmount,
          totalAmount: verifiedTotalAmount,
        },
      },
      { status: 201 }
    );
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