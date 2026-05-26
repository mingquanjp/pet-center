import { Home } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffBoardingPage() {
  return (
    <StaffModulePlaceholderPage
      title="Lưu trú"
      description="Màn hình xác nhận lưu trú, check-in, cập nhật chăm sóc và check-out sẽ được triển khai tại đây."
      icon={Home}
    />
  );
}
