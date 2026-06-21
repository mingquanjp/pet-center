import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import { withTransaction } from "../../../src/db/transactions.js";
import {
  createPendingVnpayAttempt,
  findVnpayAttemptByTxnRef,
  applyVnpayIpnUpdate
} from "../../../src/modules/payments/payments.repository.js";
import { upsertPetActivityLog } from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";

const mockClient = {
  query: vi.fn()
};

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn()
}));

vi.mock("../../../src/db/transactions.js", () => ({
  withTransaction: vi.fn((cb) => cb(mockClient))
}));

vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue("mock-elog-id")
}));

vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("mock-pay-id")
}));

vi.mock("../../../src/modules/payments/vnpay.service.js", () => ({
  buildVnpayPaymentUrl: vi.fn().mockReturnValue({
    paymentUrl: "https://mock-vnpay-url.com",
    expiresAt: new Date("2026-06-21T12:15:00.000Z")
  })
}));

const mockQuery = vi.mocked(query);

describe("payments.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset();
  });

  describe("createPendingVnpayAttempt", () => {
    it("UTX-PAYMENTS-366 - createPendingVnpayAttempt inserts pending payment attempt and returns detail object", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      const result = await createPendingVnpayAttempt(mockClient as any, {
        invoiceId: "inv_123",
        amount: 50000,
        orderInfo: "Thanh toan",
        clientIp: "127.0.0.1"
      });

      expect(mockClient.query).toHaveBeenCalled();
      const [sql, params] = mockClient.query.mock.calls[0];
      expect(sql).toContain("INSERT INTO pet_center.online_payment_attempts");
      expect(params).toContain("inv_123");
      expect(params).toContain(50000);
      expect(params).toContain("https://mock-vnpay-url.com");

      expect(result.paymentAttemptId).toBeDefined();
      expect(result.providerTxnRef).toBeDefined();
      expect(result.paymentUrl).toBe("https://mock-vnpay-url.com");
    });

    it("UTX-PAYMENTS-367 - createPendingVnpayAttempt propagates query execution errors", async () => {
      mockClient.query.mockRejectedValueOnce(new Error("Insert error"));

      await expect(createPendingVnpayAttempt(mockClient as any, {
        invoiceId: "inv_123",
        amount: 50000,
        orderInfo: "Thanh toan",
        clientIp: "127.0.0.1"
      })).rejects.toThrow("Insert error");
    });
  });

  describe("findVnpayAttemptByTxnRef", () => {
    it("UTX-PAYMENTS-368 - findVnpayAttemptByTxnRef executes query and returns attempt row", async () => {
      const mockRow = { payment_attempt_id: "opa_1", invoice_id: "inv_1" };
      mockQuery.mockResolvedValueOnce({ rows: [mockRow] } as any);

      const result = await findVnpayAttemptByTxnRef("ref_123");

      expect(mockQuery).toHaveBeenCalled();
      expect(mockQuery.mock.calls[0][0]).toContain("SELECT");
      expect(mockQuery.mock.calls[0][0]).toContain("pet_center.online_payment_attempts opa");
      expect(mockQuery.mock.calls[0][1]).toEqual(["ref_123"]);
      expect(result).toEqual(mockRow);
    });

    it("UTX-PAYMENTS-369 - findVnpayAttemptByTxnRef returns null when no transaction ref matches", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await findVnpayAttemptByTxnRef("ref_unknown");
      expect(result).toBeNull();
    });
  });

  describe("applyVnpayIpnUpdate", () => {
    it("UTX-PAYMENTS-370 - applyVnpayIpnUpdate handles successful payment updates cleanly inside transaction", async () => {
      const mockAttempt = {
        payment_attempt_id: "opa_1",
        invoice_id: "inv_1",
        amount: "50000",
        attempt_status: "pending",
        invoice_status: "unpaid",
        invoice_total_amount: "50000",
        source_type: "grooming",
        source_id: "gt_1",
        source_status: "pending"
      };

      // 1. Mock select attempt query (for update)
      mockClient.query.mockResolvedValueOnce({ rows: [mockAttempt] } as any);

      // 2. Mock markAttemptSuccessful update query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 3. Mock markInvoicePaid update query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 4. Mock createSuccessfulOnlinePayment query
      mockClient.query.mockResolvedValueOnce({ rows: [{ online_payment_id: "pay_1" }] } as any);

      // 5. Mock markSourceBookingConfirmed query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 6. Mock findInvoiceActivityContextForClient query
      mockClient.query.mockResolvedValueOnce({ rows: [{ pet_id: "pet_1", owner_user_id: "owner_1" }] } as any);

      const result = await applyVnpayIpnUpdate({
        providerTxnRef: "ref_123",
        providerTransactionNo: "trans_123",
        responseCode: "00",
        transactionStatus: "00",
        amount: 5000000, // Expected amount is 50000 * 100
        isSuccessful: true,
        payload: {}
      });

      expect(mockClient.query).toHaveBeenCalled();
      expect(upsertPetActivityLog).toHaveBeenCalledTimes(2); // Confirmed activity log and invoice paid activity log
      expect(result).toEqual({ outcome: "updated", attempt: mockAttempt, status: "success" });
    });

    it("UTX-PAYMENTS-371 - applyVnpayIpnUpdate handles failed payment attempts inside transaction", async () => {
      const mockAttempt = {
        payment_attempt_id: "opa_1",
        invoice_id: "inv_1",
        amount: "50000",
        attempt_status: "pending",
        invoice_status: "unpaid",
        invoice_total_amount: "50000",
        source_type: "grooming",
        source_id: "gt_1",
        source_status: "pending"
      };

      // 1. Mock select attempt query (for update)
      mockClient.query.mockResolvedValueOnce({ rows: [mockAttempt] } as any);

      // 2. Mock markAttemptFailed update query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 3. Mock markInvoiceCancelled update query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 4. Mock markSourceBookingCancelled query
      mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

      // 5. Mock findInvoiceActivityContextForClient query
      mockClient.query.mockResolvedValueOnce({ rows: [{ pet_id: "pet_1", owner_user_id: "owner_1" }] } as any);

      const result = await applyVnpayIpnUpdate({
        providerTxnRef: "ref_123",
        providerTransactionNo: null,
        responseCode: "99",
        transactionStatus: "99",
        amount: 5000000,
        isSuccessful: false,
        payload: {}
      });

      expect(mockClient.query).toHaveBeenCalled();
      expect(upsertPetActivityLog).toHaveBeenCalledTimes(1); // payment failed activity log
      expect(result).toEqual({ outcome: "updated", attempt: mockAttempt, status: "failed" });
    });
  });
});
