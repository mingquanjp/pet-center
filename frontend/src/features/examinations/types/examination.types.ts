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
  doctor?: {
    id?: string
    fullName?: string
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
  recentHistory: Array<{
    appointmentId: string
    examinationCode: string
    scheduledAt: string
    examTypeName: string
    diagnosis?: string
  }>
  medicines: DoctorMedicineOption[]
  prescription: DoctorPrescription | null
  vaccination: DoctorVaccination | null
  followUp: DoctorFollowUpInstruction | null
  recheckContext: DoctorRecheckContext | null
}

export interface DoctorMedicineOption {
  id: string
  name: string
  unit: string
  stockQuantity: number
  status: string
}

export interface DoctorPrescriptionItem {
  id?: string
  medicineId: string
  medicineName?: string
  medicineUnit?: string
  quantity?: number
  dosage: string
  frequency: string
  duration: string
  usageInstruction: string
  note?: string
}

export interface DoctorPrescription {
  id: string
  prescribedAt: string
  generalNote?: string
  items: DoctorPrescriptionItem[]
}

export interface DoctorVaccination {
  id?: string
  vaccineName: string
  vaccinationDate: string
  note?: string
}

export interface DoctorFollowUpInstruction {
  id?: string
  followUpDate: string
  reason: string
  ownerNote?: string
}

export interface DoctorRecheckContext {
  previousExamId?: string
  previousAppointmentId?: string
  previousExaminationCode?: string
  previousDiagnosis?: string
  followUpReason?: string
}

export interface SaveDraftDoctorExaminationPayload {
  diagnosis?: string
  conclusion?: string
  healthNote?: string
  fieldValues?: Array<{
    fieldDefinitionId: string
    valueText?: string
    valueNumber?: number
    valueDate?: string
    fileUrl?: string
  }>
}

export interface CompleteDoctorExaminationPayload extends SaveDraftDoctorExaminationPayload {
  diagnosis: string
  conclusion: string
  prescriptionItems?: DoctorPrescriptionItem[]
  dispenseMedicine?: boolean
  vaccination?: DoctorVaccination
  followUp?: DoctorFollowUpInstruction
}

export interface DoctorExaminationFilters {
  search: string
  status: DoctorExaminationTab
  examType: DoctorExaminationTypeFilter
  date: string
  page: number
  limit: number
}
