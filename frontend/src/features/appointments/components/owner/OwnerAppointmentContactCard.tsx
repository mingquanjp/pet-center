import { Mail, Phone, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { OwnerAppointmentDetail } from "../../types/appointment.types";

interface OwnerAppointmentContactCardProps {
  owner: OwnerAppointmentDetail["owner"];
}

export function OwnerAppointmentContactCard({ owner }: OwnerAppointmentContactCardProps) {
  return (
    <Card className="gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0">
      <h2 className="title-md mb-4 text-petcenter-text">Thông tin liên hệ</h2>
      <div className="space-y-4">
        <ContactRow icon={<User className="h-5 w-5" aria-hidden="true" />} value={owner.fullName} />
        {owner.phoneNumber ? (
          <ContactRow icon={<Phone className="h-5 w-5" aria-hidden="true" />} value={owner.phoneNumber} />
        ) : null}
        {owner.email ? (
          <ContactRow icon={<Mail className="h-5 w-5" aria-hidden="true" />} value={owner.email} />
        ) : null}
      </div>
    </Card>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="body-md flex items-center gap-3 text-petcenter-text">
      <span className="text-petcenter-text-secondary">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}
