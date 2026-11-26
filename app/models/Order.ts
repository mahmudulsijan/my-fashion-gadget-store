import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
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
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);