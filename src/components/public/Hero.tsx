"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-pink-brand/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-pink-brand/10 blur-[100px]" />

      {/* speed-lines motif */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(115deg,transparent,transparent_22px,#E14FA0_22px,#E14FA0_23px)]" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo width={210} height={84} priority className="mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-pink-brand" />
          المهدية — الرياض · نحن اللياقة
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-balance text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl"
        >
          رحلتك تبدأ
          <span className="mx-3 bg-gradient-to-l from-pink-brand to-pink-300 bg-clip-text text-transparent">
            من هنا
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl"
        >
          سجّلي اهتمامك الآن وكوني من أوائل المشتركات في WEFIT Ladies واحصلي على أولوية معرفة عروض
          الافتتاح والعضويات الحصرية.
        </motion.p>

        <motion.a
          href="#register"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="btn-primary mt-10 text-lg"
        >
          انضمي إلى قائمة الانتظار <ChevronLeft className="h-5 w-5" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40"
        >
          WEFIT LADIES
        </motion.div>
      </div>
    </section>
  );
}
