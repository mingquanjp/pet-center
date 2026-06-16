import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function RejectAppointmentReasonBox({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Label htmlFor="appointment-rejection-reason" className="text-[14px] font-semibold text-[#374151]">
        Lý do từ chối <span className="text-[#EF4444]">*</span>
      </Label>
      <Input
        id="appointment-rejection-reason"
        placeholder="VD: Bác sĩ chưa thể tiếp nhận trong khung giờ này..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border-[#D1D5DB] bg-[#F9FAFB] text-[15px] shadow-inner transition-all placeholder:text-[#9CA3AF] focus-visible:border-[#0D9488] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0D9488]/20 focus-visible:ring-offset-0"
      />
      <p className="text-xs italic text-[#6B7280]">
        Lý do này sẽ được gửi tới chủ nuôi.
      </p>
    </div>
  );
}
