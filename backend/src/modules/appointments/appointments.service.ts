import * as repo from "./appointments.repository.js";

function mapStatus(dbStatus: string): string {
  return dbStatus.toUpperCase();
}

function mapTypeCode(dbCode: string): string {
  return dbCode.toUpperCase();
}

function formatAppointmentCode(appointmentId: string): string {
  // appointment_id format: "appt_xxx" -> "LH-XXX" (take last digits/chars)
  const suffix = appointmentId.replace(/^appt_/, "").toUpperCase();
  return `LH-${suffix}`;
}

export async function listStaffAppointments(filters: any) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [rows, total, statsRow] = await Promise.all([
    repo.getStaffAppointmentsList(filters),
    repo.getStaffAppointmentsCount(filters),
    repo.getStaffAppointmentsStats(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

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
      totalPages,
    },
  };
}
