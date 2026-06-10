import * as repo from "./invoices.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { notifyPaymentSuccess } from "../notifications/notification-events.js";
import { mapInvoiceStatus, mapOwnerInvoiceStatus, getOwnerInvoiceNote, mapPaymentOption } from "./invoice-status.mapper.js";
import { mapServiceType } from "./invoice-service-type.mapper.js";

function mapServiceName(source: string | null): string {
  if (!source) return "Khác";
  if (source === "medical_exam") return "Khám bệnh";
  if (source === "grooming") return "Spa & Cắt tỉa";
  if (source === "boarding") return "Lưu trú";
  if (source === "prescription") return "Đơn thuốc";
  return "Khác";
}

export async function listStaffInvoices(filters: any) {
  const limit = filters.limit ? Number(filters.limit) : 10;
  // +1 to check if there is a next page
  const rows = await repo.getStaffInvoicesList({ ...filters, limit: limit + 1 });

  const hasMore = rows.length > limit;
  const dataRows = hasMore ? rows.slice(0, limit) : rows;

  const data = dataRows.map((row) => ({
    id: row.id,
    invoiceCode: row.invoice_code,
    title: row.first_line_desc || "Hóa đơn dịch vụ",
    pet: {
      id: row.pet_id,
      name: row.pet_name,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
    },
    serviceType: mapServiceType(row.first_line_source),
    serviceName: mapServiceName(row.first_line_source),
    serviceDate: row.service_time ? new Date(row.service_time).toISOString().split("T")[0] : undefined,
    issuedAt: new Date(row.issued_at).toISOString().split("T")[0],
    paymentOption: mapPaymentOption(row.payment_option),
    paymentStatus: mapInvoiceStatus(row.invoice_status, row.payment_due_at, row.payment_option),
    invoiceStatus: mapInvoiceStatus(row.invoice_status, row.payment_due_at, row.payment_option),
    totalAmount: Number(row.total_amount),
    currency: "VND",
  }));

  return {
    data,
    pagination: {
      nextCursor: hasMore ? dataRows[dataRows.length - 1].id : null,
      hasMore,
      limit,
    },
  };
}

export async function listOwnerInvoices(ownerUserId: string, filters: any) {
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 4;

  const { rows, total } = await repo.getOwnerInvoicesList(ownerUserId, {
    ...filters,
    page,
    limit,
  });

  const data = rows.map((row) => {
    const status = mapOwnerInvoiceStatus(
      row.invoice_status,
      row.payment_due_at,
      row.paid_at
    );

    return {
      id: row.id,
      invoiceCode: row.invoice_code,
      title: row.first_line_desc || "Hóa đơn dịch vụ",
      pet: {
        id: row.pet_id,
        name: row.pet_name,
      },
      serviceType: mapServiceType(row.first_line_source),
      serviceName: mapServiceName(row.first_line_source),
      issuedAt: new Date(row.issued_at).toISOString().split("T")[0],
      paymentOption: mapPaymentOption(row.payment_option),
      paymentStatus: status,
      invoiceStatus: status,
      totalAmount: Number(row.total_amount),
      currency: "VND",
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOwnerInvoiceDetail(invoiceId: string, ownerUserId: string) {
  const row = await repo.getOwnerInvoiceDetail(invoiceId, ownerUserId);
  if (!row) {
    throw new AppError("Không tìm thấy hóa đơn", "NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const lines = await repo.getInvoiceLines(invoiceId);
  const firstLine = lines[0];
  const status = mapOwnerInvoiceStatus(row.invoice_status, row.payment_due_at, row.paid_at);

  return {
    id: row.id,
    invoiceCode: row.invoice_code,
    title: firstLine?.description || "Hóa đơn dịch vụ",
    serviceType: mapServiceType(firstLine?.service_type ?? null),
    serviceName: firstLine?.description || mapServiceName(firstLine?.service_type ?? null),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
    },
    issuedAt: new Date(row.issued_at).toISOString().split("T")[0],
    paymentOption: mapPaymentOption(row.payment_option),
    paymentStatus: status,
    invoiceStatus: status,
    subtotalAmount: Number(row.subtotal_amount),
    discountAmount: Number(row.discount_amount),
    surchargeAmount: Number(row.surcharge_amount),
    totalAmount: Number(row.total_amount),
    currency: "VND",
    note: getOwnerInvoiceNote(status),
  };
}

export async function getStaffInvoiceDetail(invoiceId: string) {
  const row = await repo.getInvoiceDetail(invoiceId);
  if (!row) {
    throw new AppError("Không tìm thấy hóa đơn", "NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const lines = await repo.getInvoiceLines(invoiceId);

  const status = mapInvoiceStatus(row.invoice_status, row.payment_due_at, row.payment_option);

  return {
    id: row.id,
    invoiceCode: row.invoice_code,
    title: lines[0]?.description || "Hóa đơn dịch vụ",
    invoiceStatus: status,
    paymentStatus: status,
    paymentOption: mapPaymentOption(row.payment_option),
    issuedAt: new Date(row.issued_at).toISOString().split("T")[0],
    paymentDueAt: row.payment_due_at ? new Date(row.payment_due_at).toISOString() : null,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
    },
    lines: lines.map((l) => ({
      id: l.id,
      description: l.description,
      serviceType: mapServiceType(l.service_type),
      quantity: l.quantity,
      unitPrice: Number(l.unit_price),
      discountAmount: Number(l.discount_amount),
      lineAmount: Number(l.line_amount),
    })),
    subtotalAmount: Number(row.subtotal_amount),
    discountAmount: Number(row.discount_amount),
    surchargeAmount: Number(row.surcharge_amount),
    totalAmount: Number(row.total_amount),
    currency: "VND",
  };
}

export async function confirmStaffInvoicePayment(invoiceId: string, payload: { paymentMethod: string }) {
  const row = await repo.getInvoiceDetail(invoiceId);
  if (!row) {
    throw new AppError("Không tìm thấy hóa đơn", "NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (row.invoice_status === "paid") {
    throw new AppError("Hóa đơn đã được thanh toán", "CONFLICT", httpStatus.CONFLICT);
  }

  if (row.invoice_status !== "pending_payment") {
    throw new AppError("Hóa đơn không ở trạng thái chờ thanh toán", "BAD_REQUEST", httpStatus.BAD_REQUEST);
  }

  if (row.payment_option !== "counter") {
    throw new AppError("Chỉ có thể xác nhận thanh toán cho hóa đơn thanh toán tại quầy", "BAD_REQUEST", httpStatus.BAD_REQUEST);
  }

  const paymentId = await repo.confirmPayment(invoiceId, payload.paymentMethod, Number(row.total_amount));

  notifyPaymentSuccess(paymentId).catch(console.error);

  return await getStaffInvoiceDetail(invoiceId);
}

export async function cancelStaffInvoice(invoiceId: string) {
  const row = await repo.getInvoiceDetail(invoiceId);
  if (!row) {
    throw new AppError("Không tìm thấy hóa đơn", "NOT_FOUND", httpStatus.NOT_FOUND);
  }

  if (row.invoice_status === "paid" || row.payment_option === "online") {
    throw new AppError("Không thể hủy hóa đơn đã thanh toán", "CONFLICT", httpStatus.CONFLICT);
  }
  
  if (row.invoice_status === "cancelled") {
    throw new AppError("Hóa đơn đã bị hủy trước đó", "CONFLICT", httpStatus.CONFLICT);
  }

  await repo.markInvoiceOverdue(invoiceId);

  return await getStaffInvoiceDetail(invoiceId);
}
