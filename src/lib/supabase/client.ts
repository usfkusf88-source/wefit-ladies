"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";

/** Browser Supabase client (uses the public anon key + user session cookies). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
