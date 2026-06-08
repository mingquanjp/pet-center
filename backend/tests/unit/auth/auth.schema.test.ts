import { describe, expect, it } from "vitest";
import { loginSchema } from "../../../src/modules/auth/auth.schema.js";

function expectIssueMessage(result: ReturnType<typeof loginSchema.safeParse>, message: string): void {
  expect(result.success).toBe(false);

  if (result.success) {
    throw new Error("Expected loginSchema validation to fail");
  }

  expect(result.error.issues.some((issue) => issue.message === message)).toBe(true);
}

describe("loginSchema", () => {
  it("UT-LOGIN-004 - reject invalid email format", () => {
    // Arrange
    const input = {
      email: "abc",
      password: "Valid@123",
    };

    // Act
    const result = loginSchema.safeParse(input);

    // Assert
    expectIssueMessage(result, "Email không hợp lệ");
  });

  it("UT-LOGIN-005 - reject empty email", () => {
    // Arrange
    const input = {
      email: "",
      password: "Valid@123",
    };

    // Act
    const result = loginSchema.safeParse(input);

    // Assert
    expectIssueMessage(result, "Email không hợp lệ");
  });

  it("UT-LOGIN-009 - reject empty password", () => {
    // Arrange
    const input = {
      email: "owner.petcenter@example.com",
      password: "",
    };

    // Act
    const result = loginSchema.safeParse(input);

    // Assert
    expectIssueMessage(result, "Vui lòng nhập mật khẩu");
  });

  it("UT-LOGIN-010 - reject password longer than 100 characters", () => {
    // Arrange
    const input = {
      email: "owner.petcenter@example.com",
      password: "a".repeat(101),
    };

    // Act
    const result = loginSchema.safeParse(input);

    // Assert
    expectIssueMessage(result, "Mật khẩu không được vượt quá 100 ký tự");
  });

  it("UT-LOGIN-011 - reject email longer than 255 characters", () => {
    // Arrange
    const input = {
      email: `${"a".repeat(250)}@example.com`,
      password: "Valid@123",
    };

    // Act
    const result = loginSchema.safeParse(input);

    // Assert
    expectIssueMessage(result, "Email không được vượt quá 255 ký tự");
  });
});
