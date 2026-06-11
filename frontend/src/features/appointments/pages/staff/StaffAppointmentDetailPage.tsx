"use client";

import { useState } from "react";
import Link from "next/link";
import { useStaffAppointmentDetail } from "../../hooks/useStaffAppointmentDetail";
import { useConfirmStaffAppointment } from "../../hooks/useConfirmStaffAppointment";
import { useRejectStaffAppointment } from "../../hooks/useRejectStaffAppointment";
import { StaffAppointmentDetailMode, AppointmentProcessAction } from "../../types/appointment.types";
import { StaffAppointmentHeader } from "../../components/staff/detail/StaffAppointmentHeader";
import { AppointmentInfoCard } from "../../components/staff/detail/AppointmentInfoCard";
import { PetInfoCard } from "../../components/staff/detail/PetInfoCard";
import { OwnerInfoCard } from "../../components/staff/detail/OwnerInfoCard";
import { OwnerNoteCard } from "../../components/staff/detail/OwnerNoteCard";
import { AppointmentActionPanel } from "../../components/staff/detail/AppointmentActionPanel";
import { AppointmentSummaryCard } from "../../components/staff/detail/AppointmentSummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const [action, setAction] = useState<AppointmentProcessAction | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-100">
        <LoadingState 
          title="Đang tải dữ liệu..." 
          description="Vui lòng đợi giây lát trong khi hệ thống truy xuất thông tin lịch hẹn."
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
          <h2 className="heading-sm text-petcenter-text">Không tìm thấy lịch hẹn</h2>
          <p className="text-petcenter-text-secondary">
            Lịch hẹn không tồn tại hoặc bạn không có quyền truy cập.
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
    if (!action) {
      toast.error("Vui lòng chọn thao tác xác nhận hoặc từ chối lịch hẹn.");
      return;
    }

    if (action === "CONFIRM" && !doctorToConfirm) {
      toast.error("Không có bác sĩ khả dụng trong khung giờ này.");
      return;
    }

    if (action === "CONFIRM") {
      confirmMutation.mutate({
        appointmentId,
        doctorUserId: doctorToConfirm?.id,
        internalNote: "", // Not implemented in UI yet
      }, {
        onSuccess: () => {
          toast.success("Đã xác nhận lịch hẹn thành công.");
          refetch();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Không thể xác nhận lịch hẹn."));
        },
      });
    } else if (action === "REJECT") {
      rejectMutation.mutate({
        appointmentId,
        rejectionReason: "Từ chối bởi nhân viên (Tính năng điền lý do đang tạm ẩn)",
        internalNote: "", // Not implemented in UI yet
      }, {
        onSuccess: () => {
          toast.success("Đã từ chối lịch hẹn.");
          refetch();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Không thể từ chối lịch hẹn."));
        },
      });
    }
  };

  const isSubmitDisabled = 
    !action || 
    (action === "CONFIRM" && !doctorToConfirm) ||
    confirmMutation.isPending || 
    rejectMutation.isPending;

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

            {isProcess && (
              <div className="space-y-4">
                <AppointmentActionPanel 
                  selectedAction={action} 
                  onActionChange={setAction} 
                  assignmentStatus={appointment.assignmentStatus}
                />
              </div>
            )}
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
                  asChild
                  className="w-40 h-12 rounded-xl border border-petcenter-border-strong text-petcenter-text font-semibold hover:bg-petcenter-background transition-colors"
                >
                  <Link href="/staff/appointments">Hủy</Link>
                </Button>
                <Button 
                  className={`w-40 h-12 rounded-xl text-white font-bold transition-all shadow-sm ${
                    action === "REJECT" 
                      ? "bg-petcenter-danger-text hover:bg-petcenter-danger-text/90" 
                      : "bg-petcenter-primary hover:bg-petcenter-primary-hover"
                  }`}
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                >
                  {action === "REJECT" ? (rejectMutation.isPending ? "Đang từ chối..." : "Từ chối lịch") : (confirmMutation.isPending ? "Đang xác nhận..." : "Xác nhận lịch")}
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
                 {getErrorMessage(confirmMutation.error, "Trạng thái lịch hẹn không còn hợp lệ. Vui lòng tải lại.")}
               </div>
            )}
            {rejectMutation.isError && (
               <div className="text-petcenter-danger-text text-sm text-center font-medium mt-2">
                 {getErrorMessage(rejectMutation.error, "Trạng thái lịch hẹn không còn hợp lệ. Vui lòng tải lại.")}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
