import { useMemo } from "react";

import {
  DOCTOR_MEDICAL_RECORD_PAGE_LIMIT,
  doctorMedicalRecordTypeKeywords,
} from "../constants/medical-record.constants";
import { MOCK_DOCTOR_MEDICAL_RECORDS } from "../constants/doctor-medical-record.mock";
import {
  DoctorMedicalRecord,
  DoctorMedicalRecordFilters,
  DoctorMedicalRecordPagination,
} from "../types/medical-record.types";

export function mapDoctorMedicalRecordFiltersToQuery(filters: DoctorMedicalRecordFilters) {
  return {
    search: filters.search || undefined,
    recordType: filters.recordType === "ALL" ? undefined : filters.recordType,
    alertLevel: filters.alertLevel === "ALL" ? undefined : filters.alertLevel,
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesRecordType(record: DoctorMedicalRecord, filters: DoctorMedicalRecordFilters) {
  if (filters.recordType === "ALL") return true;

  if (filters.recordType === "OTHER") {
    return !Object.entries(doctorMedicalRecordTypeKeywords)
      .filter(([type]) => type !== "OTHER")
      .some(([, keywords]) =>
        keywords.some((keyword) => normalizeText(record.latestExam.examTypeName).includes(normalizeText(keyword)))
      );
  }

  return doctorMedicalRecordTypeKeywords[filters.recordType].some((keyword) =>
    normalizeText(record.latestExam.examTypeName).includes(normalizeText(keyword))
  );
}

function filterMedicalRecords(records: DoctorMedicalRecord[], filters: DoctorMedicalRecordFilters) {
  const search = normalizeText(filters.search.trim());

  return records.filter((record) => {
    const matchesSearch =
      !search ||
      normalizeText(
        [
          record.pet.code,
          record.pet.name,
          record.pet.breed,
          record.pet.species,
          record.owner.fullName,
          record.latestExam.examTypeName,
          record.latestExam.diagnosis,
        ]
          .filter(Boolean)
          .join(" ")
      ).includes(search);

    const matchesAlert = filters.alertLevel === "ALL" || record.alertLevel === filters.alertLevel;

    return matchesSearch && matchesAlert && matchesRecordType(record, filters);
  });
}

export function useDoctorMedicalRecords(filters: DoctorMedicalRecordFilters, page: number) {
  return useMemo(() => {
    mapDoctorMedicalRecordFiltersToQuery(filters);

    const filteredRecords = filterMedicalRecords(MOCK_DOCTOR_MEDICAL_RECORDS, filters);
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / DOCTOR_MEDICAL_RECORD_PAGE_LIMIT));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * DOCTOR_MEDICAL_RECORD_PAGE_LIMIT;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + DOCTOR_MEDICAL_RECORD_PAGE_LIMIT);

    const pagination: DoctorMedicalRecordPagination = {
      page: safePage,
      limit: DOCTOR_MEDICAL_RECORD_PAGE_LIMIT,
      total: filteredRecords.length,
      totalPages,
    };

    return {
      data: paginatedRecords,
      pagination,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }, [filters, page]);
}
