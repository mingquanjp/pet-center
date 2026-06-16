"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { OwnerAppointmentDetail } from "../../types/appointment.types";

interface OwnerCancelAppointmentModalProps {
  appointment: OwnerAppointmentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
}

export function OwnerCancelAppointmentModal({
  appointment,
  open,
  onConfirm,
  onOpenChange,
}: OwnerCancelAppointmentModalProps) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    onConfirm(reason.trim() || undefined);
    setReason("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-petcenter-border bg-petcenter-card p-6 shadow-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="title-md text-petcenter-text">Hủy lịch khám</DialogTitle>
          <DialogDescription className="body-md text-petcenter-text-secondary">
            Bạn có chắc chắn muốn hủy lịch khám này không?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[0.75rem] border border-petcenter-border bg-petcenter-background p-4 body-md text-petcenter-text">
          <p>
            <span className="text-petcenter-text-secondary">Mã lịch: </span>
            <span className="font-semibold">{appointment.appointmentCode}</span>
          </p>
          <p className="mt-1">
            <span className="text-petcenter-text-secondary">Thú cưng: </span>
            <span className="font-semibold">{appointment.pet.name}</span>
          </p>
        </div>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Nhập lý do hủy lịch khám nếu có..."
          className="min-h-28 rounded-[0.75rem] border-petcenter-border bg-petcenter-card body-md text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:ring-petcenter-primary/20"
        />

        <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl border-t border-petcenter-border bg-petcenter-background p-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-[0.75rem] border-petcenter-border bg-petcenter-card body-md font-medium text-petcenter-text hover:bg-petcenter-background"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type="button"
            className="h-10 rounded-[0.75rem] bg-petcenter-danger-text body-md font-semibold text-white hover:bg-petcenter-danger-text/90"
            onClick={handleConfirm}
          >
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
