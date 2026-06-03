import { doctorExaminationTabs } from "../../constants/doctor-examinations.constants"
import { DoctorExaminationTab } from "../../types/examination.types"

interface Props {
  activeTab: DoctorExaminationTab
  counts: {
    totalCount: number
    waitingCount: number
    examiningCount: number
    completedCount: number
    followUpCount: number
  }
  onChange: (tab: DoctorExaminationTab) => void
}

export function DoctorExaminationTabs({ activeTab, counts, onChange }: Props) {
  const getCount = (tab: DoctorExaminationTab) => {
    if (tab === "ALL") return counts.totalCount
    if (tab === "WAITING") return counts.waitingCount
    if (tab === "EXAMINING") return counts.examiningCount
    if (tab === "COMPLETED") return counts.completedCount
    return counts.followUpCount
  }

  return (
    <div className="flex w-full overflow-x-auto border-b border-petcenter-border px-4">
      {doctorExaminationTabs.map((tab) => {
        const isActive = activeTab === tab.value

        return (
          <button
            key={tab.value}
            className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-petcenter-primary text-petcenter-primary"
                : "border-transparent text-petcenter-text-secondary hover:border-petcenter-border hover:text-petcenter-text"
            }`}
            onClick={() => onChange(tab.value)}
            type="button"
          >
            {tab.label} ({getCount(tab.value)})
          </button>
        )
      })}
    </div>
  )
}
