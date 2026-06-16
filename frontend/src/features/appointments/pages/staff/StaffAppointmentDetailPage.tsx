"use client";

import { useState } from "react";
import Link from "next/link";
import { useStaffAppointmentDetail } from "../../hooks/useStaffAppointmentDetail";
import { useConfirmStaffAppointment } from "../../hooks/useConfirmStaffAppointment";
import { useRejectStaffAppointment } from "../../hooks/useRejectStaffAppointment";
import { StaffAppointmentDetailMode } from "../../types/appointment.types";
import { StaffAppointmentHeader } from "../../components/staff/detail/StaffAppointmentHeader";
import { AppointmentInfoCard } from "../../components/staff/detail/AppointmentInfoCard";
import { PetInfoCard } from "../../components/staff/detail/PetInfoCard";
import { OwnerInfoCard } from "../../components/staff/detail/OwnerInfoCard";
import { OwnerNoteCard } from "../../components/staff/detail/OwnerNoteCard";
import { AppointmentSummaryCard } from "../../components/staff/detail/AppointmentSummaryCard";
import { RejectAppointmentReasonBox } from "../../components/staff/detail/RejectAppointmentReasonBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiError } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  appointmentId: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function StaffAppointmentDetailPage({ appointmentId }: Props) {
  const { data: appointment, isLoading, isError, refetch } = useStaffAppointmentDetail(appointmentId);
  const confirmMutation = useConfirmStaffAppointment();
  const rejectMutation = useRejectStaffAppointment();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-100">
        <LoadingState 
          title="Đang tải dữ liệu..." 
          description="Vui lòng đợi giây lát trong khi hệ thống truy xuất thông tin lịch khám."
        />
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <Card className="rounded-card border-petcenter-border max-w-lg mx-auto mt-10">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-petcenter-danger-bg flex items-center justify-center text-petcenter-danger-text mb-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="heading-sm text-petcenter-text">Không tìm thấy lịch khám</h2>
          <p className="text-petcenter-text-secondary">
            Lịch khám không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" className="border-petcenter-border" onClick={() => refetch()}>Thử lại</Button>
            <Button asChild className="bg-petcenter-primary hover:bg-petcenter-primary-hover text-white rounded-control">
              <Link href="/staff/appointments">Quay lại danh sách</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mode: StaffAppointmentDetailMode = appointment.status === "PENDING" ? "PROCESS" : "VIEW";
  const isProcess = mode === "PROCESS";
  const doctorToConfirm = appointment.assignmentStatus === "NO_AVAILABLE_DOCTOR"
    ? null
    : appointment.suggestedDoctor ?? appointment.assignedDoctor;

  const handleSubmit = () => {
    if (!doctorToConfirm) {
      toast.error("Không có bác sĩ khả dụng trong khung giờ này.");
      return;
    }

    confirmMutation.mutate({
      appointmentId,
      doctorUserId: doctorToConfirm.id,
      internalNote: "", // Not implemented in UI yet
    }, {
      onSuccess: () => {
        toast.success("Đã xác nhận lịch khám thành công.");
        refetch();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Không thể xác nhận lịch khám."));
      },
    });
  };

  const handleReject = () => {
    const reason = rejectionReason.trim();

    if (reason.length < 5) {
      toast.error("Vui lòng nhập lý do từ chối tối thiểu 5 ký tự.");
      return;
    }

    rejectMutation.mutate({
      appointmentId,
      rejectionReason: reason,
      internalNote: "",
    }, {
      onSuccess: () => {
        toast.success("Đã từ chối lịch khám thành công.");
        setIsRejectModalOpen(false);
        setRejectionReason("");
        refetch();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Không thể từ chối lịch khám."));
      },
    });
  };

  const isBusy = confirmMutation.isPending || rejectMutation.isPending;
  const isSubmitDisabled = !doctorToConfirm || isBusy;

  return (
    <div className="flex-1 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <StaffAppointmentHeader appointment={appointment} mode={mode} />
          
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppointmentInfoCard appointment={appointment} />
              <div className="h-full">
                <OwnerNoteCard note={appointment.ownerNote} symptom={appointment.symptomDescription} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PetInfoCard pet={appointment.pet} />
              <OwnerInfoCard owner={appointment.owner} />
            </div>

          </div>
        </div>

        {/* Right Column - SINGLE STICKY CONTAINER */}
        <div className="lg:col-span-1 sticky top-6 z-10">
          <div className="relative w-full">
            {/* Spacer slightly reduced to push Summary Card a little bit higher */}
            <div className="h-27 w-full pointer-events-none" />
            
            {/* The Button placed absolutely at the top where the Breadcrumb is */}
            <div className="absolute top-0 right-0 h-10 flex items-center justify-end">
              <Button variant="outline" asChild className="rounded-control border-petcenter-primary text-petcenter-primary hover:bg-petcenter-primary hover:text-white px-4 py-2 h-auto flex gap-1.5 font-medium text-base transition-colors">
                <Link href="/staff/appointments">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-6 space-y-6">
            <AppointmentSummaryCard appointment={appointment} mode={mode} />

            {isProcess && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  className="w-40 h-12 rounded-xl border border-petcenter-danger-text/40 text-petcenter-danger-text font-semibold hover:bg-petcenter-danger-bg transition-colors"
                  disabled={isBusy}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Từ chối lịch
                </Button>
                <Button
                  className="w-40 h-12 rounded-xl bg-petcenter-primary text-white font-bold transition-all shadow-sm hover:bg-petcenter-primary-hover"
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                >
                  {confirmMutation.isPending ? "Đang xác nhận..." : "Xác nhận lịch"}
                </Button>
              </div>
            )}
            
            {appointment.status === "PENDING" && appointment.assignmentStatus === "NO_AVAILABLE_DOCTOR" && (
              <div className="text-petcenter-danger-text text-sm text-center font-medium">
                Không có bác sĩ khả dụng trong khung giờ này.
              </div>
            )}
            {confirmMutation.isError && (
               <div className="text-petcenter-danger-text text-sm text-center font-medium mt-2">
                 {getErrorMessage(confirmMutation.error, "Trạng thái lịch khám không còn hợp lệ. Vui lòng tải lại.")}
               </div>
            )}
            {rejectMutation.isError && (
               <div className="text-petcenter-danger-text text-sm text-center font-medium mt-2">
                 {getErrorMessage(rejectMutation.error, "Trạng thái lịch khám không còn hợp lệ. Vui lòng tải lại.")}
               </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-120 bg-white rounded-3xl p-0 overflow-hidden border-0! shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] outline-none">
          <DialogHeader className="px-7 pt-7 pb-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">Từ chối lịch khám</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed text-[#4B5563] mt-2">
              Vui lòng cung cấp lý do từ chối. Lời nhắn này sẽ được gửi trực tiếp đến chủ nuôi.
            </DialogDescription>
          </DialogHeader>

          <div className="px-7 py-5">
            <RejectAppointmentReasonBox value={rejectionReason} onChange={setRejectionReason} />
          </div>

          <DialogFooter className="px-7 py-5 bg-[#F9FAFB] flex sm:justify-end gap-3 sm:gap-3 border-t border-[#F3F4F6]">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-11 px-6 font-medium border-[#D1D5DB] text-[#4B5563] hover:bg-white hover:text-[#111827] shadow-sm transition-all"
              disabled={rejectMutation.isPending}
              onClick={() => setIsRejectModalOpen(false)}
            >
              Trở lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl h-11 px-6 font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm transition-all"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              {rejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
