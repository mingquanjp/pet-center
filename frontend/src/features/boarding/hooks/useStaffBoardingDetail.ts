import { useState, useEffect, useCallback } from "react";
import { boardingApi } from "../api/boarding.api";
import type { StaffBoardingDetail } from "../types/boarding.types";

export function useStaffBoardingDetail(boardingId: string) {
  const [data, setData] = useState<StaffBoardingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!boardingId) return;
    
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await boardingApi.getStaffBoardingDetail(boardingId);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch boarding detail:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [boardingId]);

  useEffect(() => {
    void Promise.resolve().then(fetchDetail);
  }, [fetchDetail]);

  return { data, isLoading, isError, refetch: fetchDetail };
}
