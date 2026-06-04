import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { doctorMedicalRecordAlertLabel } from "../../constants/medical-record.constants";
import { DoctorMedicalRecordAlertLevel } from "../../types/medical-record.types";

interface Props {
  alertLevel: DoctorMedicalRecordAlertLevel;
}

const badgeClassName: Record<DoctorMedicalRecordAlertLevel, string> = {
  NONE: "bg-petcenter-success-bg text-petcenter-success-text",
  MILD_ALLERGY: "bg-petcenter-danger-bg text-petcenter-danger-text",
  MONITORING: "bg-petcenter-warning-bg text-petcenter-warning-text",
  HIGH_RISK: "bg-petcenter-danger-bg text-petcenter-danger-text",
};

export function DoctorMedicalRecordWarningBadge({ alertLevel }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 rounded-pill border-transparent px-3 text-xs font-semibold",
        badgeClassName[alertLevel]
      )}
    >
      {doctorMedicalRecordAlertLabel[alertLevel]}
    </Badge>
  );
}
