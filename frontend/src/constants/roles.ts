export const USER_ROLES = {
  OWNER: "OWNER",
  STAFF: "STAFF",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const roleHomePath: Record<UserRole, string> = {
  OWNER: "/owner",
  STAFF: "/staff",
  DOCTOR: "/doctor",
  ADMIN: "/admin",
};

export const roleRoutePrefix: Record<UserRole, string> = {
  OWNER: "/owner",
  STAFF: "/staff",
  DOCTOR: "/doctor",
  ADMIN: "/admin",
};
