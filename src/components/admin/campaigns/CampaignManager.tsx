"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  ImageIcon,
  FileImage,
  Printer,
  Loader2,
  Users,
} from "lucide-react";
import type { Campaign } from "@/lib/database.types";
import { buildCampaignUrl, cn } from "@/lib/utils";
import { qrPngDataUrl, downloadQrPng, downloadQrSvg, downloadQrPrint } from "@/lib/qr";
import { createCampaign, toggleCampaign, deleteCampaign } from "@/app/admin/(app)/campaigns/actions";

export function CampaignManager({
  campaigns,
  counts,
  siteUrl,
}: {
  campaigns: Campaign[];
  counts: Record<string, number>;
  siteUrl: string;
}) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          <Plus className="h-5 w-5" /> حملة جديدة
        </button>
      </div>

      {showForm && <CreateForm onDone={() => setShowForm(false)} />}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} count={counts[c.id] ?? 0} siteUrl={siteUrl} />
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-line py-16 text-center text-zinc-400">
            لا توجد حملات بعد — أنشئي أول حملة QR.
          </div>
        )}
      </div>
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", channel: "", utm_source: "", utm_medium: "qr", utm_campaign: "prereg" });

  function submit() {
    setError(null);
    start(async () => {
      const res = await createCampaign(form);
      if (res.ok) {
        onDone();
        router.refresh();
      } else setError(res.error ?? "تعذّر الإنشاء");
    });
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4 text-sm font-bold text-ink">إنشاء حملة</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="اسم الحملة *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="مثال: حملة إنستغرام" />
        <Input label="القناة" value={form.channel} onChange={(v) => setForm({ ...form, channel: v })} placeholder="instagram" />
        <Input label="UTM Source" value={form.utm_source} onChange={(v) => setForm({ ...form, utm_source: v })} placeholder="instagram" />
        <Input label="UTM Medium" value={form.utm_medium} onChange={(v) => setForm({ ...form, utm_medium: v })} placeholder="qr" />
        <Input label="UTM Campaign" value={form.utm_campaign} onChange={(v) => setForm({ ...form, utm_campaign: v })} placeholder="prereg" />
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={pending || !form.name.trim()} className="btn-primary">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} إنشاء
        </button>
        <button onClick={onDone} className="rounded-full border border-gray-line px-6 py-3 text-sm font-semibold">
          إلغاء
        </button>
      </div>
    </div>
  );
}

function CampaignCard({ campaign: c, count, siteUrl }: { campaign: Campaign; count: number; siteUrl: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();

  const url = buildCampaignUrl(siteUrl || "https://example.com", {
    source: c.utm_source,
    medium: c.utm_medium,
    campaign: c.utm_campaign,
    content: c.utm_content,
    ref: c.slug,
  });
  const fileName = `wefit-qr-${c.slug}`;

  useEffect(() => {
    let alive = true;
    qrPngDataUrl(url, 320).then((d) => alive && setPreview(d)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("card overflow-hidden p-5", !c.active && "opacity-60")}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-ink">{c.name}</h3>
          <p className="text-xs text-zinc-400">/{c.slug}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-pink-brand/10 px-2.5 py-1 text-xs font-semibold text-pink-brand">
          <Users className="h-3 w-3" /> {count}
        </span>
      </div>

      <div className="flex items-center justify-center rounded-xl bg-gray-soft p-4">
        {preview ? (
          <img src={preview} alt={`QR ${c.name}`} className="h-40 w-40" />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center text-zinc-300">
            <QrCode className="h-10 w-10" />
          </div>
        )}
      </div>

      <button onClick={copy} className="mt-3 flex w-full items-center gap-2 rounded-lg border border-gray-line px-3 py-2 text-xs text-zinc-500 hover:border-pink-brand" dir="ltr">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="truncate">{url}</span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2 no-print">
        <DownloadBtn icon={ImageIcon} label="PNG" onClick={() => withBusy(() => downloadQrPng(url, fileName))} busy={busy} />
        <DownloadBtn icon={FileImage} label="SVG" onClick={() => withBusy(() => downloadQrSvg(url, fileName))} busy={busy} />
        <DownloadBtn icon={Printer} label="طباعة" onClick={() => withBusy(() => downloadQrPrint(url, fileName, c.name))} busy={busy} />
      </div>

      <div className="mt-3 flex gap-2 border-t border-gray-line pt-3 no-print">
        <button
          onClick={() => start(async () => { await toggleCampaign(c.id, !c.active); router.refresh(); })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-line py-2 text-xs font-medium text-zinc-600 hover:bg-gray-soft"
        >
          <Power className="h-3.5 w-3.5" /> {c.active ? "إيقاف" : "تفعيل"}
        </button>
        <button
          onClick={() => {
            if (confirm("حذف هذه الحملة؟")) start(async () => { await deleteCampaign(c.id); router.refresh(); });
          }}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function DownloadBtn({
  icon: Icon,
  label,
  onClick,
  busy,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex flex-col items-center gap-1 rounded-lg bg-ink py-2 text-xs font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input py-2.5"
      />
    </div>
  );
}
