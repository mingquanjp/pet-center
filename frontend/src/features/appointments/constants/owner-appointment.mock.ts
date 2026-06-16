import { OwnerAppointment } from "../types/appointment.types";

const luckyImageUrl =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=160&q=80";

const miloImageUrl =
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=160&q=80";

export const MOCK_OWNER_APPOINTMENTS: OwnerAppointment[] = [
  {
    id: "APP-1024",
    appointmentCode: "APP-1024",
    pet: {
      id: "PET-LUCKY",
      name: "Lucky",
      species: "Dog",
      breed: "Golden Retriever",
      imageUrl: luckyImageUrl,
    },
    examType: {
      id: "EXAM-GENERAL-01",
      code: "GENERAL_CHECKUP",
      name: "Khám sức khỏe định kỳ",
    },
    scheduledAt: "2026-10-15T09:00:00.000Z",
    status: "CONFIRMED",
  },
  {
    id: "APP-1025",
    appointmentCode: "APP-1025",
    pet: {
      id: "PET-MILO",
      name: "Milo",
      species: "Cat",
      imageUrl: miloImageUrl,
    },
    examType: {
      id: "EXAM-VACCINATION-01",
      code: "VACCINATION",
      name: "Tiêm phòng định kỳ",
    },
    scheduledAt: "2026-10-20T14:00:00.000Z",
    status: "PENDING",
  },
  {
    id: "APP-1026",
    appointmentCode: "APP-1026",
    pet: {
      id: "PET-BE-BONG",
      name: "Bé Bông",
      species: "Other",
    },
    examType: {
      id: "EXAM-LAB-01",
      code: "LAB_TEST",
      name: "Xét nghiệm",
    },
    scheduledAt: "2026-10-25T10:30:00.000Z",
    status: "PENDING",
  },
  {
    id: "APP-1027",
    appointmentCode: "APP-1027",
    pet: {
      id: "PET-MIMI",
      name: "Mimi",
      species: "Cat",
    },
    examType: {
      id: "EXAM-RECHECK-01",
      code: "RECHECK",
      name: "Khám định kỳ",
    },
    scheduledAt: "2026-10-28T08:30:00.000Z",
    status: "CONFIRMED",
  },
  {
    id: "APP-1028",
    appointmentCode: "APP-1028",
    pet: {
      id: "PET-LUCKY",
      name: "Lucky",
      species: "Dog",
      breed: "Golden Retriever",
      imageUrl: luckyImageUrl,
    },
    examType: {
      id: "EXAM-GENERAL-02",
      code: "GENERAL_CHECKUP",
      name: "Khám tổng quát",
    },
    scheduledAt: "2026-11-02T15:00:00.000Z",
    status: "PENDING",
  },
  {
    id: "APP-1029",
    appointmentCode: "APP-1029",
    pet: {
      id: "PET-MILO",
      name: "Milo",
      species: "Cat",
      imageUrl: miloImageUrl,
    },
    examType: {
      id: "EXAM-LAB-02",
      code: "LAB_TEST",
      name: "Xét nghiệm máu",
    },
    scheduledAt: "2026-11-05T09:30:00.000Z",
    status: "CONFIRMED",
  },
];

export const MOCK_OWNER_APPOINTMENT_PET_OPTIONS = [
  { value: "ALL", label: "Thú cưng: Tất cả" },
  { value: "PET-LUCKY", label: "Lucky" },
  { value: "PET-MILO", label: "Milo" },
  { value: "PET-BE-BONG", label: "Bé Bông" },
  { value: "PET-MIMI", label: "Mimi" },
];
