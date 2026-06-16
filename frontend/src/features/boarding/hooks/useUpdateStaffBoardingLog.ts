import { useRef, useState } from "react";
import { boardingApi } from "../api/boarding.api";

export function useUpdateStaffBoardingLog() {
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  const mutate = async (
    { boardingId, description, alertLevel, visibilityStatus, attachmentUrl, attachmentUrls }: {
      boardingId: string;
      description: string;
      alertLevel?: string;
      visibilityStatus?: string;
      attachmentUrl?: string | null;
      attachmentUrls?: string[];
    },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    if (pendingRef.current) return;

    try {
      pendingRef.current = true;
      setIsPending(true);
      await boardingApi.updateStaffBoardingLog(boardingId, {
        description,
        alertLevel,
        visibilityStatus,
        attachmentUrl,
        attachmentUrls
      });
      options?.onSuccess?.();
    } catch (err) {
      options?.onError?.(err);
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
