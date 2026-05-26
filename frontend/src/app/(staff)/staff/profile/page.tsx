import { UserRound } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffProfilePage() {
  return (
    <StaffModulePlaceholderPage
      title="Hồ sơ cá nhân"
      description="Thông tin cá nhân và thiết lập tài khoản của nhân viên sẽ được triển khai tại đây. Route này được truy cập qua avatar trên header."
      icon={UserRound}
    />
  );
}
