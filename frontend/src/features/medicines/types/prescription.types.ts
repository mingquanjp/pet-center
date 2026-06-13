export type DoctorPrescriptionStatus = "prescribed" | "result_recorded" | "follow_up_required"
export type DoctorPrescriptionStatusFilter = "ALL" | DoctorPrescriptionStatus

export interface DoctorPrescriptionPet {
  id: string
  name: string
  species: string
  speciesLabel: string
  breed?: string | null
  ageLabel?: string
  imageUrl?: string | null
}

export interface DoctorPrescriptionOwner {
  id: string
  fullName: string
  phoneNumber?: string | null
}

export interface DoctorPrescriptionListItem {
  prescriptionId: string
  prescriptionCode: string
  examId: string
  examinationCode: string
  prescribedDate: string
  status: DoctorPrescriptionStatus
  doctorName: string
  diagnosis?: string | null
  conclusion?: string | null
  generalNote?: string | null
  medicineCount: number
  hasFollowUp: boolean
  pet: DoctorPrescriptionPet
  owner: DoctorPrescriptionOwner
}

export interface DoctorPrescriptionMedicine {
  prescriptionItemId: string
  medicineId: string
  medicineName: string
  medicineUnit: string
  quantity?: string | null
  dosage: string
  frequency: string
  duration: string
  usageInstruction?: string | null
  note?: string | null
}

export interface DoctorPrescriptionDetail extends Omit<DoctorPrescriptionListItem, "doctorName" | "medicineCount" | "hasFollowUp"> {
  doctor: {
    id: string
    fullName: string
  }
  medicines: DoctorPrescriptionMedicine[]
  followUp: {
    followUpId: string
    followUpDate: string
    reason?: string | null
    ownerNote?: string | null
  } | null
}

export interface DoctorPrescriptionStats {
  totalCount: number
  todayCount: number
  followUpCount: number
}

export interface DoctorPrescriptionPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DoctorPrescriptionFilters {
  search: string
  status: DoctorPrescriptionStatusFilter
  date: string
  page: number
  limit: number
}
