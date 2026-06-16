import { CreateOwnerAppointmentFormValues } from "../types/appointment.types";

export interface CreateOwnerAppointmentValidationResult {
  errors: Partial<Record<keyof CreateOwnerAppointmentFormValues, string>>;
  isValid: boolean;
}

export function validateCreateOwnerAppointmentForm(
  values: CreateOwnerAppointmentFormValues
): CreateOwnerAppointmentValidationResult {
  const errors: Partial<Record<keyof CreateOwnerAppointmentFormValues, string>> = {};

  if (!values.petId) {
    errors.petId = "Vui lòng chọn thú cưng.";
  }

  if (!values.examTypeId) {
    errors.examTypeId = "Vui lòng chọn loại hình khám.";
  }

  if (!values.appointmentDate) {
    errors.appointmentDate = "Vui lòng chọn ngày khám.";
  }

  if (!values.timeSlot) {
    errors.timeSlot = "Vui lòng chọn giờ khám.";
  }

  if (values.symptomDescription.length > 500) {
    errors.symptomDescription = "Triệu chứng không được vượt quá 500 ký tự.";
  }

  if (values.note.length > 500) {
    errors.note = "Ghi chú không được vượt quá 500 ký tự.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
