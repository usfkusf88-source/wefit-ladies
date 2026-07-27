"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, ChevronLeft } from "lucide-react";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import {
  LEAD_SOURCES,
  MEMBERSHIPS,
  SERVICES,
  WORKOUT_TIMES,
  DISTRICTS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { registerLead } from "@/app/actions/register";
import { SuccessCard } from "./SuccessCard";

type UTM = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
};

export function RegistrationForm({ utm, contactEmail }: { utm: UTM; contactEmail: string }) {
  const [done, setDone] = useState<null | { duplicate: boolean }>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      services: [],
      wants_offers: true,
      consent: false as unknown as true,
      ...utm,
    },
  });

  const services = watch("services") ?? [];
  const membership = watch("membership");
  const workoutTime = watch("workout_time");
  const source = watch("source");
  const wantsOffers = watch("wants_offers");

  function toggleService(value: string) {
    const next = services.includes(value)
      ? services.filter((s) => s !== value)
      : [...services, value];
    setValue("services", next, { shouldValidate: false });
  }

  const onSubmit = (values: RegistrationInput) => {
    setFormError(null);
    const fd = new FormData();
    fd.set("full_name", values.full_name);
    fd.set("phone", values.phone);
    if (values.email) fd.set("email", values.email);
    if (values.age) fd.set("age", String(values.age));
    if (values.district) fd.set("district", values.district);
    if (values.source) fd.set("source", values.source);
    if (values.membership) fd.set("membership", values.membership);
    (values.services ?? []).forEach((s) => fd.append("services", s));
    if (values.workout_time) fd.set("workout_time", values.workout_time);
    fd.set("wants_offers", values.wants_offers ? "yes" : "no");
    fd.set("consent", values.consent ? "true" : "false");
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"] as const) {
      const v = utm[k];
      if (v) fd.set(k, v);
    }

    startTransition(async () => {
      const res = await registerLead(null, fd);
      if (res.ok) {
        setDone({ duplicate: Boolean(res.duplicate) });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFormError(res.message ?? "تعذّر إرسال النموذج.");
      }
    });
  };

  if (done) {
    return <SuccessCard contactEmail={contactEmail} duplicate={done.duplicate} />;
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-2xl rounded-3xl border border-gray-line bg-white p-6 shadow-card sm:p-9"
      noValidate
    >
      {/* Name */}
      <Field label="الاسم الكامل" required error={errors.full_name?.message}>
        <input {...register("full_name")} className="field-input" placeholder="مثال: سارة عبدالله" />
      </Field>

      {/* Phone */}
      <Field label="رقم الجوال" required error={errors.phone?.message}>
        <input
          {...register("phone")}
          inputMode="tel"
          dir="ltr"
          className="field-input text-right"
          placeholder="05XXXXXXXX"
        />
      </Field>

      <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
        {/* Email */}
        <Field label="البريد الإلكتروني" required error={errors.email?.message}>
          <input {...register("email")} dir="ltr" className="field-input text-right" placeholder="name@email.com" />
        </Field>
        {/* Age */}
        <Field label="العمر" hint="اختياري" error={errors.age?.message as string}>
          <input {...register("age")} inputMode="numeric" className="field-input" placeholder="مثال: 27" />
        </Field>
      </div>

      {/* District */}
      <Field label="الحي" hint="اختياري">
        <select {...register("district")} className="field-input">
          <option value="">اختاري الحي</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      {/* Source */}
      <Field label="كيف سمعتِ عنا؟">
        <ChipGroup
          options={LEAD_SOURCES.map((o) => ({ value: o.value, label: o.ar }))}
          selected={source ? [source] : []}
          onToggle={(v) => setValue("source", source === v ? "" : v)}
        />
      </Field>

      {/* Membership */}
      <Field label="العضوية المفضلة">
        <ChipGroup
          options={MEMBERSHIPS.map((o) => ({ value: o.value, label: o.ar }))}
          selected={membership ? [membership] : []}
          onToggle={(v) => setValue("membership", membership === v ? "" : v)}
        />
      </Field>

      {/* Services (multi) */}
      <Field label="الخدمات التي تهمك" hint="يمكن اختيار أكثر من خيار">
        <ChipGroup
          options={SERVICES.map((o) => ({ value: o.value, label: o.ar }))}
          selected={services}
          onToggle={toggleService}
          multi
        />
      </Field>

      {/* Workout time */}
      <Field label="الوقت المفضل للتمرين">
        <ChipGroup
          options={WORKOUT_TIMES.map((o) => ({ value: o.value, label: o.ar }))}
          selected={workoutTime ? [workoutTime] : []}
          onToggle={(v) => setValue("workout_time", workoutTime === v ? "" : v)}
        />
      </Field>

      {/* Offers */}
      <Field label="هل ترغبين باستقبال عروض الافتتاح؟">
        <div className="flex gap-3">
          {[
            { v: true, l: "نعم" },
            { v: false, l: "لا" },
          ].map((opt) => (
            <button
              type="button"
              key={String(opt.v)}
              onClick={() => setValue("wants_offers", opt.v)}
              className={cn("chip flex-1", wantsOffers === opt.v ? "chip-active" : "chip-idle")}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </Field>

      {/* Consent */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-soft p-4">
        <input type="checkbox" {...register("consent")} className="mt-1 h-5 w-5 accent-pink-brand" />
        <span className="text-sm leading-relaxed text-zinc-600">
          أوافق على{" "}
          <a href="/privacy" target="_blank" className="font-semibold text-pink-brand underline">
            سياسة الخصوصية
          </a>{" "}
          وأن يتم التواصل معي بخصوص عروض وعضويات WEFIT Ladies.
        </span>
      </label>
      {errors.consent && <p className="mt-1.5 text-sm text-rose-600">{errors.consent.message as string}</p>}

      <AnimatePresence>
        {formError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {formError}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" disabled={isPending} className="btn-primary mt-6 w-full">
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> جارٍ التسجيل...
          </>
        ) : (
          <>
            انضمي إلى قائمة الانتظار <ChevronLeft className="h-5 w-5" />
          </>
        )}
      </button>
    </motion.form>
  );
}

// ── Small building blocks ──────────────────────────────────────
function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-ink">
          {label} {required && <span className="text-pink-brand">*</span>}
        </label>
        {hint && <span className="text-xs text-zinc-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
  multi,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            type="button"
            key={o.value}
            aria-pressed={active}
            onClick={() => onToggle(o.value)}
            className={cn("chip", active ? "chip-active" : "chip-idle")}
          >
            {active && multi && <Check className="ml-1 inline h-3.5 w-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
