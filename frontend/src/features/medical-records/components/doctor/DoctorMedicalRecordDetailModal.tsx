"use client";

import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDoctorMedicalRecordDetail } from "../../hooks/useDoctorMedicalRecordDetail";
import { DoctorLatestClinicalResultCard } from "./DoctorLatestClinicalResultCard";
import { DoctorLatestExamCard } from "./DoctorLatestExamCard";
import { DoctorMedicalRecordAlertCard } from "./DoctorMedicalRecordAlertCard";
import { DoctorMedicalRecordOwnerCard } from "./DoctorMedicalRecordOwnerCard";
import { DoctorMedicalRecordPetSummary } from "./DoctorMedicalRecordPetSummary";
import { DoctorMedicalRecordWarningBadge } from "./DoctorMedicalRecordWarningBadge";
import { DoctorRecentExamHistory } from "./DoctorRecentExamHistory";

interface Props {
  open: boolean;
  recordId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function DoctorMedicalRecordDetailModal({ open, recordId, onOpenChange }: Props) {
  const { data, isLoading, isError } = useDoctorMedicalRecordDetail(recordId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-card border border-petcenter-border-strong bg-petcenter-card p-0 shadow-modal sm:max-w-[900px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-card px-6 py-5 pr-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle className="heading-sm text-petcenter-text">Chi tiết bệnh án</DialogTitle>
              <DialogDescription className="body-md mt-1 text-petcenter-text-secondary">
                {data ? `${data.recordCode} • ${data.pet.name}` : "Thông tin bệnh án thú cưng"}
              </DialogDescription>
            </div>
            {data ? <DoctorMedicalRecordWarningBadge alertLevel={data.alertLevel} /> : null}
          </div>
        </DialogHeader>

        <div className="max-h-[calc(90vh-164px)] overflow-y-auto bg-petcenter-background p-5">
          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center text-petcenter-text-secondary">
              Đang tải chi tiết bệnh án...
            </div>
          ) : isError || !data ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-petcenter-filter text-petcenter-primary">
                <FileQuestion className="h-7 w-7" />
              </div>
              <div>
                <p className="title-md text-petcenter-text">Không tìm thấy bệnh án</p>
                <p className="body-md mt-2 text-petcenter-text-secondary">
                  Bệnh án đã chọn không có dữ liệu trong mock hiện tại.
                </p>
              </div>
              <DialogClose asChild>
                <Button variant="outline" className="rounded-control border-petcenter-border-strong bg-white">
                  Đóng
                </Button>
              </DialogClose>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-5">
                <DoctorMedicalRecordPetSummary pet={data.pet} />
                <DoctorMedicalRecordAlertCard professionalAlert={data.professionalAlert} />
                <DoctorMedicalRecordOwnerCard owner={data.owner} />
              </div>

              <div className="space-y-5">
                <DoctorLatestExamCard latestExam={data.latestExam} />
                <DoctorLatestClinicalResultCard latestClinicalResult={data.latestClinicalResult} />
                <DoctorRecentExamHistory history={data.recentExamHistory} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 flex-col gap-3 rounded-none border-t border-petcenter-border bg-petcenter-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="body-sm text-petcenter-text-secondary">
            Bệnh án chỉ dùng để tra cứu. Cập nhật bệnh án cần thực hiện qua phiếu khám mới.
          </p>
          <div className="flex shrink-0 justify-end gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-9 rounded-control border-petcenter-border-strong bg-white px-4 text-petcenter-text hover:bg-petcenter-background"
              >
                Đóng
              </Button>
            </DialogClose>
            <Button
              className="h-9 rounded-control bg-petcenter-primary px-4 text-white hover:bg-petcenter-primary-hover"
              onClick={() => console.log("View full medical record", recordId)}
              type="button"
            >
              Xem toàn bộ bệnh án
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
