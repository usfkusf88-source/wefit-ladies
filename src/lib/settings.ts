import { createAdminClient } from "./supabase/admin";
import type { Settings } from "./database.types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  brand_name: "WEFIT Ladies",
  contact_email: "info@wefitgymsa.com",
  phone: null,
  logo_url: null,
  primary_color: "#0A0A0B",
  accent_color: "#E14FA0",
  social_instagram: null,
  social_snapchat: null,
  social_tiktok: null,
  privacy_policy: null,
  terms: null,
  opening_date: null,
  updated_at: new Date(0).toISOString(),
};

/**
 * Loads settings for branding. Never throws — falls back to defaults so the
 * public page renders even before Supabase is configured.
 */
export async function getSettings(): Promise<Settings> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    return data ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
