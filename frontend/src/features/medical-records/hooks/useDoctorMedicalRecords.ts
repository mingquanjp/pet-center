import { useState, useEffect, useCallback } from "react";
import { doctorMedicalRecordsApi } from "../api/doctor-medical-records.api";
import {
  DoctorMedicalRecordFilters,
  DoctorMedicalRecordListItem,
  DoctorMedicalRecordExamStatus,
} from "../types/medical-record.types";

const defaultFilters: DoctorMedicalRecordFilters = {
  keyword: "",
  species: "ALL",
  examStatus: "ALL",
  page: 1,
  limit: 10,
};

export const useDoctorMedicalRecords = () => {
  const [filters, setFilters] = useState<DoctorMedicalRecordFilters>(defaultFilters);
  const [items, setItems] = useState<DoctorMedicalRecordListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await doctorMedicalRecordsApi.getMedicalRecords(filters);
      setItems(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecords();
  }, [fetchRecords]);

  const setKeyword = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const setSpecies = (species: DoctorMedicalRecordFilters["species"]) => {
    setFilters((prev) => ({ ...prev, species, page: 1 }));
  };

  const setExamStatus = (examStatus: "ALL" | DoctorMedicalRecordExamStatus) => {
    setFilters((prev) => ({ ...prev, examStatus, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    items,
    isLoading,
    error,
    pagination,
    setKeyword,
    setSpecies,
    setExamStatus,
    setPage,
    resetFilters,
    refetch: fetchRecords,
  };
};
