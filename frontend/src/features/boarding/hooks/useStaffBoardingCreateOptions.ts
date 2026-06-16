import { useState, useEffect, useRef, useCallback } from "react";
import { boardingApi } from "../api/boarding.api";
import { StaffBoardingCreateOptions } from "../types/boarding.types";

interface UseStaffBoardingCreateOptionsQuery {
  plannedCheckInAt?: string;
  plannedCheckOutAt?: string;
  plannedCheckInDate?: string;
  plannedCheckOutDate?: string;
  searchOwner?: string;
}

export function useStaffBoardingCreateOptions(query?: UseStaffBoardingCreateOptionsQuery) {
  const [data, setData] = useState<StaffBoardingCreateOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const queryStr = JSON.stringify(query || {});

  const fetchOptions = useCallback((silent = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    boardingApi.getStaffBoardingCreateOptions(query, { signal: abortController.signal })
      .then((options) => {
        setData((prev) => {
          if (!prev) return options;
          return {
            ...prev,
            roomTypes: options.roomTypes
          };
        });
        setError(null);
        if (!silent) setIsLoading(false);
        else setIsRefreshing(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error("useStaffBoardingCreateOptions error:", err);
        setError(err instanceof Error ? err : new Error("Failed to load options"));
        if (!silent) setIsLoading(false);
        else setIsRefreshing(false);
      });
  }, [queryStr]);

  // Initial fetch and when query changes
  useEffect(() => {
    fetchOptions();
    
    // Setup polling every 5s
    const timer = setInterval(() => {
      fetchOptions(true);
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchOptions]);

  // Refetch on tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOptions(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchOptions]);

  return { data, isLoading, isRefreshing, error, refetch: () => fetchOptions(false) };
}

