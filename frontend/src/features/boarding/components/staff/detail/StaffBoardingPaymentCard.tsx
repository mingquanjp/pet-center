import { CreditCard, Receipt, Banknote, ShieldCheck } from "lucide-react";
import { StaffBoardingDetail } from "../../../types/boarding.types";
import { getBoardingPaymentMethodLabel, getBoardingPaymentStatusLabel, formatBoardingMoney } from "../../../utils/boarding-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  detail: StaffBoardingDetail;
  className?: string;
}

export function StaffBoardingPaymentCard({ detail, className }: Props) {
  const { payment } = detail;
  const isPaid = payment.paymentStatus === "PAID";

  return (
    <Card className={`rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md flex flex-col p-0 gap-0 ${className || "h-fit"}`}>
      <CardHeader className="pt-5 px-6 pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center shadow-sm">
            <CreditCard className="w-5 h-5 text-petcenter-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">Thanh toán</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-5 flex-1 flex flex-col justify-between">
        <div className="grid gap-4">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-petcenter-text-muted" /> Phương thức</div>
              <span className="text-[14px] text-petcenter-text font-semibold text-right">
                {getBoardingPaymentMethodLabel(payment.paymentMethod)}
              </span>
            </span>
          </div>
          
          <div className="space-y-1.5 p-3.5 rounded-xl bg-petcenter-background/40 border border-transparent hover:border-petcenter-border/60 transition-all">
            <span className="text-petcenter-text-secondary text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-petcenter-text-muted" /> Trạng thái</div>
              <span className={`text-[14px] font-semibold px-2.5 py-1 rounded-full ${
                isPaid ? "bg-petcenter-success-bg text-petcenter-success-text border border-petcenter-success-text/20" : "bg-petcenter-warning-bg text-petcenter-warning-text border border-petcenter-warning-text/20"
              }`}>
                {getBoardingPaymentStatusLabel(payment.paymentStatus)}
              </span>
            </span>
          </div>
          
          <div className="space-y-1.5 p-4 rounded-xl bg-petcenter-primary/5 border border-petcenter-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-[16px] text-petcenter-text font-bold">Số tiền</span>
              <span className="text-[20px] text-petcenter-primary font-bold">
                {formatBoardingMoney(payment.amount)}
              </span>
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
}
