import {
  OwnerAppointmentPetOption,
  OwnerAppointmentTimeSlot,
  OwnerExamTypeOption,
} from "../types/appointment.types";

export const MOCK_OWNER_PETS: OwnerAppointmentPetOption[] = [
  {
    id: "pet_lucky",
    name: "Lucky",
    species: "Dog",
    breed: "Golden Retriever",
    ageText: "2 tuổi",
    weightText: "18 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "pet_milo",
    name: "Milo",
    species: "Cat",
    ageText: "1.5 tuổi",
    weightText: "4.5 kg",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "pet_be_bong",
    name: "Bé Bông",
    species: "Other",
    ageText: "8 tháng",
    weightText: "1.2 kg",
  },
];

export const MOCK_OWNER_EXAM_TYPES: OwnerExamTypeOption[] = [
  {
    id: "exam_general",
    code: "GENERAL_CHECKUP",
    name: "Khám tổng quát",
    description: "Kiểm tra sức khỏe định kỳ và tư vấn chăm sóc.",
  },
  {
    id: "exam_vaccination",
    code: "VACCINATION",
    name: "Tiêm phòng",
    description: "Tiêm phòng theo lịch hoặc nhắc lại vaccine.",
  },
  {
    id: "exam_lab",
    code: "LAB_TEST",
    name: "Xét nghiệm",
    description: "Xét nghiệm máu, nước tiểu hoặc chỉ số cơ bản.",
  },
  {
    id: "exam_recheck",
    code: "RECHECK",
    name: "Tái khám",
    description: "Theo dõi sau điều trị hoặc sau lần khám trước.",
  },
  {
    id: "exam_emergency",
    code: "GENERAL_CHECKUP",
    name: "Cấp cứu",
    description: "Tiếp nhận tình trạng cần xử lý nhanh.",
  },
];

export const MOCK_OWNER_TIME_SLOTS: OwnerAppointmentTimeSlot[] = [
  { value: "08:00", label: "08:00" },
  { value: "09:00", label: "09:00" },
  { value: "10:30", label: "10:30" },
  { value: "14:00", label: "14:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:30", label: "16:30", disabled: true },
];
