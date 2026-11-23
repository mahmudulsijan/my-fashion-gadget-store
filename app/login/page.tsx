"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  KeyRound,
  Globe,
  CheckCircle2,
  Truck,
  Package,
  Lock,
  Sun,
  Moon,
} from "lucide-react";

const BRAND_NAME = "MAVÉRON";
const BRAND_TAGLINE = "ELEVATE YOUR EVERYDAY";
const SUPPORT_EMAIL = "maveron.store@gmail.com";

type Lang = "en" | "bn";
type ThemeMode = "night" | "light";

export default function LoginPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("bn");
  const [themeMode, setThemeMode] = useState<ThemeMode>("night");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLight = themeMode === "light";

  const t = {
    pageBg: isLight
      ? "bg-[#F4F4F6] text-[#111114]"
      : "bg-[#09090B] text-[#F4F4F5]",
    headerBg: isLight
      ? "bg-white/95 backdrop-blur-md border-b border-zinc-200"
      : "bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800",
    surface: isLight
      ? "bg-white border border-zinc-200 shadow-sm"
      : "bg-[#121216] border border-zinc-800 shadow-xl",
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
    badge: isLight
      ? "bg-zinc-100 text-zinc-900 border border-zinc-300"
      : "bg-zinc-900 text-zinc-200 border border-zinc-700",
    trustPanel: isLight
      ? "bg-[#18181B] text-white"
      : "bg-[#0E0E12] text-white border-t lg:border-t-0 lg:border-l border-zinc-800",
    footerBg: isLight
      ? "bg-white border-t border-zinc-200 text-zinc-600"
      : "bg-[#0E0E12] border-t border-zinc-800 text-zinc-400",
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

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            (lang === "bn"
              ? "ভেরিফিকেশন কোড পাঠানো যায়নি। আবার চেষ্টা করুন।"
              : "Could not send verification code. Please try again.")
        );
      } else {
        setMessage(
          data.message ||
            (lang === "bn"
              ? `${cleanEmail} ঠিকানায় ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`
              : `A 6-digit verification code has been sent to ${cleanEmail}.`)
        );
        setStep("code");
      }
    } catch {
      setError(
        lang === "bn"
          ? "নেটওয়ার্ক সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।"
          : "Network error occurred. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            (lang === "bn"
              ? "কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।"
              : "Invalid or expired verification code.")
        );
      } else {
        const resolvedName =
          String(data?.user?.name || data?.name || "").trim() ||
          cleanEmail.split("@")[0] ||
          `${BRAND_NAME} Member`;
        const resolvedDistrict = String(
          data?.user?.district || "Mymensingh"
        ).trim();
        const resolvedAddress = String(data?.user?.address || "").trim();

        const userPayload = {
          name: resolvedName,
          email: cleanEmail,
          district: resolvedDistrict,
          address: resolvedAddress,
          provider: "email",
          verified: true,
        };

        try {
          localStorage.setItem("maveron_user", JSON.stringify(userPayload));
        } catch {
          // ignore
        }

        try {
          await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userPayload),
          });
        } catch (syncErr) {
          console.error("Failed to sync verified user to /api/users:", syncErr);
        }

        setMessage(
          data.message ||
            (lang === "bn"
              ? "ইমেইল ভেরিফাই ও লগইন সফল হয়েছে!"
              : "Email verified and logged in successfully!")
        );
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(
        lang === "bn"
          ? "নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          : "Network error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${t.pageBg}`}
    >
      {/* Top Bar */}
      <header className={`sticky top-0 z-20 ${t.headerBg}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
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
                className={`font-black text-sm sm:text-base tracking-wider block ${t.titleText}`}
              >
                {BRAND_NAME}
              </span>
              <span
                className={`text-[9px] tracking-[0.18em] font-medium hidden sm:block ${t.mutedText}`}
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

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div
          className={`w-full max-w-4xl rounded-3xl overflow-hidden grid lg:grid-cols-12 ${t.surface}`}
        >
          {/* Left Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${t.badge}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === "bn"
                    ? "নিরাপদ ইমেইল OTP সাইন-ইন"
                    : "Protected One-Time Email Sign-In"}
                </span>

                <h1 className={`text-2xl font-black pt-1 ${t.titleText}`}>
                  {lang === "bn"
                    ? `${BRAND_NAME} অ্যাকাউন্টে লগইন করুন`
                    : `Sign In to ${BRAND_NAME}`}
                </h1>

                <p className={`text-xs sm:text-sm leading-relaxed ${t.mutedText}`}>
                  {step === "email"
                    ? lang === "bn"
                      ? "আপনার ইমেইলে একটি ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হবে। কোনো অতিরিক্ত পাসওয়ার্ড মনে রাখার প্রয়োজন নেই।"
                      : "Enter your email to receive a 6-digit verification code. No extra password required."
                    : lang === "bn"
                    ? `${email} ঠিকানায় পাঠানো ৬ ডিজিটের কোডটি নিচে লিখুন।`
                    : `Enter the 6-digit code sent to ${email}.`}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium">
                  {message}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-semibold mb-1.5 ${t.titleText}`}
                    >
                      {lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${t.mutedText}`}
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none transition ${t.input}`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-sm font-extrabold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs ${t.cta}`}
                  >
                    {loading
                      ? lang === "bn"
                        ? "কোড পাঠানো হচ্ছে..."
                        : "Sending Code..."
                      : lang === "bn"
                      ? "ভেরিফিকেশন কোড পাঠান"
                      : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-semibold mb-1.5 ${t.titleText}`}
                    >
                      {lang === "bn" ? "৬ ডিজিটের কোড" : "6-Digit Code"}
                    </label>
                    <div className="relative">
                      <KeyRound
                        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${t.mutedText}`}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="123456"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-center text-lg tracking-widest font-bold outline-none transition ${t.input}`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-sm font-extrabold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs ${t.cta}`}
                  >
                    {loading
                      ? lang === "bn"
                        ? "যাচাই করা হচ্ছে..."
                        : "Verifying..."
                      : lang === "bn"
                      ? "যাচাই ও লগইন করুন"
                      : "Verify & Sign In"}
                  </button>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError("");
                        setMessage("");
                      }}
                      className={`hover:underline cursor-pointer ${t.mutedText}`}
                    >
                      {lang === "bn" ? "ইমেইল পরিবর্তন করুন" : "Change Email"}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendCode}
                      className={`font-semibold hover:underline cursor-pointer ${t.titleText}`}
                    >
                      {lang === "bn" ? "আবার কোড পাঠান" : "Resend Code"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div
              className={`pt-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                t.mutedText
              } ${isLight ? "border-zinc-200" : "border-zinc-800"}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {lang === "bn"
                  ? "আপনার সেশন ও তথ্য সুরক্ষিত"
                  : "Your session details stay private"}
              </span>

              <Link
                href="/track-order"
                className={`font-semibold hover:underline ${t.titleText}`}
              >
                {lang === "bn" ? "অর্ডার ট্র্যাক করুন →" : "Track an Order →"}
              </Link>
            </div>
          </div>

          {/* Right Brand Trust Panel */}
          <div
            className={`lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 ${t.trustPanel}`}
          >
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                {BRAND_NAME} • {BRAND_TAGLINE}
              </span>
              <h2 className="text-xl font-bold leading-snug text-white">
                {lang === "bn"
                  ? "বিশ্বস্ত শপিং ও সহজ অর্ডার অভিজ্ঞতা"
                  : "Trusted Shopping Across Bangladesh"}
              </h2>
              <p className="text-xs text-zinc-300/80 leading-relaxed">
                {lang === "bn"
                  ? "ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেট ও মোবাইল অ্যাক্সেসরিজের নির্বিঘ্ন অর্ডার ও ট্র্যাকিং উপভোগ করুন।"
                  : "Enjoy seamless ordering, live order tracking, and flexible payment options across Bangladesh."}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-100">
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-zinc-200 shrink-0" />
                <span>
                  {lang === "bn"
                    ? "১০০% মান যাচাইকৃত অরিজিনাল পণ্য"
                    : "100% quality-checked authentic items"}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                <Truck className="w-4 h-4 text-zinc-200 shrink-0" />
                <span>
                  {lang === "bn"
                    ? "COD, bKash, Nagad ও Rocket পেমেন্ট"
                    : "COD, bKash, Nagad & Rocket supported"}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                <Package className="w-4 h-4 text-zinc-200 shrink-0" />
                <span>
                  {lang === "bn"
                    ? "রিয়েল-টাইম অর্ডার স্ট্যাটাস আপডেট"
                    : "Real-time order tracking & support"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 space-y-1">
              <p>
                {lang === "bn" ? "সাপোর্ট ইমেইল:" : "Support Email:"}{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-white hover:underline underline-offset-2"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-3.5 px-4 text-center text-xs ${t.footerBg}`}
      >
        © 2026 {BRAND_NAME} — {BRAND_TAGLINE}. All rights reserved.
      </footer>
    </div>
  );
}