import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    paymentType: {
      type: String,
      enum: ["partial_cod", "full_cod", "full_online"],
      default: "partial_cod",
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        color: String,
        image: String,
      },
    ],
    subtotalAmount: { type: Number, default: 0 }, // Due on delivery (COD)
    deliveryCharge: { type: Number, default: 0 }, // Paid in advance
    advancePaidAmount: { type: Number, default: 0 }, // Delivery charge paid now
    codDueAmount: { type: Number, default: 0 }, // Remaining product amount at delivery
    advancePaymentStatus: {
      type: String,
      enum: ["pending_verification", "paid", "verified"],
      default: "pending_verification",
    },
    advanceSenderNumber: { type: String, trim: true },
    advanceTrxId: { type: String, trim: true },
    totalAmount: { type: Number, required: true }, // subtotalAmount + deliveryCharge
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);