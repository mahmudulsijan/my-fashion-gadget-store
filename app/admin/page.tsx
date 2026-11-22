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
  name: string;
  rating: number;
  comment: string;
  photo?: string;
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
}

type AdminSection =
  | "overview"
  | "orders"
  | "products"
  | "customers"
  | "subscribers"
  | "reviews"
  | "settings";

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
  bkashNumber: "01700-000000",
  nagadNumber: "01700-000000",
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

function deriveMainCategory(subCat?: string): "fashion" | "gadget" {
  const val = (subCat || "").trim().toLowerCase();
  if (
    val === "gadgets" ||
    val === "mobile accessories" ||
    val.includes("gadget") ||
    val.includes("mobile")
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

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Confirmed":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Cancelled":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

function extractPaymentInfo(addressText?: string) {
  const raw = addressText || "";
  let method = "Cash on Delivery";
  if (/bkash/i.test(raw)) method = "bKash";
  else if (/nagad/i.test(raw)) method = "Nagad";

  const trxMatch = raw.match(
    /(?:trx(?:id)?|transaction(?:\s*id)?)\s*[:#-]?\s*([a-zA-Z0-9_-]{4,24})/i
  );
  const trxId = trxMatch ? trxMatch[1] : null;

  return { method, trxId };
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingSubscriberId, setDeletingSubscriberId] = useState<
    string | null
  >(null);

  // Global search & filters
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<
    string | null
  >(null);

  // Auto-stock deduction guard state (persisted in localStorage)
  const [autoDeductStock, setAutoDeductStock] = useState(true);
  const [deductedOrderIds, setDeductedOrderIds] = useState<string[]>([]);

  // Product filters & quick stock
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState<string>("all");
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  // Add Product Form State (Multiple Images Support)
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

  // Edit Product Modal State (Multiple Images Support)
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

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const loadLocalReviews = () => {
    try {
      const savedReviews = localStorage.getItem("fg_simple_reviews");
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
        }
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    }
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

      if (prodData.success) setProducts(prodData.products || []);
      if (ordData.success) setOrders(ordData.orders || []);
      if (subData.success && Array.isArray(subData.subscribers)) {
        setSubscribers(subData.subscribers);
      }
      loadLocalReviews();
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    try {
      const savedDeducted = localStorage.getItem("fg_admin_deducted_orders");
      if (savedDeducted) {
        setDeductedOrderIds(JSON.parse(savedDeducted));
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
          bkashNumber: String(parsed.bkashNumber || "01700-000000"),
          nagadNumber: String(parsed.nagadNumber || "01700-000000"),
        });
      }
      loadLocalReviews();
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
          badge: badge.trim() || undefined,
          sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
          colors: parsedColors.length > 0 ? parsedColors : undefined,
          specs: category === "gadget" && specs.trim() ? specs.trim() : undefined,
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

    if (!editingProduct || !editName.trim() || !editPrice || mergedEditImages.length === 0)
      return;

    setSavingEdit(true);
    const parsedSizes =
      editCategory === "fashion" && isGarmentOrFootwearWithSizes(editSubCategory)
        ? parseCommaList(editSizesText)
        : [];
    const parsedColors = parseCommaList(editColorsText);

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

  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    try {
      localStorage.setItem("fg_simple_reviews", JSON.stringify(updated));
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
      bkashNumber: deliverySettings.bkashNumber.trim() || "01700-000000",
      nagadNumber: deliverySettings.nagadNumber.trim() || "01700-000000",
    };
    setDeliverySettings(cleaned);
    try {
      localStorage.setItem(
        "fg_admin_delivery_settings",
        JSON.stringify(cleaned)
      );
      showToast("Mymensingh ডেলিভারি ও পেমেন্ট সেটিংস সেভ হয়েছে");
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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0c] text-neutral-100 p-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[260px] rounded-full bg-amber-400/10 blur-3xl" />

        <form
          onSubmit={handleLogin}
          className="relative z-10 bg-neutral-950/95 border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-5"
        >
          <div className="flex items-center gap-3.5 border-b border-neutral-800/90 pb-4">
            <img
              src="/images/zavero-logo.png"
              alt="ZAVERO"
              className="w-12 h-12 rounded-2xl object-cover bg-neutral-900 border border-amber-400/30 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                ZAVERO • EXPLORE BEYOND TRENDS
              </p>
              <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
                Admin Control Panel
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Mymensingh Storefront &amp; Order Management
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-300 transition cursor-pointer"
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
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium px-3.5 py-2.5 rounded-xl">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-700 text-neutral-950 disabled:text-neutral-400 py-3 rounded-xl text-sm font-extrabold tracking-wide transition cursor-pointer shadow-lg shadow-amber-400/10"
          >
            {authLoading ? "Verifying Access..." : "Unlock Admin Panel"}
          </button>

          <div className="pt-3 border-t border-neutral-800/90 flex items-center justify-between text-xs text-neutral-400">
            <Link
              href="/"
              className="hover:text-amber-300 transition font-medium"
            >
              ← Back to Storefront
            </Link>
            <Link
              href="/track-order"
              className="hover:text-amber-300 transition font-medium"
            >
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
    if (sec === "subscribers" || sec === "orders" || sec === "customers") {
      fetchDashboardData();
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 flex flex-col">
      {feedbackMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-slate-950 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
          {feedbackMsg}
        </div>
      )}

      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-slate-950 text-slate-200 flex-col justify-between p-4 border-r border-slate-800">
          <div className="space-y-6">
            <div className="px-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                Mymensingh Admin
              </p>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                FG TREND TECH
              </h2>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectSection(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </span>
                    {typeof item.badge === "number" && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-300"
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

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
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
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs">
            <aside className="w-64 bg-slate-950 text-slate-200 h-full p-4 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Admin Menu
                    </p>
                    <h2 className="text-base font-black text-white">
                      FG TREND TECH
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          {item.label}
                        </span>
                        {typeof item.badge === "number" && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Open Live Store →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("admin_authed");
                    setIsAuthenticated(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/60 cursor-pointer"
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
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="truncate">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize truncate">
                  {activeSection}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 w-52 md:w-64">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search orders, emails, items..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm outline-none w-full text-slate-900"
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch("")}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                title="Refresh data"
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                />
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Store <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* 4 Key Stats Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  ৳{stats.revenue.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Active orders total
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1">
                  {orders.length}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {stats.pendingCount} pending review
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">
                  Subscribers &amp; Reviews
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">
                  {subscribers.length}{" "}
                  <span className="text-xs font-bold text-amber-600">
                    / {reviews.length} rev
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Newsletter &amp; customer reviews
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">
                  Inventory &amp; Low Stock
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {products.length}{" "}
                  <span className="text-xs font-bold text-rose-600">
                    ({stats.lowStockCount} low)
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Stock ≤ 3 highlighted
                </p>
              </div>
            </div>

            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Sales Snapshot
                        </p>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          Recent Active Orders Value
                        </h2>
                      </div>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                        ৳{stats.revenue.toLocaleString()}
                      </span>
                    </div>

                    {stats.recentSeries.length === 0 ? (
                      <p className="text-xs text-slate-500 py-10 text-center">
                        এখনো কোনো সক্রিয় অর্ডার ডাটা নেই।
                      </p>
                    ) : (
                      <div className="h-44 flex items-end gap-3 pt-4 px-2 border-b border-slate-100">
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
                              <span className="text-[10px] font-bold text-slate-600">
                                ৳{pt.amount}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full max-w-[38px] rounded-t-xl bg-indigo-600/90 hover:bg-indigo-600 transition"
                              />
                              <span className="text-[11px] font-semibold text-slate-500">
                                {pt.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Catalog Mix (7 Categories)
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        Products by Category
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {stats.categoryCounts.map((cat) => (
                        <div key={cat.label}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-800">{cat.label}</span>
                            <span className="text-indigo-700">
                              {cat.count} items
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
                              className="h-full bg-indigo-600 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Auto-stock on Confirm/Deliver:
                      </span>
                      <span
                        className={`font-bold ${
                          autoDeductStock ? "text-emerald-600" : "text-slate-500"
                        }`}
                      >
                        {autoDeductStock ? "Enabled" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Recent Orders
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleSelectSection("orders")}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Manage All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      কোনো অর্ডার নেই।
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((ord) => {
                        const pay = extractPaymentInfo(ord.address);
                        return (
                          <div
                            key={ord._id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {ord.customerName}
                                </span>
                                <span className="text-xs font-mono text-slate-500">
                                  {ord.phone}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                    ord.status || "Pending"
                                  )}`}
                                >
                                  {ord.status || "Pending"}
                                </span>
                                {(pay.method === "bKash" ||
                                  pay.method === "Nagad") && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                                    {pay.method}
                                    {pay.trxId ? ` • ${pay.trxId}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-extrabold text-slate-900">
                                ৳{Number(ord.totalAmount).toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(ord)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
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

            {/* ORDERS SECTION */}
            {activeSection === "orders" && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xs border border-slate-200 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Customer Orders ({filteredOrders.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Confirmed বা Delivered করলে অটো-স্টক গার্ড সক্রিয় থাকে।
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
                      <Search className="w-4 h-4 text-slate-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search phone, name or ID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm outline-none w-full sm:w-52"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-slate-100 text-slate-900 font-medium outline-none cursor-pointer"
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
                  <p className="text-slate-500 text-sm py-6 text-center">
                    Loading orders...
                  </p>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-slate-500 text-sm py-6 text-center">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {filteredOrders.map((order) => {
                      const pay = extractPaymentInfo(order.address);
                      const isMobileWallet =
                        pay.method === "bKash" || pay.method === "Nagad";
                      const isStockDeducted = deductedOrderIds.includes(
                        order._id
                      );

                      return (
                        <div
                          key={order._id}
                          className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                  order.status || "Pending"
                                )}`}
                              >
                                {order.status || "Pending"}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  isMobileWallet
                                    ? "bg-pink-50 text-pink-700 border-pink-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                {pay.method}
                                {pay.trxId ? ` • TrxID: ${pay.trxId}` : ""}
                              </span>

                              {isStockDeducted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                                className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                                title="Copy Order ID"
                              >
                                <span>ID: {order._id}</span>
                                {copiedId === order._id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            <p className="font-bold text-slate-900 text-sm sm:text-base">
                              {order.customerName} —{" "}
                              <span className="font-mono text-slate-700">
                                {order.phone}
                              </span>
                            </p>

                            <p className="text-xs sm:text-sm text-slate-600 break-words">
                              {order.address}
                            </p>

                            <p className="text-xs sm:text-sm text-slate-800">
                              <span className="font-semibold">Items:</span>{" "}
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

                            <p className="text-sm font-extrabold text-slate-900">
                              Total: ৳{Number(order.totalAmount).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap items-end gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-1 border border-slate-200 hover:border-slate-400 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>

                            <button
                              type="button"
                              disabled={deletingOrderId === order._id}
                              onClick={() => handleDeleteOrder(order._id)}
                              title="Delete order"
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingOrderId === order._id
                                ? "..."
                                : "Delete"}
                            </button>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Update Status
                              </label>
                              <select
                                disabled={updatingOrderId === order._id}
                                value={order.status || "Pending"}
                                onChange={(e) =>
                                  handleStatusChange(order._id, e.target.value)
                                }
                                className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white text-slate-900 font-medium outline-none focus:border-slate-900 disabled:opacity-50 cursor-pointer"
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
                {/* Add New Product Form */}
                <form
                  onSubmit={handleAddProduct}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-slate-200 space-y-3 h-fit"
                >
                  <h2 className="text-lg font-bold text-slate-900">
                    Add New Product
                  </h2>

                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Category (Auto-syncs to Storefront) *
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white text-slate-900 font-medium outline-none focus:border-slate-900 cursor-pointer"
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
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Old Price (optional)"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Badge (e.g. Best Seller)"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                      />
                      <p className="text-[11px] text-slate-500 px-1">
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
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  ) : null}

                  {/* Colors Option */}
                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      Available Colors (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black, Silver, Midnight Blue"
                      value={colorsText}
                      onChange={(e) => setColorsText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-slate-700 transition cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multiple Images Upload & URLs */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Images className="w-3.5 h-3.5 text-indigo-600" />
                        Product Images ({previewAddImages.length}) *
                      </label>
                      {previewAddImages.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllAddImages}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
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
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl("add")}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shrink-0"
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
                      className="w-full inline-flex items-center justify-center gap-1.5 border border-dashed border-slate-400 hover:border-slate-900 bg-white hover:bg-slate-100 text-slate-800 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
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
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square"
                          >
                            <img
                              src={imgSrc}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-slate-950/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
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
                                  className="bg-white/90 hover:bg-white text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs cursor-pointer"
                                >
                                  1st
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageAt(idx, "add")}
                                title="Remove image"
                                className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs cursor-pointer"
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
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={creatingProduct || processingImage}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {creatingProduct ? "Adding..." : "Add Product"}
                  </button>
                </form>

                {/* All Products List */}
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      All Products ({filteredProducts.length})
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-1.5" />
                        <input
                          type="text"
                          placeholder="Search product or color..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="bg-transparent text-xs outline-none w-36 sm:w-44"
                        />
                      </div>

                      <select
                        value={productCatFilter}
                        onChange={(e) => setProductCatFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-slate-100 text-slate-800 font-semibold outline-none cursor-pointer"
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
                    <p className="text-slate-500 text-sm py-6 text-center">
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
                            className="border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={allProdImgs[0] || prod.image}
                                  alt={prod.name}
                                  className="w-14 h-14 object-cover rounded-xl bg-slate-100"
                                />
                                {allProdImgs.length > 1 && (
                                  <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    +{allProdImgs.length - 1}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-slate-900 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {displaySubCat} •{" "}
                                  <span className="font-bold text-slate-900">
                                    ৳{prod.price}
                                  </span>
                                  {prod.oldPrice ? (
                                    <span className="line-through text-slate-400 ml-1">
                                      ৳{prod.oldPrice}
                                    </span>
                                  ) : null}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                      currentStock === 0
                                        ? "bg-rose-100 text-rose-700"
                                        : isLowStock
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    Stock: {currentStock}
                                  </span>
                                  {allProdImgs.length > 1 && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                      {allProdImgs.length} Photos
                                    </span>
                                  )}
                                  {prod.sizes && prod.sizes.length > 0 && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                      Sizes: {prod.sizes.join(", ")}
                                    </span>
                                  )}
                                  {prod.colors && prod.colors.length > 0 && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                                      Colors: {prod.colors.join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
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
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 disabled:opacity-40 cursor-pointer"
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
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 disabled:opacity-40 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(prod)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={deletingProductId === prod._id}
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
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
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Customers ({customersList.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      যেকোনো কাস্টমারের উপর ক্লিক করলে তার সব অর্ডার ও প্রোডাক্টের বিস্তারিত দেখা যাবে।
                    </p>
                  </div>
                </div>

                {customersList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    এখনো কোনো কাস্টমার অর্ডার রেকর্ড পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
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
                      <tbody className="divide-y divide-slate-100">
                        {customersList.map((cust) => (
                          <tr
                            key={cust.phone}
                            onClick={() => setSelectedCustomerPhone(cust.phone)}
                            className="hover:bg-indigo-50/50 transition cursor-pointer"
                          >
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {cust.name}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-700">
                              {cust.phone}
                            </td>
                            <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                              {cust.address}
                            </td>
                            <td className="py-3 px-3 font-bold text-indigo-700">
                              {cust.orderCount}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-slate-900 text-right">
                              ৳{cust.totalSpent.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerPhone(cust.phone);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
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

            {/* NEWSLETTER SUBSCRIBERS SECTION */}
            {activeSection === "subscribers" && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Newsletter Subscribers ({filteredSubscribers.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
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
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-auto"
                    >
                      {copiedId === "all-subscribers" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy All Emails
                    </button>
                  )}
                </div>

                {loadingData && subscribers.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    Loading subscribers...
                  </p>
                ) : filteredSubscribers.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    এখনো কোনো নিউজলেটার সাবস্ক্রাইবার পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {filteredSubscribers.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/40 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {sub.email}
                          </p>
                          <p className="text-[11px] text-slate-400">
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
                            className="p-2 text-slate-700 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
                          >
                            {copiedId === sub._id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={deletingSubscriberId === sub._id}
                            onClick={() => handleDeleteSubscriber(sub._id)}
                            title="Delete subscriber"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-50 cursor-pointer"
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
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Customer Reviews ({filteredReviews.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      কাস্টমারদের দেওয়া রিভিউ ও রিসিভ করা প্রোডাক্টের ছবি
                    </p>
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    এখনো কোনো কাস্টমার রিভিউ যোগ হয়নি।
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-950">
                            {rev.name}
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            {rev.rating} ★
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {rev.comment}
                        </p>
                        {rev.photo && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
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
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
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
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                >
                  <h2 className="text-lg font-bold text-slate-900">
                    Mymensingh Delivery &amp; Wallet Settings
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        bKash Reference Number
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
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Nagad Reference Number
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
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Save Settings
                  </button>
                </form>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 h-fit">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Auto-Stock Deduction Guard
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    অর্ডার <strong>Confirmed</strong> বা{" "}
                    <strong>Delivered</strong> করলে সংশ্লিষ্ট প্রোডাক্টের স্টক
                    স্বয়ংক্রিয়ভাবে কমানো হবে এবং একই অর্ডারের জন্য যেন দ্বিতীয়বার
                    স্টক না কাটে সেটির গার্ড সক্রিয় থাকবে।
                  </p>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Auto-Stock Guard
                    </span>
                    <input
                      type="checkbox"
                      checked={autoDeductStock}
                      onChange={(e) => setAutoDeductStock(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <p className="text-xs text-slate-500">
                    Protected orders count:{" "}
                    <strong>{deductedOrderIds.length}</strong>
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 FG Trend Tech Admin Dashboard • Mymensingh.</p>
            <p>Support: fgtrendtech.bd@gmail.com</p>
          </footer>
        </div>
      </div>

      {/* Customer Full Order History Modal */}
      {selectedCustomer && (
        <div
          onClick={() => setSelectedCustomerPhone(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Customer Order History
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedCustomer.name} •{" "}
                  <span className="font-mono text-slate-700 text-base">
                    {selectedCustomer.phone}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedCustomer.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Total Orders</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {selectedCustomer.orderCount}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-xs">Total Spent</span>
                <span className="font-extrabold text-emerald-700 text-base">
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
                    className="border border-slate-200 rounded-2xl p-4 space-y-2.5 bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700">
                          #{ord._id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                            ord.status || "Pending"
                          )}`}
                        >
                          {ord.status || "Pending"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                          {pay.method}
                          {pay.trxId ? ` • TrxID: ${pay.trxId}` : ""}
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-slate-900">
                        ৳{Number(ord.totalAmount).toLocaleString()}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {ord.items?.map((line, lIdx) => (
                        <div
                          key={`${line.name}-${lIdx}`}
                          className="py-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {line.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {line.size ? `Size: ${line.size} • ` : ""}
                              {line.color ? `Color: ${line.color} • ` : ""}
                              Qty: {line.quantity} × ৳{line.price}
                            </p>
                          </div>
                          <p className="font-bold text-slate-900 shrink-0">
                            ৳{(line.price * line.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Order Details
                </p>
                <h3 className="text-base font-bold font-mono text-slate-900">
                  #{selectedOrder._id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const pay = extractPaymentInfo(selectedOrder.address);
              return (
                <div className="space-y-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p>
                    <span className="font-semibold text-slate-600">
                      Customer:
                    </span>{" "}
                    <span className="font-bold text-slate-900">
                      {selectedOrder.customerName}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">
                      Phone:
                    </span>{" "}
                    <span className="font-mono text-slate-800">
                      {selectedOrder.phone}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">
                      Payment:
                    </span>{" "}
                    <span className="font-bold text-pink-700">
                      {pay.method}
                    </span>
                    {pay.trxId && (
                      <span className="ml-2 font-mono text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-md">
                        TrxID: {pay.trxId}
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">
                      Address:
                    </span>{" "}
                    <span className="text-slate-800">
                      {selectedOrder.address}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">
                      Status:
                    </span>{" "}
                    <span className="font-bold text-slate-900">
                      {selectedOrder.status || "Pending"}
                    </span>
                  </p>
                </div>
              );
            })()}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ordered Items
              </p>
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 px-3.5">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.size ? `Size: ${item.size} • ` : ""}
                        {item.color ? `Color: ${item.color} • ` : ""}Qty:{" "}
                        {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">
                Total: ৳{Number(selectedOrder.totalAmount).toLocaleString()}
              </span>

              <button
                type="button"
                onClick={() => handleCopyOrderSummary(selectedOrder)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                {copiedId === `sum-${selectedOrder._id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProductEdit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-3 my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Product
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
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
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white text-slate-900 font-medium outline-none focus:border-slate-900 cursor-pointer"
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
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
              <input
                type="number"
                placeholder="Old Price (optional)"
                value={editOldPrice}
                onChange={(e) => setEditOldPrice(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Badge"
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            ) : editCategory === "gadget" ? (
              <input
                type="text"
                placeholder="Specs"
                value={editSpecs}
                onChange={(e) => setEditSpecs(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            ) : null}

            {/* Edit Colors Option */}
            <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                Colors (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Black, Silver, Midnight Blue"
                value={editColorsText}
                onChange={(e) => setEditColorsText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
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
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-slate-700 transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Multiple Images */}
            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Images className="w-3.5 h-3.5 text-indigo-600" />
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
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleAddImageUrl("edit")}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shrink-0"
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
                className="w-full inline-flex items-center justify-center gap-1.5 border border-dashed border-slate-400 hover:border-slate-900 bg-white text-slate-800 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {processingImage ? "Processing Photos..." : "Add More Photos"}
              </button>

              {editImagesList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {editImagesList.map((imgSrc, idx) => (
                    <div
                      key={`${idx}-${imgSrc.slice(0, 24)}`}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square"
                    >
                      <img
                        src={imgSrc}
                        alt={`Edit preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-950/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Main
                        </span>
                      )}
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(idx, "edit")}
                            title="Set as Main Image"
                            className="bg-white/90 hover:bg-white text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs cursor-pointer"
                          >
                            1st
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImageAt(idx, "edit")}
                          title="Remove image"
                          className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xs cursor-pointer"
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
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              rows={2}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 border border-slate-300 text-slate-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || processingImage}
                className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
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