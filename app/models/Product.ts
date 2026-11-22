import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  sizes?: string[];
  colors?: string[];
  specs?: string;
  description?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    badge: { type: String, trim: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    specs: { type: String, trim: true },
    description: { type: String, default: "" },
    stock: { type: Number, default: 10 },
  },
  { timestamps: true }
);

// Dev/HMR পরিবেশে পুরনো ক্যাশড মডেল এড়াতে
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);

export default Product;