import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { app } from "../../../src/app.js";

// Mock signature verification to always succeed in integration tests
vi.mock("../../../src/modules/payments/vnpay.service.js", async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    verifyVnpaySignature: () => true,
    getPaymentResultRedirectUrl: (status: string, attemptId: string | null) => 
      `http://localhost:3000/payment-result?status=${status}&attemptId=${attemptId}`
  };
});

describe("payments validation and errors integration", () => {
  it("INTX-PAYMENTS-272 - GET /payments/vnpay/return rejects invalid query formats", async () => {
    const response = await request(app)
      .get("/api/v1/payments/vnpay/return")
      .query({
        vnp_Amount: ["10000000", "20000000"] // Array is not allowed by vnp_Amount schema
      });
    expect(response.status).toBe(400);
  });

  it("INTX-PAYMENTS-274 - GET /payments/vnpay/ipn rejects invalid query formats", async () => {
    const response = await request(app)
      .get("/api/v1/payments/vnpay/ipn")
      .query({
        vnp_Amount: ["10000000", "20000000"] // Array is not allowed by vnp_Amount schema
      });
    expect(response.status).toBe(400);
  });
});
