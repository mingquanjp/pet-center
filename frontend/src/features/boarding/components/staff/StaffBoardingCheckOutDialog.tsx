import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function StaffBoardingCheckOutDialog({
  isOpen,
  isPending = false,
  onOpenChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105 bg-white rounded-3xl p-0 overflow-hidden border-0! shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] outline-none">
        <DialogHeader className="px-7 pt-7 pb-5">
          <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">Tiến hành Check-out</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-[#4B5563] mt-2">
            Xác nhận trả thú cưng và hoàn tất lưu trú? Phiếu lưu trú sẽ chuyển sang trạng thái{" "}
            <span className="font-medium text-[#111827]">Đã trả thú cưng</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-7 py-5 bg-[#F9FAFB] flex sm:justify-end gap-3 sm:gap-3 border-t border-[#F3F4F6]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-11 px-6 font-medium border-[#D1D5DB] text-[#4B5563] hover:bg-white hover:text-[#111827] shadow-sm transition-all"
          >
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="rounded-xl h-11 px-6 font-medium bg-[#F97316] hover:bg-[#EA580C] text-white shadow-sm transition-all"
          >
            {isPending ? "Đang xử lý..." : "Check-out ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
