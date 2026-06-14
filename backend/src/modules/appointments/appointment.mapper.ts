
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { AppointmentDetailRow, AvailableDoctorRow, DoctorExaminationListRow } from "./appointments.types.js";
import { StaffAppointmentDetailDto, StaffAssignedDoctorDto } from "./appointments.types.js";

export function mapStatus(dbStatus: string): string {
    return dbStatus.toUpperCase();
}

export function mapTypeCode(dbCode: string): string {
    return dbCode.toUpperCase();
}

export function formatAppointmentCode(appointmentId: string): string {
    return appointmentId;
}

export function formatExaminationCode(examinationId: string): string {
    return examinationId;
}

export function formatPetAge(row: Pick<DoctorExaminationListRow, "birth_date" | "estimated_age">): string | undefined {
    if (row.birth_date) {
    const now = new Date();
    const birthDate = new Date(row.birth_date);
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
    }

    if (!row.estimated_age) {
    return undefined;
    }

    const estimatedAge = Number(row.estimated_age);
    if (!Number.isFinite(estimatedAge)) {
    return undefined;
    }

    const ageText = Number.isInteger(estimatedAge) ? String(estimatedAge) : estimatedAge.toFixed(1);
    return estimatedAge >= 1 ? `${ageText} tuổi` : "Dưới 1 tuổi";
}

export function mapAppointmentRowToStaffDetailDto(row: AppointmentDetailRow, suggestedDoctor: StaffAssignedDoctorDto | null, assignmentStatus: "ASSIGNED" | "NO_AVAILABLE_DOCTOR" | undefined): StaffAppointmentDetailDto {
    const status = mapStatus(row.appointment_status) as any;
    const examTypeCode = mapTypeCode(row.type_code) as any;

    let assignedDoctor: StaffAssignedDoctorDto | null = null;
    if (row.veterinarian_user_id) {
    assignedDoctor = {
      id: row.veterinarian_user_id,
      fullName: row.doctor_full_name || "",
      phoneNumber: row.doctor_phone_number,
      email: row.doctor_email,
      avatarUrl: row.doctor_avatar,
    };
    }

    return {
    id: row.appointment_id,
    appointmentCode: formatAppointmentCode(row.appointment_id),
    status,
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: row.species === "Dog" || row.species === "Cat" ? row.species : "Other",
      breed: row.breed,
      imageUrl: row.profile_image_url,
      ageText: undefined,
      weightText: row.weight_kg ? `${row.weight_kg} kg` : undefined,
    },
    owner: {
      id: row.owner_user_id,
      fullName: row.owner_full_name,
      phoneNumber: row.owner_phone_number,
      email: row.owner_email,
    },
    examType: {
      id: row.exam_type_id,
      code: examTypeCode,
      name: row.type_name,
    },
    scheduledAt: new Date(row.scheduled_at).toISOString(),
    bookingChannel: "ONLINE",
    symptomDescription: row.symptom_description,
    ownerNote: row.symptom_description,
    assignedDoctor,
    suggestedDoctor,
    assignmentStatus,
    rejectionReason: row.rejection_reason,
    };
}

export function mapDoctorToDto(doctor: AvailableDoctorRow): StaffAssignedDoctorDto {
    return {
    id: doctor.user_id,
    fullName: doctor.full_name,
    phoneNumber: doctor.phone_number,
    email: doctor.email,
    avatarUrl: doctor.profile_image_url,
    };
}
