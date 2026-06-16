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

export type AdminUserPet = {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  speciesLabel: string;
  breed: string | null;
  gender: "male" | "female" | "unknown" | null;
  genderLabel: string;
  birthDate: string | null;
  estimatedAge: number | null;
  ageLabel: string;
  profileImageUrl: string | null;
};

export type AdminUserActivity = {
  id: string;
  petId: string | null;
  petName: string | null;
  actorName: string | null;
  category: "medical" | "vaccination" | "grooming" | "boarding" | "invoice" | "payment" | "profile";
  categoryLabel: string;
  type: string;
  status: "scheduled" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "failed";
  statusLabel: string;
  occurredAt: string;
  title: string;
  summary: string | null;
  sourceType: string;
  sourceId: string;
};

export type AdminUserDetail = {
  user: AdminUser;
  pets: AdminUserPet[];
  activities: AdminUserActivity[];
  activitiesPagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type CreateAdminUserInput = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  role: AdminUserRole;
  accountStatus: AdminUserStatus;
};

export type UpdateAdminUserInput = {
  fullName?: string;
  email?: string;
  phoneNumber?: string | null;
  address?: string | null;
  role?: AdminUserRole;
  accountStatus?: AdminUserStatus;
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
