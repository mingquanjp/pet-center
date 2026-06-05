import type { DoctorDashboardData } from "../../types/doctor-dashboard.types";

interface DoctorDashboardHeaderProps {
  doctor: DoctorDashboardData["doctor"];
}

export function DoctorDashboardHeader({ doctor }: DoctorDashboardHeaderProps) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="heading-lg text-petcenter-text">
        Chào mừng {doctor.fullName}
      </h1>
      <p className="body-md max-w-3xl text-petcenter-text-secondary">
        Dưới đây là tổng quan công việc chuyên môn của bạn trong ngày hôm nay.
      </p>
    </section>
  );
}
