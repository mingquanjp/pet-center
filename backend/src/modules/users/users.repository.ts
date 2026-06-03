import { query } from "../../db/query.js";
import type { AdminUserListRow, AdminUsersQuery, AdminUserStatsRow } from "./users.types.js";

const vietnameseAccentChars =
  "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
const vietnamesePlainChars =
  "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

function normalizedUserSearchExpression() {
  return `
    translate(
      lower(
        concat_ws(
          ' ',
          u.user_id,
          u.full_name,
          u.email::text,
          coalesce(u.phone_number, '')
        )
      ),
      '${vietnameseAccentChars}',
      '${vietnamesePlainChars}'
    )
  `;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function buildAdminUserFilterClauses(filters: AdminUsersQuery) {
  const params: unknown[] = [];
  let where = "";

  if (filters.search?.trim()) {
    params.push(`%${normalizeSearchText(filters.search)}%`);
    where += ` AND ${normalizedUserSearchExpression()} LIKE $${params.length}`;
  }

  if (filters.role) {
    params.push(filters.role);
    where += ` AND u.role = $${params.length}`;
  }

  if (filters.status) {
    params.push(filters.status);
    where += ` AND u.account_status = $${params.length}`;
  }

  return { params, where };
}

export async function listAdminUsers(filters: AdminUsersQuery) {
  const { params, where } = buildAdminUserFilterClauses(filters);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const offset = (page - 1) * limit;

  params.push(limit);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const sql = `
    select
      u.user_id,
      u.full_name,
      u.email::text,
      u.phone_number,
      u.address,
      u.role,
      u.account_status,
      u.created_at,
      count(p.pet_id)::text as pet_count
    from pet_center.users u
    left join pet_center.pets p on p.owner_user_id = u.user_id
    where 1=1 ${where}
    group by u.user_id
    order by u.created_at desc, u.user_id asc
    limit $${limitParam} offset $${offsetParam}
  `;

  const result = await query<AdminUserListRow>(sql, params);
  return result.rows;
}

export async function countAdminUsers(filters: AdminUsersQuery) {
  const { params, where } = buildAdminUserFilterClauses(filters);
  const sql = `
    select count(*)::text as total
    from pet_center.users u
    where 1=1 ${where}
  `;

  const result = await query<{ total: string }>(sql, params);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function getAdminUserStats(filters: AdminUsersQuery) {
  const { params, where } = buildAdminUserFilterClauses(filters);
  const sql = `
    select
      count(*)::text as total_count,
      count(*) filter (where u.account_status = 'active')::text as active_count,
      count(*) filter (where u.account_status = 'locked')::text as locked_count,
      count(*) filter (where u.role = 'Owner')::text as owner_count,
      count(*) filter (where u.role = 'Staff')::text as staff_count,
      count(*) filter (where u.role = 'Doctor')::text as doctor_count,
      count(*) filter (where u.account_status in ('locked', 'inactive'))::text as needs_attention_count
    from pet_center.users u
    where 1=1 ${where}
  `;

  const result = await query<AdminUserStatsRow>(sql, params);
  return result.rows[0];
}
