import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  StaffBoardingDetail,
  StaffBoardingListItem,
  StaffBoardingUpdateAlertLevel,
  StaffBoardingUpdateVisibilityStatus,
} from "../../../types/boarding.types";
import { useStaffBoardingDraftUpdate } from "../../../hooks/useStaffBoardingDraftUpdate";
import { StaffBoardingUpdateForm } from "./StaffBoardingUpdateForm";

interface StaffBoardingUpdateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: StaffBoardingListItem | StaffBoardingDetail | null;
  onSubmit: (payload: {
    boardingId: string;
    description: string;
    alertLevel: StaffBoardingUpdateAlertLevel;
    visibilityStatus: StaffBoardingUpdateVisibilityStatus;
    attachmentUrl?: string | null;
    attachmentUrls?: string[];
  }) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function StaffBoardingUpdateDrawer({
  open,
  onOpenChange,
  record,
  onSubmit,
  isSubmitting,
  errorMessage,
}: StaffBoardingUpdateDrawerProps) {
  const draftQuery = useStaffBoardingDraftUpdate(record?.id, open && Boolean(record?.id));

  function requestOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  function handleCancel() {
    requestOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={requestOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full gap-0 border-l border-petcenter-border-strong bg-petcenter-card p-0 text-petcenter-text shadow-modal data-[side=right]:w-full data-[side=right]:sm:w-[760px] data-[side=right]:sm:max-w-none"
      >
        <SheetHeader className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-7 shadow-sm">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-[#0D9488]/10 w-10 h-10 rounded-xl flex items-center justify-center border border-[#0D9488]/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#0D9488]"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </div>
              <SheetTitle className="text-[22px] font-bold text-[#0F172A] tracking-tight">
                Cập nhật chăm sóc
              </SheetTitle>
            </div>
            <SheetDescription className="text-[15px] font-medium text-[#64748B] pl-[52px]">
              Ghi nhận nhật ký sinh hoạt, hình ảnh hoặc các tình trạng sức khỏe mới nhất của thú cưng.
            </SheetDescription>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0D9488]/5 rounded-bl-full pointer-events-none -z-0"></div>
        </SheetHeader>

        {record && (!open || draftQuery.hasFetched) ? (
          <StaffBoardingUpdateForm
            key={record.id}
            record={record}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            draftUpdate={draftQuery.data}
            isDraftLoading={draftQuery.isLoading}
          />
        ) : record ? (
          <div className="space-y-4 px-6 py-6">
            <div className="h-28 animate-pulse rounded-card bg-petcenter-background" />
            <div className="h-12 animate-pulse rounded-control bg-petcenter-background" />
            <div className="h-36 animate-pulse rounded-control bg-petcenter-background" />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
