import type { PoolClient } from "pg";
import { withTransaction } from "../../../db/transactions.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { createId } from "../../../shared/utils/id.js";
import * as repo from "./doctor-examination.repository.js";
import {
  notifyAppointmentConfirmed,
  notifyAppointmentRejected,
  notifyMedicalExamCompleted
} from "../../notifications/notification-events.js";
import { upsertPetActivityLog } from "../../pet-activity-logs/pet-activity-logs.repository.js";
import type {
  AppointmentDetailRow,
  AvailableDoctorRow,
  CompleteDoctorExaminationBody,
  DoctorExaminationDetailRow,
  DoctorExaminationFieldDefinitionRow,
  DoctorExaminationFieldValueRow,
  ConfirmStaffAppointmentBody,
  DoctorExaminationListRow,
  PendingAppointmentAssignmentRow,
  RejectStaffAppointmentBody,
  SaveDraftDoctorExaminationBody,
  StaffAppointmentDetailDto,
  StaffAssignedDoctorDto,
} from "../appointments.types.js";
import { formatAppointmentCode, formatExaminationCode, formatPetAge, mapStatus, mapTypeCode } from "../appointment.mapper.js";
import { mapDoctorExaminationDetail } from "./doctor-examination.mapper.js";

export async function listDoctorExaminations(doctorUserId: string, filters: any) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow, tabStatsRow] = await Promise.all([
    repo.getDoctorExaminationsList(doctorUserId, filters),
    repo.getDoctorExaminationsCount(doctorUserId, filters),
    repo.getDoctorExaminationsStats(doctorUserId),
    repo.getDoctorExaminationsTabStats(doctorUserId, filters),
  ]);

  const data = rows.map((row) => ({
    id: row.id,
    examId: row.exam_id,
    examinationCode: formatExaminationCode(row.exam_id || row.id),
    appointmentCode: formatAppointmentCode(row.id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed || undefined,
      ageText: formatPetAge(row),
      imageUrl: row.profile_image_url || undefined,
    },
    owner: {
      id: row.owner_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    examType: {
      id: row.exam_type_id,
      code: mapTypeCode(row.type_code),
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    status: mapStatus(row.examination_status),
    symptomDescription: row.symptom_description || undefined,
    internalNote: row.internal_note || undefined,
  }));

  const stats = {
    totalCount: parseInt(statsRow?.total_count ?? "0", 10),
    waitingCount: parseInt(statsRow?.waiting_count ?? "0", 10),
    examiningCount: parseInt(statsRow?.examining_count ?? "0", 10),
    completedCount: parseInt(statsRow?.completed_count ?? "0", 10),
    followUpCount: parseInt(statsRow?.follow_up_count ?? "0", 10),
  };

  const tabStats = {
    totalCount: parseInt(tabStatsRow?.total_count ?? "0", 10),
    waitingCount: parseInt(tabStatsRow?.waiting_count ?? "0", 10),
    examiningCount: parseInt(tabStatsRow?.examining_count ?? "0", 10),
    completedCount: parseInt(tabStatsRow?.completed_count ?? "0", 10),
    followUpCount: parseInt(tabStatsRow?.follow_up_count ?? "0", 10),
  };

  return {
    data,
    stats,
    tabStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDoctorExaminationDetail(doctorUserId: string, appointmentId: string) {
  const row = await repo.findDoctorExaminationDetail(doctorUserId, appointmentId);

  if (!row) {
    throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
  }

  return mapDoctorExaminationDetail(row);
}

export async function startDoctorExamination(doctorUserId: string, appointmentId: string) {
  await withTransaction(async (client) => {
    const row = await repo.findDoctorExaminationForUpdate(doctorUserId, appointmentId, client);

    if (!row) {
      throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
    }

    const examId = row.exam_id || await createId("mex", client);
    if (!row.exam_id) {
      await repo.createMedicalExamForAppointment(
        examId,
        row.appointment_id,
        doctorUserId,
        client
      );
    }

    await repo.updateMedicalExamLifecycle(examId, doctorUserId, "examining", client);
    await repo.updateAppointmentExaminationStatus(row.appointment_id, "examining", client);
    await upsertPetActivityLog({
      petId: row.pet_id,
      ownerUserId: row.owner_id,
      actorUserId: doctorUserId,
      activityCategory: "medical",
      activityType: "medical_exam_started",
      activityStatus: "pending",
      title: "Đã bắt đầu khám bệnh",
      summary: `${row.pet_name} đang được bác sĩ tiếp nhận khám.`,
      sourceType: "medical_exam",
      sourceId: examId,
      metadata: {
        appointmentId: row.appointment_id,
        examTypeName: row.type_name
      }
    }, client);
  });

  return getDoctorExaminationDetail(doctorUserId, appointmentId);
}

export async function saveDraftDoctorExamination(
  doctorUserId: string,
  appointmentId: string,
  body: SaveDraftDoctorExaminationBody
) {
  await withTransaction(async (client) => {
    const row = await repo.findDoctorExaminationForUpdate(doctorUserId, appointmentId, client);

    if (!row) {
      throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
    }

    const examId = row.exam_id || await createId("mex", client);
    if (!row.exam_id) {
      await repo.createMedicalExamForAppointment(examId, row.appointment_id, doctorUserId, client);
    }

    await repo.updateMedicalExamLifecycle(examId, doctorUserId, "examining", client);
    await repo.saveMedicalExamDraft(examId, body.diagnosis, body.conclusion, body.healthNote, client);
    await repo.replaceMedicalExamFieldValues(examId, normalizeFieldValues(body.fieldValues), client);
    await repo.updateAppointmentExaminationStatus(row.appointment_id, "examining", client);
  });

  return getDoctorExaminationDetail(doctorUserId, appointmentId);
}

function normalizeFieldValues(fieldValues: CompleteDoctorExaminationBody["fieldValues"] = []) {
  return fieldValues.filter((fieldValue) => {
    const providedValues = [
      fieldValue.valueText,
      fieldValue.valueNumber,
      fieldValue.valueDate,
      fieldValue.fileUrl,
    ].filter((value) => value !== undefined && value !== null && value !== "");

    return providedValues.length === 1;
  });
}

export async function completeDoctorExamination(
  doctorUserId: string,
  appointmentId: string,
  body: CompleteDoctorExaminationBody
) {
  await withTransaction(async (client) => {
    const row = await repo.findDoctorExaminationForUpdate(doctorUserId, appointmentId, client);

    if (!row) {
      throw new AppError("Examination not found", "EXAMINATION_NOT_FOUND", 404);
    }

    const examId = row.exam_id || await createId("mex", client);
    if (!row.exam_id) {
      await repo.createMedicalExamForAppointment(examId, row.appointment_id, doctorUserId, client);
    }

    const hasFollowUp = Boolean(body.followUp);
    const hasPrescription = Boolean(body.prescriptionItems?.length);
    const examStatus = hasFollowUp ? "follow_up_required" : hasPrescription ? "prescribed" : "result_recorded";

    await repo.completeMedicalExam(examId, body.diagnosis, body.conclusion, body.healthNote, examStatus, client);
    await repo.replaceMedicalExamFieldValues(examId, normalizeFieldValues(body.fieldValues), client);
    await repo.replacePrescription(examId, body.prescriptionItems, client);
    await repo.replaceVaccination(examId, row.pet_id, body.vaccination, client);
    await repo.replaceFollowUpInstruction(examId, body.followUp, client);
    await repo.updateAppointmentExaminationStatus(row.appointment_id, hasFollowUp ? "follow_up" : "completed", client);

    await repo.processExaminationBilling(
      row.appointment_id,
      examId,
      row.pet_id,
      row.owner_id,
      row.exam_type_id,
      body.prescriptionItems,
      body.dispenseMedicine ?? true,
      client
    );
    await upsertPetActivityLog({
      petId: row.pet_id,
      ownerUserId: row.owner_id,
      actorUserId: doctorUserId,
      activityCategory: "medical",
      activityType: "medical_exam_completed",
      activityStatus: "completed",
      title: "Đã hoàn tất phiếu khám",
      summary: `${row.pet_name} đã có kết quả khám bệnh.`,
      sourceType: "medical_exam",
      sourceId: examId,
      metadata: {
        appointmentId: row.appointment_id,
        diagnosis: body.diagnosis,
        conclusion: body.conclusion,
        examStatus
      }
    }, client);
    if (body.vaccination) {
      await upsertPetActivityLog({
        petId: row.pet_id,
        ownerUserId: row.owner_id,
        actorUserId: doctorUserId,
        activityCategory: "vaccination",
        activityType: "vaccination_recorded",
        activityStatus: "completed",
        title: "Đã ghi nhận tiêm phòng",
        summary: `${row.pet_name} đã được cập nhật thông tin tiêm phòng.`,
        sourceType: "medical_exam",
        sourceId: examId,
        metadata: {
          appointmentId: row.appointment_id,
          vaccination: body.vaccination
        }
      }, client);
    }
    if (hasPrescription) {
      await upsertPetActivityLog({
        petId: row.pet_id,
        ownerUserId: row.owner_id,
        actorUserId: doctorUserId,
        activityCategory: "medical",
        activityType: "prescription_created",
        activityStatus: "completed",
        title: "Đã kê đơn thuốc",
        summary: `${row.pet_name} có đơn thuốc mới sau buổi khám.`,
        sourceType: "medical_exam",
        sourceId: examId,
        metadata: {
          appointmentId: row.appointment_id,
          itemCount: body.prescriptionItems?.length ?? 0
        }
      }, client);
    }
    if (body.followUp) {
      await upsertPetActivityLog({
        petId: row.pet_id,
        ownerUserId: row.owner_id,
        actorUserId: doctorUserId,
        activityCategory: "medical",
        activityType: "follow_up_instruction_created",
        activityStatus: "scheduled",
        title: "Đã hẹn tái khám",
        summary: `${row.pet_name} có lịch tái khám theo chỉ định của bác sĩ.`,
        sourceType: "medical_exam",
        sourceId: examId,
        metadata: {
          appointmentId: row.appointment_id,
          followUp: body.followUp
        }
      }, client);
    }
  });

  const result = await getDoctorExaminationDetail(doctorUserId, appointmentId);
  if (result.examId) {
    notifyMedicalExamCompleted(result.examId).catch(console.error);
  }

  return result;
}
