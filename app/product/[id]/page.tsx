"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: "fashion" | "gadget";
  subCategory: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge: string;
  sizes?: string[];
  specs?: string;
  description?: string;
  stock?: number;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Oversized Cotton Hoodie",
    category: "fashion",
    subCategory: "Hoodies & Jackets",
    price: 1450,
    oldPrice: 1850,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    badge: "Best Seller",
    sizes: ["M", "L", "XL"],
    description:
      "Heavyweight breathable cotton blend hoodie tailored for everyday comfort and structured drape.",
    stock: 15,
  },
  {
    id: "2",
    name: "ANC Wireless Noise-Cancelling Earbuds",
    category: "gadget",
    subCategory: "Wireless Earbuds",
    price: 2290,
    oldPrice: 2800,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    badge: "1 Year Warranty",
    specs: "36H Battery • Bluetooth 5.3 • IPX5",
    description:
      "Active noise cancellation with low-latency mode, crystal-clear call mics, and fast USB-C charging.",
    stock: 12,
  },
  {
    id: "3",
    name: "Minimalist Urban Bomber Jacket",
    category: "fashion",
    subCategory: "Hoodies & Jackets",
    price: 2490,
    oldPrice: 3100,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    badge: "New Arrival",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Clean silhouette bomber jacket with smooth zip hardware and durable outer weave.",
    stock: 10,
  },
  {
    id: "4",
    name: "AMOLED Fitness & Call Smart Watch",
    category: "gadget",
    subCategory: "Smartwatches",
    price: 3450,
    oldPrice: 4200,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    badge: "6 Months Warranty",
    specs: '1.96" AMOLED • BT Calling • 7-Day Battery',
    description:
      "High-brightness AMOLED display with wrist calling, health tracking, and multi-sport modes.",
    stock: 8,
  },
  {
    id: "5",
    name: "Classic Slim-Fit Oxford Shirt",
    category: "fashion",
    subCategory: "Casual Shirts",
    price: 1190,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    badge: "100% Cotton",
    sizes: ["M", "L", "XL"],
    description:
      "Crisp cotton Oxford shirt designed for smart-casual wear across all seasons.",
    stock: 20,
  },
  {
    id: "6",
    name: "20,000mAh 65W Fast Charging Power Bank",
    category: "gadget",
    subCategory: "Chargers & Accessories",
    price: 2850,
    oldPrice: 3300,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
    badge: "Laptop Support",
    specs: "65W PD Type-C • Digital Display",
    description:
      "High-capacity power bank capable of fast-charging smartphones, tablets, and USB-C laptops.",
    stock: 14,
  },
];

function normalizeCategory(rawCategory?: string): "fashion" | "gadget" {
  const val = (rawCategory || "").toLowerCase();
  if (val.includes("gadget") || val.includes("tech")) return "gadget";
  return "fashion";
}

function inferSubCategory(item: any, cat: "fashion" | "gadget"): string {
  if (item?.subCategory) return String(item.subCategory);
  const text = `${item?.name || ""} ${item?.description || ""}`.toLowerCase();
  if (cat === "fashion") {
    if (text.includes("hoodie") || text.includes("jacket"))
      return "Hoodies & Jackets";
    if (text.includes("shirt")) return "Casual Shirts";
    return "Men's Fashion";
  }
  if (text.includes("watch")) return "Smartwatches";
  if (text.includes("earbud") || text.includes("anc")) return "Wireless Earbuds";
  return "Chargers & Accessories";
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = String(params?.id || "");

  const [allProducts, setAllProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [quantity, setQuantity] = useState<number>(1);
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function loadProductData() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;

        let list = FALLBACK_PRODUCTS;
        if (
          data.success &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          list = data.products.map((item: any, idx: number) => {
            const cat = normalizeCategory(item.category);
            return {
              id: String(item._id || item.id || idx),
              name: item.name || "Unnamed Product",
              category: cat,
              subCategory: inferSubCategory(item, cat),
              price: Number(item.price) || 0,
              oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
              image:
                item.image ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
              badge:
                item.badge ||
                (cat === "fashion" ? "New Collection" : "Smart Tech"),
              sizes:
                cat === "fashion" ? item.sizes || ["M", "L", "XL"] : undefined,
              specs:
                cat === "gadget"
                  ? item.specs || item.description || "Original Gadget"
                  : undefined,
              description: item.description || "",
              stock: item.stock !== undefined ? Number(item.stock) : 10,
            };
          });
          setAllProducts(list);
        }

        const found =
          list.find((p) => p.id === productId) ||
          FALLBACK_PRODUCTS.find((p) => p.id === productId) ||
          list[0] ||
          null;

        if (found) {
          setProduct(found);
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes.includes("L") ? "L" : found.sizes[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        const fallbackFound =
          FALLBACK_PRODUCTS.find((p) => p.id === productId) ||
          FALLBACK_PRODUCTS[0];
        setProduct(fallbackFound);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProductData();
    return () => {
      active = false;
    };
  }, [productId]);

  const handleCheckoutAction = (buyNow: boolean) => {
    if (!product) return;
    try {
      const pendingItem = {
        product,
        quantity,
        selectedOption: product.category === "fashion" ? selectedSize : undefined,
        buyNow,
      };
      sessionStorage.setItem("fg_pending_checkout", JSON.stringify(pendingItem));
    } catch {
      // Ignore storage errors
    }
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-neutral-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 rounded-xl w-2/3 animate-pulse" />
            <div className="h-6 bg-neutral-200 rounded-xl w-1/3 animate-pulse" />
            <div className="h-24 bg-neutral-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-neutral-950">
            Product Not Found
          </h1>
          <p className="text-sm text-neutral-500">
            This product may have been removed or is unavailable.
          </p>
          <Link
            href="/"
            className="inline-block bg-neutral-950 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const discountPct =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900">
      <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4 text-center">
        Cash on Delivery Across Bangladesh • Dhaka ৳70 &amp; Outside Dhaka ৳130
      </div>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to FG Trend Tech</span>
          </Link>
          <span className="font-black text-base sm:text-lg tracking-tight text-neutral-950">
            FG TREND TECH
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-neutral-200 p-5 sm:p-8 shadow-2xs">
          {/* Product Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-square rounded-2xl bg-[#eceef0] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="bg-neutral-950 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.badge}
                </span>
                {discountPct && (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {product.subCategory}
                </span>
                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                  {(product.stock ?? 10) > 0
                    ? `In Stock (${product.stock ?? 10})`
                    : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-neutral-950">
                  ৳{product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳{product.oldPrice}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description ||
                  product.specs ||
                  "Quality-checked product from FG Trend Tech with reliable nationwide delivery."}
              </p>

              {product.category === "fashion" && product.sizes ? (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-neutral-600 block mb-2">
                    Select Size:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          selectedSize === sz
                            ? "bg-neutral-950 text-white border-neutral-950"
                            : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                product.specs && (
                  <div className="bg-neutral-100 rounded-2xl p-4 text-xs sm:text-sm text-neutral-700 font-medium">
                    <span className="font-bold text-neutral-950 block mb-1">
                      Specifications &amp; Warranty:
                    </span>
                    {product.specs} • {product.badge}
                  </div>
                )
              )}

              {/* Quantity Selector */}
              <div className="pt-1">
                <span className="text-xs font-semibold text-neutral-600 block mb-2">
                  Quantity:
                </span>
                <div className="inline-flex items-center gap-3 bg-neutral-100 border border-neutral-200 rounded-xl px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-neutral-200 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-neutral-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCheckoutAction(false)}
                  className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart — ৳{product.price * quantity}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWishlisted((w) => !w)}
                  aria-label="Save to wishlist"
                  className="w-12 rounded-xl border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlisted
                        ? "fill-rose-500 text-rose-500"
                        : "text-neutral-700"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCheckoutAction(true)}
                className="w-full border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white text-sm font-semibold py-3 rounded-xl transition cursor-pointer"
              >
                Buy Now (Cash on Delivery)
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-neutral-600">
                <div className="flex items-center gap-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70">
                  <Truck className="w-4 h-4 shrink-0 text-neutral-900" />
                  <span>৳70 Dhaka / ৳130 Outside</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-900" />
                  <span>Open Parcel Check</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70">
                  <Sparkles className="w-4 h-4 shrink-0 text-neutral-900" />
                  <span>Easy Exchange / Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-neutral-950">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="bg-white rounded-2xl border border-neutral-200 p-3 hover:shadow-md transition group"
                >
                  <div className="aspect-square rounded-xl bg-neutral-100 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="pt-3 px-1">
                    <h3 className="font-semibold text-sm text-neutral-950 truncate">
                      {rel.name}
                    </h3>
                    <p className="text-sm font-bold text-neutral-900 mt-1">
                      ৳{rel.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}