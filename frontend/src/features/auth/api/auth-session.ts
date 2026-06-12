import { clearApiCache } from "@/lib/api";
import type { AuthResponse, AuthUser } from "../types/auth.types";

const tokenMaxAgeSeconds = 60 * 60 * 24;
const roleCookieMap: Record<string, AuthUser["role"]> = {
  owner: "OWNER",
  staff: "STAFF",
  doctor: "DOCTOR",
  admin: "ADMIN",
};

function normalizeRoleForCookie(role: AuthUser["role"] | string): AuthUser["role"] {
  return roleCookieMap[role.trim().toLowerCase()] ?? role as AuthUser["role"];
}

export function saveAuthSession(auth: AuthResponse): void {
  const role = normalizeRoleForCookie(auth.user.role);

  clearApiCache();
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("currentUser", JSON.stringify({ ...auth.user, role }));
  document.cookie = `accessToken=${auth.accessToken}; path=/; max-age=${tokenMaxAgeSeconds}; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; max-age=${tokenMaxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  clearApiCache();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("currentUser");
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "userRole=; path=/; max-age=0; SameSite=Lax";
}

export function updateStoredUser(user: AuthUser): void {
  localStorage.setItem("currentUser", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("auth-user-updated", { detail: user }));
}
