export type DoctorExaminationStatus = "WAITING" | "EXAMINING" | "COMPLETED" | "FOLLOW_UP"

export type DoctorExaminationTab = "ALL" | DoctorExaminationStatus

export type DoctorExaminationType = "GENERAL_CHECKUP" | "VACCINATION" | "LAB_TEST" | "RECHECK"

export type DoctorExaminationTypeFilter = "ALL" | DoctorExaminationType

export interface DoctorExamination {
  id: string
  examId?: string | null
  examinationCode: string
  appointmentCode: string
  pet: {
    id: string
    name: string
    species: "Dog" | "Cat" | "Other"
    breed?: string
    ageText?: string
    imageUrl?: string
  }
  owner: {
    id: string
    fullName: string
    phoneNumber?: string
    email?: string
  }
  scheduledAt: string
  examType: {
    id: string
    code: DoctorExaminationType
    name: string
  }
  status: DoctorExaminationStatus
  symptomDescription?: string
  internalNote?: string
}

export interface DoctorExaminationField {
  id: string
  name: string
  label: string
  type: "text" | "number" | "date" | "select" | "file"
  isRequired: boolean
  displayOrder: number
  optionSource?: string | null
  value?: {
    text?: string | null
    number?: number | null
    date?: string | null
    fileUrl?: string | null
  } | null
}

export interface DoctorExaminationDetail extends DoctorExamination {
  pet: DoctorExamination["pet"] & {
    gender?: string
    weightText?: string
  }
  diagnosis: string
  conclusion: string
  healthNote: string
  examDate?: string
  fields: DoctorExaminationField[]
}

export interface CompleteDoctorExaminationPayload {
  diagnosis: string
  conclusion: string
  healthNote?: string
  fieldValues?: Array<{
    fieldDefinitionId: string
    valueText?: string
    valueNumber?: number
    valueDate?: string
    fileUrl?: string
  }>
}

export interface DoctorExaminationFilters {
  search: string
  status: DoctorExaminationTab
  examType: DoctorExaminationTypeFilter
  date: string
  page: number
  limit: number
}
