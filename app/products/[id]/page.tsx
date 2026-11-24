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
  Sun,
  Moon,
  Globe,
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
};

type ProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photo?: string;
};

type Lang = "en" | "bn";
type ThemeMode = "night" | "light";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const WHATSAPP_DISPLAY = "01533919648";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";

const CATEGORY_BN: Record<string, string> = {
  "Men's Fashion": "মেনস ফ্যাশন",
  "Women's Fashion": "উইমেনস ফ্যাশন",
  "Men's Footwear": "মেনস ফুটওয়্যার",
  "Women's Footwear": "উইমেনস ফুটওয়্যার",
  Gadgets: "গ্যাজেটস",
  "Beauty Products": "বিউটি প্রোডাক্টস",
  "Mobile Accessories": "মোবাইল অ্যাক্সেসরিজ",
};

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

function sanitizeReviews(raw: unknown): ProductReview[] {
  if (!Array.isArray(raw)) return [];
  const blocked = new Set([
    "demo",
    "test",
    "sample",
    "admin",
    "anonymous",
    "john doe",
    "jane doe",
  ]);
  return raw
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === "object")
    )
    .map((item, idx) => {
      const name = String(item.name || "").trim();
      const comment = String(item.comment || "").trim();
      const num = Number(item.rating);
      const rating =
        Number.isFinite(num) && num >= 1 && num <= 5 ? Math.round(num) : 5;
      const photo =
        typeof item.photo === "string" && item.photo.trim().length > 0
          ? item.photo.trim()
          : undefined;
      return {
        id:
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id.trim()
            : `pr-${idx}-${name}`,
        name,
        rating,
        comment,
        photo,
      };
    })
    .filter(
      (r) =>
        r.name.length > 0 &&
        r.comment.length > 0 &&
        !blocked.has(r.name.toLowerCase())
    );
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

  const parsedColors = parseStringArray(item.colors);

  return {
    id: String(item._id || item.id || idx),
    name: String(item.name || `${BRAND_NAME} Product`),
    category,
    subCategory,
    price: Number(item.price) || 0,
    oldPrice:
      item.oldPrice !== undefined &&
      item.oldPrice !== null &&
      Number(item.oldPrice) > 0
        ? Number(item.oldPrice)
        : undefined,
    images: imgs,
    badge: String(item.badge || `${BRAND_NAME} Edit`),
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
  };
}

function ProductDetailsContent() {
  const params = useParams<{ id: string }>();
  const productId = String(params?.id || "");

  const [lang, setLang] = useState<Lang>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("night");

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

  const isLight = themeMode === "light";

  const t = {
    pageBg: isLight
      ? "bg-[#F4F4F6] text-[#111114]"
      : "bg-[#09090B] text-[#F4F4F5]",
    headerBg: isLight
      ? "bg-white/95 backdrop-blur-md border-b border-zinc-200"
      : "bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800",
    surface: isLight
      ? "bg-white border border-zinc-200"
      : "bg-[#121216] border border-zinc-800",
    surfaceAlt: isLight
      ? "bg-zinc-100 border border-zinc-200"
      : "bg-zinc-900 border border-zinc-800",
    pillBtn: isLight
      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300"
      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700",
    input: isLight
      ? "bg-zinc-100 border border-zinc-300 text-[#111114] placeholder:text-zinc-500"
      : "bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500",
    titleText: isLight ? "text-[#111114]" : "text-white",
    bodyText: isLight ? "text-zinc-700" : "text-zinc-300",
    mutedText: isLight ? "text-zinc-500" : "text-zinc-400",
    cta: isLight
      ? "bg-gradient-to-b from-[#27272A] via-[#18181B] to-[#09090B] text-white"
      : "bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 text-zinc-950",
    chipActive: isLight
      ? "bg-[#18181B] text-white border-[#18181B]"
      : "bg-white text-zinc-950 border-white",
    chipIdle: isLight
      ? "bg-zinc-100 text-zinc-700 border-zinc-200"
      : "bg-zinc-900 text-zinc-300 border-zinc-800",
  };

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("maveron_store_lang");
      if (savedLang === "en" || savedLang === "bn") setLang(savedLang);
      const savedTheme = localStorage.getItem("maveron_theme_mode");
      if (savedTheme === "night" || savedTheme === "light")
        setThemeMode(savedTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = () => {
    const next: Lang = lang === "en" ? "bn" : "en";
    setLang(next);
    try {
      localStorage.setItem("maveron_store_lang", next);
    } catch {
      // ignore
    }
  };

  const toggleThemeMode = () => {
    const next: ThemeMode = themeMode === "night" ? "light" : "night";
    setThemeMode(next);
    try {
      localStorage.setItem("maveron_theme_mode", next);
    } catch {
      // ignore
    }
  };

  const catLabelText = (label: string) =>
    lang === "bn" ? CATEGORY_BN[label] || label : label;

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
      const saved = localStorage.getItem(`maveron_reviews_${productId}`);
      if (saved) {
        const clean = sanitizeReviews(JSON.parse(saved));
        setReviews(clean);
        localStorage.setItem(
          `maveron_reviews_${productId}`,
          JSON.stringify(clean)
        );
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    }
  }, [productId]);

  const frequentlyBoughtTogether = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.id !== product.id).slice(0, 2);
  }, [allProducts, product]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

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
      const raw = localStorage.getItem("maveron_cart");
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
      localStorage.setItem("maveron_cart", JSON.stringify(current));
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
    const next = sanitizeReviews([
      {
        id: `pr-${Date.now()}`,
        name: revName.trim(),
        rating: revRating,
        comment: revComment.trim(),
        photo: revPhoto || undefined,
      },
      ...reviews,
    ]);
    setReviews(next);
    try {
      localStorage.setItem(`maveron_reviews_${productId}`, JSON.stringify(next));
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
      <div
        suppressHydrationWarning
        className={`min-h-screen p-6 max-w-6xl mx-auto ${t.pageBg}`}
      >
        <div
          className={`h-96 rounded-3xl animate-pulse ${
            isLight ? "bg-zinc-200" : "bg-zinc-800"
          }`}
        />
      </div>
    );
  }

  if (notFoundItem || !product) {
    return (
      <div
        suppressHydrationWarning
        className={`min-h-screen flex items-center justify-center p-4 ${t.pageBg}`}
      >
        <div
          className={`rounded-3xl p-8 max-w-md w-full text-center space-y-4 ${t.surface}`}
        >
          <h1 className={`text-xl font-bold ${t.titleText}`}>
            {lang === "bn" ? "প্রোডাক্ট পাওয়া যায়নি" : "Product Not Found"}
          </h1>
          <p className={`text-sm ${t.mutedText}`}>
            {lang === "bn"
              ? "এই প্রোডাক্টটি পাওয়া যায়নি বা সরিয়ে ফেলা হয়েছে।"
              : "This product could not be found or is no longer available."}
          </p>
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-extrabold px-5 py-2.5 rounded-xl ${t.cta}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === "bn"
                ? `${BRAND_NAME} স্টোরে ফিরুন`
                : `Back to ${BRAND_NAME} Store`}
            </span>
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
    <div suppressHydrationWarning className={`min-h-screen pb-16 ${t.pageBg}`}>
      <header className={`sticky top-0 z-30 ${t.headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap ${t.titleText}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{BRAND_NAME}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label="Toggle Theme"
              className={`h-9 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer ${t.pillBtn}`}
            >
              {themeMode === "night" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {themeMode === "night"
                  ? lang === "bn"
                    ? "লাইট"
                    : "Light"
                  : lang === "bn"
                  ? "নাইট"
                  : "Night"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className={`h-9 px-3 rounded-full inline-flex items-center gap-1 text-xs font-bold cursor-pointer ${t.pillBtn}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>

            <a
              href={WHATSAPP_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{WHATSAPP_DISPLAY}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-10">
        <div
          className={`rounded-3xl p-5 sm:p-8 grid lg:grid-cols-12 gap-8 ${t.surface}`}
        >
          <div className="lg:col-span-6 space-y-3">
            <div
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed((z) => !z)}
              className={`aspect-square rounded-2xl overflow-hidden cursor-zoom-in relative ${t.surfaceAlt}`}
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
                        ? isLight
                          ? "border-zinc-950"
                          : "border-white"
                        : "border-zinc-700 opacity-70"
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
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${t.chipActive}`}
              >
                {catLabelText(product.subCategory)}
              </span>
              {discountPct && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPct}% OFF
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stock > 0
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {product.stock > 0
                  ? lang === "bn"
                    ? `স্টক: ${product.stock}`
                    : `Stock Quantity: ${product.stock}`
                  : lang === "bn"
                  ? "স্টক শেষ"
                  : "Out of Stock"}
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black ${t.titleText}`}>
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${t.titleText}`}>
                ৳{product.price}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className={`text-sm line-through ${t.mutedText}`}>
                  ৳{product.oldPrice}
                </span>
              )}
              {avgRating && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ml-auto ${t.bodyText}`}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {avgRating} ({reviews.length})
                </span>
              )}
            </div>

            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              {product.description}
            </p>

            {product.specs && (
              <div
                className={`rounded-2xl p-3.5 text-xs ${t.surfaceAlt} ${t.bodyText}`}
              >
                <span className={`font-bold block mb-1 ${t.titleText}`}>
                  {lang === "bn" ? "স্পেসিফিকেশন:" : "Specifications:"}
                </span>
                {product.specs}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <span className={`text-xs font-bold block ${t.bodyText}`}>
                  {lang === "bn" ? "সাইজ নির্বাচন করুন:" : "Available Sizes:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedSize === sz ? t.chipActive : t.chipIdle
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
                <span className={`text-xs font-bold block ${t.bodyText}`}>
                  {lang === "bn" ? "কালার নির্বাচন করুন:" : "Available Colors:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedColor === col ? t.chipActive : t.chipIdle
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <div className={`flex items-center rounded-xl ${t.surfaceAlt}`}>
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
                className={`flex-1 disabled:opacity-45 inline-flex items-center justify-center gap-2 text-sm font-extrabold py-3 px-5 rounded-xl transition cursor-pointer ${t.cta}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {addedNotice
                    ? lang === "bn"
                      ? "কার্টে যোগ হয়েছে!"
                      : "Added to Cart!"
                    : lang === "bn"
                    ? `কার্টে যোগ করুন — ৳${product.price * quantity}`
                    : `Add to Cart — ৳${product.price * quantity}`}
                </span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className={`p-3 rounded-2xl space-y-1 ${t.surfaceAlt}`}>
                <Truck className={`w-4 h-4 ${t.titleText}`} />
                <p className={`font-bold ${t.titleText}`}>
                  {lang === "bn" ? "ডেলিভারি তথ্য" : "Delivery Info"}
                </p>
                <p className={t.mutedText}>
                  {lang === "bn"
                    ? "ময়মনসিংহের ভেতরে ৳৭০, বাইরে ৳১৩০ (২–৪ দিন)।"
                    : "Inside Mymensingh ৳70, Outside ৳130 (2–4 days)."}
                </p>
              </div>
              <div className={`p-3 rounded-2xl space-y-1 ${t.surfaceAlt}`}>
                <RotateCcw className={`w-4 h-4 ${t.titleText}`} />
                <p className={`font-bold ${t.titleText}`}>
                  {lang === "bn" ? "রিটার্ন ও এক্সচেঞ্জ" : "Return & Exchange"}
                </p>
                <p className={t.mutedText}>
                  {lang === "bn"
                    ? "আনবক্সিং ভিডিওসহ ৭ দিনের এক্সচেঞ্জ সুবিধা।"
                    : "7-day easy size/item exchange with parcel video."}
                </p>
              </div>
              <div className={`p-3 rounded-2xl space-y-1 ${t.surfaceAlt}`}>
                <ShieldCheck className={`w-4 h-4 ${t.titleText}`} />
                <p className={`font-bold ${t.titleText}`}>
                  {lang === "bn" ? "নিরাপদ পেমেন্ট" : "Secure Payment"}
                </p>
                <p className={t.mutedText}>
                  {lang === "bn"
                    ? "COD, bKash, Nagad ও Rocket সুবিধা।"
                    : "COD, bKash, Nagad & Rocket supported."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {frequentlyBoughtTogether.length > 0 && (
          <div className={`rounded-3xl p-6 space-y-4 ${t.surface}`}>
            <h2 className={`text-lg font-bold ${t.titleText}`}>
              {lang === "bn"
                ? "একসাথে বেশি কেনা হয়"
                : "Frequently Bought Together"}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {[product, ...frequentlyBoughtTogether].map((item, i) => (
                <React.Fragment key={item.id}>
                  {i > 0 && <Plus className={`w-4 h-4 ${t.mutedText}`} />}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl ${t.surfaceAlt}`}
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className={`text-xs font-bold ${t.titleText}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs font-extrabold ${t.bodyText}`}>
                        ৳{item.price}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              <button
                type="button"
                onClick={handleAddBundleToCart}
                className={`ml-auto inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-3 rounded-xl cursor-pointer ${t.cta}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {lang === "bn" ? "বান্ডেল কার্টে নিন" : "Add Bundle to Cart"}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className={`rounded-3xl p-6 space-y-5 ${t.surface}`}>
          <h2 className={`text-lg font-bold ${t.titleText}`}>
            {lang === "bn"
              ? `কাস্টমার রিভিউ (${reviews.length})`
              : `Customer Reviews with Photos (${reviews.length})`}
          </h2>

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                placeholder={lang === "bn" ? "আপনার নাম *" : "Your name *"}
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                className={`sm:col-span-3 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none ${t.input}`}
              />
              <select
                value={revRating}
                onChange={(e) => setRevRating(Number(e.target.value))}
                className={`sm:col-span-2 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none ${t.input}`}
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
                placeholder={
                  lang === "bn"
                    ? "রিসিভ করা প্রোডাক্ট নিয়ে রিভিউ লিখুন... *"
                    : "Write review about received product... *"
                }
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                className={`sm:col-span-5 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none ${t.input}`}
              />
              <button
                type="submit"
                className={`sm:col-span-2 text-xs sm:text-sm font-extrabold py-2 px-4 rounded-xl cursor-pointer ${t.cta}`}
              >
                {lang === "bn" ? "রিভিউ দিন" : "Post Review"}
              </button>
            </div>

            <label
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer ${t.pillBtn}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {revPhoto
                  ? lang === "bn"
                    ? "ছবি যুক্ত হয়েছে"
                    : "Photo Attached"
                  : lang === "bn"
                  ? "প্রোডাক্টের ছবি যোগ করুন"
                  : "Add Product Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </form>

          {reviews.length === 0 ? (
            <p className={`text-xs sm:text-sm ${t.mutedText}`}>
              {lang === "bn"
                ? "এই প্রোডাক্টে এখনো কোনো রিভিউ নেই।"
                : "No reviews for this product yet."}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl space-y-2 ${t.surfaceAlt}`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={t.titleText}>{r.name}</span>
                    <span className="text-amber-400">{r.rating} ★</span>
                  </div>
                  <p className={`text-xs ${t.bodyText}`}>{r.comment}</p>
                  {r.photo && (
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="w-full h-36 object-cover rounded-xl"
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
        <div className="min-h-screen bg-[#09090B] p-6 max-w-6xl mx-auto">
          <div className="h-96 rounded-3xl bg-zinc-800 animate-pulse" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}