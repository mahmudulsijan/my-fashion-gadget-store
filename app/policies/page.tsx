"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  ShieldCheck,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";

type Lang = "en" | "bn";
type ThemeMode = "night" | "light";

export default function PoliciesPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("night");

  const isLight = themeMode === "light";

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

  const t = {
    pageBg: isLight
      ? "bg-[#F4F4F6] text-[#111114]"
      : "bg-[#09090B] text-[#F4F4F5]",
    card: isLight
      ? "bg-white border border-zinc-200 shadow-2xs"
      : "bg-[#121216] border border-zinc-800 shadow-xl",
    pillBtn: isLight
      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300"
      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700",
    titleText: isLight ? "text-[#111114]" : "text-white",
    bodyText: isLight ? "text-zinc-700" : "text-zinc-300",
    mutedText: isLight ? "text-zinc-500" : "text-zinc-400",
  };

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen py-8 sm:py-10 px-4 transition-colors duration-200 ${t.pageBg}`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold ${t.titleText}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === "bn" ? "স্টোরে ফিরে যান" : "Back to Storefront"}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label="Toggle Light or Night Mode"
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
          </div>
        </div>

        <div className={`rounded-3xl p-6 sm:p-10 space-y-8 ${t.card}`}>
          <div>
            <p
              className={`text-xs uppercase tracking-widest font-bold ${t.mutedText}`}
            >
              {BRAND_NAME} ({BRAND_TAGLINE}) • Store Policies
            </p>
            <h1
              className={`text-2xl sm:text-3xl font-bold mt-1 ${t.titleText}`}
            >
              Return, Exchange &amp; Delivery Policy
            </h1>
          </div>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <Truck className="w-5 h-5" />
              <h2>1. Delivery Timeline &amp; Charges</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              We dispatch all orders from Mymensingh via trusted courier partners
              across Bangladesh. Inside Mymensingh delivery takes 24–48 hours,
              and Outside Mymensingh delivery takes 2–4 working days.
            </p>
            <p className={`text-sm leading-relaxed ${t.mutedText}`}>
              ময়মনসিংহের ভেতরে ২৪–৪৮ ঘণ্টার মধ্যে এবং ময়মনসিংহের বাইরে ২–৪
              কার্যদিবসের মধ্যে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছে দেওয়া হয়।
            </p>
          </section>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <RefreshCw className="w-5 h-5" />
              <h2>2. 7-Day Size &amp; Product Exchange</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              If a fashion or footwear item does not fit properly, you can
              request a size exchange within 7 days of receiving the parcel.
              The item must be unused, unwashed, and in its original packaging
              with tags intact.
            </p>
            <p className={`text-sm leading-relaxed ${t.mutedText}`}>
              ফ্যাশন বা জুতার সাইজ না মিললে পার্সেল পাওয়ার ৭ দিনের মধ্যে এক্সচেঞ্জ
              করতে পারবেন (পণ্য অবশ্যই অব্যবহৃত ও অরিজিনাল প্যাকেজিংয়ে থাকতে হবে)।
            </p>
          </section>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <h2>3. Open-Parcel Check &amp; Returns</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              Customers are encouraged to inspect the parcel in front of the
              delivery rider. If you receive a damaged, defective, or wrong
              item, you may return it immediately at the doorstep or contact
              our support team within 24 hours for a free replacement.
            </p>
            <p className={`text-sm leading-relaxed ${t.mutedText}`}>
              ডেলিভারি রাইডারের সামনে পার্সেল খুলে চেক করে নেওয়ার সুযোগ রয়েছে।
              ক্ষতিগ্রস্ত বা ভুল পণ্য পেলে সাথে সাথে রিটার্ন করতে পারবেন অথবা ২৪
              ঘণ্টার মধ্যে জানালে ফ্রি রিপ্লেসমেন্ট পাবেন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}