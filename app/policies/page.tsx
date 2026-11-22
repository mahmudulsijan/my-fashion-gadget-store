import Link from "next/link";
import { ArrowLeft, RefreshCw, Truck, ShieldCheck } from "lucide-react";

export default function PoliciesPage() {
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
              FG Trend Tech • Store Policies
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">
              Return, Exchange &amp; Delivery Policy
            </h1>
          </div>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <Truck className="w-5 h-5" />
              <h2>1. Delivery Timeline &amp; Charges</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We dispatch all orders from Mymensingh via trusted courier partners
              across Bangladesh. Inside Mymensingh delivery takes 24–48 hours,
              and Outside Mymensingh delivery takes 2–4 working days.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              ময়মনসিংহের ভেতরে ২৪–৪৮ ঘণ্টার মধ্যে এবং ময়মনসিংহের বাইরে ২–৪
              কার্যদিবসের মধ্যে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছে দেওয়া হয়।
            </p>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <RefreshCw className="w-5 h-5" />
              <h2>2. 7-Day Size &amp; Product Exchange</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              If a fashion or footwear item does not fit properly, you can
              request a size exchange within 7 days of receiving the parcel.
              The item must be unused, unwashed, and in its original packaging
              with tags intact.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              ফ্যাশন বা জুতার সাইজ না মিললে পার্সেল পাওয়ার ৭ দিনের মধ্যে এক্সচেঞ্জ
              করতে পারবেন (পণ্য অবশ্যই অব্যবহৃত ও অরিজিনাল প্যাকেজিংয়ে থাকতে হবে)।
            </p>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <h2>3. Open-Parcel Check &amp; Returns</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Customers are encouraged to inspect the parcel in front of the
              delivery rider. If you receive a damaged, defective, or wrong
              item, you may return it immediately at the doorstep or contact
              our support team within 24 hours for a free replacement.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
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