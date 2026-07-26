/**
 * Database schema types. Mirrors supabase/migrations.
 * Regenerate with:
 *   supabase gen types typescript --project-id <ref> --schema public > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ── Row shapes (standalone to avoid circular generics) ─────────
export type LeadRow = {
  id: string;
  full_name: string;
  phone: string;
  phone_raw: string | null;
  email: string | null;
  age: number | null;
  district: string | null;
  source: string | null;
  membership: string | null;
  services: string[];
  workout_time: string | null;
  wants_offers: boolean;
  heard_about: string | null;
  status: string;
  campaign_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  assigned_to: string | null;
  last_contact_at: string | null;
  duplicate_count: number;
  consent: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadNoteRow = {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  created_at: string;
}

export type StatusHistoryRow = {
  id: string;
  lead_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  changed_by_name: string | null;
  created_at: string;
}

export type FollowUpRow = {
  id: string;
  lead_id: string;
  assigned_to: string | null;
  due_at: string;
  note: string | null;
  done: boolean;
  created_by: string | null;
  created_at: string;
}

export type CampaignRow = {
  id: string;
  name: string;
  slug: string;
  channel: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  active: boolean;
  created_at: string;
}

export type ActivityLogRow = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Json | null;
  ip_address: string | null;
  created_at: string;
}

export type SettingsRow = {
  id: number;
  brand_name: string;
  contact_email: string;
  phone: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  social_instagram: string | null;
  social_snapchat: string | null;
  social_tiktok: string | null;
  privacy_policy: string | null;
  terms: string | null;
  opening_date: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: Partial<LeadRow> & { full_name: string; phone: string };
        Update: Partial<LeadRow>;
        Relationships: [];
      };
      lead_notes: {
        Row: LeadNoteRow;
        Insert: Omit<LeadNoteRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<LeadNoteRow>;
        Relationships: [];
      };
      lead_status_history: {
        Row: StatusHistoryRow;
        Insert: Omit<StatusHistoryRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<StatusHistoryRow>;
        Relationships: [];
      };
      follow_ups: {
        Row: FollowUpRow;
        Insert: Omit<FollowUpRow, "id" | "created_at" | "done"> & {
          id?: string;
          done?: boolean;
          created_at?: string;
        };
        Update: Partial<FollowUpRow>;
        Relationships: [];
      };
      campaigns: {
        Row: CampaignRow;
        Insert: Omit<CampaignRow, "id" | "created_at" | "active"> & {
          id?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<CampaignRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at"> & { created_at?: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: Omit<ActivityLogRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<ActivityLogRow>;
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: Partial<SettingsRow>;
        Update: Partial<SettingsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_lead: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_phone_raw: string;
          p_email: string;
          p_age: number | null;
          p_district: string;
          p_source: string;
          p_membership: string;
          p_services: string[];
          p_workout_time: string;
          p_wants_offers: boolean;
          p_consent: boolean;
          p_campaign_id: string | null;
          p_utm_source: string;
          p_utm_medium: string;
          p_utm_campaign: string;
          p_utm_content: string;
        };
        Returns: { lead_id: string; was_duplicate: boolean }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience aliases
export type Lead = LeadRow;
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadNote = LeadNoteRow;
export type StatusHistory = StatusHistoryRow;
export type FollowUp = FollowUpRow;
export type Campaign = CampaignRow;
export type Profile = ProfileRow;
export type ActivityLog = ActivityLogRow;
export type Settings = SettingsRow;
