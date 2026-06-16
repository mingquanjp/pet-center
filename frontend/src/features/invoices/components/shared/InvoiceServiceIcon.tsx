import * as React from "react"
import { Bed, Scissors, Stethoscope, Pill, AlertCircle } from "lucide-react"
import { InvoiceServiceType } from "../../types/invoice.types"

export function InvoiceServiceIcon({ type, className }: { type: InvoiceServiceType; className?: string }) {
  switch (type) {
    case "BOARDING":
      return <Bed className={className} />
    case "GROOMING":
      return <Scissors className={className} />
    case "MEDICAL":
      return <Stethoscope className={className} />
    case "PRESCRIPTION":
      return <Pill className={className} />
    default:
      return <AlertCircle className={className} />
  }
}
