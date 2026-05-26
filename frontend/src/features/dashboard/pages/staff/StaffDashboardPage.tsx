"use client"

import * as React from "react"
import {
  BedDouble,
  CalendarClock,
  Cat,
  Leaf,
  Rabbit,
  ReceiptText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { staffDashboardApi } from "../../api/staff-dashboard.api"
import type { StaffDashboardOverview, StaffDashboardTaskSource } from "../../types/staff-dashboard.types"

const statCards = [
  {
    key: "pendingAppointments",
    label: "Lịch chờ xác nhận",
    icon: CalendarClock,
    bg: "#fef3c7",
    iconColor: "#f59e0b",
  },
  {
    key: "pendingGroomingTickets",
    label: "Dịch vụ spa cần xác nhận",
    icon: Leaf,
    bg: "#ccfbf1",
    iconColor: "#0f8f88",
  },
  {
    key: "availableRooms",
    label: "Phòng trống",
    icon: BedDouble,
    bg: "#d1fae5",
    iconColor: "#00796b",
  },
  {
    key: "todayInvoices",
    label: "Hóa đơn hôm nay",
    icon: ReceiptText,
    bg: "#fef9c3",
    iconColor: "#d97706",
  },
] as const

function formatStatValue(
  key: (typeof statCards)[number]["key"],
  stats: StaffDashboardOverview["stats"] | undefined
): string {
  if (!stats) return "0";

  if (key === "availableRooms") {
    return `${String(stats.availableRooms).padStart(2, "0")} / ${stats.totalRooms}`;
  }

  const value = stats[key];

  return key === "pendingGroomingTickets" ? String(value).padStart(2, "0") : String(value);
}

function getTaskIcon(sourceType: StaffDashboardTaskSource) {
  return sourceType === "grooming" ? Cat : Rabbit;
}

function formatSchedule(value: string): [string, string] {
  const date = new Date(value);
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateLabel =
    dateFormatter.format(date) === dateFormatter.format(today)
      ? "Hôm nay,"
      : new Intl.DateTimeFormat("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
        }).format(date);

  return [dateLabel, timeFormatter.format(date)];
}

export function StaffDashboardPage() {
  const [overview, setOverview] = React.useState<StaffDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const data = await staffDashboardApi.getOverview();

        if (!isMounted) return;

        setOverview(data);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : "Không thể tải dữ liệu tổng quan nhân viên");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const greetingText = overview
    ? `Xin chào, ${overview.staff.fullName}. Đây là các công việc cần xử lý hôm nay.`
    : "Đây là các công việc cần xử lý hôm nay.";
  const appointmentTasks = overview?.appointmentTasks ?? [];

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="flex w-full flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#1b1c15]">
          Tổng quan nhân viên
        </h1>
        <p className="text-sm font-normal leading-5 text-[#3e4946]">
          {greetingText}
        </p>
      </section>

      <section className="grid w-full grid-cols-1 gap-4 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.label}
              className="relative flex h-[100px] items-center gap-4 overflow-hidden rounded-[16px] bg-white p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div
                className="absolute bottom-[-24px] right-[-24px] size-24 rounded-full opacity-30"
                style={{ backgroundColor: item.bg }}
              />
              <div
                className="relative flex size-14 shrink-0 items-center justify-center rounded-[16px]"
                style={{ backgroundColor: item.bg }}
              >
                <Icon className="size-[25px]" style={{ color: item.iconColor }} />
              </div>
              <div className="relative flex min-w-0 flex-col gap-1">
                <p className="whitespace-nowrap text-[13px] font-medium leading-5 text-[#3e4946]">
                  {item.label}
                </p>
                <p className="whitespace-nowrap text-2xl font-bold leading-8 text-[#1b1c15]">
                  {formatStatValue(item.key, overview?.stats)}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="w-full overflow-hidden rounded-[16px] border border-[#e6e8dd] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="flex w-full items-center justify-between border-b border-[rgba(189,201,197,0.3)] bg-white px-6 pb-[17px] pt-4">
          <h2 className="whitespace-nowrap text-xl font-semibold leading-7 tracking-[-0.2px] text-[#1b1c15]">
            Lịch hẹn cần xử lý
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto rounded-[12px] px-0 py-0 text-xs font-medium leading-4 text-[#005e53] hover:bg-transparent hover:text-[#005e53]"
          >
            Xem tất cả
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[rgba(189,201,197,0.3)] bg-[#f0fdf4]">
                <th className="w-[109px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Mã lịch</th>
                <th className="w-[185px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Thú cưng</th>
                <th className="w-[142px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Chủ nuôi</th>
                <th className="w-[130px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Ngày giờ</th>
                <th className="w-[131px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Loại lịch</th>
                <th className="w-[166px] px-6 py-3 text-xs font-semibold leading-4 text-[#3e4946]">Trạng thái</th>
                <th className="w-[111px] px-6 py-3 text-right text-xs font-semibold leading-4 text-[#3e4946]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointmentTasks.map((appointment) => {
                const Icon = getTaskIcon(appointment.sourceType)
                const schedule = formatSchedule(appointment.scheduledAt)

                return (
                  <tr
                    key={appointment.taskId}
                    className="h-[81px] border-b border-[rgba(189,201,197,0.2)] bg-white"
                  >
                    <td className="px-6 py-[29.5px] text-sm font-medium leading-5 text-[#1b1c15]">
                      {appointment.code}
                    </td>
                    <td className="px-6 py-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e4e3d7] text-[#3e4946]">
                          <Icon className="size-[15px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap text-sm font-semibold leading-5 text-[#1b1c15]">
                            {appointment.petName}
                          </span>
                          <span className="whitespace-nowrap text-xs font-normal leading-4 text-[#3e4946]">
                            {appointment.petDescription}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-[29.5px] text-sm font-normal leading-5 text-[#1b1c15]">
                      {appointment.ownerName}
                    </td>
                    <td className="px-6 py-[19.5px] text-sm font-normal leading-5 text-[#1b1c15]">
                      {schedule.map((line) => (
                        <React.Fragment key={line}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </td>
                    <td className="px-6 py-[29.5px] text-sm font-normal leading-5 text-[#3e4946]">
                      {appointment.typeLabel}
                    </td>
                    <td className="px-6 py-[26px]">
                      <span className="inline-flex items-center justify-center rounded-full bg-[#fff3d8] px-4 pb-2 pt-[7px] text-center text-[13px] font-semibold leading-[13px] text-[#b45309]">
                        {appointment.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-[23px] text-right">
                      <Button className="h-[34px] rounded-[12px] bg-[#00796b] px-4 pb-[9.5px] pt-[8.5px] text-center text-xs font-medium leading-4 text-white hover:bg-[#00695c]">
                        Xử lý
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && !errorMessage && appointmentTasks.length === 0 ? (
                <tr className="h-[81px] border-b border-[rgba(189,201,197,0.2)] bg-white">
                  <td className="px-6 py-6 text-sm leading-5 text-[#3e4946]" colSpan={7}>
                    Chưa có lịch hẹn cần xử lý.
                  </td>
                </tr>
              ) : null}
              {errorMessage ? (
                <tr className="h-[81px] border-b border-[rgba(189,201,197,0.2)] bg-white">
                  <td className="px-6 py-6 text-sm leading-5 text-[#b91c1c]" colSpan={7}>
                    {errorMessage}
                  </td>
                </tr>
              ) : null}
              <tr className="h-[81px] border-t border-[rgba(189,201,197,0.2)] bg-white">
                <td colSpan={7} />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
