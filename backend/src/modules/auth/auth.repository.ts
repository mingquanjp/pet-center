import { query } from "../../db/query.js";
import type { AccountStatus, AuthUserRecord, DbRole } from "./auth.types.js";

type UserRow = {
  user_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  phone_number: string | null;
  address: string | null;
  role: DbRole;
  account_status: AccountStatus;
  created_at: Date | string;
};

function normalizeRole(role: DbRole): AuthUserRecord["role"] {
  const roleMap = {
    Owner: "OWNER",
    Staff: "STAFF",
    Doctor: "DOCTOR",
    Admin: "ADMIN"
  } as const;

  return roleMap[role];
}

function mapUser(row: UserRow): AuthUserRecord {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: normalizeRole(row.role),
    accountStatus: row.account_status,
    phoneNumber: row.phone_number,
    address: row.address,
    createdAt: new Date(row.created_at).toISOString()
  };
}

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const result = await query<UserRow>(
    `select user_id, full_name, email::text as email, password_hash, phone_number, address, role, account_status, created_at
     from pet_center.users
     where email = $1
     limit 1`,
    [email]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(userId: string): Promise<AuthUserRecord | null> {
  const result = await query<UserRow>(
    `select user_id, full_name, email::text as email, password_hash, phone_number, address, role, account_status, created_at
     from pet_center.users
     where user_id = $1
     limit 1`,
    [userId]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createOwnerUser(input: {
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  address?: string;
}): Promise<AuthUserRecord> {
  const result = await query<UserRow>(
    `insert into pet_center.users (user_id, full_name, email, password_hash, phone_number, address, role)
     values ($1, $2, $3, $4, $5, $6, 'Owner')
     returning user_id, full_name, email::text as email, password_hash, phone_number, address, role, account_status, created_at`,
    [input.userId, input.fullName, input.email, input.passwordHash, input.phoneNumber ?? null, input.address ?? null]
  );

  return mapUser(result.rows[0]);
}

export async function updateCurrentUserProfile(
  userId: string,
  input: { fullName: string; phoneNumber: string | null; address: string | null }
): Promise<AuthUserRecord | null> {
  const result = await query<UserRow>(
    `update pet_center.users
     set full_name = $2,
         phone_number = $3,
         address = $4
     where user_id = $1
     returning user_id, full_name, email::text as email, password_hash, phone_number, address, role, account_status, created_at`,
    [userId, input.fullName, input.phoneNumber, input.address]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function updateCurrentUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const result = await query(
    `update pet_center.users
     set password_hash = $2
     where user_id = $1`,
    [userId, passwordHash]
  );

  return (result.rowCount ?? 0) > 0;
}
