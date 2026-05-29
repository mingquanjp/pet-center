import { useState, useEffect, useCallback } from "react";
import { boardingApi } from "../api/boarding.api";
import type { StaffBoardingDraftUpdate } from "../types/boarding.types";

export function useStaffBoardingDraftUpdate(boardingId: string | undefined, enabled: boolean = true) {
  const [data, setData] = useState<StaffBoardingDraftUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchDraft = useCallback(async () => {
    if (!boardingId || !enabled) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await boardingApi.getStaffBoardingDraftUpdate(boardingId);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch draft:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [boardingId, enabled]);

  useEffect(() => {
    void Promise.resolve().then(fetchDraft);
  }, [fetchDraft]);

  return { data, isLoading, isError, hasFetched, refetch: fetchDraft };
}
