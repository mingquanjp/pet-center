export type UserRole = "OWNER" | "STAFF" | "DOCTOR" | "ADMIN";

export type AuthUser = {
  userId: string;
  email: string;
  role: UserRole;
};
