import { useState } from "react";
import { staffInvoicesApi } from "../api/invoices.api";

export function useConfirmStaffInvoicePayment() {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async ({ invoiceId, paymentMethod }: { invoiceId: string; paymentMethod: string }) => {
    try {
      setIsMutating(true);
      setError(null);
      const res = await staffInvoicesApi.confirmPayment(invoiceId, { paymentMethod });
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
