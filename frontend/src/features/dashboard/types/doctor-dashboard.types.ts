export type DoctorExamStatus =
  | "WAITING"
  | "EXAMINING";

export interface DoctorDashboardStats {
  todayExamCount: number;
  waitingExamCount: number;
  inProgressExamCount: number;
  followUpCount: number;
}

export interface DoctorAssignedExam {
  id: string;
  examId: string;
  examinationCode: string;
  appointmentCode: string;
  examCode: string;
  pet: {
    id: string;
    name: string;
    species: "Dog" | "Cat" | "Other";
    breed?: string;
    ageText?: string;
    avatarUrl?: string | null;
    imageUrl?: string;
    description?: string;
  };
  owner: {
    id: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  scheduledTime: string;
  scheduledAt?: string;
  examType: {
    id: string;
    code: string;
    name: string;
  };
  status: DoctorExamStatus;
}

export interface DoctorRecentActivity {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
  note?: string;
  tag?: string;
  type: "MEDICAL_RECORD" | "SURGERY_REQUEST" | "PRESCRIPTION" | "FOLLOW_UP";
}

export interface DoctorDashboardData {
  doctor: {
    id: string;
    fullName: string;
    roleLabel: string;
    avatarUrl?: string;
  };
  stats: DoctorDashboardStats;
  assignedExams: DoctorAssignedExam[];
  recentActivities: DoctorRecentActivity[];
}
