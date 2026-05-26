import { useState } from "react";
import { staffInvoicesApi } from "../api/invoices.api";

export function useCancelStaffInvoice() {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (invoiceId: string) => {
    try {
      setIsMutating(true);
      setError(null);
      const res = await staffInvoicesApi.cancel(invoiceId);
      return res.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    mutateAsync,
    isMutating,
    error,
  };
}
