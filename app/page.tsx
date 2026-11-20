"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  MessageCircle,
  Phone,
  Mail,
  MapPin,
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

type CartItem = {
  product: Product;
  quantity: number;
  selectedOption?: string;
};

type SortOption = "featured" | "price-asc" | "price-desc" | "discount";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Oversized Cotton Hoodie",
    category: "fashion",
    subCategory: "Hoodies & Jackets",
    price: 1450,
    oldPrice: 1850,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
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
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
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
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
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
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
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
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
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
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",
    badge: "Laptop Support",
    specs: "65W PD Type-C • Digital Display",
    description:
      "High-capacity power bank capable of fast-charging smartphones, tablets, and USB-C laptops.",
    stock: 14,
  },
];

const FEATURED_CATEGORIES = [
  {
    title: "Men's Fashion",
    filterKey: "fashion" as const,
    subFilter: "all",
    image:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Hoodies & Jackets",
    filterKey: "fashion" as const,
    subFilter: "Hoodies & Jackets",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Casual Shirts",
    filterKey: "fashion" as const,
    subFilter: "Casual Shirts",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Smartwatches",
    filterKey: "gadget" as const,
    subFilter: "Smartwatches",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Wireless Earbuds",
    filterKey: "gadget" as const,
    subFilter: "Wireless Earbuds",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Chargers & Accessories",
    filterKey: "gadget" as const,
    subFilter: "Chargers & Accessories",
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80",
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

function getDiscountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default function HomeStore() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Navigation & Catalog States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "fashion" | "gadget"
  >("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Interactive States
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState<{ [id: string]: string }>({
    "1": "L",
    "3": "L",
    "5": "L",
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("Dhaka");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash on Delivery" | "bKash" | "Nagad"
  >("Cash on Delivery");
  const [deliveryZone, setDeliveryZone] = useState<"dhaka" | "outside">("dhaka");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string>("");

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

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

        if (
          data.success &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          const mapped: Product[] = data.products.map(
            (item: any, idx: number) => {
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
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
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
            }
          );
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch products from DB:", err);
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      const next = exists
        ? prev.filter((item) => item !== product.id)
        : [...prev, product.id];
      notify(
        exists
          ? `Removed "${product.name}" from wishlist`
          : `Saved "${product.name}" to wishlist`
      );
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      const matchesCat =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesSub =
        selectedSubCategory === "all" || p.subCategory === selectedSubCategory;
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
        const dA = getDiscountPercent(a.price, a.oldPrice) || 0;
        const dB = getDiscountPercent(b.price, b.oldPrice) || 0;
        return dB - dA;
      });
    }
    return sorted;
  }, [
    products,
    showWishlistOnly,
    wishlist,
    selectedCategory,
    selectedSubCategory,
    searchQuery,
    sortBy,
  ]);

  const addToCart = (product: Product, openDrawer = true) => {
    const chosenSize =
      product.category === "fashion"
        ? selectedSizes[product.id] || product.sizes?.[0] || "L"
        : undefined;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedOption === chosenSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedOption: chosenSize }];
    });

    setOrderError("");
    setOrderSuccess(false);
    notify(`Added "${product.name}" to bag`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item
        )
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
  const deliveryCharge =
    cart.length === 0 ? 0 : deliveryZone === "dhaka" ? 70 : 130;
  const grandTotal = subtotal + deliveryCharge;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isValidBdPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, "");
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(cleaned);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0)
      return;

    if (!isValidBdPhone(customerPhone)) {
      setOrderError(
        "Please enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX)."
      );
      return;
    }

    setSubmittingOrder(true);
    setOrderError("");

    try {
      const zoneLabel =
        deliveryZone === "dhaka"
          ? "Inside Dhaka - ৳70"
          : "Outside Dhaka - ৳130";
      const fullAddress = `${customerAddress.trim()}, ${customerDistrict} (${zoneLabel}) • Payment: ${paymentMethod}${
        orderNotes.trim() ? ` • Note: ${orderNotes.trim()}` : ""
      }`;

      const orderPayload = {
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        address: fullAddress,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedOption || "",
          image: item.product.image,
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
        data.order?._id || data.orderId || `FGT-${Date.now().toString().slice(-6)}`;
      setConfirmedOrderId(String(generatedId));
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setOrderNotes("");
      setOrderSuccess(true);
      notify("Order placed successfully!");
    } catch (err: any) {
      setOrderError(
        err?.message || "Could not place order. Please try again."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  const jumpToCatalog = (opts?: {
    cat?: "all" | "fashion" | "gadget";
    sub?: string;
    sort?: SortOption;
    wishlistOnly?: boolean;
  }) => {
    setSelectedCategory(opts?.cat ?? "all");
    setSelectedSubCategory(opts?.sub ?? "all");
    setSortBy(opts?.sort ?? "featured");
    setShowWishlistOnly(opts?.wishlistOnly ?? false);
    setMobileMenuOpen(false);
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus(
      "Subscribed! You will receive updates on new arrivals and offers."
    );
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-neutral-950 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg border border-neutral-800">
          {toastMessage}
        </div>
      )}

      {/* A. Announcement Bar */}
      <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4 text-center tracking-wide border-b border-neutral-800">
        Nationwide Cash on Delivery • Inside Dhaka ৳70 &amp; Outside Dhaka ৳130
        • Authentic Fashion &amp; Tech
      </div>

      {/* B. Modern Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <a
              href="#"
              onClick={() => jumpToCatalog()}
              className="font-black text-lg sm:text-xl tracking-tight text-neutral-950 whitespace-nowrap"
            >
              FG TREND TECH
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-neutral-600">
            <a
              href="#"
              onClick={() => jumpToCatalog()}
              className="hover:text-neutral-950 transition"
            >
              Home
            </a>
            <button
              type="button"
              onClick={() => jumpToCatalog({ cat: "all" })}
              className="hover:text-neutral-950 transition cursor-pointer"
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ cat: "fashion" })}
              className="hover:text-neutral-950 transition cursor-pointer"
            >
              Fashion
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ cat: "gadget" })}
              className="hover:text-neutral-950 transition cursor-pointer"
            >
              Gadgets
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ sort: "discount" })}
              className="hover:text-neutral-950 transition cursor-pointer"
            >
              Best Offers
            </button>
            <a href="#footer-section" className="hover:text-neutral-950 transition">
              Contact Us
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-full px-3.5 py-1.5 w-44 md:w-56">
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs sm:text-sm outline-none w-full text-neutral-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => jumpToCatalog({ wishlistOnly: !showWishlistOnly })}
              title="Wishlist"
              className={`relative p-2.5 rounded-full border transition cursor-pointer ${
                showWishlistOnly
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-white text-neutral-950 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-neutral-200 px-4 py-4 space-y-3">
            <div className="flex items-center bg-neutral-100 rounded-full px-3.5 py-2">
              <Search className="w-4 h-4 text-neutral-400 mr-2" />
              <input
                type="text"
                placeholder="Search fashion or gadgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
              <button
                type="button"
                onClick={() => jumpToCatalog({ cat: "all" })}
                className="text-left py-1.5 cursor-pointer"
              >
                All Products
              </button>
              <button
                type="button"
                onClick={() => jumpToCatalog({ cat: "fashion" })}
                className="text-left py-1.5 cursor-pointer"
              >
                Fashion
              </button>
              <button
                type="button"
                onClick={() => jumpToCatalog({ cat: "gadget" })}
                className="text-left py-1.5 cursor-pointer"
              >
                Gadgets
              </button>
              <button
                type="button"
                onClick={() => jumpToCatalog({ sort: "discount" })}
                className="text-left py-1.5 cursor-pointer"
              >
                Best Offers
              </button>
              <a
                href="#footer-section"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5"
              >
                Contact Us
              </a>
            </div>
          </div>
        )}
      </header>

      {/* C. Premium Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-5 pb-10">
        <div className="bg-[#121212] text-white rounded-3xl overflow-hidden border border-neutral-800 shadow-lg">
          <div className="grid lg:grid-cols-12 gap-7 p-6 sm:p-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                FG Trend Tech • Fashion &amp; Smart Gadgets
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight">
                Elevated Style.
                <br />
                Everyday Tech.
              </h1>
              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                Shop curated outfits, hoodies, jackets, and shirts alongside
                warranty-backed earbuds, smartwatches, and fast chargers with
                nationwide cash on delivery.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ cat: "fashion" })}
                  className="bg-white text-neutral-950 hover:bg-neutral-200 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Shop Fashion
                </button>
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ cat: "gadget" })}
                  className="border border-neutral-600 hover:border-white text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Shop Gadgets
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-3 gap-3">
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80"
                    alt="Cotton hoodie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80"
                    alt="Wireless earbuds"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80"
                    alt="Smart watch"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/4.3] rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80"
                    alt="Bomber jacket"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80"
                    alt="Oxford shirt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80"
                    alt="Fast power bank"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            Shop by Category
          </h2>
          <button
            type="button"
            onClick={() => jumpToCatalog({ cat: "all" })}
            className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-950 cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_CATEGORIES.map((catItem) => (
            <button
              key={catItem.title}
              type="button"
              onClick={() =>
                jumpToCatalog({
                  cat: catItem.filterKey,
                  sub: catItem.subFilter,
                })
              }
              className="group text-left bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-400 transition cursor-pointer"
            >
              <div className="aspect-square bg-neutral-100 overflow-hidden">
                <img
                  src={catItem.image}
                  alt={catItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                  {catItem.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* E & G. Modern Product Cards + Catalog Controls */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-3xl border border-neutral-200 p-4 sm:p-6 mb-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mr-2">
                {showWishlistOnly ? "Saved Wishlist" : "Featured Collection"}
              </h2>

              {(
                [
                  { key: "all", label: "ALL" },
                  { key: "fashion", label: "FASHION" },
                  { key: "gadget", label: "GADGETS" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setShowWishlistOnly(false);
                    setSelectedCategory(tab.key);
                    setSelectedSubCategory("all");
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition cursor-pointer ${
                    !showWishlistOnly && selectedCategory === tab.key
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-neutral-800 outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>

              <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-neutral-950 shadow-2xs"
                      : "text-neutral-500"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-neutral-950 shadow-2xs"
                      : "text-neutral-500"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {selectedSubCategory !== "all" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Active filter:</span>
              <span className="bg-neutral-900 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                {selectedSubCategory}
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory("all")}
                  className="cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-neutral-200/70 rounded-3xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 space-y-3">
            <p className="text-sm text-neutral-500">
              No matching products found.
            </p>
            <button
              type="button"
              onClick={() => jumpToCatalog()}
              className="bg-neutral-950 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => {
              const isLiked = wishlist.includes(product.id);
              const discountPct = getDiscountPercent(
                product.price,
                product.oldPrice
              );

              return (
                <div
                  key={product.id}
                  className={
                    viewMode === "grid"
                      ? "group flex flex-col justify-between bg-white rounded-3xl border border-neutral-200/80 p-3 shadow-2xs hover:shadow-md transition"
                      : "group flex flex-col sm:flex-row items-center gap-5 bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-2xs hover:shadow-md transition"
                  }
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "relative aspect-[4/4.2] rounded-2xl bg-[#eceef0] overflow-hidden w-full"
                        : "relative w-full sm:w-44 aspect-square rounded-2xl bg-[#eceef0] overflow-hidden shrink-0"
                    }
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-neutral-950/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        {product.badge}
                      </span>
                      {discountPct && (
                        <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        aria-label="Wishlist"
                        className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-2xs hover:bg-white transition cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked
                              ? "fill-rose-500 text-rose-500"
                              : "text-neutral-700"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        aria-label="Quick View"
                        className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-2xs hover:bg-white transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-neutral-700" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between w-full pt-3 sm:pt-0 px-1 sm:px-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {product.subCategory}
                        </span>
                        {typeof product.stock === "number" && (
                          <span className="text-[11px] font-medium text-neutral-500">
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-neutral-950 mt-0.5 leading-snug">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-extrabold text-neutral-950">
                          ৳{product.price}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            ৳{product.oldPrice}
                          </span>
                        )}
                      </div>

                      {product.category === "fashion" && product.sizes ? (
                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="text-xs text-neutral-500 mr-1">
                            Size:
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
                                  product.sizes?.[0] ||
                                  "L") === size
                                  ? "bg-neutral-950 text-white border-neutral-950"
                                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      ) : (
                        product.specs && (
                          <p className="mt-2.5 text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg font-medium truncate">
                            {product.specs}
                          </p>
                        )
                      )}
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="border border-neutral-200 hover:border-neutral-400 text-neutral-800 text-xs sm:text-sm font-semibold py-2.5 px-3.5 rounded-xl transition cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* F. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-neutral-400">
              Seasonal Collection &amp; Tech Drop
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Upgrade Your Daily Rotation with Cash on Delivery
            </h3>
            <p className="text-sm text-neutral-300">
              Check your parcel upon delivery across Bangladesh with transparent
              shipping rates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => jumpToCatalog({ sort: "discount" })}
            className="bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-semibold px-6 py-3 rounded-xl shrink-0 transition cursor-pointer"
          >
            Explore Deals
          </button>
        </div>
      </section>

      {/* H. Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mb-5">
          Why Choose FG Trend Tech
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-neutral-950">
                100% Authentic Products
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Verified quality garments and genuine tech accessories.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-start gap-3.5">
            <Truck className="w-6 h-6 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-neutral-950">
                Nationwide Cash on Delivery
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Inside Dhaka ৳70 and Outside Dhaka ৳130 delivery charge.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-start gap-3.5">
            <Sparkles className="w-6 h-6 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-neutral-950">
                Fast Home Delivery &amp; Open Parcel
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Quick doorstep delivery with parcel inspection option.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* J. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-950">
              Stay Updated with FG Trend Tech
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Get notified about new fashion drops, smart gadgets, and seasonal
              offers.
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
              placeholder="Enter your email address"
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950 sm:w-64"
            />
            <button
              type="submit"
              className="bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
        {newsletterStatus && (
          <p className="text-xs text-emerald-700 font-medium mt-2 px-2">
            {newsletterStatus}
          </p>
        )}
      </section>

      {/* K. Professional Footer */}
      <footer
        id="footer-section"
        className="bg-neutral-950 text-neutral-300 pt-12 pb-8 border-t border-neutral-800"
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg tracking-tight">
              FG TREND TECH
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Modern fashion essentials and smart technology accessories built
              for everyday reliability across Bangladesh.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">Categories</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ cat: "fashion" })}
                  className="hover:text-white cursor-pointer"
                >
                  Fashion Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ cat: "gadget" })}
                  className="hover:text-white cursor-pointer"
                >
                  Smart Gadgets
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ sort: "discount" })}
                  className="hover:text-white cursor-pointer"
                >
                  Discounted Items
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">Policies &amp; Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>Cash on Delivery (Dhaka ৳70 / Outside ৳130)</li>
              <li>7-Day Size Exchange &amp; Gadget Warranty</li>
              <li>Privacy Policy &amp; Terms of Service</li>
              <li>
                <a href="/admin" className="hover:text-white">
                  Admin Portal
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">Contact</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Dhaka &amp; Mymensingh, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>support@fgtrendtech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© 2026 FG Trend Tech. All rights reserved.</p>
          <p>Mobile-first shopping experience</p>
        </div>
      </footer>

      {/* Floating WhatsApp & Scroll-to-Top Buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-full bg-white text-neutral-900 border border-neutral-200 shadow-md flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Support"
          className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-200">
            <div className="grid sm:grid-cols-2">
              <div className="aspect-square bg-neutral-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      {quickViewProduct.subCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-950 mt-1">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-lg font-extrabold text-neutral-950">
                      ৳{quickViewProduct.price}
                    </span>
                    {quickViewProduct.oldPrice && (
                      <span className="text-xs text-neutral-400 line-through">
                        ৳{quickViewProduct.oldPrice}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                    {quickViewProduct.description ||
                      quickViewProduct.specs ||
                      "Quality-checked product from FG Trend Tech."}
                  </p>

                  {quickViewProduct.category === "fashion" &&
                    quickViewProduct.sizes && (
                      <div className="mt-4">
                        <span className="text-xs text-neutral-500 block mb-1.5">
                          Select Size:
                        </span>
                        <div className="flex gap-2">
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
                                  quickViewProduct.sizes?.[0] ||
                                  "L") === sz
                                  ? "bg-neutral-950 text-white border-neutral-950"
                                  : "bg-white text-neutral-700 border-neutral-200"
                              }`}
                            >
                              {sz}
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
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold py-3 rounded-xl transition cursor-pointer"
                >
                  Add to Cart — ৳{quickViewProduct.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fafafa] w-full max-w-md h-full flex flex-col justify-between overflow-y-auto p-5 sm:p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-950">
                  {orderSuccess
                    ? "Order Confirmation"
                    : `Cart & Checkout (${totalCartCount})`}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-4 h-4 text-neutral-800" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="my-8 text-center bg-white border border-neutral-200 p-6 rounded-3xl shadow-2xs space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Order Confirmed!
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Order Reference:{" "}
                    <span className="font-mono font-semibold text-neutral-800">
                      {confirmedOrderId}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Your order has been received and saved. Our support team will
                    call shortly to confirm delivery.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSuccess(false);
                      setIsCartOpen(false);
                    }}
                    className="mt-3 w-full bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold py-3 rounded-2xl transition cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center text-neutral-500 my-16 text-sm space-y-3">
                  <p>Your shopping cart is empty.</p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="bg-neutral-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-neutral-200/80 divide-y divide-neutral-100 my-4 px-4">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.selectedOption}`}
                        className="py-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-neutral-900 truncate">
                            {item.product.name}
                          </h4>
                          {item.selectedOption && (
                            <span className="text-xs text-neutral-500">
                              Size: {item.selectedOption}
                            </span>
                          )}
                          <p className="text-sm font-bold text-neutral-950 mt-0.5">
                            ৳{item.product.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(idx, -1)}
                            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(idx, 1)}
                            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full ml-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handlePlaceOrder} className="space-y-3">
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-3">
                      <h3 className="font-bold text-sm text-neutral-900">
                        Delivery Details
                      </h3>

                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                      />

                      <input
                        type="tel"
                        required
                        placeholder="Phone Number (e.g. 017XXXXXXXX) *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                      />

                      <input
                        type="text"
                        required
                        placeholder="District (e.g. Dhaka, Mymensingh) *"
                        value={customerDistrict}
                        onChange={(e) => setCustomerDistrict(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                      />

                      <textarea
                        required
                        rows={2}
                        placeholder="Full Address (House, Road, Area) *"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                      />

                      <input
                        type="text"
                        placeholder="Order notes (optional)"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-950"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeliveryZone("dhaka")}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            deliveryZone === "dhaka"
                              ? "bg-neutral-950 border-neutral-950 text-white"
                              : "bg-white border-neutral-200 text-neutral-700"
                          }`}
                        >
                          Inside Dhaka (৳70)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryZone("outside")}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            deliveryZone === "outside"
                              ? "bg-neutral-950 border-neutral-950 text-white"
                              : "bg-white border-neutral-200 text-neutral-700"
                          }`}
                        >
                          Outside Dhaka (৳130)
                        </button>
                      </div>

                      <div className="pt-1">
                        <span className="text-xs font-semibold text-neutral-600 block mb-1.5">
                          Payment Method:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            ["Cash on Delivery", "bKash", "Nagad"] as const
                          ).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                                paymentMethod === method
                                  ? "bg-neutral-950 border-neutral-950 text-white"
                                  : "bg-white border-neutral-200 text-neutral-700"
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-neutral-900">
                          ৳{subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Delivery Charge</span>
                        <span className="font-semibold text-neutral-900">
                          ৳{deliveryCharge}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-neutral-950 pt-2 border-t border-neutral-100">
                        <span>Total Payable</span>
                        <span>৳{grandTotal}</span>
                      </div>
                    </div>

                    {orderError && (
                      <p className="text-xs text-rose-600 font-medium px-1">
                        {orderError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition shadow-md cursor-pointer"
                    >
                      {submittingOrder
                        ? "Placing Order..."
                        : `Confirm Order (৳${grandTotal})`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}