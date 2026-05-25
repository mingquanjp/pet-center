import Link from "next/link"
import { CalendarClock, PawPrint } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spaStatusClassName, spaStatusLabel } from "../../constants/spa.constants"
import type { OwnerSpaRequest } from "../../types/spa.types"

interface OwnerSpaRequestCardProps {
  request: OwnerSpaRequest
}

export function OwnerSpaRequestCard({ request }: OwnerSpaRequestCardProps) {
  return (
    <Card className="rounded-card border border-petcenter-border bg-petcenter-card py-0 shadow-card">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="title-md text-petcenter-text">{request.serviceName}</h2>
            <Badge className={cn("rounded-pill px-2.5 py-1 label-md shadow-none", spaStatusClassName[request.status])}>
              {spaStatusLabel[request.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3 body-sm text-petcenter-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <PawPrint className="size-4" aria-hidden="true" />
              {request.petName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              {request.scheduledAt}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span className="body-md font-medium text-petcenter-text">{request.totalAmount}</span>
          <Button asChild variant="outline" className="h-10 rounded-control border-petcenter-primary text-petcenter-primary hover:bg-[#D8F3EE]">
            <Link href={`/owner/spa/${request.id}`}>Xem</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
