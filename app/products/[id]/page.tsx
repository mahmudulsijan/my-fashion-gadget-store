"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Plus,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";

type ApiProduct = {
  id: string;
  name: string;
  category: "fashion" | "gadget";
  subCategory: string;
  price: number;
  oldPrice?: number;
  images: string[];
  badge: string;
  sizes?: string[];
  colors?: string[];
  specs?: string;
  description?: string;
  stock: number;
  rating: number;
  reviewCount: number;
};

type ProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photo?: string;
};

const BRAND_NAME = "ZAVERO";
const BRAND_TAGLINE = "Explore Beyond Trends";
const WHATSAPP_DISPLAY = "01533919648";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";

function parseStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function mapProduct(item: Record<string, unknown>, idx: number): ApiProduct {
  const rawCategory = String(item.category || "").toLowerCase();
  const subCategory = String(
    item.subCategory ||
      (rawCategory.includes("gadget") || rawCategory.includes("mobile")
        ? "Gadgets"
        : "Men's Fashion")
  );
  const category: "fashion" | "gadget" =
    rawCategory.includes("gadget") ||
    rawCategory.includes("mobile") ||
    subCategory.toLowerCase().includes("gadget") ||
    subCategory.toLowerCase().includes("mobile")
      ? "gadget"
      : "fashion";

  // ডাটাবেজ থেকে আসা আসল ছবিগুলোই অগ্রাধিকার পাবে
  const imgs: string[] = [];
  const rawImages = parseStringArray(item.images);
  for (const u of rawImages) {
    if (!imgs.includes(u)) imgs.push(u);
  }
  if (typeof item.image === "string" && item.image.trim()) {
    const mainImg = item.image.trim();
    if (!imgs.includes(mainImg)) {
      imgs.unshift(mainImg);
    }
  }
  if (typeof item.secondaryImage === "string" && item.secondaryImage.trim()) {
    const secImg = item.secondaryImage.trim();
    if (!imgs.includes(secImg)) imgs.push(secImg);
  }
  if (imgs.length === 0) {
    imgs.push("/hero-banner.jpg");
  }

  const explicitSizes = parseStringArray(item.sizes);
  const parsedSizes =
    explicitSizes.length > 0
      ? explicitSizes
      : category === "fashion" && !subCategory.toLowerCase().includes("beauty")
      ? ["M", "L", "XL"]
      : [];

  // কোনো hardcoded fallback color রাখা হয়নি; ডাটাবেজে যা আছে সেটাই দেখাবে
  const parsedColors = parseStringArray(item.colors);

  return {
    id: String(item._id || item.id || idx),
    name: String(item.name || "ZAVERO Product"),
    category,
    subCategory,
    price: Number(item.price) || 0,
    oldPrice:
      item.oldPrice !== undefined && item.oldPrice !== null && Number(item.oldPrice) > 0
        ? Number(item.oldPrice)
        : undefined,
    images: imgs,
    badge: String(item.badge || "ZAVERO Edit"),
    sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
    colors: parsedColors.length > 0 ? parsedColors : undefined,
    specs: String(
      item.specs ||
        "Authentic quality • Checked before dispatch • COD, bKash, Nagad & Rocket supported"
    ),
    description: String(
      item.description ||
        `${String(item.name || "This product")} from ${BRAND_NAME} (${BRAND_TAGLINE}) is crafted for everyday comfort, style, and reliable performance.`
    ),
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    rating: item.rating !== undefined ? Number(item.rating) : 4.8,
    reviewCount: item.reviewCount !== undefined ? Number(item.reviewCount) : 24,
  };
}

function ProductDetailsContent() {
  const params = useParams<{ id: string }>();
  const productId = String(params?.id || "");

  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundItem, setNotFoundItem] = useState(false);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revPhoto, setRevPhoto] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setNotFoundItem(false);
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) return;

        if (data.success && Array.isArray(data.products)) {
          const list = data.products.map(
            (item: Record<string, unknown>, i: number) => mapProduct(item, i)
          );
          setAllProducts(list);
          const found =
            list.find((p: ApiProduct) => p.id === productId) || null;
          if (found) {
            setProduct(found);
            setActiveImgIdx(0);
            setSelectedSize(found.sizes?.[0] || "");
            setSelectedColor(found.colors?.[0] || "");
          } else {
            setProduct(null);
            setNotFoundItem(true);
          }
        } else {
          setNotFoundItem(true);
        }
      } catch {
        if (active) setNotFoundItem(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (productId) load();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    try {
      const saved = localStorage.getItem(`zavero_reviews_${productId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setReviews(parsed);
      }
    } catch {
      // ignore
    }
  }, [productId]);

  const frequentlyBoughtTogether = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.id !== product.id).slice(0, 2);
  }, [allProducts, product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.min(
      100,
      Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)
    );
    setZoomOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  };

  const pushToCartStorage = (
    targetProduct: ApiProduct,
    qty: number,
    optSize?: string,
    optColor?: string
  ) => {
    try {
      const raw = localStorage.getItem("zavero_cart");
      const current = raw ? JSON.parse(raw) : [];
      const cartItemObj = {
        id: targetProduct.id,
        name: targetProduct.name,
        category: targetProduct.category,
        subCategory: targetProduct.subCategory,
        price: targetProduct.price,
        oldPrice: targetProduct.oldPrice,
        image: targetProduct.images[0] || "/hero-banner.jpg",
        badge: targetProduct.badge,
        sizes: targetProduct.sizes,
        colors: targetProduct.colors,
        specs: targetProduct.specs,
        description: targetProduct.description,
        stock: targetProduct.stock,
      };
      const idx = current.findIndex(
        (entry: {
          product?: { id?: string };
          selectedOption?: string;
          selectedColor?: string;
        }) =>
          entry.product?.id === targetProduct.id &&
          entry.selectedOption === optSize &&
          entry.selectedColor === optColor
      );
      if (idx > -1) {
        current[idx].quantity = (current[idx].quantity || 1) + qty;
      } else {
        current.push({
          product: cartItemObj,
          quantity: qty,
          selectedOption: optSize,
          selectedColor: optColor,
        });
      }
      localStorage.setItem("zavero_cart", JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  const handleAddCurrentToCart = () => {
    if (!product || product.stock <= 0) return;
    pushToCartStorage(
      product,
      quantity,
      selectedSize || undefined,
      selectedColor || undefined
    );
    setAddedNotice(true);
    window.setTimeout(() => setAddedNotice(false), 2200);
  };

  const handleAddBundleToCart = () => {
    if (!product) return;
    pushToCartStorage(
      product,
      1,
      selectedSize || undefined,
      selectedColor || undefined
    );
    for (const item of frequentlyBoughtTogether) {
      if (item.stock > 0) {
        pushToCartStorage(item, 1, item.sizes?.[0], item.colors?.[0]);
      }
    }
    setAddedNotice(true);
    window.setTimeout(() => setAddedNotice(false), 2200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setRevPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;
    const next: ProductReview[] = [
      {
        id: `pr-${Date.now()}`,
        name: revName.trim(),
        rating: revRating,
        comment: revComment.trim(),
        photo: revPhoto || undefined,
      },
      ...reviews,
    ];
    setReviews(next);
    try {
      localStorage.setItem(`zavero_reviews_${productId}`, JSON.stringify(next));
    } catch {
      // ignore
    }
    setRevName("");
    setRevComment("");
    setRevRating(5);
    setRevPhoto("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-6 max-w-6xl mx-auto">
        <div className="h-96 rounded-3xl bg-neutral-200 animate-pulse" />
      </div>
    );
  }

  if (notFoundItem || !product) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-neutral-950">
            Product Not Found
          </h1>
          <p className="text-sm text-neutral-600">
            এই প্রোডাক্টটি পাওয়া যায়নি বা সরিয়ে ফেলা হয়েছে।
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-neutral-950 text-amber-300 text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {BRAND_NAME} Store</span>
          </Link>
        </div>
      </div>
    );
  }

  const discountPct =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900 pb-16">
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900 hover:text-amber-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{BRAND_NAME} Store</span>
          </Link>

          <a
            href={WHATSAPP_WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-full"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-10">
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-3">
            <div
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed((z) => !z)}
              className="aspect-square rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 cursor-zoom-in relative"
            >
              <img
                src={product.images[activeImgIdx] || product.images[0]}
                alt={product.name}
                style={{
                  transformOrigin: zoomOrigin,
                  transform: isZoomed ? "scale(1.75)" : "scale(1)",
                }}
                className="w-full h-full object-cover transition-transform duration-200"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl.slice(0, 24)}-${idx}`}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-neutral-950"
                        : "border-neutral-200 opacity-75"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-neutral-950 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                {product.subCategory}
              </span>
              {discountPct && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPct}% OFF
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stock > 0
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {product.stock > 0
                  ? `Stock Quantity: ${product.stock}`
                  : "Out of Stock"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-neutral-950">
                ৳{product.price}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-sm text-neutral-400 line-through">
                  ৳{product.oldPrice}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 ml-auto">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {product.specs && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 text-xs text-neutral-700">
                <span className="font-bold text-neutral-950 block mb-1">
                  Specifications:
                </span>
                {product.specs}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-700 block">
                  Available Sizes:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedSize === sz
                          ? "bg-neutral-950 text-amber-300 border-neutral-950"
                          : "bg-white text-neutral-700 border-neutral-200"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-700 block">
                  Available Colors:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedColor === col
                          ? "bg-amber-100 text-neutral-950 border-amber-500"
                          : "bg-white text-neutral-700 border-neutral-200"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2.5 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddCurrentToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-amber-300 text-sm font-bold py-3 px-5 rounded-xl transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {addedNotice
                    ? "Added to Cart!"
                    : `Add to Cart — ৳${product.price * quantity}`}
                </span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <Truck className="w-4 h-4 text-neutral-900" />
                <p className="font-bold text-neutral-950">Delivery Info</p>
                <p className="text-neutral-600">
                  Inside Mymensingh ৳70, Outside ৳130 (2–4 days).
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <RotateCcw className="w-4 h-4 text-neutral-900" />
                <p className="font-bold text-neutral-950">Return &amp; Exchange</p>
                <p className="text-neutral-600">
                  7-day easy size/item exchange with parcel video.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                <p className="font-bold text-neutral-950">Secure Payment</p>
                <p className="text-neutral-600">
                  COD, bKash, Nagad &amp; Rocket supported.
                </p>
              </div>
            </div>
          </div>
        </div>

        {frequentlyBoughtTogether.length > 0 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-neutral-950">
              Frequently Bought Together
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {[product, ...frequentlyBoughtTogether].map((item, i) => (
                <React.Fragment key={item.id}>
                  {i > 0 && <Plus className="w-4 h-4 text-neutral-400" />}
                  <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-950">
                        {item.name}
                      </p>
                      <p className="text-xs font-extrabold text-amber-800">
                        ৳{item.price}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              <button
                type="button"
                onClick={handleAddBundleToCart}
                className="ml-auto inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Add Bundle to Cart</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-5">
          <h2 className="text-lg font-bold text-neutral-950">
            Customer Reviews with Photos ({reviews.length})
          </h2>

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                placeholder="Your name *"
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                className="sm:col-span-3 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none"
              />
              <select
                value={revRating}
                onChange={(e) => setRevRating(Number(e.target.value))}
                className="sm:col-span-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none"
              >
                <option value={5}>5 ★</option>
                <option value={4}>4 ★</option>
                <option value={3}>3 ★</option>
                <option value={2}>2 ★</option>
                <option value={1}>1 ★</option>
              </select>
              <input
                type="text"
                required
                placeholder="Write review about received product... *"
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                className="sm:col-span-5 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-neutral-950 text-amber-300 text-xs sm:text-sm font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Post Review
              </button>
            </div>

            <label className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{revPhoto ? "Photo Attached" : "Add Product Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </form>

          {reviews.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{r.name}</span>
                    <span className="text-amber-500">{r.rating} ★</span>
                  </div>
                  <p className="text-xs text-neutral-600">{r.comment}</p>
                  {r.photo && (
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="w-full h-36 object-cover rounded-xl border border-neutral-200"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f7f7] p-6 max-w-6xl mx-auto">
          <div className="h-96 rounded-3xl bg-neutral-200 animate-pulse" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}