import { StaffDoctor } from "../types/appointment.types";

export const MOCK_STAFF_DOCTORS: StaffDoctor[] = [
  {
    id: "doctor_1",
    fullName: "Bs. Nguyễn Văn A",
    phoneNumber: "0901000001",
    email: "doctor.a@petcenter.vn",
    workingStatus: "ACTIVE",
    schedules: [
      {
        appointmentId: "busy_1",
        startsAt: "2023-11-14T09:00:00.000Z",
        endsAt: "2023-11-14T10:00:00.000Z"
      }
    ],
  },
  {
    id: "doctor_2",
    fullName: "Bs. Trần Minh C",
    phoneNumber: "0901000002",
    email: "doctor.c@petcenter.vn",
    workingStatus: "ACTIVE",
    schedules: [
      {
        appointmentId: "busy_2",
        startsAt: "2023-11-14T08:00:00.000Z",
        endsAt: "2023-11-14T09:00:00.000Z"
      }
    ],
  },
  {
    id: "doctor_3",
    fullName: "Bs. Lê Thu D",
    phoneNumber: "0901000003",
    email: "doctor.d@petcenter.vn",
    workingStatus: "ACTIVE",
    schedules: [
      {
        appointmentId: "busy_3",
        startsAt: "2023-11-14T09:30:00.000Z",
        endsAt: "2023-11-14T10:30:00.000Z"
      }
    ],
  },
  {
    id: "doctor_4",
    fullName: "Bs. Phạm Hoàng E",
    phoneNumber: "0901000004",
    email: "doctor.e@petcenter.vn",
    workingStatus: "ACTIVE",
    schedules: [],
  },
];
