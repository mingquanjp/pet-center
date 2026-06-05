import type { DoctorDashboardData } from "../types/doctor-dashboard.types";

export const MOCK_DOCTOR_DASHBOARD: DoctorDashboardData = {
  doctor: {
    id: "doctor_1",
    fullName: "BS. Nguyễn Văn A",
    roleLabel: "Bác sĩ thú y",
  },
  stats: {
    todayExamCount: 2,
    waitingExamCount: 1,
    inProgressExamCount: 1,
    followUpCount: 0,
  },
  assignedExams: [
    {
      id: "appt_2024_001",
      examId: "mex_2024_001",
      examinationCode: "PK-2024-001",
      appointmentCode: "LH-2024-001",
      examCode: "PK-2024-001",
      pet: {
        id: "pet_1",
        name: "Milo",
        species: "Dog",
        breed: "Poodle",
        ageText: "3 tuổi",
        description: "Dog · Poodle · 3 tuổi",
      },
      owner: {
        id: "owner_1",
        fullName: "Trần Minh Tú",
        phoneNumber: "0900000001",
      },
      scheduledAt: "2026-06-03T01:30:00.000Z",
      scheduledTime: "08:30",
      examType: {
        id: "exam_type_general",
        code: "GENERAL_CHECKUP",
        name: "Khám tổng quát",
      },
      status: "EXAMINING",
    },
    {
      id: "appt_2024_002",
      examId: null,
      examinationCode: "PK-2024-002",
      appointmentCode: "LH-2024-002",
      examCode: "PK-2024-002",
      pet: {
        id: "pet_2",
        name: "Lucky",
        species: "Dog",
        breed: "Corgi",
        ageText: "2 tuổi",
        description: "Dog · Corgi · 2 tuổi",
      },
      owner: {
        id: "owner_2",
        fullName: "Nguyễn Thị Hoa",
        phoneNumber: "0900000002",
      },
      scheduledAt: "2026-06-03T02:15:00.000Z",
      scheduledTime: "09:15",
      examType: {
        id: "exam_type_vaccination",
        code: "VACCINATION",
        name: "Tiêm phòng",
      },
      status: "WAITING",
    },
  ],
  recentActivities: [],
};
