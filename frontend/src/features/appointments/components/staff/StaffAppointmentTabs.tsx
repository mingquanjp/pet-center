import { StaffAppointmentTab } from "../../types/appointment.types";
import { staffAppointmentTabOptions } from "../../constants/appointment.constants";

interface Props {
  activeTab: StaffAppointmentTab;
  onChange: (tab: StaffAppointmentTab) => void;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  cancelledCount: number;
}

export function StaffAppointmentTabs({
  activeTab,
  onChange,
  pendingCount,
  confirmedCount,
  rejectedCount,
  cancelledCount
}: Props) {
  const getTabLabel = (value: StaffAppointmentTab, baseLabel: string) => {
    switch (value) {
      case "PENDING": return `${baseLabel} (${pendingCount})`;
      case "CONFIRMED": return `${baseLabel} (${confirmedCount})`;
      case "REJECTED": return `${baseLabel} (${rejectedCount})`;
      case "CANCELLED": return `${baseLabel} (${cancelledCount})`;
      default: return baseLabel;
    }
  };

  return (
    <div className="flex px-4 border-b border-petcenter-border overflow-x-auto w-full">
      {staffAppointmentTabOptions.map(opt => {
        const isActive = activeTab === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors border-b-2
              ${isActive 
                ? 'border-petcenter-primary text-petcenter-primary' 
                : 'border-transparent text-petcenter-text-secondary hover:text-petcenter-text hover:border-petcenter-border'}
            `}
          >
            {getTabLabel(opt.value, opt.label)}
          </button>
        );
      })}
    </div>
  );
}
