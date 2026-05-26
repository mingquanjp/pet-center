import { apiRequest } from "@/lib/api";
import { StaffInvoice, StaffInvoiceFilters } from "../types/invoice.types";

export const staffInvoicesApi = {
  list: async (filters: StaffInvoiceFilters & { cursor?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "ALL") params.append("status", filters.status);
    if (filters.serviceType !== "ALL") params.append("serviceType", filters.serviceType);
    if (filters.timeRange !== "ALL") params.append("timeRange", filters.timeRange);
    if (filters.cursor) params.append("cursor", filters.cursor);
    if (filters.limit) params.append("limit", filters.limit.toString());

    const res = await apiRequest<StaffInvoice[]>(`/staff/invoices?${params.toString()}`);
    return res;
  },
  
  getDetail: async (invoiceId: string) => {
    return await apiRequest<StaffInvoice>(`/staff/invoices/${invoiceId}`);
  },

  confirmPayment: async (invoiceId: string, payload: { paymentMethod: string }) => {
    return await apiRequest<StaffInvoice>(`/staff/invoices/${invoiceId}/confirm-payment`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  cancel: async (invoiceId: string) => {
    return await apiRequest<StaffInvoice>(`/staff/invoices/${invoiceId}/cancel`, {
      method: "PATCH",
    });
  }
};
