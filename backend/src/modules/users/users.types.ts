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

export type AdminUserPetRow = {
  pet_id: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  gender: "male" | "female" | "unknown" | null;
  birth_date: string | null;
  estimated_age: string | number | null;
  profile_image_url: string | null;
};

export type AdminUserActivityRow = {
  activity_log_id: string;
  pet_id: string | null;
  pet_name: string | null;
  actor_name: string | null;
  activity_category: "medical" | "vaccination" | "grooming" | "boarding" | "invoice" | "payment" | "profile";
  activity_type: string;
  activity_status: "scheduled" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "failed";
  occurred_at: string;
  title: string;
  summary: string | null;
  source_type: string;
  source_id: string;
};

export type AdminUserPetDto = {
  id: string;
  name: string;
  species: AdminUserPetRow["species"];
  speciesLabel: string;
  breed: string | null;
  gender: AdminUserPetRow["gender"];
  genderLabel: string;
  birthDate: string | null;
  estimatedAge: number | null;
  ageLabel: string;
  profileImageUrl: string | null;
};

export type AdminUserActivityDto = {
  id: string;
  petId: string | null;
  petName: string | null;
  actorName: string | null;
  category: AdminUserActivityRow["activity_category"];
  categoryLabel: string;
  type: string;
  status: AdminUserActivityRow["activity_status"];
  statusLabel: string;
  occurredAt: string;
  title: string;
  summary: string | null;
  sourceType: string;
  sourceId: string;
};

export type AdminUserDetailDto = {
  user: AdminUserDto;
  pets: AdminUserPetDto[];
  activities: AdminUserActivityDto[];
  activitiesPagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type AdminUserActivitiesDto = {
  activities: AdminUserActivityDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};
