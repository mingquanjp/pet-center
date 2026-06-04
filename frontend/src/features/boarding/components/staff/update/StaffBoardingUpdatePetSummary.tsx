import type { StaffBoardingDetail, StaffBoardingListItem } from "../../../types/boarding.types";
import { formatBoardingDateRange } from "../../../utils/boarding-format";

interface StaffBoardingUpdatePetSummaryProps {
  record: StaffBoardingListItem | StaffBoardingDetail;
}

function getRoomLabel(record: StaffBoardingListItem | StaffBoardingDetail) {
  if (!record.room) return "Chưa gán";

  const roomName = record.room.name || record.room.code;
  if (!roomName) return "Chưa gán";

  return roomName;
}

function getCurrentDayLabel(record: StaffBoardingListItem | StaffBoardingDetail) {
  if (record.status !== "STAYING" || !record.checkInDate) return null;

  const checkInDate = new Date(record.checkInDate);
  const now = new Date();

  if (Number.isNaN(checkInDate.getTime())) return null;

  const day = Math.max(
    1,
    Math.floor((now.getTime() - checkInDate.getTime()) / 86_400_000) + 1
  );

  return `Ngày thứ ${day}`;
}

export function StaffBoardingUpdatePetSummary({ record }: StaffBoardingUpdatePetSummaryProps) {
  const ownerName = record.owner?.fullName || "Chưa có thông tin";
  const timeRange =
    record.checkInDate && record.checkOutDate
      ? formatBoardingDateRange(record.checkInDate, record.checkOutDate)
      : "Chưa xác định";
  const currentDayLabel = getCurrentDayLabel(record);

  return (
    <section className="rounded-xl border border-[#0D9488]/10 bg-linear-to-br from-[#0D9488]/5 to-transparent p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Thú cưng</p>
          <p className="text-[15px] font-bold text-[#0F172A]">
            {record.pet.name}{" "}
            <span className="font-medium text-[#64748B]">
              ({record.boardingCode})
            </span>
          </p>
        </div>

        <div>
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Chủ nuôi</p>
          <p className="text-[15px] font-semibold text-[#0F172A]">{ownerName}</p>
        </div>

        <div>
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Phòng lưu trú</p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
            <p className="text-[13px] font-bold text-[#0F172A]">{getRoomLabel(record)}</p>
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Thời gian</p>
          <p className="text-[15px] font-semibold text-[#0F172A]">
            {timeRange}
            {currentDayLabel ? (
              <span className="text-[#0D9488] font-bold ml-1"> ({currentDayLabel})</span>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
