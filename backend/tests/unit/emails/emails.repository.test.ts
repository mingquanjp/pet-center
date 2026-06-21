import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import { createId } from "../../../src/shared/utils/id.js";
import {
  createEmailLog,
  updateEmailLogStatus
} from "../../../src/modules/emails/emails.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock_elog_id"),
}));

const mockQuery = vi.mocked(query);
const mockCreateId = vi.mocked(createId);

describe("emails.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEmailLog", () => {
    it("UTX-EMAILS-165 - createEmailLog generates query with default values and RETURNING *", async () => {
      const mockRow = {
        email_log_id: "mock_elog_id",
        receiver_user_id: "usr_123",
        receiver_email: "owner@gmail.com",
        template_key: "welcome",
        subject: "Welcome",
        related_object_type: null,
        related_object_id: null,
        status: "pending",
        provider_message_id: null,
        error_message: null,
        sent_at: null,
        created_at: "2026-06-20",
        metadata: {}
      };

      mockQuery.mockResolvedValue({
        rows: [mockRow]
      } as any);

      const payload = {
        receiverUserId: "usr_123",
        receiverEmail: "owner@gmail.com",
        templateKey: "welcome",
        subject: "Welcome"
      };

      const result = await createEmailLog(payload);

      expect(mockCreateId).toHaveBeenCalledWith("elog");
      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("INSERT INTO pet_center.email_logs");
      expect(sql).toContain("RETURNING *");
      expect(params).toEqual([
        "mock_elog_id",
        "usr_123",
        "owner@gmail.com",
        "welcome",
        "Welcome",
        null,
        null,
        {}
      ]);

      expect(result).toEqual(mockRow);
    });

    it("UTX-EMAILS-166 - createEmailLog propagates database query errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      const payload = {
        receiverUserId: "usr_123",
        receiverEmail: "owner@gmail.com",
        templateKey: "welcome",
        subject: "Welcome"
      };

      await expect(createEmailLog(payload)).rejects.toThrow("Database error");
    });
  });

  describe("updateEmailLogStatus", () => {
    it("UTX-EMAILS-167 - updateEmailLogStatus updates status to sent with provider message ID", async () => {
      const mockRow = {
        email_log_id: "elog_123",
        status: "sent",
        provider_message_id: "msg_123",
        sent_at: "2026-06-20"
      };

      mockQuery.mockResolvedValue({
        rows: [mockRow]
      } as any);

      const result = await updateEmailLogStatus("elog_123", "sent", "msg_123");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("UPDATE pet_center.email_logs");
      expect(sql).toContain("status = $1");
      expect(sql).toContain("provider_message_id = $2");
      expect(sql).toContain("sent_at = now()");
      expect(params).toEqual(["sent", "msg_123", "elog_123"]);

      expect(result).toEqual(mockRow);
    });

    it("UTX-EMAILS-168 - updateEmailLogStatus updates status to failed with error message", async () => {
      const mockRow = {
        email_log_id: "elog_123",
        status: "failed",
        error_message: "SMTP connection timeout"
      };

      mockQuery.mockResolvedValue({
        rows: [mockRow]
      } as any);

      const result = await updateEmailLogStatus("elog_123", "failed", "SMTP connection timeout");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("UPDATE pet_center.email_logs");
      expect(sql).toContain("status = $1");
      expect(sql).toContain("error_message = $2");
      expect(sql).not.toContain("sent_at = now()");
      expect(params).toEqual(["failed", "SMTP connection timeout", "elog_123"]);

      expect(result).toEqual(mockRow);
    });
  });
});
