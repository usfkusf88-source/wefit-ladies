"use client";

import { motion } from "framer-motion";
import { Dumbbell, Waves, HeartPulse, Sparkles, ShieldCheck, Crown } from "lucide-react";

const ITEMS = [
  { icon: Crown, title: "عضويات حصرية", text: "أولوية الوصول لعروض الافتتاح والباقات المحدودة." },
  { icon: Dumbbell, title: "تدريب متكامل", text: "جيم، بيلاتس، ريفورمر، وتمارين القوة والكارديو." },
  { icon: Waves, title: "مسبح وسباحة", text: "مسبح وحصص سباحة في بيئة نسائية بالكامل." },
  { icon: HeartPulse, title: "منطقة استشفاء", text: "ساونا ومنطقة استشفاء لاستعادة نشاطك." },
  { icon: Sparkles, title: "تجربة راقية", text: "تصميم عصري وأجواء أنيقة مصمّمة لكِ." },
  { icon: ShieldCheck, title: "خصوصية تامة", text: "بيئة آمنة ومحافظة على خصوصيتك أولاً." },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">لماذا WEFIT Ladies؟</h2>
        <p className="mt-3 text-zinc-500">مساحة مصمّمة لكِ — تجمع بين الفخامة والقوة والراحة.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group rounded-2xl border border-gray-line bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-pink-glow"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-brand/10 text-pink-brand transition-colors group-hover:bg-pink-brand group-hover:text-white">
              <it.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">{it.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{it.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
