import { FileSearch, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onReset: () => void;
}

export function DoctorMedicalRecordEmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-petcenter-filter text-petcenter-primary">
        <FileSearch className="h-7 w-7" />
      </div>
      <p className="title-md mt-4 text-petcenter-text">Không tìm thấy bệnh án phù hợp</p>
      <p className="body-md mt-2 max-w-md text-petcenter-text-secondary">
        Hãy thử thay đổi bộ lọc hoặc đặt lại bộ lọc.
      </p>
      <Button
        variant="outline"
        className="mt-5 h-9 rounded-control border-petcenter-border-strong bg-white px-4 text-petcenter-primary hover:bg-petcenter-background"
        onClick={onReset}
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
        Đặt lại bộ lọc
      </Button>
    </div>
  );
}
