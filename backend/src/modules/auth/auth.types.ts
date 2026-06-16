import type { UserRole } from "../../shared/types/auth.js";

export type DbRole = "Owner" | "Staff" | "Doctor" | "Admin";
export type AccountStatus = "active" | "locked" | "inactive";

export type AuthUserDto = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string;
};

export type AuthUserRecord = AuthUserDto & {
  passwordHash: string;
  accountStatus: AccountStatus;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUserDto;
};
