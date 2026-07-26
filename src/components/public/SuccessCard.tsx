"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export function SuccessCard({
  contactEmail,
  duplicate,
}: {
  contactEmail: string;
  duplicate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-xl rounded-3xl border border-gray-line bg-white p-10 text-center shadow-card"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto mb-6 text-6xl"
      >
        🎉
      </motion.div>
      <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">تم تسجيل اهتمامك بنجاح</h2>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-zinc-500">
        {duplicate
          ? "رقمك مسجّل لدينا مسبقاً — تم تحديث بياناتك. سيتم التواصل معك عند إطلاق العضويات والعروض الحصرية."
          : "شكراً لانضمامك إلى قائمة WEFIT Ladies. سيتم التواصل معك عند إطلاق العضويات والعروض الحصرية."}
      </p>

      <div className="mt-8 rounded-2xl bg-gray-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">البريد الرسمي</p>
        <a href={`mailto:${contactEmail}`} className="mt-1 block font-bold text-ink" dir="ltr">
          {contactEmail}
        </a>
      </div>

      <a
        href={`mailto:${contactEmail}?subject=${encodeURIComponent("استفسار — WEFIT Ladies")}`}
        className="btn-dark mt-6 w-full"
      >
        <Mail className="h-4 w-4" /> تواصلي معنا
      </a>
    </motion.div>
  );
}
