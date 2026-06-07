import { findDoctorMedicalRecords } from "./medical-records.repository.js";
import { DoctorMedicalRecordsQueryDto, DoctorMedicalRecordListResponseDto, DoctorMedicalRecordListItemDto, DoctorMedicalRecordExamStatus } from "./medical-records.types.js";

export async function getDoctorMedicalRecords(
  query: DoctorMedicalRecordsQueryDto
): Promise<DoctorMedicalRecordListResponseDto> {
  const { keyword, species, examStatus, page, limit } = query;
  const offset = (page - 1) * limit;

  const { rows, total } = await findDoctorMedicalRecords({
    keyword,
    species,
    examStatus,
    limit,
    offset,
  });

  const items: DoctorMedicalRecordListItemDto[] = rows.map((row) => ({
    petId: row.pet_id,
    petCode: row.pet_code || row.pet_id,
    petName: row.pet_name,
    species: row.species as "Dog" | "Cat" | "Other",
    breed: row.breed || null,
    avatarUrl: row.avatar_url || null,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone || null,
    latestExamId: row.latest_exam_id,
    latestExamDate: row.latest_exam_date ? row.latest_exam_date.toISOString() : new Date().toISOString(),
    latestDiagnosis: row.latest_diagnosis || "Chưa có chẩn đoán",
    latestExamTypeCode: row.exam_type_code || null,
    latestExamTypeName: row.exam_type_name || null,
    examStatus: row.exam_status as DoctorMedicalRecordExamStatus,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}
