import { PawPrint } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffPetsPage() {
  return (
    <StaffModulePlaceholderPage
      title="Hồ sơ thú cưng"
      description="Màn hình tra cứu, tạo mới và cập nhật thông tin cơ bản của hồ sơ thú cưng sẽ được triển khai tại đây."
      icon={PawPrint}
    />
  );
}
