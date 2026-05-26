import { Headset } from "lucide-react";

import { StaffModulePlaceholderPage } from "@/features/dashboard/pages/staff/StaffModulePlaceholderPage";

export default function StaffSupportPage() {
  return (
    <StaffModulePlaceholderPage
      title="Hỗ trợ kỹ thuật"
      description="Kênh hỗ trợ cho nhân viên vận hành trung tâm sẽ được triển khai tại đây."
      icon={Headset}
    />
  );
}
