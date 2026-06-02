import { createPagination } from "../../shared/utils/pagination.js";
import * as repo from "./users.repository.js";
import type { AdminUserDto, AdminUserListRow, AdminUsersQuery } from "./users.types.js";

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

export async function listAdminUsers(filters: AdminUsersQuery) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow] = await Promise.all([
    repo.listAdminUsers(filters),
    repo.countAdminUsers(filters),
    repo.getAdminUserStats(filters),
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
