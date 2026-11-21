"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface TrackedOrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
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

const PROGRESS_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
] as const;

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
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const cleaned = query.trim();
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
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to search order status.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
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
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f7f7f7] text-neutral-900 flex flex-col"
    >
      <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4 text-center">
        FG Trend Tech • Real-Time Order Status Lookup
      </div>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <span className="font-black text-base sm:text-lg tracking-tight text-neutral-950">
            FG TREND TECH
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shrink-0">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-950">
                Track Your Order
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Enter your phone number (e.g. 017XXXXXXXX) or Order ID to check
                current status.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2.5 pt-1"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Phone number or Order ID..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-950"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer shrink-0"
            >
              {loading ? "Searching..." : "Track Order"}
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
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-neutral-800">
                  No orders found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-neutral-500">
                  Double-check your phone number or Order ID and try again.
                </p>
              </div>
            ) : (
              orders.map((order) => {
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
                    className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-neutral-400 font-mono">
                            Order ID: {order._id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(order._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === order._id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        </div>

                        <h2 className="text-base font-bold text-neutral-950">
                          {order.customerName} • {order.phone}
                        </h2>

                        {formattedDate && (
                          <p className="text-xs text-neutral-500">
                            Placed on: {formattedDate}
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
                        This order has been cancelled. For assistance, contact
                        support.
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
                                    ? "bg-neutral-950"
                                    : "bg-neutral-200"
                                }`}
                              />
                              <p
                                className={`text-[11px] font-bold text-center ${
                                  completed
                                    ? "text-neutral-950"
                                    : "text-neutral-400"
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-xs sm:text-sm text-neutral-600 space-y-1">
                      <p>
                        <span className="font-semibold text-neutral-800">
                          Address:
                        </span>{" "}
                        {order.address}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-800">
                          Items:
                        </span>{" "}
                        {(order.items || [])
                          .map(
                            (item) =>
                              `${item.name}${
                                item.size ? ` (${item.size})` : ""
                              } ×${item.quantity}`
                          )
                          .join(", ")}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm font-bold text-neutral-950">
                      <span>Total Payable</span>
                      <span>৳{Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-neutral-200 px-4 py-4 text-xs text-neutral-500 text-center">
        Need help with your order? Contact fgtrendtech.bd@gmail.com
      </footer>
    </div>
  );
}