import type { Role } from "./constants";

/**
 * Role-based access control matrix.
 *  - admin:       full access
 *  - manager:     dashboard, leads, employees, reports, campaigns (no destructive user mgmt)
 *  - sales_agent: only assigned leads; can add notes + change status; cannot delete
 */
export type Permission =
  | "dashboard.view"
  | "leads.view.all"
  | "leads.view.assigned"
  | "leads.edit"
  | "leads.delete"
  | "leads.assign"
  | "leads.status"
  | "notes.create"
  | "followups.manage"
  | "campaigns.manage"
  | "reports.view"
  | "reports.export"
  | "users.manage"
  | "settings.manage"
  | "activity.view";

const MATRIX: Record<Role, Permission[]> = {
  admin: [
    "dashboard.view",
    "leads.view.all",
    "leads.edit",
    "leads.delete",
    "leads.assign",
    "leads.status",
    "notes.create",
    "followups.manage",
    "campaigns.manage",
    "reports.view",
    "reports.export",
    "users.manage",
    "settings.manage",
    "activity.view",
  ],
  manager: [
    "dashboard.view",
    "leads.view.all",
    "leads.edit",
    "leads.assign",
    "leads.status",
    "notes.create",
    "followups.manage",
    "campaigns.manage",
    "reports.view",
    "reports.export",
    "activity.view",
  ],
  sales_agent: [
    "dashboard.view",
    "leads.view.assigned",
    "leads.status",
    "notes.create",
    "followups.manage",
  ],
};

export function can(role: Role | string | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  const list = MATRIX[role as Role];
  return list ? list.includes(perm) : false;
}

export function isAdmin(role?: string | null): boolean {
  return role === "admin";
}
