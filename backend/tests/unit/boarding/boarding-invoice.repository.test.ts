import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import {
  createBoardingInvoice,
  createBoardingInvoiceLine,
  createBoardingPayment
} from "../../../src/modules/boarding/boarding-invoice.repository.js";

describe("boarding-invoice.repository unit tests", () => {
  let mockClient: PoolClient;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
    } as any;
  });

  describe("createBoardingInvoice", () => {
    it("UTX-BOARDING-127 - createBoardingInvoice generates correct SQL query and parameters", async () => {
      await createBoardingInvoice({
        invoiceId: "inv_1",
        ownerId: "own_1",
        petId: "pet_1",
        totalAmount: 500000
      }, mockClient);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO pet_center.invoices"),
        ["inv_1", "own_1", "pet_1", 500000]
      );
    });

    it("UTX-BOARDING-128 - createBoardingInvoice handles error when query fails", async () => {
      vi.mocked(mockClient.query).mockRejectedValue(new Error("Database error"));

      await expect(createBoardingInvoice({
        invoiceId: "inv_1",
        ownerId: "own_1",
        petId: "pet_1",
        totalAmount: 500000
      }, mockClient)).rejects.toThrow("Database error");
    });
  });

  describe("createBoardingInvoiceLine", () => {
    const params = {
      invoiceLineId: "line_1",
      invoiceId: "inv_1",
      boardingRecordId: "rec_1",
      description: "Deluxe stay",
      quantity: 2,
      unitPrice: 250000,
      lineAmount: 500000
    };

    it("UTX-BOARDING-129 - createBoardingInvoiceLine generates correct SQL query and parameters", async () => {
      await createBoardingInvoiceLine(params, mockClient);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO pet_center.invoice_lines"),
        ["line_1", "inv_1", "rec_1", "Deluxe stay", 2, 250000, 500000]
      );
    });

    it("UTX-BOARDING-130 - createBoardingInvoiceLine handles error when query fails", async () => {
      vi.mocked(mockClient.query).mockRejectedValue(new Error("Database error"));

      await expect(createBoardingInvoiceLine(params, mockClient)).rejects.toThrow("Database error");
    });
  });

  describe("createBoardingPayment", () => {
    it("UTX-BOARDING-131 - createBoardingPayment generates correct SQL query and parameters", async () => {
      await createBoardingPayment({
        paymentId: "pay_1",
        invoiceId: "inv_1",
        paidAmount: 500000
      }, mockClient);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO pet_center.payments"),
        ["pay_1", "inv_1", 500000]
      );
    });

    it("UTX-BOARDING-132 - createBoardingPayment handles error when query fails", async () => {
      vi.mocked(mockClient.query).mockRejectedValue(new Error("Database error"));

      await expect(createBoardingPayment({
        paymentId: "pay_1",
        invoiceId: "inv_1",
        paidAmount: 500000
      }, mockClient)).rejects.toThrow("Database error");
    });
  });
});
