import {
  StaffAssignedDoctor,
  StaffAppointmentDetail,
  StaffDoctor,
} from "../types/appointment.types";

export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 60;

export function getAppointmentTimeRange(
  scheduledAt: string,
  durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES
): {
  startsAt: Date;
  endsAt: Date;
} {
  const startsAt = new Date(scheduledAt);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  return {
    startsAt,
    endsAt,
  };
}

export function isTimeRangeOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && startB < endA;
}

export function isDoctorAvailableForAppointment(
  doctor: StaffDoctor,
  scheduledAt: string,
  durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES
): boolean {
  if (doctor.workingStatus !== "ACTIVE") {
    return false;
  }

  const { startsAt, endsAt } = getAppointmentTimeRange(
    scheduledAt,
    durationMinutes
  );

  return !doctor.schedules.some((schedule) => {
    const scheduleStart = new Date(schedule.startsAt);
    const scheduleEnd = new Date(schedule.endsAt);

    return isTimeRangeOverlapping(
      startsAt,
      endsAt,
      scheduleStart,
      scheduleEnd
    );
  });
}

export function getAvailableDoctorsForAppointment(
  doctors: StaffDoctor[],
  scheduledAt: string,
  durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES
): StaffDoctor[] {
  return doctors.filter((doctor) =>
    isDoctorAvailableForAppointment(
      doctor,
      scheduledAt,
      durationMinutes
    )
  );
}

function hashString(value: string): number {
  return value.split("").reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) | 0;
  }, 0);
}

export function pickRandomDoctor(
  doctors: StaffDoctor[],
  seed = ""
): StaffDoctor | null {
  if (doctors.length === 0) {
    return null;
  }

  const hash = Math.abs(hashString(seed));
  const index = hash % doctors.length;

  return doctors[index];
}

export function autoAssignDoctorForAppointment(
  appointment: Omit<StaffAppointmentDetail, 'suggestedDoctor' | 'assignmentStatus'>,
  doctors: StaffDoctor[]
): StaffAssignedDoctor | null {
  if (appointment.assignedDoctor) {
    return appointment.assignedDoctor;
  }

  const availableDoctors = getAvailableDoctorsForAppointment(
    doctors,
    appointment.scheduledAt
  );

  const selectedDoctor = pickRandomDoctor(
    availableDoctors,
    appointment.id
  );

  if (!selectedDoctor) {
    return null;
  }

  return {
    id: selectedDoctor.id,
    fullName: selectedDoctor.fullName,
    phoneNumber: selectedDoctor.phoneNumber,
    email: selectedDoctor.email,
    avatarUrl: selectedDoctor.avatarUrl,
  };
}
