import { StaffAppointmentDetail } from "../types/appointment.types";

export const MOCK_STAFF_APPOINTMENT_DETAILS: StaffAppointmentDetail[] = [
  {
    id: "app_1",
    appointmentCode: "LH-0892",
    status: "PENDING",
    pet: {
      id: "pet_1",
      name: "Milo",
      species: "Dog",
      breed: "Golden Retriever",
      ageText: "2 tuổi",
      weightText: "15 kg",
    },
    owner: {
      id: "owner_1",
      fullName: "Trần Thị B",
      phoneNumber: "0912345678",
      email: "tran.thib@email.com",
    },
    examType: {
      id: "exam_type_1",
      code: "GENERAL_CHECKUP",
      name: "Khám tổng quát",
    },
    scheduledAt: "2023-11-14T09:00:00.000Z",
    bookingChannel: "ONLINE",
    symptomDescription: "Bé hơi mệt, ăn ít trong 2 ngày gần đây. Mong bác sĩ kiểm tra kỹ giúp em.",
    ownerNote: "Bé hơi mệt, ăn ít trong 2 ngày gần đây. Mong bác sĩ kiểm tra kỹ giúp em.",
    assignedDoctor: null,
  },
  {
    id: "app_3",
    appointmentCode: "LH-0890",
    status: "CONFIRMED",
    pet: {
      id: "pet_3",
      name: "Luna",
      species: "Cat",
      breed: "British Shorthair",
      ageText: "1 tuổi",
      weightText: "4.5 kg",
    },
    owner: {
      id: "owner_3",
      fullName: "Lê Văn C",
      phoneNumber: "0987654321",
    },
    examType: {
      id: "exam_type_2",
      code: "VACCINATION",
      name: "Tiêm phòng",
    },
    scheduledAt: "2023-11-15T14:30:00.000Z",
    bookingChannel: "COUNTER",
    assignedDoctor: {
      id: "doctor_1",
      fullName: "Bs. Nguyễn Văn A",
    },
  },
  {
    id: "app_4",
    appointmentCode: "LH-0891",
    status: "REJECTED",
    rejectionReason: "Phòng khám đã kín lịch vào khung giờ này.",
    pet: {
      id: "pet_4",
      name: "Bella",
      species: "Dog",
      breed: "Poodle",
      ageText: "3 tuổi",
      weightText: "6 kg",
    },
    owner: {
      id: "owner_4",
      fullName: "Phạm Thị D",
      phoneNumber: "0901112223",
    },
    examType: {
      id: "exam_type_1",
      code: "GENERAL_CHECKUP",
      name: "Khám tổng quát",
    },
    scheduledAt: "2023-11-16T10:00:00.000Z",
    bookingChannel: "ONLINE",
    assignedDoctor: null,
  }
];
