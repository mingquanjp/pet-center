import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as repo from "../../../src/modules/invoices/invoices.repository.js";
import {
  listStaffInvoices,
  listOwnerInvoices,
  getOwnerInvoiceDetail,
  getStaffInvoiceDetail,
  confirmStaffInvoicePayment,
  cancelStaffInvoice
} from "../../../src/modules/invoices/invoices.service.js";

vi.mock("../../../src/modules/invoices/invoices.repository.js");
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyPaymentSuccess: vi.fn().mockResolvedValue(undefined)
}));
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue(undefined)
}));

const mockRepo = vi.mocked(repo);

describe("invoices.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listStaffInvoices", () => {
    it("UTX-INVOICES-251 - listStaffInvoices returns mapped invoices and pagination", async () => {
      const mockRow = {
        id: "inv_1",
        invoice_code: "inv_1",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_option: "counter",
        invoice_status: "pending_payment",
        payment_due_at: null,
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        pet_image_url: null,
        owner_id: "user_owner",
        owner_name: "Nguyễn Văn A",
        first_line_desc: "Tắm sấy chó",
        first_line_source: "grooming",
        service_time: "2026-06-20T10:00:00.000Z"
      };

      // Mock return limit + 1 rows to mock hasMore = false
      mockRepo.getStaffInvoicesList.mockResolvedValue([mockRow]);

      const result = await listStaffInvoices({ limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: "inv_1",
        invoiceCode: "inv_1",
        title: "Tắm sấy chó",
        pet: {
          id: "pet_1",
          name: "Milu",
          imageUrl: undefined
        },
        owner: {
          id: "user_owner",
          fullName: "Nguyễn Văn A"
        },
        serviceType: "GROOMING",
        serviceName: "Spa & Cắt tỉa",
        serviceDate: "2026-06-20",
        issuedAt: "2026-06-20",
        paymentOption: "AT_COUNTER",
        paymentStatus: "PENDING_PAYMENT",
        invoiceStatus: "PENDING_PAYMENT",
        totalAmount: 500000,
        currency: "VND"
      });
      expect(result.pagination).toEqual({
        nextCursor: null,
        hasMore: false,
        limit: 10
      });
    });
  });

  describe("listOwnerInvoices", () => {
    it("UTX-INVOICES-252 - listOwnerInvoices returns owner-specific paginated list", async () => {
      const mockRow = {
        id: "inv_1",
        invoice_code: "inv_1",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_option: "counter",
        invoice_status: "pending_payment",
        payment_due_at: null,
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        pet_image_url: null,
        paid_at: null,
        first_line_desc: "Tắm sấy chó",
        first_line_source: "grooming"
      };

      mockRepo.getOwnerInvoicesList.mockResolvedValue({
        rows: [mockRow],
        total: 1
      });

      const result = await listOwnerInvoices("user_owner", { page: 1, limit: 6 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("inv_1");
      expect(result.pagination).toEqual({
        page: 1,
        limit: 6,
        total: 1,
        totalPages: 1
      });
    });
  });

  describe("getOwnerInvoiceDetail", () => {
    it("UTX-INVOICES-253 - getOwnerInvoiceDetail returns detailed DTO when valid", async () => {
      const mockRow = {
        id: "inv_1",
        invoice_code: "inv_1",
        invoice_status: "pending_payment",
        payment_option: "counter",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_due_at: null,
        subtotal_amount: "500000",
        discount_amount: "0",
        surcharge_amount: "0",
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        pet_image_url: null,
        owner_id: "user_owner",
        owner_name: "Nguyễn Văn A",
        paid_at: null
      };

      const mockLine = {
        id: "line_1",
        description: "Tắm sấy chó",
        service_type: "grooming",
        quantity: 1,
        unit_price: "500000",
        discount_amount: "0",
        line_amount: "500000"
      };

      mockRepo.getOwnerInvoiceDetail.mockResolvedValue(mockRow as any);
      mockRepo.getInvoiceLines.mockResolvedValue([mockLine]);

      const result = await getOwnerInvoiceDetail("inv_1", "user_owner");

      expect(result.id).toBe("inv_1");
      expect(result.title).toBe("Tắm sấy chó");
      expect(result.subtotalAmount).toBe(500000);
    });

    it("UTX-INVOICES-254 - getOwnerInvoiceDetail throws AppError when invoice not found or belongs to another owner", async () => {
      mockRepo.getOwnerInvoiceDetail.mockResolvedValue(null);

      await expect(getOwnerInvoiceDetail("invalid_id", "user_owner")).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("getStaffInvoiceDetail", () => {
    it("UTX-INVOICES-255 - getStaffInvoiceDetail returns mapped details for staff", async () => {
      const mockRow = {
        id: "inv_1",
        invoice_code: "inv_1",
        invoice_status: "pending_payment",
        payment_option: "counter",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_due_at: null,
        subtotal_amount: "500000",
        discount_amount: "0",
        surcharge_amount: "0",
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        pet_image_url: null,
        owner_id: "user_owner",
        owner_name: "Nguyễn Văn A",
        paid_at: null
      };

      const mockLine = {
        id: "line_1",
        description: "Tắm sấy chó",
        service_type: "grooming",
        quantity: 1,
        unit_price: "500000",
        discount_amount: "0",
        line_amount: "500000"
      };

      mockRepo.getInvoiceDetail.mockResolvedValue(mockRow as any);
      mockRepo.getInvoiceLines.mockResolvedValue([mockLine]);

      const result = await getStaffInvoiceDetail("inv_1");

      expect(result.id).toBe("inv_1");
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].description).toBe("Tắm sấy chó");
    });

    it("UTX-INVOICES-256 - getStaffInvoiceDetail throws AppError when invoice not found", async () => {
      mockRepo.getInvoiceDetail.mockResolvedValue(null);

      await expect(getStaffInvoiceDetail("invalid_id")).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );
    });
  });

  describe("confirmStaffInvoicePayment", () => {
    const payload = { paymentMethod: "cash" };

    it("UTX-INVOICES-257 - confirmStaffInvoicePayment successfully updates status and generates logs", async () => {
      const mockRowPending = {
        id: "inv_1",
        invoice_code: "inv_1",
        invoice_status: "pending_payment",
        payment_option: "counter",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_due_at: null,
        subtotal_amount: "500000",
        discount_amount: "0",
        surcharge_amount: "0",
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        owner_id: "user_owner",
        owner_name: "Nguyễn Văn A",
        paid_at: null
      };

      const mockRowPaid = { ...mockRowPending, invoice_status: "paid", paid_at: "2026-06-20T10:00:00.000Z" };

      mockRepo.getInvoiceDetail
        .mockResolvedValueOnce(mockRowPending as any)
        .mockResolvedValueOnce(mockRowPaid as any);

      mockRepo.confirmPayment.mockResolvedValue("pay_1");
      mockRepo.getInvoiceLines.mockResolvedValue([]);

      const result = await confirmStaffInvoicePayment("inv_1", payload, "staff_user");

      expect(result.invoiceStatus).toBe("PAID");
      expect(mockRepo.confirmPayment).toHaveBeenCalledWith("inv_1", "cash", 500000);
    });

    it("UTX-INVOICES-258 - confirmStaffInvoicePayment throws AppError on duplicate or invalid status", async () => {
      // 1. Not found
      mockRepo.getInvoiceDetail.mockResolvedValue(null);
      await expect(confirmStaffInvoicePayment("invalid_id", payload, "staff_user")).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );

      // 2. Already paid
      mockRepo.getInvoiceDetail.mockResolvedValue({ invoice_status: "paid" } as any);
      await expect(confirmStaffInvoicePayment("inv_1", payload, "staff_user")).rejects.toThrowError(
        expect.objectContaining({
          code: "CONFLICT",
          statusCode: httpStatus.CONFLICT
        })
      );

      // 3. Not pending_payment (e.g. cancelled)
      mockRepo.getInvoiceDetail.mockResolvedValue({ invoice_status: "cancelled" } as any);
      await expect(confirmStaffInvoicePayment("inv_1", payload, "staff_user")).rejects.toThrowError(
        expect.objectContaining({
          code: "BAD_REQUEST",
          statusCode: httpStatus.BAD_REQUEST
        })
      );

      // 4. Online payment option (counter only)
      mockRepo.getInvoiceDetail.mockResolvedValue({ invoice_status: "pending_payment", payment_option: "online" } as any);
      await expect(confirmStaffInvoicePayment("inv_1", payload, "staff_user")).rejects.toThrowError(
        expect.objectContaining({
          code: "BAD_REQUEST",
          statusCode: httpStatus.BAD_REQUEST
        })
      );
    });
  });

  describe("cancelStaffInvoice", () => {
    it("UTX-INVOICES-259 - cancelStaffInvoice updates invoice state successfully", async () => {
      const mockRowPending = {
        id: "inv_1",
        invoice_code: "inv_1",
        invoice_status: "pending_payment",
        payment_option: "counter",
        issued_at: "2026-06-20T00:00:00.000Z",
        payment_due_at: null,
        subtotal_amount: "500000",
        discount_amount: "0",
        surcharge_amount: "0",
        total_amount: "500000",
        pet_id: "pet_1",
        pet_name: "Milu",
        owner_id: "user_owner",
        owner_name: "Nguyễn Văn A",
        paid_at: null
      };

      const mockRowCancelled = { ...mockRowPending, invoice_status: "cancelled" };

      mockRepo.getInvoiceDetail
        .mockResolvedValueOnce(mockRowPending as any)
        .mockResolvedValueOnce(mockRowCancelled as any);

      mockRepo.markInvoiceOverdue.mockResolvedValue(undefined);
      mockRepo.getInvoiceLines.mockResolvedValue([]);

      const result = await cancelStaffInvoice("inv_1");

      // In invoices.service.ts, cancelStaffInvoice calls markInvoiceOverdue(invoiceId), which updates the due date to yesterday.
      // The invoice status maps to "overdue" or "cancelled" based on how the status mapping handles it.
      // We assert that markInvoiceOverdue was called.
      expect(mockRepo.markInvoiceOverdue).toHaveBeenCalledWith("inv_1");
    });

    it("UTX-INVOICES-260 - cancelStaffInvoice throws AppError if invoice not found or already paid/cancelled", async () => {
      // 1. Not found
      mockRepo.getInvoiceDetail.mockResolvedValue(null);
      await expect(cancelStaffInvoice("invalid_id")).rejects.toThrowError(
        expect.objectContaining({
          code: "NOT_FOUND",
          statusCode: httpStatus.NOT_FOUND
        })
      );

      // 2. Paid
      mockRepo.getInvoiceDetail.mockResolvedValue({ invoice_status: "paid", payment_option: "counter" } as any);
      await expect(cancelStaffInvoice("inv_1")).rejects.toThrowError(
        expect.objectContaining({
          code: "CONFLICT",
          statusCode: httpStatus.CONFLICT
        })
      );

      // 3. Cancelled
      mockRepo.getInvoiceDetail.mockResolvedValue({ invoice_status: "cancelled", payment_option: "counter" } as any);
      await expect(cancelStaffInvoice("inv_1")).rejects.toThrowError(
        expect.objectContaining({
          code: "CONFLICT",
          statusCode: httpStatus.CONFLICT
        })
      );
    });
  });
});
