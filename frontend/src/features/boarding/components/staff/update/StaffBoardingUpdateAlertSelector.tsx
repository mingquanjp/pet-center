import { cn } from "@/lib/utils";
import { staffBoardingUpdateAlertLevelOptions } from "../../../constants/boarding.constants";
import type { StaffBoardingUpdateAlertLevel } from "../../../types/boarding.types";

interface StaffBoardingUpdateAlertSelectorProps {
  value: StaffBoardingUpdateAlertLevel;
  onChange: (value: StaffBoardingUpdateAlertLevel) => void;
  disabled?: boolean;
}

const activeClassByLevel: Record<StaffBoardingUpdateAlertLevel, string> = {
  NORMAL: "border-[#0D9488] bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20",
  NEED_ATTENTION: "border-[#F59E0B] bg-[#FFFBEB] text-[#D97706] shadow-sm ring-1 ring-[#F59E0B]",
  WARNING: "border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C] shadow-sm ring-1 ring-[#EF4444]",
};

export function StaffBoardingUpdateAlertSelector({
  value,
  onChange,
  disabled,
}: StaffBoardingUpdateAlertSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {staffBoardingUpdateAlertLevelOptions.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
              isActive
                ? activeClassByLevel[option.value]
                : "border-[#E2E8F0] bg-white text-[#475569] shadow-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
