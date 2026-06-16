"use client"

import * as React from "react"
import Link from "next/link"
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
    iconClassName: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  {
    key: "pendingGroomingTickets",
    label: "Dịch vụ spa cần xác nhận",
    icon: Leaf,
    iconClassName: "bg-petcenter-primary/10 text-petcenter-primary",
  },
  {
    key: "availableRooms",
    label: "Phòng trống",
    icon: BedDouble,
    iconClassName: "bg-petcenter-success-bg text-petcenter-success-text",
  },
  {
    key: "todayInvoices",
    label: "Hóa đơn hôm nay",
    icon: ReceiptText,
    iconClassName: "bg-petcenter-sidebar text-petcenter-text-secondary",
  },
] as const

type StaffDashboardPageCache = {
  overview: StaffDashboardOverview
}

const staffDashboardPageCacheTtlMs = 30 * 1000
let staffDashboardPageCache: StaffDashboardPageCache | null = null
let staffDashboardPageCacheTimer: ReturnType<typeof setTimeout> | null = null

function saveStaffDashboardPageCache(cache: StaffDashboardPageCache): void {
  staffDashboardPageCache = cache

  if (staffDashboardPageCacheTimer) {
    clearTimeout(staffDashboardPageCacheTimer)
  }

  staffDashboardPageCacheTimer = setTimeout(() => {
    staffDashboardPageCache = null
    staffDashboardPageCacheTimer = null
  }, staffDashboardPageCacheTtlMs)
}

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

function getTaskHref(sourceType: StaffDashboardTaskSource): string {
  return sourceType === "grooming" ? "/staff/spa" : "/staff/appointments";
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
  const [overview, setOverview] = React.useState<StaffDashboardOverview | null>(
    () => staffDashboardPageCache?.overview ?? null
  );
  const [isLoading, setIsLoading] = React.useState(() => !staffDashboardPageCache);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const data = await staffDashboardApi.getOverview();

        if (!isMounted) return;

        setOverview(data);
        saveStaffDashboardPageCache({
          overview: data,
        });
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
  const showLoadingRows = isLoading && appointmentTasks.length === 0;

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

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.label}
              className="flex h-32 flex-col justify-between rounded-card border border-petcenter-border bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="label-md text-petcenter-text-secondary">
                  {item.label}
                </p>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${item.iconClassName}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="heading-lg text-petcenter-text">
                {isLoading ? "..." : formatStatValue(item.key, overview?.stats)}
              </p>
            </article>
          )
        })}
      </section>

      <section className="w-full overflow-hidden rounded-[16px] border border-[#e6e8dd] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="flex w-full items-center justify-between border-b border-[rgba(189,201,197,0.3)] bg-white px-6 pb-[17px] pt-4">
          <h2 className="whitespace-nowrap text-xl font-semibold leading-7 tracking-[-0.2px] text-[#1b1c15]">
            Lịch khám cần xử lý
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-auto rounded-[12px] px-0 py-0 text-xs font-medium leading-4 text-[#005e53] hover:bg-transparent hover:text-[#005e53]"
          >
            <Link href="/staff/appointments">Xem tất cả</Link>
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed border-collapse text-left">
            <thead className="border-b border-petcenter-border bg-petcenter-background">
              <tr>
                <th className="w-[109px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Mã lịch</th>
                <th className="w-[185px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thú cưng</th>
                <th className="w-[142px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Chủ nuôi</th>
                <th className="w-[130px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Ngày giờ</th>
                <th className="w-[131px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Loại lịch</th>
                <th className="w-[166px] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
                <th className="w-[111px] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-petcenter-border bg-white">
              {showLoadingRows ? (
                <>
                  {[0, 1].map((rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="h-[81px] bg-white"
                    >
                      <td className="px-6 py-[29.5px]">
                        <div className="h-4 w-16 animate-pulse rounded-full bg-[#e4e3d7]" />
                      </td>
                      <td className="px-6 py-0">
                        <div className="flex items-center gap-3">
                          <div className="size-8 animate-pulse rounded-full bg-[#e4e3d7]" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-16 animate-pulse rounded-full bg-[#e4e3d7]" />
                            <div className="h-3 w-24 animate-pulse rounded-full bg-[#e4e3d7]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-[29.5px]">
                        <div className="h-4 w-20 animate-pulse rounded-full bg-[#e4e3d7]" />
                      </td>
                      <td className="px-6 py-[19.5px]">
                        <div className="h-4 w-16 animate-pulse rounded-full bg-[#e4e3d7]" />
                      </td>
                      <td className="px-6 py-[29.5px]">
                        <div className="h-4 w-20 animate-pulse rounded-full bg-[#e4e3d7]" />
                      </td>
                      <td className="px-6 py-[26px]">
                        <div className="h-7 w-28 animate-pulse rounded-full bg-[#fff3d8]" />
                      </td>
                      <td className="px-6 py-[23px]">
                        <div className="ml-auto h-[34px] w-14 animate-pulse rounded-[12px] bg-[#e4e3d7]" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : null}
              {appointmentTasks.map((appointment) => {
                const Icon = getTaskIcon(appointment.sourceType)
                const href = getTaskHref(appointment.sourceType)
                const schedule = formatSchedule(appointment.scheduledAt)

                return (
                  <tr
                    key={appointment.taskId}
                    className="h-[81px] bg-white transition-colors hover:bg-petcenter-background/60"
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
                          <span className="max-w-[120px] truncate whitespace-nowrap text-sm font-semibold leading-5 text-[#1b1c15]">
                            {appointment.petName}
                          </span>
                          <span className="max-w-[120px] truncate whitespace-nowrap text-xs font-normal leading-4 text-[#3e4946]">
                            {appointment.petDescription}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[150px] truncate px-6 py-[29.5px] text-sm font-normal leading-5 text-[#1b1c15]">
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
                    <td className="max-w-[150px] truncate px-6 py-[29.5px] text-sm font-normal leading-5 text-[#3e4946]">
                      {appointment.typeLabel}
                    </td>
                    <td className="px-6 py-[26px]">
                      <span className="inline-flex items-center justify-center rounded-full bg-[#fff3d8] px-4 pb-2 pt-[7px] text-center text-[13px] font-semibold leading-[13px] text-[#b45309]">
                        {appointment.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-[23px] text-right">
                      <Button
                        asChild
                        className="h-[34px] rounded-[12px] bg-[#00796b] px-4 pb-[9.5px] pt-[8.5px] text-center text-xs font-medium leading-4 text-white hover:bg-[#00695c]"
                      >
                        <Link href={href}>Xử lý</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && !errorMessage && appointmentTasks.length === 0 ? (
                <tr className="h-[81px] bg-white">
                  <td className="px-6 py-6 text-sm leading-5 text-[#3e4946]" colSpan={7}>
                    Chưa có lịch khám cần xử lý.
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
