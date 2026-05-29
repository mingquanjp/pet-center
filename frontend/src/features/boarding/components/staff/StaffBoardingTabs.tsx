import React from "react";
import { StaffBoardingTab } from "../../types/boarding.types";
import { staffBoardingTabOptions } from "../../constants/boarding.constants";

interface Props {
  activeTab: StaffBoardingTab;
  onChange: (tab: StaffBoardingTab) => void;
  counts?: Record<StaffBoardingTab, number>;
}

export function StaffBoardingTabs({ activeTab, onChange, counts }: Props) {
  return (
    <div className="flex px-4 border-b border-petcenter-border overflow-x-auto w-full">
      {staffBoardingTabOptions.map((tab) => {
        const isActive = activeTab === tab.value;
        const count = counts?.[tab.value];

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              flex items-center gap-2 whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors border-b-2
              ${
                isActive
                  ? "border-petcenter-primary text-petcenter-primary"
                  : "border-transparent text-petcenter-text-secondary hover:text-petcenter-text hover:border-petcenter-border"
              }
            `}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[11px] font-semibold
                  ${isActive ? "bg-petcenter-primary text-white" : "bg-petcenter-border text-petcenter-text-secondary"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
