import { hashPassword } from "../../shared/security/password.service.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { createId } from "../../shared/utils/id.js";
import { createPagination } from "../../shared/utils/pagination.js";
import * as repo from "./users.repository.js";
import type { AdminUserActivityDto, AdminUserActivityRow, AdminUserDto, AdminUserListRow, AdminUserPetDto, AdminUserPetRow, AdminUsersQuery } from "./users.types.js";
import type { CreateAdminUserBody, UpdateAdminUserBody } from "./users.schema.js";



function mapAdminUser(row: AdminUserListRow): AdminUserDto {
  return {
    id: row.user_id,
    name: row.full_name,
    email: row.email,
    phone: row.phone_number,
    address: row.address,
    role: row.role,
    status: row.account_status,
    createdAt: new Date(row.created_at).toISOString(),
    petCount: parseInt(row.pet_count ?? "0", 10),
  };
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

function getSpeciesLabel(species: AdminUserPetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác",
  } as const;

  return labels[species];
}

function getGenderLabel(gender: AdminUserPetRow["gender"]): string {
  const labels = {
    male: "Đực",
    female: "Cái",
    unknown: "Chưa rõ",
  } as const;

  return gender ? labels[gender] : "Chưa cập nhật";
}

function getAgeLabel(row: AdminUserPetRow): string {
  if (row.birth_date) {
    const birthDate = new Date(row.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      now.getMonth() > birthDate.getMonth() ||
      (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) years -= 1;

    return years > 0 ? `${years} năm tuổi` : "Dưới 1 năm tuổi";
  }

  const estimatedAge = toNumber(row.estimated_age);

  if (estimatedAge === null) return "Chưa cập nhật";
  if (estimatedAge < 1) return "Dưới 1 năm tuổi";

  return `${Math.floor(estimatedAge)} năm tuổi`;
}

function getPetStatusLabel(status: AdminUserPetRow["pet_status"]): string {
  const labels = {
    active: "Đang theo dõi",
    inactive: "Ngưng theo dõi",
    deceased: "Đã mất",
  } as const;

  return labels[status];
}

function mapAdminUserPet(row: AdminUserPetRow): AdminUserPetDto {
  return {
    id: row.pet_id,
    name: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    breed: row.breed,
    gender: row.gender,
    genderLabel: getGenderLabel(row.gender),
    birthDate: row.birth_date,
    estimatedAge: toNumber(row.estimated_age),
    ageLabel: getAgeLabel(row),
    profileImageUrl: row.profile_image_url,
    status: row.pet_status,
    statusLabel: getPetStatusLabel(row.pet_status),
  };
}

function getActivityCategoryLabel(category: AdminUserActivityRow["activity_category"]): string {
  const labels = {
    medical: "Khám bệnh",
    vaccination: "Tiêm phòng",
    grooming: "Spa/Grooming",
    boarding: "Lưu trú",
    invoice: "Hóa đơn",
    payment: "Thanh toán",
    profile: "Hồ sơ",
  } as const;

  return labels[category];
}

function getActivityStatusLabel(status: AdminUserActivityRow["activity_status"]): string {
  const labels = {
    scheduled: "Đã lên lịch",
    pending: "Đang chờ",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    rejected: "Từ chối",
    failed: "Thất bại",
  } as const;

  return labels[status];
}

function mapAdminUserActivity(row: AdminUserActivityRow): AdminUserActivityDto {
  return {
    id: row.activity_log_id,
    petId: row.pet_id,
    petName: row.pet_name,
    actorName: row.actor_name,
    category: row.activity_category,
    categoryLabel: getActivityCategoryLabel(row.activity_category),
    type: row.activity_type,
    status: row.activity_status,
    statusLabel: getActivityStatusLabel(row.activity_status),
    occurredAt: row.occurred_at,
    title: row.title,
    summary: row.summary,
    sourceType: row.source_type,
    sourceId: row.source_id,
  };
}

export async function listAdminUsers(filters: AdminUsersQuery) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow] = await Promise.all([
    repo.listAdminUsers(filters),
    repo.countAdminUsers(filters),
    repo.getAdminUserStats(),
  ]);

  return {
    data: rows.map(mapAdminUser),
    stats: {
      totalCount: parseInt(statsRow?.total_count ?? "0", 10),
      activeCount: parseInt(statsRow?.active_count ?? "0", 10),
      lockedCount: parseInt(statsRow?.locked_count ?? "0", 10),
      ownerCount: parseInt(statsRow?.owner_count ?? "0", 10),
      staffCount: parseInt(statsRow?.staff_count ?? "0", 10),
      doctorCount: parseInt(statsRow?.doctor_count ?? "0", 10),
      needsAttentionCount: parseInt(statsRow?.needs_attention_count ?? "0", 10),
    },
    pagination: createPagination(page, limit, total),
  };
}

export async function getAdminUserDetail(userId: string) {
  const userRow = await repo.findAdminUserById(userId);

  if (!userRow) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const activityLimit = 5;
  const activityOffset = 0;
  const [pets, activities, activitiesTotal] = await Promise.all([
    repo.findAdminUserPets(userId, 4),
    repo.findAdminUserActivities(userId, activityLimit, activityOffset),
    repo.countAdminUserActivities(userId),
  ]);

  return {
    user: mapAdminUser(userRow),
    pets: pets.map(mapAdminUserPet),
    activities: activities.map(mapAdminUserActivity),
    activitiesPagination: {
      total: activitiesTotal,
      limit: activityLimit,
      offset: activityOffset,
      hasMore: activityOffset + activities.length < activitiesTotal,
    },
  };
}

export async function listAdminUserActivities(userId: string, query: { limit?: number; offset?: number }) {
  const userRow = await repo.findAdminUserById(userId);

  if (!userRow) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const limit = query.limit ?? 5;
  const offset = query.offset ?? 0;
  const [activities, total] = await Promise.all([repo.findAdminUserActivities(userId, limit, offset), repo.countAdminUserActivities(userId)]);

  return {
    activities: activities.map(mapAdminUserActivity),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + activities.length < total,
    },
  };
}

export async function createAdminUser(body: CreateAdminUserBody): Promise<AdminUserDto> {
  try {
    const idPrefix = {
      Owner: "own",
      Staff: "stf",
      Doctor: "doc",
      Admin: "adm",
    }[body.role];

    const row = await repo.createAdminUser({
      userId: await createId(idPrefix),
      fullName: body.fullName,
      email: body.email,
      passwordHash: await hashPassword(body.password),
      phoneNumber: body.phoneNumber,
      address: body.address,
      role: body.role,
      accountStatus: body.accountStatus,
    });

    return mapAdminUser(row);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new AppError("Email này đã được sử dụng", "EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
    }

    throw error;
  }
}

export async function updateAdminUser(userId: string, body: UpdateAdminUserBody): Promise<AdminUserDto> {
  try {
    const updatePayload: {
      fullName?: string;
      email?: string;
      phoneNumber?: string | null;
      address?: string | null;
      role?: string;
      accountStatus?: string;
    } = {};

    if (Object.prototype.hasOwnProperty.call(body, "fullName")) updatePayload.fullName = body.fullName;
    if (Object.prototype.hasOwnProperty.call(body, "email")) updatePayload.email = body.email;
    if (Object.prototype.hasOwnProperty.call(body, "phoneNumber")) updatePayload.phoneNumber = body.phoneNumber;
    if (Object.prototype.hasOwnProperty.call(body, "address")) updatePayload.address = body.address;
    if (Object.prototype.hasOwnProperty.call(body, "role")) updatePayload.role = body.role;
    if (Object.prototype.hasOwnProperty.call(body, "accountStatus")) updatePayload.accountStatus = body.accountStatus;

    const row = await repo.updateAdminUser(userId, updatePayload);

    if (!row) {
      throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    return mapAdminUser(row);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new AppError("Email này đã được sử dụng", "EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
    }

    throw error;
  }
}

export async function deleteAdminUser(userId: string, currentUserId?: string): Promise<AdminUserDto> {
  if (currentUserId === userId) {
    throw new AppError("Không thể xóa chính tài khoản đang đăng nhập", "CANNOT_DELETE_SELF", httpStatus.BAD_REQUEST);
  }

  const row = await repo.updateAdminUser(userId, { accountStatus: "inactive" });

  if (!row) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return mapAdminUser(row);
}
