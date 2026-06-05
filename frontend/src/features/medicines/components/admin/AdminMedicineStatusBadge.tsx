import { MedicineStatus } from "../../types/medicine.types"
import { getMedicineStatusLabel } from "../../utils/medicine-format"

interface AdminMedicineStatusBadgeProps {
  status: MedicineStatus
}

export function AdminMedicineStatusBadge({
  status,
}: AdminMedicineStatusBadgeProps) {
  const label = getMedicineStatusLabel(status)

  if (status === "active") {
    return (
      <span className="inline-flex items-center w-fit px-2.5 py-1 text-xs font-bold rounded-full bg-petcenter-success-bg text-petcenter-success-text">
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center w-fit px-2.5 py-1 text-xs font-bold rounded-full bg-stone-200 text-stone-500">
      {label}
    </span>
  )
}
