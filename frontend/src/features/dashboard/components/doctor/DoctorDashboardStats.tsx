import {
  BriefcaseMedical,
  CalendarClock,
  Clock,
  Stethoscope,
} from "lucide-react";

import type { DoctorDashboardStats as DoctorDashboardStatsData } from "../../types/doctor-dashboard.types";
import { formatDoctorStatCount } from "../../utils/doctor-dashboard-format";
import { DoctorStatCard } from "./DoctorStatCard";

interface DoctorDashboardStatsProps {
  stats: DoctorDashboardStatsData;
}

const doctorStatConfig = [
  {
    key: "todayExamCount",
    label: "Phiếu khám hôm nay",
    icon: BriefcaseMedical,
    iconClassName: "bg-petcenter-primary/10 text-petcenter-primary",
  },
  {
    key: "waitingExamCount",
    label: "Chờ khám",
    icon: Clock,
    iconClassName: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  {
    key: "inProgressExamCount",
    label: "Đang khám",
    icon: Stethoscope,
    iconClassName: "bg-petcenter-info-bg text-petcenter-info-text",
  },
  {
    key: "followUpCount",
    label: "Tái khám",
    icon: CalendarClock,
    iconClassName: "bg-petcenter-success-bg text-petcenter-success-text",
  },
] as const;

export function DoctorDashboardStats({ stats }: DoctorDashboardStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
      {doctorStatConfig.map((item) => (
        <DoctorStatCard
          count={formatDoctorStatCount(stats[item.key])}
          icon={item.icon}
          iconClassName={item.iconClassName}
          key={item.key}
          label={item.label}
        />
      ))}
    </section>
  );
}
