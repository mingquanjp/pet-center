import { query } from "../../db/query.js";
import type { AdminUserActivityRow, AdminUserListRow, AdminUserPetRow, AdminUsersQuery, AdminUserStatsRow } from "./users.types.js";

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

export async function getAdminUserStats() {
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
  `;

  const result = await query<AdminUserStatsRow>(sql);
  return result.rows[0];
}

export async function findAdminUserById(userId: string) {
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
    where u.user_id = $1
    group by u.user_id
    limit 1
  `;

  const result = await query<AdminUserListRow>(sql, [userId]);
  return result.rows[0] ?? null;
}

export async function findAdminUserPets(userId: string, limit = 4) {
  const sql = `
    select
      p.pet_id,
      p.pet_name,
      p.species,
      p.breed,
      p.gender,
      p.birth_date::text as birth_date,
      p.estimated_age,
      p.profile_image_url
    from pet_center.pets p
    where p.owner_user_id = $1
    order by
      p.pet_name asc,
      p.pet_id asc
    limit $2
  `;

  const result = await query<AdminUserPetRow>(sql, [userId, limit]);
  return result.rows;
}

export async function findAdminUserActivities(userId: string, limit = 5, offset = 0) {
  const sql = `
    select
      pal.activity_log_id,
      pal.pet_id,
      p.pet_name,
      actor.full_name as actor_name,
      pal.activity_category,
      pal.activity_type,
      pal.activity_status,
      pal.occurred_at::text as occurred_at,
      pal.title,
      pal.summary,
      pal.source_type,
      pal.source_id
    from pet_center.pet_activity_logs pal
    left join pet_center.pets p on p.pet_id = pal.pet_id
    left join pet_center.users actor on actor.user_id = pal.actor_user_id
    where pal.owner_user_id = $1
      and pal.visibility_status = 'visible'
    order by pal.occurred_at desc, pal.activity_log_id desc
    limit $2 offset $3
  `;

  const result = await query<AdminUserActivityRow>(sql, [userId, limit, offset]);
  return result.rows;
}

export async function countAdminUserActivities(userId: string) {
  const sql = `
    select count(*)::text as total
    from pet_center.pet_activity_logs pal
    where pal.owner_user_id = $1
      and pal.visibility_status = 'visible'
  `;

  const result = await query<{ total: string }>(sql, [userId]);
  return parseInt(result.rows[0]?.total ?? "0", 10);
}

export async function createAdminUser(input: {
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  accountStatus: string;
}) {
  const sql = `
    insert into pet_center.users (
      user_id,
      full_name,
      email,
      password_hash,
      phone_number,
      address,
      role,
      account_status
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning
      user_id,
      full_name,
      email::text,
      phone_number,
      address,
      role,
      account_status,
      created_at,
      '0'::text as pet_count
  `;

  const result = await query<AdminUserListRow>(sql, [
    input.userId,
    input.fullName,
    input.email,
    input.passwordHash,
    input.phoneNumber ?? null,
    input.address ?? null,
    input.role,
    input.accountStatus,
  ]);

  return result.rows[0];
}

export async function updateAdminUser(
  userId: string,
  input: {
    fullName?: string;
    email?: string;
    phoneNumber?: string | null;
    address?: string | null;
    role?: string;
    accountStatus?: string;
  }
) {
  const sql = `
    update pet_center.users as u
    set
      full_name = coalesce($2, full_name),
      email = coalesce($3, email),
      phone_number = case when $4::boolean then $5 else phone_number end,
      address = case when $6::boolean then $7 else address end,
      role = coalesce($8, role),
      account_status = coalesce($9, account_status)
    where u.user_id = $1
    returning
      user_id,
      full_name,
      email::text,
      phone_number,
      address,
      role,
      account_status,
      created_at,
      (
        select count(p.pet_id)::text
        from pet_center.pets p
        where p.owner_user_id = u.user_id
      ) as pet_count
  `;

  const result = await query<AdminUserListRow>(sql, [
    userId,
    input.fullName ?? null,
    input.email ?? null,
    Object.prototype.hasOwnProperty.call(input, "phoneNumber"),
    input.phoneNumber ?? null,
    Object.prototype.hasOwnProperty.call(input, "address"),
    input.address ?? null,
    input.role ?? null,
    input.accountStatus ?? null,
  ]);

  return result.rows[0] ?? null;
}
