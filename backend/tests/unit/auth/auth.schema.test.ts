import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../../../src/modules/auth/auth.schema.js";

function expectIssue(schema: any, payload: any, message: string): void {
  const result = schema.safeParse(payload);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.some((issue: any) => issue.message.includes(message))).toBe(true);
  }
}

describe("auth schemas validation", () => {
  describe("loginSchema", () => {
    // Keep original tests
    it("UT-LOGIN-004 - reject invalid email format", () => {
      expectIssue(loginSchema, { email: "abc", password: "Valid@123" }, "Email không hợp lệ");
    });

    it("UT-LOGIN-005 - reject empty email", () => {
      expectIssue(loginSchema, { email: "", password: "Valid@123" }, "Email không hợp lệ");
    });

    it("UT-LOGIN-009 - reject empty password", () => {
      expectIssue(loginSchema, { email: "owner.petcenter@example.com", password: "" }, "Vui lòng nhập mật khẩu");
    });

    it("UT-LOGIN-010 - reject password longer than 100 characters", () => {
      expectIssue(loginSchema, { email: "owner.petcenter@example.com", password: "a".repeat(101) }, "Mật khẩu không được vượt quá 100 ký tự");
    });

    it("UT-LOGIN-011 - reject email longer than 255 characters", () => {
      expectIssue(loginSchema, { email: `${"a".repeat(250)}@example.com`, password: "Valid@123" }, "Email không được vượt quá 255 ký tự");
    });

    it("UTX-AUTH-065 - loginSchema accepts valid inputs", () => {
      expect(loginSchema.safeParse({ email: "valid@example.com", password: "some_password" }).success).toBe(true);
    });

    it("UTX-AUTH-066 - loginSchema rejects invalid inputs", () => {
      expectIssue(loginSchema, { email: "invalid", password: "pwd" }, "Email không hợp lệ");
    });
  });

  describe("registerSchema", () => {
    const validRegister = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
      phoneNumber: "0901234567",
      address: "Hanoi"
    };

    it("UTX-AUTH-063 - registerSchema accepts valid input within boundaries", () => {
      expect(registerSchema.safeParse(validRegister).success).toBe(true);
      expect(registerSchema.safeParse({ ...validRegister, phoneNumber: undefined, address: undefined }).success).toBe(true);
    });

    it("UTX-AUTH-064 - registerSchema rejects invalid inputs", () => {
      expectIssue(registerSchema, { ...validRegister, fullName: "A" }, "Họ và tên phải có ít nhất 2 ký tự");
      expectIssue(registerSchema, { ...validRegister, password: "short" }, "Mật khẩu phải có ít nhất 8 ký tự");
      expectIssue(registerSchema, { ...validRegister, phoneNumber: "123" }, "Số điện thoại không hợp lệ");
    });
  });

  describe("updateProfileSchema", () => {
    const validProfile = {
      fullName: "Updated Name",
      phoneNumber: "0900000000",
      address: "Hanoi"
    };

    it("UTX-AUTH-067 - updateProfileSchema accepts valid profile updates", () => {
      expect(updateProfileSchema.safeParse(validProfile).success).toBe(true);
      expect(updateProfileSchema.safeParse({ ...validProfile, phoneNumber: null, address: null }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ ...validProfile, phoneNumber: "", address: "" }).success).toBe(true);
    });

    it("UTX-AUTH-068 - updateProfileSchema rejects invalid inputs", () => {
      expectIssue(updateProfileSchema, { ...validProfile, fullName: "" }, "Họ và tên phải có ít nhất 2 ký tự");
      expectIssue(updateProfileSchema, { ...validProfile, phoneNumber: "abc" }, "Số điện thoại không hợp lệ");
    });
  });

  describe("changePasswordSchema", () => {
    const validChange = {
      currentPassword: "OldPassword123",
      newPassword: "NewPassword123",
      confirmPassword: "NewPassword123"
    };

    it("UTX-AUTH-069 - changePasswordSchema accepts valid password payload", () => {
      expect(changePasswordSchema.safeParse(validChange).success).toBe(true);
    });

    it("UTX-AUTH-070 - changePasswordSchema rejects mismatched confirmPassword or short passwords", () => {
      expectIssue(changePasswordSchema, { ...validChange, confirmPassword: "mismatched" }, "Mật khẩu xác nhận không khớp");
      expectIssue(changePasswordSchema, { ...validChange, newPassword: "short", confirmPassword: "short" }, "Mật khẩu mới phải có ít nhất 8 ký tự");
    });
  });

  describe("forgotPasswordSchema", () => {
    it("UTX-AUTH-071 - forgotPasswordSchema accepts valid email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "owner@example.com" }).success).toBe(true);
    });

    it("UTX-AUTH-072 - forgotPasswordSchema rejects invalid email format", () => {
      expectIssue(forgotPasswordSchema, { email: "invalid" }, "Email không hợp lệ");
    });
  });

  describe("resetPasswordSchema", () => {
    const validReset = {
      token: "a".repeat(32),
      newPassword: "NewPassword123",
      confirmPassword: "NewPassword123"
    };

    it("UTX-AUTH-073 - resetPasswordSchema accepts valid payload", () => {
      expect(resetPasswordSchema.safeParse(validReset).success).toBe(true);
    });

    it("UTX-AUTH-074 - resetPasswordSchema rejects invalid token or mismatched passwords", () => {
      expectIssue(resetPasswordSchema, { ...validReset, token: "short" }, "Liên kết đặt lại mật khẩu không hợp lệ");
      expectIssue(resetPasswordSchema, { ...validReset, confirmPassword: "mismatched" }, "Mật khẩu xác nhận không khớp");
    });
  });
});
