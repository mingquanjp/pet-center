import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { OwnerExamTypeOption } from "../../types/appointment.types";

interface OwnerExamTypeSelectionProps {
  examTypes: OwnerExamTypeOption[];
  selectedExamTypeId: string;
  onSelect: (examTypeId: string) => void;
}

export function OwnerExamTypeSelection({
  examTypes,
  onSelect,
  selectedExamTypeId,
}: OwnerExamTypeSelectionProps) {
  return (
    <fieldset>
      <legend className="title-md mb-4 text-petcenter-text">2. Loại hình khám</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {examTypes.map((examType) => {
          const isSelected = selectedExamTypeId === examType.id;

          return (
            <button
              key={examType.id}
              type="button"
              className={cn(
                "flex h-12 items-center gap-2 rounded-[0.75rem] border px-3 text-left transition-colors hover:bg-petcenter-background",
                isSelected
                  ? "border-petcenter-primary bg-petcenter-success-bg/40"
                  : "border-petcenter-border bg-petcenter-card"
              )}
              onClick={() => onSelect(examType.id)}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border",
                  isSelected
                    ? "border-petcenter-primary bg-petcenter-primary shadow-[inset_0_0_0_3px_white]"
                    : "border-petcenter-border bg-petcenter-card"
                )}
              />
              <span className="body-md text-petcenter-text">{examType.name}</span>
            </button>
          );
        })}
      </div>
      <div className="body-sm mt-3 flex items-start gap-2 rounded-[0.75rem] border border-petcenter-warning-text/20 bg-petcenter-warning-bg p-3 text-petcenter-warning-text">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Vui lòng mang theo sổ sức khỏe hoặc hồ sơ bệnh án cũ khi đến tái khám.</p>
      </div>
    </fieldset>
  );
}
