"use client";

import type { Lead } from "./database.types";
import { labelOf, MEMBERSHIPS, LEAD_SOURCES, SERVICES, WORKOUT_TIMES, LEAD_STATUSES } from "./constants";
import { formatDateTime, formatPhone } from "./utils";

type Helpers = {
  campaignName: (id: string | null) => string;
  profileName: (id: string | null) => string;
};

function leadRows(leads: Lead[], h: Helpers) {
  return leads.map((l) => ({
    "الاسم": l.full_name,
    "الجوال": formatPhone(l.phone),
    "البريد": l.email ?? "",
    "العمر": l.age ?? "",
    "الحي": l.district ?? "",
    "العضوية": labelOf(MEMBERSHIPS, l.membership),
    "الخدمات": (l.services ?? []).map((s) => labelOf(SERVICES, s)).join(" | "),
    "وقت التمرين": labelOf(WORKOUT_TIMES, l.workout_time),
    "المصدر": labelOf(LEAD_SOURCES, l.source),
    "الحملة": h.campaignName(l.campaign_id),
    "UTM Source": l.utm_source ?? "",
    "UTM Campaign": l.utm_campaign ?? "",
    "الحالة": labelOf(LEAD_STATUSES, l.status),
    "المسؤولة": h.profileName(l.assigned_to),
    "عروض": l.wants_offers ? "نعم" : "لا",
    "تاريخ التسجيل": formatDateTime(l.created_at),
  }));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

export function exportLeadsCsv(leads: Lead[], h: Helpers) {
  const rows = leadRows(leads, h);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((k) => escape((r as Record<string, unknown>)[k])).join(",")),
  ].join("\n");
  // Prepend BOM so Excel reads Arabic (UTF-8) correctly.
  download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), `wefit-leads-${stamp()}.csv`);
}

export async function exportLeadsXlsx(leads: Lead[], h: Helpers) {
  const XLSX = await import("xlsx");
  const rows = leadRows(leads, h);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `wefit-leads-${stamp()}.xlsx`
  );
}

/** Generic array-of-objects → CSV (used by report tables). */
export function exportRowsCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((k) => escape(r[k])).join(",")),
  ].join("\n");
  download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), `${filename}-${stamp()}.csv`);
}

export async function exportRowsXlsx(rows: Record<string, unknown>[], filename: string, sheet = "Report") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filename}-${stamp()}.xlsx`
  );
}
