"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PackageSearch,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  XCircle,
  Globe,
  MessageCircle,
  Mail,
  X,
  Sun,
  Moon,
  Phone,
  Hash,
} from "lucide-react";

interface TrackedOrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface TrackedOrder {
  _id: string;
  orderId?: string;
  customerName: string;
  maskedPhone: string;
  maskedAddress: string;
  items: TrackedOrderItem[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";
const SUPPORT_EMAIL = "maveron.store@gmail.com";

const PROGRESS_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
] as const;

type Lang = "en" | "bn";
type ThemeMode = "night" | "light";
type StatusFilter = "all" | "Pending" | "Confirmed" | "Shipped" | "Delivered";

function formatOrderDate(rawDate?: string): string | null {
  if (!rawDate) return null;
  const dt = new Date(rawDate);
  if (Number.isNaN(dt.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(dt);
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    return "0" + digits.slice(3, 13);
  }
  return digits;
}

export default function TrackOrderPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("night");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isLight = themeMode === "light";

  const t = {
    pageBg: isLight
      ? "bg-[#F4F4F6] text-[#111114]"
      : "bg-[#09090B] text-[#F4F4F5]",
    topBar: isLight
      ? "bg-[#18181B] text-zinc-200 border-b border-zinc-800"
      : "bg-[#121216] text-zinc-300 border-b border-zinc-800",
    headerBg: isLight
      ? "bg-white/95 backdrop-blur-md border-b border-zinc-200"
      : "bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800",
    surface: isLight
      ? "bg-white border border-zinc-200 shadow-2xs"
      : "bg-[#121216] border border-zinc-800 shadow-sm",
    surfaceAlt: isLight
      ? "bg-zinc-100 border border-zinc-200"
      : "bg-zinc-900 border border-zinc-800",
    pillBtn: isLight
      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300"
      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700",
    input: isLight
      ? "bg-zinc-100 border border-zinc-300 text-[#111114] placeholder:text-zinc-500 focus:border-zinc-500"
      : "bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-400",
    titleText: isLight ? "text-[#111114]" : "text-white",
    bodyText: isLight ? "text-zinc-700" : "text-zinc-300",
    mutedText: isLight ? "text-zinc-500" : "text-zinc-400",
    cta: isLight
      ? "bg-gradient-to-b from-[#27272A] via-[#18181B] to-[#09090B] hover:opacity-95 text-white"
      : "bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 hover:brightness-105 text-zinc-950",
    chipActive: isLight
      ? "bg-[#18181B] text-white"
      : "bg-white text-zinc-950",
    chipIdle: isLight
      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
    footerBg: isLight
      ? "bg-white text-zinc-600 border-t border-zinc-200"
      : "bg-[#0E0E12] text-zinc-400 border-t border-zinc-800",
  };

  useEffect(() => {
    try {
      const savedLang =
        localStorage.getItem("maveron_store_lang") ||
        localStorage.getItem("zavero_store_lang");
      if (savedLang === "en" || savedLang === "bn") {
        setLang(savedLang);
      }

      const savedTheme = localStorage.getItem("maveron_theme_mode");
      if (savedTheme === "night" || savedTheme === "light") {
        setThemeMode(savedTheme);
      }
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

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOrderId = orderIdInput.trim().replace(/^#/, "");
    const cleanPhone = normalizePhone(phoneInput.trim());

    if (!cleanOrderId || !cleanPhone) {
      setErrorMsg(
        lang === "bn"
          ? "অর্ডার ট্র্যাক করতে Order ID এবং Phone Number উভয়টিই দিন।"
          : "Please enter both Order ID and Phone Number to track your order."
      );
      setSearched(true);
      setOrders([]);
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg(
        lang === "bn"
          ? "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।"
          : "Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX)."
      );
      setSearched(true);
      setOrders([]);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    try {
      const url = `/api/orders/track?orderId=${encodeURIComponent(
        cleanOrderId
      )}&phone=${encodeURIComponent(cleanPhone)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.success || !Array.isArray(data.orders)) {
        throw new Error(data.message || "Could not verify order.");
      }

      setOrders(data.orders as TrackedOrder[]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to search order status.";
      setErrorMsg(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(
      (ord) =>
        (ord.status || "Pending").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [orders, statusFilter]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Shipped":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "Confirmed":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "Cancelled":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen flex flex-col transition-colors duration-200 ${t.pageBg}`}
    >
      {/* Top Announcement Bar */}
      <div className={`text-xs py-2 px-4 text-center ${t.topBar}`}>
        {lang === "bn"
          ? `${BRAND_NAME} (${BRAND_TAGLINE}) • নিরাপদ অর্ডার স্ট্যাটাস ট্র্যাকিং`
          : `${BRAND_NAME} — ${BRAND_TAGLINE} • Verified Order Status Lookup`}
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-30 ${t.headerBg}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${t.titleText}`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{lang === "bn" ? "স্টোরে ফিরুন" : "Back to Store"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-right leading-none mr-1">
              <span
                className={`font-black text-sm sm:text-lg tracking-wider block ${t.titleText}`}
              >
                {BRAND_NAME}
              </span>
              <span
                className={`text-[9px] tracking-[0.18em] font-semibold hidden sm:block ${t.mutedText}`}
              >
                {BRAND_TAGLINE}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label="Toggle Light or Night Mode"
              className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${t.pillBtn}`}
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
              className={`h-9 px-3 rounded-full flex items-center gap-1 text-xs font-bold transition cursor-pointer ${t.pillBtn}`}
            >
              <Globe className={`w-3.5 h-3.5 ${t.mutedText}`} />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-8 sm:py-10 space-y-6">
        <div className={`rounded-3xl p-5 sm:p-8 space-y-4 ${t.surface}`}>
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isLight
                  ? "bg-[#18181B] text-white"
                  : "bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-950"
              }`}
            >
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${t.titleText}`}>
                {lang === "bn" ? "আপনার অর্ডার ট্র্যাক করুন" : "Track Your Order"}
              </h1>
              <p className={`text-xs sm:text-sm ${t.mutedText}`}>
                {lang === "bn"
                  ? "অর্ডার দেখতে Order ID এবং অর্ডারের সময় ব্যবহৃত Phone Number উভয়টিই দিন। একটির সাথে অন্যটি না মিললে তথ্য দেখাবে না।"
                  : "Enter both your Order ID and Phone Number. Results only appear when both match."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Separate Box 1: Order ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="track-order-id"
                  className={`block text-xs font-bold ${t.titleText}`}
                >
                  {lang === "bn" ? "অর্ডার আইডি (Order ID) *" : "Order ID *"}
                </label>
                <div className="relative">
                  <Hash
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${t.mutedText}`}
                  />
                  <input
                    id="track-order-id"
                    type="text"
                    required
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "যেমন: 675f... অথবা MVR-123456"
                        : "e.g. 675f... or MVR-123456"
                    }
                    className={`w-full rounded-xl pl-10 pr-9 py-3 text-sm outline-none ${t.input}`}
                  />
                  {orderIdInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderIdInput("");
                        setOrders([]);
                        setSearched(false);
                        setErrorMsg("");
                      }}
                      aria-label="Clear Order ID"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${t.mutedText}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Separate Box 2: Phone Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="track-phone"
                  className={`block text-xs font-bold ${t.titleText}`}
                >
                  {lang === "bn"
                    ? "মোবাইল নম্বর (Phone Number) *"
                    : "Phone Number *"}
                </label>
                <div className="relative">
                  <Phone
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${t.mutedText}`}
                  />
                  <input
                    id="track-phone"
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "যেমন: 017XXXXXXXX"
                        : "e.g. 017XXXXXXXX"
                    }
                    className={`w-full rounded-xl pl-10 pr-9 py-3 text-sm outline-none ${t.input}`}
                  />
                  {phoneInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneInput("");
                        setOrders([]);
                        setSearched(false);
                        setErrorMsg("");
                      }}
                      aria-label="Clear Phone Number"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${t.mutedText}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-extrabold px-6 py-3 rounded-xl transition cursor-pointer ${t.cta}`}
            >
              <Search className="w-4 h-4" />
              <span>
                {loading
                  ? lang === "bn"
                    ? "যাচাই ও খোঁজা হচ্ছে..."
                    : "Verifying & Searching..."
                  : lang === "bn"
                  ? "অর্ডার খুঁজুন"
                  : "Track Order"}
              </span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-2xl p-4">
            {errorMsg}
          </div>
        )}

        {searched && !loading && !errorMsg && (
          <div className="space-y-4">
            {orders.length > 0 && (
              <div
                className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl p-3 ${t.surface}`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { key: "all", en: "All", bn: "সব" },
                      { key: "Pending", en: "Pending", bn: "পেন্ডিং" },
                      { key: "Confirmed", en: "Confirmed", bn: "কনফার্মড" },
                      { key: "Shipped", en: "Shipped", bn: "শিপড" },
                      { key: "Delivered", en: "Delivered", bn: "ডেলিভার্ড" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        statusFilter === tab.key ? t.chipActive : t.chipIdle
                      }`}
                    >
                      {lang === "bn" ? tab.bn : tab.en}
                    </button>
                  ))}
                </div>
                <span className={`text-xs font-semibold px-2 ${t.mutedText}`}>
                  {visibleOrders.length}{" "}
                  {lang === "bn" ? "টি অর্ডার" : "order(s)"}
                </span>
              </div>
            )}

            {visibleOrders.length === 0 ? (
              <div className={`rounded-3xl p-8 text-center space-y-2 ${t.surface}`}>
                <p className={`text-sm font-semibold ${t.titleText}`}>
                  {lang === "bn"
                    ? "Order ID এবং Phone Number মিলেনি"
                    : "Order ID and Phone Number did not match"}
                </p>
                <p className={`text-xs ${t.mutedText}`}>
                  {lang === "bn"
                    ? "সঠিক Order ID এবং অর্ডার করার সময় ব্যবহৃত সঠিক মোবাইল নম্বর একসাথে দিন।"
                    : "Please make sure both the Order ID and the exact Phone Number used during checkout match an existing order."}
                </p>
              </div>
            ) : (
              visibleOrders.map((order) => {
                const currentStatus = order.status || "Pending";
                const isCancelled = currentStatus === "Cancelled";
                const activeStepIdx = Math.max(
                  0,
                  PROGRESS_STEPS.findIndex(
                    (step) => step.toLowerCase() === currentStatus.toLowerCase()
                  )
                );
                const formattedDate = formatOrderDate(order.createdAt);
                const displayId = order.orderId || order._id;

                return (
                  <div
                    key={order._id}
                    className={`rounded-3xl p-5 sm:p-6 space-y-5 ${t.surface}`}
                  >
                    <div
                      className={`flex flex-wrap items-start justify-between gap-3 pb-3 border-b ${
                        isLight ? "border-zinc-200" : "border-zinc-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-mono ${t.mutedText}`}>
                            {lang === "bn" ? "অর্ডার আইডি:" : "Order ID:"}{" "}
                            {displayId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(displayId)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer ${t.pillBtn}`}
                            title="Copy Order ID"
                          >
                            {copiedId === displayId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>
                                  {lang === "bn" ? "কপি হয়েছে" : "Copied"}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>
                                  {lang === "bn" ? "কপি আইডি" : "Copy ID"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        <h2 className={`text-base font-bold ${t.titleText}`}>
                          {order.customerName} • {order.maskedPhone}
                        </h2>

                        {formattedDate && (
                          <p className={`text-xs ${t.mutedText}`}>
                            {lang === "bn" ? "অর্ডারের সময়:" : "Placed on:"}{" "}
                            {formattedDate}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusBadgeStyle(
                          currentStatus
                        )}`}
                      >
                        {currentStatus === "Delivered" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isCancelled ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {currentStatus}
                      </span>
                    </div>

                    {/* Progress Stepper */}
                    {isCancelled ? (
                      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-4 py-2.5 rounded-2xl">
                        {lang === "bn"
                          ? "এই অর্ডারটি বাতিল করা হয়েছে। সহায়তার জন্য সাপোর্টে যোগাযোগ করুন।"
                          : "This order has been cancelled. For assistance, contact support."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {PROGRESS_STEPS.map((step, idx) => {
                          const completed = idx <= activeStepIdx;
                          return (
                            <div key={step} className="space-y-1.5">
                              <div
                                className={`h-2 rounded-full transition ${
                                  completed
                                    ? isLight
                                      ? "bg-[#18181B]"
                                      : "bg-white"
                                    : isLight
                                    ? "bg-zinc-200"
                                    : "bg-zinc-800"
                                }`}
                              />
                              <p
                                className={`text-[11px] font-bold text-center ${
                                  completed ? t.titleText : t.mutedText
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className={`text-xs sm:text-sm space-y-1 ${t.bodyText}`}>
                      <p>
                        <span className={`font-semibold ${t.titleText}`}>
                          {lang === "bn" ? "ঠিকানা:" : "Address:"}
                        </span>{" "}
                        {order.maskedAddress}
                      </p>
                      <p>
                        <span className={`font-semibold ${t.titleText}`}>
                          {lang === "bn" ? "আইটেম:" : "Items:"}
                        </span>{" "}
                        {(order.items || [])
                          .map(
                            (item) =>
                              `${item.name}${
                                item.size ? ` (${item.size})` : ""
                              }${item.color ? ` • ${item.color}` : ""} ×${
                                item.quantity
                              }`
                          )
                          .join(", ")}
                      </p>
                    </div>

                    <div
                      className={`pt-3 border-t flex items-center justify-between text-sm font-bold ${t.titleText} ${
                        isLight ? "border-zinc-200" : "border-zinc-800"
                      }`}
                    >
                      <span>
                        {lang === "bn" ? "সর্বমোট পরিশোধযোগ্য" : "Total Payable"}
                      </span>
                      <span>
                        ৳{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`px-4 py-4 text-xs ${t.footerBg}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>
            {lang === "bn"
              ? "অর্ডার নিয়ে সহায়তা প্রয়োজন?"
              : "Need help with your order?"}
          </span>
          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-500 hover:underline font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={`inline-flex items-center gap-1 ${
                isLight ? "hover:text-zinc-950" : "hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}