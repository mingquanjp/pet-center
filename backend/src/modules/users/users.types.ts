export type AdminUserRole = "Owner" | "Staff" | "Doctor" | "Admin";
export type AdminUserStatus = "active" | "locked" | "inactive";

export type AdminUsersQuery = {
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  page?: number;
  limit?: number;
};

export type AdminUserListRow = {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  role: AdminUserRole;
  account_status: AdminUserStatus;
  created_at: Date;
  pet_count: string;
};

export type AdminUserStatsRow = {
  total_count: string;
  active_count: string;
  locked_count: string;
  owner_count: string;
  staff_count: string;
  doctor_count: string;
  needs_attention_count: string;
};

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  petCount: number;
};
