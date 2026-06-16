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

export function StaffBoardingConfirmDialog({
  isOpen,
  isPending = false,
  onOpenChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105 bg-white rounded-3xl p-0 overflow-hidden border-0! shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] outline-none">
        <DialogHeader className="px-7 pt-7 pb-5">
          <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">Xác nhận lưu trú</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-[#4B5563] mt-2">
            Bạn có chắc chắn muốn xác nhận yêu cầu lưu trú này? Thú cưng sẽ chuyển sang trạng thái{" "}
            <span className="font-medium text-[#111827]">Chờ check-in</span>.
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
            className="rounded-xl h-11 px-6 font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm transition-all"
          >
            {isPending ? "Đang xử lý..." : "Xác nhận ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
