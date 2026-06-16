import type { DoctorExamStatus } from "../types/doctor-dashboard.types";

export function formatDoctorStatCount(count: number): string {
  return String(count).padStart(2, "0");
}

export function getDoctorExamActionLabel(status: DoctorExamStatus): string {
  const labels: Record<DoctorExamStatus, string> = {
    WAITING: "Khám",
    EXAMINING: "Tiếp tục",
  };

  return labels[status];
}
