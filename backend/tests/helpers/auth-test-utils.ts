import { scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import type { AuthUserRecord } from "../../src/modules/auth/auth.types.js";

const scrypt = promisify(scryptCallback);

export async function createTestPasswordHash(password: string): Promise<string> {
  const salt = "unit-test-salt";
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export function createAuthUserRecord(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    userId: "user-001",
    fullName: "Pet Center User",
    email: "user.petcenter@example.com",
    passwordHash: "scrypt$unit-test-salt$placeholder",
    role: "OWNER",
    accountStatus: "active",
    phoneNumber: "0900000000",
    address: "Ha Noi",
    createdAt: "2026-06-08T00:00:00.000Z",
    ...overrides,
  };
}
