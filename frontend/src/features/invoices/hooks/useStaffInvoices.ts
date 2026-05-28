import { useState, useEffect, useCallback, useRef } from "react";
import { StaffInvoiceFilters, StaffInvoicesResult, StaffInvoice } from "../types/invoice.types";
import { staffInvoicesApi } from "../api/invoices.api";

type CursorPagination = {
  nextCursor?: string | null;
  hasMore?: boolean;
};

export function useStaffInvoices(filters: StaffInvoiceFilters): StaffInvoicesResult & { 
  refetch: () => void;
  updateInvoice: (id: string, updates: Partial<StaffInvoice>) => void;
  isInitialLoading: boolean;
} {
  const [data, setData] = useState<StaffInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Use ref to keep track of latest filters inside fetch function without causing re-creations
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  const nextCursorRef = useRef<string | null>(null);
  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  const fetchInvoices = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);

      const res = await staffInvoicesApi.list({
        ...filtersRef.current,
        cursor: isLoadMore && nextCursorRef.current ? nextCursorRef.current : undefined,
        limit: 10,
      });

      if (isLoadMore) {
        setData((prev) => {
          // Avoid duplicate appends if API is called multiple times
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = res.data.filter(i => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      } else {
        setData(res.data);
      }

      const pagination = res.pagination as CursorPagination | undefined;
      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
      if (isInitialLoading) setIsInitialLoading(false);
    }
  }, [isInitialLoading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchInvoices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Re-fetch on filter change

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage && !isLoading) {
      fetchInvoices(true);
    }
  }, [hasMore, isFetchingNextPage, isLoading, fetchInvoices]);

  const refetch = useCallback(() => {
    fetchInvoices(false);
  }, [fetchInvoices]);

  const updateInvoice = useCallback((id: string, updates: Partial<StaffInvoice>) => {
    setData((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
  }, []);

  return {
    data,
    isLoading,
    isError,
    hasMore,
    isFetchingNextPage,
    loadMore,
    refetch,
    updateInvoice,
    isInitialLoading,
  };
}
