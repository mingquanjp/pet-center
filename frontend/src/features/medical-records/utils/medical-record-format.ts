import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DoctorMedicalExamFieldValue, DoctorMedicalRecordExamStatus } from "../types/medical-record.types";

export function formatPetSpecies(species: string): string {
  switch (species) {
    case "Dog":
      return "Chó";
    case "Cat":
      return "Mèo";
    default:
      return "Khác";
  }
}

export function formatPetGender(gender: string | null | undefined): string {
  switch (gender) {
    case "male":
      return "Đực";
    case "female":
      return "Cái";
    default:
      return "Không rõ";
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Không rõ";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "Không rõ";
  try {
    return format(new Date(dateString), "HH:mm, dd/MM/yyyy", { locale: vi });
  } catch {
    return dateString;
  }
}

export function formatExamStatus(status: DoctorMedicalRecordExamStatus): string {
  switch (status) {
    case "result_recorded":
      return "Đã ghi nhận kết quả";
    case "prescribed":
      return "Đã kê đơn";
    case "follow_up_required":
      return "Cần tái khám";
    default:
      return status;
  }
}

export function formatFollowUpStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ tái khám";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function getPetAgeLabel(birthDate: string | null, estimatedAge: number | null): string {
  if (birthDate) {
    const years = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (years <= 0) {
      return "Dưới 1 tuổi";
    }
    return `${years} tuổi`;
  }
  if (estimatedAge !== null && estimatedAge !== undefined) {
    return `${estimatedAge} tuổi (ước lượng)`;
  }
  return "Không rõ tuổi";
}

export function getDisplayValueForExamField(field: DoctorMedicalExamFieldValue): string {
  switch (field.fieldType) {
    case "text":
    case "select":
      return field.valueText || "Chưa ghi nhận";
    case "number":
      return field.valueNumber !== null && field.valueNumber !== undefined ? field.valueNumber.toString() : "Chưa ghi nhận";
    case "date":
      return formatDate(field.valueDate);
    case "file":
      return field.fileUrl ? "Có tệp đính kèm" : "Không có tệp";
    default:
      return "Chưa ghi nhận";
  }
}
