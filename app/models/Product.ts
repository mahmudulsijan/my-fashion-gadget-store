import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: "" },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true },
    badge: { type: String, default: "" },
    sizes: { type: [String], default: [] },
    specs: { type: String, default: "" },
    description: { type: String, default: "" },
    stock: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const Product = models.Product || model("Product", ProductSchema);