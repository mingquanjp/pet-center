import { DoctorExaminationType } from "../types/examination.types"

export type DoctorExamFieldConfig = {
  name: string
  label: string
  type: "text" | "number" | "date" | "select" | "file"
  required: boolean
  placeholder?: string
  unit?: string
  options?: Array<{ value: string; label: string }>
  fullWidth?: boolean
  singleLine?: boolean
}

export const clinicalExamFields: DoctorExamFieldConfig[] = [
  {
    name: "temperatureC",
    label: "Nhiệt độ",
    type: "number",
    required: true,
    unit: "°C",
  },
  {
    name: "weightKg",
    label: "Cân nặng",
    type: "number",
    required: true,
    unit: "kg",
  },
  {
    name: "heartRateBpm",
    label: "Nhịp tim",
    type: "number",
    required: true,
    unit: "bpm",
  },
  {
    name: "clinicalSymptoms",
    label: "Triệu chứng lâm sàng ghi nhận",
    type: "text",
    required: true,
    placeholder: "Mô tả triệu chứng quan sát được khi khám trực tiếp...",
    fullWidth: true,
  },
]

export const examTypeFieldConfig: Record<DoctorExaminationType, DoctorExamFieldConfig[]> = {
  GENERAL_CHECKUP: [
    {
      name: "generalCondition",
      label: "Tình trạng tổng quát",
      type: "text",
      required: true,
      placeholder: "Nhập tình trạng tổng quát của thú cưng...",
      fullWidth: true,
    },
    {
      name: "skinCoatCondition",
      label: "Da / lông",
      type: "text",
      required: false,
      placeholder: "Ghi nhận tình trạng da, lông, vết thương ngoài da nếu có...",
      fullWidth: false,
    },
    {
      name: "eyesEarsNoseMouth",
      label: "Mắt / tai / mũi / miệng",
      type: "text",
      required: false,
      placeholder: "Ghi nhận tình trạng mắt, tai, mũi, miệng...",
      fullWidth: false,
    },
    {
      name: "cardioRespiratory",
      label: "Hô hấp / tim phổi",
      type: "text",
      required: false,
      placeholder: "Ghi nhận nhịp thở, tim phổi, dấu hiệu bất thường...",
      fullWidth: false,
    },
    {
      name: "digestiveCondition",
      label: "Tiêu hóa",
      type: "text",
      required: false,
      placeholder: "Ghi nhận ăn uống, nôn, tiêu chảy, đại tiện...",
      fullWidth: false,
    },
    {
      name: "suggestedLabTest",
      label: "Đề xuất xét nghiệm thêm nếu cần",
      type: "text",
      required: false,
      placeholder: "Ví dụ: Đề xuất xét nghiệm máu nếu triệu chứng không cải thiện...",
      fullWidth: true,
    },
    {
      name: "generalCheckupNote",
      label: "Nhận xét khám tổng quát",
      type: "text",
      required: false,
      placeholder: "Nhập nhận xét riêng cho phần khám tổng quát...",
      fullWidth: true,
    },
  ],
  VACCINATION: [
    {
      name: "vaccineName",
      label: "Tên vaccine",
      type: "text",
      required: true,
      placeholder: "Nhập tên vaccine...",
      singleLine: true,
    },
    {
      name: "vaccinationDate",
      label: "Ngày tiêm",
      type: "date",
      required: true,
    },
    {
      name: "doseNumber",
      label: "Mũi tiêm",
      type: "select",
      required: false,
      options: [
        { value: "dose_1", label: "Mũi 1" },
        { value: "dose_2", label: "Mũi 2" },
        { value: "booster", label: "Mũi nhắc lại" },
        { value: "other", label: "Khác" },
      ],
    },
    {
      name: "vaccineBatchNumber",
      label: "Lô vaccine",
      type: "text",
      required: false,
      singleLine: true,
    },
    {
      name: "postVaccinationReaction",
      label: "Phản ứng sau tiêm",
      type: "text",
      required: false,
      placeholder: "Ghi nhận phản ứng sau tiêm nếu có...",
      fullWidth: false,
    },
    {
      name: "vaccinationNote",
      label: "Ghi chú sau tiêm",
      type: "text",
      required: false,
      fullWidth: false,
    },
  ],
  LAB_TEST: [
    {
      name: "labTestType",
      label: "Loại xét nghiệm",
      type: "select",
      required: true,
      options: [
        { value: "blood_general", label: "Xét nghiệm máu tổng quát" },
        { value: "fecal", label: "Xét nghiệm phân" },
        { value: "parvo_care", label: "Test Parvo/Care" },
        { value: "skin_coat", label: "Xét nghiệm da/lông" },
        { value: "other", label: "Khác" },
      ],
    },
    {
      name: "labPerformedDate",
      label: "Ngày thực hiện",
      type: "date",
      required: true,
    },
    {
      name: "labResultText",
      label: "Kết quả ghi nhận",
      type: "text",
      required: false,
      fullWidth: false,
    },
    {
      name: "labDoctorComment",
      label: "Nhận xét của bác sĩ",
      type: "text",
      required: false,
      fullWidth: false,
    },
    {
      name: "labResultFile",
      label: "Tệp kết quả đính kèm",
      type: "file",
      required: false,
      fullWidth: true,
    },
  ],
  RECHECK: [
    {
      name: "currentCondition",
      label: "Tình trạng hiện tại",
      type: "text",
      required: true,
      placeholder: "Mô tả tình trạng hiện tại khi tái khám...",
      fullWidth: true,
    },
    {
      name: "improvementLevel",
      label: "Mức độ cải thiện",
      type: "select",
      required: true,
      options: [
        { value: "good", label: "Cải thiện tốt" },
        { value: "partial", label: "Cải thiện một phần" },
        { value: "none", label: "Không cải thiện" },
        { value: "worse", label: "Nặng hơn" },
      ],
    },
    {
      name: "nextTreatmentPlan",
      label: "Hướng xử lý tiếp theo",
      type: "text",
      required: true,
      placeholder: "Nhập hướng điều trị hoặc theo dõi tiếp theo...",
      fullWidth: false,
    },
  ],
}

export const examTypeSectionTitle: Record<DoctorExaminationType, string> = {
  GENERAL_CHECKUP: "Khám tổng quát",
  VACCINATION: "Tiêm phòng",
  LAB_TEST: "Xét nghiệm",
  RECHECK: "Tái khám",
}
