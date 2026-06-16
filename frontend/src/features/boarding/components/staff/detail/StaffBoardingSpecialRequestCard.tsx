import { CheckCircle, AlertCircle, Heart } from "lucide-react";
import { StaffBoardingDetail } from "../../../types/boarding.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  detail: StaffBoardingDetail;
  className?: string;
}

export function StaffBoardingSpecialRequestCard({ detail, className }: Props) {
  const requests = detail.specialRequests || [];

  return (
    <Card className={`rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md p-0 gap-0 flex flex-col ${className || "h-fit"}`}>
      <CardHeader className="pt-5 px-6 pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-cta/10 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-petcenter-cta" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Yêu cầu đặc biệt</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-5 flex-1">
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
                <CheckCircle className="w-5 h-5 text-petcenter-primary shrink-0 mt-0.5" />
                <span className="text-[14px] font-medium text-petcenter-text leading-relaxed">
                  {req.trim().charAt(0).toUpperCase() + req.trim().slice(1).replace(/[.,;!?]+$/, "")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="w-8 h-8 text-petcenter-text-muted mb-2 opacity-50" />
            <p className="text-[14px] font-medium text-petcenter-text-secondary italic">
              Không có yêu cầu đặc biệt.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
