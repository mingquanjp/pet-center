import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import * as repo from "../../../src/modules/emails/emails.repository.js";
import { sendOwnerEmail } from "../../../src/modules/emails/emails.service.js";
import nodemailer from "nodemailer";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

vi.mock("../../../src/modules/emails/emails.repository.js", () => ({
  createEmailLog: vi.fn(),
  updateEmailLogStatus: vi.fn(),
}));

vi.mock("nodemailer", () => {
  const mockSendMail = vi.fn();
  const mockTransport = {
    sendMail: mockSendMail,
  };
  return {
    default: {
      createTransport: vi.fn().mockReturnValue(mockTransport),
    },
    mockSendMail,
  };
});

const mockQuery = vi.mocked(query);
const mockRepo = vi.mocked(repo);
const mockNodemailer = vi.mocked(nodemailer);

// Extract the mock sendMail function
const mockSendMail = (nodemailer.createTransport() as any).sendMail;

describe("emails.service unit tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("sendOwnerEmail", () => {
    const defaultOptions = {
      receiverUserId: "usr_owner_1",
      templateKey: "welcome",
      subject: "Welcome back!",
      html: "<p>Hello</p>",
      relatedObjectType: "pet",
      relatedObjectId: "pet_123",
      metadata: { petName: "Ki" }
    };

    it("UTX-EMAILS-163 - sendOwnerEmail successfully logs, sends email, and updates status to sent", async () => {
      // 1. SMTP_HOST not set (Mock mode)
      delete process.env.SMTP_HOST;
      
      mockQuery.mockResolvedValue({
        rows: [{ email: "owner@gmail.com", role: "Owner" }]
      } as any);

      mockRepo.createEmailLog.mockResolvedValue({
        email_log_id: "elog_123",
        receiver_user_id: "usr_owner_1",
        receiver_email: "owner@gmail.com",
        template_key: "welcome",
        subject: "Welcome back!"
      } as any);

      mockRepo.updateEmailLogStatus.mockResolvedValue({} as any);

      const resultMock = await sendOwnerEmail(defaultOptions);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT email, role FROM pet_center.users"),
        ["usr_owner_1"]
      );
      expect(mockRepo.createEmailLog).toHaveBeenCalledWith({
        receiverUserId: "usr_owner_1",
        receiverEmail: "owner@gmail.com",
        templateKey: "welcome",
        subject: "Welcome back!",
        relatedObjectType: "pet",
        relatedObjectId: "pet_123",
        metadata: { petName: "Ki" }
      });
      expect(mockRepo.updateEmailLogStatus).toHaveBeenCalledWith("elog_123", "sent", "mock_message_id");
      expect(resultMock).toEqual({ skipped: false, success: true, messageId: "mock_message_id" });

      // 2. SMTP_HOST set (SMTP mode)
      process.env.SMTP_HOST = "smtp.mailtrap.io";
      process.env.SMTP_PORT = "2525";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      process.env.SMTP_FROM = "PetCenter <test@petcenter.com>";

      mockSendMail.mockResolvedValue({ messageId: "smtp_msg_789" });

      const resultSmtp = await sendOwnerEmail(defaultOptions);

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
          user: "user",
          pass: "pass"
        }
      });
      expect(mockSendMail).toHaveBeenCalledWith({
        from: "PetCenter <test@petcenter.com>",
        to: "owner@gmail.com",
        subject: "Welcome back!",
        html: "<p>Hello</p>"
      });
      expect(mockRepo.updateEmailLogStatus).toHaveBeenCalledWith("elog_123", "sent", "smtp_msg_789");
      expect(resultSmtp).toEqual({ skipped: false, success: true, messageId: "smtp_msg_789" });
    });

    it("UTX-EMAILS-164 - sendOwnerEmail handles not found user, non-owner role, and transport errors correctly", async () => {
      // 1. User not found
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const resultNotFound = await sendOwnerEmail(defaultOptions);
      expect(resultNotFound).toEqual({ skipped: true, reason: "USER_NOT_FOUND_OR_INACTIVE" });
      expect(mockRepo.createEmailLog).not.toHaveBeenCalled();

      // 2. Non-owner role
      mockQuery.mockResolvedValue({
        rows: [{ email: "staff@gmail.com", role: "Staff" }]
      } as any);
      const resultNonOwner = await sendOwnerEmail(defaultOptions);
      expect(resultNonOwner).toEqual({ skipped: true, reason: "NON_OWNER" });
      expect(mockRepo.createEmailLog).not.toHaveBeenCalled();

      // 3. Transport failure
      mockQuery.mockResolvedValue({
        rows: [{ email: "owner@gmail.com", role: "Owner" }]
      } as any);
      mockRepo.createEmailLog.mockResolvedValue({
        email_log_id: "elog_error"
      } as any);

      process.env.SMTP_HOST = "smtp.error.com";
      mockSendMail.mockRejectedValue(new Error("SMTP connection failed"));

      const resultError = await sendOwnerEmail(defaultOptions);

      expect(mockRepo.updateEmailLogStatus).toHaveBeenCalledWith("elog_error", "failed", "SMTP connection failed");
      expect(resultError).toEqual({ skipped: false, success: false, error: "SMTP connection failed" });
    });
  });
});
