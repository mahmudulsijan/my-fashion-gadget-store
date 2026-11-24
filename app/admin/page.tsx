"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  LogOut,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Search,
  ExternalLink,
  Upload,
  X,
  Pencil,
  Eye,
  EyeOff,
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Menu,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Mail,
  Star,
  Palette,
  Images,
  Link2,
  Sun,
  Moon,
} from "lucide-react";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  colorImages?: Record<string, string>;
  badge?: string;
  sizes?: string[];
  colors?: string[];
  specs?: string;
  description?: string;
  stock?: number;
}

interface OrderProductLine {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface OrderItem {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderProductLine[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

interface SubscriberItem {
  _id: string;
  email: string;
  createdAt?: string;
}

interface CustomerReviewItem {
  id: string;
  productId?: string;
  name: string;
  rating: number;
  comment: string;
  photo?: string;
}

interface LoggedInUserRecord {
  id: string;
  name: string;
  email: string;
  provider: string;
  district?: string;
  address?: string;
  verified?: boolean;
  lastActiveAt?: string;
  isLocalOnly?: boolean;
}

interface CustomerProfileSummary {
  phone: string;
  name: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  orders: OrderItem[];
}

interface DeliverySettings {
  insideMymensinghCharge: number;
  outsideMymensinghCharge: number;
  freeDeliveryThreshold: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
}

type AdminSection =
  | "overview"
  | "sales"
  | "orders"
  | "products"
  | "customers"
  | "users"
  | "subscribers"
  | "reviews"
  | "settings";

type SalesPeriodTab = "daily" | "monthly" | "yearly";
type ThemeMode = "night" | "day";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const SUPPORT_EMAIL = "maveron.store@gmail.com";
const LOGO_SRC = "/images/maveron-logo.png";
const REVIEWS_STORAGE_KEY = "maveron_simple_reviews";
const REGISTERED_ACCOUNTS_KEY = "maveron_registered_accounts";
const CUSTOMER_PROFILE_KEY = "maveron_user";
const THEME_STORAGE_KEY = "fg_admin_theme_mode";

const STORE_SUBCATEGORIES = [
  "Men's Fashion",
  "Women's Fashion",
  "Men's Footwear",
  "Women's Footwear",
  "Gadgets",
  "Beauty Products",
  "Mobile Accessories",
] as const;

const QUICK_COLOR_PRESETS = [
  "Black",
  "White",
  "Midnight Blue",
  "Silver",
  "Gold",
] as const;

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  insideMymensinghCharge: 70,
  outsideMymensinghCharge: 130,
  freeDeliveryThreshold: 0,
  bkashNumber: "01782141520",
  nagadNumber: "01782141520",
  rocketNumber: "015339196489",
};

async function safeParseJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text };
  }
}

function parseOrderDate(raw?: string): Date {
  if (!raw) return new Date(0);
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function isSameLocalDay(d: Date, ref: Date): boolean {
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function isSameLocalMonth(d: Date, ref: Date): boolean {
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  );
}

function isSameLocalYear(d: Date, ref: Date): boolean {
  return d.getFullYear() === ref.getFullYear();
}

function deriveMainCategory(subCat?: string): "fashion" | "gadget" {
  const val = (subCat || "").trim().toLowerCase();
  if (
    val === "gadgets" ||
    val === "mobile accessories" ||
    val.includes("gadget") ||
    val.includes("mobile") ||
    val.includes("tech")
  ) {
    return "gadget";
  }
  return "fashion";
}

function normalizeSubCategoryLabel(raw?: string, fallbackCat?: string): string {
  const val = (raw || "").trim().toLowerCase();
  if (val.includes("women") && (val.includes("foot") || val.includes("shoe")))
    return "Women's Footwear";
  if (val.includes("men") && (val.includes("foot") || val.includes("shoe")))
    return "Men's Footwear";
  if (val.includes("women") && val.includes("fashion")) return "Women's Fashion";
  if (val.includes("men") && val.includes("fashion")) return "Men's Fashion";
  if (val.includes("beauty")) return "Beauty Products";
  if (val.includes("mobile")) return "Mobile Accessories";
  if (val.includes("gadget")) return "Gadgets";

  const matched = STORE_SUBCATEGORIES.find(
    (item) => item.toLowerCase() === val
  );
  if (matched) return matched;

  if ((fallbackCat || "").toLowerCase().includes("gadget")) return "Gadgets";
  return "Men's Fashion";
}

function isFootwearSubCategory(subCat?: string): boolean {
  const val = (subCat || "").toLowerCase();
  return (
    val.includes("shoe") ||
    val.includes("sneaker") ||
    val.includes("boot") ||
    val.includes("loafer") ||
    val.includes("sandal") ||
    val.includes("footwear")
  );
}

function isGarmentOrFootwearWithSizes(subCat?: string): boolean {
  const val = (subCat || "").toLowerCase();
  return !val.includes("beauty");
}

function getDefaultSizesForSubCategory(subCat?: string): string[] {
  return isFootwearSubCategory(subCat)
    ? ["40", "41", "42", "43"]
    : ["M", "L", "XL"];
}

function parseCommaList(rawText: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of rawText.split(",")) {
    const cleaned = part.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }
  return result;
}

function appendPresetToText(currentText: string, preset: string): string {
  const list = parseCommaList(currentText);
  const exists = list.some(
    (item) => item.toLowerCase() === preset.toLowerCase()
  );
  if (exists) return list.join(", ");
  return [...list, preset].join(", ");
}

function collectProductImages(prod: {
  image?: string;
  images?: string[];
}): string[] {
  const list: string[] = [];
  if (Array.isArray(prod.images)) {
    for (const img of prod.images) {
      if (typeof img === "string" && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    }
  }
  if (typeof prod.image === "string" && prod.image.trim()) {
    const main = prod.image.trim();
    if (!list.includes(main)) {
      list.unshift(main);
    }
  }
  return list;
}

function buildColorImageMap(
  colors: string[],
  images: string[]
): Record<string, string> {
  const map: Record<string, string> = {};
  if (colors.length === 0 || images.length === 0) return map;
  colors.forEach((col, idx) => {
    const key = col.trim().toLowerCase();
    const mappedImg = images[idx] || images[idx % images.length] || images[0];
    if (key && mappedImg) {
      map[key] = mappedImg;
    }
  });
  return map;
}

function getStatusBadgeStyle(status: string, isDay: boolean) {
  if (isDay) {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  switch (status) {
    case "Delivered":
      return "bg-emerald-950/70 text-emerald-300 border-emerald-800/60";
    case "Shipped":
      return "bg-sky-950/70 text-sky-300 border-sky-800/60";
    case "Confirmed":
      return "bg-indigo-950/70 text-indigo-300 border-indigo-800/60";
    case "Cancelled":
      return "bg-rose-950/70 text-rose-300 border-rose-800/60";
    default:
      return "bg-amber-950/70 text-amber-300 border-amber-800/60";
  }
}

function extractPaymentInfo(addressText?: string) {
  const raw = addressText || "";
  let method = "Cash on Delivery";
  if (/bkash/i.test(raw)) method = "bKash";
  else if (/nagad/i.test(raw)) method = "Nagad";
  else if (/rocket/i.test(raw)) method = "Rocket";

  const trxMatch = raw.match(
    /(?:trx(?:id)?|transaction(?:\s*id)?)\s*[:#-]?\s*([a-zA-Z0-9_-]{4,24})/i
  );
  const trxId = trxMatch ? trxMatch[1] : null;

  return { method, trxId };
}

function isWalletMethod(method: string) {
  return method === "bKash" || method === "Nagad" || method === "Rocket";
}

async function compressImageToDataUrl(
  file: File,
  maxWidth = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ফাইল পড়তে সমস্যা হয়েছে"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("সঠিক ছবি ফাইল নয়"));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("night");
  const isDay = themeMode === "day";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [salesPeriodTab, setSalesPeriodTab] = useState<SalesPeriodTab>("daily");

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
  const [loggedInUsers, setLoggedInUsers] = useState<LoggedInUserRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingSubscriberId, setDeletingSubscriberId] = useState<
    string | null
  >(null);

  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<
    string | null
  >(null);

  const [autoDeductStock, setAutoDeductStock] = useState(true);
  const [deductedOrderIds, setDeductedOrderIds] = useState<string[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState<string>("all");
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  // Add Product Form State
  const [name, setName] = useState("");
  const [subCategory, setSubCategory] = useState<string>("Men's Fashion");
  const category = useMemo(() => deriveMainCategory(subCategory), [subCategory]);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [badge, setBadge] = useState("New Arrival");
  const [sizesText, setSizesText] = useState("M, L, XL");
  const [colorsText, setColorsText] = useState("");
  const [specs, setSpecs] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("10");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("Men's Fashion");
  const editCategory = useMemo(
    () => deriveMainCategory(editSubCategory),
    [editSubCategory]
  );
  const [editPrice, setEditPrice] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");
  const [editStock, setEditStock] = useState("10");
  const [editBadge, setEditBadge] = useState("");
  const [editSizesText, setEditSizesText] = useState("");
  const [editColorsText, setEditColorsText] = useState("");
  const [editSpecs, setEditSpecs] = useState("");
  const [editImagesList, setEditImagesList] = useState<string[]>([]);
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delivery & Payment Settings State
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(
    DEFAULT_DELIVERY_SETTINGS
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Eye-comfort palette tokens (low glare in both Day & Night)
  const ui = useMemo(() => {
    if (isDay) {
      return {
        pageBg: "bg-[#F4F5F7] text-slate-800",
        sidebarBg: "bg-[#EBEEF2] text-slate-700 border-slate-300/80",
        headerBg: "bg-[#F4F5F7]/95 border-slate-200",
        cardBg: "bg-[#FCFcfd] border-slate-200/90",
        subCardBg: "bg-[#F1F3F6] border-slate-200/80",
        inputBg: "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-slate-500",
        mutedInputBg: "bg-[#F1F3F6] border-slate-200 text-slate-800",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-500",
        divider: "border-slate-200",
        hoverRow: "hover:bg-slate-100/80",
        navActive: "bg-slate-800 text-slate-100 font-semibold shadow-2xs",
        navIdle: "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900",
        primaryBtn:
          "bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold",
        secondaryBtn:
          "bg-white hover:bg-slate-100 text-slate-700 border-slate-300",
        footerBg: "bg-[#ECEFF3] border-slate-200 text-slate-500",
        barFill: "bg-slate-700",
        barTrack: "bg-slate-200",
      };
    }
    return {
      pageBg: "bg-[#0B0C0E] text-zinc-200",
      sidebarBg: "bg-[#111317] text-zinc-300 border-zinc-800/80",
      headerBg: "bg-[#0B0C0E]/95 border-zinc-800/80",
      cardBg: "bg-[#13151A] border-zinc-800/80",
      subCardBg: "bg-[#181B21] border-zinc-800/70",
      inputBg:
        "bg-[#181B21] border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500",
      mutedInputBg: "bg-[#181B21] border-zinc-800 text-zinc-200",
      textPrimary: "text-zinc-100",
      textSecondary: "text-zinc-300",
      textMuted: "text-zinc-400",
      divider: "border-zinc-800/80",
      hoverRow: "hover:bg-zinc-800/45",
      navActive: "bg-zinc-200 text-zinc-900 font-semibold shadow-2xs",
      navIdle: "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100",
      primaryBtn:
        "bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-semibold",
      secondaryBtn:
        "bg-[#181B21] hover:bg-zinc-800 text-zinc-200 border-zinc-700/80",
      footerBg: "bg-[#0F1115] border-zinc-800/80 text-zinc-400",
      barFill: "bg-zinc-300",
      barTrack: "bg-zinc-800",
    };
  }, [isDay]);

  const handleToggleTheme = () => {
    const next: ThemeMode = isDay ? "night" : "day";
    setThemeMode(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const loadLocalReviews = () => {
    try {
      const savedReviews =
        localStorage.getItem(REVIEWS_STORAGE_KEY) ||
        localStorage.getItem("fg_simple_reviews");
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
          return;
        }
      }
      setReviews([]);
    } catch {
      setReviews([]);
    }
  };

  const loadLoggedInUsers = async () => {
    const mergedMap = new Map<string, LoggedInUserRecord>();

    try {
      const rawRegistered = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (rawRegistered) {
        const parsedReg = JSON.parse(rawRegistered);
        if (Array.isArray(parsedReg)) {
          parsedReg.forEach((acc: Record<string, unknown>, idx: number) => {
            const email = String(acc?.email || "").trim().toLowerCase();
            if (!email) return;
            mergedMap.set(email, {
              id: `reg-${email}-${idx}`,
              name: String(acc?.name || email.split("@")[0]),
              email,
              provider: String(acc?.provider || "email"),
              district: acc?.district ? String(acc.district) : undefined,
              address: acc?.address ? String(acc.address) : undefined,
              verified: Boolean(acc?.verified ?? true),
              lastActiveAt: acc?.lastActiveAt
                ? String(acc.lastActiveAt)
                : acc?.createdAt
                ? String(acc.createdAt)
                : undefined,
              isLocalOnly: true,
            });
          });
        }
      }
    } catch (err) {
      console.error("Failed to read registered accounts:", err);
    }

    try {
      const rawCurrent = localStorage.getItem(CUSTOMER_PROFILE_KEY);
      if (rawCurrent) {
        const parsedCur = JSON.parse(rawCurrent);
        const email = String(parsedCur?.email || "").trim().toLowerCase();
        if (email) {
          const prev = mergedMap.get(email);
          mergedMap.set(email, {
            id: prev?.id || `cur-${email}`,
            name: String(parsedCur?.name || prev?.name || email.split("@")[0]),
            email,
            provider: String(parsedCur?.provider || prev?.provider || "email"),
            district: parsedCur?.district
              ? String(parsedCur.district)
              : prev?.district,
            address: parsedCur?.address
              ? String(parsedCur.address)
              : prev?.address,
            verified: Boolean(parsedCur?.verified ?? prev?.verified ?? true),
            lastActiveAt:
              parsedCur?.loggedInAt ||
              parsedCur?.updatedAt ||
              prev?.lastActiveAt,
            isLocalOnly: true,
          });
        }
      }
    } catch (err) {
      console.error("Failed to read active customer profile:", err);
    }

    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) {
        const data = await safeParseJson(res);
        const apiUsers = Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : [];
        apiUsers.forEach((u: Record<string, unknown>, idx: number) => {
          const email = String(u?.email || "").trim().toLowerCase();
          if (!email) return;
          const prev = mergedMap.get(email);
          mergedMap.set(email, {
            id: String(u?._id || u?.id || prev?.id || `api-user-${idx}`),
            name: String(u?.name || prev?.name || email.split("@")[0]),
            email,
            provider: String(u?.provider || prev?.provider || "email"),
            district: u?.district ? String(u.district) : prev?.district,
            address: u?.address ? String(u.address) : prev?.address,
            verified: Boolean(u?.verified ?? prev?.verified ?? true),
            lastActiveAt: String(
              u?.lastLoginAt ||
                u?.updatedAt ||
                u?.createdAt ||
                prev?.lastActiveAt ||
                ""
            ),
            isLocalOnly: false,
          });
        });
      }
    } catch {
      // ignore if /api/users is not available
    }

    setLoggedInUsers(Array.from(mergedMap.values()));
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [prodRes, ordRes, subRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch(`/api/subscribers?t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const [prodData, ordData, subData] = await Promise.all([
        safeParseJson(prodRes),
        safeParseJson(ordRes),
        safeParseJson(subRes),
      ]);

      if (prodData.success && Array.isArray(prodData.products)) {
        setProducts(prodData.products);
      }
      if (ordData.success && Array.isArray(ordData.orders)) {
        setOrders(ordData.orders);
      }
      if (subData.success && Array.isArray(subData.subscribers)) {
        setSubscribers(subData.subscribers);
      }
      loadLocalReviews();
      await loadLoggedInUsers();
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    setCurrentDate(new Date());

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "day" || savedTheme === "night") {
        setThemeMode(savedTheme);
      }

      const savedDeducted = localStorage.getItem("fg_admin_deducted_orders");
      if (savedDeducted) {
        const parsedDeducted = JSON.parse(savedDeducted);
        if (Array.isArray(parsedDeducted)) {
          setDeductedOrderIds(parsedDeducted);
        }
      }

      const savedSettings = localStorage.getItem("fg_admin_delivery_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setDeliverySettings({
          insideMymensinghCharge: Number(
            parsed.insideMymensinghCharge ?? parsed.insideDhakaCharge ?? 70
          ),
          outsideMymensinghCharge: Number(
            parsed.outsideMymensinghCharge ?? parsed.outsideDhakaCharge ?? 130
          ),
          freeDeliveryThreshold: Number(parsed.freeDeliveryThreshold ?? 0),
          bkashNumber: String(
            parsed.bkashNumber || DEFAULT_DELIVERY_SETTINGS.bkashNumber
          ),
          nagadNumber: String(
            parsed.nagadNumber || DEFAULT_DELIVERY_SETTINGS.nagadNumber
          ),
          rocketNumber: String(
            parsed.rocketNumber || DEFAULT_DELIVERY_SETTINGS.rocketNumber
          ),
        });
      }
      loadLocalReviews();
      loadLoggedInUsers();
    } catch (err) {
      console.error("Failed to load admin settings:", err);
    }

    const savedAuth = sessionStorage.getItem("admin_authed");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await safeParseJson(res);
      if (data.success) {
        sessionStorage.setItem("admin_authed", "true");
        setIsAuthenticated(true);
        setPassword("");
        fetchDashboardData();
      } else {
        setAuthError(data.message || "ভুল পাসওয়ার্ড!");
      }
    } catch {
      setAuthError("লগইন করতে সমস্যা হয়েছে");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubCategoryChange = (nextSubCat: string) => {
    setSubCategory(nextSubCat);
    const nextMain = deriveMainCategory(nextSubCat);
    if (nextMain === "fashion") {
      if (isGarmentOrFootwearWithSizes(nextSubCat)) {
        setSizesText(getDefaultSizesForSubCategory(nextSubCat).join(", "));
      } else {
        setSizesText("");
      }
      if (badge === "1 Year Warranty") {
        setBadge("New Arrival");
      }
    } else if (badge === "New Arrival") {
      setBadge("1 Year Warranty");
    }
  };

  const handleMultipleFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "add" | "edit" = "add"
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      showToast("দয়া করে বৈধ ছবি ফাইল সিলেক্ট করুন");
      return;
    }

    setProcessingImage(true);
    try {
      const compressedList: string[] = [];
      for (const file of validFiles) {
        const dataUrl = await compressImageToDataUrl(file, 900, 0.78);
        compressedList.push(dataUrl);
      }

      if (target === "add") {
        setProductImages((prev) => {
          const merged = [...prev];
          for (const url of compressedList) {
            if (!merged.includes(url)) merged.push(url);
          }
          return merged;
        });
      } else {
        setEditImagesList((prev) => {
          const merged = [...prev];
          for (const url of compressedList) {
            if (!merged.includes(url)) merged.push(url);
          }
          return merged;
        });
      }

      showToast(`${compressedList.length}টি ছবি যুক্ত হয়েছে`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ছবি প্রসেস করতে সমস্যা হয়েছে";
      console.error("Image upload error:", err);
      showToast(msg);
    } finally {
      setProcessingImage(false);
      if (target === "add" && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (target === "edit" && editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    }
  };

  const handleAddImageUrl = (target: "add" | "edit") => {
    const raw =
      target === "add" ? imageUrlInput.trim() : editImageUrlInput.trim();
    if (!raw) return;

    const urls = raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    if (target === "add") {
      setProductImages((prev) => {
        const next = [...prev];
        for (const u of urls) {
          if (!next.includes(u)) next.push(u);
        }
        return next;
      });
      setImageUrlInput("");
    } else {
      setEditImagesList((prev) => {
        const next = [...prev];
        for (const u of urls) {
          if (!next.includes(u)) next.push(u);
        }
        return next;
      });
      setEditImageUrlInput("");
    }
    showToast(`${urls.length}টি Image URL যুক্ত হয়েছে`);
  };

  const handleRemoveImageAt = (index: number, target: "add" | "edit") => {
    if (target === "add") {
      setProductImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditImagesList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleMakePrimaryImage = (index: number, target: "add" | "edit") => {
    if (index === 0) return;
    if (target === "add") {
      setProductImages((prev) => {
        const copy = [...prev];
        const [picked] = copy.splice(index, 1);
        return [picked, ...copy];
      });
    } else {
      setEditImagesList((prev) => {
        const copy = [...prev];
        const [picked] = copy.splice(index, 1);
        return [picked, ...copy];
      });
    }
    showToast("Main ছবি আপডেট করা হয়েছে");
  };

  const handleClearAllAddImages = () => {
    setProductImages([]);
    setImageUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFinalAddImages = (): string[] => {
    const list = [...productImages];
    const pendingUrls = imageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    for (const u of pendingUrls) {
      if (!list.includes(u)) list.push(u);
    }
    return list;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = getFinalAddImages();
    if (!name.trim() || !price || finalImages.length === 0) {
      showToast("প্রোডাক্টের নাম, দাম এবং অন্তত ১টি ছবি দিন");
      return;
    }

    setCreatingProduct(true);

    const parsedSizes =
      category === "fashion" && isGarmentOrFootwearWithSizes(subCategory)
        ? parseCommaList(sizesText)
        : [];
    const parsedColors = parseCommaList(colorsText);
    const colorImageMap = buildColorImageMap(parsedColors, finalImages);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          subCategory,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          image: finalImages[0],
          images: finalImages,
          colorImages:
            Object.keys(colorImageMap).length > 0 ? colorImageMap : undefined,
          badge: badge.trim() || undefined,
          sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
          colors: parsedColors.length > 0 ? parsedColors : undefined,
          specs:
            category === "gadget" && specs.trim() ? specs.trim() : undefined,
          description: description.trim(),
          stock: Number(stock) || 10,
        }),
      });
      const data = await safeParseJson(res);
      if (data.success) {
        setName("");
        setPrice("");
        setOldPrice("");
        setColorsText("");
        handleClearAllAddImages();
        setSpecs("");
        setDescription("");
        setStock("10");
        showToast(
          `"${subCategory}" ক্যাটাগরিতে ${finalImages.length}টি ছবিসহ প্রোডাক্ট যোগ হয়েছে`
        );
        fetchDashboardData();
      } else {
        showToast(data.message || "প্রোডাক্ট যোগ করা যায়নি");
      }
    } catch (err) {
      console.error("Add product failed:", err);
      showToast("প্রোডাক্ট যোগ করতে সমস্যা হয়েছে");
    } finally {
      setCreatingProduct(false);
    }
  };

  const openEditModal = (prod: ProductItem) => {
    const normalizedSub = normalizeSubCategoryLabel(
      prod.subCategory,
      prod.category
    );
    const fallbackSizes = getDefaultSizesForSubCategory(normalizedSub);

    setEditingProduct(prod);
    setEditName(prod.name);
    setEditSubCategory(normalizedSub);
    setEditPrice(String(prod.price ?? ""));
    setEditOldPrice(prod.oldPrice ? String(prod.oldPrice) : "");
    setEditStock(String(prod.stock ?? 10));
    setEditBadge(prod.badge || "");
    setEditSizesText(
      (prod.sizes && prod.sizes.length > 0 ? prod.sizes : fallbackSizes).join(
        ", "
      )
    );
    setEditColorsText(
      prod.colors && prod.colors.length > 0 ? prod.colors.join(", ") : ""
    );
    setEditSpecs(prod.specs || "");
    setEditImagesList(collectProductImages(prod));
    setEditImageUrlInput("");
    setEditDescription(prod.description || "");
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mergedEditImages = [...editImagesList];
    const pendingEditUrls = editImageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    for (const u of pendingEditUrls) {
      if (!mergedEditImages.includes(u)) mergedEditImages.push(u);
    }

    if (
      !editingProduct ||
      !editName.trim() ||
      !editPrice ||
      mergedEditImages.length === 0
    )
      return;

    setSavingEdit(true);
    const parsedSizes =
      editCategory === "fashion" && isGarmentOrFootwearWithSizes(editSubCategory)
        ? parseCommaList(editSizesText)
        : [];
    const parsedColors = parseCommaList(editColorsText);
    const colorImageMap = buildColorImageMap(parsedColors, mergedEditImages);

    const payload = {
      name: editName.trim(),
      category: editCategory,
      subCategory: editSubCategory,
      price: Number(editPrice),
      oldPrice: editOldPrice ? Number(editOldPrice) : undefined,
      stock: Math.max(0, Number(editStock) || 0),
      badge: editBadge.trim() || undefined,
      sizes: parsedSizes.length > 0 ? parsedSizes : [],
      colors: parsedColors.length > 0 ? parsedColors : [],
      colorImages:
        Object.keys(colorImageMap).length > 0 ? colorImageMap : undefined,
      specs:
        editCategory === "gadget" && editSpecs.trim()
          ? editSpecs.trim()
          : undefined,
      image: mergedEditImages[0],
      images: mergedEditImages,
      description: editDescription.trim(),
    };

    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === editingProduct._id
              ? { ...item, ...payload, ...(data.product || {}) }
              : item
          )
        );
        setEditingProduct(null);
        showToast("প্রোডাক্ট, ছবি ও কালার আপডেট হয়েছে");
      } else {
        showToast(data.message || "আপডেট করা যায়নি (API PATCH চেক করুন)");
      }
    } catch (err) {
      console.error("Edit product failed:", err);
      showToast("প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStockChange = async (prod: ProductItem, delta: number) => {
    const currentStock = typeof prod.stock === "number" ? prod.stock : 10;
    const nextStock = Math.max(0, currentStock + delta);
    if (nextStock === currentStock) return;

    setStockUpdatingId(prod._id);
    try {
      const res = await fetch(`/api/products/${prod._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === prod._id ? { ...item, stock: nextStock } : item
          )
        );
        showToast(`${prod.name} স্টক: ${nextStock}`);
      } else {
        showToast(data.message || "স্টক আপডেট হয়নি");
      }
    } catch (err) {
      console.error("Quick stock failed:", err);
      showToast("স্টক আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setStockUpdatingId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setDeletingProductId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await safeParseJson(res);
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
        showToast("প্রোডাক্ট ডিলিট করা হয়েছে");
      } else {
        showToast(data.message || "ডিলিট করা যায়নি");
      }
    } catch (err) {
      console.error("Delete product failed:", err);
      showToast("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setDeletingProductId(null);
    }
  };

  const applyAutoStockForOrder = async (targetOrder: OrderItem) => {
    if (!autoDeductStock) return;
    if (deductedOrderIds.includes(targetOrder._id)) return;

    let deductedAny = false;
    const updatedProducts = [...products];

    for (const line of targetOrder.items || []) {
      const matchedIdx = updatedProducts.findIndex(
        (p) =>
          (line.productId && String(p._id) === String(line.productId)) ||
          p.name.trim().toLowerCase() === line.name.trim().toLowerCase()
      );
      if (matchedIdx === -1) continue;

      const prod = updatedProducts[matchedIdx];
      const currentStock = typeof prod.stock === "number" ? prod.stock : 10;
      const qtyToDeduct = Math.max(1, Number(line.quantity) || 1);
      const nextStock = Math.max(0, currentStock - qtyToDeduct);

      try {
        const res = await fetch(`/api/products/${prod._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nextStock }),
        });
        const data = await safeParseJson(res);
        if (res.ok && data.success) {
          updatedProducts[matchedIdx] = { ...prod, stock: nextStock };
          deductedAny = true;
        }
      } catch (err) {
        console.error("Auto stock deduction error:", err);
      }
    }

    if (deductedAny) {
      setProducts(updatedProducts);
    }

    const nextDeducted = [...deductedOrderIds, targetOrder._id];
    setDeductedOrderIds(nextDeducted);
    try {
      localStorage.setItem(
        "fg_admin_deducted_orders",
        JSON.stringify(nextDeducted)
      );
    } catch (err) {
      console.error("Failed to save deducted order id:", err);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    const targetOrder = orders.find((o) => o._id === orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await safeParseJson(res);
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
        setSelectedOrder((prev) =>
          prev && prev._id === orderId ? { ...prev, status } : prev
        );

        if (
          targetOrder &&
          (status === "Confirmed" || status === "Delivered")
        ) {
          await applyAutoStockForOrder(targetOrder);
        }

        showToast(`অর্ডার স্ট্যাটাস "${status}" আপডেট হয়েছে`);
      } else {
        showToast(data.message || "স্ট্যাটাস আপডেট হয়নি");
      }
    } catch (err) {
      console.error("Order status update failed:", err);
      showToast("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        if (selectedOrder?._id === orderId) setSelectedOrder(null);
        showToast("অর্ডার ডিলিট করা হয়েছে");
      } else {
        showToast(data.message || "অর্ডার ডিলিট হয়নি (DELETE API চেক করুন)");
      }
    } catch (err) {
      console.error("Delete order failed:", err);
      showToast("অর্ডার ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    setDeletingSubscriberId(id);
    try {
      const res = await fetch(
        `/api/subscribers?id=${encodeURIComponent(id)}&t=${Date.now()}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setSubscribers((prev) => prev.filter((item) => item._id !== id));
        showToast("সাবস্ক্রাইবার ডিলিট করা হয়েছে");
      } else {
        showToast(data.message || "সাবস্ক্রাইবার ডিলিট করা যায়নি");
      }
    } catch (err) {
      console.error("Delete subscriber failed:", err);
      showToast("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setDeletingSubscriberId(null);
    }
  };

  const handleDeleteLocalUser = async (user: LoggedInUserRecord) => {
    try {
      if (!user.isLocalOnly && user.id) {
        await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, {
          method: "DELETE",
        });
      }
      const rawRegistered = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (rawRegistered) {
        const parsed = JSON.parse(rawRegistered);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (acc: Record<string, unknown>) =>
              String(acc?.email || "").toLowerCase() !== user.email.toLowerCase()
          );
          localStorage.setItem(
            REGISTERED_ACCOUNTS_KEY,
            JSON.stringify(filtered)
          );
        }
      }
      const rawCurrent = localStorage.getItem(CUSTOMER_PROFILE_KEY);
      if (rawCurrent) {
        const cur = JSON.parse(rawCurrent);
        if (String(cur?.email || "").toLowerCase() === user.email.toLowerCase()) {
          localStorage.removeItem(CUSTOMER_PROFILE_KEY);
        }
      }
      setLoggedInUsers((prev) => prev.filter((u) => u.email !== user.email));
      showToast(`${user.email} ইউজার তথ্য মুছে ফেলা হয়েছে`);
    } catch {
      showToast("ইউজার তথ্য মুছতে সমস্যা হয়েছে");
    }
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.removeItem("fg_simple_reviews");
      showToast("রিভিউ মুছে ফেলা হয়েছে");
    } catch {
      showToast("রিভিউ মুছতে সমস্যা হয়েছে");
    }
  };

  const handleCopyText = async (
    text: string,
    idKey?: string,
    label = "কপি করা হয়েছে"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (idKey) {
        setCopiedId(idKey);
        window.setTimeout(() => setCopiedId(null), 1800);
      }
      showToast(label);
    } catch {
      showToast("কপি করা যায়নি");
    }
  };

  const handleCopyOrderSummary = (ord: OrderItem) => {
    const pay = extractPaymentInfo(ord.address);
    const itemsText = ord.items
      ?.map((i) => {
        const meta = [i.size, i.color].filter(Boolean).join(", ");
        return `- ${i.name}${meta ? ` (${meta})` : ""} ×${i.quantity} (৳${
          i.price * i.quantity
        })`;
      })
      .join("\n");
    const summary = [
      `Store: ${BRAND_NAME}`,
      `Order ID: ${ord._id}`,
      `Status: ${ord.status || "Pending"}`,
      `Payment: ${pay.method}${pay.trxId ? ` (TrxID: ${pay.trxId})` : ""}`,
      `Customer: ${ord.customerName}`,
      `Phone: ${ord.phone}`,
      `Address: ${ord.address}`,
      `Items:\n${itemsText}`,
      `Total: ৳${Number(ord.totalAmount).toLocaleString()}`,
    ].join("\n");
    handleCopyText(summary, `sum-${ord._id}`, "অর্ডার সামারি কপি করা হয়েছে");
  };

  const handleSaveDeliverySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: DeliverySettings = {
      insideMymensinghCharge: Math.max(
        0,
        Number(deliverySettings.insideMymensinghCharge) || 0
      ),
      outsideMymensinghCharge: Math.max(
        0,
        Number(deliverySettings.outsideMymensinghCharge) || 0
      ),
      freeDeliveryThreshold: Math.max(
        0,
        Number(deliverySettings.freeDeliveryThreshold) || 0
      ),
      bkashNumber:
        deliverySettings.bkashNumber.trim() ||
        DEFAULT_DELIVERY_SETTINGS.bkashNumber,
      nagadNumber:
        deliverySettings.nagadNumber.trim() ||
        DEFAULT_DELIVERY_SETTINGS.nagadNumber,
      rocketNumber:
        deliverySettings.rocketNumber.trim() ||
        DEFAULT_DELIVERY_SETTINGS.rocketNumber,
    };
    setDeliverySettings(cleaned);
    try {
      localStorage.setItem(
        "fg_admin_delivery_settings",
        JSON.stringify(cleaned)
      );
      showToast("ডেলিভারি ও মোবাইল ওয়ালেট সেটিংস সেভ হয়েছে");
    } catch {
      showToast("সেটিংস সেভ করা যায়নি");
    }
  };

  const effectiveOrderQuery = (orderSearch || globalSearch).trim().toLowerCase();
  const effectiveProductQuery = (productSearch || globalSearch)
    .trim()
    .toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus =
        statusFilter === "All" ||
        (ord.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
      const matchesQuery =
        !effectiveOrderQuery ||
        ord._id.toLowerCase().includes(effectiveOrderQuery) ||
        ord.customerName.toLowerCase().includes(effectiveOrderQuery) ||
        ord.phone.toLowerCase().includes(effectiveOrderQuery) ||
        (ord.address || "").toLowerCase().includes(effectiveOrderQuery);
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, effectiveOrderQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const normalizedSub = normalizeSubCategoryLabel(
        p.subCategory,
        p.category
      );
      const matchesCat =
        productCatFilter === "all" || normalizedSub === productCatFilter;
      const matchesQuery =
        !effectiveProductQuery ||
        p.name.toLowerCase().includes(effectiveProductQuery) ||
        normalizedSub.toLowerCase().includes(effectiveProductQuery) ||
        (p.colors || []).some((c) =>
          c.toLowerCase().includes(effectiveProductQuery)
        );
      return matchesCat && matchesQuery;
    });
  }, [products, productCatFilter, effectiveProductQuery]);

  const filteredSubscribers = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, globalSearch]);

  const filteredReviews = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
    );
  }, [reviews, globalSearch]);

  const filteredLoggedInUsers = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return loggedInUsers;
    return loggedInUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.provider.toLowerCase().includes(q) ||
        (u.district || "").toLowerCase().includes(q)
    );
  }, [loggedInUsers, globalSearch]);

  const salesReport = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");

    const sumOrders = (list: OrderItem[]) =>
      list.reduce((acc, item) => acc + (Number(item.totalAmount) || 0), 0);

    const countUnits = (list: OrderItem[]) =>
      list.reduce(
        (sum, ord) =>
          sum +
          (ord.items || []).reduce(
            (lineSum, line) => lineSum + (Number(line.quantity) || 1),
            0
          ),
        0
      );

    const allTimeRevenue = sumOrders(activeOrders);

    if (!currentDate) {
      return {
        dailyRevenue: 0,
        dailyCount: 0,
        dailyUnits: 0,
        monthlyRevenue: 0,
        monthlyCount: 0,
        monthlyUnits: 0,
        yearlyRevenue: 0,
        yearlyCount: 0,
        yearlyUnits: 0,
        allTimeRevenue,
        periodOrders: [] as OrderItem[],
        periodRevenue: 0,
        periodUnits: 0,
        avgOrderValue: 0,
      };
    }

    const dailyOrders = activeOrders.filter((o) =>
      isSameLocalDay(parseOrderDate(o.createdAt), currentDate)
    );
    const monthlyOrders = activeOrders.filter((o) =>
      isSameLocalMonth(parseOrderDate(o.createdAt), currentDate)
    );
    const yearlyOrders = activeOrders.filter((o) =>
      isSameLocalYear(parseOrderDate(o.createdAt), currentDate)
    );

    const dailyRevenue = sumOrders(dailyOrders);
    const monthlyRevenue = sumOrders(monthlyOrders);
    const yearlyRevenue = sumOrders(yearlyOrders);

    const periodOrders =
      salesPeriodTab === "daily"
        ? dailyOrders
        : salesPeriodTab === "monthly"
        ? monthlyOrders
        : yearlyOrders;

    const periodRevenue =
      salesPeriodTab === "daily"
        ? dailyRevenue
        : salesPeriodTab === "monthly"
        ? monthlyRevenue
        : yearlyRevenue;

    const periodUnits = countUnits(periodOrders);
    const avgOrderValue =
      periodOrders.length > 0 ? Math.round(periodRevenue / periodOrders.length) : 0;

    return {
      dailyRevenue,
      dailyCount: dailyOrders.length,
      dailyUnits: countUnits(dailyOrders),
      monthlyRevenue,
      monthlyCount: monthlyOrders.length,
      monthlyUnits: countUnits(monthlyOrders),
      yearlyRevenue,
      yearlyCount: yearlyOrders.length,
      yearlyUnits: countUnits(yearlyOrders),
      allTimeRevenue,
      periodOrders,
      periodRevenue,
      periodUnits,
      avgOrderValue,
    };
  }, [orders, salesPeriodTab, currentDate]);

  const customersList = useMemo<CustomerProfileSummary[]>(() => {
    const map = new Map<string, CustomerProfileSummary>();

    for (const ord of orders) {
      const key = (ord.phone || ord.customerName || "unknown").trim();
      const existing = map.get(key);
      const amt = ord.status === "Cancelled" ? 0 : Number(ord.totalAmount) || 0;
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += amt;
        existing.orders.push(ord);
        if (!existing.address && ord.address) existing.address = ord.address;
      } else {
        map.set(key, {
          phone: ord.phone,
          name: ord.customerName,
          address: ord.address,
          orderCount: 1,
          totalSpent: amt,
          orders: [ord],
        });
      }
    }

    return Array.from(map.values()).filter((c) => {
      if (!effectiveOrderQuery) return true;
      return (
        c.name.toLowerCase().includes(effectiveOrderQuery) ||
        c.phone.toLowerCase().includes(effectiveOrderQuery) ||
        c.address.toLowerCase().includes(effectiveOrderQuery)
      );
    });
  }, [orders, effectiveOrderQuery]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerPhone) return null;
    return (
      customersList.find((c) => c.phone === selectedCustomerPhone) || null
    );
  }, [customersList, selectedCustomerPhone]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const revenue = activeOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    );
    const pendingCount = orders.filter(
      (o) => (o.status || "Pending") === "Pending"
    ).length;
    const deliveredCount = orders.filter(
      (o) => o.status === "Delivered"
    ).length;
    const lowStockCount = products.filter(
      (p) => typeof p.stock === "number" && p.stock <= 3
    ).length;

    const categoryCounts = STORE_SUBCATEGORIES.map((label) => {
      const count = products.filter(
        (p) => normalizeSubCategoryLabel(p.subCategory, p.category) === label
      ).length;
      return { label, count };
    });

    const recentSeries = [...activeOrders]
      .slice(0, 7)
      .reverse()
      .map((o, i) => ({
        label: `#${i + 1}`,
        amount: Number(o.totalAmount) || 0,
      }));

    return {
      revenue,
      pendingCount,
      deliveredCount,
      lowStockCount,
      categoryCounts,
      recentSeries,
    };
  }, [orders, products]);

  const maxChartAmount = useMemo(() => {
    const maxVal = Math.max(
      ...stats.recentSeries.map((item) => item.amount),
      100
    );
    return maxVal;
  }, [stats.recentSeries]);

  const previewAddImages = getFinalAddImages();

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors ${ui.pageBg}`}
      >
        <form
          onSubmit={handleLogin}
          className={`relative z-10 border p-6 sm:p-8 rounded-3xl shadow-lg w-full max-w-md space-y-5 transition-colors ${ui.cardBg}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b pb-4 ${ui.divider}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={LOGO_SRC}
                alt={BRAND_NAME}
                className={`w-11 h-11 rounded-2xl object-contain p-1.5 border shrink-0 ${ui.mutedInputBg}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${ui.textMuted}`}
                >
                  {BRAND_TAGLINE}
                </p>
                <h1
                  className={`text-xl font-bold tracking-tight mt-0.5 ${ui.textPrimary}`}
                >
                  {BRAND_NAME} Admin
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDay ? "Switch to Night Mode" : "Switch to Day Mode"}
              className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${ui.secondaryBtn}`}
            >
              {isDay ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className={`block text-xs font-medium ${ui.textSecondary}`}>
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={`w-full border rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none transition ${ui.inputBg}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer ${ui.textMuted} hover:opacity-80`}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {authError && (
            <div
              className={`text-xs font-medium px-3.5 py-2.5 rounded-xl border ${
                isDay
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-rose-950/60 border-rose-800/60 text-rose-300"
              }`}
            >
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full py-3 rounded-xl text-sm tracking-wide transition cursor-pointer disabled:opacity-50 ${ui.primaryBtn}`}
          >
            {authLoading ? "Verifying Access..." : "Unlock Admin Panel"}
          </button>

          <div
            className={`pt-3 border-t flex items-center justify-between text-xs ${ui.divider} ${ui.textMuted}`}
          >
            <Link href="/" className="hover:underline font-medium">
              ← Back to {BRAND_NAME} Store
            </Link>
            <Link href="/track-order" className="hover:underline font-medium">
              Track Order
            </Link>
          </div>
        </form>
      </div>
    );
  }

  const navItems: {
    key: AdminSection;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      key: "overview",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      key: "sales",
      label: "Sales",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "orders",
      label: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: stats.pendingCount > 0 ? stats.pendingCount : undefined,
    },
    {
      key: "products",
      label: "Products",
      icon: <Package className="w-4 h-4" />,
      badge: products.length,
    },
    {
      key: "customers",
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      badge: customersList.length,
    },
    {
      key: "users",
      label: "Users",
      icon: <UserCheck className="w-4 h-4" />,
      badge: loggedInUsers.length,
    },
    {
      key: "subscribers",
      label: "Subscribers",
      icon: <Mail className="w-4 h-4" />,
      badge: subscribers.length,
    },
    {
      key: "reviews",
      label: "Reviews",
      icon: <Star className="w-4 h-4" />,
      badge: reviews.length,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleSelectSection = (sec: AdminSection) => {
    setActiveSection(sec);
    if (
      sec === "subscribers" ||
      sec === "orders" ||
      sec === "customers" ||
      sec === "sales"
    ) {
      fetchDashboardData();
    } else if (sec === "users") {
      loadLoggedInUsers();
    } else if (sec === "reviews") {
      loadLocalReviews();
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${ui.pageBg}`}
    >
      {feedbackMsg && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-md border ${
            isDay
              ? "bg-slate-800 text-slate-100 border-slate-700"
              : "bg-[#1C1F26] text-zinc-100 border-zinc-700"
          }`}
        >
          {feedbackMsg}
        </div>
      )}

      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex w-64 shrink-0 flex-col justify-between p-4 border-r transition-colors ${ui.sidebarBg}`}
        >
          <div className="space-y-6">
            <div className="px-2 pt-1 flex items-center gap-2.5">
              <img
                src={LOGO_SRC}
                alt={BRAND_NAME}
                className="h-8 w-auto object-contain rounded-md shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${ui.textMuted}`}
                >
                  {BRAND_TAGLINE}
                </p>
                <h2
                  className={`text-lg font-bold tracking-wider leading-tight ${ui.textPrimary}`}
                >
                  {BRAND_NAME}
                </h2>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectSection(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                      isActive ? ui.navActive : ui.navIdle
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </span>
                    {typeof item.badge === "number" && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? isDay
                              ? "bg-slate-700 text-slate-100 border-slate-600"
                              : "bg-zinc-900 text-zinc-100 border-zinc-700"
                            : ui.mutedInputBg
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={`space-y-2 pt-4 border-t ${ui.divider}`}>
            <Link
              href="/"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${ui.navIdle}`}
            >
              <span>Open Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("admin_authed");
                setIsAuthenticated(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isDay
                  ? "text-rose-700 hover:bg-rose-50"
                  : "text-rose-400 hover:bg-rose-950/50"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-2xs">
            <aside
              className={`w-64 h-full p-4 flex flex-col justify-between overflow-y-auto border-r ${ui.sidebarBg}`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${ui.textMuted}`}
                    >
                      Admin Menu
                    </p>
                    <h2
                      className={`text-base font-bold tracking-wider ${ui.textPrimary}`}
                    >
                      {BRAND_NAME}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`p-1.5 rounded-lg cursor-pointer ${ui.navIdle}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          handleSelectSection(item.key);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                          isActive ? ui.navActive : ui.navIdle
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          {item.label}
                        </span>
                        {typeof item.badge === "number" && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ui.mutedInputBg}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className={`space-y-2 pt-3 border-t ${ui.divider}`}>
                <Link
                  href="/"
                  className={`block px-3 py-2 rounded-xl text-xs font-medium ${ui.navIdle}`}
                >
                  Open Live Store →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("admin_authed");
                    setIsAuthenticated(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDay ? "text-rose-700 hover:bg-rose-50" : "text-rose-400 hover:bg-rose-950/50"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header
            className={`sticky top-0 z-20 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between gap-3 transition-colors ${ui.headerBg}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
                className={`lg:hidden p-2 rounded-xl border transition cursor-pointer ${ui.secondaryBtn}`}
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="truncate">
                <h1
                  className={`text-base sm:text-lg font-bold capitalize truncate ${ui.textPrimary}`}
                >
                  {activeSection}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`hidden sm:flex items-center border rounded-xl px-3 py-1.5 w-52 md:w-64 transition-colors ${ui.mutedInputBg}`}
              >
                <Search className={`w-4 h-4 mr-2 shrink-0 ${ui.textMuted}`} />
                <input
                  type="text"
                  placeholder="Search orders, users, items..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className={`bg-transparent text-xs sm:text-sm outline-none w-full ${ui.textPrimary} placeholder:${ui.textMuted}`}
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch("")}
                    className={`cursor-pointer ${ui.textMuted} hover:opacity-80`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Day / Night Mode Switch */}
              <button
                type="button"
                onClick={handleToggleTheme}
                title={isDay ? "Switch to Night Mode" : "Switch to Day Mode"}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${ui.secondaryBtn}`}
              >
                {isDay ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span className="hidden md:inline">Night</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden md:inline">Day</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={fetchDashboardData}
                title="Refresh data"
                className={`p-2 rounded-xl border transition cursor-pointer ${ui.secondaryBtn}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                />
              </button>

              <Link
                href="/"
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs transition ${ui.primaryBtn}`}
              >
                Store <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* 4 Key Stats Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-colors ${ui.cardBg}`}
              >
                <p className={`text-xs font-medium ${ui.textMuted}`}>
                  Total Revenue
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${ui.textPrimary}`}
                >
                  ৳{stats.revenue.toLocaleString()}
                </p>
                <p
                  className={`text-[11px] font-medium mt-1 ${
                    isDay ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  Today: ৳{salesReport.dailyRevenue.toLocaleString()} • Month: ৳
                  {salesReport.monthlyRevenue.toLocaleString()}
                </p>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-colors ${ui.cardBg}`}
              >
                <p className={`text-xs font-medium ${ui.textMuted}`}>
                  Total Orders
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${ui.textPrimary}`}
                >
                  {orders.length}
                </p>
                <p
                  className={`text-[11px] font-medium mt-1 ${
                    isDay ? "text-amber-700" : "text-amber-400"
                  }`}
                >
                  {stats.pendingCount} pending review
                </p>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-colors ${ui.cardBg}`}
              >
                <p className={`text-xs font-medium ${ui.textMuted}`}>
                  Logged-in Users
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${
                    isDay ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  {loggedInUsers.length}{" "}
                  <span
                    className={`text-xs font-semibold ${
                      isDay ? "text-amber-700" : "text-amber-400"
                    }`}
                  >
                    / {subscribers.length} sub
                  </span>
                </p>
                <p className={`text-[11px] font-medium mt-1 ${ui.textMuted}`}>
                  Accounts &amp; newsletter subscribers
                </p>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-colors ${ui.cardBg}`}
              >
                <p className={`text-xs font-medium ${ui.textMuted}`}>
                  Inventory &amp; Low Stock
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${ui.textPrimary}`}
                >
                  {products.length}{" "}
                  <span
                    className={`text-xs font-semibold ${
                      isDay ? "text-rose-700" : "text-rose-400"
                    }`}
                  >
                    ({stats.lowStockCount} low)
                  </span>
                </p>
                <p className={`text-[11px] font-medium mt-1 ${ui.textMuted}`}>
                  Stock ≤ 3 highlighted
                </p>
              </div>
            </div>

            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div
                    className={`lg:col-span-7 p-5 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
                        >
                          Sales Snapshot
                        </p>
                        <h2
                          className={`text-base sm:text-lg font-bold flex items-center gap-1.5 ${ui.textPrimary}`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Recent Active Orders Value
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSection("sales")}
                        className={`text-xs font-semibold border px-3 py-1 rounded-full transition cursor-pointer ${ui.secondaryBtn}`}
                      >
                        Full Sales Report →
                      </button>
                    </div>

                    {stats.recentSeries.length === 0 ? (
                      <p
                        className={`text-xs py-10 text-center ${ui.textMuted}`}
                      >
                        এখনো কোনো সক্রিয় অর্ডার ডাটা নেই।
                      </p>
                    ) : (
                      <div
                        className={`h-44 flex items-end gap-3 pt-4 px-2 border-b ${ui.divider}`}
                      >
                        {stats.recentSeries.map((pt, idx) => {
                          const heightPct = Math.max(
                            12,
                            Math.round((pt.amount / maxChartAmount) * 100)
                          );
                          return (
                            <div
                              key={`${pt.label}-${idx}`}
                              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                            >
                              <span
                                className={`text-[10px] font-semibold ${ui.textSecondary}`}
                              >
                                ৳{pt.amount}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full max-w-[38px] rounded-t-xl transition ${ui.barFill}`}
                              />
                              <span
                                className={`text-[11px] font-medium ${ui.textMuted}`}
                              >
                                {pt.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div
                    className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-colors ${ui.cardBg}`}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
                      >
                        Catalog Mix (7 Categories)
                      </p>
                      <h2
                        className={`text-base sm:text-lg font-bold mt-0.5 ${ui.textPrimary}`}
                      >
                        Products by Category
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {stats.categoryCounts.map((cat) => (
                        <div key={cat.label}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className={ui.textSecondary}>
                              {cat.label}
                            </span>
                            <span className={ui.textMuted}>
                              {cat.count} items
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full overflow-hidden ${ui.barTrack}`}
                          >
                            <div
                              style={{
                                width: `${
                                  products.length > 0
                                    ? Math.round(
                                        (cat.count / products.length) * 100
                                      )
                                    : 0
                                }%`,
                              }}
                              className={`h-full rounded-full ${ui.barFill}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`pt-2 border-t flex items-center justify-between text-xs ${ui.divider}`}
                    >
                      <span className={ui.textMuted}>
                        Auto-stock on Confirm/Deliver:
                      </span>
                      <span
                        className={`font-semibold ${
                          autoDeductStock
                            ? isDay
                              ? "text-emerald-700"
                              : "text-emerald-400"
                            : ui.textMuted
                        }`}
                      >
                        {autoDeductStock ? "Enabled" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <h2
                      className={`text-base sm:text-lg font-bold ${ui.textPrimary}`}
                    >
                      Recent Orders
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleSelectSection("orders")}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${ui.textSecondary}`}
                    >
                      Manage All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className={`text-sm py-4 text-center ${ui.textMuted}`}>
                      কোনো অর্ডার নেই।
                    </p>
                  ) : (
                    <div className={`divide-y ${ui.divider}`}>
                      {orders.slice(0, 5).map((ord) => {
                        const pay = extractPaymentInfo(ord.address);
                        return (
                          <div
                            key={ord._id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`font-semibold text-sm ${ui.textPrimary}`}
                                >
                                  {ord.customerName}
                                </span>
                                <span
                                  className={`text-xs font-mono ${ui.textMuted}`}
                                >
                                  {ord.phone}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                    ord.status || "Pending",
                                    isDay
                                  )}`}
                                >
                                  {ord.status || "Pending"}
                                </span>
                                {isWalletMethod(pay.method) && (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                      isDay
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                                    }`}
                                  >
                                    {pay.method}
                                    {pay.trxId ? ` • ${pay.trxId}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`text-sm font-bold ${ui.textPrimary}`}
                              >
                                ৳{Number(ord.totalAmount).toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(ord)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer ${ui.secondaryBtn}`}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SALES SECTION */}
            {activeSection === "sales" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => setSalesPeriodTab("daily")}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      ui.cardBg
                    } ${
                      salesPeriodTab === "daily"
                        ? isDay
                          ? "border-slate-700 ring-2 ring-slate-300"
                          : "border-zinc-400 ring-2 ring-zinc-700/60"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
                      >
                        Daily Sales (আজকের বিক্রি)
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isDay
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                        }`}
                      >
                        {salesReport.dailyCount} orders
                      </span>
                    </div>
                    <p
                      className={`text-2xl sm:text-3xl font-bold mt-2 ${ui.textPrimary}`}
                    >
                      ৳{salesReport.dailyRevenue.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1.5 ${ui.textMuted}`}>
                      Units sold today:{" "}
                      <strong className={ui.textSecondary}>
                        {salesReport.dailyUnits}
                      </strong>
                    </p>
                  </div>

                  <div
                    onClick={() => setSalesPeriodTab("monthly")}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      ui.cardBg
                    } ${
                      salesPeriodTab === "monthly"
                        ? isDay
                          ? "border-slate-700 ring-2 ring-slate-300"
                          : "border-zinc-400 ring-2 ring-zinc-700/60"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
                      >
                        Monthly Sales (চলতি মাসের বিক্রি)
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ui.mutedInputBg}`}
                      >
                        {salesReport.monthlyCount} orders
                      </span>
                    </div>
                    <p
                      className={`text-2xl sm:text-3xl font-bold mt-2 ${ui.textPrimary}`}
                    >
                      ৳{salesReport.monthlyRevenue.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1.5 ${ui.textMuted}`}>
                      Units sold this month:{" "}
                      <strong className={ui.textSecondary}>
                        {salesReport.monthlyUnits}
                      </strong>
                    </p>
                  </div>

                  <div
                    onClick={() => setSalesPeriodTab("yearly")}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      ui.cardBg
                    } ${
                      salesPeriodTab === "yearly"
                        ? isDay
                          ? "border-slate-700 ring-2 ring-slate-300"
                          : "border-zinc-400 ring-2 ring-zinc-700/60"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
                      >
                        Yearly Sales (চলতি বছরের বিক্রি)
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isDay
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                        }`}
                      >
                        {salesReport.yearlyCount} orders
                      </span>
                    </div>
                    <p
                      className={`text-2xl sm:text-3xl font-bold mt-2 ${ui.textPrimary}`}
                    >
                      ৳{salesReport.yearlyRevenue.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1.5 ${ui.textMuted}`}>
                      Units sold this year:{" "}
                      <strong className={ui.textSecondary}>
                        {salesReport.yearlyUnits}
                      </strong>{" "}
                      • All-time: ৳{salesReport.allTimeRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-5 sm:p-6 rounded-2xl border space-y-5 transition-colors ${ui.cardBg}`}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${ui.divider}`}
                  >
                    <div>
                      <h2
                        className={`text-lg font-bold capitalize ${ui.textPrimary}`}
                      >
                        {salesPeriodTab} Sales Detailed Report
                      </h2>
                      <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                        Cancelled অর্ডার বাদ দিয়ে প্রকৃত বিক্রির হিসাব দেখানো হচ্ছে।
                      </p>
                    </div>

                    <div
                      className={`inline-flex rounded-xl p-1 border self-start sm:self-auto ${ui.mutedInputBg}`}
                    >
                      {(["daily", "monthly", "yearly"] as SalesPeriodTab[]).map(
                        (tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setSalesPeriodTab(tab)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                              salesPeriodTab === tab
                                ? ui.navActive
                                : ui.textMuted
                            }`}
                          >
                            {tab}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-2 sm:grid-cols-4 gap-3 border rounded-2xl p-4 ${ui.subCardBg}`}
                  >
                    <div>
                      <p className={`text-[11px] font-medium ${ui.textMuted}`}>
                        Selected Period Revenue
                      </p>
                      <p
                        className={`text-base sm:text-lg font-bold mt-0.5 ${ui.textPrimary}`}
                      >
                        ৳{salesReport.periodRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] font-medium ${ui.textMuted}`}>
                        Valid Orders
                      </p>
                      <p
                        className={`text-base sm:text-lg font-bold mt-0.5 ${ui.textSecondary}`}
                      >
                        {salesReport.periodOrders.length}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] font-medium ${ui.textMuted}`}>
                        Total Items Sold
                      </p>
                      <p
                        className={`text-base sm:text-lg font-bold mt-0.5 ${
                          isDay ? "text-emerald-700" : "text-emerald-400"
                        }`}
                      >
                        {salesReport.periodUnits}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[11px] font-medium ${ui.textMuted}`}>
                        Avg. Order Value
                      </p>
                      <p
                        className={`text-base sm:text-lg font-bold mt-0.5 ${ui.textPrimary}`}
                      >
                        ৳{salesReport.avgOrderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {salesReport.periodOrders.length === 0 ? (
                    <p className={`text-sm py-8 text-center ${ui.textMuted}`}>
                      এই {salesPeriodTab} সময়ে এখনো কোনো সফল বা সক্রিয় অর্ডার নেই।
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr
                            className={`border-b ${ui.divider} ${ui.textMuted}`}
                          >
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">
                              Order ID
                            </th>
                            <th className="py-2.5 px-3 font-semibold">
                              Customer
                            </th>
                            <th className="py-2.5 px-3 font-semibold">
                              Payment
                            </th>
                            <th className="py-2.5 px-3 font-semibold">
                              Status
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-right">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${ui.divider}`}>
                          {salesReport.periodOrders.map((ord) => {
                            const pay = extractPaymentInfo(ord.address);
                            const dt = parseOrderDate(ord.createdAt);
                            return (
                              <tr
                                key={ord._id}
                                onClick={() => setSelectedOrder(ord)}
                                className={`transition cursor-pointer ${ui.hoverRow}`}
                              >
                                <td
                                  className={`py-3 px-3 text-xs whitespace-nowrap ${ui.textMuted}`}
                                >
                                  {dt.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td
                                  className={`py-3 px-3 font-mono text-xs ${ui.textSecondary}`}
                                >
                                  #{ord._id.slice(-6)}
                                </td>
                                <td
                                  className={`py-3 px-3 font-semibold ${ui.textPrimary}`}
                                >
                                  {ord.customerName}{" "}
                                  <span
                                    className={`font-mono text-xs ${ui.textMuted}`}
                                  >
                                    ({ord.phone})
                                  </span>
                                </td>
                                <td
                                  className={`py-3 px-3 text-xs font-medium ${ui.textSecondary}`}
                                >
                                  {pay.method}
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                      ord.status || "Pending",
                                      isDay
                                    )}`}
                                  >
                                    {ord.status || "Pending"}
                                  </span>
                                </td>
                                <td
                                  className={`py-3 px-3 font-bold text-right whitespace-nowrap ${ui.textPrimary}`}
                                >
                                  ৳{Number(ord.totalAmount).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS SECTION */}
            {activeSection === "orders" && (
              <div
                className={`p-4 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Customer Orders ({filteredOrders.length})
                    </h2>
                    <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                      Confirmed বা Delivered করলে অটো-স্টক গার্ড সক্রিয় থাকে।
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div
                      className={`flex items-center rounded-xl px-3 py-1.5 border ${ui.mutedInputBg}`}
                    >
                      <Search className={`w-4 h-4 mr-2 ${ui.textMuted}`} />
                      <input
                        type="text"
                        placeholder="Search phone, name or ID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className={`bg-transparent text-xs sm:text-sm outline-none w-full sm:w-52 ${ui.textPrimary}`}
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`border rounded-xl px-3 py-2 text-xs sm:text-sm font-medium outline-none cursor-pointer ${ui.mutedInputBg}`}
                    >
                      <option value="All">All Statuses</option>
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingData && orders.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    Loading orders...
                  </p>
                ) : filteredOrders.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    কোনো অর্ডার পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {filteredOrders.map((order) => {
                      const pay = extractPaymentInfo(order.address);
                      const wallet = isWalletMethod(pay.method);
                      const isStockDeducted = deductedOrderIds.includes(
                        order._id
                      );

                      return (
                        <div
                          key={order._id}
                          className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${ui.subCardBg}`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                  order.status || "Pending",
                                  isDay
                                )}`}
                              >
                                {order.status || "Pending"}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  wallet
                                    ? isDay
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                                    : ui.secondaryBtn
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                {pay.method}
                                {pay.trxId ? ` • TrxID: ${pay.trxId}` : ""}
                              </span>

                              {isStockDeducted && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    isDay
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                                  }`}
                                >
                                  Stock Deducted
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    order._id,
                                    order._id,
                                    "Order ID কপি করা হয়েছে"
                                  )
                                }
                                className={`inline-flex items-center gap-1 text-[11px] font-mono border px-2 py-0.5 rounded-md transition cursor-pointer ${ui.secondaryBtn}`}
                                title="Copy Order ID"
                              >
                                <span>ID: {order._id}</span>
                                {copiedId === order._id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            <p
                              className={`font-bold text-sm sm:text-base ${ui.textPrimary}`}
                            >
                              {order.customerName} —{" "}
                              <span className={`font-mono ${ui.textSecondary}`}>
                                {order.phone}
                              </span>
                            </p>

                            <p
                              className={`text-xs sm:text-sm break-words ${ui.textMuted}`}
                            >
                              {order.address}
                            </p>

                            <p
                              className={`text-xs sm:text-sm ${ui.textSecondary}`}
                            >
                              <span className={`font-semibold ${ui.textMuted}`}>
                                Items:
                              </span>{" "}
                              {order.items
                                ?.map((i) => {
                                  const meta = [i.size, i.color]
                                    .filter(Boolean)
                                    .join(", ");
                                  return `${i.name}${
                                    meta ? ` (${meta})` : ""
                                  } ×${i.quantity}`;
                                })
                                .join(", ")}
                            </p>

                            <p
                              className={`text-sm font-bold ${ui.textPrimary}`}
                            >
                              Total: ৳{Number(order.totalAmount).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap items-end gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className={`inline-flex items-center gap-1 border px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${ui.secondaryBtn}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>

                            <button
                              type="button"
                              disabled={deletingOrderId === order._id}
                              onClick={() => handleDeleteOrder(order._id)}
                              title="Delete order"
                              className={`inline-flex items-center gap-1 border px-2.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition cursor-pointer ${
                                isDay
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                  : "bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border-rose-800/60"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingOrderId === order._id
                                ? "..."
                                : "Delete"}
                            </button>

                            <div>
                              <label
                                className={`block text-[11px] font-medium mb-1 ${ui.textMuted}`}
                              >
                                Update Status
                              </label>
                              <select
                                disabled={updatingOrderId === order._id}
                                value={order.status || "Pending"}
                                onChange={(e) =>
                                  handleStatusChange(order._id, e.target.value)
                                }
                                className={`border rounded-xl px-3 py-2 text-sm font-medium outline-none disabled:opacity-50 cursor-pointer ${ui.inputBg}`}
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS SECTION */}
            {activeSection === "products" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleAddProduct}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-3 h-fit transition-colors ${ui.cardBg}`}
                >
                  <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                    Add New Product
                  </h2>

                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    required
                  />

                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-medium ${ui.textMuted}`}
                    >
                      Category (Auto-syncs to Storefront) *
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer ${ui.inputBg}`}
                    >
                      {STORE_SUBCATEGORIES.map((catLabel) => (
                        <option key={catLabel} value={catLabel}>
                          {catLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="number"
                      placeholder="Price (BDT) *"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Old Price (optional)"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Badge (e.g. Best Seller)"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                  </div>

                  {category === "fashion" &&
                  isGarmentOrFootwearWithSizes(subCategory) ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder={
                          isFootwearSubCategory(subCategory)
                            ? "Shoe Sizes (e.g. 40, 41, 42, 43)"
                            : "Sizes (e.g. M, L, XL)"
                        }
                        value={sizesText}
                        onChange={(e) => setSizesText(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                      <p className={`text-[11px] px-1 ${ui.textMuted}`}>
                        {isFootwearSubCategory(subCategory)
                          ? "Footwear size format (40, 41, 42, 43...)"
                          : "Garment size format (M, L, XL...)"}
                      </p>
                    </div>
                  ) : category === "gadget" ? (
                    <input
                      type="text"
                      placeholder="Specs (e.g. 36H Battery • Fast Charge)"
                      value={specs}
                      onChange={(e) => setSpecs(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                  ) : null}

                  <div
                    className={`space-y-1.5 border rounded-xl p-2.5 ${ui.subCardBg}`}
                  >
                    <label
                      className={`flex items-center gap-1.5 text-xs font-semibold ${ui.textSecondary}`}
                    >
                      <Palette className={`w-3.5 h-3.5 ${ui.textMuted}`} />
                      Available Colors (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black, Silver, Midnight Blue"
                      value={colorsText}
                      onChange={(e) => setColorsText(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {QUICK_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setColorsText((prev) =>
                              appendPresetToText(prev, preset)
                            )
                          }
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition cursor-pointer ${ui.secondaryBtn}`}
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`space-y-2 border rounded-xl p-3 ${ui.subCardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <label
                        className={`flex items-center gap-1.5 text-xs font-semibold ${ui.textSecondary}`}
                      >
                        <Images className={`w-3.5 h-3.5 ${ui.textMuted}`} />
                        Product Images ({previewAddImages.length}) *
                      </label>
                      {previewAddImages.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllAddImages}
                          className={`text-[11px] font-semibold hover:underline cursor-pointer ${
                            isDay ? "text-rose-700" : "text-rose-400"
                          }`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add Image URL (/images/1.jpg or https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl("add");
                          }
                        }}
                        className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none transition ${ui.inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl("add")}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${ui.secondaryBtn}`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultipleFilesChange(e, "add")}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={processingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full inline-flex items-center justify-center gap-1.5 border border-dashed py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${ui.secondaryBtn}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {processingImage
                        ? "Processing Photos..."
                        : "Upload Multiple Photos"}
                    </button>

                    {previewAddImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {previewAddImages.map((imgSrc, idx) => (
                          <div
                            key={`${idx}-${imgSrc.slice(0, 24)}`}
                            className={`relative group rounded-xl overflow-hidden border aspect-square ${ui.mutedInputBg}`}
                          >
                            <img
                              src={imgSrc}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-slate-900/85 text-slate-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                                Main
                              </span>
                            )}
                            <div className="absolute top-1 right-1 flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMakePrimaryImage(idx, "add")
                                  }
                                  title="Set as Main Image"
                                  className="bg-slate-900/85 text-slate-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md cursor-pointer"
                                >
                                  1st
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageAt(idx, "add")}
                                title="Remove image"
                                className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={creatingProduct || processingImage}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm disabled:opacity-50 transition cursor-pointer ${ui.primaryBtn}`}
                  >
                    <Plus className="w-4 h-4" />
                    {creatingProduct ? "Adding..." : "Add Product"}
                  </button>
                </form>

                {/* All Products List */}
                <div
                  className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      All Products ({filteredProducts.length})
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`flex items-center rounded-xl px-3 py-1.5 border ${ui.mutedInputBg}`}
                      >
                        <Search
                          className={`w-4 h-4 mr-1.5 ${ui.textMuted}`}
                        />
                        <input
                          type="text"
                          placeholder="Search product or color..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className={`bg-transparent text-xs outline-none w-36 sm:w-44 ${ui.textPrimary}`}
                        />
                      </div>

                      <select
                        value={productCatFilter}
                        onChange={(e) => setProductCatFilter(e.target.value)}
                        className={`border rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${ui.mutedInputBg}`}
                      >
                        <option value="all">All Categories</option>
                        {STORE_SUBCATEGORIES.map((catLabel) => (
                          <option key={catLabel} value={catLabel}>
                            {catLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                      {products.length === 0
                        ? "ডাটাবেজে এখনো কোনো প্রোডাক্ট নেই। বাম পাশ থেকে যোগ করুন।"
                        : "কোনো ম্যাচিং প্রোডাক্ট পাওয়া যায়নি।"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredProducts.map((prod) => {
                        const currentStock =
                          typeof prod.stock === "number" ? prod.stock : 10;
                        const isLowStock = currentStock <= 3;
                        const displaySubCat = normalizeSubCategoryLabel(
                          prod.subCategory,
                          prod.category
                        );
                        const allProdImgs = collectProductImages(prod);

                        return (
                          <div
                            key={prod._id}
                            className={`border rounded-2xl p-3.5 flex flex-col justify-between gap-3 ${ui.subCardBg}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={allProdImgs[0] || prod.image}
                                  alt={prod.name}
                                  className={`w-14 h-14 object-cover rounded-xl ${ui.mutedInputBg}`}
                                />
                                {allProdImgs.length > 1 && (
                                  <span
                                    className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      isDay
                                        ? "bg-slate-800 text-slate-100"
                                        : "bg-zinc-200 text-zinc-900"
                                    }`}
                                  >
                                    +{allProdImgs.length - 1}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`font-semibold text-sm truncate ${ui.textPrimary}`}
                                >
                                  {prod.name}
                                </p>
                                <p className={`text-xs ${ui.textMuted}`}>
                                  {displaySubCat} •{" "}
                                  <span className={`font-bold ${ui.textPrimary}`}>
                                    ৳{prod.price}
                                  </span>
                                  {prod.oldPrice ? (
                                    <span className="line-through opacity-60 ml-1">
                                      ৳{prod.oldPrice}
                                    </span>
                                  ) : null}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                      currentStock === 0
                                        ? isDay
                                          ? "bg-rose-50 text-rose-700 border-rose-200"
                                          : "bg-rose-950/70 text-rose-300 border-rose-800/60"
                                        : isLowStock
                                        ? isDay
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                                        : ui.secondaryBtn
                                    }`}
                                  >
                                    Stock: {currentStock}
                                  </span>
                                  {allProdImgs.length > 1 && (
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ui.secondaryBtn}`}
                                    >
                                      {allProdImgs.length} Photos
                                    </span>
                                  )}
                                  {prod.sizes && prod.sizes.length > 0 && (
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ui.secondaryBtn}`}
                                    >
                                      Sizes: {prod.sizes.join(", ")}
                                    </span>
                                  )}
                                  {prod.colors && prod.colors.length > 0 && (
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ui.secondaryBtn}`}
                                    >
                                      Colors: {prod.colors.join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`flex items-center justify-between gap-2 pt-2 border-t ${ui.divider}`}
                            >
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    stockUpdatingId === prod._id ||
                                    currentStock <= 0
                                  }
                                  onClick={() =>
                                    handleQuickStockChange(prod, -1)
                                  }
                                  title="Decrease stock"
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 cursor-pointer ${ui.secondaryBtn}`}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={stockUpdatingId === prod._id}
                                  onClick={() =>
                                    handleQuickStockChange(prod, 1)
                                  }
                                  title="Increase stock"
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40 cursor-pointer ${ui.secondaryBtn}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(prod)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border rounded-xl transition cursor-pointer ${ui.secondaryBtn}`}
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={deletingProductId === prod._id}
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border rounded-xl disabled:opacity-50 transition cursor-pointer ${
                                    isDay
                                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                      : "bg-rose-950/60 text-rose-300 border-rose-800/60 hover:bg-rose-900/70"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {deletingProductId === prod._id
                                    ? "..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOMERS SECTION */}
            {activeSection === "customers" && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Customers ({customersList.length})
                    </h2>
                    <p className={`text-xs ${ui.textMuted}`}>
                      যেকোনো কাস্টমারের উপর ক্লিক করলে তার সব অর্ডার ও প্রোডাক্টের বিস্তারিত দেখা যাবে।
                    </p>
                  </div>
                </div>

                {customersList.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    এখনো কোনো কাস্টমার অর্ডার রেকর্ড পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr
                          className={`border-b ${ui.divider} ${ui.textMuted}`}
                        >
                          <th className="py-2.5 px-3 font-semibold">Name</th>
                          <th className="py-2.5 px-3 font-semibold">Phone</th>
                          <th className="py-2.5 px-3 font-semibold">Address</th>
                          <th className="py-2.5 px-3 font-semibold">Orders</th>
                          <th className="py-2.5 px-3 font-semibold text-right">
                            Total Spent
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-right">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${ui.divider}`}>
                        {customersList.map((cust) => (
                          <tr
                            key={cust.phone}
                            onClick={() => setSelectedCustomerPhone(cust.phone)}
                            className={`transition cursor-pointer ${ui.hoverRow}`}
                          >
                            <td
                              className={`py-3 px-3 font-semibold ${ui.textPrimary}`}
                            >
                              {cust.name}
                            </td>
                            <td
                              className={`py-3 px-3 font-mono ${ui.textMuted}`}
                            >
                              {cust.phone}
                            </td>
                            <td
                              className={`py-3 px-3 max-w-xs truncate ${ui.textMuted}`}
                            >
                              {cust.address}
                            </td>
                            <td
                              className={`py-3 px-3 font-bold ${ui.textSecondary}`}
                            >
                              {cust.orderCount}
                            </td>
                            <td
                              className={`py-3 px-3 font-bold text-right ${ui.textPrimary}`}
                            >
                              ৳{cust.totalSpent.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerPhone(cust.phone);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${ui.secondaryBtn}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Orders
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* LOGGED-IN USERS SECTION */}
            {activeSection === "users" && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
              >
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${ui.divider}`}
                >
                  <div>
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Logged-in &amp; Registered Users (
                      {filteredLoggedInUsers.length})
                    </h2>
                    <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                      স্টোরফ্রন্টে লগইন বা রেজিস্টার করা ইউজারদের প্রোফাইল ও তথ্য
                    </p>
                  </div>

                  {filteredLoggedInUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          filteredLoggedInUsers.map((u) => u.email).join(", "),
                          "all-users-emails",
                          "সব ইউজার ইমেইল কপি করা হয়েছে"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-auto ${ui.primaryBtn}`}
                    >
                      {copiedId === "all-users-emails" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy User Emails
                    </button>
                  )}
                </div>

                {filteredLoggedInUsers.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    এখনো কোনো লগইন বা রেজিস্টার করা ইউজারের তথ্য পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr
                          className={`border-b ${ui.divider} ${ui.textMuted}`}
                        >
                          <th className="py-2.5 px-3 font-semibold">User</th>
                          <th className="py-2.5 px-3 font-semibold">Email</th>
                          <th className="py-2.5 px-3 font-semibold">
                            Method
                          </th>
                          <th className="py-2.5 px-3 font-semibold">
                            Location / Address
                          </th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                          <th className="py-2.5 px-3 font-semibold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${ui.divider}`}>
                        {filteredLoggedInUsers.map((user) => (
                          <tr
                            key={user.id}
                            className={`transition ${ui.hoverRow}`}
                          >
                            <td
                              className={`py-3 px-3 font-semibold ${ui.textPrimary}`}
                            >
                              {user.name}
                            </td>
                            <td className={`py-3 px-3 ${ui.textSecondary}`}>
                              {user.email}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase ${ui.secondaryBtn}`}
                              >
                                {user.provider}
                              </span>
                            </td>
                            <td
                              className={`py-3 px-3 text-xs ${ui.textMuted}`}
                            >
                              {[user.district, user.address]
                                .filter(Boolean)
                                .join(" • ") || "—"}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  isDay
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                                }`}
                              >
                                {user.verified ? "Verified" : "Active"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyText(
                                      user.email,
                                      user.id,
                                      "ইমেইল কপি করা হয়েছে"
                                    )
                                  }
                                  title="Copy email"
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${ui.navIdle}`}
                                >
                                  {copiedId === user.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLocalUser(user)}
                                  title="Remove user"
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    isDay
                                      ? "text-rose-700 hover:bg-rose-50"
                                      : "text-rose-400 hover:bg-rose-950/50"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* NEWSLETTER SUBSCRIBERS SECTION */}
            {activeSection === "subscribers" && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
              >
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${ui.divider}`}
                >
                  <div>
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Newsletter Subscribers ({filteredSubscribers.length})
                    </h2>
                    <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                      স্টোরফ্রন্ট ফুটার সাবস্ক্রিপশন ফর্ম থেকে সংগৃহীত ইমেইল লিস্ট
                    </p>
                  </div>

                  {filteredSubscribers.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          filteredSubscribers.map((s) => s.email).join(", "),
                          "all-subscribers",
                          "সব সাবস্ক্রাইবার ইমেইল কপি করা হয়েছে"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-auto ${ui.primaryBtn}`}
                    >
                      {copiedId === "all-subscribers" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy All Emails
                    </button>
                  )}
                </div>

                {loadingData && subscribers.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    Loading subscribers...
                  </p>
                ) : filteredSubscribers.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    এখনো কোনো নিউজলেটার সাবস্ক্রাইবার পাওয়া যায়নি।
                  </p>
                ) : (
                  <div
                    className={`divide-y border rounded-2xl overflow-hidden ${ui.divider}`}
                  >
                    {filteredSubscribers.map((sub) => (
                      <div
                        key={sub._id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 transition ${ui.subCardBg} ${ui.hoverRow}`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${ui.textPrimary}`}
                          >
                            {sub.email}
                          </p>
                          <p className={`text-[11px] ${ui.textMuted}`}>
                            {sub.createdAt
                              ? `Subscribed: ${new Date(
                                  sub.createdAt
                                ).toLocaleDateString()}`
                              : "Newsletter Subscriber"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                sub.email,
                                sub._id,
                                "ইমেইল কপি করা হয়েছে"
                              )
                            }
                            title="Copy email"
                            className={`p-2 rounded-xl transition cursor-pointer ${ui.navIdle}`}
                          >
                            {copiedId === sub._id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={deletingSubscriberId === sub._id}
                            onClick={() => handleDeleteSubscriber(sub._id)}
                            title="Delete subscriber"
                            className={`p-2 rounded-xl transition disabled:opacity-50 cursor-pointer ${
                              isDay
                                ? "text-rose-700 hover:bg-rose-50"
                                : "text-rose-400 hover:bg-rose-950/50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER REVIEWS SECTION */}
            {activeSection === "reviews" && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
              >
                <div
                  className={`flex items-center justify-between border-b pb-4 ${ui.divider}`}
                >
                  <div>
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Customer Reviews ({filteredReviews.length})
                    </h2>
                    <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                      কাস্টমারদের দেওয়া রিভিউ ও রিসিভ করা প্রোডাক্টের ছবি
                    </p>
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <p className={`text-sm py-6 text-center ${ui.textMuted}`}>
                    এখনো কোনো কাস্টমার রিভিউ যোগ হয়নি।
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`rounded-2xl border p-4 space-y-3 ${ui.subCardBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${ui.textPrimary}`}
                          >
                            {rev.name}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isDay ? "text-amber-700" : "text-amber-400"
                            }`}
                          >
                            {rev.rating} ★
                          </span>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${ui.textSecondary}`}
                        >
                          {rev.comment}
                        </p>
                        {rev.photo && (
                          <div
                            className={`aspect-video w-full rounded-xl overflow-hidden border ${ui.mutedInputBg}`}
                          >
                            <img
                              src={rev.photo}
                              alt={`${rev.name} product review`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer ${
                              isDay ? "text-rose-700" : "text-rose-400"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS SECTION */}
            {activeSection === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                  onSubmit={handleSaveDeliverySettings}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-colors ${ui.cardBg}`}
                >
                  <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                    Mymensingh Delivery &amp; Wallet Settings
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                      >
                        Inside Mymensingh Charge (৳)
                      </label>
                      <input
                        type="number"
                        value={deliverySettings.insideMymensinghCharge}
                        onChange={(e) =>
                          setDeliverySettings({
                            ...deliverySettings,
                            insideMymensinghCharge: Number(e.target.value),
                          })
                        }
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                      >
                        Outside Mymensingh Charge (৳)
                      </label>
                      <input
                        type="number"
                        value={deliverySettings.outsideMymensinghCharge}
                        onChange={(e) =>
                          setDeliverySettings({
                            ...deliverySettings,
                            outsideMymensinghCharge: Number(e.target.value),
                          })
                        }
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                    >
                      Free Delivery Threshold (৳, 0 = disabled)
                    </label>
                    <input
                      type="number"
                      value={deliverySettings.freeDeliveryThreshold}
                      onChange={(e) =>
                        setDeliverySettings({
                          ...deliverySettings,
                          freeDeliveryThreshold: Number(e.target.value),
                        })
                      }
                      className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                      >
                        bKash Number
                      </label>
                      <input
                        type="text"
                        value={deliverySettings.bkashNumber}
                        onChange={(e) =>
                          setDeliverySettings({
                            ...deliverySettings,
                            bkashNumber: e.target.value,
                          })
                        }
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                      >
                        Nagad Number
                      </label>
                      <input
                        type="text"
                        value={deliverySettings.nagadNumber}
                        onChange={(e) =>
                          setDeliverySettings({
                            ...deliverySettings,
                            nagadNumber: e.target.value,
                          })
                        }
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${ui.textMuted}`}
                      >
                        Rocket Number
                      </label>
                      <input
                        type="text"
                        value={deliverySettings.rocketNumber}
                        onChange={(e) =>
                          setDeliverySettings({
                            ...deliverySettings,
                            rocketNumber: e.target.value,
                          })
                        }
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`text-sm px-5 py-2.5 rounded-xl transition cursor-pointer ${ui.primaryBtn}`}
                  >
                    Save Settings
                  </button>
                </form>

                <div
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 h-fit transition-colors ${ui.cardBg}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={`w-5 h-5 ${
                        isDay ? "text-emerald-700" : "text-emerald-400"
                      }`}
                    />
                    <h2 className={`text-lg font-bold ${ui.textPrimary}`}>
                      Auto-Stock Deduction Guard
                    </h2>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${ui.textMuted}`}
                  >
                    অর্ডার{" "}
                    <strong className={ui.textSecondary}>Confirmed</strong> বা{" "}
                    <strong className={ui.textSecondary}>Delivered</strong>{" "}
                    করলে সংশ্লিষ্ট প্রোডাক্টের স্টক স্বয়ংক্রিয়ভাবে কমানো হবে এবং
                    একই অর্ডারের জন্য যেন দ্বিতীয়বার স্টক না কাটে সেটির গার্ড
                    সক্রিয় থাকবে।
                  </p>

                  <label
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer ${ui.subCardBg}`}
                  >
                    <span className={`text-sm font-semibold ${ui.textPrimary}`}>
                      Enable Auto-Stock Guard
                    </span>
                    <input
                      type="checkbox"
                      checked={autoDeductStock}
                      onChange={(e) => setAutoDeductStock(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <p className={`text-xs ${ui.textMuted}`}>
                    Protected orders count:{" "}
                    <strong className={ui.textSecondary}>
                      {deductedOrderIds.length}
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer
            className={`border-t px-4 sm:px-6 py-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors ${ui.footerBg}`}
          >
            <p>
              © 2026 {BRAND_NAME} Admin Dashboard • {BRAND_TAGLINE}.
            </p>
            <p>Support: {SUPPORT_EMAIL}</p>
          </footer>
        </div>
      </div>

      {/* Customer Full Order History Modal */}
      {selectedCustomer && (
        <div
          onClick={() => setSelectedCustomerPhone(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl max-w-2xl w-full p-6 shadow-xl border space-y-4 my-auto max-h-[88vh] overflow-y-auto ${ui.cardBg}`}
          >
            <div
              className={`flex items-start justify-between border-b pb-3.5 gap-3 ${ui.divider}`}
            >
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider ${ui.textMuted}`}
                >
                  Customer Order History
                </p>
                <h3 className={`text-lg font-bold ${ui.textPrimary}`}>
                  {selectedCustomer.name} •{" "}
                  <span className={`font-mono text-base ${ui.textMuted}`}>
                    {selectedCustomer.phone}
                  </span>
                </h3>
                <p className={`text-xs mt-0.5 ${ui.textMuted}`}>
                  {selectedCustomer.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                className={`p-1.5 rounded-full cursor-pointer shrink-0 ${ui.navIdle}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`grid grid-cols-2 border rounded-2xl p-3.5 text-xs sm:text-sm ${ui.subCardBg}`}
            >
              <div>
                <span className={`block text-xs ${ui.textMuted}`}>
                  Total Orders
                </span>
                <span className={`font-bold text-base ${ui.textPrimary}`}>
                  {selectedCustomer.orderCount}
                </span>
              </div>
              <div className="text-right">
                <span className={`block text-xs ${ui.textMuted}`}>
                  Total Spent
                </span>
                <span
                  className={`font-bold text-base ${
                    isDay ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  ৳{selectedCustomer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedCustomer.orders.map((ord, idx) => {
                const pay = extractPaymentInfo(ord.address);
                return (
                  <div
                    key={ord._id || idx}
                    className={`border rounded-2xl p-4 space-y-2.5 ${ui.subCardBg}`}
                  >
                    <div
                      className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${ui.divider}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold ${ui.textSecondary}`}
                        >
                          #{ord._id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                            ord.status || "Pending",
                            isDay
                          )}`}
                        >
                          {ord.status || "Pending"}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isDay
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                          }`}
                        >
                          {pay.method}
                          {pay.trxId ? ` • TrxID: ${pay.trxId}` : ""}
                        </span>
                      </div>

                      <span className={`text-sm font-bold ${ui.textPrimary}`}>
                        ৳{Number(ord.totalAmount).toLocaleString()}
                      </span>
                    </div>

                    <div className={`divide-y ${ui.divider}`}>
                      {ord.items?.map((line, lIdx) => (
                        <div
                          key={`${line.name}-${lIdx}`}
                          className="py-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="min-w-0">
                            <p
                              className={`font-semibold truncate ${ui.textPrimary}`}
                            >
                              {line.name}
                            </p>
                            <p className={`text-xs ${ui.textMuted}`}>
                              {line.size ? `Size: ${line.size} • ` : ""}
                              {line.color ? `Color: ${line.color} • ` : ""}
                              Qty: {line.quantity} × ৳{line.price}
                            </p>
                          </div>
                          <p
                            className={`font-bold shrink-0 ${ui.textPrimary}`}
                          >
                            ৳{(line.price * line.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`flex justify-end pt-2 border-t ${ui.divider}`}>
              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                className={`text-xs px-4 py-2 rounded-xl cursor-pointer ${ui.primaryBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div
            className={`rounded-3xl max-w-lg w-full p-6 shadow-xl border space-y-4 ${ui.cardBg}`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${ui.divider}`}
            >
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider ${ui.textMuted}`}
                >
                  Order Details
                </p>
                <h3 className={`text-base font-bold font-mono ${ui.textPrimary}`}>
                  #{selectedOrder._id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className={`p-1.5 rounded-full cursor-pointer ${ui.navIdle}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const pay = extractPaymentInfo(selectedOrder.address);
              return (
                <div
                  className={`space-y-2 text-xs sm:text-sm border rounded-2xl p-4 ${ui.subCardBg}`}
                >
                  <p>
                    <span className={`font-semibold ${ui.textMuted}`}>
                      Customer:
                    </span>{" "}
                    <span className={`font-bold ${ui.textPrimary}`}>
                      {selectedOrder.customerName}
                    </span>
                  </p>
                  <p>
                    <span className={`font-semibold ${ui.textMuted}`}>
                      Phone:
                    </span>{" "}
                    <span className={`font-mono ${ui.textSecondary}`}>
                      {selectedOrder.phone}
                    </span>
                  </p>
                  <p>
                    <span className={`font-semibold ${ui.textMuted}`}>
                      Payment:
                    </span>{" "}
                    <span className={`font-bold ${ui.textSecondary}`}>
                      {pay.method}
                    </span>
                    {pay.trxId && (
                      <span
                        className={`ml-2 font-mono text-xs px-2 py-0.5 rounded-md border ${
                          isDay
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                        }`}
                      >
                        TrxID: {pay.trxId}
                      </span>
                    )}
                  </p>
                  <p>
                    <span className={`font-semibold ${ui.textMuted}`}>
                      Address:
                    </span>{" "}
                    <span className={ui.textSecondary}>
                      {selectedOrder.address}
                    </span>
                  </p>
                  <p>
                    <span className={`font-semibold ${ui.textMuted}`}>
                      Status:
                    </span>{" "}
                    <span className={`font-bold ${ui.textPrimary}`}>
                      {selectedOrder.status || "Pending"}
                    </span>
                  </p>
                </div>
              );
            })()}

            <div className="space-y-2">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${ui.textMuted}`}
              >
                Ordered Items
              </p>
              <div
                className={`border rounded-2xl divide-y px-3.5 ${ui.subCardBg} ${ui.divider}`}
              >
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <p className={`font-semibold ${ui.textPrimary}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${ui.textMuted}`}>
                        {item.size ? `Size: ${item.size} • ` : ""}
                        {item.color ? `Color: ${item.color} • ` : ""}Qty:{" "}
                        {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <p className={`font-bold ${ui.textPrimary}`}>
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t ${ui.divider}`}
            >
              <span className={`text-sm font-bold ${ui.textPrimary}`}>
                Total: ৳{Number(selectedOrder.totalAmount).toLocaleString()}
              </span>

              <button
                type="button"
                onClick={() => handleCopyOrderSummary(selectedOrder)}
                className={`inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer ${ui.primaryBtn}`}
              >
                {copiedId === `sum-${selectedOrder._id}` ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProductEdit}
            className={`rounded-3xl max-w-lg w-full p-6 shadow-xl border space-y-3 my-auto max-h-[90vh] overflow-y-auto ${ui.cardBg}`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${ui.divider}`}
            >
              <h3 className={`text-lg font-bold ${ui.textPrimary}`}>
                Edit Product
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className={`p-1.5 rounded-full cursor-pointer ${ui.navIdle}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="Product Name *"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
            />

            <div className="space-y-1">
              <label className={`block text-xs font-medium ${ui.textMuted}`}>
                Category
              </label>
              <select
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm font-medium outline-none cursor-pointer ${ui.inputBg}`}
              >
                {STORE_SUBCATEGORIES.map((catLabel) => (
                  <option key={catLabel} value={catLabel}>
                    {catLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="number"
                required
                placeholder="Price (BDT) *"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
              <input
                type="number"
                placeholder="Old Price (optional)"
                value={editOldPrice}
                onChange={(e) => setEditOldPrice(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Badge"
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
              <input
                type="number"
                placeholder="Stock"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
            </div>

            {editCategory === "fashion" &&
            isGarmentOrFootwearWithSizes(editSubCategory) ? (
              <input
                type="text"
                placeholder={
                  isFootwearSubCategory(editSubCategory)
                    ? "Shoe Sizes (e.g. 40, 41, 42, 43)"
                    : "Sizes (e.g. M, L, XL)"
                }
                value={editSizesText}
                onChange={(e) => setEditSizesText(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
            ) : editCategory === "gadget" ? (
              <input
                type="text"
                placeholder="Specs"
                value={editSpecs}
                onChange={(e) => setEditSpecs(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
            ) : null}

            <div
              className={`space-y-1.5 border rounded-xl p-2.5 ${ui.subCardBg}`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold ${ui.textSecondary}`}
              >
                <Palette className={`w-3.5 h-3.5 ${ui.textMuted}`} />
                Colors (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Black, Silver, Midnight Blue"
                value={editColorsText}
                onChange={(e) => setEditColorsText(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition ${ui.inputBg}`}
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {QUICK_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setEditColorsText((prev) =>
                        appendPresetToText(prev, preset)
                      )
                    }
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition cursor-pointer ${ui.secondaryBtn}`}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`space-y-2 border rounded-xl p-3 ${ui.subCardBg}`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold ${ui.textSecondary}`}
              >
                <Images className={`w-3.5 h-3.5 ${ui.textMuted}`} />
                Product Images ({editImagesList.length}) *
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add another Image URL..."
                  value={editImageUrlInput}
                  onChange={(e) => setEditImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl("edit");
                    }
                  }}
                  className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none transition ${ui.inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => handleAddImageUrl("edit")}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${ui.secondaryBtn}`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMultipleFilesChange(e, "edit")}
                className="hidden"
              />

              <button
                type="button"
                disabled={processingImage}
                onClick={() => editFileInputRef.current?.click()}
                className={`w-full inline-flex items-center justify-center gap-1.5 border border-dashed py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${ui.secondaryBtn}`}
              >
                <Upload className="w-3.5 h-3.5" />
                {processingImage ? "Processing Photos..." : "Add More Photos"}
              </button>

              {editImagesList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {editImagesList.map((imgSrc, idx) => (
                    <div
                      key={`${idx}-${imgSrc.slice(0, 24)}`}
                      className={`relative rounded-xl overflow-hidden border aspect-square ${ui.mutedInputBg}`}
                    >
                      <img
                        src={imgSrc}
                        alt={`Edit preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-900/85 text-slate-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                          Main
                        </span>
                      )}
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(idx, "edit")}
                            title="Set as Main Image"
                            className="bg-slate-900/85 text-slate-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md cursor-pointer"
                          >
                            1st
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImageAt(idx, "edit")}
                          title="Remove image"
                          className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none transition ${ui.inputBg}`}
              rows={2}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className={`flex-1 border py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${ui.secondaryBtn}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || processingImage}
                className={`flex-1 py-2.5 rounded-xl text-sm disabled:opacity-50 transition cursor-pointer ${ui.primaryBtn}`}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}