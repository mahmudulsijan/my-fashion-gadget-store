import Link from "next/link";
import { ArrowLeft, Lock, Database, PhoneCall } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-neutral-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-950"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront / স্টোরে ফিরে যান
        </Link>

        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 space-y-8 shadow-2xs">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              FG Trend Tech • Privacy &amp; Security
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">
              Privacy Policy &amp; Data Use
            </h1>
          </div>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <Database className="w-5 h-5" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              When you place an order or create a quick customer profile on FG
              Trend Tech, we collect only the details required to fulfill your
              delivery: your name, phone number, district, delivery address, and
              payment transaction ID (if paying via bKash/Nagad).
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              অর্ডার সম্পন্ন ও ডেলিভারি করার জন্য আমরা কেবল আপনার নাম, মোবাইল
              নম্বর, জেলা, ঠিকানা এবং মোবাইল পেমেন্টের ক্ষেত্রে TrxID সংগ্রহ করি।
            </p>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <Lock className="w-5 h-5" />
              <h2>2. How Your Data Is Used</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Your personal information is strictly used for order confirmation,
              courier dispatch, customer support, and order tracking. We never
              sell, rent, or share your phone number or address with third-party
              marketers.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              আপনার তথ্য শুধুমাত্র অর্ডার কনফার্মেশন, কুরিয়ার ডেলিভারি এবং অর্ডার
              ট্র্যাকিংয়ের কাজে ব্যবহৃত হয়। কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য
              বিক্রি বা শেয়ার করা হয় না।
            </p>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <PhoneCall className="w-5 h-5" />
              <h2>3. Data Removal &amp; Support</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              You can clear your saved browser profile anytime from the Account
              menu or contact us at{" "}
              <span className="font-semibold text-neutral-900">
                fgtrendtech.bd@gmail.com
              </span>{" "}
              to request updates or removal of your order records.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}