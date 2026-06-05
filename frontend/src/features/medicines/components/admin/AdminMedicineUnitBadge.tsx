import { MedicineUnit } from "../../types/medicine.types"
import { getMedicineUnitLabel } from "../../utils/medicine-format"

interface AdminMedicineUnitBadgeProps {
  unit: MedicineUnit
}

export function AdminMedicineUnitBadge({ unit }: AdminMedicineUnitBadgeProps) {
  const label = getMedicineUnitLabel(unit)

  return (
    <span className="px-2 py-0.5 text-xs font-semibold bg-stone-100 text-stone-600 rounded-md border border-stone-200 whitespace-nowrap">
      {label}
    </span>
  )
}
