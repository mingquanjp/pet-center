import { useState } from "react";
import { boardingApi } from "../api/boarding.api";

export function useRejectStaffBoarding() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    { boardingId, rejectionReason, internalNote }: { boardingId: string; rejectionReason: string; internalNote?: string },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    try {
      setIsPending(true);
      await boardingApi.rejectStaffBoarding(boardingId, { rejectionReason, internalNote });
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
