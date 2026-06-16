"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useStaffBoardingDetail } from "../../hooks/useStaffBoardingDetail";
import { useConfirmStaffBoarding } from "../../hooks/useConfirmStaffBoarding";
import { useRejectStaffBoarding } from "../../hooks/useRejectStaffBoarding";
import { useCheckInStaffBoarding } from "../../hooks/useCheckInStaffBoarding";
import { StaffBoardingDetailHeader } from "../../components/staff/detail/StaffBoardingDetailHeader";
import { StaffBoardingHeroCard } from "../../components/staff/detail/StaffBoardingHeroCard";
import { StaffBoardingInfoCard } from "../../components/staff/detail/StaffBoardingInfoCard";
import { StaffBoardingSpecialRequestCard } from "../../components/staff/detail/StaffBoardingSpecialRequestCard";
import { StaffBoardingTimelineCard } from "../../components/staff/detail/StaffBoardingTimelineCard";
import { StaffBoardingPaymentCard } from "../../components/staff/detail/StaffBoardingPaymentCard";
import { StaffBoardingUnsupportedState } from "../../components/staff/detail/StaffBoardingUnsupportedState";
import { StaffBoardingConfirmDialog } from "../../components/staff/StaffBoardingConfirmDialog";
import { StaffBoardingRejectDialog } from "../../components/staff/StaffBoardingRejectDialog";
import { StaffBoardingCheckInDialog } from "../../components/staff/StaffBoardingCheckInDialog";
import { StaffBoardingCheckOutDialog } from "../../components/staff/StaffBoardingCheckOutDialog";
import { useCheckOutStaffBoarding } from "../../hooks/useCheckOutStaffBoarding";
import { useUpdateStaffBoardingLog } from "../../hooks/useUpdateStaffBoardingLog";
import { StaffBoardingUpdateDrawer } from "../../components/staff/update/StaffBoardingUpdateDrawer";
import type {
  StaffBoardingUpdateAlertLevel,
  StaffBoardingUpdateVisibilityStatus,
} from "../../types/boarding.types";
import { toast } from "sonner";

interface Props {
  boardingId: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function StaffBoardingDetailPage({ boardingId }: Props) {
  const router = useRouter();
  const { data: detail, isLoading, isError, refetch } = useStaffBoardingDetail(boardingId);
  
  const confirmMutation = useConfirmStaffBoarding();
  const rejectMutation = useRejectStaffBoarding();
  const checkInMutation = useCheckInStaffBoarding();
  const checkOutMutation = useCheckOutStaffBoarding();
  const updateLogMutation = useUpdateStaffBoardingLog();
  
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = React.useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = React.useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = React.useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const handleBack = () => {
    router.push("/staff/boarding");
  };

  const handleConfirm = () => {
    setIsConfirmDialogOpen(true);
  };

  const submitConfirm = () => {
    confirmMutation.mutate({ boardingId }, {
      onSuccess: () => {
        toast.success("Đã xác nhận yêu cầu lưu trú thành công.");
        setIsConfirmDialogOpen(false);
        refetch();
      },
      onError: (err: unknown) => toast.error(getErrorMessage(err, "Có lỗi xảy ra khi xác nhận.")),
    });
  };

  const handleReject = () => {
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const submitReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    rejectMutation.mutate({
      boardingId,
      rejectionReason,
    }, {
      onSuccess: () => {
        toast.success("Đã từ chối yêu cầu lưu trú.");
        setIsRejectDialogOpen(false);
        refetch();
      },
      onError: (err: unknown) => toast.error(getErrorMessage(err, "Có lỗi xảy ra khi từ chối.")),
    });
  };

  const handleCheckIn = () => {
    if (detail?.checkInDate) {
      const plannedDate = new Date(detail.checkInDate);
      const now = new Date();
      plannedDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      if (now < plannedDate) {
        const formattedDate = plannedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        toast.error(`Chưa đến ngày nhận thú cưng (${formattedDate}).`);
        return;
      }
    }
    setIsCheckInDialogOpen(true);
  };

  const submitCheckIn = () => {
    checkInMutation.mutate({ boardingId }, {
      onSuccess: () => {
        toast.success("Đã check-in thành công.");
        setIsCheckInDialogOpen(false);
        refetch();
      },
      onError: (err: unknown) => toast.error(getErrorMessage(err, "Có lỗi xảy ra khi check-in."))
    });
  };

  const getUpdateErrorMessage = (err: unknown) => {
    const errorCode = err && typeof err === "object" && "code" in err ? err.code : null;
    if (errorCode === "INVALID_BOARDING_STATUS") {
      return "Chỉ có thể cập nhật chăm sóc khi thú cưng đang lưu trú.";
    }

    return "Không thể lưu cập nhật. Vui lòng thử lại.";
  };

  const handleCareUpdate = () => {
    if (detail?.status !== "STAYING") return;
    setUpdateErrorMessage(null);
    setIsUpdateDrawerOpen(true);
  };

  const handleUpdateDrawerOpenChange = (open: boolean) => {
    setIsUpdateDrawerOpen(open);
    if (!open) {
      setUpdateErrorMessage(null);
    }
  };

  const handleSubmitUpdate = (payload: {
    boardingId: string;
    description: string;
    alertLevel: StaffBoardingUpdateAlertLevel;
    visibilityStatus: StaffBoardingUpdateVisibilityStatus;
    attachmentUrl?: string | null;
    attachmentUrls?: string[];
  }) => {
    setUpdateErrorMessage(null);
    return updateLogMutation.mutate(
      {
        boardingId: payload.boardingId,
        description: payload.description,
        alertLevel: payload.alertLevel,
        visibilityStatus: payload.visibilityStatus,
        attachmentUrl: payload.attachmentUrl,
        attachmentUrls: payload.attachmentUrls,
      },
      {
        onSuccess: () => {
          toast.success(payload.visibilityStatus === "DRAFT" ? "Đã lưu nháp cập nhật chăm sóc" : "Đã lưu cập nhật chăm sóc");
          setIsUpdateDrawerOpen(false);
          refetch();
        },
        onError: (err: unknown) => {
          setUpdateErrorMessage(getUpdateErrorMessage(err));
        },
      }
    );
  };

  const handleCheckOut = () => {
    setIsCheckOutDialogOpen(true);
  };

  const submitCheckOut = () => {
    // In actual implementation, you might want to show a form to input additional fees, etc.
    // For now, we will just call the API with empty notes.
    checkOutMutation.mutate({ boardingId, payload: { internalNote: "" } }, {
      onSuccess: () => {
        toast.success("Đã trả thú cưng thành công.");
        setIsCheckOutDialogOpen(false);
        refetch();
      },
      onError: (err: unknown) => toast.error(getErrorMessage(err, "Có lỗi xảy ra khi check-out."))
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full h-full p-4 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-petcenter-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex-1 space-y-6 animate-in fade-in duration-500">
        <div className="bg-petcenter-card border border-petcenter-border rounded-card p-12 flex flex-col items-center justify-center text-center shadow-card">
          <h3 className="text-[20px] font-bold text-petcenter-text mb-2">
            {isError ? "Không thể tải chi tiết phiếu lưu trú" : "Không tìm thấy phiếu lưu trú"}
          </h3>
          <p className="text-[14px] text-petcenter-text-secondary mb-6">
            {isError ? "Đã có lỗi xảy ra. Vui lòng thử lại." : "Phiếu lưu trú không tồn tại hoặc đã bị xóa."}
          </p>
          <div className="flex gap-4">
            {isError && (
              <button
                onClick={() => refetch()}
                className="px-6 py-2 border border-petcenter-border text-petcenter-text rounded-control font-medium hover:bg-petcenter-background transition-colors"
              >
                Thử lại
              </button>
            )}
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-petcenter-primary text-white rounded-control font-medium hover:bg-petcenter-primary-hover transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const supportedStatuses = ["PENDING", "REJECTED", "CANCELLED", "CONFIRMED", "STAYING", "CHECKED_OUT"];
  const isSupported = supportedStatuses.includes(detail.status);

  if (!isSupported) {
    return (
      <div className="flex-1 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-6 w-full">
          <StaffBoardingDetailHeader detail={detail} />
        </div>
        <div className="bg-petcenter-card rounded-card border border-petcenter-border shadow-card overflow-hidden">
          <StaffBoardingUnsupportedState onBack={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-6 w-full">
        <StaffBoardingDetailHeader detail={detail} />

        <StaffBoardingHeroCard 
          detail={detail}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onCheckIn={handleCheckIn}
          onCareUpdate={handleCareUpdate}
          onCheckOut={handleCheckOut}
        />

        {detail.status === "STAYING" || detail.status === "CHECKED_OUT" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              <StaffBoardingInfoCard detail={detail} />
              <StaffBoardingSpecialRequestCard detail={detail} />
              <StaffBoardingPaymentCard detail={detail} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 w-full">
              <StaffBoardingTimelineCard timeline={detail.timeline ?? []} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {/* Row 1: Info and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              <div className="lg:col-span-5">
                <StaffBoardingInfoCard detail={detail} className="h-full" />
              </div>
              <div className="lg:col-span-7">
                <StaffBoardingTimelineCard timeline={detail.timeline ?? []} className="h-full" />
              </div>
            </div>

            {/* Row 2: Special Request and Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              <div className="lg:col-span-5">
                <StaffBoardingSpecialRequestCard detail={detail} className="h-full" />
              </div>
              <div className="lg:col-span-7">
                <StaffBoardingPaymentCard detail={detail} className="h-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <StaffBoardingRejectDialog
        isOpen={isRejectDialogOpen}
        isPending={rejectMutation.isPending}
        reason={rejectionReason}
        onOpenChange={setIsRejectDialogOpen}
        onReasonChange={setRejectionReason}
        onSubmit={submitReject}
      />

      <StaffBoardingConfirmDialog
        isOpen={isConfirmDialogOpen}
        isPending={confirmMutation.isPending}
        onOpenChange={setIsConfirmDialogOpen}
        onSubmit={submitConfirm}
      />

      <StaffBoardingCheckInDialog
        isOpen={isCheckInDialogOpen}
        isPending={checkInMutation.isPending}
        onOpenChange={setIsCheckInDialogOpen}
        onSubmit={submitCheckIn}
      />

      <StaffBoardingCheckOutDialog
        isOpen={isCheckOutDialogOpen}
        isPending={checkOutMutation.isPending}
        onOpenChange={setIsCheckOutDialogOpen}
        onSubmit={submitCheckOut}
      />

      <StaffBoardingUpdateDrawer
        open={isUpdateDrawerOpen}
        onOpenChange={handleUpdateDrawerOpenChange}
        record={detail.status === "STAYING" ? detail : null}
        onSubmit={handleSubmitUpdate}
        isSubmitting={updateLogMutation.isPending}
        errorMessage={updateErrorMessage}
      />
    </div>
  );
}
