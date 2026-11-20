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
} from "lucide-react";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  sizes?: string[];
  specs?: string;
  description?: string;
  stock?: number;
}

interface OrderItem {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  items: {
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    image?: string;
  }[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

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

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Order filters & detail modal
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Product filters & quick stock
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState<
    "all" | "fashion" | "gadget"
  >("all");
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  // Add Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"fashion" | "gadget">("fashion");
  const [subCategory, setSubCategory] = useState("Hoodies & Jackets");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [badge, setBadge] = useState("New Arrival");
  const [sizesText, setSizesText] = useState("M, L, XL");
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
  const [editCategory, setEditCategory] = useState<"fashion" | "gadget">(
    "fashion"
  );
  const [editSubCategory, setEditSubCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");
  const [editStock, setEditStock] = useState("10");
  const [editBadge, setEditBadge] = useState("");
  const [editSizesText, setEditSizesText] = useState("");
  const [editSpecs, setEditSpecs] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (ordData.success) setOrders(ordData.orders || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
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
      const data = await res.json();
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

  const handleCategorySwitch = (nextCat: "fashion" | "gadget") => {
    setCategory(nextCat);
    if (nextCat === "fashion") {
      setSubCategory("Hoodies & Jackets");
      setBadge("New Arrival");
    } else {
      setSubCategory("Wireless Earbuds");
      setBadge("1 Year Warranty");
    }
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "add" | "edit" = "add"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("দয়া করে একটি ছবি ফাইল সিলেক্ট করুন");
      return;
    }

    setProcessingImage(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 900, 0.78);
      if (target === "add") {
        setImage(compressedDataUrl);
        setUploadedFileName(file.name);
      } else {
        setEditImage(compressedDataUrl);
      }
      showToast("ছবি রেডি হয়েছে");
    } catch (err: any) {
      console.error("Image upload error:", err);
      showToast(err?.message || "ছবি প্রসেস করতে সমস্যা হয়েছে");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleClearImage = () => {
    setImage("");
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !image.trim()) return;
    setCreatingProduct(true);

    const parsedSizes =
      category === "fashion"
        ? sizesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          subCategory: subCategory.trim() || undefined,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          image: image.trim(),
          badge: badge.trim() || undefined,
          sizes: parsedSizes && parsedSizes.length > 0 ? parsedSizes : undefined,
          specs: category === "gadget" && specs.trim() ? specs.trim() : undefined,
          description: description.trim(),
          stock: Number(stock) || 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setPrice("");
        setOldPrice("");
        handleClearImage();
        setSpecs("");
        setDescription("");
        setStock("10");
        showToast("নতুন প্রোডাক্ট সফলভাবে যোগ করা হয়েছে");
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
    const normalizedCat: "fashion" | "gadget" = (prod.category || "")
      .toLowerCase()
      .includes("gadget")
      ? "gadget"
      : "fashion";
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(normalizedCat);
    setEditSubCategory(prod.subCategory || "");
    setEditPrice(String(prod.price ?? ""));
    setEditOldPrice(prod.oldPrice ? String(prod.oldPrice) : "");
    setEditStock(String(prod.stock ?? 10));
    setEditBadge(prod.badge || "");
    setEditSizesText((prod.sizes || ["M", "L", "XL"]).join(", "));
    setEditSpecs(prod.specs || "");
    setEditImage(prod.image || "");
    setEditDescription(prod.description || "");
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim() || !editPrice || !editImage.trim())
      return;

    setSavingEdit(true);
    const parsedSizes =
      editCategory === "fashion"
        ? editSizesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const payload = {
      name: editName.trim(),
      category: editCategory,
      subCategory: editSubCategory.trim() || undefined,
      price: Number(editPrice),
      oldPrice: editOldPrice ? Number(editOldPrice) : undefined,
      stock: Math.max(0, Number(editStock) || 0),
      badge: editBadge.trim() || undefined,
      sizes: parsedSizes && parsedSizes.length > 0 ? parsedSizes : undefined,
      specs:
        editCategory === "gadget" && editSpecs.trim()
          ? editSpecs.trim()
          : undefined,
      image: editImage.trim(),
      description: editDescription.trim(),
    };

    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === editingProduct._id
              ? { ...item, ...payload, ...(data.product || {}) }
              : item
          )
        );
        setEditingProduct(null);
        showToast("প্রোডাক্ট তথ্য আপডেট হয়েছে");
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
      const data = await res.json();
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
      const data = await res.json();
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

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
        setSelectedOrder((prev) =>
          prev && prev._id === orderId ? { ...prev, status } : prev
        );
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

  const handleCopyText = async (text: string, idKey?: string, label = "কপি করা হয়েছে") => {
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
    const itemsText = ord.items
      ?.map(
        (i) =>
          `- ${i.name}${i.size ? ` (${i.size})` : ""} ×${i.quantity} (৳${
            i.price * i.quantity
          })`
      )
      .join("\n");
    const summary = [
      `Order ID: ${ord._id}`,
      `Status: ${ord.status || "Pending"}`,
      `Customer: ${ord.customerName}`,
      `Phone: ${ord.phone}`,
      `Address: ${ord.address}`,
      `Items:\n${itemsText}`,
      `Total: ৳${Number(ord.totalAmount).toLocaleString()}`,
    ].join("\n");
    handleCopyText(summary, `sum-${ord._id}`, "অর্ডার সামারি কপি করা হয়েছে");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus =
        statusFilter === "All" ||
        (ord.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
      const q = orderSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        ord._id.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const normalizedCat = (p.category || "").toLowerCase().includes("gadget")
        ? "gadget"
        : "fashion";
      const matchesCat =
        productCatFilter === "all" || normalizedCat === productCatFilter;
      const q = productSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subCategory || "").toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, productCatFilter, productSearch]);

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
    return { revenue, pendingCount, deliveredCount, lowStockCount };
  }, [orders, products]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-neutral-200 w-full max-w-sm space-y-4"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              FG Trend Tech
            </p>
            <h1 className="text-xl font-bold text-neutral-950 mt-0.5">
              Admin Login
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              অ্যাডমিন প্যানেলে ঢুকতে পাসওয়ার্ড দিন।
            </p>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {authError && <p className="text-sm text-rose-600">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-neutral-950 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer"
          >
            {authLoading ? "Checking..." : "Login"}
          </button>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-900">
              ← Back to Store
            </Link>
            <Link href="/track-order" className="hover:text-neutral-900">
              Track Order
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900 p-4 sm:p-6">
      {feedbackMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
          {feedbackMsg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-neutral-200">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              FG Trend Tech Management
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-950">
              Store Admin Panel
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Orders ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "products"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              <Package className="w-4 h-4" />
              Products ({products.length})
            </button>

            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh data"
              className="p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
              />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
            >
              Store <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("admin_authed");
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200">
            <p className="text-xs text-neutral-500">Active Revenue</p>
            <p className="text-xl sm:text-2xl font-extrabold text-neutral-950 mt-1">
              ৳{stats.revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200">
            <p className="text-xs text-neutral-500">Pending Orders</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pendingCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200">
            <p className="text-xs text-neutral-500">Delivered Orders</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.deliveredCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200">
            <p className="text-xs text-neutral-500">Low Stock (≤ 3)</p>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1">
              {stats.lowStockCount}
            </p>
          </div>
        </div>

        {loadingData && orders.length === 0 && products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center text-sm text-neutral-600">
            Loading data...
          </div>
        ) : activeTab === "orders" ? (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xs border border-neutral-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-neutral-950">
                Customer Orders ({filteredOrders.length})
              </h2>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex items-center bg-neutral-100 rounded-xl px-3 py-1.5 border border-neutral-200">
                  <Search className="w-4 h-4 text-neutral-400 mr-2" />
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
                  className="border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-neutral-100 text-neutral-900 font-medium outline-none cursor-pointer"
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

            {filteredOrders.length === 0 ? (
              <p className="text-neutral-500 text-sm py-6 text-center">
                কোনো অর্ডার পাওয়া যায়নি।
              </p>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-300 transition"
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

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              order._id,
                              order._id,
                              "Order ID কপি করা হয়েছে"
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md transition cursor-pointer"
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

                      <p className="font-bold text-neutral-950 text-sm sm:text-base">
                        {order.customerName} —{" "}
                        <span className="font-mono text-neutral-700">
                          {order.phone}
                        </span>
                      </p>

                      <p className="text-xs sm:text-sm text-neutral-600 break-words">
                        {order.address}
                      </p>

                      <p className="text-xs sm:text-sm text-neutral-800">
                        <span className="font-semibold">Items:</span>{" "}
                        {order.items
                          ?.map(
                            (i) =>
                              `${i.name}${i.size ? ` (${i.size})` : ""} ×${
                                i.quantity
                              }`
                          )
                          .join(", ")}
                      </p>

                      <p className="text-sm font-extrabold text-neutral-950">
                        Total: ৳{Number(order.totalAmount).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 border border-neutral-200 hover:border-neutral-400 bg-neutral-50 text-neutral-800 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                          Update Status
                        </label>
                        <select
                          disabled={updatingOrderId === order._id}
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm bg-white text-neutral-950 font-medium outline-none focus:border-neutral-950 disabled:opacity-50 cursor-pointer"
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
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add New Product Form */}
            <form
              onSubmit={handleAddProduct}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-neutral-200 space-y-3 h-fit"
            >
              <h2 className="text-lg font-bold text-neutral-950">
                Add New Product
              </h2>

              <input
                type="text"
                placeholder="Product Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                required
              />

              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={category}
                  onChange={(e) =>
                    handleCategorySwitch(e.target.value as "fashion" | "gadget")
                  }
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm bg-white text-neutral-900 outline-none focus:border-neutral-950 cursor-pointer"
                >
                  <option value="fashion">Fashion</option>
                  <option value="gadget">Gadgets</option>
                </select>

                <input
                  type="text"
                  placeholder="Sub-Category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Price (BDT) *"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                  required
                />
                <input
                  type="number"
                  placeholder="Old Price (optional)"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Badge (e.g. Best Seller)"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
              </div>

              {category === "fashion" ? (
                <input
                  type="text"
                  placeholder="Sizes (comma separated, e.g. M, L, XL)"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Specs (e.g. 36H Battery • BT 5.3)"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                />
              )}

              {/* Image URL + Upload Own Photo */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Image URL (e.g. /images/jacket.jpg or https://...) *"
                  value={image.startsWith("data:") ? "" : image}
                  onChange={(e) => {
                    setUploadedFileName(null);
                    setImage(e.target.value);
                  }}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                  required={!image}
                />

                <div className="flex items-center justify-between gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, "add")}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={processingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-dashed border-neutral-400 hover:border-neutral-950 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {processingImage
                      ? "Processing Photo..."
                      : "Upload Your Own Photo"}
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      title="Clear image"
                      className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {image.trim() && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                  <img
                    src={image.trim()}
                    alt="Preview"
                    className="w-11 h-11 rounded-lg object-cover bg-neutral-200 shrink-0"
                  />
                  <span className="text-xs text-neutral-600 truncate">
                    {uploadedFileName
                      ? `Uploaded: ${uploadedFileName}`
                      : "Image URL Preview"}
                  </span>
                </div>
              )}

              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                rows={3}
              />

              <button
                type="submit"
                disabled={creatingProduct || processingImage}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-neutral-950 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {creatingProduct ? "Adding..." : "Add Product"}
              </button>
            </form>

            {/* All Products List */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-2xs border border-neutral-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-neutral-950">
                  All Products ({filteredProducts.length})
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-neutral-100 rounded-xl px-3 py-1.5 border border-neutral-200">
                    <Search className="w-4 h-4 text-neutral-400 mr-1.5" />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="bg-transparent text-xs outline-none w-36 sm:w-44"
                    />
                  </div>

                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "fashion", label: "Fashion" },
                      { key: "gadget", label: "Gadgets" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setProductCatFilter(f.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        productCatFilter === f.key
                          ? "bg-neutral-950 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <p className="text-neutral-500 text-sm py-6 text-center">
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

                    return (
                      <div
                        key={prod._id}
                        className="border border-neutral-200 rounded-2xl p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-14 h-14 object-cover rounded-xl bg-neutral-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-neutral-950 truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {prod.subCategory || prod.category} •{" "}
                              <span className="font-bold text-neutral-900">
                                ৳{prod.price}
                              </span>
                              {prod.oldPrice ? (
                                <span className="line-through text-neutral-400 ml-1">
                                  ৳{prod.oldPrice}
                                </span>
                              ) : null}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  currentStock === 0
                                    ? "bg-rose-100 text-rose-700"
                                    : isLowStock
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                Stock: {currentStock}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={
                                stockUpdatingId === prod._id ||
                                currentStock <= 0
                              }
                              onClick={() => handleQuickStockChange(prod, -1)}
                              title="Decrease stock"
                              className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 disabled:opacity-40 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={stockUpdatingId === prod._id}
                              onClick={() => handleQuickStockChange(prod, 1)}
                              title="Increase stock"
                              className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(prod)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xl hover:bg-neutral-200 transition cursor-pointer"
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
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Order Details
                </p>
                <h3 className="text-base font-bold font-mono text-neutral-950">
                  #{selectedOrder._id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
              <p>
                <span className="font-semibold text-neutral-600">
                  Customer:
                </span>{" "}
                <span className="font-bold text-neutral-950">
                  {selectedOrder.customerName}
                </span>
              </p>
              <p>
                <span className="font-semibold text-neutral-600">Phone:</span>{" "}
                <span className="font-mono text-neutral-900">
                  {selectedOrder.phone}
                </span>
              </p>
              <p>
                <span className="font-semibold text-neutral-600">Address:</span>{" "}
                <span className="text-neutral-800">{selectedOrder.address}</span>
              </p>
              <p>
                <span className="font-semibold text-neutral-600">Status:</span>{" "}
                <span className="font-bold text-neutral-950">
                  {selectedOrder.status || "Pending"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Ordered Items
              </p>
              <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 px-3.5">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.size ? `Size: ${item.size} • ` : ""}Qty:{" "}
                        {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <p className="font-bold text-neutral-950">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <span className="text-sm font-bold text-neutral-950">
                Total: ৳{Number(selectedOrder.totalAmount).toLocaleString()}
              </span>

              <button
                type="button"
                onClick={() => handleCopyOrderSummary(selectedOrder)}
                className="inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
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
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-3 my-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-bold text-neutral-950">
                Edit Product
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
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
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={editCategory}
                onChange={(e) =>
                  setEditCategory(e.target.value as "fashion" | "gadget")
                }
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm bg-white text-neutral-900 outline-none focus:border-neutral-950 cursor-pointer"
              >
                <option value="fashion">Fashion</option>
                <option value="gadget">Gadgets</option>
              </select>

              <input
                type="text"
                placeholder="Sub-Category"
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="number"
                required
                placeholder="Price (BDT) *"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
              <input
                type="number"
                placeholder="Old Price (optional)"
                value={editOldPrice}
                onChange={(e) => setEditOldPrice(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Badge"
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            </div>

            {editCategory === "fashion" ? (
              <input
                type="text"
                placeholder="Sizes (e.g. M, L, XL)"
                value={editSizesText}
                onChange={(e) => setEditSizesText(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            ) : (
              <input
                type="text"
                placeholder="Specs"
                value={editSpecs}
                onChange={(e) => setEditSpecs(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            )}

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Image URL *"
                value={editImage.startsWith("data:") ? "" : editImage}
                onChange={(e) => setEditImage(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                required={!editImage}
              />

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileChange(e, "edit")}
                className="hidden"
              />

              <button
                type="button"
                disabled={processingImage}
                onClick={() => editFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 border border-dashed border-neutral-400 hover:border-neutral-950 bg-neutral-50 text-neutral-800 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {processingImage ? "Processing Photo..." : "Replace Photo"}
              </button>
            </div>

            {editImage.trim() && (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                <img
                  src={editImage.trim()}
                  alt="Edit Preview"
                  className="w-11 h-11 rounded-lg object-cover bg-neutral-200 shrink-0"
                />
                <span className="text-xs text-neutral-600 truncate">
                  Current Image Preview
                </span>
              </div>
            )}

            <textarea
              placeholder="Description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              rows={2}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 border border-neutral-300 text-neutral-800 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || processingImage}
                className="flex-1 bg-neutral-950 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer"
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