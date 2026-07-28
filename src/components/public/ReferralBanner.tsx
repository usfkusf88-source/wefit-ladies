"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Share2, Copy, Check } from "lucide-react";

/**
 * Scarcity + referral banner shown above the registration form.
 * Encourages sharing before pre-registration closes.
 */
export function ReferralBanner() {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://wefit-ladies.vercel.app";
  const shareText = `سجّلي اهتمامك في WEFIT Ladies قبل إغلاق التسجيل المسبق 💜 المقاعد محدودة — رحلتك تبدأ من هنا:\n${shareUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-6 w-full max-w-2xl overflow-hidden rounded-3xl border border-pink-200 bg-gradient-to-l from-pink-brand/10 via-white to-pink-brand/10 p-5 sm:p-6"
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-right">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-brand text-white shadow-pink-glow">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-pink-brand/10 px-3 py-1 text-xs font-bold text-pink-brand">
            ⚡ المقاعد محدودة — التسجيل المسبق يُغلق قريباً
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">
            شاركي رابط التسجيل مع صديقاتك واحصلي على{" "}
            <span className="text-pink-brand">أولوية في قائمة الانتظار</span> قبل إغلاق التسجيل المسبق.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <Share2 className="h-4 w-4" /> شاركي عبر واتساب
        </a>
        <button
          onClick={copyLink}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-line bg-white px-6 py-3 text-sm font-bold text-ink transition-all hover:border-pink-brand active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" /> تم نسخ الرابط
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> انسخي الرابط
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
