import { DoctorMedicalRecord } from "../types/medical-record.types";

export const MOCK_DOCTOR_MEDICAL_RECORDS: DoctorMedicalRecord[] = [
  {
    id: "record_1",
    pet: {
      id: "PET-9902",
      code: "PT-9902",
      name: "Lucky",
      species: "Dog",
      breed: "Golden Retriever",
    },
    owner: {
      id: "USR-1001",
      fullName: "Nguyễn Văn A",
    },
    latestExam: {
      id: "EX-9902",
      examinedAt: "2024-10-24",
      examTypeName: "Khám da liễu",
      diagnosis: "Viêm da tiết bã",
    },
    alertLevel: "MILD_ALLERGY",
  },
  {
    id: "record_2",
    pet: {
      id: "PET-8810",
      code: "PT-8810",
      name: "Milo",
      species: "Cat",
      breed: "Mèo Anh lông ngắn",
    },
    owner: {
      id: "USR-1002",
      fullName: "Trần Minh Tú",
    },
    latestExam: {
      id: "EX-8810",
      examinedAt: "2024-10-18",
      examTypeName: "Khám định kỳ",
      diagnosis: "Khám định kỳ",
    },
    alertLevel: "NONE",
  },
  {
    id: "record_3",
    pet: {
      id: "PET-7741",
      code: "PT-7741",
      name: "Luna",
      species: "Dog",
      breed: "Poodle",
    },
    owner: {
      id: "USR-1003",
      fullName: "Phạm Hùng",
    },
    latestExam: {
      id: "EX-7741",
      examinedAt: "2024-10-15",
      examTypeName: "Tái khám",
      diagnosis: "Tái khám vết thương",
    },
    alertLevel: "MONITORING",
  },
  {
    id: "record_4",
    pet: {
      id: "PET-6620",
      code: "PT-6620",
      name: "Bé Miu",
      species: "Cat",
      breed: "Mèo ta",
    },
    owner: {
      id: "USR-1004",
      fullName: "Lê Văn Khoa",
    },
    latestExam: {
      id: "EX-6620",
      examinedAt: "2024-10-12",
      examTypeName: "Theo dõi tiêu hóa",
      diagnosis: "Theo dõi tiêu hóa",
    },
    alertLevel: "NONE",
  },
  {
    id: "MR-5488",
    pet: {
      id: "PET-5488",
      code: "PT-5488",
      name: "Bông",
      species: "Dog",
      breed: "Samoyed",
    },
    owner: {
      id: "USR-1005",
      fullName: "Hoàng Thu Hà",
    },
    latestExam: {
      id: "EX-5488",
      examinedAt: "2024-10-10",
      examTypeName: "Tiêm phòng",
      diagnosis: "Tiêm vaccine dại nhắc lại",
    },
    alertLevel: "NONE",
  },
  {
    id: "MR-4317",
    pet: {
      id: "PET-4317",
      code: "PT-4317",
      name: "Coca",
      species: "Dog",
      breed: "Corgi",
    },
    owner: {
      id: "USR-1006",
      fullName: "Đặng Quốc Bảo",
    },
    latestExam: {
      id: "EX-4317",
      examinedAt: "2024-10-08",
      examTypeName: "Xét nghiệm máu",
      diagnosis: "Thiếu máu nhẹ",
    },
    alertLevel: "MONITORING",
  },
  {
    id: "MR-3290",
    pet: {
      id: "PET-3290",
      code: "PT-3290",
      name: "Nâu",
      species: "Cat",
      breed: "Mèo Ba Tư",
    },
    owner: {
      id: "USR-1007",
      fullName: "Vũ Ngọc Mai",
    },
    latestExam: {
      id: "EX-3290",
      examinedAt: "2024-10-04",
      examTypeName: "Khám tổng quát",
      diagnosis: "Sức khỏe ổn định",
    },
    alertLevel: "NONE",
  },
  {
    id: "MR-2175",
    pet: {
      id: "PET-2175",
      code: "PT-2175",
      name: "Ken",
      species: "Dog",
      breed: "Shiba Inu",
    },
    owner: {
      id: "USR-1008",
      fullName: "Bùi Thanh Sơn",
    },
    latestExam: {
      id: "EX-2175",
      examinedAt: "2024-09-29",
      examTypeName: "Siêu âm ổ bụng",
      diagnosis: "Viêm ruột cấp",
    },
    alertLevel: "HIGH_RISK",
  },
  {
    id: "MR-1962",
    pet: {
      id: "PET-1962",
      code: "PT-1962",
      name: "Mochi",
      species: "Cat",
      breed: "Ragdoll",
    },
    owner: {
      id: "USR-1009",
      fullName: "Ngô Thảo Linh",
    },
    latestExam: {
      id: "EX-1962",
      examinedAt: "2024-09-26",
      examTypeName: "Khám tai mũi họng",
      diagnosis: "Viêm tai ngoài",
    },
    alertLevel: "MILD_ALLERGY",
  },
  {
    id: "MR-1184",
    pet: {
      id: "PET-1184",
      code: "PT-1184",
      name: "Đốm",
      species: "Other",
      breed: "Thỏ Hà Lan",
    },
    owner: {
      id: "USR-1010",
      fullName: "Cao Minh Anh",
    },
    latestExam: {
      id: "EX-1184",
      examinedAt: "2024-09-21",
      examTypeName: "Khác",
      diagnosis: "Mòn răng hàm",
    },
    alertLevel: "MONITORING",
  },
  {
    id: "MR-0972",
    pet: {
      id: "PET-0972",
      code: "PT-0972",
      name: "Ruby",
      species: "Dog",
      breed: "Pomeranian",
    },
    owner: {
      id: "USR-1011",
      fullName: "Đỗ Lan Phương",
    },
    latestExam: {
      id: "EX-0972",
      examinedAt: "2024-09-18",
      examTypeName: "Tái khám",
      diagnosis: "Theo dõi sau phẫu thuật",
    },
    alertLevel: "HIGH_RISK",
  },
  {
    id: "MR-0845",
    pet: {
      id: "PET-0845",
      code: "PT-0845",
      name: "Simba",
      species: "Cat",
      breed: "Maine Coon",
    },
    owner: {
      id: "USR-1012",
      fullName: "Hồ Đức Nam",
    },
    latestExam: {
      id: "EX-0845",
      examinedAt: "2024-09-14",
      examTypeName: "Xét nghiệm nước tiểu",
      diagnosis: "Nghi ngờ viêm đường tiết niệu",
    },
    alertLevel: "MONITORING",
  },
];
