
import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import { DoctorExaminationDetailRow, DoctorExaminationFieldDefinitionRow, DoctorExaminationFieldValueRow } from "../appointments.types.js";
import { formatAppointmentCode, formatExaminationCode, formatPetAge, mapStatus, mapTypeCode } from "../appointment.mapper.js";
import * as repo from "./doctor-examination.repository.js";

export function getDoctorExaminationStatus(row: DoctorExaminationDetailRow) {
    return mapStatus(row.examination_status);
}

export function mapDoctorExaminationFieldDefinition(definition: DoctorExaminationFieldDefinitionRow, values: DoctorExaminationFieldValueRow[]) {
    const value = values.find((item) => item.field_definition_id === definition.field_definition_id);

    return {
    id: definition.field_definition_id,
    name: definition.field_name,
    label: definition.field_label,
    type: definition.field_type,
    isRequired: definition.is_required,
    displayOrder: definition.display_order,
    optionSource: definition.option_source,
    value: value
      ? {
          text: value.value_text,
          number: value.value_number ? Number(value.value_number) : null,
          date: value.value_date,
          fileUrl: value.file_url,
        }
      : null,
    };
}

export async function mapDoctorExaminationDetail(row: DoctorExaminationDetailRow) {
    await repo.ensureStandardExamFieldDefinitions(row.exam_type_id, row.type_code);

    const [fieldDefinitions, fieldValues, recentHistory, medicines, prescription, vaccination, followUp, recheckContext] = await Promise.all([
    repo.getDoctorExaminationFieldDefinitions(row.exam_type_id),
    repo.getDoctorExaminationFieldValues(row.exam_id),
    repo.getDoctorExaminationHistory(row.pet_id, row.id),
    repo.getActiveMedicineOptions(),
    repo.getPrescriptionByExamId(row.exam_id),
    repo.getVaccinationByExamId(row.exam_id),
    repo.getFollowUpByExamId(row.exam_id),
    row.type_code === "recheck" ? repo.getRecheckContext(row.pet_id, row.id) : Promise.resolve(null),
    ]);

    return {
    id: row.id,
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row.exam_id || row.id),
    appointmentCode: formatAppointmentCode(row.id),
    status: getDoctorExaminationStatus(row),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed || undefined,
      ageText: formatPetAge(row),
      gender: row.gender || undefined,
      weightText: row.weight_kg ? `${row.weight_kg} kg` : undefined,
      imageUrl: row.profile_image_url || undefined,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    doctor: {
      id: row.doctor_id || undefined,
      fullName: row.doctor_name || undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    symptomDescription: row.symptom_description || undefined,
    internalNote: row.internal_note || undefined,
    diagnosis: row.diagnosis || "",
    conclusion: row.conclusion || "",
    healthNote: row.health_note || "",
    examDate: row.exam_date || undefined,
    fields: fieldDefinitions.map((definition) => mapDoctorExaminationFieldDefinition(definition, fieldValues)),
    recentHistory: recentHistory.map((item) => ({
      appointmentId: item.appointment_id,
      examinationCode: formatExaminationCode(item.exam_id),
      scheduledAt: new Date(item.scheduled_at).toISOString(),
      examTypeName: item.type_name,
      diagnosis: item.diagnosis || undefined,
    })),
    medicines: medicines.map((medicine) => ({
      id: medicine.medicine_id,
      name: medicine.medicine_name,
      unit: medicine.unit,
      status: medicine.medicine_status,
    })),
    prescription: prescription
      ? {
          id: prescription.prescription_id,
          prescribedAt: prescription.prescribed_at,
          generalNote: prescription.general_note || undefined,
          items: prescription.items.map((item) => ({
            id: item.prescription_item_id,
            medicineId: item.medicine_id,
            medicineName: item.medicine_name,
            medicineUnit: item.medicine_unit,
            quantity: item.quantity ? Number(item.quantity) : undefined,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            usageInstruction: item.usage_instruction || "",
            note: item.note || undefined,
          })),
        }
      : null,
    vaccination: vaccination
      ? {
          id: vaccination.vaccination_id,
          vaccineName: vaccination.vaccine_name,
          vaccinationDate: vaccination.vaccination_date,
          note: vaccination.note || undefined,
        }
      : null,
    followUp: followUp
      ? {
          id: followUp.follow_up_id,
          followUpDate: followUp.follow_up_date,
          reason: followUp.reason,
          ownerNote: followUp.owner_note || undefined,
        }
      : null,
    recheckContext: recheckContext
      ? {
          previousExamId: recheckContext.previous_exam_id || undefined,
          previousAppointmentId: recheckContext.previous_appointment_id || undefined,
          previousExaminationCode: recheckContext.previous_exam_id || recheckContext.previous_appointment_id
            ? formatExaminationCode(recheckContext.previous_exam_id || recheckContext.previous_appointment_id!)
            : undefined,
          previousDiagnosis: recheckContext.previous_diagnosis || undefined,
          followUpReason: recheckContext.follow_up_reason || undefined,
        }
      : null,
    };
}
