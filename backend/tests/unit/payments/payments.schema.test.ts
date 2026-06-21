import { describe, expect, it } from "vitest";
import { vnpayCallbackQuerySchema } from "../../../src/modules/payments/payments.schema.js";

describe("payments.schema unit tests", () => {
  describe("vnpayCallbackQuerySchema", () => {
    it("UTX-PAYMENTS-364 - vnpayCallbackQuerySchema parses valid payment query parameters correctly", () => {
      const validPayload = {
        vnp_TxnRef: "20260621120000123456",
        vnp_Amount: "5000000",
        vnp_ResponseCode: "00",
        vnp_TransactionStatus: "00",
        vnp_TransactionNo: "12345678",
        vnp_SecureHash: "abcdef123456",
        vnp_SecureHashType: "SHA512",
        extra_param: "custom_val"
      };

      const result = vnpayCallbackQuerySchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it("UTX-PAYMENTS-365 - vnpayCallbackQuerySchema handles array queries and unknown catchall properties", () => {
      const arrayPayload = {
        vnp_TxnRef: "20260621120000123456",
        vnp_Amount: "5000000",
        extra_list: ["value1", "value2"]
      };

      const result = vnpayCallbackQuerySchema.safeParse(arrayPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extra_list).toEqual(["value1", "value2"]);
      }

      // Invalid parameter type (e.g. number for catchall) should fail because catchall expects union(string, array(string))
      const invalidPayload = {
        extra_number: 123
      };
      const invalidResult = vnpayCallbackQuerySchema.safeParse(invalidPayload);
      expect(invalidResult.success).toBe(false);
    });
  });
});
