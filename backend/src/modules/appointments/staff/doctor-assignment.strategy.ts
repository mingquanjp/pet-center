
import { AppError } from "../../../shared/errors/app-error.js";
import { httpStatus } from "../../../shared/errors/http-status.js";
import * as repo from "./staff-appointment.repository.js";
import { AppointmentDetailRow, AvailableDoctorRow, PendingAppointmentAssignmentRow } from "../appointments.types.js";
import { PoolClient } from "pg";

export function pickLeastBusyDoctor(availableDoctors: AvailableDoctorRow[], excludedDoctorIds: Set<string> = new Set()): AvailableDoctorRow | null {
    const candidatesPool = availableDoctors.filter((doctor) => !excludedDoctorIds.has(doctor.user_id));
    if (candidatesPool.length === 0) {
    return null;
    }

    const minCount = Math.min(...candidatesPool.map((doctor) => parseInt(doctor.confirmed_count_in_day, 10)));
    const candidates = candidatesPool.filter((doctor) => parseInt(doctor.confirmed_count_in_day, 10) === minCount);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function pickDoctorForConfirmation(client: PoolClient, appointmentStart: Date, appointmentEnd: Date, appointmentId: string, preferredDoctorId: string | null): Promise<AvailableDoctorRow | null> {
    const attemptedDoctorIds = new Set<string>();

    while (true) {
    const availableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
      client,
    );

    let candidate: AvailableDoctorRow | null = null;
    if (preferredDoctorId && !attemptedDoctorIds.has(preferredDoctorId)) {
      candidate = availableDoctors.find((doctor) => doctor.user_id === preferredDoctorId) ?? null;
    }

    if (!candidate) {
      candidate = pickLeastBusyDoctor(availableDoctors, attemptedDoctorIds);
    }

    if (!candidate) {
      return null;
    }

    attemptedDoctorIds.add(candidate.user_id);
    const doctorLocked = await repo.lockDoctorForAssignment(candidate.user_id, client);
    if (!doctorLocked) {
      continue;
    }

    const freshAvailableDoctors = await repo.findAvailableDoctorsForAppointment(
      appointmentStart,
      appointmentEnd,
      appointmentId,
      client,
    );
    const freshCandidate = freshAvailableDoctors.find((doctor) => doctor.user_id === candidate.user_id);
    if (freshCandidate) {
      return freshCandidate;
    }
    }
}

export function getAppointmentRange(row: AppointmentDetailRow) {
    const appointmentStart = new Date(row.scheduled_at);
    const appointmentEnd = new Date(appointmentStart.getTime() + row.duration_minutes * 60 * 1000);

    return { appointmentStart, appointmentEnd };
}

export function getPendingAppointmentRange(row: PendingAppointmentAssignmentRow) {
    const appointmentStart = new Date(row.scheduled_at);
    const appointmentEnd = new Date(appointmentStart.getTime() + row.duration_minutes * 60 * 1000);

    return { appointmentStart, appointmentEnd };
}
