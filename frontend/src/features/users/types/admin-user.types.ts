export type AdminUserRole = "Owner" | "Staff" | "Doctor" | "Admin";
export type AdminUserStatus = "active" | "locked" | "inactive";

export type AdminUserFilters = {
  search: string;
  role: "ALL" | AdminUserRole;
  status: "ALL" | AdminUserStatus;
  page: number;
  limit: number;
};

export type AdminUser = {
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

export type AdminUserStats = {
  totalCount: number;
  activeCount: number;
  lockedCount: number;
  ownerCount: number;
  staffCount: number;
  doctorCount: number;
  needsAttentionCount: number;
};

export type AdminUserPagination = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};
