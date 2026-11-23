"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Database,
  PhoneCall,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const SUPPORT_EMAIL = "maveron.store@gmail.com";

type Lang = "en" | "bn";
type ThemeMode = "night" | "light";

export default function PrivacyPage() {
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
              {BRAND_NAME} ({BRAND_TAGLINE}) • Privacy &amp; Security
            </p>
            <h1
              className={`text-2xl sm:text-3xl font-bold mt-1 ${t.titleText}`}
            >
              Privacy Policy &amp; Data Use
            </h1>
          </div>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <Database className="w-5 h-5" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              When you place an order or create a quick customer profile on{" "}
              {BRAND_NAME}, we collect only the details required to fulfill your
              delivery: your name, phone number, district, delivery address, and
              payment transaction ID (if paying via bKash/Nagad/Rocket).
            </p>
            <p className={`text-sm leading-relaxed ${t.mutedText}`}>
              অর্ডার সম্পন্ন ও ডেলিভারি করার জন্য আমরা কেবল আপনার নাম, মোবাইল
              নম্বর, জেলা, ঠিকানা এবং মোবাইল পেমেন্টের ক্ষেত্রে TrxID সংগ্রহ করি।
            </p>
          </section>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <Lock className="w-5 h-5" />
              <h2>2. How Your Data Is Used</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              Your personal information is strictly used for order confirmation,
              courier dispatch, customer support, and order tracking. We never
              sell, rent, or share your phone number or address with third-party
              marketers.
            </p>
            <p className={`text-sm leading-relaxed ${t.mutedText}`}>
              আপনার তথ্য শুধুমাত্র অর্ডার কনফার্মেশন, কুরিয়ার ডেলিভারি এবং অর্ডার
              ট্র্যাকিংয়ের কাজে ব্যবহৃত হয়। কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য
              বিক্রি বা শেয়ার করা হয় না।
            </p>
          </section>

          <section className="space-y-2.5">
            <div
              className={`flex items-center gap-2 font-bold text-base ${t.titleText}`}
            >
              <PhoneCall className="w-5 h-5" />
              <h2>3. Data Removal &amp; Support</h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.bodyText}`}>
              You can clear your saved browser profile anytime from the Account
              menu or contact us at{" "}
              <span className={`font-semibold ${t.titleText}`}>
                {SUPPORT_EMAIL}
              </span>{" "}
              to request updates or removal of your order records.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}