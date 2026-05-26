import { Receipt } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffInvoicesPage() {
  return (
    <StaffModulePlaceholderPage
      title="Hóa đơn"
      description="Màn hình xem hóa đơn và xác nhận thanh toán tại quầy của nhân viên sẽ được triển khai tại đây."
      icon={Receipt}
    />
  );
}
