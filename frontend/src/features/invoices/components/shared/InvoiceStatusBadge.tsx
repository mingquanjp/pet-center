import * as React from "react"
import { InvoicePaymentStatus } from "../../types/invoice.types"
import { invoicePaymentStatusLabel } from "../../constants/invoice.constants"

interface InvoiceStatusBadgeProps {
  status: InvoicePaymentStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className = "" }: InvoiceStatusBadgeProps) {
  const label = invoicePaymentStatusLabel[status] || status

  let variantClass = ""
  switch (status) {
    case "PAID":
      variantClass = "bg-petcenter-success-bg text-petcenter-success-text"
      break
    case "PENDING_PAYMENT":
      variantClass = "bg-petcenter-warning-bg text-petcenter-warning-text border border-petcenter-warning-text/20"
      break
    case "OVERDUE":
      variantClass = "bg-petcenter-danger-bg text-petcenter-danger-text"
      break
    default:
      variantClass = "bg-petcenter-background text-petcenter-text-secondary"
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full label-sm ${variantClass} ${className}`}>
      {label}
    </span>
  )
}
