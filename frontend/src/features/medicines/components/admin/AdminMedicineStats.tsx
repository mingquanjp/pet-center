import React from "react"
import { Pill, ShieldCheck, PauseCircle } from "lucide-react"
import { AdminMedicineStats as Stats } from "../../types/medicine.types"

interface AdminMedicineStatsProps {
  stats: Stats
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="h-26 p-5 bg-white rounded-2xl shadow-sm border border-petcenter-border flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <span className="text-petcenter-text-secondary text-sm font-medium">{title}</span>
      </div>
      <div className="text-petcenter-text text-2xl font-bold">{value}</div>
    </div>
  )
}

export function AdminMedicineStats({ stats }: AdminMedicineStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-gutter sm:grid-cols-3 w-full">
      <StatCard
        title="Tổng số thuốc"
        value={stats.totalMedicines}
        icon={<Pill className="w-5 h-5 text-petcenter-primary" />}
        color="bg-petcenter-info-bg"
      />
      <StatCard
        title="Đang hoạt động"
        value={stats.activeMedicines}
        icon={<ShieldCheck className="w-5 h-5 text-petcenter-success-text" />}
        color="bg-petcenter-success-bg"
      />
      <StatCard
        title="Ngừng hoạt động"
        value={stats.inactiveMedicines}
        icon={<PauseCircle className="w-5 h-5 text-petcenter-text-muted" />}
        color="bg-stone-100"
      />
    </section>
  )
}
