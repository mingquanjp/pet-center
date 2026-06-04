import * as React from "react";

import { doctorDashboardApi } from "../api/doctor-dashboard.api";
import type { DoctorDashboardData } from "../types/doctor-dashboard.types";

type DoctorDashboardState = {
  data: DoctorDashboardData | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

type DoctorDashboardCache = {
  overview: DoctorDashboardData;
};

const doctorDashboardCacheTtlMs = 30 * 1000;
let doctorDashboardCache: DoctorDashboardCache | null = null;
let doctorDashboardCacheTimer: ReturnType<typeof setTimeout> | null = null;

function saveDoctorDashboardCache(cache: DoctorDashboardCache): void {
  doctorDashboardCache = cache;

  if (doctorDashboardCacheTimer) {
    clearTimeout(doctorDashboardCacheTimer);
  }

  doctorDashboardCacheTimer = setTimeout(() => {
    doctorDashboardCache = null;
    doctorDashboardCacheTimer = null;
  }, doctorDashboardCacheTtlMs);
}

export function useDoctorDashboard(): DoctorDashboardState {
  const [data, setData] = React.useState<DoctorDashboardData | null>(
    () => doctorDashboardCache?.overview ?? null
  );
  const [isLoading, setIsLoading] = React.useState(() => !doctorDashboardCache);
  const [isError, setIsError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        setIsError(false);
        setIsLoading(!doctorDashboardCache);

        const overview = await doctorDashboardApi.getOverview();

        if (!isMounted) return;

        setData(overview);
        saveDoctorDashboardCache({ overview });
      } catch {
        if (!isMounted) return;

        setIsError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return {
    data,
    isLoading,
    isError,
    refetch: () => {
      doctorDashboardCache = null;
      setReloadKey((key) => key + 1);
    },
  };
}
