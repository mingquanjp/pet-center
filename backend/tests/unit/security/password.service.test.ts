import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateTemporaryPassword
} from "../../../src/shared/security/password.service.js";

describe("password.service unit tests", () => {
  describe("hashPassword", () => {
    it("UTX-SHARED-515 - hashPassword generates a unique scrypt formatted hash", async () => {
      const password = "my_secure_password";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Verify structure: scrypt$salt$derivedKey
      expect(hash1).toMatch(/^scrypt\$[a-zA-Z0-9_-]+\$[a-zA-Z0-9_-]+$/);
      // Salting ensures hashes are different for same password
      expect(hash1).not.toBe(hash2);
    });

    it("UTX-SHARED-516 - hashPassword works for empty passwords or special chars", async () => {
      const hashEmpty = await hashPassword("");
      expect(hashEmpty).toMatch(/^scrypt\$[a-zA-Z0-9_-]+\$[a-zA-Z0-9_-]+$/);
    });
  });

  describe("verifyPassword", () => {
    it("UTX-SHARED-517 - verifyPassword returns true for correct password and matches hash", async () => {
      const password = "correct_password";
      const hash = await hashPassword(password);

      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it("UTX-SHARED-518 - verifyPassword returns false for incorrect password or invalid hash formats", async () => {
      const password = "correct_password";
      const hash = await hashPassword(password);

      const isMatchWrong = await verifyPassword("wrong_password", hash);
      expect(isMatchWrong).toBe(false);

      // Invalid format tests
      expect(await verifyPassword(password, "invalid_hash")).toBe(false);
      expect(await verifyPassword(password, "scrypt$saltonly")).toBe(false);
      expect(await verifyPassword(password, "otheralg$salt$hash")).toBe(false);
    });
  });

  describe("generateTemporaryPassword", () => {
    it("UTX-SHARED-519 - generateTemporaryPassword returns password of specified length", () => {
      const passDefault = generateTemporaryPassword();
      expect(passDefault).toHaveLength(10);

      const passCustom = generateTemporaryPassword(16);
      expect(passCustom).toHaveLength(16);
    });

    it("UTX-SHARED-520 - generateTemporaryPassword only contains characters from defined alphabet", () => {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
      const generated = generateTemporaryPassword(100);

      for (const char of generated) {
        expect(alphabet).toContain(char);
      }
    });
  });
});
