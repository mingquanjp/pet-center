import { useState } from "react";
import { boardingApi } from "../api/boarding.api";
import { CreateStaffBoardingPayload, CreateStaffBoardingResult } from "../types/boarding.types";

interface MutateOptions {
  onSuccess?: (data: CreateStaffBoardingResult) => void;
  onError?: (error: Error) => void;
}

export function useCreateStaffBoarding() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (payload: CreateStaffBoardingPayload, options?: MutateOptions) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await boardingApi.createStaffBoardingAtCounter(payload);
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Failed to create boarding");
      setError(errorObj);
      if (options?.onError) {
        options.onError(errorObj);
      }
      throw errorObj;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
