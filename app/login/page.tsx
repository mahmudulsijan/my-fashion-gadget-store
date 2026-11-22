"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "কোড পাঠানো যায়নি");
      } else {
        setMessage(data.message);
        setStep("code");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "কোড যাচাই করা যায়নি");
      } else {
        setMessage(data.message);
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">লগইন</h1>
        <p className="text-sm text-gray-500 mb-6">
          {step === "email"
            ? "আপনার ইমেইলে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হবে"
            : `${email} ঠিকানায় পাঠানো ৬ ডিজিটের কোডটি লিখুন`}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {message}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ইমেইল ঠিকানা
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "কোড পাঠানো হচ্ছে..." : "কোড পাঠান"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ৬ ডিজিটের কোড
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-center text-lg tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "যাচাই করা হচ্ছে..." : "যাচাই ও লগইন করুন"}
            </button>

            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setMessage("");
                }}
                className="text-gray-600 hover:underline"
              >
                ইমেইল পরিবর্তন করুন
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendCode}
                className="text-black font-medium hover:underline"
              >
                আবার কোড পাঠান
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}