import React from "react";
import { Activity, CalendarClock, Pill, Syringe } from "lucide-react";
import { DoctorMedicalRecordDetail } from "../../../types/medical-record.types";
import { formatDate } from "../../../utils/medical-record-format";

interface Props {
  detail: DoctorMedicalRecordDetail;
}

export function DoctorQuickStatsCard({ detail }: Props) {
  const sortedExams = [...detail.exams].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  const latestExamDate = sortedExams[0]?.examDate ?? null;
  const pendingFollowUps = detail.followUps.filter((followUp) => followUp.followUpStatus === "pending").length;

  return (
    <div className="w-full rounded-2xl border border-petcenter-border bg-white p-6 shadow-card">
      <h3 className="mb-6 text-lg font-bold text-petcenter-text">Tổng quan bệnh án</h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-petcenter-border">
        <StatItem
          icon={<Activity className="h-4 w-4 text-blue-600" />}
          iconClassName="bg-blue-50"
          label="Lần khám gần nhất"
          value={latestExamDate ? formatDate(latestExamDate) : "Chưa có"}
          description={`Tổng cộng ${detail.exams.length} lần khám`}
        />
        <StatItem
          icon={<Pill className="h-4 w-4 text-emerald-600" />}
          iconClassName="bg-emerald-50"
          label="Đơn thuốc"
          value={`${detail.prescriptions.length} đơn`}
          description="Theo các lần khám"
        />
        <StatItem
          icon={<Syringe className="h-4 w-4 text-purple-600" />}
          iconClassName="bg-purple-50"
          label="Mũi tiêm"
          value={`${detail.vaccinations.length} mũi`}
          description="Lịch sử tiêm phòng"
        />
        <StatItem
          icon={<CalendarClock className="h-4 w-4 text-orange-600" />}
          iconClassName="bg-orange-50"
          label="Tái khám"
          value={`${pendingFollowUps} đang chờ`}
          description={`Tổng cộng ${detail.followUps.length} lịch`}
        />
      </div>
    </div>
  );
}

function StatItem({
  icon,
  iconClassName,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 lg:px-6 first:lg:pl-0 last:lg:pr-0">
      <div className="mb-2 flex items-center gap-2 text-petcenter-text-secondary">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClassName}`}>{icon}</div>
        <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-petcenter-text">{value}</div>
      <div className="text-sm font-medium text-petcenter-text-secondary">{description}</div>
    </div>
  );
}
