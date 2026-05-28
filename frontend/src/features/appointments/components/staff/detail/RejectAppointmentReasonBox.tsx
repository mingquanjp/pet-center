import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function RejectAppointmentReasonBox({ value, onChange }: Props) {
  return (
    <div className="space-y-3 bg-petcenter-danger-bg/5 p-4 rounded-xl border border-petcenter-danger-text/20">
      <Label htmlFor="rejection-reason" className="text-petcenter-text font-semibold text-sm">
        Lý do từ chối <span className="text-petcenter-danger-text">*</span>
      </Label>
      <Textarea
        id="rejection-reason"
        placeholder="Nhập lý do từ chối lịch hẹn..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-25 resize-none border-petcenter-border focus-visible:ring-petcenter-danger-text/30"
      />
      <p className="text-xs text-petcenter-text-muted italic">
        Lý do này sẽ được gửi tới chủ nuôi.
      </p>
    </div>
  );
}
