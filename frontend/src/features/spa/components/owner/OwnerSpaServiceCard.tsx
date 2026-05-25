import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SpaService } from "../../types/spa.types"

interface OwnerSpaServiceCardProps {
  service: SpaService
}

export function OwnerSpaServiceCard({ service }: OwnerSpaServiceCardProps) {
  const Icon = service.icon

  return (
    <Card className="min-h-[237px] rounded-[16px] border border-[#E6E8DD] bg-white py-0 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <CardContent className="flex h-full min-h-[237px] flex-col p-[25px]">
        <div className="flex items-center gap-3 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F2F1] text-[#005E53]">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold leading-[26px] text-[#1B1C15]">{service.title}</h2>
        </div>

        <p className="text-[13px] leading-[18px] text-[#3E4946]">
          {service.description}
        </p>

        <p className="mt-2 text-[13px] font-medium leading-[18px] text-[#3E4946]">
          Giá: {service.priceText}
        </p>

        <div className="mt-auto pt-4">
          <Separator className="bg-[#E6E8DD]" />
          <div className="flex items-center justify-between gap-3 pt-4">
            <Button
              variant="ghost"
              className="h-9 px-0 text-base font-normal leading-6 text-[#005E53] hover:bg-transparent hover:text-[#005E53]"
            >
              Xem chi tiết
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-xl border-[#005E53] bg-white px-4 text-base font-normal leading-6 text-[#005E53] hover:bg-[#005E53] hover:text-white"
            >
              <Link href={`/owner/spa/booking?serviceId=${service.id}`}>
                Đặt dịch vụ
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
