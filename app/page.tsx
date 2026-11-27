"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  Heart,
  Menu,
  Eye,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowRight,
  MessageCircle,
  Mail,
  MapPin,
  User,
  Home,
  Package,
  LogOut,
  Flame,
  Star,
  Globe,
  Sun,
  Moon,
  EyeOff,
  KeyRound,
  Wallet,
  Settings,
} from "lucide-react";

type FlashSaleConfig = {
  enabled?: boolean;
  endsAt?: string;
  discountPercent?: number;
};

type Product = {
  id: string;
  name: string;
  category: "fashion" | "gadget";
  subCategory: string;
  price: number;
  oldPrice?: number;
  flashSale?: FlashSaleConfig;
  image: string;
  secondaryImage?: string;
  images?: string[];
  colorImages?: Record<string, string>;
  badge?: string;
  sizes?: string[];
  colors?: string[];
  specs?: string;
  description?: string;
  stock?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  selectedOption?: string;
  selectedColor?: string;
};

type CustomerProfile = {
  name: string;
  email?: string;
  phone?: string;
  district: string;
  address: string;
  provider?: "email" | "phone" | "google" | "facebook" | "otp";
  verified?: boolean;
  lastActiveAt?: string;
};

type UserOrderRecord = {
  _id: string;
  orderId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
  checkoutAt?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
};

type DeliveryConfig = {
  insideMymensingh: number;
  outsideMymensingh: number;
  freeThreshold: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
};

type SimpleReview = {
  id: string;
  productId?: string;
  name: string;
  rating: number;
  comment: string;
  photo?: string;
  status?: string;
  createdAt?: string;
};

type SortOption = "featured" | "price-asc" | "price-desc" | "discount";
type BottomTab = "home" | "categories" | "cart" | "orders" | "account";
type Lang = "en" | "bn";
type ThemeMode = "night" | "light";
type PaymentOption = "Cash on Delivery" | "bKash" | "Nagad" | "Rocket";
type AuthMode = "login" | "register" | "forgot";
type AccountSubSection =
  | "menu"
  | "orders"
  | "dues"
  | "wishlist"
  | "reviews"
  | "addresses"
  | "profile"
  | "settings";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";
const SUPPORT_EMAIL = "maveron.store@gmail.com";
const HERO_BANNER_SRC = "/hero-banner.jpg";
const LOGIN_SILK_BG_SRC = "/images/maveron-silk-bg.jpg";
const LOGO_SRC = "/images/maveron-logo.png";
const SCROLL_STORAGE_KEY = "maveron_home_scroll_y";

const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  insideMymensingh: 70,
  outsideMymensingh: 130,
  freeThreshold: 0,
  bkashNumber: "01782141520",
  nagadNumber: "01782141520",
  rocketNumber: "015339196489",
};

const DELIVERY_LOCATIONS = [
  { label: "Mymensingh", district: "Mymensingh", zone: "mymensingh" as const },
  { label: "Dhaka", district: "Dhaka", zone: "outside" as const },
  { label: "Chattogram", district: "Chattogram", zone: "outside" as const },
  { label: "Sylhet", district: "Sylhet", zone: "outside" as const },
  { label: "Rajshahi", district: "Rajshahi", zone: "outside" as const },
  { label: "Khulna", district: "Khulna", zone: "outside" as const },
];

export const STORE_CATEGORIES = [
  "Men's Fashion",
  "Women's Fashion",
  "Men's Footwear",
  "Women's Footwear",
  "Gadgets",
  "Beauty Products",
  "Mobile Accessories",
] as const;

const CATEGORY_BN: Record<string, string> = {
  "Men's Fashion": "মেনস ফ্যাশন",
  "Women's Fashion": "উইমেনস ফ্যাশন",
  "Men's Footwear": "মেনস ফুটওয়্যার",
  "Women's Footwear": "উইমেনস ফুটওয়্যার",
  Gadgets: "গ্যাজেটস",
  "Beauty Products": "বিউটি প্রোডাক্টস",
  "Mobile Accessories": "মোবাইল অ্যাক্সেসরিজ",
};

const CATEGORY_IMAGES = {
  mensFashion: "/images/mensFashion.jpg",
  womensFashion: "/images/womensFashion.jpg",
  mensFootwear: "/images/mensFootwear.jpg",
  womensFootwear: "/images/womensFootwear.jpg",
  gadgets: "/images/gadgets.jpg",
  beautyProducts: "/images/beautyProducts.jpg",
  mobileAccessories: "/images/mobile-accessories.jpg",
};

const FEATURED_CATEGORIES = [
  {
    title: "Men's Fashion",
    subtitle: "Shirts, Panjabi & Streetwear",
    filterKey: "fashion" as const,
    subFilter: "Men's Fashion",
    image: CATEGORY_IMAGES.mensFashion,
  },
  {
    title: "Women's Fashion",
    subtitle: "Co-ords, Kurtis & Modest Wear",
    filterKey: "fashion" as const,
    subFilter: "Women's Fashion",
    image: CATEGORY_IMAGES.womensFashion,
  },
  {
    title: "Men's Footwear",
    subtitle: "Sneakers, Loafers & Boots",
    filterKey: "fashion" as const,
    subFilter: "Men's Footwear",
    image: CATEGORY_IMAGES.mensFootwear,
  },
  {
    title: "Women's Footwear",
    subtitle: "Heels, Flats & Casual Shoes",
    filterKey: "fashion" as const,
    subFilter: "Women's Footwear",
    image: CATEGORY_IMAGES.womensFootwear,
  },
  {
    title: "Gadgets",
    subtitle: "Smartwatches, Audio & Tech",
    filterKey: "gadget" as const,
    subFilter: "Gadgets",
    image: CATEGORY_IMAGES.gadgets,
  },
  {
    title: "Beauty Products",
    subtitle: "Skincare, Serums & Care",
    filterKey: "fashion" as const,
    subFilter: "Beauty Products",
    image: CATEGORY_IMAGES.beautyProducts,
  },
  {
    title: "Mobile Accessories",
    subtitle: "Chargers, Powerbanks & Cases",
    filterKey: "gadget" as const,
    subFilter: "Mobile Accessories",
    image: CATEGORY_IMAGES.mobileAccessories,
  },
];

function normalizeCategory(rawCategory?: string): "fashion" | "gadget" {
  const val = (rawCategory || "").toLowerCase();
  if (val.includes("gadget") || val.includes("mobile") || val.includes("tech"))
    return "gadget";
  return "fashion";
}

function isFootwearText(text?: string): boolean {
  const val = (text || "").toLowerCase();
  return (
    val.includes("shoe") ||
    val.includes("sneaker") ||
    val.includes("boot") ||
    val.includes("loafer") ||
    val.includes("sandal") ||
    val.includes("heel") ||
    val.includes("footwear")
  );
}

function canonicalCategoryLabel(raw?: string): string {
  const val = (raw || "").trim().toLowerCase();
  if (!val) return "";
  if (val.includes("women") && (val.includes("foot") || isFootwearText(val)))
    return "Women's Footwear";
  if (val.includes("men") && (val.includes("foot") || isFootwearText(val)))
    return "Men's Footwear";
  if (isFootwearText(val)) return "Men's Footwear";
  if (val.includes("women") && val.includes("fashion")) return "Women's Fashion";
  if (val.includes("men") && val.includes("fashion")) return "Men's Fashion";
  if (
    val.includes("beauty") ||
    val.includes("cosmetic") ||
    val.includes("skincare")
  )
    return "Beauty Products";
  if (
    val.includes("mobile") ||
    val.includes("charger") ||
    val.includes("cable") ||
    val.includes("cover") ||
    val.includes("power bank") ||
    val.includes("powerbank")
  )
    return "Mobile Accessories";
  if (val.includes("gadget") || val.includes("watch") || val.includes("earbud"))
    return "Gadgets";
  return (raw || "").trim();
}

function inferSubCategory(
  item: Record<string, unknown>,
  cat: "fashion" | "gadget"
): string {
  const fromSub = canonicalCategoryLabel(String(item?.subCategory || ""));
  if (fromSub) return fromSub;

  const fromCat = canonicalCategoryLabel(String(item?.category || ""));
  if (
    fromCat &&
    fromCat.toLowerCase() !== "fashion" &&
    fromCat.toLowerCase() !== "gadget"
  ) {
    return fromCat;
  }

  const text = `${item?.name || ""} ${item?.description || ""}`.toLowerCase();
  if (text.includes("beauty") || text.includes("lip") || text.includes("skin"))
    return "Beauty Products";
  if (text.includes("women") && isFootwearText(text)) return "Women's Footwear";
  if (isFootwearText(text)) return "Men's Footwear";
  if (text.includes("women") || text.includes("kurti") || text.includes("dress"))
    return "Women's Fashion";
  if (
    text.includes("charger") ||
    text.includes("cable") ||
    text.includes("case") ||
    text.includes("power bank") ||
    text.includes("powerbank")
  )
    return "Mobile Accessories";
  if (cat === "gadget") return "Gadgets";
  return "Men's Fashion";
}

function parseExplicitSizes(rawSizes: unknown): string[] {
  if (Array.isArray(rawSizes)) {
    return rawSizes
      .flatMap((entry) => String(entry).split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof rawSizes === "string" && rawSizes.trim().length > 0) {
    return rawSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function resolveFashionSizes(
  item: Record<string, unknown>,
  subCat: string
): string[] {
  const explicit = parseExplicitSizes(item?.sizes);
  if (explicit.length > 0) {
    return explicit;
  }

  const combinedText = `${subCat} ${item?.name || ""} ${item?.description || ""}`;
  if (isFootwearText(combinedText)) {
    return ["40", "41", "42", "43"];
  }
  return ["M", "L", "XL"];
}

function resolveAdminColors(item: Record<string, unknown>): string[] {
  const list: string[] = [];

  if (Array.isArray(item?.colors)) {
    for (const c of item.colors) {
      if (typeof c === "string") {
        c.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => {
            if (!list.includes(s)) list.push(s);
          });
      } else if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        const name = String(obj.name || obj.color || obj.label || "").trim();
        if (name && !list.includes(name)) list.push(name);
      }
    }
  } else if (typeof item?.colors === "string" && item.colors.trim()) {
    item.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => {
        if (!list.includes(c)) list.push(c);
      });
  }

  if (Array.isArray(item?.variants)) {
    for (const v of item.variants) {
      if (v && typeof v === "object") {
        const obj = v as Record<string, unknown>;
        const name = String(obj.color || obj.name || "").trim();
        if (name && !list.includes(name)) list.push(name);
      }
    }
  }

  return list;
}

function resolveAdminImages(
  item: Record<string, unknown>,
  primaryImage: string
): string[] {
  const list: string[] = [];
  const pushUnique = (val: unknown) => {
    const cleaned = String(val || "").trim();
    if (cleaned && !list.includes(cleaned)) {
      list.push(cleaned);
    }
  };

  pushUnique(primaryImage);

  const arrayFields = [
    item?.images,
    item?.gallery,
    item?.productImages,
    item?.extraImages,
  ];
  for (const field of arrayFields) {
    if (Array.isArray(field)) {
      for (const entry of field) {
        if (typeof entry === "string") {
          pushUnique(entry);
        } else if (entry && typeof entry === "object") {
          const obj = entry as Record<string, unknown>;
          pushUnique(obj.url || obj.image || obj.src);
        }
      }
    } else if (typeof field === "string" && field.trim()) {
      field.split(",").forEach((part) => pushUnique(part));
    }
  }

  pushUnique(item?.secondaryImage);
  pushUnique(item?.image2);
  pushUnique(item?.image3);
  pushUnique(item?.image4);

  if (Array.isArray(item?.variants)) {
    for (const v of item.variants) {
      if (v && typeof v === "object") {
        const obj = v as Record<string, unknown>;
        pushUnique(obj.image || obj.url);
      }
    }
  }

  return list;
}

function resolveAdminColorImages(
  item: Record<string, unknown>,
  colors: string[],
  images: string[]
): Record<string, string> {
  const map: Record<string, string> = {};

  if (item?.colorImages && typeof item.colorImages === "object") {
    for (const [key, val] of Object.entries(
      item.colorImages as Record<string, unknown>
    )) {
      const k = key.trim().toLowerCase();
      if (k && typeof val === "string" && val.trim()) {
        map[k] = val.trim();
      }
    }
  }

  if (Array.isArray(item?.colors)) {
    for (const c of item.colors) {
      if (c && typeof c === "object") {
        const obj = c as Record<string, unknown>;
        const name = String(obj.name || obj.color || obj.label || "")
          .trim()
          .toLowerCase();
        const img = String(obj.image || obj.url || obj.src || "").trim();
        if (name && img) {
          map[name] = img;
        }
      }
    }
  }

  if (Array.isArray(item?.variants)) {
    for (const v of item.variants) {
      if (v && typeof v === "object") {
        const obj = v as Record<string, unknown>;
        const name = String(obj.color || obj.name || "")
          .trim()
          .toLowerCase();
        const img = String(obj.image || obj.url || "").trim();
        if (name && img) {
          map[name] = img;
        }
      }
    }
  }

  colors.forEach((col, idx) => {
    const key = col.trim().toLowerCase();
    if (!map[key] && images[idx]) {
      map[key] = images[idx];
    }
  });

  return map;
}

function resolveFlashSale(item: Record<string, unknown>): FlashSaleConfig | undefined {
  const raw = item?.flashSale;
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const endsAt =
    typeof obj.endsAt === "string" && obj.endsAt.trim()
      ? obj.endsAt.trim()
      : undefined;
  const isExpired = endsAt
    ? Number.isFinite(Date.parse(endsAt)) && Date.parse(endsAt) < Date.now()
    : false;
  return {
    enabled: Boolean(obj.enabled) && !isExpired,
    endsAt,
    discountPercent:
      obj.discountPercent !== undefined ? Number(obj.discountPercent) : undefined,
  };
}

function isFlashSaleProduct(p: Product): boolean {
  if (p.flashSale?.enabled) return true;
  return typeof p.oldPrice === "number" && p.oldPrice > p.price;
}

function getImageForColor(product: Product, color?: string): string {
  if (!color) return product.image;
  const key = color.trim().toLowerCase();

  if (product.colorImages && product.colorImages[key]) {
    return product.colorImages[key];
  }

  if (product.colorImages) {
    const matchedEntry = Object.entries(product.colorImages).find(
      ([k, v]) => Boolean(v) && (k.includes(key) || key.includes(k))
    );
    if (matchedEntry) return matchedEntry[1];
  }

  if (product.colors && product.colors.length > 0 && product.images?.length) {
    const colorIdx = product.colors.findIndex(
      (c) => c.trim().toLowerCase() === key
    );
    if (colorIdx >= 0 && product.images[colorIdx]) {
      return product.images[colorIdx];
    }
    if (colorIdx > 0 && product.images.length > 1) {
      return product.images[colorIdx % product.images.length];
    }
  }

  if (
    product.colors &&
    product.colors.length > 1 &&
    product.colors[0].trim().toLowerCase() !== key
  ) {
    return product.secondaryImage || product.images?.[1] || product.image;
  }

  return product.image;
}

function getDiscountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function sanitizeAuthenticReviews(
  raw: unknown,
  fromApi = false
): SimpleReview[] {
  if (!Array.isArray(raw)) return [];
  const blockedNames = new Set([
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
    .filter((item) => {
      const statusVal = String(item.status || "").trim().toLowerCase();
      if (statusVal === "rejected") return false;
      if (item.approved === false) return false;
      if (fromApi && statusVal && statusVal !== "approved") {
        return false;
      }
      return true;
    })
    .map((item, idx) => {
      const name = String(item.name || "").trim();
      const comment = String(item.comment || "").trim();
      const ratingNum = Number(item.rating);
      const validRating =
        Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5
          ? Math.round(ratingNum)
          : 5;
      const photo =
        typeof item.photo === "string" && item.photo.trim().length > 0
          ? item.photo.trim()
          : undefined;
      const productId =
        typeof item.productId === "string" && item.productId.trim().length > 0
          ? item.productId.trim()
          : undefined;
      const id =
        typeof item.id === "string" && item.id.trim().length > 0
          ? item.id.trim()
          : typeof item._id === "string" && item._id.trim().length > 0
          ? item._id.trim()
          : `rev-${idx}-${name}`;
      const status =
        typeof item.status === "string" && item.status.trim().length > 0
          ? item.status.trim()
          : "approved";
      const createdAt =
        typeof item.createdAt === "string" && item.createdAt.trim().length > 0
          ? item.createdAt.trim()
          : undefined;

      return {
        id,
        productId,
        name,
        rating: validRating,
        comment,
        photo,
        status,
        createdAt,
      };
    })
    .filter(
      (rev) =>
        rev.name.length > 0 &&
        rev.comment.length > 0 &&
        !blockedNames.has(rev.name.toLowerCase())
    );
}

function appendTimelineEvent(type: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const nowIso = new Date().toISOString();
    const raw = localStorage.getItem("maveron_activity_timeline");
    const list: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
    const entry = {
      id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      timestamp: nowIso,
      createdAt: nowIso,
      ...(meta || {}),
    };
    const next = [entry, ...list].slice(0, 100);
    localStorage.setItem("maveron_activity_timeline", JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("maveron_theme_mode");
    if (saved === "night" || saved === "light") return saved;
    const attr = document.documentElement.getAttribute("data-maveron-theme");
    if (attr === "night" || attr === "light") return attr;
  } catch {
    // ignore
  }
  return "light";
}

function applyThemeToDocument(mode: ThemeMode) {
  try {
    document.documentElement.setAttribute("data-maveron-theme", mode);
    document.documentElement.style.colorScheme =
      mode === "light" ? "light" : "dark";
    document.documentElement.style.backgroundColor =
      mode === "light" ? "#F4F4F6" : "#09090B";
  } catch {
    // ignore
  }
}

async function uploadImageToCloudinaryRoute(
  file: File,
  folder = "maveron/reviews"
): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error("Invalid file selected for upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  const uploadedUrl = String(
    data?.url || data?.secure_url || data?.data?.url || ""
  ).trim();

  if (!res.ok || !uploadedUrl.startsWith("http")) {
    throw new Error(
      String(
        data?.message ||
          data?.error ||
          `Cloudinary upload failed (HTTP ${res.status})`
      )
    );
  }

  return uploadedUrl;
}

export default function HomeStore() {
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  // Navigation & Catalog States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "fashion" | "gadget"
  >("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("home");

  // Authentic Customer Reviews Only
  const [reviews, setReviews] = useState<SimpleReview[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<string>("");
  const [uploadingReviewPhoto, setUploadingReviewPhoto] = useState(false);

  // Delivery & Wallet Config synced from Admin Settings
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>(
    DEFAULT_DELIVERY_CONFIG
  );

  // Location & User Auth/Account States
  const [deliveryLocation, setDeliveryLocation] = useState("Mymensingh");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [customerUser, setCustomerUser] = useState<CustomerProfile | null>(
    null
  );
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountSection, setAccountSection] =
    useState<AccountSubSection>("menu");
  const [userOrders, setUserOrders] = useState<UserOrderRecord[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  // Profile / Address / Settings editable fields
  const [profileNameInput, setProfileNameInput] = useState("");
  const [profilePhoneInput, setProfilePhoneInput] = useState("");
  const [profileDistrictInput, setProfileDistrictInput] = useState("Mymensingh");
  const [profileAddressInput, setProfileAddressInput] = useState("");
  const [accountSavedNotice, setAccountSavedNotice] = useState("");

  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotNotice, setForgotNotice] = useState("");

  const [loginError, setLoginError] = useState("");

  // Interactive States
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState<{ [id: string]: string }>(
    {}
  );
  const [selectedColors, setSelectedColors] = useState<{
    [id: string]: string;
  }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("Mymensingh");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentOption>("Cash on Delivery");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<"mymensingh" | "outside">(
    "mymensingh"
  );
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string>("");

  const isLight = isMounted ? themeMode === "light" : true;
  const isAuthenticatedCustomer = Boolean(
    customerUser?.email && customerUser?.verified
  );

  const t = {
    pageBg: isLight
      ? "bg-[#F4F4F6] text-[#111114] selection:bg-[#111114] selection:text-white"
      : "bg-[#09090B] text-[#F4F4F5] selection:bg-[#E4E4E7] selection:text-[#09090B]",
    headerBg: isLight
      ? "bg-white/95 backdrop-blur-md border-b border-zinc-200"
      : "bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800",
    surface: isLight
      ? "bg-white border border-zinc-200/90 shadow-2xs"
      : "bg-[#121216] border border-zinc-800 shadow-sm",
    surfaceAlt: isLight
      ? "bg-zinc-100/90 border border-zinc-200"
      : "bg-zinc-900/90 border border-zinc-800",
    pillBtn: isLight
      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300/80"
      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80",
    titleText: isLight ? "text-[#111114]" : "text-white",
    headingGradient: isLight
      ? "bg-gradient-to-r from-[#111114] via-[#27272A] to-[#52525B] bg-clip-text text-transparent"
      : "bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent",
    bodyText: isLight ? "text-zinc-700" : "text-zinc-300",
    mutedText: isLight ? "text-zinc-500" : "text-zinc-400",
    silverCta: isLight
      ? "bg-gradient-to-b from-[#27272A] via-[#18181B] to-[#09090B] hover:opacity-95 text-white shadow-sm"
      : "bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 hover:brightness-105 text-zinc-950 shadow-md",
    chipActive: isLight
      ? "bg-[#18181B] text-white border-[#18181B]"
      : "bg-white text-zinc-950 border-white",
    chipIdle: isLight
      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200"
      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-800",
    input: isLight
      ? "bg-zinc-100 border border-zinc-300 text-[#111114] placeholder:text-zinc-500 focus:border-zinc-500"
      : "bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-400",
    footerBg: isLight
      ? "bg-white text-zinc-700 border-t border-zinc-200"
      : "bg-[#0E0E12] text-zinc-300 border-t border-zinc-800",
    navBg: isLight
      ? "bg-white/95 backdrop-blur-md border border-zinc-200 shadow-xl"
      : "bg-[#121216]/95 backdrop-blur-md border border-zinc-800 shadow-2xl",
  };

  const catLabelText = (label: string) =>
    isMounted && lang === "bn" ? CATEGORY_BN[label] || label : label;

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const rememberCurrentScroll = () => {
    try {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
    } catch {
      // ignore
    }
  };

  const syncReviewsFromApi = async () => {
    let localClean: SimpleReview[] = [];
    try {
      const savedReviews = localStorage.getItem("maveron_simple_reviews");
      if (savedReviews) {
        localClean = sanitizeAuthenticReviews(JSON.parse(savedReviews), false);
      }
    } catch {
      localClean = [];
    }

    try {
      const res = await fetch(`/api/reviews?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data?.success && Array.isArray(data.reviews)) {
        const apiClean = sanitizeAuthenticReviews(data.reviews, true);
        const mergedMap = new Map<string, SimpleReview>();
        for (const r of [...apiClean, ...localClean]) {
          if (!mergedMap.has(r.id)) {
            mergedMap.set(r.id, r);
          }
        }
        const merged = Array.from(mergedMap.values());
        setReviews(merged);
        try {
          localStorage.setItem(
            "maveron_simple_reviews",
            JSON.stringify(merged)
          );
        } catch {
          // ignore storage quota errors
        }
        return;
      }
    } catch (err) {
      console.error("Failed to fetch reviews from API:", err);
    }

    setReviews(localClean);
  };

  useEffect(() => {
    const initialTheme = readInitialTheme();
    setThemeMode(initialTheme);
    applyThemeToDocument(initialTheme);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    const saveScrollPosition = () => {
      try {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
      } catch {
        // ignore
      }
    };

    window.addEventListener("pagehide", saveScrollPosition);
    window.addEventListener("beforeunload", saveScrollPosition);

    return () => {
      saveScrollPosition();
      window.removeEventListener("pagehide", saveScrollPosition);
      window.removeEventListener("beforeunload", saveScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (loadingProducts) return;
    try {
      const savedY = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedY) {
        const y = Number(savedY);
        if (Number.isFinite(y) && y > 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, left: 0, behavior: "auto" });
          });
        }
      }
    } catch {
      // ignore
    }
  }, [loadingProducts]);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("maveron_store_lang");
      if (savedLang === "en" || savedLang === "bn") {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }

    void syncReviewsFromApi();
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
    const next: ThemeMode = themeMode === "light" ? "night" : "light";
    setThemeMode(next);
    try {
      localStorage.setItem("maveron_theme_mode", next);
      applyThemeToDocument(next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const rawSettings = localStorage.getItem("fg_admin_delivery_settings");
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        setDeliveryConfig({
          insideMymensingh: Number(
            parsed.insideMymensinghCharge ?? parsed.insideDhakaCharge ?? 70
          ),
          outsideMymensingh: Number(
            parsed.outsideMymensinghCharge ?? parsed.outsideDhakaCharge ?? 130
          ),
          freeThreshold: Number(parsed.freeDeliveryThreshold ?? 0),
          bkashNumber: String(parsed.bkashNumber || "01782141520"),
          nagadNumber: String(parsed.nagadNumber || "01782141520"),
          rocketNumber: String(parsed.rocketNumber || "015339196489"),
        });
      }
    } catch (err) {
      console.error("Failed to load delivery settings:", err);
    }

    try {
      const savedWishlist = localStorage.getItem("maveron_wishlist");
      if (savedWishlist) {
        const parsedWish = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWish)) {
          setWishlist(parsedWish.map(String));
        }
      }
    } catch {
      // ignore
    }

    try {
      const savedUser =
        localStorage.getItem("maveron_user") ||
        sessionStorage.getItem("maveron_user");
      if (savedUser) {
        const parsed: CustomerProfile = JSON.parse(savedUser);
        if (parsed?.email && parsed?.verified) {
          setCustomerUser(parsed);
          setCustomerName(parsed.name || "");
          setCustomerPhone(parsed.phone || "");
          setProfileNameInput(parsed.name || "");
          setProfilePhoneInput(parsed.phone || "");
          if (parsed.district) {
            setCustomerDistrict(parsed.district);
            setProfileDistrictInput(parsed.district);
            setDeliveryLocation(parsed.district);
            setDeliveryZone(
              parsed.district.toLowerCase().includes("mymensingh")
                ? "mymensingh"
                : "outside"
            );
          }
          if (parsed.address) {
            setCustomerAddress(parsed.address);
            setProfileAddressInput(parsed.address);
          }
          void loadAccountOrders(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load customer user:", err);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("maveron_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, isMounted]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("maveron_cart");
      const initialCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const pendingRaw = sessionStorage.getItem("maveron_pending_checkout");
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        sessionStorage.removeItem("maveron_pending_checkout");
        if (pending?.product) {
          const idx = initialCart.findIndex(
            (i) =>
              i.product.id === pending.product.id &&
              i.selectedOption === pending.selectedOption
          );
          if (idx > -1) {
            initialCart[idx] = {
              ...initialCart[idx],
              quantity: initialCart[idx].quantity + (pending.quantity || 1),
            };
          } else {
            initialCart.push({
              product: pending.product,
              quantity: pending.quantity || 1,
              selectedOption: pending.selectedOption,
              selectedColor: pending.selectedColor,
            });
          }
          setIsCartOpen(true);
          setActiveBottomTab("cart");
          appendTimelineEvent("checkout_started", {
            source: "pending_checkout",
            checkoutAt: new Date().toISOString(),
          });
        }
      }

      if (initialCart.length > 0) {
        setCart(initialCart);
      }
    } catch (err) {
      console.error("Failed to restore cart:", err);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("maveron_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart, isMounted]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;

        if (data.success && Array.isArray(data.products)) {
          const mapped: Product[] = data.products.map(
            (item: Record<string, unknown>, idx: number) => {
              const subCat = inferSubCategory(item, "fashion");
              const cat = normalizeCategory(
                `${String(item.category || "")} ${subCat}`
              );
              const resolvedSizes =
                cat === "fashion" && subCat !== "Beauty Products"
                  ? resolveFashionSizes(item, subCat)
                  : undefined;
              const resolvedColors = resolveAdminColors(item);
              const primaryImg =
                String(item.image || "").trim() || CATEGORY_IMAGES.mensFootwear;
              const allImages = resolveAdminImages(item, primaryImg);
              const secondaryImg = allImages[1];
              const colorImgMap = resolveAdminColorImages(
                item,
                resolvedColors,
                allImages
              );
              const rawBadge = String(item.badge || "").trim();
              const flashSale = resolveFlashSale(item);

              return {
                id: String(item._id || item.id || idx),
                name: String(item.name || "MAVÉRON Product"),
                category: cat,
                subCategory: subCat,
                price: Number(item.price) || 0,
                oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
                flashSale,
                image: primaryImg,
                secondaryImage: secondaryImg,
                images: allImages,
                colorImages: colorImgMap,
                badge: rawBadge || undefined,
                sizes: resolvedSizes,
                colors: resolvedColors,
                specs:
                  cat === "gadget"
                    ? String(item.specs || item.description || "") || undefined
                    : undefined,
                description: String(item.description || ""),
                stock: item.stock !== undefined ? Number(item.stock) : 10,
              };
            }
          );

          setProducts(mapped);
          setSelectedSizes((prev) => {
            const next = { ...prev };
            for (const prod of mapped) {
              if (
                prod.category === "fashion" &&
                prod.sizes &&
                prod.sizes.length > 0
              ) {
                if (!next[prod.id] || !prod.sizes.includes(next[prod.id])) {
                  next[prod.id] = prod.sizes[0];
                }
              }
            }
            return next;
          });
          setSelectedColors((prev) => {
            const next = { ...prev };
            for (const prod of mapped) {
              if (prod.colors && prod.colors.length > 0 && !next[prod.id]) {
                next[prod.id] = prod.colors[0];
              }
            }
            return next;
          });
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products from DB:", err);
        if (active) setProducts([]);
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const loadAccountOrders = async (profile: CustomerProfile | null) => {
    if (!profile) {
      setUserOrders([]);
      return;
    }
    setLoadingUserOrders(true);
    try {
      let localOrders: UserOrderRecord[] = [];
      try {
        const localRaw = localStorage.getItem("maveron_my_orders");
        localOrders = localRaw ? JSON.parse(localRaw) : [];
      } catch {
        localOrders = [];
      }

      const cleanEmail = (profile.email || customerUser?.email || "")
        .trim()
        .toLowerCase();
      const cleanPhone = (profile.phone || customerPhone || "").trim();

      const params = new URLSearchParams();
      if (cleanEmail) params.set("email", cleanEmail);
      if (cleanPhone) params.set("phone", cleanPhone);

      const queryString = params.toString();
      const res = queryString
        ? await fetch(`/api/orders?${queryString}`, { cache: "no-store" })
        : null;

      if (res && res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.orders)) {
          const matchingLocal = localOrders.filter((ord) => {
            const ordEmail = String(ord.email || "")
              .trim()
              .toLowerCase();
            const ordPhone = String(ord.phone || "").trim();
            const emailMatch = Boolean(cleanEmail && ordEmail === cleanEmail);
            const phoneMatch = Boolean(cleanPhone && ordPhone === cleanPhone);
            return emailMatch || phoneMatch;
          });

          const mapById = new Map<string, UserOrderRecord>();
          for (const ord of [...data.orders, ...matchingLocal]) {
            const key = String(ord._id || ord.orderId || "");
            if (key && !mapById.has(key)) {
              mapById.set(key, ord);
            }
          }
          setUserOrders(Array.from(mapById.values()));
          return;
        }
      }

      const matchingLocal = localOrders.filter((ord) => {
        const ordEmail = String(ord.email || "")
          .trim()
          .toLowerCase();
        const ordPhone = String(ord.phone || "").trim();
        return (
          (Boolean(cleanEmail) && ordEmail === cleanEmail) ||
          (Boolean(cleanPhone) && ordPhone === cleanPhone)
        );
      });
      setUserOrders(matchingLocal);
    } catch {
      setUserOrders([]);
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const isValidBdPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, "");
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(cleaned);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const syncUserToBackend = async (profile: CustomerProfile) => {
    if (!profile.email || !profile.verified) return;
    const activeTimestamp = profile.lastActiveAt || new Date().toISOString();
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          district: profile.district,
          address: profile.address,
          provider: profile.provider || "email",
          verified: true,
          lastActiveAt: activeTimestamp,
        }),
      });
    } catch (err) {
      console.error("Failed to sync user to /api/users:", err);
    }
  };

  const persistCustomerProfile = (profile: CustomerProfile) => {
    if (!profile.email || !profile.verified) return;

    const stampedProfile: CustomerProfile = {
      ...profile,
      lastActiveAt: new Date().toISOString(),
    };

    setCustomerUser(stampedProfile);
    setCustomerName(stampedProfile.name || "");
    setProfileNameInput(stampedProfile.name || "");
    if (stampedProfile.phone) {
      setCustomerPhone(stampedProfile.phone);
      setProfilePhoneInput(stampedProfile.phone);
    }
    if (stampedProfile.district) {
      setCustomerDistrict(stampedProfile.district);
      setProfileDistrictInput(stampedProfile.district);
      setDeliveryLocation(stampedProfile.district);
      setDeliveryZone(
        stampedProfile.district.toLowerCase().includes("mymensingh")
          ? "mymensingh"
          : "outside"
      );
    }
    if (stampedProfile.address) {
      setCustomerAddress(stampedProfile.address);
      setProfileAddressInput(stampedProfile.address);
    }

    try {
      if (rememberMe) {
        localStorage.setItem("maveron_user", JSON.stringify(stampedProfile));
      } else {
        sessionStorage.setItem("maveron_user", JSON.stringify(stampedProfile));
        localStorage.removeItem("maveron_user");
      }

      const rawList = localStorage.getItem("maveron_registered_accounts");
      const existingList: CustomerProfile[] = rawList ? JSON.parse(rawList) : [];
      const filtered = existingList.filter(
        (acc) =>
          (acc.email || "").trim().toLowerCase() !==
          stampedProfile.email!.trim().toLowerCase()
      );
      localStorage.setItem(
        "maveron_registered_accounts",
        JSON.stringify([stampedProfile, ...filtered])
      );
    } catch (err) {
      console.error("Failed to save user:", err);
    }

    appendTimelineEvent("user_session", {
      email: stampedProfile.email,
      provider: stampedProfile.provider || "email",
      lastActiveAt: stampedProfile.lastActiveAt,
    });

    void syncUserToBackend(stampedProfile);
    void loadAccountOrders(stampedProfile);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_success") !== "google") return;

    let cancelled = false;

    const finishGoogleLogin = async () => {
      const paramEmail = (params.get("email") || "").trim().toLowerCase();
      const paramName = (params.get("name") || "").trim();

      const cleanUrl = () => {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete("auth_success");
        nextUrl.searchParams.delete("email");
        nextUrl.searchParams.delete("name");
        window.history.replaceState({}, "", nextUrl.pathname + nextUrl.search);
      };

      if (paramEmail && isValidEmail(paramEmail)) {
        if (cancelled) return;
        persistCustomerProfile({
          name: paramName || paramEmail.split("@")[0] || `${BRAND_NAME} Member`,
          email: paramEmail,
          district: customerDistrict || "Mymensingh",
          address: customerAddress || "",
          provider: "google",
          verified: true,
        });
        cleanUrl();
        setIsAccountModalOpen(false);
        setActiveBottomTab("home");
        notify(
          lang === "bn"
            ? "Google দিয়ে লগইন সফল হয়েছে!"
            : "Signed in with Google!"
        );
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const u = data?.user;
          if (!cancelled && u?.email) {
            persistCustomerProfile({
              name:
                String(u.name || "").trim() ||
                String(u.email).split("@")[0] ||
                `${BRAND_NAME} Member`,
              email: String(u.email).trim().toLowerCase(),
              district: String(u.district || customerDistrict || "Mymensingh"),
              address: String(u.address || customerAddress || ""),
              provider: "google",
              verified: true,
            });
            cleanUrl();
            setIsAccountModalOpen(false);
            setActiveBottomTab("home");
            notify(
              lang === "bn"
                ? "Google দিয়ে লগইন সফল হয়েছে!"
                : "Signed in with Google!"
            );
            return;
          }
        }
      } catch {
        // ignore if /api/auth/me is not present
      }

      if (!cancelled) {
        cleanUrl();
        setAuthMode("login");
        setIsAccountModalOpen(true);
        setLoginError(
          lang === "bn"
            ? "Google কলব্যাক থেকে ইউজার তথ্য পাওয়া যায়নি।"
            : "Google callback returned without user session data."
        );
      }
    };

    void finishGoogleLogin();
    return () => {
      cancelled = true;
    };
  }, [lang, customerDistrict, customerAddress]);

  const openAccountModal = () => {
    setLoginError("");
    setForgotNotice("");
    setAccountSavedNotice("");
    setAccountSection("menu");
    setAuthMode("login");
    setLoginIdentifier(customerUser?.email || "");
    setLoginPassword("");
    if (customerUser) {
      setProfileNameInput(customerUser.name || "");
      setProfilePhoneInput(customerUser.phone || customerPhone || "");
      setProfileDistrictInput(
        customerUser.district || customerDistrict || "Mymensingh"
      );
      setProfileAddressInput(customerUser.address || customerAddress || "");
      void loadAccountOrders(customerUser);
    }
    setActiveBottomTab("account");
    setIsAccountModalOpen(true);
  };

  const handleSaveAccountProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser) return;
    const updated: CustomerProfile = {
      ...customerUser,
      name: profileNameInput.trim() || customerUser.name,
      phone: profilePhoneInput.trim(),
      district: profileDistrictInput.trim() || "Mymensingh",
      address: profileAddressInput.trim(),
    };
    persistCustomerProfile(updated);
    setAccountSavedNotice(
      lang === "bn"
        ? "প্রোফাইল ও ঠিকানা সফলভাবে সংরক্ষিত হয়েছে।"
        : "Profile & address details saved successfully."
    );
    notify(
      lang === "bn" ? "অ্যাকাউন্ট তথ্য আপডেট হয়েছে" : "Account details updated"
    );
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const idVal = loginIdentifier.trim().toLowerCase();
    if (!idVal || !loginPassword.trim()) {
      setLoginError(
        lang === "bn"
          ? "আপনার ইমেইল এবং পাসওয়ার্ড দিন।"
          : "Please enter your email address and password."
      );
      return;
    }

    if (!isValidEmail(idVal)) {
      setLoginError(
        lang === "bn"
          ? "সঠিক ইমেইল ঠিকানা দিন।"
          : "Please enter a valid email address."
      );
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: idVal, password: loginPassword }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setLoginError(
          lang === "bn"
            ? "সার্ভারে /api/auth/login রাউট পাওয়া যায়নি।"
            : "Login service (/api/auth/login) is not configured yet."
        );
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success || !data.user?.email) {
        setLoginError(
          data.message ||
            (lang === "bn"
              ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।"
              : "Invalid email or password.")
        );
        return;
      }

      persistCustomerProfile({
        name:
          String(data.user.name || "").trim() ||
          idVal.split("@")[0] ||
          `${BRAND_NAME} Member`,
        email: String(data.user.email).trim().toLowerCase(),
        phone: String(data.user.phone || ""),
        district: String(data.user.district || customerDistrict || "Mymensingh"),
        address: String(data.user.address || customerAddress || ""),
        provider: "email",
        verified: true,
      });

      setLoginPassword("");
      setAccountSection("menu");
      notify(
        lang === "bn"
          ? `${BRAND_NAME}-এ লগইন সফল হয়েছে!`
          : `Signed in to ${BRAND_NAME}!`
      );
    } catch {
      setLoginError(
        lang === "bn"
          ? "লগইন সার্ভারে সংযোগ করা যায়নি। আবার চেষ্টা করুন।"
          : "Could not reach login service. Please try again."
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = (isRegister = false) => {
    const nextPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    const modeQuery = isRegister ? "&mode=register" : "&mode=login";
    window.location.href = `/api/auth/google?next=${encodeURIComponent(
      nextPath
    )}${modeQuery}`;
  };

  const handleFacebookAuth = (isRegister = false) => {
    const nextPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    const modeQuery = isRegister ? "&mode=register" : "&mode=login";
    window.location.href = `/api/auth/facebook?next=${encodeURIComponent(
      nextPath
    )}${modeQuery}`;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setForgotNotice("");

    const cleanEmail = forgotIdentifier.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setLoginError(
        lang === "bn"
          ? "সঠিক ইমেইল ঠিকানা দিন।"
          : "Please enter a valid email address."
      );
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok || !data.success) {
          setLoginError(
            data.message ||
              (lang === "bn"
                ? "রিসেট রিকোয়েস্ট পাঠানো যায়নি।"
                : "Could not send password reset request.")
          );
          return;
        }
      }

      setForgotNotice(
        lang === "bn"
          ? `${cleanEmail}-এ পাসওয়ার্ড রিসেট নির্দেশনা পাঠানো হয়েছে।`
          : `Password reset instructions sent to ${cleanEmail}.`
      );
    } catch {
      setLoginError(
        lang === "bn" ? "নেটওয়ার্ক সমস্যা হয়েছে।" : "Network error occurred."
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setLoginError(
        lang === "bn"
          ? "নাম, ইমেইল এবং পাসওয়ার্ড পূরণ করুন।"
          : "Please fill in your name, email address, and password."
      );
      return;
    }

    if (!isValidEmail(regEmail)) {
      setLoginError(
        lang === "bn"
          ? "সঠিক ইমেইল ঠিকানা দিন।"
          : "Please enter a valid email address."
      );
      return;
    }

    if (regPassword.length < 6) {
      setLoginError(
        lang === "bn"
          ? "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLoginError(
        lang === "bn"
          ? "Password এবং Confirm Password মিলছে না।"
          : "Password and Confirm Password do not match."
      );
      return;
    }

    if (!agreeTerms) {
      setLoginError(
        lang === "bn"
          ? "Terms & Conditions-এ সম্মতি দিন।"
          : "Please agree to the Terms & Conditions."
      );
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanName = regName.trim();

    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: regPassword,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setLoginError(
          lang === "bn"
            ? "সার্ভারে /api/auth/register রাউট পাওয়া যায়নি।"
            : "Registration service (/api/auth/register) is not configured yet."
        );
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(
          data.message ||
            (lang === "bn"
              ? "অ্যাকাউন্ট তৈরি করা যায়নি।"
              : "Could not create account.")
        );
        return;
      }

      persistCustomerProfile({
        name: String(data.user?.name || cleanName),
        email: cleanEmail,
        district: customerDistrict || "Mymensingh",
        address: customerAddress || "",
        provider: "email",
        verified: true,
      });

      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setAccountSection("menu");
      notify(
        lang === "bn"
          ? "পাসওয়ার্ড সেট হয়ে অ্যাকাউন্ট তৈরি ও লগইন সম্পন্ন হয়েছে!"
          : "Password created! Account registered and signed in."
      );
    } catch {
      setLoginError(
        lang === "bn"
          ? "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।"
          : "Network error while creating account."
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    setAccountSection("menu");
    setUserOrders([]);
    try {
      localStorage.removeItem("maveron_user");
      sessionStorage.removeItem("maveron_user");
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
    notify(
      lang === "bn" ? "সাইন আউট সম্পন্ন হয়েছে" : "Signed out of your account"
    );
  };

  const handleSelectLocation = (loc: (typeof DELIVERY_LOCATIONS)[number]) => {
    setDeliveryLocation(loc.label);
    setCustomerDistrict(loc.district);
    setDeliveryZone(loc.zone);
    setIsLocationModalOpen(false);
    notify(
      lang === "bn"
        ? `ডেলিভারি লোকেশন ${loc.label} সেট করা হয়েছে`
        : `Delivery location set to ${loc.label}`
    );
  };

  // Updated to upload review photo to Cloudinary via /api/upload instead of raw base64
  const handleReviewPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify(
        lang === "bn"
          ? "দয়া করে বৈধ ছবি ফাইল সিলেক্ট করুন।"
          : "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify(
        lang === "bn"
          ? "ছবির সাইজ ৫ MB-এর কম হতে হবে।"
          : "Photo size must be under 5 MB."
      );
      return;
    }

    setUploadingReviewPhoto(true);
    try {
      const uploadedUrl = await uploadImageToCloudinaryRoute(
        file,
        "maveron/reviews"
      );
      setReviewPhoto(uploadedUrl);
      notify(
        lang === "bn"
          ? "রিভিউ ছবি ক্লাউডে আপলোড হয়েছে!"
          : "Review photo uploaded!"
      );
    } catch (err) {
      console.error("Review photo upload error:", err);
      notify(
        lang === "bn"
          ? "ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          : "Could not upload photo. Please try again."
      );
    } finally {
      setUploadingReviewPhoto(false);
      e.target.value = "";
    }
  };

  const handleAddSimpleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;

    const nowIso = new Date().toISOString();
    const payload = {
      productId: products[0]?.id,
      name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewText.trim(),
      photo: reviewPhoto || undefined,
      createdAt: nowIso,
    };

    let savedItem: SimpleReview = {
      id: `r-${Date.now()}`,
      ...payload,
      status: "approved",
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.review) {
        savedItem = {
          id: String(data.review.id || data.review._id || savedItem.id),
          productId: data.review.productId || payload.productId,
          name: String(data.review.name || payload.name),
          rating: Number(data.review.rating) || payload.rating,
          comment: String(data.review.comment || payload.comment),
          photo: data.review.photo || payload.photo,
          status: String(data.review.status || "approved"),
          createdAt: String(data.review.createdAt || nowIso),
        };
      }
    } catch (err) {
      console.error("Failed to post review to API:", err);
    }

    const updated = sanitizeAuthenticReviews([savedItem, ...reviews], false);
    setReviews(updated);
    try {
      localStorage.setItem("maveron_simple_reviews", JSON.stringify(updated));
    } catch {
      notify(
        lang === "bn"
          ? "ব্রাউজার স্টোরেজে সেভ করা যায়নি।"
          : "Could not save review in browser storage."
      );
    }

    appendTimelineEvent("review_submitted", {
      reviewId: savedItem.id,
      reviewer: savedItem.name,
      rating: savedItem.rating,
      createdAt: nowIso,
    });

    setReviewName("");
    setReviewText("");
    setReviewRating(5);
    setReviewPhoto("");
    notify(
      lang === "bn"
        ? "রিভিউ পোস্ট ও সেভ হয়েছে!"
        : "Review posted & synced!"
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      const next = exists
        ? prev.filter((item) => item !== product.id)
        : [...prev, product.id];
      notify(
        exists
          ? lang === "bn"
            ? `"${product.name}" উইশলিস্ট থেকে সরানো হয়েছে`
            : `Removed "${product.name}" from wishlist`
          : lang === "bn"
          ? `"${product.name}" উইশলিস্টে সেভ হয়েছে`
          : `Saved "${product.name}" to wishlist`
      );
      return next;
    });
  };

  const flashSaleCount = useMemo(() => {
    return products.filter((p) => isFlashSaleProduct(p)).length;
  }, [products]);

  const inProgressOrdersCount = useMemo(() => {
    return userOrders.filter((ord) => {
      const st = String(ord.status || "Pending").toLowerCase();
      return st !== "delivered" && st !== "cancelled";
    }).length;
  }, [userOrders]);

  const relatedProducts = useMemo(() => {
    if (!quickViewProduct) {
      return products.slice(0, 4);
    }
    const sameCat = products.filter(
      (item) =>
        item.id !== quickViewProduct.id &&
        item.subCategory === quickViewProduct.subCategory
    );
    if (sameCat.length > 0) return sameCat.slice(0, 3);
    return products
      .filter((item) => item.id !== quickViewProduct.id)
      .slice(0, 3);
  }, [quickViewProduct, products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      if (flashSaleOnly && !isFlashSaleProduct(p)) return false;

      const matchesSub =
        selectedSubCategory === "all" ||
        canonicalCategoryLabel(p.subCategory).toLowerCase() ===
          canonicalCategoryLabel(selectedSubCategory).toLowerCase();

      const matchesCat =
        selectedSubCategory !== "all"
          ? true
          : selectedCategory === "all" || p.category === selectedCategory;

      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.specs && p.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSub && matchesSearch;
    });

    const sorted = [...list];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      sorted.sort((a, b) => {
        const dA =
          getDiscountPercent(a.price, a.oldPrice) ||
          a.flashSale?.discountPercent ||
          0;
        const dB =
          getDiscountPercent(b.price, b.oldPrice) ||
          b.flashSale?.discountPercent ||
          0;
        return dB - dA;
      });
    }
    return sorted;
  }, [
    products,
    showWishlistOnly,
    wishlist,
    flashSaleOnly,
    selectedCategory,
    selectedSubCategory,
    searchQuery,
    sortBy,
  ]);

  const addToCart = (product: Product, openDrawer = true) => {
    if (typeof product.stock === "number" && product.stock <= 0) {
      notify(
        lang === "bn"
          ? `"${product.name}" বর্তমানে স্টকে নেই`
          : `"${product.name}" is currently out of stock`
      );
      return;
    }

    const chosenSize =
      product.category === "fashion" && product.sizes && product.sizes.length > 0
        ? selectedSizes[product.id] || product.sizes[0]
        : undefined;
    const chosenColor =
      product.colors && product.colors.length > 0
        ? selectedColors[product.id] || product.colors[0]
        : undefined;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedOption === chosenSize &&
          item.selectedColor === chosenColor
      );
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (
          typeof product.stock === "number" &&
          currentQty + 1 > product.stock
        ) {
          notify(
            lang === "bn"
              ? `"${product.name}"-এর সর্বোচ্চ স্টক (${product.stock}টি) পর্যন্ত নেওয়া যাবে`
              : `Maximum available stock (${product.stock}) reached for "${product.name}"`
          );
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedOption: chosenSize,
          selectedColor: chosenColor,
        },
      ];
    });

    setOrderError("");
    setOrderSuccess(false);
    notify(
      lang === "bn"
        ? `"${product.name}" কার্টে যোগ হয়েছে`
        : `Added "${product.name}" to bag`
    );
    if (openDrawer) {
      setIsCartOpen(true);
      setActiveBottomTab("cart");
      appendTimelineEvent("checkout_started", {
        productId: product.id,
        checkoutAt: new Date().toISOString(),
      });
    }
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          const nextQty = item.quantity + delta;
          if (
            delta > 0 &&
            typeof item.product.stock === "number" &&
            nextQty > item.product.stock
          ) {
            notify(
              lang === "bn"
                ? `"${item.product.name}"-এর স্টক সীমা ${item.product.stock}টি`
                : `Stock limit is ${item.product.stock} for "${item.product.name}"`
            );
            return item;
          }
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const isFreeDeliveryUnlocked =
    cart.length > 0 &&
    deliveryConfig.freeThreshold > 0 &&
    subtotal >= deliveryConfig.freeThreshold;

  const deliveryCharge =
    cart.length === 0
      ? 0
      : isFreeDeliveryUnlocked
      ? 0
      : deliveryZone === "mymensingh"
      ? deliveryConfig.insideMymensingh
      : deliveryConfig.outsideMymensingh;

  const grandTotal = subtotal + deliveryCharge;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const advancePayableNow = deliveryCharge;
  const codDueAtDelivery = subtotal;

  const isMobileWalletPayment =
    paymentMethod === "bKash" ||
    paymentMethod === "Nagad" ||
    paymentMethod === "Rocket";

  const activeWalletNumber =
    paymentMethod === "bKash"
      ? deliveryConfig.bkashNumber || "01782141520"
      : paymentMethod === "Nagad"
      ? deliveryConfig.nagadNumber || "01782141520"
      : deliveryConfig.rocketNumber || "015339196489";

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticatedCustomer) {
      setOrderError(
        lang === "bn"
          ? "ফেক অর্ডার রোধে অর্ডার করার আগে লগইন বা সাইন আপ করুন।"
          : "Please login or sign up before placing an order to prevent fake orders."
      );
      openAccountModal();
      return;
    }

    if (!customerName || !customerPhone || !customerAddress || cart.length === 0)
      return;

    if (!isValidBdPhone(customerPhone)) {
      setOrderError(
        lang === "bn"
          ? "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।"
          : "Please enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX)."
      );
      return;
    }

    if (advancePayableNow > 0) {
      if (!senderNumber.trim() || !trxId.trim()) {
        setOrderError(
          lang === "bn"
            ? `ডেলিভারি চার্জ (৳${advancePayableNow}) পেমেন্টের সেন্ডার নম্বর এবং TrxID দিন।`
            : `Please enter your sender number and Transaction ID (TrxID) for the ৳${advancePayableNow} delivery charge payment.`
        );
        return;
      }
    }

    setSubmittingOrder(true);
    setOrderError("");

    try {
      const nowIso = new Date().toISOString();
      const zoneLabel = isFreeDeliveryUnlocked
        ? "Free Delivery"
        : deliveryZone === "mymensingh"
        ? `Inside Mymensingh - ৳${deliveryConfig.insideMymensingh}`
        : `Outside Mymensingh - ৳${deliveryConfig.outsideMymensingh}`;

      const walletMethodLabel =
        paymentMethod === "Cash on Delivery"
          ? "bKash / Nagad / Rocket (Delivery Charge Advance)"
          : paymentMethod;

      const paymentSegment =
        advancePayableNow > 0
          ? `Payment: Partial COD (${walletMethodLabel}) | Advance Paid: ৳${advancePayableNow} | COD Due: ৳${codDueAtDelivery} | From: ${senderNumber.trim()} | TrxID: ${trxId.trim()}`
          : `Payment: Cash on Delivery (COD Due: ৳${codDueAtDelivery})`;

      const fullAddress = `${customerAddress.trim()}, ${customerDistrict.trim()} (${zoneLabel}) • ${paymentSegment}${
        orderNotes.trim() ? ` • Note: ${orderNotes.trim()}` : ""
      }`;

      const cleanEmail = (customerUser?.email || "").trim().toLowerCase();

      const orderPayload = {
        customerName: customerName.trim(),
        email: cleanEmail,
        phone: customerPhone.trim(),
        district: customerDistrict.trim(),
        address: fullAddress,
        paymentType: "partial_cod",
        paymentMethod,
        subtotalAmount: subtotal,
        deliveryCharge,
        advancePaidAmount: advancePayableNow,
        codDueAmount: codDueAtDelivery,
        advanceSenderNumber: advancePayableNow > 0 ? senderNumber.trim() : "",
        advanceTrxId: advancePayableNow > 0 ? trxId.trim() : "",
        createdAt: nowIso,
        checkoutAt: nowIso,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedOption || "",
          color: item.selectedColor || "",
          image: getImageForColor(item.product, item.selectedColor),
        })),
        totalAmount: grandTotal,
        status: "Pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      const generatedId =
        data.order?._id ||
        data.orderId ||
        `MVR-${Date.now().toString().slice(-6)}`;

      const createdRecord: UserOrderRecord = {
        _id: String(generatedId),
        orderId: String(data.order?.orderId || generatedId),
        customerName: customerName.trim(),
        email: cleanEmail,
        phone: customerPhone.trim(),
        address: fullAddress,
        totalAmount: grandTotal,
        status: "Pending",
        createdAt: String(data.order?.createdAt || nowIso),
        checkoutAt: nowIso,
        items: cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      setUserOrders((prev) => {
        const next = [createdRecord, ...prev];
        try {
          localStorage.setItem("maveron_my_orders", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      appendTimelineEvent("order_placed", {
        orderId: createdRecord.orderId || createdRecord._id,
        totalAmount: grandTotal,
        createdAt: createdRecord.createdAt,
        checkoutAt: nowIso,
      });

      setConfirmedOrderId(String(generatedId));
      setCart([]);
      setSenderNumber("");
      setTrxId("");
      setOrderNotes("");
      setOrderSuccess(true);
      notify(
        lang === "bn"
          ? `${BRAND_NAME}-এ অর্ডার সফলভাবে সম্পন্ন হয়েছে!`
          : `Order placed with ${BRAND_NAME}!`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not place order. Please try again.";
      setOrderError(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const jumpToCatalog = (opts?: {
    cat?: "all" | "fashion" | "gadget";
    sub?: string;
    sort?: SortOption;
    wishlistOnly?: boolean;
    flashOnly?: boolean;
    scrollToId?: string;
  }) => {
    setSelectedCategory(opts?.cat ?? "all");
    setSelectedSubCategory(opts?.sub ?? "all");
    setSortBy(opts?.sort ?? "featured");
    setShowWishlistOnly(opts?.wishlistOnly ?? false);
    setFlashSaleOnly(opts?.flashOnly ?? false);
    setMobileMenuOpen(false);
    const targetId = opts?.scrollToId || "catalog-section";
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
    } catch {
      // ignore network error
    }
    setNewsletterStatus(
      lang === "bn"
        ? `সাবস্ক্রাইব সম্পন্ন হয়েছে! ${BRAND_NAME}-এর নতুন কালেকশন ও অফারের আপডেট পাবেন।`
        : `Subscribed! You will receive ${BRAND_NAME} updates on new arrivals and offers.`
    );
    setNewsletterEmail("");
  };

  const isFilteredCollectionView =
    showWishlistOnly ||
    flashSaleOnly ||
    selectedSubCategory !== "all" ||
    selectedCategory !== "all" ||
    searchQuery.trim().length > 0;

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen pb-24 lg:pb-20 ${t.pageBg}`}
    >
      {/* Toast Notification */}
      {isMounted && toastMessage && (
        <div
          className={`fixed bottom-24 lg:bottom-20 left-1/2 -translate-x-1/2 z-[60] text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg ${
            isLight
              ? "bg-[#18181B] text-white border border-zinc-700"
              : "bg-[#18181B] text-[#F4F4F5] border border-zinc-600/70"
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Clean Single-Row Sticky Navigation Bar */}
      <header
        suppressHydrationWarning
        className={`sticky top-0 z-30 ${t.headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-15 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className={`lg:hidden p-1.5 sm:p-2 rounded-lg cursor-pointer shrink-0 ${
                isLight
                  ? "hover:bg-zinc-100 text-zinc-900"
                  : "hover:bg-zinc-900 text-zinc-200"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveBottomTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
            >
              <img
                src={LOGO_SRC}
                alt={BRAND_NAME}
                className="h-7 sm:h-9 w-auto max-w-[36px] sm:max-w-none object-contain rounded-md shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span
                suppressHydrationWarning
                className={`font-black text-sm sm:text-xl tracking-wider whitespace-nowrap ${t.headingGradient}`}
              >
                {BRAND_NAME}
              </span>
            </a>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsLocationModalOpen(true)}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${t.pillBtn}`}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${t.mutedText}`} />
              <span suppressHydrationWarning>
                {isMounted && lang === "bn"
                  ? `ডেলিভারি: ${deliveryLocation}`
                  : `Deliver to ${deliveryLocation}`}
              </span>
            </button>
          </div>

          {/* Right Side: Search + Light/Night Mode + Language Switch */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setSearchOverlayOpen(true)}
              aria-label="Open Search Overlay"
              className={`w-8 h-8 sm:w-auto sm:h-10 sm:px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${t.pillBtn}`}
            >
              <Search
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${t.mutedText}`}
              />
              <span suppressHydrationWarning className="hidden md:inline">
                {isMounted && lang === "bn" ? "সার্চ" : "Search"}
              </span>
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={toggleThemeMode}
              aria-label="Toggle Light or Night Mode"
              title={
                isLight ? "Switch to Night Mode" : "Switch to Light Mode"
              }
              className={`h-8 sm:h-10 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${t.pillBtn}`}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span suppressHydrationWarning className="hidden sm:inline">
                    {isMounted && lang === "bn" ? "নাইট" : "Night"}
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                  <span suppressHydrationWarning className="hidden sm:inline">
                    {isMounted && lang === "bn" ? "লাইট" : "Light"}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={toggleLanguage}
              title="Switch Language (English / বাংলা)"
              className={`h-8 sm:h-10 px-2 sm:px-3.5 rounded-full flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${t.pillBtn}`}
            >
              <Globe className={`w-3.5 h-3.5 shrink-0 ${t.mutedText}`} />
              <span suppressHydrationWarning>
                {isMounted && lang === "bn" ? "EN" : "বাংলা"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMounted && mobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-4 py-4 space-y-3 ${
              isLight
                ? "bg-white border-zinc-200"
                : "bg-[#111115] border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${t.pillBtn}`}
              >
                <MapPin className={`w-3.5 h-3.5 ${t.mutedText}`} />
                <span>
                  {lang === "bn"
                    ? `ডেলিভারি: ${deliveryLocation}`
                    : `Deliver to ${deliveryLocation}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  jumpToCatalog({ wishlistOnly: !showWishlistOnly });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${t.pillBtn}`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {lang === "bn" ? "উইশলিস্ট" : "Wishlist"} ({wishlist.length})
                </span>
              </button>
            </div>

            <div
              className={`flex flex-col gap-1.5 text-sm font-medium ${t.bodyText}`}
            >
              {STORE_CATEGORIES.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => jumpToCatalog({ sub: catName })}
                  className={`text-left py-1.5 cursor-pointer ${
                    isLight ? "hover:text-zinc-950" : "hover:text-white"
                  }`}
                >
                  {catLabelText(catName)}
                </button>
              ))}
              <Link
                href="/track-order"
                onClick={() => {
                  rememberCurrentScroll();
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 font-semibold block ${t.titleText}`}
              >
                {lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Order"}
              </Link>
              <Link
                href="/policies"
                onClick={() => {
                  rememberCurrentScroll();
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 block ${t.mutedText}`}
              >
                {lang === "bn"
                  ? "রিটার্ন, এক্সচেঞ্জ ও ডেলিভারি পলিসি"
                  : "Return, Exchange & Delivery Policy"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modern Search Overlay */}
      {isMounted && searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center">
          <div
            className={`max-w-2xl w-full rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 ${t.surface}`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isLight ? "border-zinc-200" : "border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1">
                <Search className={`w-5 h-5 ${t.mutedText}`} />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "ফ্যাশন, জুতা, বিউটি বা গ্যাজেট খুঁজুন..."
                      : "Search fashion, footwear, beauty, gadgets..."
                  }
                  className={`w-full text-sm sm:text-base outline-none bg-transparent ${t.titleText}`}
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(false)}
                className={`p-2 rounded-full cursor-pointer ${t.pillBtn}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {searchQuery.trim() && (
              <div
                className={`max-h-72 overflow-y-auto divide-y ${
                  isLight ? "divide-zinc-200" : "divide-zinc-800"
                }`}
              >
                {filteredProducts.slice(0, 6).map((item) => (
                  <Link
                    key={`sr-${item.id}`}
                    href={`/products/${item.id}`}
                    onClick={() => {
                      rememberCurrentScroll();
                      setSearchOverlayOpen(false);
                    }}
                    className={`py-2.5 flex items-center justify-between gap-3 px-2 rounded-xl ${
                      isLight ? "hover:bg-zinc-100" : "hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${t.titleText}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${t.mutedText}`}>
                          {catLabelText(item.subCategory)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-extrabold shrink-0 ${t.bodyText}`}
                    >
                      ৳{item.price}
                    </span>
                  </Link>
                ))}
                {filteredProducts.length === 0 && (
                  <p className={`py-6 text-center text-xs ${t.mutedText}`}>
                    {lang === "bn"
                      ? "কোনো প্রোডাক্ট পাওয়া যায়নি।"
                      : "No matching products found."}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearchOverlayOpen(false);
                  jumpToCatalog();
                }}
                className={`text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer ${t.silverCta}`}
              >
                {lang === "bn" ? "ক্যাটালগে দেখুন" : "View in Catalog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Hero Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-8">
        <div
          suppressHydrationWarning
          className={`relative w-full h-[210px] sm:h-[280px] md:h-[340px] lg:h-[390px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border ${
            isLight
              ? "bg-[#09090B] border-zinc-300"
              : "bg-[#09090B] border-zinc-800"
          }`}
        >
          <img
            src={HERO_BANNER_SRC}
            alt="MAVÉRON Hero Banner"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGIN_SILK_BG_SRC;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/10 pointer-events-none" />

          <div className="absolute bottom-3.5 left-4 sm:bottom-6 sm:left-8 md:left-10 z-10">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => jumpToCatalog({ cat: "all", sub: "all" })}
              className="inline-flex items-center gap-1.5 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 hover:brightness-105 active:scale-[0.99] text-zinc-950 text-xs sm:text-sm font-extrabold px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full shadow-lg border border-white/60 transition cursor-pointer"
            >
              <span suppressHydrationWarning>
                {isMounted && lang === "bn" ? "এখনই কিনুন" : "Shop Now"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-10">
        <div
          suppressHydrationWarning
          className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${t.surface}`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              suppressHydrationWarning
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLight
                  ? "bg-zinc-900 text-white"
                  : "bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-950"
              }`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  suppressHydrationWarning
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isLight
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-200 text-zinc-950"
                  }`}
                >
                  {isMounted && lang === "bn" ? "ফ্ল্যাশ সেল" : "Flash Sale"}
                </span>
                <span suppressHydrationWarning className={`text-xs ${t.mutedText}`}>
                  {isMounted
                    ? lang === "bn"
                      ? `${flashSaleCount}টি ডিসকাউন্টেড প্রোডাক্ট রয়েছে`
                      : `${flashSaleCount} discounted items available`
                    : "0 discounted items available"}
                </span>
              </div>
              <h2
                suppressHydrationWarning
                className={`text-sm sm:text-lg font-bold mt-0.5 ${t.titleText}`}
              >
                {isMounted && lang === "bn"
                  ? "বিশেষ ছাড়ে ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেটস ও মোবাইল অ্যাক্সেসরিজ অফার"
                  : "Special Discounts on Fashion, Footwear, Beauty, Gadgets & Mobile Accessories"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              const nextFlash = !flashSaleOnly;
              setFlashSaleOnly(nextFlash);
              if (nextFlash) {
                setShowWishlistOnly(false);
                setSortBy("discount");
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              isMounted && flashSaleOnly ? t.chipActive : t.pillBtn
            }`}
          >
            {isMounted && flashSaleOnly
              ? lang === "bn"
                ? "সব প্রোডাক্ট দেখুন"
                : "Show All Products"
              : isMounted && lang === "bn"
              ? "অফার প্রোডাক্ট দেখুন"
              : "View Offer Products"}
          </button>
        </div>
      </section>

      {/* Attractive Category Cards */}
      <section
        id="categories-section"
        className="max-w-7xl mx-auto px-3 sm:px-4 pb-12"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className={`text-[11px] font-bold uppercase tracking-widest ${t.mutedText}`}
            >
              {BRAND_NAME} Collections
            </p>
            <h2
              suppressHydrationWarning
              className={`text-xl sm:text-2xl font-bold tracking-tight ${t.titleText}`}
            >
              {isMounted && lang === "bn"
                ? "ক্যাটাগরি অনুযায়ী কিনুন"
                : "Shop by Category"}
            </h2>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => jumpToCatalog({ cat: "all", sub: "all" })}
            className={`text-xs sm:text-sm font-semibold cursor-pointer ${t.bodyText} ${
              isLight ? "hover:text-zinc-950" : "hover:text-white"
            }`}
          >
            {isMounted && lang === "bn" ? "সব দেখুন →" : "View All →"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURED_CATEGORIES.map((catItem) => {
            const count = isMounted
              ? products.filter(
                  (p) =>
                    canonicalCategoryLabel(p.subCategory).toLowerCase() ===
                    catItem.subFilter.toLowerCase()
                ).length
              : 0;
            const isSelected =
              isMounted && selectedSubCategory === catItem.subFilter;

            return (
              <button
                key={catItem.title}
                type="button"
                suppressHydrationWarning
                onClick={() =>
                  jumpToCatalog({
                    cat: catItem.filterKey,
                    sub: isSelected ? "all" : catItem.subFilter,
                  })
                }
                className={`group text-left rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                  t.surface
                } ${
                  isSelected
                    ? isLight
                      ? "border-zinc-900 ring-2 ring-zinc-900/20"
                      : "border-zinc-200 ring-2 ring-zinc-300/40"
                    : isLight
                    ? "hover:border-zinc-400 hover:-translate-y-0.5"
                    : "hover:border-zinc-500 hover:-translate-y-0.5"
                }`}
              >
                <div className="relative h-28 sm:h-32 w-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                  <img
                    src={catItem.image}
                    alt={catItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span
                    suppressHydrationWarning
                    className={`absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                      isLight
                        ? "bg-white/90 text-zinc-900 border border-zinc-200"
                        : "bg-black/80 text-zinc-100 border border-zinc-700"
                    }`}
                  >
                    {count} {isMounted && lang === "bn" ? "আইটেম" : "Items"}
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      suppressHydrationWarning
                      className={`text-xs sm:text-sm font-extrabold truncate ${t.titleText}`}
                    >
                      {catLabelText(catItem.title)}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${t.mutedText}`}>
                      {catItem.subtitle}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform ${t.mutedText}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Enhanced Product Cards + Catalog Controls */}
      <section
        id="catalog-section"
        className="max-w-7xl mx-auto px-3 sm:px-4 pb-14"
      >
        <div
          suppressHydrationWarning
          className={`rounded-3xl p-3.5 sm:p-6 mb-7 space-y-3.5 ${t.surface}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2
                suppressHydrationWarning
                className={`text-lg sm:text-2xl font-bold tracking-tight mr-1.5 ${t.titleText}`}
              >
                {isMounted && showWishlistOnly
                  ? lang === "bn"
                    ? "সেভ করা উইশলিস্ট"
                    : "Saved Wishlist"
                  : isMounted && flashSaleOnly
                  ? lang === "bn"
                    ? "ফ্ল্যাশ সেল অফার"
                    : "Flash Sale Deals"
                  : isMounted && selectedSubCategory !== "all"
                  ? catLabelText(selectedSubCategory)
                  : isMounted && lang === "bn"
                  ? "ফিচার্ড কালেকশন"
                  : "Featured Collection"}
              </h2>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setShowWishlistOnly(false);
                  setFlashSaleOnly(false);
                  setSelectedCategory("all");
                  setSelectedSubCategory("all");
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide border transition cursor-pointer ${
                  !showWishlistOnly &&
                  !flashSaleOnly &&
                  selectedSubCategory === "all" &&
                  selectedCategory === "all"
                    ? t.chipActive
                    : t.chipIdle
                }`}
              >
                {isMounted && lang === "bn" ? "সব" : "ALL"}
              </button>

              {STORE_CATEGORIES.map((catLabel) => {
                const isCatSelected =
                  isMounted &&
                  !showWishlistOnly &&
                  !flashSaleOnly &&
                  selectedSubCategory === catLabel;
                return (
                  <button
                    key={catLabel}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      setShowWishlistOnly(false);
                      setFlashSaleOnly(false);
                      setSelectedSubCategory(catLabel);
                      setSelectedCategory(normalizeCategory(catLabel));
                    }}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide border transition cursor-pointer ${
                      isCatSelected ? t.chipActive : t.chipIdle
                    }`}
                  >
                    {catLabelText(catLabel)}
                  </button>
                );
              })}
            </div>

            {/* Mobile-safe Sort + Grid/List row */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
              <select
                value={sortBy}
                suppressHydrationWarning
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className={`flex-1 sm:flex-initial min-w-0 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium outline-none cursor-pointer ${t.input}`}
              >
                <option value="featured">
                  {isMounted && lang === "bn"
                    ? "সাজান: ফিচার্ড"
                    : "Sort: Featured"}
                </option>
                <option value="price-asc">
                  {isMounted && lang === "bn"
                    ? "দাম: কম থেকে বেশি"
                    : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {isMounted && lang === "bn"
                    ? "দাম: বেশি থেকে কম"
                    : "Price: High to Low"}
                </option>
                <option value="discount">
                  {isMounted && lang === "bn"
                    ? "সর্বোচ্চ ছাড়"
                    : "Biggest Discount"}
                </option>
              </select>

              <div
                suppressHydrationWarning
                className={`flex items-center p-1 rounded-xl shrink-0 ${t.surfaceAlt}`}
              >
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === "grid" ? t.chipActive : t.mutedText
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === "list" ? t.chipActive : t.mutedText
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products List / Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                suppressHydrationWarning
                className={`rounded-3xl p-3 space-y-3 animate-pulse ${t.surface}`}
              >
                <div
                  className={`aspect-square rounded-2xl ${
                    isLight ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                />
                <div
                  className={`h-3.5 w-20 rounded ${
                    isLight ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                />
                <div
                  className={`h-4 w-3/4 rounded ${
                    isLight ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                />
                <div
                  className={`h-9 w-full rounded-xl ${
                    isLight ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            suppressHydrationWarning
            className={`rounded-3xl p-10 text-center space-y-3 ${t.surface}`}
          >
            <p
              suppressHydrationWarning
              className={`text-sm font-semibold ${t.titleText}`}
            >
              {products.length === 0
                ? isMounted && lang === "bn"
                  ? "বর্তমানে স্টোরে কোনো প্রোডাক্ট তালিকাভুক্ত নেই।"
                  : "No products are currently listed in the store."
                : isMounted && lang === "bn"
                ? "এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি।"
                : "No products found matching your filter."}
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setSearchQuery("");
                  jumpToCatalog();
                }}
                className={`text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer ${t.silverCta}`}
              >
                {isMounted && lang === "bn"
                  ? "সব প্রোডাক্ট দেখুন"
                  : "Show All Products"}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => {
              const isLiked = isMounted && wishlist.includes(product.id);
              const discountPct =
                getDiscountPercent(product.price, product.oldPrice) ||
                (product.flashSale?.enabled
                  ? product.flashSale.discountPercent || null
                  : null);
              const stockNum =
                typeof product.stock === "number" ? product.stock : 10;
              const isOutOfStock = stockNum <= 0;

              const defaultColor = product.colors?.[0];
              const chosenColor = selectedColors[product.id] || defaultColor;
              const hasUserPickedNonDefaultColor =
                Boolean(chosenColor) && chosenColor !== defaultColor;
              const colorSelectedImage = getImageForColor(product, chosenColor);
              const activeImage =
                !hasUserPickedNonDefaultColor &&
                hoveredProductId === product.id &&
                product.secondaryImage
                  ? product.secondaryImage
                  : colorSelectedImage;

              const productReviews = reviews.filter(
                (r) =>
                  r.productId === product.id &&
                  r.name.trim().length > 0 &&
                  r.comment.trim().length > 0
              );

              return (
                <div
                  key={product.id}
                  suppressHydrationWarning
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  className={
                    viewMode === "grid"
                      ? `group flex flex-col justify-between rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 transition ${t.surface} ${
                          isLight
                            ? "hover:border-zinc-400"
                            : "hover:border-zinc-600"
                        }`
                      : `group flex flex-col sm:flex-row items-center gap-5 rounded-3xl p-4 transition ${t.surface} ${
                          isLight
                            ? "hover:border-zinc-400"
                            : "hover:border-zinc-600"
                        }`
                  }
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? `relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden w-full ${
                            isLight ? "bg-zinc-100" : "bg-zinc-900"
                          }`
                        : `relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden shrink-0 ${
                            isLight ? "bg-zinc-100" : "bg-zinc-900"
                          }`
                    }
                  >
                    <Link
                      href={`/products/${product.id}`}
                      onClick={rememberCurrentScroll}
                      className="block w-full h-full"
                    >
                      <img
                        key={`${product.id}-${activeImage}`}
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>

                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-[72%]">
                      {discountPct && (
                        <span
                          className={`text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 sm:py-1 rounded-full ${
                            isFilteredCollectionView || product.flashSale?.enabled
                              ? "bg-rose-600 text-white"
                              : isLight
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-200 text-zinc-950"
                          }`}
                        >
                          -{discountPct}%
                        </span>
                      )}
                      {product.badge && !isFilteredCollectionView && (
                        <span className="bg-black/80 text-zinc-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      {!isFilteredCollectionView && (
                        <span
                          suppressHydrationWarning
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? "bg-rose-600 text-white"
                              : isLight
                              ? "bg-white/90 text-zinc-900 border border-zinc-200"
                              : "bg-zinc-900/90 text-zinc-200 border border-zinc-700"
                          }`}
                        >
                          {isOutOfStock
                            ? isMounted && lang === "bn"
                              ? "স্টক শেষ"
                              : "Out of Stock"
                            : isMounted && lang === "bn"
                            ? "স্টকে আছে"
                            : "Stock Available"}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex flex-col gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        aria-label="Wishlist"
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                          isLight
                            ? "bg-white/95 border border-zinc-200 hover:bg-zinc-100 shadow-2xs"
                            : "bg-zinc-900/95 border border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            isLiked
                              ? "fill-rose-500 text-rose-500"
                              : t.mutedText
                          }`}
                        />
                      </button>

                      {!isFilteredCollectionView && (
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          aria-label="Quick View"
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                            isLight
                              ? "bg-white/95 border border-zinc-200 hover:bg-zinc-100"
                              : "bg-zinc-900/95 border border-zinc-700 hover:bg-zinc-800"
                          }`}
                        >
                          <Eye className={`w-4 h-4 ${t.mutedText}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between w-full pt-2.5 sm:pt-0 px-0.5 sm:px-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${t.mutedText}`}
                        >
                          {catLabelText(product.subCategory)}
                        </span>
                        {productReviews.length > 0 && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold shrink-0 ${t.titleText}`}
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {(
                              productReviews.reduce(
                                (acc, r) => acc + r.rating,
                                0
                              ) / productReviews.length
                            ).toFixed(1)}{" "}
                            ({productReviews.length})
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        onClick={rememberCurrentScroll}
                        className={`font-bold text-xs sm:text-base lg:text-lg mt-0.5 leading-snug line-clamp-2 block ${t.titleText} ${
                          isLight
                            ? "hover:text-zinc-600"
                            : "hover:text-zinc-300"
                        }`}
                      >
                        {product.name}
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span
                          className={`text-sm sm:text-base font-extrabold ${
                            isFilteredCollectionView && isLight
                              ? "text-rose-600"
                              : t.titleText
                          }`}
                        >
                          ৳{product.price}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span
                            className={`text-[11px] sm:text-xs line-through ${t.mutedText}`}
                          >
                            ৳{product.oldPrice}
                          </span>
                        )}
                      </div>

                      {isFilteredCollectionView && (
                        <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px]">
                          <span className="font-semibold text-emerald-500">
                            {isMounted && lang === "bn"
                              ? "ক্যাশ অন ডেলিভারি"
                              : "Cash on Delivery"}
                          </span>
                          <span className={t.mutedText}>
                            {isOutOfStock
                              ? isMounted && lang === "bn"
                                ? "স্টক শেষ"
                                : "Out of stock"
                              : isMounted && lang === "bn"
                              ? "২-৩ দিনে"
                              : "In 2–3 days"}
                          </span>
                        </div>
                      )}

                      {!isFilteredCollectionView &&
                        product.category === "fashion" &&
                        product.sizes &&
                        product.sizes.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs mr-1 ${t.mutedText}`}>
                              {isMounted && lang === "bn" ? "সাইজ:" : "Size:"}
                            </span>
                            {product.sizes.map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() =>
                                  setSelectedSizes({
                                    ...selectedSizes,
                                    [product.id]: size,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                  (selectedSizes[product.id] ||
                                    product.sizes?.[0]) === size
                                    ? t.chipActive
                                    : t.chipIdle
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}

                      {product.colors && product.colors.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5">
                          <span
                            className={`text-[11px] sm:text-xs mr-0.5 ${t.mutedText}`}
                          >
                            {isMounted && lang === "bn" ? "কালার:" : "Color:"}
                          </span>
                          {product.colors.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() =>
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [product.id]: col,
                                }))
                              }
                              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border transition cursor-pointer ${
                                (selectedColors[product.id] ||
                                  product.colors?.[0]) === col
                                  ? t.chipActive
                                  : t.chipIdle
                              }`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      )}

                      {!isFilteredCollectionView && product.specs && (
                        <p
                          className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium truncate ${t.surfaceAlt} ${t.mutedText}`}
                        >
                          {product.specs}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 sm:pt-4 flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product)}
                        className={`flex-1 disabled:opacity-45 text-[11px] sm:text-sm font-extrabold py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl transition cursor-pointer disabled:cursor-not-allowed ${t.silverCta}`}
                      >
                        {isOutOfStock
                          ? isMounted && lang === "bn"
                            ? "স্টক শেষ"
                            : "Out of Stock"
                          : isMounted && lang === "bn"
                          ? "কার্টে যোগ করুন"
                          : "Add to Cart"}
                      </button>
                      {!isFilteredCollectionView && (
                        <Link
                          href={`/products/${product.id}`}
                          onClick={rememberCurrentScroll}
                          className={`text-xs sm:text-sm font-semibold py-2.5 px-3.5 rounded-xl transition cursor-pointer text-center ${t.pillBtn}`}
                        >
                          {isMounted && lang === "bn" ? "বিস্তারিত" : "Details"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Related Products Strip */}
        {relatedProducts.length > 0 && (
          <div
            suppressHydrationWarning
            className={`mt-10 rounded-3xl p-5 sm:p-6 space-y-4 ${t.surface}`}
          >
            <div className="flex items-center justify-between">
              <h3
                suppressHydrationWarning
                className={`text-base sm:text-lg font-bold ${t.titleText}`}
              >
                {isMounted && lang === "bn"
                  ? "রিলেটেড প্রোডাক্টস"
                  : "Related Products"}
              </h3>
              <span suppressHydrationWarning className={`text-xs ${t.mutedText}`}>
                {isMounted && lang === "bn"
                  ? "আপনার জন্য বাছাইকৃত"
                  : "Curated picks"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {relatedProducts.map((rel) => (
                <Link
                  key={`rel-${rel.id}`}
                  href={`/products/${rel.id}`}
                  onClick={rememberCurrentScroll}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl transition ${t.surfaceAlt} ${
                    isLight ? "hover:border-zinc-400" : "hover:border-zinc-500"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${t.titleText}`}
                    >
                      {rel.name}
                    </p>
                    <p className={`text-xs font-extrabold mt-0.5 ${t.bodyText}`}>
                      ৳{rel.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <div
          suppressHydrationWarning
          className={`rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${t.surface}`}
        >
          <div className="space-y-2 max-w-xl">
            <h3
              suppressHydrationWarning
              className={`text-2xl sm:text-3xl font-bold ${t.titleText}`}
            >
              {isMounted && lang === "bn"
                ? "আপনার স্টাইল, ফুটওয়্যার, বিউটি ও স্মার্ট টেক আপগ্রেড করুন"
                : "Upgrade Your Style, Footwear, Beauty & Tech"}
            </h3>
            <p suppressHydrationWarning className={`text-sm ${t.mutedText}`}>
              {isMounted && lang === "bn"
                ? "পার্সেল হাতে পেয়ে চেক করে মূল্য পরিশোধ করার সুবিধাসহ দ্রুত হোম ডেলিভারি।"
                : "Fast doorstep delivery across Bangladesh with COD, bKash, Nagad & Rocket."}
            </p>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => jumpToCatalog({ sort: "discount" })}
            className={`text-sm font-extrabold px-6 py-3 rounded-xl shrink-0 transition cursor-pointer ${t.silverCta}`}
          >
            {isMounted && lang === "bn" ? "অফার দেখুন" : "Explore Deals"}
          </button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <h2
          suppressHydrationWarning
          className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 ${t.titleText}`}
        >
          {isMounted && lang === "bn"
            ? `কেন ${BRAND_NAME} বেছে নেবেন`
            : `Why Choose ${BRAND_NAME}`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            suppressHydrationWarning
            className={`p-5 rounded-2xl flex items-start gap-3.5 ${t.surface}`}
          >
            <ShieldCheck className={`w-6 h-6 shrink-0 mt-0.5 ${t.titleText}`} />
            <div>
              <h4
                suppressHydrationWarning
                className={`font-bold text-sm ${t.titleText}`}
              >
                {isMounted && lang === "bn"
                  ? "১০০% অরিজিনাল ও যাচাইকৃত পণ্য"
                  : "100% Authentic Products"}
              </h4>
              <p
                suppressHydrationWarning
                className={`text-xs mt-1 ${t.mutedText}`}
              >
                {isMounted && lang === "bn"
                  ? "মান যাচাইকৃত ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেট ও মোবাইল অ্যাক্সেসরিজ।"
                  : "Verified Men's & Women's Fashion, Footwear, Beauty, Gadgets & Mobile Accessories."}
              </p>
            </div>
          </div>

          <div
            suppressHydrationWarning
            className={`p-5 rounded-2xl flex items-start gap-3.5 ${t.surface}`}
          >
            <Truck className={`w-6 h-6 shrink-0 mt-0.5 ${t.titleText}`} />
            <div>
              <h4
                suppressHydrationWarning
                className={`font-bold text-sm ${t.titleText}`}
              >
                {isMounted && lang === "bn"
                  ? "সারা দেশে ক্যাশ অন ডেলিভারি"
                  : "Nationwide Cash on Delivery"}
              </h4>
              <p
                suppressHydrationWarning
                className={`text-xs mt-1 ${t.mutedText}`}
              >
                {isMounted && lang === "bn"
                  ? "ময়মনসিংহ থেকে সারা বাংলাদেশে নির্ভরযোগ্য কুরিয়ার ডেলিভারি সুবিধা।"
                  : "Reliable courier dispatch from Mymensingh to every district in Bangladesh."}
              </p>
            </div>
          </div>

          <div
            suppressHydrationWarning
            className={`p-5 rounded-2xl flex items-start gap-3.5 ${t.surface}`}
          >
            <Sparkles className={`w-6 h-6 shrink-0 mt-0.5 ${t.titleText}`} />
            <div>
              <h4
                suppressHydrationWarning
                className={`font-bold text-sm ${t.titleText}`}
              >
                {isMounted && lang === "bn"
                  ? "ওপেন পার্সেল চেক ও এক্সচেঞ্জ"
                  : "Open Parcel Check & Easy Exchange"}
              </h4>
              <p
                suppressHydrationWarning
                className={`text-xs mt-1 ${t.mutedText}`}
              >
                {isMounted && lang === "bn"
                  ? "ডেলিভারি রাইডারের সামনে পার্সেল দেখে বুঝে নেওয়ার সুবিধা।"
                  : "Quick doorstep delivery with parcel inspection and easy size exchange."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Reviews Only */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <div
          suppressHydrationWarning
          className={`rounded-3xl p-5 sm:p-8 space-y-6 ${t.surface}`}
        >
          <div className="flex items-center justify-between">
            <h2
              suppressHydrationWarning
              className={`text-xl font-bold ${t.titleText}`}
            >
              {isMounted && lang === "bn"
                ? "কাস্টমার রিভিউ"
                : "Customer Reviews"}
            </h2>
            <span suppressHydrationWarning className={`text-xs ${t.mutedText}`}>
              {isMounted
                ? `${reviews.length} ${
                    lang === "bn"
                      ? "টি রিভিউ"
                      : reviews.length === 1
                      ? "review"
                      : "reviews"
                  }`
                : ""}
            </span>
          </div>

          <form onSubmit={handleAddSimpleReview} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                suppressHydrationWarning
                placeholder={
                  isMounted && lang === "bn" ? "আপনার নাম *" : "Your name *"
                }
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className={`sm:col-span-3 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none ${t.input}`}
              />
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                aria-label="Rating"
                className={`sm:col-span-2 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none cursor-pointer ${t.input}`}
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
                  isMounted && lang === "bn"
                    ? "রিসিভ করা প্রোডাক্ট নিয়ে আপনার মতামত লিখুন... *"
                    : "Write your review about the received product... *"
                }
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className={`sm:col-span-5 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none ${t.input}`}
              />
              <button
                type="submit"
                disabled={uploadingReviewPhoto}
                className={`sm:col-span-2 disabled:opacity-50 text-xs sm:text-sm font-extrabold py-2 px-4 rounded-xl transition cursor-pointer ${t.silverCta}`}
              >
                {uploadingReviewPhoto
                  ? isMounted && lang === "bn"
                    ? "আপলোড হচ্ছে..."
                    : "Uploading..."
                  : isMounted && lang === "bn"
                  ? "রিভিউ দিন"
                  : "Post"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition ${t.pillBtn}`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${t.mutedText}`} />
                <span>
                  {uploadingReviewPhoto
                    ? isMounted && lang === "bn"
                      ? "ছবি আপলোড হচ্ছে..."
                      : "Uploading photo..."
                    : isMounted && lang === "bn"
                    ? "প্রোডাক্টের ছবি তুলুন / যোগ করুন"
                    : "Take / Add Product Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={uploadingReviewPhoto}
                  onChange={handleReviewPhotoChange}
                  className="hidden"
                />
              </label>

              {reviewPhoto && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-1.5 pr-2.5 ${t.surfaceAlt}`}
                >
                  <img
                    src={reviewPhoto}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span className={`text-xs ${t.bodyText}`}>
                    {isMounted && lang === "bn"
                      ? "ছবি যুক্ত হয়েছে"
                      : "Photo attached"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReviewPhoto("")}
                    className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                  >
                    {isMounted && lang === "bn" ? "সরান" : "Remove"}
                  </button>
                </div>
              )}
            </div>
          </form>

          {reviews.length === 0 ? (
            <p className={`text-xs sm:text-sm py-4 ${t.mutedText}`}>
              {isMounted && lang === "bn"
                ? "এখনো কোনো রিভিউ দেওয়া হয়নি। পণ্য রিসিভ করার পর প্রথম রিভিউ ও ছবি দিন।"
                : "No reviews yet. Be the first to post a review with a photo of your received product."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl space-y-2.5 ${t.surfaceAlt}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${t.titleText}`}>
                      {rev.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${t.bodyText}`}>
                    {rev.comment}
                  </p>
                  {rev.photo && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                      <img
                        src={rev.photo}
                        alt={`${rev.name} product review`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-14">
        <div
          suppressHydrationWarning
          className={`rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${t.surface}`}
        >
          <div className="space-y-1 max-w-md">
            <h3
              suppressHydrationWarning
              className={`text-lg sm:text-xl font-bold ${t.titleText}`}
            >
              {isMounted && lang === "bn"
                ? `নতুন কালেকশন ও অফারের আপডেট পান (${BRAND_NAME})`
                : `Stay Updated with ${BRAND_NAME}`}
            </h3>
            <p
              suppressHydrationWarning
              className={`text-xs sm:text-sm ${t.mutedText}`}
            >
              {isMounted && lang === "bn"
                ? "নতুন ফ্যাশন, ফুটওয়্যার, বিউটি ও গ্যাজেট অফারের খবর সবার আগে পেতে ইমেইল দিন।"
                : "Get notified about new fashion, footwear, beauty, gadgets, and mobile accessories offers."}
            </p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={
                isMounted && lang === "bn"
                  ? "আপনার ইমেইল লিখুন"
                  : "Enter your email address"
              }
              className={`rounded-xl px-4 py-2.5 text-sm outline-none sm:w-64 ${t.input}`}
            />
            <button
              type="submit"
              className={`text-sm font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer ${t.silverCta}`}
            >
              {isMounted && lang === "bn" ? "সাবস্ক্রাইব" : "Subscribe"}
            </button>
          </form>
        </div>
        {newsletterStatus && (
          <p className="text-xs text-emerald-500 font-medium mt-2 px-2">
            {newsletterStatus}
          </p>
        )}
      </section>

      {/* Professional Footer */}
      <footer
        id="footer-section"
        suppressHydrationWarning
        className={`pt-12 pb-8 ${t.footerBg}`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b ${
            isLight ? "border-zinc-200" : "border-zinc-800"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={LOGO_SRC}
                alt={BRAND_NAME}
                className="h-9 w-auto object-contain rounded-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <h3
                className={`font-black text-lg tracking-wider leading-none ${t.titleText}`}
              >
                {BRAND_NAME}
              </h3>
            </div>
            <p
              suppressHydrationWarning
              className={`text-xs leading-relaxed ${t.mutedText}`}
            >
              {isMounted && lang === "bn"
                ? `${BRAND_NAME}—মেনস ও উইমেনস ফ্যাশন, ফুটওয়্যার, গ্যাজেটস, বিউটি প্রোডাক্টস এবং মোবাইল অ্যাক্সেসরিজের অনলাইন স্টোর।`
                : `${BRAND_NAME} online store serving Men's Fashion, Women's Fashion, Men's Footwear, Women's Footwear, Gadgets, Beauty Products, and Mobile Accessories.`}
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4
              suppressHydrationWarning
              className={`font-bold text-sm ${t.titleText}`}
            >
              {isMounted && lang === "bn" ? "ক্যাটাগরি" : "Categories"}
            </h4>
            <ul className={`space-y-2 ${t.mutedText}`}>
              {STORE_CATEGORIES.map((catName) => (
                <li key={catName}>
                  <button
                    type="button"
                    onClick={() => jumpToCatalog({ sub: catName })}
                    className={`cursor-pointer ${
                      isLight ? "hover:text-zinc-950" : "hover:text-white"
                    }`}
                  >
                    {catLabelText(catName)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4
              suppressHydrationWarning
              className={`font-bold text-sm ${t.titleText}`}
            >
              {isMounted && lang === "bn"
                ? "পলিসি ও সাপোর্ট"
                : "Policies & Support"}
            </h4>
            <ul className={`space-y-2 ${t.mutedText}`}>
              <li suppressHydrationWarning>
                {isMounted && lang === "bn"
                  ? `ময়মনসিংহের ভেতরে ৳${deliveryConfig.insideMymensingh} / বাইরে ৳${deliveryConfig.outsideMymensingh}`
                  : `Inside Mymensingh ৳${deliveryConfig.insideMymensingh} / Outside Mymensingh ৳${deliveryConfig.outsideMymensingh}`}
              </li>
              <li>
                <Link
                  href="/policies"
                  onClick={rememberCurrentScroll}
                  className={`underline underline-offset-4 ${
                    isLight ? "hover:text-zinc-950" : "hover:text-white"
                  }`}
                >
                  {isMounted && lang === "bn"
                    ? "রিটার্ন, এক্সচেঞ্জ ও ডেলিভারি পলিসি"
                    : "Return, Exchange & Delivery Policy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  onClick={rememberCurrentScroll}
                  className={`underline underline-offset-4 ${
                    isLight ? "hover:text-zinc-950" : "hover:text-white"
                  }`}
                >
                  {isMounted && lang === "bn"
                    ? "প্রাইভেসি পলিসি ও ডেটা ব্যবহার"
                    : "Privacy Policy & Data Use"}
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  onClick={rememberCurrentScroll}
                  className={isLight ? "hover:text-zinc-950" : "hover:text-white"}
                >
                  {isMounted && lang === "bn"
                    ? "অর্ডার ট্র্যাক করুন"
                    : "Track Your Order"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4
              suppressHydrationWarning
              className={`font-bold text-sm ${t.titleText}`}
            >
              {isMounted && lang === "bn" ? "যোগাযোগ" : "Contact"}
            </h4>
            <ul className={`space-y-2 ${t.mutedText}`}>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Mymensingh, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <a
                  href={WHATSAPP_WA_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Support"
                  className="hover:underline inline-flex items-center gap-1.5 text-emerald-500 font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={`font-medium ${
                    isLight ? "hover:text-zinc-950" : "hover:text-white"
                  }`}
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`max-w-7xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${t.mutedText}`}
        >
          <p>© 2026 {BRAND_NAME}. All rights reserved.</p>
          <p>{SUPPORT_EMAIL}</p>
        </div>
      </footer>

      {/* Floating WhatsApp Icon & Scroll-to-Top */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col gap-2.5">
        {isMounted && showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center cursor-pointer ${t.pillBtn}`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
        <a
          href={WHATSAPP_WA_LINK}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Support"
          className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav
        suppressHydrationWarning
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-xl z-40 rounded-full px-2 sm:px-3 py-1.5 ${t.navBg}`}
      >
        <div className="grid grid-cols-5 items-center text-[11px] sm:text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 cursor-pointer"
          >
            <span
              className={`w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "home"
                  ? isLight
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-zinc-950"
                  : t.mutedText
              }`}
            >
              <Home className="w-4 h-4" />
            </span>
            <span
              suppressHydrationWarning
              className={`mt-0.5 ${
                activeBottomTab === "home"
                  ? `font-bold ${t.titleText}`
                  : t.mutedText
              }`}
            >
              {isMounted && lang === "bn" ? "হোম" : "Home"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("categories");
              jumpToCatalog({ cat: "all", scrollToId: "categories-section" });
            }}
            className="flex flex-col items-center justify-center py-1 cursor-pointer"
          >
            <span
              className={`w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "categories"
                  ? isLight
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-zinc-950"
                  : t.mutedText
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </span>
            <span
              suppressHydrationWarning
              className={`mt-0.5 ${
                activeBottomTab === "categories"
                  ? `font-bold ${t.titleText}`
                  : t.mutedText
              }`}
            >
              {isMounted && lang === "bn" ? "ক্যাটাগরি" : "Categories"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveBottomTab("cart");
              setIsCartOpen(true);
            }}
            className="relative flex flex-col items-center justify-center py-1 cursor-pointer"
          >
            <span
              className={`relative w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "cart"
                  ? isLight
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-zinc-950"
                  : t.mutedText
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isMounted && totalCartCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[9px] font-extrabold min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center ${
                    isLight
                      ? "bg-[#18181B] text-white border border-white"
                      : "bg-zinc-200 text-zinc-950 border border-zinc-950"
                  }`}
                >
                  {totalCartCount}
                </span>
              )}
            </span>
            <span
              suppressHydrationWarning
              className={`mt-0.5 ${
                activeBottomTab === "cart"
                  ? `font-bold ${t.titleText}`
                  : t.mutedText
              }`}
            >
              {isMounted && lang === "bn" ? "কার্ট" : "Cart"}
            </span>
          </button>

          <Link
            href="/track-order"
            onClick={() => {
              rememberCurrentScroll();
              setActiveBottomTab("orders");
            }}
            className="flex flex-col items-center justify-center py-1"
          >
            <span
              className={`w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "orders"
                  ? isLight
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-zinc-950"
                  : t.mutedText
              }`}
            >
              <Package className="w-4 h-4" />
            </span>
            <span
              suppressHydrationWarning
              className={`mt-0.5 ${
                activeBottomTab === "orders"
                  ? `font-bold ${t.titleText}`
                  : t.mutedText
              }`}
            >
              {isMounted && lang === "bn" ? "অর্ডার" : "Track Order"}
            </span>
          </Link>

          <button
            type="button"
            onClick={openAccountModal}
            className="flex flex-col items-center justify-center py-1 cursor-pointer"
          >
            <span
              className={`w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "account"
                  ? isLight
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-zinc-950"
                  : t.mutedText
              }`}
            >
              <User className="w-4 h-4" />
            </span>
            <span
              suppressHydrationWarning
              className={`mt-0.5 ${
                activeBottomTab === "account"
                  ? `font-bold ${t.titleText}`
                  : t.mutedText
              }`}
            >
              {isMounted && customerUser
                ? lang === "bn"
                  ? "অ্যাকাউন্ট"
                  : "Account"
                : isMounted && lang === "bn"
                ? "লগইন"
                : "Login"}
            </span>
          </button>
        </div>
      </nav>

      {/* Delivery Location Modal */}
      {isMounted && isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div
            className={`rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 ${t.surface}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${t.mutedText}`} />
                <h3 className={`text-base font-bold ${t.titleText}`}>
                  {lang === "bn"
                    ? "ডেলিভারি এলাকা নির্বাচন করুন"
                    : "Select Delivery Location"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className={`p-1.5 rounded-full cursor-pointer ${t.pillBtn}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_LOCATIONS.map((loc) => {
                const active = deliveryLocation === loc.label;
                return (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      active ? t.chipActive : t.chipIdle
                    }`}
                  >
                    <p className="text-xs font-bold">{loc.label}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        active ? "opacity-80" : t.mutedText
                      }`}
                    >
                      {loc.zone === "mymensingh"
                        ? `Charge: ৳${deliveryConfig.insideMymensingh}`
                        : `Charge: ৳${deliveryConfig.outsideMymensingh}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Account Dashboard & Auth Modal */}
      {isMounted && isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          {customerUser ? (
            <div
              className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto ${t.surface}`}
            >
              <div
                className="relative p-5 sm:p-6 text-white"
                style={{
                  background:
                    "linear-gradient(125deg, #090D16 0%, #161B2E 52%, #3B0D18 100%)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setAccountSection("menu");
                    setActiveBottomTab("home");
                  }}
                  aria-label="Close account modal"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-sky-400 shrink-0">
                    <div className="w-full h-full rounded-full bg-[#0C101D] flex items-center justify-center text-xl sm:text-2xl font-black uppercase text-white">
                      {(customerUser.name || "U").charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-300">
                      {lang === "bn" ? "আমার অ্যাকাউন্ট" : "MY ACCOUNT"}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-extrabold truncate mt-0.5">
                      {customerUser.name}
                    </h3>
                    {customerUser.email && (
                      <p className="text-xs sm:text-sm text-zinc-300 truncate">
                        {customerUser.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountSection("orders");
                      void loadAccountOrders(customerUser);
                    }}
                    className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 p-3 text-left transition cursor-pointer"
                  >
                    <p className="text-lg sm:text-xl font-black text-white">
                      {userOrders.length}
                    </p>
                    <p className="text-[11px] sm:text-xs text-zinc-200 mt-0.5">
                      {lang === "bn" ? "অর্ডার" : "Orders"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountSection("orders");
                      void loadAccountOrders(customerUser);
                    }}
                    className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 p-3 text-left transition cursor-pointer"
                  >
                    <p className="text-lg sm:text-xl font-black text-white">
                      {inProgressOrdersCount}
                    </p>
                    <p className="text-[11px] sm:text-xs text-zinc-200 mt-0.5">
                      {lang === "bn" ? "চলমান" : "In progress"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountSection("wishlist")}
                    className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 p-3 text-left transition cursor-pointer"
                  >
                    <p className="text-lg sm:text-xl font-black text-white">
                      {wishlist.length}
                    </p>
                    <p className="text-[11px] sm:text-xs text-zinc-200 mt-0.5">
                      {lang === "bn" ? "উইশলিস্ট" : "Wishlist"}
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 max-h-[62vh] overflow-y-auto">
                {accountSection !== "menu" && (
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountSection("menu");
                        setAccountSavedNotice("");
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${t.pillBtn}`}
                    >
                      {lang === "bn"
                        ? "← অ্যাকাউন্ট মেনু"
                        : "← Back to Account Menu"}
                    </button>
                    <span className={`text-xs font-bold uppercase ${t.mutedText}`}>
                      {accountSection}
                    </span>
                  </div>
                )}

                {accountSection === "menu" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountSection("orders");
                        void loadAccountOrders(customerUser);
                      }}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "আমার অর্ডার" : "My Orders"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("dues")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "বকেয়া হিসাব" : "Old Dues"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("wishlist")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <Heart className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "উইশলিস্ট" : "Wishlist"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("reviews")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "আমার রিভিউ" : "My Reviews"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("addresses")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "ঠিকানা" : "Addresses"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("profile")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "প্রোফাইল" : "Profile"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountSection("settings")}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-500"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.pillBtn}`}
                      >
                        <Settings className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "সেটিংস" : "Settings"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCustomerLogout}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${t.surfaceAlt} hover:border-rose-500/60`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-rose-500">
                        {lang === "bn" ? "সাইন আউট" : "Sign out"}
                      </span>
                    </button>
                  </div>
                )}

                {accountSection === "orders" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold ${t.titleText}`}>
                        {lang === "bn" ? "আমার অর্ডারসমূহ" : "My Orders"}
                      </h4>
                      <Link
                        href="/track-order"
                        onClick={() => {
                          rememberCurrentScroll();
                          setIsAccountModalOpen(false);
                        }}
                        className="text-xs font-bold underline"
                      >
                        {lang === "bn"
                          ? "বিস্তারিত ট্র্যাক করুন →"
                          : "Full Track Order Page →"}
                      </Link>
                    </div>
                    {loadingUserOrders ? (
                      <p className={`text-xs ${t.mutedText}`}>
                        {lang === "bn"
                          ? "অর্ডার লোড হচ্ছে..."
                          : "Loading orders..."}
                      </p>
                    ) : userOrders.length === 0 ? (
                      <div
                        className={`p-4 rounded-2xl text-xs ${t.surfaceAlt} ${t.mutedText}`}
                      >
                        {lang === "bn"
                          ? "এখনো কোনো অর্ডার পাওয়া যায়নি।"
                          : "No orders found for your account yet."}
                      </div>
                    ) : (
                      userOrders.map((ord) => (
                        <div
                          key={ord._id}
                          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 ${t.surfaceAlt}`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${t.titleText}`}
                            >
                              #{ord.orderId || ord._id} •{" "}
                              {ord.status || "Pending"}
                            </p>
                            <p className={`text-[11px] truncate ${t.mutedText}`}>
                              {(ord.items || [])
                                .map((i) => `${i.name} ×${i.quantity}`)
                                .join(", ")}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-extrabold shrink-0 ${t.titleText}`}
                          >
                            ৳{Number(ord.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {accountSection === "dues" && (
                  <div className={`p-4 rounded-2xl space-y-2 ${t.surfaceAlt}`}>
                    <h4 className={`text-sm font-bold ${t.titleText}`}>
                      {lang === "bn" ? "বকেয়া হিসাব (Old Dues)" : "Old Dues"}
                    </h4>
                    <p className={`text-xs ${t.mutedText}`}>
                      {lang === "bn"
                        ? "আপনার অ্যাকাউন্টে কোনো পূর্বের বকেয়া (৳0) নেই।"
                        : "You have no pending old dues (৳0) on your account."}
                    </p>
                  </div>
                )}

                {accountSection === "wishlist" && (
                  <div className="space-y-2.5">
                    <h4 className={`text-sm font-bold ${t.titleText}`}>
                      {lang === "bn"
                        ? `সেভ করা উইশলিস্ট (${wishlist.length})`
                        : `Saved Wishlist (${wishlist.length})`}
                    </h4>
                    {wishlist.length === 0 ? (
                      <p className={`text-xs ${t.mutedText}`}>
                        {lang === "bn"
                          ? "উইশলিস্টে কোনো প্রোডাক্ট নেই।"
                          : "Your wishlist is currently empty."}
                      </p>
                    ) : (
                      products
                        .filter((p) => wishlist.includes(p.id))
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl flex items-center justify-between gap-3 ${t.surfaceAlt}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-bold truncate ${t.titleText}`}
                                >
                                  {item.name}
                                </p>
                                <p className={`text-xs ${t.mutedText}`}>
                                  ৳{item.price}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAccountModalOpen(false);
                                addToCart(item, true);
                              }}
                              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-pointer ${t.silverCta}`}
                            >
                              {lang === "bn" ? "কার্টে নিন" : "Add"}
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {accountSection === "reviews" && (
                  <div className="space-y-2.5">
                    <h4 className={`text-sm font-bold ${t.titleText}`}>
                      {lang === "bn" ? "কাস্টমার ও আমার রিভিউ" : "Reviews"}
                    </h4>
                    {reviews.length === 0 ? (
                      <p className={`text-xs ${t.mutedText}`}>
                        {lang === "bn"
                          ? "এখনো কোনো রিভিউ পোস্ট করা হয়নি।"
                          : "No reviews posted yet."}
                      </p>
                    ) : (
                      reviews.slice(0, 6).map((r) => (
                        <div
                          key={r.id}
                          className={`p-3 rounded-2xl space-y-1 ${t.surfaceAlt}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${t.titleText}`}>
                              {r.name}
                            </span>
                            <span className="text-xs text-amber-500 font-bold">
                              {r.rating} ★
                            </span>
                          </div>
                          <p className={`text-xs ${t.bodyText}`}>{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {(accountSection === "profile" ||
                  accountSection === "addresses") && (
                  <form
                    onSubmit={handleSaveAccountProfile}
                    className="space-y-3"
                  >
                    <h4 className={`text-sm font-bold ${t.titleText}`}>
                      {accountSection === "addresses"
                        ? lang === "bn"
                          ? "ডেলিভারি ঠিকানা আপডেট"
                          : "Saved Delivery Address"
                        : lang === "bn"
                        ? "প্রোফাইল তথ্য"
                        : "Profile Information"}
                    </h4>
                    <input
                      type="text"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder={lang === "bn" ? "পুরো নাম" : "Full Name"}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none ${t.input}`}
                    />
                    <input
                      type="tel"
                      value={profilePhoneInput}
                      onChange={(e) => setProfilePhoneInput(e.target.value)}
                      placeholder={
                        lang === "bn" ? "মোবাইল নম্বর" : "Phone Number"
                      }
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none ${t.input}`}
                    />
                    <input
                      type="text"
                      value={profileDistrictInput}
                      onChange={(e) => setProfileDistrictInput(e.target.value)}
                      placeholder={lang === "bn" ? "জেলা" : "District"}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none ${t.input}`}
                    />
                    <textarea
                      rows={2}
                      value={profileAddressInput}
                      onChange={(e) => setProfileAddressInput(e.target.value)}
                      placeholder={
                        lang === "bn" ? "বিস্তারিত ঠিকানা" : "Full Address"
                      }
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none ${t.input}`}
                    />
                    {accountSavedNotice && (
                      <p className="text-xs text-emerald-500 font-semibold">
                        {accountSavedNotice}
                      </p>
                    )}
                    <button
                      type="submit"
                      className={`text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl cursor-pointer ${t.silverCta}`}
                    >
                      {lang === "bn" ? "সেভ করুন" : "Save Changes"}
                    </button>
                  </form>
                )}

                {accountSection === "settings" && (
                  <div className="space-y-3">
                    <h4 className={`text-sm font-bold ${t.titleText}`}>
                      {lang === "bn" ? "অ্যাকাউন্ট ও অ্যাপ সেটিংস" : "Settings"}
                    </h4>
                    <div
                      className={`p-3.5 rounded-2xl flex items-center justify-between ${t.surfaceAlt}`}
                    >
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "থিম মোড" : "Theme Mode"}
                      </span>
                      <button
                        type="button"
                        onClick={toggleThemeMode}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${t.pillBtn}`}
                      >
                        {isLight ? "Light → Night" : "Night → Light"}
                      </button>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl flex items-center justify-between ${t.surfaceAlt}`}
                    >
                      <span className={`text-xs font-bold ${t.titleText}`}>
                        {lang === "bn" ? "ভাষা (Language)" : "Language"}
                      </span>
                      <button
                        type="button"
                        onClick={toggleLanguage}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${t.pillBtn}`}
                      >
                        {lang === "bn" ? "বাংলা → English" : "English → বাংলা"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="relative w-full max-w-[440px] rounded-[28px] overflow-hidden border border-zinc-700/70 shadow-[0_25px_80px_rgba(0,0,0,0.9)] my-auto text-white"
              style={{
                backgroundColor: "#09090B",
                backgroundImage: `
                  radial-gradient(ellipse 85% 55% at 88% 12%, rgba(228,228,231,0.28), transparent 60%),
                  radial-gradient(ellipse 75% 50% at 12% 38%, rgba(161,161,170,0.18), transparent 65%),
                  radial-gradient(ellipse 90% 60% at 78% 92%, rgba(212,212,216,0.22), transparent 65%),
                  url('${LOGIN_SILK_BG_SRC}')
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75 pointer-events-none" />

              <button
                type="button"
                onClick={() => {
                  setIsAccountModalOpen(false);
                  setActiveBottomTab("home");
                }}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 px-5 sm:px-7 pt-7 pb-6">
                <div className="flex flex-col items-center text-center mb-5">
                  <img
                    src={LOGO_SRC}
                    alt={BRAND_NAME}
                    className="h-12 w-auto object-contain mb-1.5 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <h2 className="text-2xl sm:text-[26px] font-serif tracking-[0.22em] bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-tight">
                    {BRAND_NAME}
                  </h2>
                  <div className="w-full max-w-[240px] flex items-center gap-2 mt-1">
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-500/70 to-zinc-400/70" />
                    <span className="text-[9px] sm:text-[10px] tracking-[0.24em] text-zinc-300 font-medium uppercase whitespace-nowrap">
                      {BRAND_TAGLINE}
                    </span>
                    <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-zinc-500/70 to-zinc-400/70" />
                  </div>
                </div>

                <div className="text-center mb-5">
                  {authMode === "login" && (
                    <>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {lang === "bn" ? "স্বাগতম" : "Welcome Back"}
                      </h3>
                      <p className="text-xs text-zinc-300/85 mt-1">
                        {lang === "bn"
                          ? "অর্ডার করতে ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন"
                          : "Sign in with your email and password to order"}
                      </p>
                    </>
                  )}

                  {authMode === "register" && (
                    <>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {lang === "bn"
                          ? "নতুন অ্যাকাউন্ট ও পাসওয়ার্ড তৈরি করুন"
                          : "Create Account & Password"}
                      </h3>
                      <p className="text-xs text-zinc-300/85 mt-1">
                        {lang === "bn"
                          ? "আপনার ইমেইল ও পছন্দের পাসওয়ার্ড দিয়ে রেজিস্টার করুন"
                          : "Register with your email and create a password"}
                      </p>
                    </>
                  )}

                  {authMode === "forgot" && (
                    <>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {lang === "bn" ? "পাসওয়ার্ড রিসেট" : "Forgot Password"}
                      </h3>
                      <p className="text-xs text-zinc-300/85 mt-1">
                        {lang === "bn"
                          ? "রিসেট লিংক পেতে আপনার ইমেইল ঠিকানা দিন"
                          : "Enter your email address to receive reset steps"}
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-[22px] bg-[#0B0B0E]/72 backdrop-blur-md border border-zinc-700/65 p-4 sm:p-5 shadow-inner space-y-3.5">
                  {authMode === "login" && (
                    <form onSubmit={handleStandardLogin} className="space-y-3">
                      <div className="relative flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3.5 h-11 transition">
                        <Mail className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder={
                            lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"
                          }
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-400 outline-none"
                        />
                      </div>

                      <div className="relative flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3.5 h-11 transition">
                        <KeyRound className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder={
                            lang === "bn" ? "পাসওয়ার্ড" : "Password"
                          }
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-400 outline-none pr-2"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label="Toggle password visibility"
                          className="text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0"
                        >
                          {showPassword ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                        <label className="inline-flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-900 accent-zinc-300 cursor-pointer"
                          />
                          <span>
                            {lang === "bn" ? "মনে রাখুন" : "Remember Me"}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setForgotIdentifier(loginIdentifier);
                            setLoginError("");
                          }}
                          className="text-zinc-200 hover:text-white transition font-medium cursor-pointer"
                        >
                          {lang === "bn"
                            ? "পাসওয়ার্ড ভুলে গেছেন?"
                            : "Forgot Password?"}
                        </button>
                      </div>

                      {loginError && (
                        <p className="text-xs text-rose-400 font-medium">
                          {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full h-11 rounded-xl bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-500 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 text-zinc-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-[0_6px_20px_rgba(255,255,255,0.14)] transition cursor-pointer"
                      >
                        <span>
                          {authSubmitting
                            ? lang === "bn"
                              ? "লগইন হচ্ছে..."
                              : "Signing In..."
                            : lang === "bn"
                            ? "লগইন"
                            : "Login"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3 py-0.5">
                        <span className="h-[1px] flex-1 bg-zinc-700/80" />
                        <span className="text-[11px] text-zinc-400">
                          {lang === "bn" ? "অথবা" : "or"}
                        </span>
                        <span className="h-[1px] flex-1 bg-zinc-700/80" />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleGoogleAuth(false)}
                          className="h-10 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <span className="w-4 h-4 rounded-full bg-white text-[10px] font-black flex items-center justify-center text-[#EA4335]">
                            G
                          </span>
                          <span>Google</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFacebookAuth(false)}
                          className="h-10 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-black flex items-center justify-center">
                            f
                          </span>
                          <span>Facebook</span>
                        </button>
                      </div>

                      <p className="text-center text-xs text-zinc-400 pt-1">
                        {lang === "bn"
                          ? "অ্যাকাউন্ট নেই? "
                          : "Don't have an account? "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setLoginError("");
                          }}
                          className="text-white font-bold underline underline-offset-4 hover:text-zinc-200 cursor-pointer"
                        >
                          {lang === "bn" ? "সাইন আপ" : "Sign Up"}
                        </button>
                      </p>
                    </form>
                  )}

                  {authMode === "register" && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                      <div className="flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3.5 h-10">
                        <User className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder={lang === "bn" ? "পুরো নাম" : "Full Name"}
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-400 outline-none"
                        />
                      </div>

                      <div className="flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3.5 h-10">
                        <Mail className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder={
                            lang === "bn"
                              ? "ইমেইল ঠিকানা (example@gmail.com)"
                              : "Email Address (example@gmail.com)"
                          }
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-400 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3 h-10">
                          <input
                            type="password"
                            required
                            placeholder={
                              lang === "bn" ? "পাসওয়ার্ড" : "Create Password"
                            }
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-transparent text-xs text-white placeholder:text-zinc-400 outline-none"
                          />
                        </div>
                        <div className="flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3 h-10">
                          <input
                            type="password"
                            required
                            placeholder={lang === "bn" ? "কনফার্ম" : "Confirm"}
                            value={regConfirmPassword}
                            onChange={(e) =>
                              setRegConfirmPassword(e.target.value)
                            }
                            className="w-full bg-transparent text-xs text-white placeholder:text-zinc-400 outline-none"
                          />
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer pt-0.5">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="accent-zinc-300 rounded"
                        />
                        <span>
                          {lang === "bn"
                            ? "Terms & Conditions-এ সম্মত আছি"
                            : "Agree to Terms & Conditions"}
                        </span>
                      </label>

                      {loginError && (
                        <p className="text-xs text-rose-400 font-medium">
                          {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full h-11 rounded-xl bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-500 hover:brightness-105 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm transition cursor-pointer"
                      >
                        {authSubmitting
                          ? lang === "bn"
                            ? "তৈরি হচ্ছে..."
                            : "Creating..."
                          : lang === "bn"
                          ? "পাসওয়ার্ড তৈরি ও সাইন আপ"
                          : "Create Account"}
                      </button>

                      <p className="text-center text-xs text-zinc-400 pt-1">
                        {lang === "bn"
                          ? "ইতোমধ্যে অ্যাকাউন্ট আছে? "
                          : "Already have an account? "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setLoginError("");
                          }}
                          className="text-white font-bold underline underline-offset-4 cursor-pointer"
                        >
                          {lang === "bn" ? "লগইন" : "Login"}
                        </button>
                      </p>
                    </form>
                  )}

                  {authMode === "forgot" && (
                    <div className="space-y-3">
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-3"
                      >
                        <div className="flex items-center bg-zinc-950/75 border border-zinc-700/80 focus-within:border-zinc-400 rounded-xl px-3.5 h-11">
                          <Mail className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                          <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={forgotIdentifier}
                            onChange={(e) => setForgotIdentifier(e.target.value)}
                            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-400 outline-none"
                          />
                        </div>
                        {loginError && (
                          <p className="text-xs text-rose-400 font-medium">
                            {loginError}
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={authSubmitting}
                          className="w-full h-11 rounded-xl bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-500 hover:brightness-105 disabled:opacity-50 text-zinc-950 font-bold text-sm transition cursor-pointer"
                        >
                          {authSubmitting
                            ? lang === "bn"
                              ? "পাঠানো হচ্ছে..."
                              : "Sending..."
                            : lang === "bn"
                            ? "রিসেট লিংক পাঠান"
                            : "Send Reset Link"}
                        </button>
                      </form>
                      {forgotNotice && (
                        <p className="text-xs text-emerald-400">
                          {forgotNotice}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setLoginError("");
                        }}
                        className="w-full text-center text-xs text-zinc-300 hover:text-white underline underline-offset-4 cursor-pointer"
                      >
                        {lang === "bn" ? "← লগইনে ফিরুন" : "← Back to Login"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick View Modal + Related Products */}
      {isMounted && quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto ${t.surface}`}
          >
            <div className="grid sm:grid-cols-2">
              <div
                className={`aspect-square ${
                  isLight ? "bg-zinc-100" : "bg-zinc-900"
                }`}
              >
                <img
                  src={getImageForColor(
                    quickViewProduct,
                    selectedColors[quickViewProduct.id] ||
                      quickViewProduct.colors?.[0]
                  )}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${t.mutedText}`}
                    >
                      {catLabelText(quickViewProduct.subCategory)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      className={`p-1 rounded-full cursor-pointer ${t.pillBtn}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className={`text-lg font-bold mt-1 ${t.titleText}`}>
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-lg font-extrabold ${t.titleText}`}>
                      ৳{quickViewProduct.price}
                    </span>
                    {quickViewProduct.oldPrice && (
                      <span className={`text-xs line-through ${t.mutedText}`}>
                        ৳{quickViewProduct.oldPrice}
                      </span>
                    )}
                  </div>

                  {quickViewProduct.description && (
                    <p className={`text-xs mt-3 leading-relaxed ${t.mutedText}`}>
                      {quickViewProduct.description}
                    </p>
                  )}

                  {quickViewProduct.category === "fashion" &&
                    quickViewProduct.sizes &&
                    quickViewProduct.sizes.length > 0 && (
                      <div className="mt-4">
                        <span className={`text-xs block mb-1.5 ${t.mutedText}`}>
                          {lang === "bn" ? "সাইজ নির্বাচন করুন:" : "Select Size:"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {quickViewProduct.sizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                setSelectedSizes({
                                  ...selectedSizes,
                                  [quickViewProduct.id]: sz,
                                })
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                (selectedSizes[quickViewProduct.id] ||
                                  quickViewProduct.sizes?.[0]) === sz
                                  ? t.chipActive
                                  : t.chipIdle
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {quickViewProduct.colors &&
                    quickViewProduct.colors.length > 0 && (
                      <div className="mt-3">
                        <span className={`text-xs block mb-1.5 ${t.mutedText}`}>
                          {lang === "bn"
                            ? "কালার নির্বাচন করুন:"
                            : "Select Color:"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {quickViewProduct.colors.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() =>
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [quickViewProduct.id]: col,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                (selectedColors[quickViewProduct.id] ||
                                  quickViewProduct.colors?.[0]) === col
                                  ? t.chipActive
                                  : t.chipIdle
                              }`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = quickViewProduct;
                    setQuickViewProduct(null);
                    addToCart(target, true);
                  }}
                  className={`w-full text-sm font-extrabold py-3 rounded-xl transition cursor-pointer ${t.silverCta}`}
                >
                  {lang === "bn"
                    ? `কার্টে যোগ করুন — ৳${quickViewProduct.price}`
                    : `Add to Cart — ৳${quickViewProduct.price}`}
                </button>
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div
                className={`p-5 border-t space-y-3 ${t.surfaceAlt} ${
                  isLight ? "border-zinc-200" : "border-zinc-800"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${t.mutedText}`}
                >
                  {lang === "bn" ? "রিলেটেড প্রোডাক্টস" : "Related Products"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => setQuickViewProduct(rel)}
                      className={`text-left p-2 rounded-2xl transition cursor-pointer ${t.surface} ${
                        isLight
                          ? "hover:border-zinc-400"
                          : "hover:border-zinc-600"
                      }`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-1.5">
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p
                        className={`text-xs font-semibold truncate ${t.titleText}`}
                      >
                        {rel.name}
                      </p>
                      <p className={`text-xs font-extrabold ${t.bodyText}`}>
                        ৳{rel.price}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-First Cart & Checkout Drawer */}
      {isMounted && isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-md h-full flex flex-col justify-between overflow-y-auto p-5 sm:p-6 shadow-2xl border-l ${
              isLight
                ? "bg-[#F4F4F6] text-zinc-900 border-zinc-200"
                : "bg-[#0E0E12] text-zinc-100 border-zinc-800"
            }`}
          >
            <div>
              <div
                className={`flex items-center justify-between pb-4 border-b ${
                  isLight ? "border-zinc-200" : "border-zinc-800"
                }`}
              >
                <h2 className={`text-lg font-bold ${t.titleText}`}>
                  {orderSuccess
                    ? lang === "bn"
                      ? "অর্ডার নিশ্চিত হয়েছে"
                      : "Order Confirmation"
                    : lang === "bn"
                    ? `কার্ট ও চেকআউট (${totalCartCount})`
                    : `Cart & Checkout (${totalCartCount})`}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveBottomTab("home");
                  }}
                  className={`p-2 rounded-full cursor-pointer ${t.pillBtn}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs mt-3 ${t.mutedText}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveBottomTab("home");
                  }}
                  className={`font-medium hover:underline cursor-pointer ${t.bodyText}`}
                >
                  {lang === "bn" ? "হোম" : "Home"}
                </button>
                <span>&gt;</span>
                <span className={`font-semibold ${t.titleText}`}>
                  {lang === "bn" ? "শপিং কার্ট" : "Shopping Cart"}
                </span>
              </div>

              {orderSuccess ? (
                <div
                  className={`my-6 text-center p-6 rounded-3xl space-y-3 ${t.surface}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                      isLight ? "bg-zinc-100" : "bg-zinc-800"
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className={`text-xl font-bold ${t.titleText}`}>
                    {lang === "bn" ? "অর্ডার কনফার্ম হয়েছে!" : "Order Confirmed!"}
                  </h3>
                  <p className={`text-xs ${t.mutedText}`}>
                    {lang === "bn" ? "অর্ডার আইডি:" : "Order Reference:"}{" "}
                    <span className={`font-mono font-semibold ${t.titleText}`}>
                      {confirmedOrderId}
                    </span>
                  </p>
                  <p className={`text-sm leading-relaxed ${t.mutedText}`}>
                    {lang === "bn"
                      ? `${BRAND_NAME}-এ আপনার অর্ডারটি গৃহীত হয়েছে। ডেলিভারি নিশ্চিত করতে আমাদের টিম শীঘ্রই যোগাযোগ করবে।`
                      : `Your ${BRAND_NAME} order has been received. Our team will contact you shortly to confirm delivery.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSuccess(false);
                      setIsCartOpen(false);
                      setActiveBottomTab("home");
                    }}
                    className={`mt-3 w-full text-sm font-extrabold py-3 rounded-2xl transition cursor-pointer ${t.silverCta}`}
                  >
                    {lang === "bn" ? "শপিং চালিয়ে যান" : "Continue Shopping"}
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div
                  className={`text-center my-14 text-sm space-y-3 ${t.mutedText}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${t.surfaceAlt}`}
                  >
                    <ShoppingBag className={`w-6 h-6 ${t.mutedText}`} />
                  </div>
                  <p className={`font-semibold ${t.titleText}`}>
                    {lang === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty"}
                  </p>
                  <p className={`text-xs ${t.mutedText}`}>
                    {lang === "bn"
                      ? "পছন্দের ফ্যাশন, ফুটওয়্যার, বিউটি ও গ্যাজেট থেকে প্রোডাক্ট যোগ করুন।"
                      : "Explore fashion, footwear, beauty, gadgets & accessories."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveBottomTab("home");
                    }}
                    className={`text-xs font-extrabold px-5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5 ${t.silverCta}`}
                  >
                    <span>
                      {lang === "bn" ? "শপিং শুরু করুন" : "Start shopping"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`rounded-2xl divide-y my-4 px-4 ${t.surface} ${
                      isLight ? "divide-zinc-200" : "divide-zinc-800"
                    }`}
                  >
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.selectedOption}-${item.selectedColor}`}
                        className="py-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4
                            className={`font-semibold text-sm truncate ${t.titleText}`}
                          >
                            {item.product.name}
                          </h4>
                          <span className={`text-xs block ${t.mutedText}`}>
                            {item.selectedOption
                              ? `${lang === "bn" ? "সাইজ:" : "Size:"} ${
                                  item.selectedOption
                                } `
                              : ""}
                            {item.selectedColor
                              ? `• ${item.selectedColor}`
                              : ""}
                          </span>
                          <p
                            className={`text-sm font-bold mt-0.5 ${t.bodyText}`}
                          >
                            ৳{item.product.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(idx, -1)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${t.pillBtn}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`text-sm font-bold w-5 text-center ${t.titleText}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(idx, 1)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${t.pillBtn}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-full ml-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isAuthenticatedCustomer ? (
                    <div
                      className={`rounded-2xl p-5 space-y-3 text-center ${t.surface}`}
                    >
                      <p className={`text-sm font-bold ${t.titleText}`}>
                        {lang === "bn"
                          ? "ফেক অর্ডার রোধে অর্ডার করার আগে লগইন বা সাইন আপ আবশ্যক"
                          : "Login or Sign Up required before placing an order"}
                      </p>
                      <p className={`text-xs ${t.mutedText}`}>
                        {lang === "bn"
                          ? "আপনার অ্যাকাউন্টে সাইন ইন করে নিরাপদে অর্ডার সম্পন্ন করুন।"
                          : "Sign in or create an account to continue checkout and prevent fake orders."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          openAccountModal();
                        }}
                        className={`w-full text-sm font-extrabold py-3 rounded-xl transition cursor-pointer ${t.silverCta}`}
                      >
                        {lang === "bn"
                          ? "লগইন / সাইন আপ করুন"
                          : "Login / Sign Up"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceOrder} className="space-y-3">
                      <div className={`rounded-2xl p-4 space-y-3 ${t.surface}`}>
                        <h3 className={`font-bold text-sm ${t.titleText}`}>
                          {lang === "bn" ? "ডেলিভারি তথ্য" : "Delivery Details"}
                        </h3>

                        <input
                          type="text"
                          required
                          placeholder={
                            lang === "bn" ? "পুরো নাম *" : "Full Name *"
                          }
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${t.input}`}
                        />

                        <input
                          type="tel"
                          required
                          placeholder={
                            lang === "bn"
                              ? "ফোন নম্বর (যেমন: 017XXXXXXXX) *"
                              : "Phone Number (e.g. 017XXXXXXXX) *"
                          }
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${t.input}`}
                        />

                        <input
                          type="text"
                          required
                          placeholder={
                            lang === "bn"
                              ? "জেলা (যেমন: Mymensingh, Dhaka) *"
                              : "District (e.g. Mymensingh, Dhaka) *"
                          }
                          value={customerDistrict}
                          onChange={(e) => setCustomerDistrict(e.target.value)}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${t.input}`}
                        />

                        <textarea
                          required
                          rows={2}
                          placeholder={
                            lang === "bn"
                              ? "বিস্তারিত ঠিকানা (বাসা, রোড, এলাকা) *"
                              : "Full Address (House, Road, Area) *"
                          }
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${t.input}`}
                        />

                        <input
                          type="text"
                          placeholder={
                            lang === "bn"
                              ? "অর্ডার নোট (ঐচ্ছিক)"
                              : "Order notes (optional)"
                          }
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${t.input}`}
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setDeliveryZone("mymensingh")}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              deliveryZone === "mymensingh"
                                ? t.chipActive
                                : t.chipIdle
                            }`}
                          >
                            {lang === "bn"
                              ? `ময়মনসিংহের ভেতরে (৳${deliveryConfig.insideMymensingh})`
                              : `Inside Mymensingh (৳${deliveryConfig.insideMymensingh})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeliveryZone("outside")}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              deliveryZone === "outside"
                                ? t.chipActive
                                : t.chipIdle
                            }`}
                          >
                            {lang === "bn"
                              ? `ময়মনসিংহের বাইরে (৳${deliveryConfig.outsideMymensingh})`
                              : `Outside Mymensingh (৳${deliveryConfig.outsideMymensingh})`}
                          </button>
                        </div>

                        <div className="pt-1">
                          <span
                            className={`text-xs font-semibold block mb-1.5 ${t.mutedText}`}
                          >
                            {lang === "bn"
                              ? "পেমেন্ট মেথড:"
                              : "Payment Method:"}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(
                              [
                                "Cash on Delivery",
                                "bKash",
                                "Nagad",
                                "Rocket",
                              ] as const
                            ).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                                  paymentMethod === method
                                    ? t.chipActive
                                    : t.chipIdle
                                }`}
                              >
                                {method === "Cash on Delivery"
                                  ? "COD"
                                  : method}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(isMobileWalletPayment || advancePayableNow > 0) && (
                          <div
                            className={`p-3 rounded-2xl space-y-2 text-xs ${t.surfaceAlt}`}
                          >
                            <p className={`font-semibold ${t.bodyText}`}>
                              {lang === "bn"
                                ? `এখন ডেলিভারি চার্জ (৳${advancePayableNow}) পেমেন্ট করুন:`
                                : `Pay Delivery Charge Now (৳${advancePayableNow}):`}
                            </p>
                            {isMobileWalletPayment ? (
                              <p className={`font-semibold ${t.bodyText}`}>
                                {paymentMethod} Send Money Number:{" "}
                                <span
                                  className={`font-mono font-bold ${t.titleText}`}
                                >
                                  {activeWalletNumber}
                                </span>
                              </p>
                            ) : (
                              <div className={`space-y-0.5 ${t.mutedText}`}>
                                <p>
                                  bKash:{" "}
                                  <span
                                    className={`font-mono font-bold ${t.titleText}`}
                                  >
                                    {deliveryConfig.bkashNumber || "01782141520"}
                                  </span>
                                </p>
                                <p>
                                  Nagad:{" "}
                                  <span
                                    className={`font-mono font-bold ${t.titleText}`}
                                  >
                                    {deliveryConfig.nagadNumber || "01782141520"}
                                  </span>
                                </p>
                                <p>
                                  Rocket:{" "}
                                  <span
                                    className={`font-mono font-bold ${t.titleText}`}
                                  >
                                    {deliveryConfig.rocketNumber ||
                                      "015339196489"}
                                  </span>
                                </p>
                              </div>
                            )}
                            <input
                              type="tel"
                              required={advancePayableNow > 0}
                              placeholder={
                                lang === "bn"
                                  ? "সেন্ডার মোবাইল নম্বর (017XXXXXXXX) *"
                                  : "Sender Mobile Number (017XXXXXXXX) *"
                              }
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${t.input}`}
                            />
                            <input
                              type="text"
                              required={advancePayableNow > 0}
                              placeholder={
                                lang === "bn"
                                  ? "ট্রানজ্যাকশন আইডি (TrxID) *"
                                  : "Transaction ID (TrxID) *"
                              }
                              value={trxId}
                              onChange={(e) => setTrxId(e.target.value)}
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${t.input}`}
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl p-4 space-y-2 text-sm ${t.surface}`}
                      >
                        <div className={`flex justify-between ${t.mutedText}`}>
                          <span>
                            {lang === "bn" ? "সাবটোটাল" : "Subtotal"}
                          </span>
                          <span className={`font-semibold ${t.titleText}`}>
                            ৳{subtotal}
                          </span>
                        </div>
                        <div className={`flex justify-between ${t.mutedText}`}>
                          <span>
                            {lang === "bn"
                              ? "ডেলিভারি চার্জ"
                              : "Delivery Charge"}
                          </span>
                          <span className={`font-semibold ${t.titleText}`}>
                            {deliveryCharge === 0
                              ? lang === "bn"
                                ? "ফ্রি (৳0)"
                                : "Free (৳0)"
                              : `৳${deliveryCharge}`}
                          </span>
                        </div>
                        <div
                          className={`flex justify-between font-bold text-base pt-2 border-t ${t.titleText} ${
                            isLight ? "border-zinc-200" : "border-zinc-800"
                          }`}
                        >
                          <span>
                            {lang === "bn" ? "সর্বমোট বিল" : "Total Payable"}
                          </span>
                          <span>৳{grandTotal}</span>
                        </div>
                        <div
                          className={`pt-2 mt-1 border-t space-y-1.5 text-xs ${
                            isLight ? "border-zinc-200" : "border-zinc-800"
                          }`}
                        >
                          <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                            <span>
                              {lang === "bn"
                                ? "এখন পরিশোধযোগ্য (ডেলিভারি চার্জ)"
                                : "Pay Delivery Charge Now"}
                            </span>
                            <span>৳{advancePayableNow}</span>
                          </div>
                          <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                            <span>
                              {lang === "bn"
                                ? "ডেলিভারির সময় বাকি (COD)"
                                : "Remaining COD on Delivery"}
                            </span>
                            <span>৳{codDueAtDelivery}</span>
                          </div>
                        </div>
                      </div>

                      {orderError && (
                        <p className="text-xs text-rose-500 font-medium px-1">
                          {orderError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingOrder}
                        className={`w-full disabled:opacity-50 font-extrabold py-3.5 rounded-2xl transition shadow-md cursor-pointer ${t.silverCta}`}
                      >
                        {submittingOrder
                          ? lang === "bn"
                            ? "অর্ডার প্রসেস হচ্ছে..."
                            : "Placing Order..."
                          : lang === "bn"
                          ? `অর্ডার কনফার্ম করুন (অগ্রিম ৳${advancePayableNow} + COD ৳${codDueAtDelivery})`
                          : `Confirm Order (Pay ৳${advancePayableNow} Now + ৳${codDueAtDelivery} COD)`}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}