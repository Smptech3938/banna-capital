import type { UserRole } from "./types";

export type Permission =
  | "access_admin"
  | "manage_investments"
  | "manage_opportunities"
  | "view_users"
  | "manage_admins"
  | "access_settings"
  | "view_audit_logs";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    "access_admin",
    "manage_investments",
    "manage_opportunities",
    "view_users",
    "manage_admins",
    "access_settings",
    "view_audit_logs",
  ],
  admin: [
    "access_admin",
    "manage_investments",
    "manage_opportunities",
    "view_users",
  ],
  investor: [],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: UserRole | string | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase() as UserRole;
  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}

/**
 * Helper to check if a user is allowed to access the admin section.
 */
export function canAccessAdmin(role: string | null | undefined): boolean {
  return hasPermission(role, "access_admin");
}

/**
 * Helper to check if a user is allowed to promote/demote user roles.
 */
export function canManageAdmins(role: string | null | undefined): boolean {
  return hasPermission(role, "manage_admins");
}

/**
 * Helper to check if a user is allowed to perform general investment reviews.
 */
export function canManageInvestments(role: string | null | undefined): boolean {
  return hasPermission(role, "manage_investments");
}

/**
 * Helper to check if a user is allowed to perform CRUD on opportunities.
 */
export function canManageOpportunities(role: string | null | undefined): boolean {
  return hasPermission(role, "manage_opportunities");
}
