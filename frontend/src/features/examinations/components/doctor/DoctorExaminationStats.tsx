import { AlertCircle, CheckCircle2, ClipboardList, Clock, Stethoscope } from "lucide-react"

interface Props {
  total: number
  waiting: number
  examining: number
  completed: number
  followUp: number
}

export function DoctorExaminationStats({ total, waiting, examining, completed, followUp }: Props) {
  const items = [
    {
      label: "Tất cả phiếu khám",
      value: total,
      icon: ClipboardList,
      iconClass: "bg-petcenter-filter text-petcenter-primary",
    },
    {
      label: "Chờ khám",
      value: waiting,
      icon: Clock,
      iconClass: "bg-petcenter-warning-bg text-petcenter-warning-text",
    },
    {
      label: "Đang khám",
      value: examining,
      icon: Stethoscope,
      iconClass: "bg-petcenter-info-bg text-petcenter-info-text",
    },
    {
      label: "Hoàn tất",
      value: completed,
      icon: CheckCircle2,
      iconClass: "bg-petcenter-success-bg text-petcenter-success-text",
    },
    {
      label: "Cần tái khám",
      value: followUp,
      icon: AlertCircle,
      iconClass: "bg-petcenter-danger-bg text-petcenter-danger-text",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl bg-petcenter-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-petcenter-text-secondary">{item.label}</p>
                <p className="text-2xl font-bold text-petcenter-text">
                  {String(item.value).padStart(2, "0")}
                </p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
