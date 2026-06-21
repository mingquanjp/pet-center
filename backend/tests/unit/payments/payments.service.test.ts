import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildVnpayReturnRedirect, handleVnpayIpn } from "../../../src/modules/payments/payments.service.js";
import * as repo from "../../../src/modules/payments/payments.repository.js";
import * as vnpayService from "../../../src/modules/payments/vnpay.service.js";

vi.mock("../../../src/modules/payments/payments.repository.js");
vi.mock("../../../src/modules/payments/vnpay.service.js");

const mockRepo = vi.mocked(repo);
const mockVnpay = vi.mocked(vnpayService);

describe("payments.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildVnpayReturnRedirect", () => {
    it("UTX-PAYMENTS-357 - buildVnpayReturnRedirect verifies signature and returns correct redirect URL", async () => {
      // 1. Invalid signature case
      mockVnpay.verifyVnpaySignature.mockReturnValueOnce(false);
      mockVnpay.getPaymentResultRedirectUrl.mockReturnValueOnce("http://failed-url");

      const params = { vnp_TxnRef: "ref_123", vnp_ResponseCode: "00", vnp_TransactionStatus: "00" };
      let redirectUrl = await buildVnpayReturnRedirect(params);
      expect(redirectUrl).toBe("http://failed-url");
      expect(mockVnpay.verifyVnpaySignature).toHaveBeenCalledWith(params);

      // 2. Valid signature success case
      mockVnpay.verifyVnpaySignature.mockReturnValueOnce(true);
      mockRepo.findVnpayAttemptByTxnRef.mockResolvedValueOnce({
        payment_attempt_id: "attempt_1",
        invoice_id: "inv_1",
        amount: "50000",
        attempt_status: "pending",
        invoice_status: "unpaid",
        invoice_total_amount: "50000",
        source_type: "grooming",
        source_id: "gt_1",
        source_status: "pending"
      });
      mockVnpay.getPaymentResultRedirectUrl.mockReturnValueOnce("http://success-url?attemptId=attempt_1");

      redirectUrl = await buildVnpayReturnRedirect(params);
      expect(redirectUrl).toBe("http://success-url?attemptId=attempt_1");
      expect(mockRepo.findVnpayAttemptByTxnRef).toHaveBeenCalledWith("ref_123");
    });
  });

  describe("handleVnpayIpn", () => {
    it("UTX-PAYMENTS-358 - handleVnpayIpn checks signature, amount, updates attempt and returns RSP code", async () => {
      const params = {
        vnp_TxnRef: "ref_123",
        vnp_Amount: "5000000",
        vnp_ResponseCode: "00",
        vnp_TransactionStatus: "00",
        vnp_TransactionNo: "trans_123",
        vnp_SecureHash: "hash"
      };

      // 1. Invalid signature case
      mockVnpay.verifyVnpaySignature.mockReturnValueOnce(false);
      let response = await handleVnpayIpn(params);
      expect(response).toEqual({ RspCode: "97", Message: "Invalid signature" });

      // 2. Valid signature, success update case
      mockVnpay.verifyVnpaySignature.mockReturnValueOnce(true);
      mockRepo.applyVnpayIpnUpdate.mockResolvedValueOnce({
        outcome: "updated",
        attempt: { payment_attempt_id: "attempt_1" } as any,
        status: "success"
      });

      response = await handleVnpayIpn(params);
      expect(response).toEqual({ RspCode: "00", Message: "Confirm Success" });
      expect(mockRepo.applyVnpayIpnUpdate).toHaveBeenCalledWith({
        providerTxnRef: "ref_123",
        providerTransactionNo: "trans_123",
        responseCode: "00",
        transactionStatus: "00",
        amount: 5000000,
        isSuccessful: true,
        payload: params
      });
    });
  });
});
