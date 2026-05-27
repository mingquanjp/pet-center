import * as React from "react";

import { ownerInvoicesApi } from "../api/invoices.api";
import { OwnerInvoiceDetail } from "../types/invoice.types";

export function useOwnerInvoiceDetail(invoiceId?: string | null) {
  const [data, setData] = React.useState<OwnerInvoiceDetail | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    if (!invoiceId) {
      setData(undefined);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      const invoice = await ownerInvoicesApi.getDetail(invoiceId);
      setData(invoice);
    } catch (error) {
      console.error("Failed to fetch owner invoice detail:", error);
      setData(undefined);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchDetail();
    });
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    isError,
    refetch: fetchDetail,
  };
}
