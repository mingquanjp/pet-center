import { Bell } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffNotificationsPage() {
  return (
    <StaffModulePlaceholderPage
      title="Thông báo"
      description="Danh sách thông báo đầy đủ cho nhân viên sẽ được triển khai tại đây. Route này không xuất hiện trong sidebar theo đặc tả."
      icon={Bell}
    />
  );
}
