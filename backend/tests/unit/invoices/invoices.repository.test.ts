import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  getStaffInvoicesList,
  getOwnerInvoicesList,
  getOwnerInvoiceDetail,
  getInvoiceDetail
} from "../../../src/modules/invoices/invoices.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("invoices.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStaffInvoicesList", () => {
    it("UTX-INVOICES-278 - getStaffInvoicesList generates parameterized query and filters correctly", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            id: "inv_1",
            invoice_code: "inv_1",
            issued_at: "2026-06-20T00:00:00.000Z",
            payment_option: "counter",
            invoice_status: "pending_payment",
            total_amount: "500000",
            pet_id: "pet_1",
            pet_name: "Milu",
            owner_id: "user_owner",
            owner_name: "Nguyễn Văn A"
          }
        ]
      } as any);

      const result = await getStaffInvoicesList({
        search: "Nguyễn Văn A",
        status: "PENDING_PAYMENT",
        paymentOption: "ONLINE",
        timeRange: "TODAY",
        serviceType: "GROOMING",
        limit: 10
      });

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("FROM pet_center.invoices i");
      expect(sql).toContain("ILIKE");
      expect(sql).toContain("i.invoice_status = 'pending_payment'");
      expect(sql).toContain("i.payment_option =");
      expect(sql).toContain("i.issued_at::date = CURRENT_DATE");
      expect(sql).toContain("LIMIT");

      expect(params).toContain("%Nguyễn Văn A%");
      expect(params).toContain("online");
      expect(params).toContain("grooming");
      expect(params).toContain(10);

      expect(result).toHaveLength(1);
    });

    it("UTX-INVOICES-279 - getStaffInvoicesList handles database error correctly", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(getStaffInvoicesList({})).rejects.toThrow("Query failed");
    });
  });

  describe("getOwnerInvoicesList", () => {
    it("UTX-INVOICES-280 - getOwnerInvoicesList fetches total count and list with parameters", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ total: "5" }]
        } as any)
        .mockResolvedValueOnce({
          rows: [{ id: "inv_1", invoice_code: "inv_1", total_amount: "100000" }]
        } as any);

      const result = await getOwnerInvoicesList("user_owner", {
        search: "Milu",
        status: "PAID",
        serviceType: "MEDICAL",
        date: "2026-06-20",
        page: 2,
        limit: 5
      });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      const [countSql, countParams] = mockQuery.mock.calls[0];
      const [listSql, listParams] = mockQuery.mock.calls[1];

      expect(countSql).toContain("SELECT COUNT(*)::text AS total");
      expect(listSql).toContain("LIMIT");
      expect(listSql).toContain("OFFSET");

      expect(countParams).toContain("user_owner");
      expect(countParams).toContain("%Milu%");
      expect(countParams).toContain("medical_exam");
      expect(countParams).toContain("2026-06-20");

      expect(listParams).toContain(5); // limit
      expect(listParams).toContain(5); // offset = (2-1)*5

      expect(result.total).toBe(5);
      expect(result.rows).toHaveLength(1);
    });

    it("UTX-INVOICES-281 - getOwnerInvoicesList handles errors or empty results", async () => {
      mockQuery.mockRejectedValue(new Error("List failed"));

      await expect(getOwnerInvoicesList("user_owner", { page: 1, limit: 5 })).rejects.toThrow("List failed");
    });
  });

  describe("getOwnerInvoiceDetail", () => {
    it("UTX-INVOICES-282 - getOwnerInvoiceDetail generates parameterized query and returns matched row", async () => {
      const mockDetail = {
        id: "inv_1",
        invoice_code: "inv_1",
        total_amount: "500000"
      };

      mockQuery.mockResolvedValue({
        rows: [mockDetail]
      } as any);

      const result = await getOwnerInvoiceDetail("inv_1", "user_owner");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("i.invoice_id = $1");
      expect(sql).toContain("i.owner_user_id = $2");
      expect(params).toEqual(["inv_1", "user_owner"]);
      expect(result).toEqual(mockDetail);
    });

    it("UTX-INVOICES-283 - getOwnerInvoiceDetail returns undefined or handles query failure", async () => {
      // Empty result
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await getOwnerInvoiceDetail("inv_invalid", "user_owner");
      expect(result).toBeUndefined();

      // DB error
      mockQuery.mockRejectedValue(new Error("Detail failed"));
      await expect(getOwnerInvoiceDetail("inv_1", "user_owner")).rejects.toThrow("Detail failed");
    });
  });

  describe("getInvoiceDetail", () => {
    it("UTX-INVOICES-284 - getInvoiceDetail generates parameterized query by invoice ID", async () => {
      const mockDetail = {
        id: "inv_1",
        invoice_code: "inv_1",
        total_amount: "500000"
      };

      mockQuery.mockResolvedValue({
        rows: [mockDetail]
      } as any);

      const result = await getInvoiceDetail("inv_1");

      expect(mockQuery).toHaveBeenCalled();
      const [sql, params] = mockQuery.mock.calls[0];

      expect(sql).toContain("i.invoice_id = $1");
      expect(params).toEqual(["inv_1"]);
      expect(result).toEqual(mockDetail);
    });

    it("UTX-INVOICES-285 - getInvoiceDetail returns undefined or handles query failure", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);
      const result = await getInvoiceDetail("inv_invalid");
      expect(result).toBeUndefined();
    });
  });
});
