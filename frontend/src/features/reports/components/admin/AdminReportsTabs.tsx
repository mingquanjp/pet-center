import { AdminReportTab } from "../../types/report.types";
import { adminReportTabOptions } from "../../constants/report.constants";
import { cn } from "@/lib/utils";

interface AdminReportsTabsProps {
  activeTab: AdminReportTab;
  onTabChange: (tab: AdminReportTab) => void;
}

export function AdminReportsTabs({ activeTab, onTabChange }: AdminReportsTabsProps) {
  return (
    <div className="flex w-full overflow-x-auto border-b border-petcenter-border hide-scrollbar">
      <div className="flex min-w-max gap-6 px-1">
        {adminReportTabOptions.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "relative pb-4 text-sm font-medium transition-colors hover:text-petcenter-primary",
                isActive ? "text-petcenter-primary" : "text-petcenter-text-secondary"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-petcenter-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
