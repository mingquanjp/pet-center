import type { LucideIcon } from "lucide-react";

interface DoctorStatCardProps {
  count: string;
  icon: LucideIcon;
  iconClassName: string;
  label: string;
}

export function DoctorStatCard({
  count,
  icon: Icon,
  iconClassName,
  label,
}: DoctorStatCardProps) {
  return (
    <article className="flex h-32 flex-col justify-between rounded-card border border-petcenter-border bg-petcenter-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="body-md font-bold text-petcenter-text-secondary">{label}</p>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="heading-lg text-petcenter-text">{count}</p>
    </article>
  );
}
