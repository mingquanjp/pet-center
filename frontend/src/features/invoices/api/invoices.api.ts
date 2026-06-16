import { apiRequest } from "@/lib/api";
import {
  OwnerInvoice,
  OwnerInvoiceDetail,
  OwnerInvoiceFilters,
  StaffInvoice,
  StaffInvoiceFilters,
} from "../types/invoice.types";

type OwnerInvoicesListParams = OwnerInvoiceFilters & {
  page: number;
  limit: number;
};

type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

export const ownerInvoicesApi = {
  list: async (filters: OwnerInvoicesListParams) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "ALL") params.append("status", filters.status);
    if (filters.serviceType !== "ALL") params.append("serviceType", filters.serviceType);
    if (filters.date) params.append("date", filters.date);
    params.append("page", filters.page.toString());
    params.append("limit", filters.limit.toString());

    const res = await apiRequest<OwnerInvoice[]>(`/owner/invoices?${params.toString()}`);

    return {
      data: res.data,
      pagination: (res.pagination ?? {
        page: filters.page,
        limit: filters.limit,
        total: res.data.length,
        totalPages: res.data.length > 0 ? 1 : 0,
      }) as ApiPagination,
    };
  },

  getDetail: async (invoiceId: string) => {
    const res = await apiRequest<OwnerInvoiceDetail>(
      `/owner/invoices/${encodeURIComponent(invoiceId)}`
    );
    return res.data;
  },
};
