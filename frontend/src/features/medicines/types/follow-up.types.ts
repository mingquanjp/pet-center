export type DoctorFollowUpStatus = "upcoming" | "overdue" | "completed"
export type DoctorFollowUpStatusFilter = "all" | DoctorFollowUpStatus

export interface DoctorFollowUpPet {
  id: string
  name: string
  species: string
  speciesLabel: string
  breed?: string | null
  ageLabel?: string
  genderLabel?: string
  imageUrl?: string | null
}

export interface DoctorFollowUpOwner {
  id: string
  fullName: string
  phoneNumber?: string | null
  email?: string | null
}

export interface DoctorFollowUpDoctor {
  id: string
  fullName: string
}

export interface DoctorFollowUpExam {
  id: string
  examinationCode: string
  examDate: string
  diagnosis?: string | null
  conclusion?: string | null
  medicineCount: number
}

export interface DoctorFollowUpListItem {
  followUpId: string
  followUpCode: string
  examId: string
  examinationCode: string
  appointmentId: string
  followUpDate: string
  reason?: string | null
  ownerNote?: string | null
  status: DoctorFollowUpStatus
  completedAt?: string | null
  pet: DoctorFollowUpPet
  owner: DoctorFollowUpOwner
  doctor: DoctorFollowUpDoctor
  exam: DoctorFollowUpExam
}

export interface DoctorFollowUpDetail extends DoctorFollowUpListItem {
  exam: DoctorFollowUpExam & {
    healthNote?: string | null
    prescription: {
      prescriptionId: string
      prescribedAt?: string | null
      generalNote?: string | null
      medicineCount: number
    } | null
  }
  reminderHistory: Array<{
    title: string
    time: string
    description: string
  }>
}

export interface DoctorFollowUpStats {
  upcomingCount: number
  overdueCount: number
  completedCount: number
}

export interface DoctorFollowUpPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DoctorFollowUpFilters {
  search: string
  status: DoctorFollowUpStatusFilter
  date: string
  page: number
  limit: number
}
