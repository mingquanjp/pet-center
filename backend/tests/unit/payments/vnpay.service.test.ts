import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildVnpayPaymentUrl,
  verifyVnpaySignature,
  getPaymentResultRedirectUrl
} from "../../../src/modules/payments/vnpay.service.js";
import { env } from "../../../src/config/env.js";

// Mock env
vi.mock("../../../src/config/env.js", () => ({
  env: {
    VNPAY_PAYMENT_URL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    VNPAY_TMN_CODE: "TMN123",
    VNPAY_HASH_SECRET: "SECRETKEY",
    VNPAY_RETURN_URL: "http://localhost:3000/payment-return",
    VNPAY_IPN_URL: "http://localhost:8080/api/v1/payments/vnpay-ipn",
    VNPAY_PAYMENT_EXPIRE_MINUTES: 15,
    FRONTEND_URL: "http://localhost:3000",
    FRONTEND_BASE_URL: "http://localhost:3000"
  }
}));

describe("vnpay.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.VNPAY_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    env.VNPAY_TMN_CODE = "TMN123";
    env.VNPAY_HASH_SECRET = "SECRETKEY";
    env.VNPAY_RETURN_URL = "http://localhost:3000/payment-return";
    env.VNPAY_IPN_URL = "http://localhost:8080/api/v1/payments/vnpay-ipn";
    env.VNPAY_PAYMENT_EXPIRE_MINUTES = 15;
    env.FRONTEND_BASE_URL = "http://localhost:3000";
  });

  describe("buildVnpayPaymentUrl", () => {
    it("UTX-PAYMENTS-359 - buildVnpayPaymentUrl constructs valid payment URL with secure signature", () => {
      const mockDate = new Date("2026-06-21T12:00:00.000+07:00");
      const input = {
        txnRef: "ref_123",
        amount: 50000,
        orderInfo: "Thanh toan đơn hàng",
        clientIp: "127.0.0.1",
        createdAt: mockDate
      };

      const result = buildVnpayPaymentUrl(input);

      expect(result.paymentUrl).toContain("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
      expect(result.paymentUrl).toContain("vnp_Amount=5000000"); // Amount * 100
      expect(result.paymentUrl).toContain("vnp_TxnRef=ref_123");
      expect(result.paymentUrl).toContain("vnp_SecureHash=");
      expect(result.expiresAt.getTime()).toBe(mockDate.getTime() + 15 * 60 * 1000);
    });

    it("buildVnpayPaymentUrl throws error if config is missing", () => {
      env.VNPAY_TMN_CODE = "";
      expect(() => buildVnpayPaymentUrl({
        txnRef: "ref_123",
        amount: 50000,
        orderInfo: "Thanh toan",
        clientIp: "127.0.0.1"
      })).toThrow("VNPAY_CONFIGURATION_MISSING");
    });
  });

  describe("verifyVnpaySignature", () => {
    it("UTX-PAYMENTS-360 - verifyVnpaySignature returns true when signature matches payload", () => {
      const mockParams = {
        vnp_Amount: "5000000",
        vnp_Command: "pay",
        vnp_TmnCode: "TMN123",
        vnp_TxnRef: "ref_123",
        // Valid mock signature generated under SECRETKEY
        vnp_SecureHash: "28445ab0d765270fdeeaceaca9e1f6652987e11cc9e61ed05ad1690fbc696ddaf0cda32852b5f3f1b8cf9ddfa93fc25e36a603aacb79d4f343abaeaec57595ad"
      };

      const isValid = verifyVnpaySignature(mockParams);
      expect(isValid).toBe(true);
    });

    it("UTX-PAYMENTS-361 - verifyVnpaySignature returns false when signature is invalid or missing", () => {
      const mockParams = {
        vnp_Amount: "5000000",
        vnp_SecureHash: "invalidhash"
      };

      const isValid = verifyVnpaySignature(mockParams);
      expect(isValid).toBe(false);

      const missingParams = {
        vnp_Amount: "5000000"
      };
      expect(verifyVnpaySignature(missingParams)).toBe(false);
    });
  });

  describe("getPaymentResultRedirectUrl", () => {
    it("UTX-PAYMENTS-362 - getPaymentResultRedirectUrl constructs success redirect URL with attempt ID", () => {
      const url = getPaymentResultRedirectUrl("success", "attempt_123");
      expect(url).toBe("http://localhost:3000/owner/payment/result?status=success&attemptId=attempt_123");
    });

    it("UTX-PAYMENTS-363 - getPaymentResultRedirectUrl constructs failed redirect URL without attempt ID", () => {
      const url = getPaymentResultRedirectUrl("failed", null);
      expect(url).toBe("http://localhost:3000/owner/payment/result?status=failed");
    });
  });
});
