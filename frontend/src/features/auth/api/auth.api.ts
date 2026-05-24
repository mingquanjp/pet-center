import { apiRequest } from "@/lib/api";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "../types/auth.types";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  async me() {
    const response = await apiRequest<AuthUser>("/auth/me");
    return response.data;
  },

  async logout() {
    const response = await apiRequest<null>("/auth/logout", {
      method: "POST",
    });

    return response.data;
  },
};
