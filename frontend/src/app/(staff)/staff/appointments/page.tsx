import { CalendarDays } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffAppointmentsPage() {
  return (
    <StaffModulePlaceholderPage
      title="Lịch hẹn"
      description="Màn hình tiếp nhận, xác nhận và cập nhật trạng thái lịch hẹn của nhân viên sẽ được triển khai tại đây."
      icon={CalendarDays}
    />
  );
}
