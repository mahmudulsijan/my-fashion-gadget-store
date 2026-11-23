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
  customerName: string;
  phone: string;
  address: string;
  items: TrackedOrderItem[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

const BRAND_NAME = "ZAVERO";
const BRAND_TAGLINE = "Explore Beyond Trends";
const WHATSAPP_WA_LINK = "https://wa.me/8801533919648";
const SUPPORT_EMAIL = "zavero.trends.bd@gmail.com";

const PROGRESS_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
] as const;

type Lang = "en" | "bn";
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

export default function TrackOrderPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("zavero_store_lang");
      if (savedLang === "en" || savedLang === "bn") {
        setLang(savedLang);
      }
    } catch {
      // ignore
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

  const fetchMatchingOrders = async (searchText: string) => {
    const cleaned = searchText.trim();
    if (!cleaned) return;

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.success || !Array.isArray(data.orders)) {
        throw new Error(data.message || "Could not load orders.");
      }

      const normalizedQuery = cleaned.replace(/^#/, "").toLowerCase();
      const matches = (data.orders as TrackedOrder[]).filter((ord) => {
        const phoneMatch = (ord.phone || "")
          .toLowerCase()
          .includes(normalizedQuery);
        const idMatch = String(ord._id || "")
          .toLowerCase()
          .includes(normalizedQuery);
        return phoneMatch || idMatch;
      });

      setOrders(matches);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to search order status.";
      setErrorMsg(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load orders if user is already logged in with a phone number
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("zavero_user") ||
        sessionStorage.getItem("zavero_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.phone) {
          setQuery(String(parsed.phone));
          fetchMatchingOrders(String(parsed.phone));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchMatchingOrders(query);
  };

  const visibleOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(
      (ord) => (ord.status || "Pending").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [orders, statusFilter]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Shipped":
        return "bg-[#0077E6]/10 text-[#0077E6] border-[#0077E6]/30";
      case "Confirmed":
        return "bg-[#1E2B4D]/10 text-[#1E2B4D] border-[#1E2B4D]/30";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-[#FFB020]/20 text-[#111827] border-[#FFB020]/50";
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#F4F6F9] text-[#111827] flex flex-col"
    >
      {/* Top Announcement Bar */}
      <div className="bg-[#1E2B4D] text-white text-xs py-2 px-4 text-center border-b border-[#E3E6EB]/20">
        {lang === "bn"
          ? `${BRAND_NAME} (${BRAND_TAGLINE}) • লাইভ অর্ডার স্ট্যাটাস ট্র্যাকিং`
          : `${BRAND_NAME} — ${BRAND_TAGLINE} • Real-Time Order Status Lookup`}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3E6EB]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#0077E6] transition"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{lang === "bn" ? "স্টোরে ফিরুন" : "Back to Store"}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="text-right leading-none">
              <span className="font-black text-sm sm:text-lg tracking-tight text-[#111827] block">
                {BRAND_NAME}
              </span>
              <span className="text-[10px] font-semibold text-[#4B5563] hidden sm:block">
                {BRAND_TAGLINE}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              className="h-9 px-3 rounded-full border border-[#E3E6EB] bg-white hover:bg-[#F4F6F9] text-[#111827] flex items-center gap-1 text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E2B4D]" />
              <span>{lang === "en" ? "বাংলা" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-8 sm:py-10 space-y-6">
        <div className="bg-white rounded-3xl border border-[#E3E6EB] p-5 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1E2B4D] text-[#FFB020] flex items-center justify-center shrink-0">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
                {lang === "bn" ? "আপনার অর্ডার ট্র্যাক করুন" : "Track Your Order"}
              </h1>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                {lang === "bn"
                  ? "বর্তমান ডেলিভারি স্ট্যাটাস জানতে মোবাইল নম্বর (যেমন: 017XXXXXXXX) অথবা অর্ডার আইডি দিন।"
                  : "Enter your phone number (e.g. 017XXXXXXXX) or Order ID to check current status."}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2.5 pt-1"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#4B5563] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "মোবাইল নম্বর বা অর্ডার আইডি লিখুন..."
                    : "Phone number or Order ID..."
                }
                className="w-full bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl pl-10 pr-9 py-3 text-sm text-[#111827] outline-none focus:border-[#0077E6]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOrders([]);
                    setSearched(false);
                    setErrorMsg("");
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0077E6] hover:bg-[#0062BE] disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer shrink-0"
            >
              {loading
                ? lang === "bn"
                  ? "খোঁজা হচ্ছে..."
                  : "Searching..."
                : lang === "bn"
                ? "অর্ডার খুঁজুন"
                : "Track Order"}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl p-4">
            {errorMsg}
          </div>
        )}

        {searched && !loading && !errorMsg && (
          <div className="space-y-4">
            {orders.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl border border-[#E3E6EB] p-3">
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
                        statusFilter === tab.key
                          ? "bg-[#1E2B4D] text-white"
                          : "bg-[#F4F6F9] text-[#4B5563] hover:bg-[#E3E6EB]"
                      }`}
                    >
                      {lang === "bn" ? tab.bn : tab.en}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#4B5563] px-2">
                  {visibleOrders.length}{" "}
                  {lang === "bn" ? "টি অর্ডার" : "order(s)"}
                </span>
              </div>
            )}

            {visibleOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E3E6EB] p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-[#111827]">
                  {lang === "bn"
                    ? `“${query}” এর জন্য কোনো অর্ডার পাওয়া যায়নি`
                    : `No orders found for “${query}”`}
                </p>
                <p className="text-xs text-[#4B5563]">
                  {lang === "bn"
                    ? "মোবাইল নম্বর অথবা অর্ডার আইডি আবার যাচাই করে চেষ্টা করুন।"
                    : "Double-check your phone number or Order ID and try again."}
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

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-3xl border border-[#E3E6EB] p-5 sm:p-6 shadow-2xs space-y-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#E3E6EB]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#4B5563] font-mono">
                            {lang === "bn" ? "অর্ডার আইডি:" : "Order ID:"}{" "}
                            {order._id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(order._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F4F6F9] hover:bg-[#E3E6EB] text-[#111827] px-2 py-0.5 rounded-md transition cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === order._id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
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

                        <h2 className="text-base font-bold text-[#111827]">
                          {order.customerName} • {order.phone}
                        </h2>

                        {formattedDate && (
                          <p className="text-xs text-[#4B5563]">
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
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-2xl">
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
                                  completed ? "bg-[#0077E6]" : "bg-[#E3E6EB]"
                                }`}
                              />
                              <p
                                className={`text-[11px] font-bold text-center ${
                                  completed ? "text-[#111827]" : "text-[#4B5563]/60"
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-xs sm:text-sm text-[#4B5563] space-y-1">
                      <p>
                        <span className="font-semibold text-[#111827]">
                          {lang === "bn" ? "ঠিকানা:" : "Address:"}
                        </span>{" "}
                        {order.address}
                      </p>
                      <p>
                        <span className="font-semibold text-[#111827]">
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

                    <div className="pt-3 border-t border-[#E3E6EB] flex items-center justify-between text-sm font-bold text-[#111827]">
                      <span>
                        {lang === "bn" ? "সর্বমোট পরিশোধযোগ্য" : "Total Payable"}
                      </span>
                      <span className="text-[#0077E6]">
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
      <footer className="bg-[#1E2B4D] text-white/80 border-t border-[#E3E6EB]/20 px-4 py-4 text-xs">
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
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1 hover:text-white"
            >
              <Mail className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}