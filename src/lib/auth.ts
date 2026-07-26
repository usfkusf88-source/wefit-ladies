import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./database.types";

/**
 * Returns the current authenticated profile (auth user + role).
 * Redirects to login if unauthenticated.
 */
export async function requireUser(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Auth user with no profile row — treat as unauthorized.
    redirect("/admin/login?error=no_profile");
  }
  if (!profile.active) {
    redirect("/admin/login?error=inactive");
  }
  return profile;
}

/** Non-redirecting variant — returns null when unauthenticated. */
export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return profile ?? null;
}
