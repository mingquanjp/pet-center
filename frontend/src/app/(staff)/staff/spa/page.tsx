import { Sparkles } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffSpaPage() {
  return (
    <StaffModulePlaceholderPage
      title="Dịch vụ spa"
      description="Màn hình tiếp nhận, theo dõi và hoàn tất yêu cầu spa cho thú cưng sẽ được triển khai tại đây."
      icon={Sparkles}
    />
  );
}
