import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { spaStatusClassName, spaStatusLabel } from "../../constants/spa.constants"
import type { OwnerSpaRequest } from "../../types/spa.types"

interface OwnerSpaRequestCardProps {
  onCancelRequest?: (request: OwnerSpaRequest) => void
  request: OwnerSpaRequest
}

export function OwnerSpaRequestCard({ onCancelRequest, request }: OwnerSpaRequestCardProps) {
  const Icon = request.icon
  const hasActions = request.canCancel

  return (
    <Card className="rounded-[12px] border border-[#E6E8DD] bg-white py-0 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F2F1] text-[#005E53]">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-6 text-[#1B1C15]">{request.serviceName}</h2>
              <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[0.22px] text-[#3E4946]">
                {request.bookingCode}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
            <Badge className={cn("h-6 rounded-full px-2.5 py-1 text-xs font-bold leading-4 shadow-none", spaStatusClassName[request.status])}>
              {spaStatusLabel[request.status]}
            </Badge>
            <p className="text-sm font-bold leading-5 text-[#005E53]">{request.totalAmount}</p>
          </div>
        </div>

        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
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
          <div className="line-clamp-2 rounded-lg bg-[#F5F4E8] px-3 py-2 text-[13px] leading-[18px] text-[#3E4946]">
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

        {hasActions ? <Separator className="bg-[#E6E8DD]" /> : null}

        {hasActions ? <div className="flex justify-end gap-3">
          {request.canCancel ? (
            <Button
              variant="outline"
              className="h-9 rounded-lg border-[#3E4946] bg-white px-3 text-sm font-medium leading-5 text-[#3E4946] hover:bg-[#F5F4E8]"
              onClick={() => onCancelRequest?.(request)}
              type="button"
            >
              Hủy yêu cầu
            </Button>
          ) : null}
        </div> : null}
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
    <div className="min-w-0 space-y-0.5">
      <p className="text-[11px] font-medium leading-[14px] tracking-[0.22px] text-[#3E4946]">{label}</p>
      <p className={cn("truncate text-sm leading-5 text-[#1B1C15]", emphasized ? "font-medium" : "font-normal", className)}>
        {value}
      </p>
    </div>
  )
}
