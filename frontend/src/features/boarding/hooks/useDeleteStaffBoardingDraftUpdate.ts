import { useState } from "react";
import { boardingApi } from "../api/boarding.api";

export function useDeleteStaffBoardingDraftUpdate() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    boardingId: string,
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    try {
      setIsPending(true);
      await boardingApi.deleteStaffBoardingDraftUpdate(boardingId);
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
