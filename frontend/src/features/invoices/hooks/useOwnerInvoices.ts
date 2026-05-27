import * as React from "react";

import { ownerInvoicesApi } from "../api/invoices.api";
import { OwnerInvoice, OwnerInvoiceFilters } from "../types/invoice.types";

const OWNER_INVOICE_PAGE_SIZE = 4;

export function mapOwnerInvoiceFiltersToQuery(filters: OwnerInvoiceFilters) {
  return {
    search: filters.search || undefined,
    status: filters.status === "ALL" ? undefined : filters.status,
    serviceType: filters.serviceType === "ALL" ? undefined : filters.serviceType,
    date: filters.date || undefined,
  };
}

export function useOwnerInvoices(filters: OwnerInvoiceFilters, page: number) {
  const [data, setData] = React.useState<OwnerInvoice[]>([]);
  const [pagination, setPagination] = React.useState({
    page,
    pageSize: OWNER_INVOICE_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const response = await ownerInvoicesApi.list({
        ...filters,
        page,
        limit: OWNER_INVOICE_PAGE_SIZE,
      });

      setData(response.data);
      setPagination({
        page: response.pagination.page,
        pageSize: response.pagination.limit,
        totalItems: response.pagination.total,
        totalPages: Math.max(1, response.pagination.totalPages),
      });
    } catch (error) {
      console.error("Failed to fetch owner invoices:", error);
      setIsError(true);
      setData([]);
      setPagination((current) => ({
        ...current,
        page,
        totalItems: 0,
        totalPages: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchInvoices();
    });
  }, [fetchInvoices]);

  return {
    data,
    pagination,
    isLoading,
    isError,
    refetch: fetchInvoices,
  };
}
