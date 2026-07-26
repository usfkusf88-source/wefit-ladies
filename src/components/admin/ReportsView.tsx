"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, FileDown, Printer, TrendingUp } from "lucide-react";
import type { Lead, Campaign, Profile } from "@/lib/database.types";
import { CONVERTED_STATUSES } from "@/lib/constants";
import { pct } from "@/lib/utils";
import { exportRowsCsv, exportRowsXlsx, exportLeadsXlsx } from "@/lib/export";

function isConverted(l: Lead) {
  return CONVERTED_STATUSES.includes(l.status as never);
}

export function ReportsView({
  leads,
  campaigns,
  profiles,
  canExport,
}: {
  leads: Lead[];
  campaigns: Campaign[];
  profiles: Profile[];
  canExport: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);

  const inRange = useMemo(() => {
    const f = new Date(from).getTime();
    const t = new Date(to).getTime() + 86_400_000; // inclusive
    return leads.filter((l) => {
      const c = new Date(l.created_at).getTime();
      return c >= f && c < t;
    });
  }, [leads, from, to]);

  const converted = inRange.filter(isConverted).length;

  const campaignName = (id: string | null) => campaigns.find((c) => c.id === id)?.name ?? "بدون حملة";
  const profileName = (id: string | null) => {
    const p = profiles.find((x) => x.id === id);
    return p ? p.full_name ?? p.email : "غير مُسندة";
  };

  // Campaign performance
  const campaignRows = useMemo(() => {
    const map = new Map<string, { name: string; leads: number; converted: number }>();
    for (const l of inRange) {
      const key = l.campaign_id ?? "none";
      const name = campaignName(l.campaign_id);
      const cur = map.get(key) ?? { name, leads: 0, converted: 0 };
      cur.leads++;
      if (isConverted(l)) cur.converted++;
      map.set(key, cur);
    }
    return [...map.values()]
      .map((r) => ({ "الحملة": r.name, "العملاء": r.leads, "المحوّلون": r.converted, "نسبة التحويل %": pct(r.converted, r.leads) }))
      .sort((a, b) => b["العملاء"] - a["العملاء"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inRange]);

  // Employee performance
  const employeeRows = useMemo(() => {
    const map = new Map<string, { name: string; leads: number; converted: number }>();
    for (const l of inRange) {
      if (!l.assigned_to) continue;
      const cur = map.get(l.assigned_to) ?? { name: profileName(l.assigned_to), leads: 0, converted: 0 };
      cur.leads++;
      if (isConverted(l)) cur.converted++;
      map.set(l.assigned_to, cur);
    }
    return [...map.values()]
      .map((r) => ({ "الموظفة": r.name, "العملاء": r.leads, "المحوّلون": r.converted, "نسبة التحويل %": pct(r.converted, r.leads) }))
      .sort((a, b) => b["المحوّلون"] - a["المحوّلون"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inRange]);

  const stamp = `${from}_${to}`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between no-print">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">من تاريخ</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field-input py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">إلى تاريخ</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field-input py-2.5" />
          </div>
        </div>
        {canExport && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportLeadsXlsx(inRange, { campaignName, profileName })} className="btn-dark py-2.5">
              <FileSpreadsheet className="h-4 w-4" /> Excel (كل العملاء)
            </button>
            <button onClick={() => exportRowsCsv(campaignRows, `wefit-campaigns-${stamp}`)} className="btn-dark py-2.5">
              <FileDown className="h-4 w-4" /> CSV الحملات
            </button>
            <button onClick={() => window.print()} className="btn-dark py-2.5">
              <Printer className="h-4 w-4" /> PDF
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Summary label="إجمالي العملاء (الفترة)" value={inRange.length} />
        <Summary label="المحوّلون" value={converted} />
        <Summary label="نسبة التحويل" value={`${pct(converted, inRange.length)}%`} accent />
        <Summary label="عدد الحملات النشطة" value={campaigns.filter((c) => c.active).length} />
      </div>

      {/* Campaign performance */}
      <ReportTable
        title="أداء الحملات"
        rows={campaignRows}
        onXlsx={canExport ? () => exportRowsXlsx(campaignRows, `wefit-campaigns-${stamp}`, "Campaigns") : undefined}
      />

      {/* Employee performance */}
      <ReportTable
        title="أداء الموظفات"
        rows={employeeRows}
        onXlsx={canExport ? () => exportRowsXlsx(employeeRows, `wefit-employees-${stamp}`, "Employees") : undefined}
      />
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={accent ? "stat-card bg-ink text-white" : "stat-card"}>
      <p className={accent ? "text-sm text-white/60" : "text-sm text-zinc-500"}>{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function ReportTable({
  title,
  rows,
  onXlsx,
}: {
  title: string;
  rows: Record<string, string | number>[];
  onXlsx?: () => void;
}) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-line px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <TrendingUp className="h-4 w-4 text-pink-brand" /> {title}
        </h3>
        {onXlsx && (
          <button onClick={onXlsx} className="inline-flex items-center gap-1.5 text-sm text-pink-brand hover:underline no-print">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-soft text-right text-xs text-zinc-500">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-line">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-soft/50">
                {headers.map((h) => (
                  <td key={h} className="px-5 py-3 text-ink">{r[h]}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={Math.max(headers.length, 1)} className="px-5 py-12 text-center text-zinc-400">
                  لا توجد بيانات في هذه الفترة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
