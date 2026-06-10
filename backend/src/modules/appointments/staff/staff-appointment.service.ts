import type { PoolClient } from "pg";
import { withTransaction } from "../../../db/transactions.js";
import { AppError } from "../../../shared/errors/app-error.js";
import { createId } from "../../../shared/utils/id.js";
import * as repo from "./staff-appointment.repository.js";
import {
  notifyAppointmentConfirmed,
  notifyAppointmentRejected,
  notifyMedicalExamCompleted
} from "../../notifications/notification-events.js";
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
import { formatAppointmentCode, mapStatus, mapTypeCode, mapDoctorToDto, mapAppointmentRowToStaffDetailDto } from "../appointment.mapper.js";
import { getPendingAppointmentRange, pickLeastBusyDoctor, getAppointmentRange, pickDoctorForConfirmation } from "./doctor-assignment.strategy.js";

export async function listStaffAppointments(filters: any) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow] = await Promise.all([
    repo.getStaffAppointmentsList(filters),
    repo.getStaffAppointmentsCount(filters),
    repo.getStaffAppointmentsStats(filters),
  ]);

  const data = rows.map((row) => ({
    id: row.id,
    appointmentCode: formatAppointmentCode(row.id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species || "Other",
      breed: row.breed || undefined,
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
    bookingChannel: "ONLINE" as const,
    status: mapStatus(row.appointment_status),
    symptomDescription: row.symptom_description || undefined,
  }));

  const stats = {
    pendingCount: parseInt(statsRow?.pending_count ?? "0", 10),
    confirmedCount: parseInt(statsRow?.confirmed_count ?? "0", 10),
    rejectedCount: parseInt(statsRow?.rejected_count ?? "0", 10),
    cancelledCount: parseInt(statsRow?.cancelled_count ?? "0", 10),
    todayTotalCount: parseInt(statsRow?.today_total_count ?? "0", 10),
  };

  return {
    data,
    stats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function refreshPendingAssignmentsAfterConfirm(
  client: PoolClient,
  confirmedAppointmentId: string,
  confirmedDoctorId: string,
  confirmedStart: Date,
  confirmedEnd: Date,
) {
  const conflictingPendingAppointments = await repo.findPendingAppointmentsAssignedToDoctorInRange(
    confirmedDoctorId,
    confirmedStart,
    confirmedEnd,
    confirmedAppointmentId,
    client,
  );

  const reservedDoctorIds = new Set<string>([confirmedDoctorId]);

  for (const pendingAppointment of conflictingPendingAppointments) {
    const { appointmentStart, appointmentEnd } = getPendingAppointmentRange(pendingAppointment);
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      pendingAppointment.appointment_id,
      client,
    );
    const replacementDoctor = pickLeastBusyDoctor(availableDoctors, reservedDoctorIds);

    await repo.updateAppointmentDoctor(
      pendingAppointment.appointment_id,
      replacementDoctor?.user_id ?? null,
      client,
    );

    if (replacementDoctor) {
      reservedDoctorIds.add(replacementDoctor.user_id);
    }
  }
}

export async function getStaffAppointmentDetail(appointmentId: string): Promise<StaffAppointmentDetailDto> {
  const row = await repo.findStaffAppointmentDetailById(appointmentId);
  if (!row) {
    throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
  }

  let suggestedDoctor: StaffAssignedDoctorDto | null = null;
  let assignmentStatus: "ASSIGNED" | "NO_AVAILABLE_DOCTOR" | undefined = undefined;

  if (row.appointment_status === "pending") {
    const { appointmentStart, appointmentEnd } = getAppointmentRange(row);
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
    );

    if (availableDoctors.length > 0) {
      let doctorToSuggest: AvailableDoctorRow | undefined | null;
      if (row.veterinarian_user_id) {
        doctorToSuggest = availableDoctors.find((doctor) => doctor.user_id === row.veterinarian_user_id);
      }
      if (!doctorToSuggest) {
        doctorToSuggest = pickLeastBusyDoctor(availableDoctors);
      }
      if (doctorToSuggest) {
        suggestedDoctor = mapDoctorToDto(doctorToSuggest);
        assignmentStatus = "ASSIGNED";
      } else {
        assignmentStatus = "NO_AVAILABLE_DOCTOR";
      }
    } else {
      assignmentStatus = "NO_AVAILABLE_DOCTOR";
    }
  } else if (row.appointment_status === "confirmed" || row.veterinarian_user_id) {
    assignmentStatus = "ASSIGNED";
  }

  return mapAppointmentRowToStaffDetailDto(row, suggestedDoctor, assignmentStatus);
}

export async function confirmStaffAppointment(
  appointmentId: string,
  staffUserId: string,
  body: ConfirmStaffAppointmentBody,
) {
  await withTransaction(async (client) => {
    const row = await repo.findStaffAppointmentDetailByIdForUpdate(appointmentId, client);
    if (!row) {
      throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
    }

    if (row.appointment_status !== "pending") {
      if (row.appointment_status === "confirmed") {
        throw new AppError("Appointment already confirmed.", "APPOINTMENT_ALREADY_CONFIRMED", 409);
      }
      throw new AppError("Cannot confirm this appointment.", "INVALID_APPOINTMENT_STATUS", 409);
    }

    const { appointmentStart, appointmentEnd } = getAppointmentRange(row);
    const preferredDoctorId = body.doctorUserId ?? row.veterinarian_user_id;
    const selectedDoctor = await pickDoctorForConfirmation(
      client,
      appointmentStart,
      appointmentEnd,
      appointmentId,
      preferredDoctorId,
    );

    if (!selectedDoctor) {
      throw new AppError("No available doctor for this time slot.", "NO_AVAILABLE_DOCTOR", 409);
    }

    await repo.confirmAppointmentWithDoctor(
      appointmentId,
      staffUserId,
      selectedDoctor.user_id,
      body.internalNote,
      client,
    );

    await refreshPendingAssignmentsAfterConfirm(
      client,
      appointmentId,
      selectedDoctor.user_id,
      appointmentStart,
      appointmentEnd,
    );
  });

  notifyAppointmentConfirmed(appointmentId).catch(console.error);

  return getStaffAppointmentDetail(appointmentId);
}

export async function rejectStaffAppointment(
  appointmentId: string,
  staffUserId: string,
  body: RejectStaffAppointmentBody,
) {
  const row = await repo.findStaffAppointmentDetailById(appointmentId);
  if (!row) {
    throw new AppError("Appointment not found", "APPOINTMENT_NOT_FOUND", 404);
  }

  if (row.appointment_status !== "pending") {
    if (row.appointment_status === "rejected") {
      throw new AppError("Appointment already rejected.", "APPOINTMENT_ALREADY_REJECTED", 409);
    }
    throw new AppError("Cannot reject this appointment.", "INVALID_APPOINTMENT_STATUS", 409);
  }

  await repo.rejectAppointment(
    appointmentId,
    staffUserId,
    body.rejectionReason,
    body.internalNote,
  );

  notifyAppointmentRejected(appointmentId).catch(console.error);

  return getStaffAppointmentDetail(appointmentId);
}
