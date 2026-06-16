import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  isOpen: boolean;
  isPending?: boolean;
  reason: string;
  onOpenChange: (open: boolean) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}

export function StaffBoardingRejectDialog({
  isOpen,
  isPending = false,
  reason,
  onOpenChange,
  onReasonChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 bg-white rounded-3xl p-0 overflow-hidden border-0! shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] outline-none">
        <DialogHeader className="px-7 pt-7 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">Từ chối lưu trú</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-[#4B5563] mt-2">
            Vui lòng cung cấp lý do từ chối. Lời nhắn này sẽ được gửi trực tiếp đến chủ nuôi.
          </DialogDescription>
        </DialogHeader>
        <div className="px-7 py-5">
          <div className="space-y-3">
            <Label htmlFor="boarding-rejection-reason" className="text-[14px] font-semibold text-[#374151]">
              Lý do từ chối <span className="text-[#EF4444]">*</span>
            </Label>
            <Input
              id="boarding-rejection-reason"
              placeholder="VD: Trung tâm hiện đã hết phòng trống..."
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="h-12 rounded-xl border-[#D1D5DB] bg-[#F9FAFB] shadow-inner focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0D9488]/20 focus-visible:border-[#0D9488] focus-visible:ring-offset-0 placeholder:text-[#9CA3AF] text-[15px] transition-all"
            />
          </div>
        </div>
        <DialogFooter className="px-7 py-5 bg-[#F9FAFB] flex sm:justify-end gap-3 sm:gap-3 border-t border-[#F3F4F6]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-11 px-6 font-medium border-[#D1D5DB] text-[#4B5563] hover:bg-white hover:text-[#111827] shadow-sm transition-all"
          >
            Trở lại
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isPending}
            className="rounded-xl h-11 px-6 font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm transition-all"
          >
            {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
