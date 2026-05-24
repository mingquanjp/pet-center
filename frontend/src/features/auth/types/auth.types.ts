import type { UserRole } from "@/constants/roles";

export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
};
