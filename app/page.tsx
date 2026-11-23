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
  EyeOff,
  KeyRound,
  ChevronDown,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: "fashion" | "gadget";
  subCategory: string;
  price: number;
  oldPrice?: number;
  image: string;
  secondaryImage?: string;
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
  provider?: "email" | "phone" | "google" | "otp";
  verified?: boolean;
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
};

type SortOption = "featured" | "price-asc" | "price-desc" | "discount";
type BottomTab = "home" | "categories" | "cart" | "orders" | "account";
type Lang = "en" | "bn";
type PaymentOption = "Cash on Delivery" | "bKash" | "Nagad" | "Rocket";
type AuthMode = "login" | "register" | "forgot";

const BRAND_NAME = "ZAVERO";
const BRAND_TAGLINE = "Explore Beyond Trends";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";
const SUPPORT_EMAIL = "zavero.trends.bd@gmail.com";

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
  mensFashion:
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80",
  womensFashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
  mensFootwear:
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=500&q=80",
  womensFootwear:
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80",
  gadgets:
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80",
  beautyProducts:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80",
  mobileAccessories:
    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80",
};

const FEATURED_CATEGORIES = [
  {
    title: "Men's Fashion",
    subtitle: "Shirts, Panjabi & Streetwear",
    filterKey: "fashion" as const,
    subFilter: "Men's Fashion",
    gradientClass: "from-[#1E2B4D] via-[#15203B] to-[#0B0C10]",
    image: CATEGORY_IMAGES.mensFashion,
  },
  {
    title: "Women's Fashion",
    subtitle: "Co-ords, Kurtis & Modest Wear",
    filterKey: "fashion" as const,
    subFilter: "Women's Fashion",
    gradientClass: "from-[#22325A] via-[#182342] to-[#0B0C10]",
    image: CATEGORY_IMAGES.womensFashion,
  },
  {
    title: "Men's Footwear",
    subtitle: "Sneakers, Loafers & Boots",
    filterKey: "fashion" as const,
    subFilter: "Men's Footwear",
    gradientClass: "from-[#1E2B4D] via-[#111827] to-[#0B0C10]",
    image: CATEGORY_IMAGES.mensFootwear,
  },
  {
    title: "Women's Footwear",
    subtitle: "Heels, Flats & Casual Shoes",
    filterKey: "fashion" as const,
    subFilter: "Women's Footwear",
    gradientClass: "from-[#1B2847] via-[#141D33] to-[#0B0C10]",
    image: CATEGORY_IMAGES.womensFootwear,
  },
  {
    title: "Gadgets",
    subtitle: "Smartwatches, Audio & Tech",
    filterKey: "gadget" as const,
    subFilter: "Gadgets",
    gradientClass: "from-[#172544] via-[#111827] to-[#0B0C10]",
    image: CATEGORY_IMAGES.gadgets,
  },
  {
    title: "Beauty Products",
    subtitle: "Skincare, Serums & Care",
    filterKey: "fashion" as const,
    subFilter: "Beauty Products",
    gradientClass: "from-[#203057] via-[#151E36] to-[#0B0C10]",
    image: CATEGORY_IMAGES.beautyProducts,
  },
  {
    title: "Mobile Accessories",
    subtitle: "Chargers, Powerbanks & Cases",
    filterKey: "gadget" as const,
    subFilter: "Mobile Accessories",
    gradientClass: "from-[#1E2B4D] via-[#162038] to-[#0B0C10]",
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
  if (Array.isArray(item?.colors)) {
    return item.colors.map((c) => String(c).trim()).filter(Boolean);
  }
  if (typeof item?.colors === "string" && item.colors.trim()) {
    return item.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}

function resolveAdminSecondaryImage(
  item: Record<string, unknown>
): string | undefined {
  if (typeof item?.secondaryImage === "string" && item.secondaryImage.trim()) {
    return item.secondaryImage.trim();
  }
  if (Array.isArray(item?.images) && item.images.length > 1) {
    const second = String(item.images[1] || "").trim();
    if (second) return second;
  }
  return undefined;
}

function getDiscountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default function HomeStore() {
  const [lang, setLang] = useState<Lang>("en");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  // Navigation & Catalog States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
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

  // Real Customer Reviews State (no fake hardcoded reviews)
  const [reviews, setReviews] = useState<SimpleReview[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<string>("");

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authBannerImage, setAuthBannerImage] = useState<string>(
    "/images/zavero-login-banner.png"
  );

  // Login / Register / Forgot states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Register Email OTP Verification States
  const [regStep, setRegStep] = useState<"form" | "verify">("form");
  const [regOtpCode, setRegOtpCode] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regOtpNotice, setRegOtpNotice] = useState("");

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

  const catLabelText = (label: string) =>
    lang === "bn" ? CATEGORY_BN[label] || label : label;

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    const savedLang = localStorage.getItem("zavero_store_lang");
    if (savedLang === "en" || savedLang === "bn") {
      setLang(savedLang);
    }

    const savedBanner = localStorage.getItem("zavero_login_banner");
    if (savedBanner) {
      setAuthBannerImage(savedBanner);
    }

    const savedReviews = localStorage.getItem("zavero_simple_reviews");
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleLanguage = () => {
    const next: Lang = lang === "en" ? "bn" : "en";
    setLang(next);
    try {
      localStorage.setItem("zavero_store_lang", next);
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
          bkashNumber: String(parsed.bkashNumber || "01533919648"),
          nagadNumber: String(parsed.nagadNumber || "01533919648"),
          rocketNumber: String(parsed.rocketNumber || "01533919648"),
        });
      }
    } catch (err) {
      console.error("Failed to load delivery settings:", err);
    }

    try {
      const savedUser =
        localStorage.getItem("zavero_user") ||
        sessionStorage.getItem("zavero_user");
      if (savedUser) {
        const parsed: CustomerProfile = JSON.parse(savedUser);
        setCustomerUser(parsed);
        setCustomerName(parsed.name || "");
        setCustomerPhone(parsed.phone || "");
        if (parsed.district) {
          setCustomerDistrict(parsed.district);
          setDeliveryLocation(parsed.district);
          setDeliveryZone(
            parsed.district.toLowerCase().includes("mymensingh")
              ? "mymensingh"
              : "outside"
          );
        }
        if (parsed.address) {
          setCustomerAddress(parsed.address);
        }
      }
    } catch (err) {
      console.error("Failed to load customer user:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("zavero_cart");
      const initialCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const pendingRaw = sessionStorage.getItem("zavero_pending_checkout");
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        sessionStorage.removeItem("zavero_pending_checkout");
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
    try {
      localStorage.setItem("zavero_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart]);

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
              const secondaryImg = resolveAdminSecondaryImage(item);
              const rawBadge = String(item.badge || "").trim();

              return {
                id: String(item._id || item.id || idx),
                name: String(item.name || "ZAVERO Product"),
                category: cat,
                subCategory: subCat,
                price: Number(item.price) || 0,
                oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
                image: String(item.image || "") || CATEGORY_IMAGES.mensFootwear,
                secondaryImage: secondaryImg,
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

  const isValidBdPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, "");
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(cleaned);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const persistCustomerProfile = (profile: CustomerProfile) => {
    setCustomerUser(profile);
    setCustomerName(profile.name || "");
    if (profile.phone) setCustomerPhone(profile.phone);
    if (profile.district) {
      setCustomerDistrict(profile.district);
      setDeliveryLocation(profile.district);
      setDeliveryZone(
        profile.district.toLowerCase().includes("mymensingh")
          ? "mymensingh"
          : "outside"
      );
    }
    if (profile.address) setCustomerAddress(profile.address);

    try {
      if (rememberMe) {
        localStorage.setItem("zavero_user", JSON.stringify(profile));
      } else {
        sessionStorage.setItem("zavero_user", JSON.stringify(profile));
        localStorage.removeItem("zavero_user");
      }
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  const openAccountModal = () => {
    setLoginError("");
    setForgotNotice("");
    setRegOtpNotice("");
    setRegStep("form");
    setRegOtpCode("");
    setAuthMode("login");
    setLoginIdentifier(customerUser?.email || customerUser?.phone || "");
    setActiveBottomTab("account");
    setIsAccountModalOpen(true);
  };

  const handleAuthBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      notify(
        lang === "bn"
          ? "ব্যানার ছবির সাইজ ৪ MB-এর কম হতে হবে।"
          : "Banner image must be under 4 MB."
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAuthBannerImage(reader.result);
        try {
          localStorage.setItem("zavero_login_banner", reader.result);
        } catch {
          // ignore
        }
        notify(
          lang === "bn"
            ? "লগইন ব্যানার ছবি আপডেট হয়েছে"
            : "Login banner image updated"
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const idVal = loginIdentifier.trim();
    if (!idVal || !loginPassword.trim()) {
      setLoginError(
        lang === "bn"
          ? "ইমেইল/ফোন এবং পাসওয়ার্ড দিন।"
          : "Please enter your email/phone and password."
      );
      return;
    }

    const emailMatch = isValidEmail(idVal);
    const phoneMatch = isValidBdPhone(idVal);
    if (!emailMatch && !phoneMatch) {
      setLoginError(
        lang === "bn"
          ? "সঠিক ইমেইল অথবা ১১ সংখ্যার মোবাইল নম্বর দিন।"
          : "Enter a valid email address or 11-digit BD mobile number."
      );
      return;
    }

    const derivedName = emailMatch
      ? idVal.split("@")[0]
      : `Member ${idVal.slice(-4)}`;
    persistCustomerProfile({
      name: derivedName,
      email: emailMatch ? idVal : undefined,
      phone: phoneMatch ? idVal : undefined,
      district: customerDistrict || "Mymensingh",
      address: customerAddress || "",
      provider: emailMatch ? "email" : "phone",
      verified: true,
    });

    setIsAccountModalOpen(false);
    setActiveBottomTab("home");
    notify(
      lang === "bn"
        ? `${BRAND_NAME}-এ লগইন সফল হয়েছে!`
        : `Signed in to ${BRAND_NAME}!`
    );
  };

  const handleGoogleAuth = (isRegister = false) => {
    persistCustomerProfile({
      name: "ZAVERO Member",
      email: "member.zavero@gmail.com",
      district: customerDistrict || "Mymensingh",
      address: customerAddress || "",
      provider: "google",
      verified: true,
    });
    setIsAccountModalOpen(false);
    setActiveBottomTab("home");
    notify(
      lang === "bn"
        ? isRegister
          ? "Google দিয়ে অ্যাকাউন্ট তৈরি হয়েছে!"
          : "Google দিয়ে লগইন সম্পন্ন হয়েছে!"
        : isRegister
        ? "Account created with Google!"
        : "Signed in with Google!"
    );
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!forgotIdentifier.trim()) return;
    setForgotNotice(
      lang === "bn"
        ? `${forgotIdentifier.trim()}-এ পাসওয়ার্ড রিসেট নির্দেশনা পাঠানো হয়েছে।`
        : `Password reset instructions sent to ${forgotIdentifier.trim()}.`
    );
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegOtpNotice("");

    if (
      !regName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regPassword
    ) {
      setLoginError(
        lang === "bn"
          ? "সব বাধ্যতামূলক তথ্য পূরণ করুন।"
          : "Please complete all required registration fields."
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
    if (!isValidBdPhone(regPhone)) {
      setLoginError(
        lang === "bn"
          ? "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।"
          : "Please enter a valid 11-digit Bangladesh mobile number."
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
    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(
          data.message ||
            (lang === "bn"
              ? "ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি।"
              : "Could not send verification code to email.")
        );
        return;
      }

      setRegOtpNotice(
        data.message ||
          (lang === "bn"
            ? `${cleanEmail} ঠিকানায় ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`
            : `A 6-digit verification code has been sent to ${cleanEmail}.`)
      );
      setRegStep("verify");
    } catch {
      setLoginError(
        lang === "bn"
          ? "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।"
          : "Network error while sending verification code."
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanCode = regOtpCode.trim();

    if (cleanCode.length < 6) {
      setLoginError(
        lang === "bn"
          ? "ইমেইলে আসা ৬ ডিজিটের কোডটি লিখুন।"
          : "Please enter the 6-digit verification code sent to your email."
      );
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(
          data.message ||
            (lang === "bn"
              ? "ভুল কোড অথবা মেয়াদ শেষ হয়ে গেছে।"
              : "Invalid or expired verification code.")
        );
        return;
      }

      persistCustomerProfile({
        name: regName.trim(),
        email: cleanEmail,
        phone: regPhone.trim(),
        district: customerDistrict || "Mymensingh",
        address: customerAddress || "",
        provider: "email",
        verified: true,
      });

      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegOtpCode("");
      setRegOtpNotice("");
      setRegStep("form");
      setIsAccountModalOpen(false);
      setActiveBottomTab("home");
      notify(
        lang === "bn"
          ? "ইমেইল ভেরিফাই হয়ে অ্যাকাউন্ট তৈরি হয়েছে!"
          : "Email verified and account created!"
      );
    } catch {
      setLoginError(
        lang === "bn"
          ? "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।"
          : "Network error while verifying code."
      );
    } finally {
      setRegLoading(false);
    }
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    try {
      localStorage.removeItem("zavero_user");
      sessionStorage.removeItem("zavero_user");
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
    notify(lang === "bn" ? "সাইন আউট সম্পন্ন হয়েছে" : "Signed out of your account");
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

  const handleReviewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      notify(
        lang === "bn"
          ? "ছবির সাইজ ৩ MB-এর কম হতে হবে।"
          : "Photo size must be under 3 MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReviewPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSimpleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;

    const item: SimpleReview = {
      id: `r-${Date.now()}`,
      productId: filteredProducts[0]?.id || products[0]?.id,
      name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewText.trim(),
      photo: reviewPhoto || undefined,
    };

    const updated = [item, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem("zavero_simple_reviews", JSON.stringify(updated));
    } catch {
      notify(
        lang === "bn"
          ? "ছবির সাইজ বড় হওয়ায় ব্রাউজারে সেভ করা যায়নি, ছোট ছবি ব্যবহার করুন।"
          : "Photo too large for local storage; try a smaller photo."
      );
    }

    setReviewName("");
    setReviewText("");
    setReviewRating(5);
    setReviewPhoto("");
    notify(lang === "bn" ? "রিভিউ যোগ হয়েছে!" : "Review added!");
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
    return products.filter(
      (p) => typeof p.oldPrice === "number" && p.oldPrice > p.price
    ).length;
  }, [products]);

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
    return products.filter((item) => item.id !== quickViewProduct.id).slice(0, 3);
  }, [quickViewProduct, products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (showWishlistOnly && !wishlist.includes(p.id)) return false;
      if (
        flashSaleOnly &&
        !(typeof p.oldPrice === "number" && p.oldPrice > p.price)
      )
        return false;

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
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
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

    if (isMobileWalletPayment) {
      if (!senderNumber.trim() || !trxId.trim()) {
        setOrderError(
          lang === "bn"
            ? `আপনার ${paymentMethod} সেন্ডার নম্বর এবং TrxID দিন।`
            : `Please enter your ${paymentMethod} sender number and Transaction ID (TrxID).`
        );
        return;
      }
    }

    setSubmittingOrder(true);
    setOrderError("");

    try {
      const zoneLabel = isFreeDeliveryUnlocked
        ? "Free Delivery"
        : deliveryZone === "mymensingh"
        ? `Inside Mymensingh - ৳${deliveryConfig.insideMymensingh}`
        : `Outside Mymensingh - ৳${deliveryConfig.outsideMymensingh}`;

      const paymentSegment =
        paymentMethod === "Cash on Delivery"
          ? "Payment: Cash on Delivery"
          : `Payment: ${paymentMethod} | From: ${senderNumber.trim()} | TrxID: ${trxId.trim()}`;

      const fullAddress = `${customerAddress.trim()}, ${customerDistrict} (${zoneLabel}) • ${paymentSegment}${
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
          color: item.selectedColor || "",
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
        data.order?._id ||
        data.orderId ||
        `ZAV-${Date.now().toString().slice(-6)}`;
      setConfirmedOrderId(String(generatedId));
      setCart([]);
      if (!customerUser) {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
      }
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
    setMegaMenuOpen(false);
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
        ? "সাবস্ক্রাইব সম্পন্ন হয়েছে! ZAVERO-এর নতুন কালেকশন ও অফারের আপডেট পাবেন।"
        : "Subscribed! You will receive ZAVERO updates on new arrivals and offers."
    );
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#111827] pb-24 lg:pb-0 selection:bg-[#0077E6] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1E2B4D] text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg border border-white/15">
          {toastMessage}
        </div>
      )}

      {/* A. Announcement Bar */}
      <div className="bg-[#1E2B4D] text-white/95 text-xs py-2 px-3 sm:px-4 text-center tracking-wide border-b border-[#E3E6EB]/20">
        {lang === "bn"
          ? `${BRAND_NAME} (${BRAND_TAGLINE}) • সারা দেশে COD, bKash, Nagad ও Rocket • ময়মনসিংহের ভেতরে ৳${deliveryConfig.insideMymensingh} এবং বাইরে ৳${deliveryConfig.outsideMymensingh}`
          : `${BRAND_NAME} — ${BRAND_TAGLINE} • COD, bKash, Nagad & Rocket • Inside Mymensingh ৳${deliveryConfig.insideMymensingh} & Outside Mymensingh ৳${deliveryConfig.outsideMymensingh}`}
        {deliveryConfig.freeThreshold > 0
          ? lang === "bn"
            ? ` • ৳${deliveryConfig.freeThreshold}+ অর্ডারে ফ্রি ডেলিভারি`
            : ` • Free Delivery over ৳${deliveryConfig.freeThreshold}`
          : ""}
      </div>

      {/* B. Sticky Navigation Bar + Mega Menu (Mobile-First Clean Layout) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3E6EB] transition-all">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className="lg:hidden p-2 rounded-lg hover:bg-[#F4F6F9] text-[#111827] cursor-pointer shrink-0">
            
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
                src="/images/zavero-logo.png"
                alt={`${BRAND_NAME} — ${BRAND_TAGLINE}`}
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="leading-none">
                <span className="font-black text-sm sm:text-xl tracking-tight text-[#111827] block">
                  {BRAND_NAME}
                </span>
                <span className="text-[10px] font-semibold text-[#1E2B4D] tracking-wider hidden sm:block">
                  {BRAND_TAGLINE}
                </span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#F4F6F9] hover:bg-[#E3E6EB] text-[#111827] border border-[#E3E6EB] px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0077E6] shrink-0" />
              <span className="truncate max-w-[120px]">
                {lang === "bn"
                  ? `ডেলিভারি: ${deliveryLocation}`
                  : `Deliver to ${deliveryLocation}`}
              </span>
            </button>
          </div>

          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-[#4B5563]">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                jumpToCatalog();
              }}
              className="hover:text-[#0077E6] transition"
            >
              {lang === "bn" ? "হোম" : "Home"}
            </a>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMegaMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1 hover:text-[#0077E6] transition cursor-pointer"
              >
                <span>{lang === "bn" ? "ক্যাটাগরি" : "Mega Menu"}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {megaMenuOpen && (
                <div className="fixed inset-x-0 top-16 bg-[#1E2B4D] text-white border-b border-[#E3E6EB]/20 shadow-2xl z-40">
                  <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-4 gap-5">
                    {FEATURED_CATEGORIES.map((cat) => (
                      <button
                        key={`mega-${cat.title}`}
                        type="button"
                        onClick={() =>
                          jumpToCatalog({
                            cat: cat.filterKey,
                            sub: cat.subFilter,
                          })
                        }
                        className="text-left p-3 rounded-2xl bg-[#111827]/70 hover:bg-[#0077E6]/20 border border-white/10 hover:border-[#0077E6] transition cursor-pointer space-y-1"
                      >
                        <p className="text-xs font-extrabold text-white">
                          {catLabelText(cat.title)}
                        </p>
                        <p className="text-[11px] text-white/75">
                          {cat.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => jumpToCatalog({ cat: "all", sub: "all" })}
              className="hover:text-[#0077E6] transition cursor-pointer"
            >
              {lang === "bn" ? "সব প্রোডাক্ট" : "All Products"}
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ sub: "Men's Fashion" })}
              className="hover:text-[#0077E6] transition cursor-pointer"
            >
              {lang === "bn" ? "মেনস ফ্যাশন" : "Men's Fashion"}
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ sub: "Women's Fashion" })}
              className="hover:text-[#0077E6] transition cursor-pointer"
            >
              {lang === "bn" ? "উইমেনস ফ্যাশন" : "Women's Fashion"}
            </button>
            <button
              type="button"
              onClick={() => jumpToCatalog({ sub: "Gadgets" })}
              className="hover:text-[#0077E6] transition cursor-pointer"
            >
              {lang === "bn" ? "গ্যাজেটস" : "Gadgets"}
            </button>
            <Link
              href="/track-order"
              className="hover:text-[#0077E6] transition font-semibold text-[#111827]"
            >
              {lang === "bn" ? "অর্ডার ট্র্যাক" : "Track Order"}
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              aria-label="Open Search Overlay"
              className="w-8 h-8 sm:w-auto sm:h-10 sm:px-3 rounded-full bg-[#F4F6F9] hover:bg-[#E3E6EB] text-[#111827] border border-[#E3E6EB] flex items-center justify-center gap-1.5 text-xs font-medium transition cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 text-[#1E2B4D] shrink-0" />
              <span className="hidden md:inline">
                {lang === "bn" ? "সার্চ" : "Search"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              title="Switch Language (English / বাংলা)"
              className="h-8 sm:h-10 px-2 sm:px-3 rounded-full border border-[#E3E6EB] bg-white hover:bg-[#F4F6F9] text-[#111827] flex items-center gap-1 text-[11px] sm:text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E2B4D] shrink-0" />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>

            <button
              type="button"
              onClick={openAccountModal}
              title={customerUser ? customerUser.name : "Login / Register"}
              className={`h-8 sm:h-10 px-2 sm:px-3 rounded-full border flex items-center gap-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                customerUser
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                  : "bg-[#1E2B4D] border-[#1E2B4D] text-white hover:bg-[#151F38]"
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline max-w-[85px] truncate">
                {customerUser
                  ? customerUser.name.split(" ")[0]
                  : lang === "bn"
                  ? "লগইন"
                  : "Login"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => jumpToCatalog({ wishlistOnly: !showWishlistOnly })}
              title="Wishlist"
              className={`hidden sm:flex relative p-2.5 rounded-full border transition cursor-pointer shrink-0 ${
                showWishlistOnly
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-[#E3E6EB] text-[#111827] hover:bg-[#F4F6F9]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setActiveBottomTab("cart");
              }}
              className="relative flex items-center gap-1 sm:gap-2 bg-[#0077E6] hover:bg-[#0062BE] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{lang === "bn" ? "কার্ট" : "Cart"}</span>
              {totalCartCount > 0 && (
                <span className="bg-[#FFB020] text-[#111827] text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E3E6EB] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-[#F4F6F9] text-[#111827] border border-[#E3E6EB] px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0077E6]" />
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
                  openAccountModal();
                }}
                className="inline-flex items-center gap-1.5 bg-[#1E2B4D] text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {customerUser
                    ? customerUser.name
                    : lang === "bn"
                    ? "লগইন / রেজিস্টার"
                    : "Login / Register"}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-sm font-medium text-[#111827]">
              {STORE_CATEGORIES.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => jumpToCatalog({ sub: catName })}
                  className="text-left py-1.5 cursor-pointer hover:text-[#0077E6]"
                >
                  {catLabelText(catName)}
                </button>
              ))}
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 font-semibold text-[#0077E6] block"
              >
                {lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Order"}
              </Link>
              <Link
                href="/policies"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 block text-[#4B5563]"
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
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E3E6EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3E6EB] pb-3">
              <div className="flex items-center gap-2.5 flex-1">
                <Search className="w-5 h-5 text-[#0077E6]" />
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
                  className="w-full text-sm sm:text-base outline-none text-[#111827]"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(false)}
                className="p-2 rounded-full hover:bg-[#F4F6F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E3E6EB]">
                {filteredProducts.slice(0, 6).map((item) => (
                  <Link
                    key={`sr-${item.id}`}
                    href={`/products/${item.id}`}
                    onClick={() => setSearchOverlayOpen(false)}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F4F6F9] px-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover bg-[#F4F6F9]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111827] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#4B5563]">
                          {catLabelText(item.subCategory)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#111827] shrink-0">
                      ৳{item.price}
                    </span>
                  </Link>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="py-6 text-center text-xs text-[#4B5563]">
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
                className="bg-[#0077E6] hover:bg-[#0062BE] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                {lang === "bn" ? "ক্যাটালগে দেখুন" : "View in Catalog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. Hero Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-5 pb-8">
        <div className="bg-gradient-to-br from-[#1E2B4D] via-[#15203B] to-[#0B0C10] text-white rounded-3xl overflow-hidden border border-[#E3E6EB]/20 shadow-lg">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-7 p-5 sm:p-10 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#FFB020] font-bold">
                {lang === "bn"
                  ? `${BRAND_NAME} • ${BRAND_TAGLINE}`
                  : `${BRAND_NAME} • ${BRAND_TAGLINE}`}
              </p>
              <h1 className="text-2xl sm:text-5xl font-bold leading-[1.15] tracking-tight">
                {lang === "bn" ? (
                  <>
                    ট্রেন্ডের বাইরে গিয়ে
                    <br />
                    নিজের স্টাইল গড়ুন।
                  </>
                ) : (
                  <>
                    Explore Beyond Trends.
                    <br />
                    Elevated Daily Style.
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                {lang === "bn"
                  ? "মেনস ও উইমেনস ফ্যাশন, ফুটওয়্যার, বিউটি প্রোডাক্টস, গ্যাজেটস এবং মোবাইল অ্যাক্সেসরিজ অর্ডার করুন COD, bKash, Nagad বা Rocket-এ।"
                  : "Discover curated Fashion, Footwear, Beauty Products, Gadgets, and Mobile Accessories with COD, bKash, Nagad & Rocket across Bangladesh."}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => jumpToCatalog({ cat: "all", sub: "all" })}
                  className="bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm sm:text-base font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  {lang === "bn" ? "এখনই কিনুন (Shop Now)" : "Shop Now"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/15 bg-[#111827] shadow-md">
                <img
                  src="/hero-banner.jpg"
                  alt="ZAVERO — Explore Beyond Trends Showcase"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-10">
        <div className="rounded-2xl bg-gradient-to-r from-[#1E2B4D] via-[#17223D] to-[#0B0C10] text-white p-4 sm:p-5 border border-[#E3E6EB]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB020] text-[#111827] flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFB020] text-[#111827]">
                  {lang === "bn" ? "ফ্ল্যাশ সেল" : "Flash Sale"}
                </span>
                <span className="text-xs text-white/80">
                  {lang === "bn"
                    ? `${flashSaleCount}টি ডিসকাউন্টেড প্রোডাক্ট রয়েছে`
                    : `${flashSaleCount} discounted items available`}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold mt-0.5">
                {lang === "bn"
                  ? "বিশেষ ছাড়ে ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেটস ও মোবাইল অ্যাক্সেসরিজ অফার"
                  : "Special Discounts on Fashion, Footwear, Beauty, Gadgets & Mobile Accessories"}
              </h2>
            </div>
          </div>

          <button
            type="button"
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
              flashSaleOnly
                ? "bg-[#FFB020] text-[#111827]"
                : "bg-[#0077E6] text-white hover:bg-[#0062BE]"
            }`}
          >
            {flashSaleOnly
              ? lang === "bn"
                ? "সব প্রোডাক্ট দেখুন"
                : "Show All Products"
              : lang === "bn"
              ? "অফার প্রোডাক্ট দেখুন"
              : "View Offer Products"}
          </button>
        </div>
      </section>

      {/* D. Attractive Category Cards */}
      <section
        id="categories-section"
        className="max-w-7xl mx-auto px-3 sm:px-4 pb-12"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#0077E6]">
              {BRAND_NAME} Collections
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              {lang === "bn" ? "ক্যাটাগরি অনুযায়ী কিনুন" : "Shop by Category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => jumpToCatalog({ cat: "all", sub: "all" })}
            className="text-xs sm:text-sm font-semibold text-[#1E2B4D] hover:text-[#0077E6] cursor-pointer"
          >
            {lang === "bn" ? "সব দেখুন →" : "View All →"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURED_CATEGORIES.map((catItem) => {
            const count = products.filter(
              (p) =>
                canonicalCategoryLabel(p.subCategory).toLowerCase() ===
                catItem.subFilter.toLowerCase()
            ).length;
            const isSelected = selectedSubCategory === catItem.subFilter;

            return (
              <button
                key={catItem.title}
                type="button"
                onClick={() =>
                  jumpToCatalog({
                    cat: catItem.filterKey,
                    sub: isSelected ? "all" : catItem.subFilter,
                  })
                }
                className={`group text-left rounded-2xl bg-gradient-to-br ${catItem.gradientClass} text-white overflow-hidden border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#0077E6] ring-2 ring-[#0077E6]/50"
                    : "border-[#E3E6EB]/20 hover:border-[#0077E6] hover:-translate-y-0.5"
                }`}
              >
                <div className="relative h-28 sm:h-32 w-full bg-[#111827] overflow-hidden">
                  <img
                    src={catItem.image}
                    alt={catItem.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 bg-[#1E2B4D]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/15">
                    {count} {lang === "bn" ? "আইটেম" : "Items"}
                  </span>
                </div>
                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {catLabelText(catItem.title)}
                    </p>
                    <p className="text-[11px] text-white/75 truncate mt-0.5">
                      {catItem.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FFB020] shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* E & G. Enhanced Product Cards + Catalog Controls */}
      <section
        id="catalog-section"
        className="max-w-7xl mx-auto px-3 sm:px-4 pb-14"
      >
        <div className="bg-white rounded-3xl border border-[#E3E6EB] p-4 sm:p-6 mb-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] mr-2">
                {showWishlistOnly
                  ? lang === "bn"
                    ? "সেভ করা উইশলিস্ট"
                    : "Saved Wishlist"
                  : flashSaleOnly
                  ? lang === "bn"
                    ? "ফ্ল্যাশ সেল অফার"
                    : "Flash Sale Deals"
                  : selectedSubCategory !== "all"
                  ? catLabelText(selectedSubCategory)
                  : lang === "bn"
                  ? "ফিচার্ড কালেকশন"
                  : "Featured Collection"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowWishlistOnly(false);
                  setFlashSaleOnly(false);
                  setSelectedCategory("all");
                  setSelectedSubCategory("all");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition cursor-pointer ${
                  !showWishlistOnly &&
                  !flashSaleOnly &&
                  selectedSubCategory === "all" &&
                  selectedCategory === "all"
                    ? "bg-[#0077E6] text-white"
                    : "bg-[#F4F6F9] text-[#4B5563] hover:bg-[#E3E6EB]"
                }`}
              >
                {lang === "bn" ? "সব" : "ALL"}
              </button>

              {STORE_CATEGORIES.map((catLabel) => (
                <button
                  key={catLabel}
                  type="button"
                  onClick={() => {
                    setShowWishlistOnly(false);
                    setFlashSaleOnly(false);
                    setSelectedSubCategory(catLabel);
                    setSelectedCategory(normalizeCategory(catLabel));
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition cursor-pointer ${
                    !showWishlistOnly &&
                    !flashSaleOnly &&
                    selectedSubCategory === catLabel
                      ? "bg-[#0077E6] text-white"
                      : "bg-[#F4F6F9] text-[#4B5563] hover:bg-[#E3E6EB]"
                  }`}
                >
                  {catLabelText(catLabel)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#111827] outline-none cursor-pointer"
              >
                <option value="featured">
                  {lang === "bn" ? "সাজান: ফিচার্ড" : "Sort: Featured"}
                </option>
                <option value="price-asc">
                  {lang === "bn" ? "দাম: কম থেকে বেশি" : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {lang === "bn" ? "দাম: বেশি থেকে কম" : "Price: High to Low"}
                </option>
                <option value="discount">
                  {lang === "bn" ? "সর্বোচ্চ ছাড়" : "Biggest Discount"}
                </option>
              </select>

              <div className="flex items-center bg-[#F4F6F9] p-1 rounded-xl border border-[#E3E6EB]">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-[#0077E6] shadow-2xs"
                      : "text-[#4B5563]"
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
                      ? "bg-white text-[#0077E6] shadow-2xs"
                      : "text-[#4B5563]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Loading Skeleton */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#E3E6EB] p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-square rounded-2xl bg-[#E3E6EB]" />
                <div className="h-4 w-24 bg-[#E3E6EB] rounded" />
                <div className="h-5 w-3/4 bg-[#E3E6EB] rounded" />
                <div className="h-10 w-full bg-[#E3E6EB] rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E3E6EB] space-y-3">
            <p className="text-sm text-[#111827] font-semibold">
              {products.length === 0
                ? lang === "bn"
                  ? "বর্তমানে স্টোরে কোনো প্রোডাক্ট তালিকাভুক্ত নেই।"
                  : "No products are currently listed in the store."
                : lang === "bn"
                ? "এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি।"
                : "No products found matching your filter."}
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  jumpToCatalog();
                }}
                className="bg-[#0077E6] hover:bg-[#0062BE] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                {lang === "bn" ? "সব প্রোডাক্ট দেখুন" : "Show All Products"}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => {
              const isLiked = wishlist.includes(product.id);
              const discountPct = getDiscountPercent(
                product.price,
                product.oldPrice
              );
              const stockNum =
                typeof product.stock === "number" ? product.stock : 10;
              const isOutOfStock = stockNum <= 0;

              const activeImage =
                hoveredProductId === product.id && product.secondaryImage
                  ? product.secondaryImage
                  : product.image;

              const productReviews = reviews.filter(
                (r) => r.productId === product.id
              );

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  className={
                    viewMode === "grid"
                      ? "group flex flex-col justify-between bg-white rounded-3xl border border-[#E3E6EB] p-3 shadow-2xs hover:shadow-md transition"
                      : "group flex flex-col sm:flex-row items-center gap-5 bg-white rounded-3xl border border-[#E3E6EB] p-4 shadow-2xs hover:shadow-md transition"
                  }
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "relative aspect-square rounded-2xl bg-[#F4F6F9] overflow-hidden w-full"
                        : "relative w-full sm:w-44 aspect-square rounded-2xl bg-[#F4F6F9] overflow-hidden shrink-0"
                    }
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>

                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      {product.badge && (
                        <span className="bg-[#1E2B4D]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      {discountPct && (
                        <span className="bg-[#0077E6] text-white text-[11px] font-bold px-2 py-1 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? "bg-rose-600 text-white"
                            : "bg-white/90 text-[#1E2B4D] border border-[#E3E6EB]"
                        }`}
                      >
                        {isOutOfStock
                          ? lang === "bn"
                            ? "স্টক শেষ"
                            : "Out of Stock"
                          : lang === "bn"
                          ? "স্টকে আছে"
                          : "Stock Available"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        aria-label="Wishlist"
                        className="w-9 h-9 rounded-full bg-white/95 border border-[#E3E6EB] flex items-center justify-center shadow-2xs hover:bg-white transition cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked
                              ? "fill-rose-500 text-rose-500"
                              : "text-[#4B5563]"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        aria-label="Quick View"
                        className="w-9 h-9 rounded-full bg-white/95 border border-[#E3E6EB] flex items-center justify-center shadow-2xs hover:bg-white transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#4B5563]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between w-full pt-3 sm:pt-0 px-1 sm:px-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                          {catLabelText(product.subCategory)}
                        </span>
                        {productReviews.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111827]">
                            <Star className="w-3.5 h-3.5 fill-[#FFB020] text-[#FFB020]" />
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
                        className="font-bold text-base sm:text-lg text-[#111827] hover:text-[#0077E6] mt-0.5 leading-snug block"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-extrabold text-[#111827]">
                          ৳{product.price}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-xs text-[#4B5563]/70 line-through">
                            ৳{product.oldPrice}
                          </span>
                        )}
                      </div>

                      {product.category === "fashion" &&
                        product.sizes &&
                        product.sizes.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-[#4B5563] mr-1">
                              {lang === "bn" ? "সাইজ:" : "Size:"}
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
                                    ? "bg-[#1E2B4D] text-white border-[#1E2B4D]"
                                    : "bg-white text-[#4B5563] border-[#E3E6EB] hover:border-[#0077E6]"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}

                      {product.colors && product.colors.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-[#4B5563] mr-1">
                            {lang === "bn" ? "কালার:" : "Color:"}
                          </span>
                          {product.colors.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() =>
                                setSelectedColors({
                                  ...selectedColors,
                                  [product.id]: col,
                                })
                              }
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                                (selectedColors[product.id] ||
                                  product.colors?.[0]) === col
                                  ? "bg-[#FFB020]/25 text-[#111827] border-[#FFB020]"
                                  : "bg-[#F4F6F9] text-[#4B5563] border-[#E3E6EB]"
                              }`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      )}

                      {product.specs && (
                        <p className="mt-2 text-xs text-[#4B5563] bg-[#F4F6F9] px-3 py-1.5 rounded-lg font-medium truncate">
                          {product.specs}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-[#0077E6] hover:bg-[#0062BE] disabled:bg-[#E3E6EB] text-white disabled:text-[#4B5563] text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isOutOfStock
                          ? lang === "bn"
                            ? "স্টক শেষ"
                            : "Out of Stock"
                          : lang === "bn"
                          ? "কার্টে যোগ করুন"
                          : "Add to Cart"}
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="border border-[#E3E6EB] hover:border-[#0077E6] text-[#111827] text-xs sm:text-sm font-semibold py-2.5 px-3.5 rounded-xl transition cursor-pointer text-center"
                      >
                        {lang === "bn" ? "বিস্তারিত" : "Details"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Related Products Strip */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 bg-white rounded-3xl border border-[#E3E6EB] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                {lang === "bn" ? "রিলেটেড প্রোডাক্টস" : "Related Products"}
              </h3>
              <span className="text-xs text-[#4B5563]">
                {lang === "bn" ? "আপনার জন্য বাছাইকৃত" : "Curated picks"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {relatedProducts.map((rel) => (
                <Link
                  key={`rel-${rel.id}`}
                  href={`/products/${rel.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#E3E6EB] hover:border-[#0077E6] bg-[#F4F6F9]/60 transition"
                >
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="w-14 h-14 rounded-xl object-cover bg-[#E3E6EB] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#111827] truncate">
                      {rel.name}
                    </p>
                    <p className="text-xs font-extrabold text-[#0077E6] mt-0.5">
                      ৳{rel.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* F. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <div className="bg-[#1E2B4D] text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#E3E6EB]/20">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-[#FFB020] font-bold">
              {lang === "bn"
                ? `${BRAND_NAME} • ${BRAND_TAGLINE}`
                : `${BRAND_NAME} • ${BRAND_TAGLINE}`}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold">
              {lang === "bn"
                ? "আপনার স্টাইল, ফুটওয়্যার, বিউটি ও স্মার্ট টেক আপগ্রেড করুন"
                : "Upgrade Your Style, Footwear, Beauty & Tech"}
            </h3>
            <p className="text-sm text-white/80">
              {lang === "bn"
                ? "পার্সেল হাতে পেয়ে চেক করে মূল্য পরিশোধ করার সুবিধাসহ দ্রুত হোম ডেলিভারি।"
                : "Fast doorstep delivery across Bangladesh with COD, bKash, Nagad & Rocket."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => jumpToCatalog({ sort: "discount" })}
            className="bg-[#0077E6] text-white hover:bg-[#0062BE] text-sm font-semibold px-6 py-3 rounded-xl shrink-0 transition cursor-pointer"
          >
            {lang === "bn" ? "অফার দেখুন" : "Explore Deals"}
          </button>
        </div>
      </section>

      {/* H. Why Choose Us */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] mb-5">
          {lang === "bn" ? `কেন ${BRAND_NAME} বেছে নেবেন` : `Why Choose ${BRAND_NAME}`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E3E6EB] flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#0077E6] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#111827]">
                {lang === "bn"
                  ? "১০০% অরিজিনাল ও যাচাইকৃত পণ্য"
                  : "100% Authentic Products"}
              </h4>
              <p className="text-xs text-[#4B5563] mt-1">
                {lang === "bn"
                  ? "মান যাচাইকৃত ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেট ও মোবাইল অ্যাক্সেসরিজ।"
                  : "Verified Men's & Women's Fashion, Footwear, Beauty, Gadgets & Mobile Accessories."}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3E6EB] flex items-start gap-3.5">
            <Truck className="w-6 h-6 text-[#0077E6] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#111827]">
                {lang === "bn"
                  ? "সারা দেশে ক্যাশ অন ডেলিভারি"
                  : "Nationwide Cash on Delivery"}
              </h4>
              <p className="text-xs text-[#4B5563] mt-1">
                {lang === "bn"
                  ? "ময়মনসিংহ থেকে সারা বাংলাদেশে নির্ভরযোগ্য কুরিয়ার ডেলিভারি সুবিধা।"
                  : "Reliable courier dispatch from Mymensingh to every district in Bangladesh."}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3E6EB] flex items-start gap-3.5">
            <Sparkles className="w-6 h-6 text-[#0077E6] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#111827]">
                {lang === "bn"
                  ? "ওপেন পার্সেল চেক ও এক্সচেঞ্জ"
                  : "Open Parcel Check & Easy Exchange"}
              </h4>
              <p className="text-xs text-[#4B5563] mt-1">
                {lang === "bn"
                  ? "ডেলিভারি রাইডারের সামনে পার্সেল দেখে বুঝে নেওয়ার সুবিধা।"
                  : "Quick doorstep delivery with parcel inspection and easy size exchange."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Reviews */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
        <div className="bg-white rounded-3xl border border-[#E3E6EB] p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111827]">
              {lang === "bn" ? "কাস্টমার রিভিউ" : "Customer Reviews"}
            </h2>
            <span className="text-xs text-[#4B5563]">
              {reviews.length}{" "}
              {lang === "bn"
                ? "টি রিভিউ"
                : reviews.length === 1
                ? "review"
                : "reviews"}
            </span>
          </div>

          <form onSubmit={handleAddSimpleReview} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                placeholder={lang === "bn" ? "আপনার নাম *" : "Your name *"}
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="sm:col-span-3 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#0077E6]"
              />
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                aria-label="Rating"
                className="sm:col-span-2 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none cursor-pointer"
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
                    ? "রিসিভ করা প্রোডাক্ট নিয়ে আপনার মতামত লিখুন... *"
                    : "Write your review about the received product... *"
                }
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="sm:col-span-5 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#0077E6]"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-[#0077E6] hover:bg-[#0062BE] text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
              >
                {lang === "bn" ? "রিভিউ দিন" : "Post"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 bg-[#F4F6F9] hover:bg-[#E3E6EB] text-[#111827] border border-[#E3E6EB] text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition">
                <Sparkles className="w-3.5 h-3.5 text-[#0077E6]" />
                <span>
                  {lang === "bn"
                    ? "প্রোডাক্টের ছবি তুলুন / যোগ করুন"
                    : "Take / Add Product Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleReviewPhotoChange}
                  className="hidden"
                />
              </label>

              {reviewPhoto && (
                <div className="flex items-center gap-2 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl p-1.5 pr-2.5">
                  <img
                    src={reviewPhoto}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span className="text-xs text-[#4B5563]">
                    {lang === "bn" ? "ছবি যুক্ত হয়েছে" : "Photo attached"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReviewPhoto("")}
                    className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    {lang === "bn" ? "সরান" : "Remove"}
                  </button>
                </div>
              )}
            </div>
          </form>

          {reviews.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#4B5563] py-4">
              {lang === "bn"
                ? "এখনো কোনো রিভিউ দেওয়া হয়নি। পণ্য রিসিভ করার পর প্রথম রিভিউ ও ছবি দিন।"
                : "No reviews yet. Be the first to post a review with a photo of your received product."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-[#F4F6F9] border border-[#E3E6EB] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">
                      {rev.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#FFB020]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-[#FFB020] text-[#FFB020]"
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    {rev.comment}
                  </p>
                  {rev.photo && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#E3E6EB] border border-[#E3E6EB]">
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

      {/* J. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 pb-14">
        <div className="bg-white rounded-3xl border border-[#E3E6EB] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-[#111827]">
              {lang === "bn"
                ? `নতুন কালেকশন ও অফারের আপডেট পান (${BRAND_NAME})`
                : `Stay Updated with ${BRAND_NAME}`}
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563]">
              {lang === "bn"
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
                lang === "bn"
                  ? "আপনার ইমেইল লিখুন"
                  : "Enter your email address"
              }
              className="bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6] sm:w-64"
            />
            <button
              type="submit"
              className="bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {lang === "bn" ? "সাবস্ক্রাইব" : "Subscribe"}
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
        className="bg-[#1E2B4D] text-white/85 pt-12 pb-8 border-t border-[#E3E6EB]/20"
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/zavero-logo.png"
                alt={`${BRAND_NAME} Logo`}
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <h3 className="text-white font-black text-lg tracking-tight leading-none">
                  {BRAND_NAME}
                </h3>
                <span className="text-[11px] text-[#FFB020]">
                  {BRAND_TAGLINE}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {lang === "bn"
                ? `${BRAND_NAME} (${BRAND_TAGLINE})—মেনস ও উইমেনস ফ্যাশন, ফুটওয়্যার, গ্যাজেটস, বিউটি প্রোডাক্টস এবং মোবাইল অ্যাক্সেসরিজের অনলাইন স্টোর।`
                : `${BRAND_NAME} — ${BRAND_TAGLINE}. Serving Men's Fashion, Women's Fashion, Men's Footwear, Women's Footwear, Gadgets, Beauty Products, and Mobile Accessories.`}
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">
              {lang === "bn" ? "ক্যাটাগরি" : "Categories"}
            </h4>
            <ul className="space-y-2 text-white/75">
              {STORE_CATEGORIES.map((catName) => (
                <li key={catName}>
                  <button
                    type="button"
                    onClick={() => jumpToCatalog({ sub: catName })}
                    className="hover:text-white cursor-pointer"
                  >
                    {catLabelText(catName)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">
              {lang === "bn" ? "পলিসি ও সাপোর্ট" : "Policies & Support"}
            </h4>
            <ul className="space-y-2 text-white/75">
              <li>
                {lang === "bn"
                  ? `ময়মনসিংহের ভেতরে ৳${deliveryConfig.insideMymensingh} / বাইরে ৳${deliveryConfig.outsideMymensingh}`
                  : `Inside Mymensingh ৳${deliveryConfig.insideMymensingh} / Outside Mymensingh ৳${deliveryConfig.outsideMymensingh}`}
              </li>
              <li>
                <Link
                  href="/policies"
                  className="hover:text-white underline underline-offset-4"
                >
                  {lang === "bn"
                    ? "রিটার্ন, এক্সচেঞ্জ ও ডেলিভারি পলিসি"
                    : "Return, Exchange & Delivery Policy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white underline underline-offset-4"
                >
                  {lang === "bn"
                    ? "প্রাইভেসি পলিসি ও ডেটা ব্যবহার"
                    : "Privacy Policy & Data Use"}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white">
                  {lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Your Order"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <h4 className="text-white font-bold text-sm">
              {lang === "bn" ? "যোগাযোগ" : "Contact"}
            </h4>
            <ul className="space-y-2 text-white/75">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FFB020]" />
                <span>Mymensingh, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <a
                  href={WHATSAPP_WA_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Support"
                  className="hover:text-white inline-flex items-center gap-1.5 text-emerald-300"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[#FFB020]" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            © 2026 {BRAND_NAME} — {BRAND_TAGLINE}. All rights reserved.
          </p>
          <p>{SUPPORT_EMAIL}</p>
        </div>
      </footer>

     {/* Floating WhatsApp Icon Only (No Phone Number Exposed) & Scroll-to-Top */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex flex-col gap-2.5">
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-full bg-white text-[#111827] border border-[#E3E6EB] shadow-md flex items-center justify-center hover:bg-[#F4F6F9] cursor-pointer"
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

      {/* Floating Bottom Navigation Bar (Visible on Mobile, Tablet & Desktop) */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-xl z-40 bg-white/95 backdrop-blur-md border border-[#E3E6EB] rounded-full shadow-xl px-2 sm:px-3 py-1.5">
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
                  ? "bg-[#0077E6] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <Home className="w-4 h-4" />
            </span>
            <span
              className={`mt-0.5 ${
                activeBottomTab === "home"
                  ? "text-[#0077E6] font-bold"
                  : "text-[#4B5563]"
              }`}
            >
              {lang === "bn" ? "হোম" : "Home"}
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
                  ? "bg-[#0077E6] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </span>
            <span
              className={`mt-0.5 ${
                activeBottomTab === "categories"
                  ? "text-[#0077E6] font-bold"
                  : "text-[#4B5563]"
              }`}
            >
              {lang === "bn" ? "ক্যাটাগরি" : "Categories"}
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
                  ? "bg-[#0077E6] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFB020] text-[#111827] text-[9px] font-extrabold min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </span>
            <span
              className={`mt-0.5 ${
                activeBottomTab === "cart"
                  ? "text-[#0077E6] font-bold"
                  : "text-[#4B5563]"
              }`}
            >
              {lang === "bn" ? "কার্ট" : "Cart"}
            </span>
          </button>

          <Link
            href="/track-order"
            onClick={() => setActiveBottomTab("orders")}
            className="flex flex-col items-center justify-center py-1"
          >
            <span
              className={`w-9 h-7 rounded-full flex items-center justify-center transition ${
                activeBottomTab === "orders"
                  ? "bg-[#0077E6] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <Package className="w-4 h-4" />
            </span>
            <span
              className={`mt-0.5 ${
                activeBottomTab === "orders"
                  ? "text-[#0077E6] font-bold"
                  : "text-[#4B5563]"
              }`}
            >
              {lang === "bn" ? "অর্ডার" : "Track Order"}
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
                  ? "bg-[#0077E6] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <User className="w-4 h-4" />
            </span>
            <span
              className={`mt-0.5 ${
                activeBottomTab === "account"
                  ? "text-[#0077E6] font-bold"
                  : "text-[#4B5563]"
              }`}
            >
              {customerUser
                ? lang === "bn"
                  ? "অ্যাকাউন্ট"
                  : "Account"
                : lang === "bn"
                ? "লগইন"
                : "Login"}
            </span>
          </button>
        </div>
      </nav>

      {/* Delivery Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#E3E6EB] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0077E6]" />
                <h3 className="text-base font-bold text-[#111827]">
                  {lang === "bn"
                    ? "ডেলিভারি এলাকা নির্বাচন করুন"
                    : "Select Delivery Location"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F4F6F9] cursor-pointer"
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
                      active
                        ? "bg-[#0077E6] text-white border-[#0077E6]"
                        : "bg-[#F4F6F9] text-[#111827] border-[#E3E6EB] hover:border-[#0077E6]"
                    }`}
                  >
                    <p className="text-xs font-bold">{loc.label}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        active ? "text-white/85" : "text-[#4B5563]"
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

      {/* Login / Register (with Email OTP) / Forgot Password Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1E2B4D] text-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-[#E3E6EB]/20 my-auto">
            {customerUser ? (
              <div className="p-6 sm:p-8 max-w-md mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#FFB020]">
                      {BRAND_NAME} • {BRAND_TAGLINE}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {lang === "bn" ? "আমার অ্যাকাউন্ট" : "My Account"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountModalOpen(false);
                      setActiveBottomTab("home");
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#111827]/70 border border-white/10 rounded-2xl p-4 space-y-1.5">
                  <p className="text-base font-bold text-white">
                    {customerUser.name}
                  </p>
                  {customerUser.email && (
                    <p className="text-xs text-white/80">
                      {customerUser.email}
                    </p>
                  )}
                  {customerUser.phone && (
                    <p className="text-xs text-white/80 font-mono">
                      {customerUser.phone}
                    </p>
                  )}
                  <p className="text-xs text-white/60">
                    District: {customerUser.district}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/track-order"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="bg-[#0077E6] hover:bg-[#0062BE] text-white text-xs font-extrabold py-3 px-4 rounded-xl text-center transition"
                  >
                    {lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track My Orders"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleCustomerLogout}
                    className="inline-flex items-center justify-center gap-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-500/30 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {lang === "bn" ? "সাইন আউট" : "Sign Out"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setActiveBottomTab("home");
                  }}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  {lang === "bn"
                    ? "লগইন ছাড়াই শপিং চালিয়ে যান (Guest Shopping)"
                    : "Continue Guest Shopping"}
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12">
                {/* Left Auth Form Column */}
                <div className="lg:col-span-6 p-6 sm:p-8 space-y-4 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/images/zavero-logo.png"
                        alt={BRAND_NAME}
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      <div>
                        <span className="text-sm font-black tracking-wide text-white block leading-none">
                          {BRAND_NAME}
                        </span>
                        <span className="text-[10px] text-[#FFB020] font-medium">
                          {BRAND_TAGLINE}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountModalOpen(false);
                        setActiveBottomTab("home");
                      }}
                      aria-label="Close modal"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mode Switcher Tabs (Login & Register only) */}
                  <div className="grid grid-cols-2 gap-1.5 bg-[#111827]/75 p-1 rounded-xl border border-white/10 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setLoginError("");
                      }}
                      className={`py-2 rounded-lg cursor-pointer transition ${
                        authMode === "login"
                          ? "bg-[#0077E6] text-white shadow-xs"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {lang === "bn" ? "লগইন" : "Login"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setRegStep("form");
                        setRegOtpNotice("");
                        setLoginError("");
                      }}
                      className={`py-2 rounded-lg cursor-pointer transition ${
                        authMode === "register"
                          ? "bg-[#0077E6] text-white shadow-xs"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {lang === "bn" ? "রেজিস্টার" : "Register"}
                    </button>
                  </div>

                  {authMode === "login" && (
                    <form onSubmit={handleStandardLogin} className="space-y-3">
                      <span className="inline-flex items-center gap-1.5 bg-[#0077E6]/20 text-[#FFB020] border border-[#0077E6]/40 text-[11px] font-bold px-3 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {lang === "bn" ? "নিরাপদ কাস্টমার পোর্টাল" : "Verified Customer Access"}
                      </span>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        {lang === "bn" ? (
                          <>
                            আপনার <span className="text-[#FFB020]">{BRAND_NAME}</span>{" "}
                            অ্যাকাউন্টে লগইন করুন
                          </>
                        ) : (
                          <>
                            Login to Your{" "}
                            <span className="text-[#FFB020]">{BRAND_NAME}</span>{" "}
                            Account
                          </>
                        )}
                      </h3>

                      <input
                        type="text"
                        required
                        placeholder={
                          lang === "bn"
                            ? "আপনার ইমেইল বা মোবাইল নম্বর দিন *"
                            : "Enter your email or mobile number *"
                        }
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 outline-none"
                      />

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder={
                            lang === "bn"
                              ? "আপনার পাসওয়ার্ড দিন *"
                              : "Enter your password *"
                          }
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/45 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label="Toggle password"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <label className="inline-flex items-center gap-2 text-white/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="accent-[#0077E6] rounded"
                          />
                          <span>{lang === "bn" ? "মনে রাখুন" : "Remember Me"}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setForgotIdentifier(loginIdentifier);
                            setLoginError("");
                          }}
                          className="text-[#FFB020] hover:underline font-semibold cursor-pointer"
                        >
                          {lang === "bn"
                            ? "পাসওয়ার্ড ভুলে গেছেন?"
                            : "Forgot Password?"}
                        </button>
                      </div>

                      {loginError && (
                        <p className="text-xs text-rose-300 font-medium">
                          {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#0077E6] hover:bg-[#0062BE] text-white font-extrabold py-3 rounded-xl text-sm transition cursor-pointer shadow-sm"
                      >
                        {lang === "bn" ? "লগইন করুন →" : "Login →"}
                      </button>

                      <div className="text-center text-[11px] text-white/50">
                        {lang === "bn" ? "অথবা" : "OR"}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGoogleAuth(false)}
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                      >
                        {lang === "bn"
                          ? "Google দিয়ে চালিয়ে যান"
                          : "Continue with Google"}
                      </button>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setRegStep("form");
                            setRegOtpNotice("");
                            setLoginError("");
                          }}
                          className="text-[#FFB020] hover:underline font-semibold cursor-pointer"
                        >
                          {lang === "bn"
                            ? "নতুন অ্যাকাউন্ট খুলুন →"
                            : "Create Account →"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountModalOpen(false);
                            setActiveBottomTab("home");
                          }}
                          className="text-white/75 hover:text-white cursor-pointer"
                        >
                          {lang === "bn"
                            ? "গেস্ট হিসেবে কিনুন →"
                            : "Guest Shopping →"}
                        </button>
                      </div>

                      <p className="text-[11px] text-white/55 pt-1 leading-relaxed">
                        {lang === "bn"
                          ? "আপনার অর্ডার আপডেট ও ডেলিভারি সুবিধার জন্য তথ্য নিরাপদে সংরক্ষিত থাকে।"
                          : "Your account details are used securely for order updates, tracking, and saved delivery preferences."}
                      </p>
                    </form>
                  )}

                  {authMode === "register" &&
                    (regStep === "form" ? (
                      <form
                        onSubmit={handleRegisterSubmit}
                        className="space-y-2.5"
                      >
                        <h3 className="text-xl font-black text-white">
                          {lang === "bn" ? (
                            <>
                              নতুন <span className="text-[#FFB020]">{BRAND_NAME}</span>{" "}
                              অ্যাকাউন্ট তৈরি করুন
                            </>
                          ) : (
                            <>
                              Create Your{" "}
                              <span className="text-[#FFB020]">{BRAND_NAME}</span>{" "}
                              Account
                            </>
                          )}
                        </h3>

                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                        />

                        <input
                          type="email"
                          required
                          placeholder="Email Address *"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                        />

                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number (017XXXXXXXX) *"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                        />

                        <div className="grid sm:grid-cols-2 gap-2">
                          <input
                            type="password"
                            required
                            placeholder="Password *"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                          />
                          <input
                            type="password"
                            required
                            placeholder="Confirm Password *"
                            value={regConfirmPassword}
                            onChange={(e) =>
                              setRegConfirmPassword(e.target.value)
                            }
                            className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                          />
                        </div>

                        <label className="inline-flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-0.5">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="accent-[#0077E6] rounded"
                          />
                          <span>Agree to Terms & Conditions</span>
                        </label>

                        {loginError && (
                          <p className="text-xs text-rose-300 font-medium">
                            {loginError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={regLoading}
                          className="w-full bg-[#0077E6] hover:bg-[#0062BE] disabled:opacity-50 text-white font-extrabold py-2.5 rounded-xl text-sm transition cursor-pointer"
                        >
                          {regLoading
                            ? "Sending Code to Email..."
                            : "Create Account"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGoogleAuth(true)}
                          className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                        >
                          Sign Up with Google
                        </button>
                      </form>
                    ) : (
                      <form
                        onSubmit={handleVerifyRegistrationOtp}
                        className="space-y-3"
                      >
                        <h3 className="text-xl font-black text-white">
                          Verify Your Email
                        </h3>

                        {regOtpNotice && (
                          <p className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-2.5">
                            {regOtpNotice}
                          </p>
                        )}

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          placeholder="Enter 6-digit verification code *"
                          value={regOtpCode}
                          onChange={(e) =>
                            setRegOtpCode(e.target.value.replace(/\D/g, ""))
                          }
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2.5 text-center text-base tracking-widest text-white font-mono outline-none"
                        />

                        {loginError && (
                          <p className="text-xs text-rose-300 font-medium">
                            {loginError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={regLoading}
                          className="w-full bg-[#0077E6] hover:bg-[#0062BE] disabled:opacity-50 text-white font-extrabold py-2.5 rounded-xl text-sm transition cursor-pointer"
                        >
                          {regLoading
                            ? "Verifying..."
                            : "Verify & Complete Registration"}
                        </button>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRegStep("form");
                              setRegOtpCode("");
                              setLoginError("");
                            }}
                            className="text-white/70 hover:text-white cursor-pointer"
                          >
                            ← Edit Details
                          </button>

                          <button
                            type="button"
                            disabled={regLoading}
                            onClick={handleRegisterSubmit}
                            className="text-[#FFB020] hover:underline font-semibold cursor-pointer"
                          >
                            Resend Code
                          </button>
                        </div>
                      </form>
                    ))}

                  {authMode === "forgot" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#FFB020]">
                        <KeyRound className="w-4 h-4" />
                        <h3 className="text-lg font-black text-white">
                          Forgot Password
                        </h3>
                      </div>
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-2.5"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Enter Email or Mobile Number *"
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          className="w-full bg-[#111827]/75 border border-white/15 focus:border-[#0077E6] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                        />
                        <button
                          type="submit"
                          className="w-full bg-[#0077E6] hover:bg-[#0062BE] text-white font-extrabold py-2.5 rounded-xl text-sm transition cursor-pointer"
                        >
                          Send Reset Link
                        </button>
                      </form>
                      {forgotNotice && (
                        <p className="text-xs text-emerald-300">
                          {forgotNotice}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setAuthMode("login")}
                        className="text-xs text-[#FFB020] hover:underline cursor-pointer"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Trusted Brand Showcase Column (No Change Banner Button) */}
                <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-full bg-[#111827] flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
                  <img
                    src={authBannerImage}
                    alt={`${BRAND_NAME} Showcase`}
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/hero-banner.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/95 via-[#0B0C10]/65 to-[#1E2B4D]/80" />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-[#1E2B4D]/90 px-3 py-1 rounded-full border border-white/15">
                      {BRAND_NAME} • {BRAND_TAGLINE}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-4 pt-12">
                    <div className="space-y-1.5">
                      <p className="text-xl sm:text-2xl font-black text-white leading-snug">
                        {lang === "bn"
                          ? "নিশ্চিন্তে কেনাকাটা করুন বিশ্বস্ত কালেকশনের সাথে"
                          : "Shop Confidently with Curated Style & Tech"}
                      </p>
                      <p className="text-xs sm:text-sm text-white/80">
                        {lang === "bn"
                          ? "অর্ডার ট্র্যাকিং, সেভড ঠিকানা এবং দ্রুত ডেলিভারি সুবিধা এক জায়গায়।"
                          : "Track live orders, manage saved delivery details, and check out faster across Bangladesh."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                        <ShieldCheck className="w-4 h-4 text-[#FFB020] mb-1.5" />
                        <p className="text-xs font-bold text-white">
                          {lang === "bn" ? "১০০% অরিজিনাল" : "100% Authentic"}
                        </p>
                        <p className="text-[11px] text-white/70 mt-0.5">
                          {lang === "bn"
                            ? "যাচাইকৃত কোয়ালিটি"
                            : "Quality checked"}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                        <Truck className="w-4 h-4 text-[#FFB020] mb-1.5" />
                        <p className="text-xs font-bold text-white">
                          {lang === "bn" ? "COD ও ওয়ালেট" : "COD & Wallets"}
                        </p>
                        <p className="text-[11px] text-white/70 mt-0.5">
                          bKash, Nagad, Rocket
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3">
                        <Package className="w-4 h-4 text-[#FFB020] mb-1.5" />
                        <p className="text-xs font-bold text-white">
                          {lang === "bn" ? "লাইভ ট্র্যাকিং" : "Live Tracking"}
                        </p>
                        <p className="text-[11px] text-white/70 mt-0.5">
                          {lang === "bn"
                            ? "রিয়েল-টাইম আপডেট"
                            : "Real-time status"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick View Modal + Related Products */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E3E6EB] my-auto">
            <div className="grid sm:grid-cols-2">
              <div className="aspect-square bg-[#F4F6F9]">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                      {catLabelText(quickViewProduct.subCategory)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      className="p-1 rounded-full hover:bg-[#F4F6F9] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] mt-1">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-lg font-extrabold text-[#111827]">
                      ৳{quickViewProduct.price}
                    </span>
                    {quickViewProduct.oldPrice && (
                      <span className="text-xs text-[#4B5563]/70 line-through">
                        ৳{quickViewProduct.oldPrice}
                      </span>
                    )}
                  </div>

                  {quickViewProduct.description && (
                    <p className="text-xs text-[#4B5563] mt-3 leading-relaxed">
                      {quickViewProduct.description}
                    </p>
                  )}

                  {quickViewProduct.category === "fashion" &&
                    quickViewProduct.sizes &&
                    quickViewProduct.sizes.length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs text-[#4B5563] block mb-1.5">
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
                                  ? "bg-[#1E2B4D] text-white border-[#1E2B4D]"
                                  : "bg-white text-[#4B5563] border-[#E3E6EB]"
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
                        <span className="text-xs text-[#4B5563] block mb-1.5">
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
                                setSelectedColors({
                                  ...selectedColors,
                                  [quickViewProduct.id]: col,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                (selectedColors[quickViewProduct.id] ||
                                  quickViewProduct.colors?.[0]) === col
                                  ? "bg-[#FFB020]/25 text-[#111827] border-[#FFB020]"
                                  : "bg-white text-[#4B5563] border-[#E3E6EB]"
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
                  className="w-full bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm font-semibold py-3 rounded-xl transition cursor-pointer"
                >
                  {lang === "bn"
                    ? `কার্টে যোগ করুন — ৳${quickViewProduct.price}`
                    : `Add to Cart — ৳${quickViewProduct.price}`}
                </button>
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="p-5 bg-[#F4F6F9] border-t border-[#E3E6EB] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  {lang === "bn" ? "রিলেটেড প্রোডাক্টস" : "Related Products"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => setQuickViewProduct(rel)}
                      className="text-left bg-white p-2 rounded-2xl border border-[#E3E6EB] hover:border-[#0077E6] transition cursor-pointer"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#F4F6F9] mb-1.5">
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#111827] truncate">
                        {rel.name}
                      </p>
                      <p className="text-xs font-extrabold text-[#0077E6]">
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
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0B0C10]/55 backdrop-blur-xs">
          <div className="bg-[#F4F6F9] w-full max-w-md h-full flex flex-col justify-between overflow-y-auto p-5 sm:p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E3E6EB]">
                <h2 className="text-lg font-bold text-[#111827]">
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
                  className="p-2 rounded-full bg-white border border-[#E3E6EB] hover:bg-[#F4F6F9] cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#111827]" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="my-8 text-center bg-white border border-[#E3E6EB] p-6 rounded-3xl shadow-2xs space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#0077E6]/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#0077E6]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    {lang === "bn" ? "অর্ডার কনফার্ম হয়েছে!" : "Order Confirmed!"}
                  </h3>
                  <p className="text-xs text-[#4B5563]">
                    {lang === "bn" ? "অর্ডার আইডি:" : "Order Reference:"}{" "}
                    <span className="font-mono font-semibold text-[#111827]">
                      {confirmedOrderId}
                    </span>
                  </p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
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
                    className="mt-3 w-full bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm font-semibold py-3 rounded-2xl transition cursor-pointer"
                  >
                    {lang === "bn" ? "শপিং চালিয়ে যান" : "Continue Shopping"}
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center text-[#4B5563] my-16 text-sm space-y-3">
                  <p>
                    {lang === "bn"
                      ? "আপনার শপিং কার্ট বর্তমানে খালি।"
                      : "Your shopping cart is empty."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveBottomTab("home");
                    }}
                    className="bg-[#0077E6] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    {lang === "bn" ? "প্রোডাক্ট দেখুন" : "Browse Products"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-[#E3E6EB] divide-y divide-[#E3E6EB] my-4 px-4">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.selectedOption}-${item.selectedColor}`}
                        className="py-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-[#111827] truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-xs text-[#4B5563] block">
                            {item.selectedOption
                              ? `${lang === "bn" ? "সাইজ:" : "Size:"} ${
                                  item.selectedOption
                                } `
                              : ""}
                            {item.selectedColor
                              ? `• ${item.selectedColor}`
                              : ""}
                          </span>
                          <p className="text-sm font-bold text-[#111827] mt-0.5">
                            ৳{item.product.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(idx, -1)}
                            className="w-7 h-7 rounded-full bg-[#F4F6F9] hover:bg-[#E3E6EB] flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(idx, 1)}
                            className="w-7 h-7 rounded-full bg-[#F4F6F9] hover:bg-[#E3E6EB] flex items-center justify-center cursor-pointer"
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
                    <div className="bg-white rounded-2xl border border-[#E3E6EB] p-4 space-y-3">
                      <h3 className="font-bold text-sm text-[#111827]">
                        {lang === "bn" ? "ডেলিভারি তথ্য" : "Delivery Details"}
                      </h3>

                      <input
                        type="text"
                        required
                        placeholder={lang === "bn" ? "পুরো নাম *" : "Full Name *"}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
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
                        className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
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
                        className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
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
                        className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
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
                        className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
                      />

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeliveryZone("mymensingh")}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            deliveryZone === "mymensingh"
                              ? "bg-[#1E2B4D] border-[#1E2B4D] text-white"
                              : "bg-white border-[#E3E6EB] text-[#4B5563]"
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
                              ? "bg-[#1E2B4D] border-[#1E2B4D] text-white"
                              : "bg-white border-[#E3E6EB] text-[#4B5563]"
                          }`}
                        >
                          {lang === "bn"
                            ? `ময়মনসিংহের বাইরে (৳${deliveryConfig.outsideMymensingh})`
                            : `Outside Mymensingh (৳${deliveryConfig.outsideMymensingh})`}
                        </button>
                      </div>

                      <div className="pt-1">
                        <span className="text-xs font-semibold text-[#4B5563] block mb-1.5">
                          {lang === "bn" ? "পেমেন্ট মেথড:" : "Payment Method:"}
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
                                  ? "bg-[#0077E6] border-[#0077E6] text-white"
                                  : "bg-white border-[#E3E6EB] text-[#4B5563]"
                              }`}
                            >
                              {method === "Cash on Delivery" ? "COD" : method}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isMobileWalletPayment && (
                        <div className="p-3 rounded-2xl bg-[#FFB020]/15 border border-[#FFB020]/50 space-y-2 text-xs">
                          <p className="font-semibold text-[#111827]">
                            {paymentMethod} Send Money Number:{" "}
                            <span className="font-mono font-bold">
                              {activeWalletNumber}
                            </span>
                          </p>
                          <input
                            type="tel"
                            required
                            placeholder={`${paymentMethod} Sender Number (017XXXXXXXX) *`}
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            className="w-full bg-white border border-[#E3E6EB] rounded-xl px-3 py-2 text-xs text-[#111827] outline-none"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Transaction ID (TrxID) *"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full bg-white border border-[#E3E6EB] rounded-xl px-3 py-2 text-xs text-[#111827] outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E3E6EB] p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-[#4B5563]">
                        <span>{lang === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                        <span className="font-semibold text-[#111827]">
                          ৳{subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#4B5563]">
                        <span>
                          {lang === "bn"
                            ? "ডেলিভারি চার্জ"
                            : "Delivery Charge"}
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {deliveryCharge === 0
                            ? lang === "bn"
                              ? "ফ্রি (৳0)"
                              : "Free (৳0)"
                            : `৳${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-[#111827] pt-2 border-t border-[#E3E6EB]">
                        <span>
                          {lang === "bn" ? "সর্বমোট বিল" : "Total Payable"}
                        </span>
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
                      className="w-full bg-[#0077E6] hover:bg-[#0062BE] disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition shadow-md cursor-pointer"
                    >
                      {submittingOrder
                        ? lang === "bn"
                          ? "অর্ডার প্রসেস হচ্ছে..."
                          : "Placing Order..."
                        : lang === "bn"
                        ? `অর্ডার কনফার্ম করুন (৳${grandTotal})`
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