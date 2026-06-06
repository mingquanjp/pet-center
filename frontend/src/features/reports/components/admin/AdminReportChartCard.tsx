import { ReactNode } from "react";

interface AdminReportChartCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function AdminReportChartCard({ title, children, action, className = "" }: AdminReportChartCardProps) {
  return (
    <div className={`min-w-0 overflow-hidden flex flex-col rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="title-md text-petcenter-text">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
