import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";
import { AppointmentProcessAction } from "../../../types/appointment.types";

interface Props {
  selectedAction: AppointmentProcessAction | null;
  onActionChange: (action: AppointmentProcessAction) => void;
  assignmentStatus?: "ASSIGNED" | "NO_AVAILABLE_DOCTOR";
}

export function AppointmentActionPanel({ selectedAction, onActionChange, assignmentStatus }: Props) {
  return (
    <Card className="rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-cta/10 flex items-center justify-center shadow-sm">
            <Settings2 className="w-5 h-5 text-petcenter-cta" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Hành động xử lý</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div 
            onClick={() => onActionChange("CONFIRM")}
            className={`flex items-start space-x-3 rounded-xl border p-4 transition-colors cursor-pointer hover:bg-petcenter-background/50 ${selectedAction === "CONFIRM" ? "border-petcenter-primary bg-petcenter-background" : "border-petcenter-border"}`}
          >
            <div className="space-y-1 leading-none">
              <div className="font-bold text-base text-petcenter-text">
                Xác nhận lịch
              </div>
              <p className="text-base text-petcenter-text-secondary leading-relaxed">
                Lịch khám hợp lệ và có thể tiếp nhận.
              </p>
              {assignmentStatus === "NO_AVAILABLE_DOCTOR" && (
                <p className="text-sm text-petcenter-danger-text mt-2 font-medium">
                  Hiện chưa có bác sĩ khả dụng trong khung giờ này.
                </p>
              )}
            </div>
          </div>
          
          <div 
            onClick={() => onActionChange("REJECT")}
            className={`flex items-start space-x-3 rounded-xl border p-4 transition-colors cursor-pointer hover:bg-petcenter-danger-bg/10 ${selectedAction === "REJECT" ? "border-petcenter-danger-text bg-petcenter-danger-bg/20" : "border-petcenter-border"}`}
          >
            <div className="space-y-1 leading-none">
              <div className="font-bold text-base text-petcenter-text">
                Từ chối lịch
              </div>
              <p className="text-base text-petcenter-text-secondary leading-relaxed">
                Phòng khám không thể tiếp nhận vào thời gian này.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
