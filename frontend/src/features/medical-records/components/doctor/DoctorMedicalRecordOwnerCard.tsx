import { Mail, Phone, User } from "lucide-react";

import { Card } from "@/components/ui/card";

import { DoctorMedicalRecordDetail } from "../../types/medical-record.types";

interface Props {
  owner: DoctorMedicalRecordDetail["owner"];
}

export function DoctorMedicalRecordOwnerCard({ owner }: Props) {
  return (
    <Card className="gap-0 rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <h3 className="label-sm uppercase text-petcenter-text-secondary">Chủ nuôi</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-petcenter-text">
          <User className="h-4 w-4 text-petcenter-primary" />
          <span className="font-semibold">{owner.fullName}</span>
        </div>
        {owner.phoneNumber ? (
          <div className="flex items-center gap-3 text-petcenter-text-secondary">
            <Phone className="h-4 w-4 text-petcenter-primary" />
            <span>{owner.phoneNumber}</span>
          </div>
        ) : null}
        {owner.email ? (
          <a className="flex items-center gap-3 text-petcenter-text-secondary hover:text-petcenter-primary" href={`mailto:${owner.email}`}>
            <Mail className="h-4 w-4 text-petcenter-primary" />
            <span className="break-all">{owner.email}</span>
          </a>
        ) : null}
      </div>
    </Card>
  );
}
