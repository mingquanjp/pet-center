import { beforeEach, describe, expect, it, vi } from "vitest";
import nodemailer from "nodemailer";
import { env } from "../../../src/config/env.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import {
  sendOwnerAccountCreatedEmail,
  sendPasswordResetEmail
} from "../../../src/modules/mail/mail.service.js";

// Mock env
vi.mock("../../../src/config/env.js", () => ({
  env: {
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: 465,
    SMTP_USER: "test@example.com",
    SMTP_PASS: "password",
    MAIL_FROM: "PetCenter",
  }
}));

// Mock nodemailer
vi.mock("nodemailer");

describe("mail.service unit tests", () => {
  const mockSendMail = vi.fn();
  const mockTransporter = {
    sendMail: mockSendMail,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter as any);
    // Reset env properties to default configured state
    env.SMTP_HOST = "smtp.example.com";
    env.SMTP_USER = "test@example.com";
    env.SMTP_PASS = "password";
  });

  describe("sendOwnerAccountCreatedEmail", () => {
    it("UTX-MAIL-286 - sendOwnerAccountCreatedEmail sends account welcome email successfully with valid payload", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-123" });

      const params = {
        to: "owner@gmail.com",
        ownerName: "Minh Quân",
        loginEmail: "owner@gmail.com",
        temporaryPassword: "tempPassword123"
      };

      await sendOwnerAccountCreatedEmail(params);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: 465,
        secure: true,
        auth: {
          user: "test@example.com",
          pass: "password"
        }
      });

      expect(mockSendMail).toHaveBeenCalled();
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(params.to);
      expect(mailOptions.from).toBe("PetCenter <test@example.com>");
      expect(mailOptions.subject).toContain("Chào mừng bạn đến với PetCenter");
      expect(mailOptions.text).toContain(params.ownerName);
      expect(mailOptions.text).toContain(params.loginEmail);
      expect(mailOptions.text).toContain(params.temporaryPassword);
      expect(mailOptions.html).toContain(params.ownerName);
    });

    it("UTX-MAIL-287 - sendOwnerAccountCreatedEmail throws AppError if SMTP is not configured", async () => {
      // SMTP_HOST is missing
      env.SMTP_HOST = "";

      const params = {
        to: "owner@gmail.com",
        ownerName: "Minh Quân",
        loginEmail: "owner@gmail.com",
        temporaryPassword: "tempPassword123"
      };

      await expect(sendOwnerAccountCreatedEmail(params)).rejects.toThrow(
        new AppError("SMTP chưa được cấu hình", "SMTP_NOT_CONFIGURED", httpStatus.SERVICE_UNAVAILABLE)
      );
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("UTX-MAIL-288 - sendPasswordResetEmail sends reset password link successfully with valid payload", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-456" });

      const params = {
        to: "user@example.com",
        fullName: "Hữu Quân",
        resetUrl: "http://localhost:3000/reset-password?token=abc",
        expiresInMinutes: 15
      };

      await sendPasswordResetEmail(params);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(params.to);
      expect(mailOptions.from).toBe("PetCenter <test@example.com>");
      expect(mailOptions.subject).toContain("Đặt lại mật khẩu PetCenter");
      expect(mailOptions.text).toContain(params.fullName);
      expect(mailOptions.text).toContain(params.resetUrl);
      expect(mailOptions.text).toContain("15 phút");
      expect(mailOptions.html).toContain("Hữu Quân");
      expect(mailOptions.html).toContain("http://localhost:3000/reset-password?token=abc");
    });

    it("UTX-MAIL-289 - sendPasswordResetEmail throws AppError if SMTP is not configured", async () => {
      // SMTP_USER is missing
      env.SMTP_USER = "";

      const params = {
        to: "user@example.com",
        fullName: "Hữu Quân",
        resetUrl: "http://localhost:3000/reset-password?token=abc",
        expiresInMinutes: 15
      };

      await expect(sendPasswordResetEmail(params)).rejects.toThrow(
        new AppError("SMTP chưa được cấu hình", "SMTP_NOT_CONFIGURED", httpStatus.SERVICE_UNAVAILABLE)
      );
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });
  });
});
