import { OwnerAppointmentDetail } from "../types/appointment.types";

const luckyImageUrl =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=240&q=80";

const miloImageUrl =
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=240&q=80";

export const MOCK_OWNER_APPOINTMENT_DETAILS: OwnerAppointmentDetail[] = [
  {
    id: "APP-1024",
    appointmentCode: "LH-001245",
    status: "PENDING",
    serviceName: "Khám tổng quát",
    serviceType: "GENERAL_CHECKUP",
    scheduledAt: "2024-05-15T10:30:00.000Z",
    reason: "Lucky cần kiểm tra sức khỏe định kỳ",
    note: "Không có yêu cầu đặc biệt",
    pet: {
      id: "pet_1",
      name: "Lucky",
      species: "Dog",
      breed: "Golden Retriever",
      ageText: "2 tuổi",
      gender: "Đực",
      imageUrl: luckyImageUrl,
    },
    owner: {
      id: "owner_1",
      fullName: "Anna",
      phoneNumber: "0901 234 567",
      email: "anna@example.com",
    },
    timeline: [
      {
        key: "created",
        label: "Đã tạo lịch",
        occurredAt: "2024-05-15T09:15:00.000Z",
        status: "DONE",
      },
      {
        key: "pending",
        label: "Chờ trung tâm xác nhận",
        description:
          "Hệ thống đang chờ nhân viên phòng khám tiếp nhận và xác nhận lịch hẹn của bạn.",
        status: "CURRENT",
      },
      {
        key: "confirmed",
        label: "Đã xác nhận",
        status: "UPCOMING",
      },
      {
        key: "completed",
        label: "Hoàn tất khám",
        status: "UPCOMING",
      },
    ],
  },
  {
    id: "APP-1025",
    appointmentCode: "LH-001246",
    status: "CONFIRMED",
    serviceName: "Tiêm phòng",
    serviceType: "VACCINATION",
    scheduledAt: "2026-10-20T14:00:00.000Z",
    reason: "Milo đến lịch tiêm phòng định kỳ",
    note: "Mang theo sổ tiêm phòng cũ.",
    pet: {
      id: "pet_2",
      name: "Milo",
      species: "Cat",
      ageText: "1 tuổi",
      gender: "Đực",
      imageUrl: miloImageUrl,
    },
    owner: {
      id: "owner_1",
      fullName: "Anna",
      phoneNumber: "0901 234 567",
      email: "anna@example.com",
    },
    timeline: [
      {
        key: "created",
        label: "Đã tạo lịch",
        occurredAt: "2026-10-18T08:15:00.000Z",
        status: "DONE",
      },
      {
        key: "pending",
        label: "Chờ trung tâm xác nhận",
        occurredAt: "2026-10-18T09:00:00.000Z",
        status: "DONE",
      },
      {
        key: "confirmed",
        label: "Đã xác nhận",
        occurredAt: "2026-10-18T10:30:00.000Z",
        status: "CURRENT",
      },
      {
        key: "completed",
        label: "Hoàn tất khám",
        status: "UPCOMING",
      },
    ],
  },
  {
    id: "APP-1029",
    appointmentCode: "LH-001250",
    status: "COMPLETED",
    serviceName: "Xét nghiệm máu",
    serviceType: "LAB_TEST",
    scheduledAt: "2026-11-05T09:30:00.000Z",
    reason: "Milo cần xét nghiệm máu theo chỉ định tái khám",
    note: "Nhịn ăn trước khi xét nghiệm.",
    pet: {
      id: "pet_2",
      name: "Milo",
      species: "Cat",
      ageText: "1 tuổi",
      gender: "Đực",
      imageUrl: miloImageUrl,
    },
    owner: {
      id: "owner_1",
      fullName: "Anna",
      phoneNumber: "0901 234 567",
      email: "anna@example.com",
    },
    timeline: [
      {
        key: "created",
        label: "Đã tạo lịch",
        occurredAt: "2026-11-01T08:00:00.000Z",
        status: "DONE",
      },
      {
        key: "pending",
        label: "Chờ trung tâm xác nhận",
        occurredAt: "2026-11-01T08:20:00.000Z",
        status: "DONE",
      },
      {
        key: "confirmed",
        label: "Đã xác nhận",
        occurredAt: "2026-11-01T10:00:00.000Z",
        status: "DONE",
      },
      {
        key: "completed",
        label: "Hoàn tất khám",
        occurredAt: "2026-11-05T10:45:00.000Z",
        status: "DONE",
      },
    ],
  },
];
