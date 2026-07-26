import { clsx as clsxRaw } from "./clsx";

export const cn = clsxRaw;

/**
 * Normalize a Saudi mobile number to canonical `9665XXXXXXXX` (12 digits).
 * Accepts: 05XXXXXXXX, 5XXXXXXXX, 9665XXXXXXXX, +9665XXXXXXXX, 009665XXXXXXXX
 * Returns null if it cannot be normalized to a valid KSA mobile.
 */
export function normalizePhone(input: string): string | null {
  if (!input) return null;
  // Keep digits only (drop +, spaces, dashes). Convert Arabic-Indic digits too.
  const western = input.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
  let digits = western.replace(/\D/g, "");

  // Strip international 00 prefix
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("966")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Now `digits` should be 9XXXXXXXX (9 digits) starting with 5
  if (digits.length === 9 && digits.startsWith("5")) {
    return "966" + digits;
  }
  return null;
}

/** Format canonical 9665XXXXXXXX → 05X XXX XXXX for display. */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  const local = phone.startsWith("966") ? "0" + phone.slice(3) : phone;
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return local;
}

export function isValidSaudiPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/** Slugify a campaign name into a URL-safe token. */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Build a registration URL with UTM params for a campaign. */
export function buildCampaignUrl(
  baseUrl: string,
  params: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    ref?: string | null;
  }
): string {
  const url = new URL("/register", baseUrl);
  if (params.source) url.searchParams.set("utm_source", params.source);
  if (params.medium) url.searchParams.set("utm_medium", params.medium);
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
  if (params.content) url.searchParams.set("utm_content", params.content);
  if (params.ref) url.searchParams.set("ref", params.ref);
  return url.toString();
}

export function formatDate(value: string | Date | null, locale = "ar-SA"): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(value: string | Date | null, locale = "ar-SA"): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
