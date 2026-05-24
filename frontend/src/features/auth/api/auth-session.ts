import type { AuthResponse } from "../types/auth.types";

const tokenMaxAgeSeconds = 60 * 60 * 24;

export function saveAuthSession(auth: AuthResponse): void {
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("currentUser", JSON.stringify(auth.user));
  document.cookie = `accessToken=${auth.accessToken}; path=/; max-age=${tokenMaxAgeSeconds}; SameSite=Lax`;
  document.cookie = `userRole=${auth.user.role}; path=/; max-age=${tokenMaxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("currentUser");
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "userRole=; path=/; max-age=0; SameSite=Lax";
}
