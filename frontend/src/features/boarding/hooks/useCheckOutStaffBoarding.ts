import { useState } from "react";
import { boardingApi } from "../api/boarding.api";

export function useCheckOutStaffBoarding() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    { boardingId, payload }: { boardingId: string; payload?: { internalNote?: string; finalAmount?: number } },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    try {
      setIsPending(true);
      await boardingApi.checkOutStaffBoarding(boardingId, payload || {});
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
