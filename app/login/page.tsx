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
} from "lucide-react";

const BRAND_NAME = "ZAVERO";
const BRAND_TAGLINE = "Explore Beyond Trends";
const SUPPORT_EMAIL = "zavero.trends.bd@gmail.com";

type Lang = "en" | "bn";

export default function LoginPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("bn");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        try {
          const fallbackName = cleanEmail.split("@")[0] || "ZAVERO Member";
          localStorage.setItem(
            "zavero_user",
            JSON.stringify({
              name: fallbackName,
              email: cleanEmail,
              district: "Mymensingh",
              address: "",
              provider: "email",
              verified: true,
            })
          );
        } catch {
          // ignore
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
    <div className="min-h-screen bg-[#F4F6F9] text-[#111827] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#E3E6EB] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#0077E6] transition"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{lang === "bn" ? "স্টোরে ফিরুন" : "Back to Store"}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="text-right leading-none">
              <span className="font-black text-sm sm:text-base tracking-tight text-[#111827] block">
                {BRAND_NAME}
              </span>
              <span className="text-[10px] font-medium text-[#4B5563] hidden sm:block">
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

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-4xl bg-white border border-[#E3E6EB] rounded-3xl shadow-sm overflow-hidden grid lg:grid-cols-12">
          {/* Left Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 bg-[#0077E6]/10 text-[#0077E6] border border-[#0077E6]/25 text-[11px] font-bold px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === "bn"
                    ? "নিরাপদ ইমেইল OTP সাইন-ইন"
                    : "Protected One-Time Email Sign-In"}
                </span>

                <h1 className="text-2xl font-black text-[#111827] pt-1">
                  {lang === "bn"
                    ? `${BRAND_NAME} অ্যাকাউন্টে লগইন করুন`
                    : `Sign In to ${BRAND_NAME}`}
                </h1>

                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
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
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
                  {message}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#111827] mb-1.5">
                      {lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#4B5563] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl text-sm text-[#111827] outline-none focus:border-[#0077E6] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
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
                    <label className="block text-xs sm:text-sm font-semibold text-[#111827] mb-1.5">
                      {lang === "bn" ? "৬ ডিজিটের কোড" : "6-Digit Code"}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#4B5563] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#F4F6F9] border border-[#E3E6EB] rounded-xl text-center text-lg tracking-widest font-bold text-[#111827] outline-none focus:border-[#0077E6] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#0077E6] hover:bg-[#0062BE] text-white text-sm font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
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
                      className="text-[#4B5563] hover:text-[#111827] hover:underline cursor-pointer"
                    >
                      {lang === "bn" ? "ইমেইল পরিবর্তন করুন" : "Change Email"}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendCode}
                      className="text-[#0077E6] font-semibold hover:underline cursor-pointer"
                    >
                      {lang === "bn" ? "আবার কোড পাঠান" : "Resend Code"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-[#E3E6EB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5563]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1E2B4D]" />
                {lang === "bn"
                  ? "আপনার সেশন ও তথ্য সুরক্ষিত"
                  : "Your session details stay private"}
              </span>

              <Link
                href="/track-order"
                className="font-semibold text-[#0077E6] hover:underline"
              >
                {lang === "bn" ? "অর্ডার ট্র্যাক করুন →" : "Track an Order →"}
              </Link>
            </div>
          </div>

          {/* Right Brand Trust Panel */}
          <div className="lg:col-span-5 bg-[#1E2B4D] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFB020]">
                {BRAND_NAME} • {BRAND_TAGLINE}
              </span>
              <h2 className="text-xl font-bold leading-snug">
                {lang === "bn"
                  ? "বিশ্বস্ত শপিং ও সহজ অর্ডার অভিজ্ঞতা"
                  : "Trusted Shopping Across Bangladesh"}
              </h2>
              <p className="text-xs text-white/75 leading-relaxed">
                {lang === "bn"
                  ? "ফ্যাশন, ফুটওয়্যার, বিউটি, গ্যাজেট ও মোবাইল অ্যাক্সেসরিজের নির্বিঘ্ন অর্ডার ও ট্র্যাকিং উপভোগ করুন।"
                  : "Enjoy seamless ordering, live order tracking, and flexible payment options across Bangladesh."}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-white/95">
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#FFB020] shrink-0" />
                <span>
                  {lang === "bn"
                    ? "১০০% মান যাচাইকৃত অরিজিনাল পণ্য"
                    : "100% quality-checked authentic items"}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
                <Truck className="w-4 h-4 text-[#FFB020] shrink-0" />
                <span>
                  {lang === "bn"
                    ? "COD, bKash, Nagad ও Rocket পেমেন্ট"
                    : "COD, bKash, Nagad & Rocket supported"}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
                <Package className="w-4 h-4 text-[#FFB020] shrink-0" />
                <span>
                  {lang === "bn"
                    ? "রিয়েল-টাইম অর্ডার স্ট্যাটাস আপডেট"
                    : "Real-time order tracking & support"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-white/65 space-y-1">
              <p>
                {lang === "bn" ? "সাপোর্ট ইমেইল:" : "Support Email:"}{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-white hover:text-[#FFB020] underline underline-offset-2"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E3E6EB] py-3.5 px-4 text-center text-xs text-[#4B5563]">
        © 2026 {BRAND_NAME} — {BRAND_TAGLINE}. All rights reserved.
      </footer>
    </div>
  );
}