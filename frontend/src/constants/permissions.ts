import type { UserRole } from "./roles";

export const routePermissions: Record<string, UserRole[]> = {
  "/owner": ["OWNER"],
  "/staff": ["STAFF", "ADMIN"],
  "/doctor": ["DOCTOR", "ADMIN"],
  "/admin": ["ADMIN"],
};

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const matchedEntry = Object.entries(routePermissions).find(([prefix]) => pathname.startsWith(prefix));

  if (!matchedEntry) {
    return true;
  }

  return matchedEntry[1].includes(role);
}
