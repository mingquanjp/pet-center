"use client";

import React, { useMemo, useCallback } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import {
  StaffBoardingFilters,
  StaffBoardingListItem,
  StaffBoardingTab,
  StaffBoardingUpdateAlertLevel,
  StaffBoardingUpdateVisibilityStatus,
} from "../../types/boarding.types";
import { useStaffBoarding } from "../../hooks/useStaffBoarding";
import { useConfirmStaffBoarding } from "../../hooks/useConfirmStaffBoarding";
import { useRejectStaffBoarding } from "../../hooks/useRejectStaffBoarding";
import { useCheckInStaffBoarding } from "../../hooks/useCheckInStaffBoarding";
import { useUpdateStaffBoardingLog } from "../../hooks/useUpdateStaffBoardingLog";
import { useCheckOutStaffBoarding } from "../../hooks/useCheckOutStaffBoarding";
import { StaffBoardingFilterBar } from "../../components/staff/StaffBoardingFilterBar";
import { StaffBoardingTabs } from "../../components/staff/StaffBoardingTabs";
import { StaffBoardingList } from "../../components/staff/StaffBoardingList";
import { StaffBoardingRejectDialog } from "../../components/staff/StaffBoardingRejectDialog";
import { StaffBoardingCheckInDialog } from "../../components/staff/StaffBoardingCheckInDialog";
import { StaffBoardingCheckOutDialog } from "../../components/staff/StaffBoardingCheckOutDialog";
import { StaffBoardingUpdateDrawer } from "../../components/staff/update/StaffBoardingUpdateDrawer";
import { AppPagination } from "@/components/ui/app-pagination";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function getErrorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const defaultFilters: StaffBoardingFilters = {
  search: "",
  status: "ALL",
  roomType: "ALL",
  timeRange: "ALL",
  tab: "ALL",
};

function parseFiltersFromParams(params: URLSearchParams): StaffBoardingFilters & { page: number; limit: number } {
  return {
    search: params.get("search") || "",
    status: (params.get("status") as StaffBoardingFilters["status"]) || "ALL",
    roomType: (params.get("roomType") as StaffBoardingFilters["roomType"]) || "ALL",
    timeRange: (params.get("timeRange") as StaffBoardingFilters["timeRange"]) || "ALL",
    tab: (params.get("tab") as StaffBoardingFilters["tab"]) || "ALL",
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 10,
  };
}

export function StaffBoardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parsedParams = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const filters: StaffBoardingFilters = useMemo(() => ({
    search: parsedParams.search,
    status: parsedParams.status,
    roomType: parsedParams.roomType,
    timeRange: parsedParams.timeRange,
    tab: parsedParams.tab,
  }), [parsedParams]);
  const page = parsedParams.page;
  const limit = parsedParams.limit;

  const { data: records = [], stats, pagination: apiPagination, isLoading, isInitialLoading, isError, refetch } = useStaffBoarding(filters, page, limit);

  const confirmMutation = useConfirmStaffBoarding();
  const rejectMutation = useRejectStaffBoarding();
  const checkInMutation = useCheckInStaffBoarding();
  const checkOutMutation = useCheckOutStaffBoarding();
  const updateLogMutation = useUpdateStaffBoardingLog();

  // State for Modals
  const [confirmModalState, setConfirmModalState] = React.useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [rejectModalState, setRejectModalState] = React.useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [internalNote, setInternalNote] = React.useState("");

  const [checkInModalState, setCheckInModalState] = React.useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [updatingRecord, setUpdatingRecord] = React.useState<StaffBoardingListItem | null>(null);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = React.useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = React.useState<string | null>(null);

  const updateFilters = useCallback((newFilters: StaffBoardingFilters, newPage: number) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.status && newFilters.status !== "ALL") params.set("status", newFilters.status);
    if (newFilters.roomType && newFilters.roomType !== "ALL") params.set("roomType", newFilters.roomType);
    if (newFilters.timeRange && newFilters.timeRange !== "ALL") params.set("timeRange", newFilters.timeRange);
    if (newFilters.tab && newFilters.tab !== "ALL") params.set("tab", newFilters.tab);
    if (newPage > 1) params.set("page", String(newPage));

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, pathname]);

  const handleResetFilters = () => {
    updateFilters(defaultFilters, 1);
  };

  const handleFilterChange = (newFilters: StaffBoardingFilters) => {
    updateFilters(newFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters(filters, newPage);
  };

  const handleConfirm = (id: string) => {
    setConfirmModalState({ isOpen: true, id });
  };

  const submitConfirm = () => {
    if (!confirmModalState.id) return;
    confirmMutation.mutate(
      { boardingId: confirmModalState.id },
      {
        onSuccess: () => {
          toast.success("Đã xác nhận yêu cầu lưu trú thành công.");
          setConfirmModalState({ isOpen: false, id: null });
          refetch();
        },
        onError: (err: unknown) => toast.error(getErrorText(err, "Có lỗi xảy ra khi xác nhận.")),
      }
    );
  };

  const handleReject = (id: string) => {
    setRejectionReason("");
    setInternalNote("");
    setRejectModalState({ isOpen: true, id });
  };

  const submitReject = () => {
    if (!rejectModalState.id) return;
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    rejectMutation.mutate(
      { boardingId: rejectModalState.id, rejectionReason, internalNote },
      {
        onSuccess: () => {
          toast.success("Đã từ chối yêu cầu lưu trú.");
          setRejectModalState({ isOpen: false, id: null });
          refetch();
        },
        onError: (err: unknown) => toast.error(getErrorText(err, "Có lỗi xảy ra khi từ chối.")),
      }
    );
  };

  const handleCheckIn = (id: string) => {
    const record = records?.find(r => r.id === id);
    if (record?.checkInDate) {
      const plannedDate = new Date(record.checkInDate);
      const now = new Date();
      plannedDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      if (now < plannedDate) {
        const formattedDate = plannedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        toast.error(`Chưa đến ngày nhận thú cưng (${formattedDate}).`);
        return;
      }
    }
    setCheckInModalState({ isOpen: true, id });
  };

  const submitCheckIn = () => {
    if (!checkInModalState.id) return;
    checkInMutation.mutate({ boardingId: checkInModalState.id }, {
      onSuccess: () => { 
        toast.success("Đã check-in thành công."); 
        setCheckInModalState({ isOpen: false, id: null });
        refetch(); 
      },
      onError: (err: unknown) => toast.error(getErrorText(err, "Có lỗi xảy ra khi check-in.")),
    });
  };

  const [checkOutModalState, setCheckOutModalState] = React.useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const getUpdateErrorMessage = (err: unknown) => {
    const errorCode = err && typeof err === "object" && "code" in err ? err.code : null;
    if (errorCode === "INVALID_BOARDING_STATUS") {
      return "Chỉ có thể cập nhật chăm sóc khi thú cưng đang lưu trú.";
    }

    return "Không thể lưu cập nhật. Vui lòng thử lại.";
  };

  const handleUpdate = (record: StaffBoardingListItem) => {
    if (record.status !== "STAYING") return;
    setUpdateErrorMessage(null);
    setUpdatingRecord(record);
    setIsUpdateDrawerOpen(true);
  };

  const handleUpdateDrawerOpenChange = (open: boolean) => {
    setIsUpdateDrawerOpen(open);
    if (!open) {
      setUpdatingRecord(null);
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
          setUpdatingRecord(null);
          refetch();
        },
        onError: (err: unknown) => {
          setUpdateErrorMessage(getUpdateErrorMessage(err));
        },
      }
    );
  };

  const handleCheckOut = (id: string) => {
    setCheckOutModalState({ isOpen: true, id });
  };

  const submitCheckOut = () => {
    if (!checkOutModalState.id) return;
    checkOutMutation.mutate({ boardingId: checkOutModalState.id }, {
      onSuccess: () => { 
        toast.success("Check-out thành công"); 
        setCheckOutModalState({ isOpen: false, id: null });
        refetch(); 
      },
      onError: (err: unknown) => toast.error(getErrorText(err, "Lỗi khi check-out")),
    });
  };

  const handleView = (id: string) => {
    router.push(`/staff/boarding/${id}`);
  };

  const tabCounts: Record<StaffBoardingTab, number> = {
    ALL: stats.allCount,
    PENDING_PAYMENT: 0,
    PENDING: stats.pendingCount,
    CONFIRMED: stats.confirmedCount,
    STAYING: stats.stayingCount,
    CHECKED_OUT: stats.checkedOutCount,
    REJECTED: stats.rejectedCount,
    CANCELLED: stats.cancelledCount,
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="heading-lg text-petcenter-text tracking-tight">Lưu trú</h2>
          <p className="body-md text-petcenter-text-secondary mt-1">
            Xác nhận, check-in và theo dõi thú cưng trong thời gian lưu trú.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            className="rounded-[0.75rem] border-petcenter-border text-petcenter-text hover:bg-petcenter-background active:scale-95 transition-all h-9 px-4 gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Link
            href="/staff/boarding/create"
            className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white px-5 rounded-[12px] text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-9"
          >
            <Plus className="w-4 h-4" />
            Tạo lưu trú tại quầy
          </Link>
        </div>
      </div>

      {/* Unified Table Card */}
      <div className="bg-petcenter-card rounded-2xl shadow-card flex flex-col overflow-hidden relative border border-petcenter-border">
        {/* Filter Bar */}
        <StaffBoardingFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Tabs */}
        <StaffBoardingTabs
          activeTab={filters.tab}
          onChange={(tab) => handleFilterChange({ ...filters, tab })}
          counts={tabCounts}
        />

        {/* Boarding List */}
        <div className="relative flex-1">
          {isInitialLoading ? (
            <div className="py-10">
              <LoadingState 
                title="Đang tải dữ liệu..." 
                description="Vui lòng đợi giây lát trong khi chúng tôi tải dữ liệu từ hệ thống."
              />
            </div>
          ) : isError && records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
              <p className="text-petcenter-text-secondary font-medium">
                Không thể tải danh sách lưu trú
              </p>
              <Button
                variant="outline"
                className="rounded-[0.75rem] border-petcenter-border"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className={`transition-opacity duration-200 ${isLoading && !isInitialLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="p-4 bg-petcenter-background">
                <StaffBoardingList
                  records={records}
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                  onCheckIn={handleCheckIn}
                  onUpdate={handleUpdate}
                  onCheckOut={handleCheckOut}
                  onView={handleView}
                  onResetFilters={handleResetFilters}
                />
              </div>
              
              {apiPagination && apiPagination.totalPages > 1 && (
                <div className="w-full px-6 py-4 border-t border-petcenter-border bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-petcenter-text-secondary">
                    Hiển thị <span className="font-medium text-petcenter-text">{(apiPagination.page - 1) * apiPagination.limit + 1}</span>-
                    <span className="font-medium text-petcenter-text">{Math.min(apiPagination.page * apiPagination.limit, apiPagination.total)}</span> của{" "}
                    <span className="font-medium text-petcenter-text">{apiPagination.total}</span> lưu trú
                  </p>
                  <AppPagination
                    ariaLabel="Phân trang lưu trú"
                    currentPage={apiPagination.page}
                    totalPages={apiPagination.totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    className="justify-end!"
                    size="sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmModalState.isOpen} onOpenChange={(open) => !open && setConfirmModalState({ isOpen: false, id: null })}>
        <DialogContent className="sm:max-w-105 bg-white rounded-3xl p-0 overflow-hidden border-0! shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] outline-none">
          <DialogHeader className="px-7 pt-7 pb-5">
            <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">Xác nhận lưu trú</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed text-[#4B5563] mt-2">
              Bạn có chắc chắn muốn xác nhận yêu cầu lưu trú này? Thú cưng sẽ chuyển sang trạng thái <span className="font-medium text-[#111827]">Chờ check-in</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-7 py-5 bg-[#F9FAFB] flex sm:justify-end gap-3 sm:gap-3 border-t border-[#F3F4F6]">
            <Button
              variant="outline"
              onClick={() => setConfirmModalState({ isOpen: false, id: null })}
              disabled={confirmMutation.isPending}
              className="rounded-xl h-11 px-6 font-medium border-[#D1D5DB] text-[#4B5563] hover:bg-white hover:text-[#111827] shadow-sm transition-all"
            >
              Hủy
            </Button>
            <Button
              onClick={submitConfirm}
              disabled={confirmMutation.isPending}
              className="rounded-xl h-11 px-6 font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm transition-all"
            >
              {confirmMutation.isPending ? "Đang xử lý..." : "Xác nhận ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StaffBoardingRejectDialog
        isOpen={rejectModalState.isOpen}
        isPending={rejectMutation.isPending}
        reason={rejectionReason}
        onOpenChange={(isOpen) => setRejectModalState((prev) => ({ ...prev, isOpen }))}
        onReasonChange={setRejectionReason}
        onSubmit={submitReject}
      />

      <StaffBoardingCheckInDialog
        isOpen={checkInModalState.isOpen}
        isPending={checkInMutation.isPending}
        onOpenChange={(isOpen) => setCheckInModalState((prev) => ({ ...prev, isOpen }))}
        onSubmit={submitCheckIn}
      />

      <StaffBoardingCheckOutDialog
        isOpen={checkOutModalState.isOpen}
        isPending={checkOutMutation.isPending}
        onOpenChange={(isOpen) => setCheckOutModalState((prev) => ({ ...prev, isOpen }))}
        onSubmit={submitCheckOut}
      />

      <StaffBoardingUpdateDrawer
        open={isUpdateDrawerOpen}
        onOpenChange={handleUpdateDrawerOpenChange}
        record={updatingRecord}
        onSubmit={handleSubmitUpdate}
        isSubmitting={updateLogMutation.isPending}
        errorMessage={updateErrorMessage}
      />
    </div>
  );
}
