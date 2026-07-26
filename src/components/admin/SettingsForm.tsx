"use client";

import { useActionState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import type { Settings } from "@/lib/database.types";
import { updateSettings, type SettingsState } from "@/app/admin/(app)/settings/actions";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsState | null, FormData>(updateSettings, null);

  return (
    <form action={action} className="space-y-6">
      <Section title="معلومات التواصل">
        <Field name="brand_name" label="اسم العلامة" defaultValue={settings.brand_name} required />
        <Field name="contact_email" label="البريد الرسمي" type="email" dir="ltr" defaultValue={settings.contact_email} required />
        <Field name="phone" label="رقم التواصل" dir="ltr" defaultValue={settings.phone ?? ""} placeholder="+9665XXXXXXXX" />
        <Field name="opening_date" label="تاريخ الافتتاح" type="date" defaultValue={settings.opening_date ?? ""} />
      </Section>

      <Section title="الهوية البصرية">
        <Field name="primary_color" label="اللون الأساسي" type="color" defaultValue={settings.primary_color} />
        <Field name="accent_color" label="لون التمييز (وردي)" type="color" defaultValue={settings.accent_color} />
      </Section>

      <Section title="روابط التواصل الاجتماعي">
        <Field name="social_instagram" label="إنستغرام" dir="ltr" defaultValue={settings.social_instagram ?? ""} placeholder="https://instagram.com/..." />
        <Field name="social_snapchat" label="سناب شات" dir="ltr" defaultValue={settings.social_snapchat ?? ""} placeholder="https://snapchat.com/add/..." />
        <Field name="social_tiktok" label="تيك توك" dir="ltr" defaultValue={settings.social_tiktok ?? ""} placeholder="https://tiktok.com/@..." />
      </Section>

      <Section title="السياسات">
        <TextArea name="privacy_policy" label="سياسة الخصوصية" defaultValue={settings.privacy_policy ?? ""} />
        <TextArea name="terms" label="الشروط والأحكام" defaultValue={settings.terms ?? ""} />
      </Section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ التغييرات
        </button>
        {state?.ok && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> تم الحفظ
          </span>
        )}
        {state?.error && <span className="text-sm text-rose-600">{state.error}</span>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  dir,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className={type === "color" ? "" : "sm:col-span-1"}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
      <input
        name={name}
        type={type}
        dir={dir}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={type === "color" ? "h-11 w-full cursor-pointer rounded-xl border border-gray-line" : "field-input py-2.5"}
      />
    </div>
  );
}

function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
      <textarea name={name} rows={4} defaultValue={defaultValue} className="field-input resize-y py-2.5" />
    </div>
  );
}
