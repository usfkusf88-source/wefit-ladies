import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Cake,
  Dumbbell,
  Clock,
  Megaphone,
  Tag,
  History,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { StatusControl } from "@/components/admin/lead/StatusControl";
import { NotesPanel } from "@/components/admin/lead/NotesPanel";
import { FollowUpsPanel } from "@/components/admin/lead/FollowUpsPanel";
import { LeadToolbar } from "@/components/admin/lead/LeadToolbar";
import { StatusBadge } from "@/components/ui/Badge";
import {
  labelOf,
  statusMeta,
  MEMBERSHIPS,
  SERVICES,
  LEAD_SOURCES,
  WORKOUT_TIMES,
} from "@/lib/constants";
import { formatDateTime, formatPhone } from "@/lib/utils";
import type { Lead, LeadNote, FollowUp, StatusHistory, Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser();
  const supabase = await createClient();

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();
  const L = lead as Lead;

  const [{ data: notes }, { data: history }, { data: followUps }, { data: profiles }] =
    await Promise.all([
      supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
      supabase.from("lead_status_history").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
      supabase.from("follow_ups").select("*").eq("lead_id", id).order("due_at", { ascending: true }),
      supabase.from("profiles").select("*").eq("active", true),
    ]);

  let campaignName = "—";
  if (L.campaign_id) {
    const { data: c } = await supabase.from("campaigns").select("name").eq("id", L.campaign_id).maybeSingle();
    campaignName = c?.name ?? "—";
  }

  const facts = [
    { icon: Phone, label: "الجوال", value: formatPhone(L.phone), ltr: true },
    { icon: Mail, label: "البريد", value: L.email || "—", ltr: true },
    { icon: Cake, label: "العمر", value: L.age ? String(L.age) : "—" },
    { icon: MapPin, label: "الحي", value: L.district || "—" },
    { icon: Tag, label: "العضوية", value: labelOf(MEMBERSHIPS, L.membership) || "—" },
    { icon: Clock, label: "وقت التمرين", value: labelOf(WORKOUT_TIMES, L.workout_time) || "—" },
    { icon: Megaphone, label: "المصدر", value: labelOf(LEAD_SOURCES, L.source) || "—" },
    { icon: Tag, label: "الحملة", value: campaignName },
  ];

  return (
    <div className="print-area">
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-pink-brand hover:underline no-print">
        <ChevronRight className="h-4 w-4" /> العودة للقائمة
      </Link>

      {/* Header */}
      <div className="card mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-brand/10 text-pink-brand">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{L.full_name}</h1>
            <p className="text-sm text-zinc-500" dir="ltr">
              {formatPhone(L.phone)} · سُجّلت {formatDateTime(L.created_at)}
            </p>
          </div>
        </div>
        <div className="no-print">
          {can(me.role, "leads.status") ? (
            <StatusControl leadId={L.id} current={L.status} />
          ) : (
            <StatusBadge status={L.status} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile + services + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-sm font-bold text-ink">الملف الكامل</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-soft text-zinc-500">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">{f.label}</p>
                    <p className="text-sm font-medium text-ink" dir={f.ltr ? "ltr" : undefined}>
                      {f.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-gray-line pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <Dumbbell className="h-3.5 w-3.5" /> الخدمات المهتمة بها
              </p>
              <div className="flex flex-wrap gap-2">
                {(L.services ?? []).length > 0 ? (
                  L.services.map((s) => (
                    <span key={s} className="rounded-full bg-pink-brand/10 px-3 py-1 text-xs font-medium text-pink-brand">
                      {labelOf(SERVICES, s)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline: status history */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-pink-brand" />
              <h3 className="text-sm font-bold text-ink">سجل الحالة</h3>
            </div>
            <ol className="relative space-y-4 border-r-2 border-gray-line pr-4">
              {((history ?? []) as StatusHistory[]).map((h) => (
                <li key={h.id} className="relative">
                  <span
                    className="absolute -right-[22px] top-1 h-3 w-3 rounded-full ring-4 ring-white"
                    style={{ background: "#E14FA0" }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-ink">
                      تغيّرت الحالة إلى{" "}
                      <span className="font-semibold" style={{ color: "#BE185D" }}>
                        {statusMeta(h.to_status).ar}
                      </span>
                    </p>
                    <span className="text-xs text-zinc-400">{formatDateTime(h.created_at)}</span>
                  </div>
                  {h.changed_by_name && <p className="text-xs text-zinc-400">بواسطة {h.changed_by_name}</p>}
                </li>
              ))}
              {(!history || history.length === 0) && (
                <li className="text-sm text-zinc-400">لا يوجد سجل بعد</li>
              )}
            </ol>
          </div>

          <NotesPanel leadId={L.id} notes={(notes ?? []) as LeadNote[]} />
        </div>

        {/* Right: actions + follow-ups */}
        <div className="space-y-6">
          <LeadToolbar lead={L} profiles={(profiles ?? []) as Profile[]} role={me.role} />
          <FollowUpsPanel leadId={L.id} followUps={(followUps ?? []) as FollowUp[]} />
        </div>
      </div>
    </div>
  );
}
