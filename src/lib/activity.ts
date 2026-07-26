import "server-only";
import { createAdminClient } from "./supabase/admin";
import { headers } from "next/headers";

/**
 * Records an entry in activity_logs. Uses the service-role client so logging
 * never fails due to RLS. Best-effort: errors are swallowed (logging must not
 * break the primary action).
 */
export async function logActivity(params: {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  try {
    let ip: string | null = null;
    try {
      const h = await headers();
      ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        null;
    } catch {
      /* headers() not available in this context */
    }

    const admin = createAdminClient();
    await admin.from("activity_logs").insert({
      actor_id: params.actorId ?? null,
      actor_name: params.actorName ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entity_id: params.entityId ?? null,
      meta: (params.meta ?? null) as never,
      ip_address: ip,
    });
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
