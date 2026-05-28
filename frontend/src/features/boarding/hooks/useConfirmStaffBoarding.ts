import { useState } from "react";
import { boardingApi } from "../api/boarding.api";

export function useConfirmStaffBoarding() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    { boardingId, payload }: { boardingId: string; payload?: { internalNote?: string } },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    try {
      setIsPending(true);
      await boardingApi.confirmStaffBoarding(boardingId, payload || {});
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
