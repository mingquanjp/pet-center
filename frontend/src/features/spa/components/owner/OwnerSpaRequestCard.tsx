import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { spaStatusClassName, spaStatusLabel } from "../../constants/spa.constants"
import type { OwnerSpaRequest } from "../../types/spa.types"

interface OwnerSpaRequestCardProps {
  request: OwnerSpaRequest
}

export function OwnerSpaRequestCard({ request }: OwnerSpaRequestCardProps) {
  const Icon = request.icon

  return (
    <Card className="rounded-[16px] border border-[#E6E8DD] bg-white py-0 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <CardContent className="flex flex-col gap-4 p-[25px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E0F2F1] text-[#005E53]">
              <Icon className="size-[22px]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-normal leading-6 text-[#1B1C15]">{request.serviceName}</h2>
              <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[0.22px] text-[#3E4946]">
                {request.bookingCode}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <Badge className={cn("h-[26px] rounded-full px-3 py-1 text-xs font-bold leading-[18px] shadow-none", spaStatusClassName[request.status])}>
              {spaStatusLabel[request.status]}
            </Badge>
            <p className="text-base font-bold leading-6 text-[#005E53]">{request.totalAmount}</p>
          </div>
        </div>

        <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <RequestMeta label="Đối tượng" value={request.petName} emphasized />
          <RequestMeta label="Thời gian" value={request.scheduledAt} />
          <RequestMeta label="Thanh toán" value={request.paymentMethodLabel} />
          <RequestMeta
            label="Trạng thái thanh toán"
            value={request.paymentStatusLabel}
            className={request.paymentStatusTone === "paid" ? "text-[#2E7D32]" : undefined}
            emphasized={request.paymentStatusTone === "paid"}
          />
        </div>

        {request.specialRequest ? (
          <div className="rounded-lg bg-[#F5F4E8] p-3 text-[13px] leading-[18px] text-[#3E4946]">
            <span className="font-bold text-[#1B1C15]">Yêu cầu đặc biệt:</span> {request.specialRequest}
          </div>
        ) : null}

        {request.paymentNotice ? (
          <div className="flex items-center gap-2 text-[13px] leading-[18px] text-[#3E4946]">
            <AlertCircle className="size-[15px] text-[#855300]" aria-hidden="true" />
            <span className="underline decoration-[rgba(133,83,0,0.3)] underline-offset-2">
              {request.paymentNotice}
            </span>
          </div>
        ) : null}

        <Separator className="bg-[#E6E8DD]" />

        <div className="flex justify-end gap-3">
          {request.canCancel ? (
            <Button
              variant="outline"
              className="h-10 rounded-lg border-[#3E4946] bg-white px-4 text-base font-normal leading-6 text-[#3E4946] hover:bg-[#F5F4E8]"
            >
              Hủy yêu cầu
            </Button>
          ) : null}
          <Button asChild className="h-10 rounded-lg bg-[#005E53] px-4 text-base font-normal leading-6 text-white hover:bg-[#004C43]">
            <Link href={`/owner/spa/${request.id}`}>Xem chi tiết</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface RequestMetaProps {
  label: string
  value: string
  className?: string
  emphasized?: boolean
}

function RequestMeta({ label, value, className, emphasized = false }: RequestMetaProps) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium leading-[14px] tracking-[0.22px] text-[#3E4946]">{label}</p>
      <p className={cn("text-sm leading-5 text-[#1B1C15]", emphasized ? "font-medium" : "font-normal", className)}>
        {value}
      </p>
    </div>
  )
}
