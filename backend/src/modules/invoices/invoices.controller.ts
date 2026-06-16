import type { Request, Response } from "express";
import * as invoicesService from "./invoices.service.js";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";

export async function listStaffInvoices(req: Request, res: Response) {
  const result = await invoicesService.listStaffInvoices(req.query);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
}

export async function listOwnerInvoices(req: Request, res: Response) {
  const result = await invoicesService.listOwnerInvoices(req.user!.userId, req.query);
  sendPaginated(res, result.data, result.pagination);
}

export async function getOwnerInvoiceDetail(req: Request, res: Response) {
  const invoiceId = req.params.invoiceId as string;
  const data = await invoicesService.getOwnerInvoiceDetail(invoiceId, req.user!.userId);
  sendSuccess(res, data, "Lấy thông tin hóa đơn thành công");
}

export async function getStaffInvoiceDetail(req: Request, res: Response) {
  const invoiceId = req.params.invoiceId as string;
  const data = await invoicesService.getStaffInvoiceDetail(invoiceId);
  sendSuccess(res, data, "Lấy thông tin hóa đơn thành công");
}

export async function confirmPayment(req: Request, res: Response) {
  const invoiceId = req.params.invoiceId as string;
  const data = await invoicesService.confirmStaffInvoicePayment(invoiceId, req.body);
  sendSuccess(res, data, "Xác nhận thanh toán thành công");
}

export async function cancelInvoice(req: Request, res: Response) {
  const invoiceId = req.params.invoiceId as string;
  const data = await invoicesService.cancelStaffInvoice(invoiceId);
  sendSuccess(res, data, "Đã hủy hóa đơn (chuyển sang trạng thái quá hạn)");
}
