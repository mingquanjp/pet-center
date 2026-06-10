"use client"

import * as React from "react"
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileWarning,
  FileText,
  HeartPulse,
  PawPrint,
  Pill,
  ReceiptText,
  Sparkles,
  Stethoscope,
  type LucideIcon,
  Users,
} from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { adminDashboardApi } from "../../api/admin-dashboard.api"
import type {
  AdminDashboardAlert,
  AdminDashboardOverview,
  AdminDashboardRecentActivity,
  AdminDashboardRevenuePoint,
  AdminDashboardServiceRevenue,
  Pagination,
} from "../../types/admin-dashboard.types"

type AdminStatCard = {
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
  trend?: string
  trendTone?: "success" | "danger"
  suffix?: string
  progressPercentage?: number
  valueClassName?: string
}

type AdminStatConfig = Omit<AdminStatCard, "value" | "trend" | "trendTone" | "suffix" | "progressPercentage">

type AdminStatKey =
  | "totalUsers"
  | "totalPets"
  | "medicalAppointments"
  | "boardingOccupancy"
  | "monthlyRevenue"
  | "pendingInvoices"
  | "medicineRevenue"
  | "bookingRate"

const boardingOccupancyLabel = "Thú cưng đang lưu trú"

type DateRangePreset = "today" | "last7Days" | "last30Days"

const statCardConfig: AdminStatConfig[] = [
  {
    label: "Tổng người dùng",
    icon: Users,
    iconClassName: "bg-petcenter-primary/10 text-petcenter-primary",
  },
  {
    label: "Tổng thú cưng",
    icon: PawPrint,
    iconClassName: "bg-petcenter-cta/15 text-petcenter-cta-hover",
  },
  {
    label: "Lịch khám hôm nay",
    icon: CalendarDays,
    iconClassName: "bg-petcenter-info-bg text-petcenter-info-text",
  },
  {
    label: boardingOccupancyLabel,
    icon: BedDouble,
    iconClassName: "bg-petcenter-primary/10 text-petcenter-primary",
  },
  {
    label: "Doanh thu 30 ngày",
    icon: CreditCard,
    iconClassName: "bg-petcenter-success-bg text-petcenter-success-text",
  },
  {
    label: "Hóa đơn chờ thanh toán",
    icon: ReceiptText,
    iconClassName: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  {
    label: "Doanh thu thuốc",
    icon: Pill,
    iconClassName: "bg-petcenter-danger-bg text-petcenter-danger-text",
  },
  {
    label: "Tỷ lệ đặt phòng",
    icon: CheckCircle2,
    iconClassName: "bg-petcenter-info-bg text-petcenter-info-text",
  },
]

const adminActivityCategoryMeta: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  medical: {
    label: "Khám bệnh",
    icon: Stethoscope,
    className: "bg-petcenter-success-bg text-petcenter-success-text",
  },
  vaccination: {
    label: "Tiêm phòng",
    icon: HeartPulse,
    className: "bg-petcenter-warning-bg text-petcenter-warning-text",
  },
  grooming: {
    label: "Spa",
    icon: Sparkles,
    className: "bg-petcenter-primary/10 text-petcenter-primary",
  },
  boarding: {
    label: "Lưu trú",
    icon: BedDouble,
    className: "bg-petcenter-info-bg text-petcenter-info-text",
  },
  invoice: {
    label: "Hóa đơn",
    icon: FileText,
    className: "bg-petcenter-sidebar text-petcenter-text-secondary",
  },
  payment: {
    label: "Thanh toán",
    icon: ReceiptText,
    className: "bg-petcenter-cta/15 text-petcenter-cta-hover",
  },
  profile: {
    label: "Hồ sơ",
    icon: PawPrint,
    className: "bg-petcenter-primary/10 text-petcenter-primary",
  },
}

const adminActivityFilterOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Khám bệnh", value: "medical" },
  { label: "Spa", value: "grooming" },
  { label: "Lưu trú", value: "boarding" },
  { label: "Hóa đơn", value: "invoice" },
  { label: "Thanh toán", value: "payment" },
] as const

const activityHistoryPageSize = 30

export function AdminDashboardPage() {
  const [dateRange, setDateRange] = React.useState(() => getLast30DaysRange())
  const [dashboard, setDashboard] = React.useState<AdminDashboardOverview | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = React.useState(false)
  const recentActivityCardRef = React.useRef<HTMLElement | null>(null)
  const [recentActivityCardHeight, setRecentActivityCardHeight] = React.useState<number | null>(null)

  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())
  const dateRangeLabel = formatDateRangeLabel(dateRange.startDate, dateRange.endDate)
  const dashboardStats = dashboard ? buildStatCards(dashboard) : buildLoadingStatCards()
  const recentActivityRows = dashboard?.recentActivities ?? []
  const operationAlertRows = dashboard?.operationAlerts ?? []
  const handleDateRangeChange = React.useCallback((nextDateRange: { startDate: string; endDate: string }) => {
    setIsLoading(true)
    setDateRange(nextDateRange)
  }, [])

  React.useEffect(() => {
    const abortController = new AbortController()

    adminDashboardApi
      .getOverview(dateRange, { signal: abortController.signal })
      .then((data) => {
        if (!abortController.signal.aborted) {
          setDashboard(data)
          setErrorMessage(null)
        }
      })
      .catch((error) => {
        if (!abortController.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải dashboard quản trị")
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => abortController.abort()
  }, [dateRange])

  React.useEffect(() => {
    const element = recentActivityCardRef.current

    if (!element) return

    const updateHeight = () => {
      setRecentActivityCardHeight(Math.ceil(element.getBoundingClientRect().height))
    }
    const resizeObserver = new ResizeObserver(updateHeight)

    updateHeight()
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [recentActivityRows.length, isLoading])

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-section">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="heading-lg text-petcenter-text">{"Tổng quan Dashboard"}</h1>
          <p className="body-sm mt-1 text-petcenter-text-secondary">{"Hôm nay"}, {todayLabel}</p>
        </div>
        <DateRangePicker value={dateRange} label={dateRangeLabel} onChange={handleDateRangeChange} />
      </section>

      {errorMessage ? (
        <div className="rounded-control border border-petcenter-danger-text/20 bg-petcenter-danger-bg px-4 py-3 text-sm text-petcenter-danger-text">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article
            className="flex min-h-32 flex-col justify-between rounded-card border border-petcenter-border bg-white p-4 shadow-card"
            key={stat.label}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.iconClassName}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              {stat.trend ? (
                <span
                  className={
                    stat.trendTone === "danger"
                      ? "label-sm rounded bg-petcenter-danger-bg px-2 py-1 font-bold text-petcenter-danger-text"
                      : "label-sm rounded bg-petcenter-success-bg px-2 py-1 font-bold text-petcenter-success-text"
                  }
                >
                  {stat.trend}
                </span>
              ) : stat.suffix ? (
                <span className="label-sm text-petcenter-text-secondary">{stat.suffix}</span>
              ) : null}
            </div>
            <div>
              <p className="label-md mb-1 text-petcenter-text-secondary">{stat.label}</p>
              <p className={`heading-md text-petcenter-text ${stat.valueClassName ?? ""}`}>{stat.value}</p>
              {stat.label === boardingOccupancyLabel ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-petcenter-sidebar">
                  <div
                    className="h-full rounded-full bg-petcenter-primary"
                    style={{ width: `${Math.min(Math.max(stat.progressPercentage ?? 0, 0), 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <RevenueTrendPanel data={dashboard?.revenueTrend} />
        <ServiceRevenuePanel data={dashboard?.serviceRevenue} />
        <OperationsSnapshotPanel dashboard={dashboard} />
      </section>

      <section className="grid grid-cols-1 items-start gap-gutter xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section
          className="w-full overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card"
          ref={recentActivityCardRef}
        >
          <div className="flex items-center justify-between border-b border-petcenter-border bg-petcenter-filter px-5 py-4">
            <h2 className="heading-sm text-petcenter-text">{"Hoạt động gần đây"}</h2>
            <button
              className="label-md font-semibold text-petcenter-primary hover:underline"
              onClick={() => setIsActivityHistoryOpen(true)}
              type="button"
            >
              {"Xem tất cả"}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-petcenter-border bg-white text-petcenter-text-secondary">
                <tr>
                  <th className="label-md px-5 py-3">{"Thời gian"}</th>
                  <th className="label-md px-5 py-3">{"Mã phiếu"}</th>
                  <th className="label-md px-5 py-3">{"Khách hàng / Thú cưng"}</th>
                  <th className="label-md px-5 py-3">{"Hành động"}</th>
                  <th className="label-md px-5 py-3">{"Trạng thái"}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.length > 0 ? recentActivityRows.map((activity) => (
                  <tr className="border-b border-petcenter-border last:border-b-0 hover:bg-petcenter-filter" key={getRecentActivityKey(activity)}>
                    <td className="body-sm px-5 py-3 text-petcenter-text">{getRecentActivityTime(activity)}</td>
                    <td className="body-sm px-5 py-3 font-semibold text-petcenter-primary">{activity.code}</td>
                    <td className="px-5 py-3">
                      <p className="body-sm font-medium text-petcenter-text">{getRecentActivityCustomer(activity)}</p>
                      {getRecentActivityPet(activity) ? <p className="label-sm mt-0.5 text-petcenter-text-secondary">{getRecentActivityPet(activity)}</p> : null}
                    </td>
                    <td className="body-sm px-5 py-3 text-petcenter-text-secondary">{activity.action}</td>
                    <td className="px-5 py-3">
                      <span className={`label-sm rounded px-2.5 py-1 font-bold ${getRecentActivityStatusClassName(activity)}`}>
                        {getRecentActivityStatusLabel(activity)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="body-sm px-5 py-6 text-petcenter-text-secondary" colSpan={5}>
                      {isLoading ? "Đang tải hoạt động..." : "Chưa có hoạt động trong khoảng thời gian này."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="flex w-full min-h-0 flex-col overflow-hidden rounded-card border border-petcenter-border bg-white p-5 shadow-card"
          style={recentActivityCardHeight ? { height: recentActivityCardHeight } : undefined}
        >
          <div className="mb-4 flex items-center gap-2 border-b border-petcenter-border pb-3">
            <AlertTriangle className="h-5 w-5 text-petcenter-danger-text" />
            <h2 className="heading-sm text-petcenter-text">{"Cảnh báo vận hành"}</h2>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {operationAlertRows.length > 0 ? operationAlertRows.map((alert) => (
              <article className={`flex gap-3 rounded-control border p-3 ${getAlertClassName(alert)}`} key={getAlertKey(alert)}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white/70">
                  {renderAlertIcon(alert)}
                </span>
                <div>
                  <h3 className="body-sm font-semibold">{alert.title}</h3>
                  <p className="body-sm mt-1 text-petcenter-text-secondary">{alert.description}</p>
                </div>
              </article>
            )) : (
              <p className="body-sm rounded-control border border-dashed border-petcenter-border-strong bg-petcenter-filter px-4 py-6 text-center text-petcenter-text-secondary">
                {isLoading ? "Đang tải cảnh báo..." : "Chưa có cảnh báo vận hành."}
              </p>
            )}
          </div>
        </section>
      </section>

      <AdminActivityHistoryDialog
        dateRange={dateRange}
        open={isActivityHistoryOpen}
        onOpenChange={setIsActivityHistoryOpen}
      />
    </div>
  )
}

function AdminActivityHistoryDialog({
  dateRange,
  open,
  onOpenChange,
}: {
  dateRange: { startDate: string; endDate: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activities, setActivities] = React.useState<AdminDashboardRecentActivity[]>([])
  const [pagination, setPagination] = React.useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [activeCategory, setActiveCategory] = React.useState<string>("all")

  const filteredActivities = React.useMemo(() => {
    if (activeCategory === "all") return activities

    return activities.filter((activity) => activity.category === activeCategory)
  }, [activeCategory, activities])
  const groupedActivities = React.useMemo(() => groupAdminActivitiesByDate(filteredActivities), [filteredActivities])
  const hasMoreActivities = pagination ? pagination.page < pagination.totalPages : false

  const loadActivityPage = React.useCallback(
    async (page: number, signal?: AbortSignal) => {
      const isFirstPage = page === 1

      try {
        if (isFirstPage) {
          setIsLoading(true)
        } else {
          setIsLoadingMore(true)
        }
        setErrorMessage(null)

        const result = await adminDashboardApi.listActivityLogs(
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            page,
            limit: activityHistoryPageSize,
          },
          signal ? { signal } : {}
        )

        if (signal?.aborted) return

        setPagination(result.pagination)
        setActivities((currentActivities) =>
          isFirstPage ? result.activities : mergeAdminActivities(currentActivities, result.activities)
        )
      } catch (error) {
        if (!signal?.aborted) {
          if (isFirstPage) {
            setActivities([])
            setPagination(null)
          }
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải lịch sử hoạt động")
        }
      } finally {
        if (!signal?.aborted) {
          if (isFirstPage) {
            setIsLoading(false)
          } else {
            setIsLoadingMore(false)
          }
        }
      }
    },
    [dateRange.endDate, dateRange.startDate]
  )

  React.useEffect(() => {
    if (!open) return

    const abortController = new AbortController()

    async function loadActivities() {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const result = await adminDashboardApi.listActivityLogs(
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            page: 1,
            limit: activityHistoryPageSize,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setPagination(result.pagination)
          setActivities(result.activities)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setActivities([])
          setPagination(null)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải lịch sử hoạt động")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadActivities()

    return () => abortController.abort()
  }, [dateRange.endDate, dateRange.startDate, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card p-0 text-petcenter-text shadow-modal ring-0 sm:max-w-[920px]"
      >
        <DialogHeader className="border-b border-petcenter-border px-6 py-4">
          <DialogTitle className="heading-sm text-petcenter-text">Lịch sử hoạt động</DialogTitle>
          <DialogDescription className="body-md mt-1 text-petcenter-text-secondary">
            Hoạt động gần đây trong khoảng {formatDateRangeLabel(dateRange.startDate, dateRange.endDate)}.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[min(620px,calc(100vh-13rem))] overflow-y-auto bg-petcenter-background/45 px-5 py-5 sm:px-6">
          {isLoading ? (
            <p className="body-md text-petcenter-text-secondary">Đang tải lịch sử hoạt động...</p>
          ) : errorMessage ? (
            <div className="rounded-control border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
              <p className="body-md font-semibold">Không thể tải lịch sử</p>
              <p className="body-sm mt-1">{errorMessage}</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {adminActivityFilterOptions.map((option) => {
                  const isActive = activeCategory === option.value

                  return (
                    <button
                      className={cn(
                        "label-md rounded-pill border px-3 py-1.5 font-semibold transition-colors",
                        isActive
                          ? "border-petcenter-primary bg-petcenter-primary text-white"
                          : "border-petcenter-border-strong bg-white text-petcenter-text-secondary hover:border-petcenter-primary/40 hover:text-petcenter-primary"
                      )}
                      key={option.value}
                      onClick={() => setActiveCategory(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              {groupedActivities.length > 0 ? (
                <div className="space-y-5">
                  {groupedActivities.map((group) => (
                    <section className="space-y-2" key={group.label}>
                      <h3 className="label-sm uppercase text-petcenter-text-muted">{group.label}</h3>
                      <div className="overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card">
                        {group.activities.map((activity) => (
                          <AdminActivityHistoryItem activity={activity} key={activity.activityLogId} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-control border border-dashed border-petcenter-border-strong bg-white px-6 py-8 text-center">
                  <p className="body-md font-semibold text-petcenter-text">Không có hoạt động thuộc loại này</p>
                  <p className="body-sm mt-1 text-petcenter-text-secondary">Chọn loại khác để xem thêm lịch sử.</p>
                </div>
              )}

              <ActivityHistoryLoadMore
                hasMore={hasMoreActivities}
                isLoading={isLoadingMore}
                onLoadMore={() => {
                  if (!pagination || isLoadingMore) return

                  void loadActivityPage(pagination.page + 1)
                }}
                total={pagination?.total ?? activities.length}
                visible={activities.length}
              />
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-control border border-dashed border-petcenter-border-strong bg-petcenter-filter px-6 py-10 text-center">
              <p className="title-md text-petcenter-text">Chưa có lịch sử hoạt động</p>
              <p className="body-md mt-1 text-petcenter-text-secondary">
                Khi có hoạt động trong khoảng thời gian này, danh sách sẽ hiển thị tại đây.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 rounded-none border-t border-petcenter-border bg-petcenter-filter px-6 py-4">
          <DialogClose asChild>
            <Button
              className="h-10 rounded-control border-petcenter-border-strong bg-petcenter-card px-8 text-petcenter-text hover:bg-petcenter-sidebar"
              type="button"
              variant="outline"
            >
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminActivityHistoryItem({ activity }: { activity: AdminDashboardRecentActivity }) {
  const meta = getAdminActivityCategoryMeta(activity.category)
  const Icon = meta.icon

  return (
    <article className="border-b border-petcenter-border px-4 py-3 last:border-b-0">
      <div className="flex gap-3">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="body-md font-semibold text-petcenter-text">{activity.action}</h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="label-md text-petcenter-text-secondary">{activity.customerName}</span>
                {activity.petName ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-petcenter-text-muted" />
                    <span className="label-md text-petcenter-text-secondary">{activity.petName}</span>
                  </>
                ) : null}
                <span className="h-1 w-1 rounded-full bg-petcenter-text-muted" />
                <span className="label-md text-petcenter-text-secondary">{meta.label}</span>
                <span className="h-1 w-1 rounded-full bg-petcenter-text-muted" />
                <span className="label-md text-petcenter-text-secondary">{formatTime(activity.occurredAt)}</span>
              </div>
              <p className="label-sm mt-2 font-semibold text-petcenter-primary">{activity.code}</p>
            </div>

            <div className="shrink-0">
              <span className={`label-sm rounded-full px-2.5 py-1 font-bold uppercase ${getRecentActivityStatusClassName(activity)}`}>
                {getRecentActivityStatusLabel(activity)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function ActivityHistoryLoadMore({
  hasMore,
  isLoading,
  onLoadMore,
  total,
  visible,
}: {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  total: number
  visible: number
}) {
  if (hasMore) {
    return (
      <div className="flex flex-col items-center gap-2 pt-1">
        <Button
          className="h-10 rounded-control border-petcenter-border-strong bg-white px-6 text-petcenter-primary hover:bg-petcenter-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          onClick={onLoadMore}
          type="button"
          variant="outline"
        >
          {isLoading ? "Đang tải..." : "Tải thêm"}
        </Button>
        <p className="label-sm text-petcenter-text-secondary">
          {"Đang hiển thị"} {visible}/{total} {"hoạt động"}
        </p>
      </div>
    )
  }

  return (
    <p className="label-sm text-center text-petcenter-text-secondary">
      {"Đã hiển thị tất cả"} {total} {"hoạt động"}
    </p>
  )
}

function buildStatCards(dashboard: AdminDashboardOverview): AdminStatCard[] {
  const values: Record<AdminStatKey, string> = {
    totalUsers: new Intl.NumberFormat("vi-VN").format(dashboard.stats.totalUsers),
    totalPets: new Intl.NumberFormat("vi-VN").format(dashboard.stats.totalPets),
    medicalAppointments: new Intl.NumberFormat("vi-VN").format(dashboard.stats.medicalAppointments),
    boardingOccupancy: `${dashboard.stats.currentBoardingPets}/${dashboard.stats.totalBoardingCapacity}`,
    monthlyRevenue: formatCompactCurrency(dashboard.stats.monthlyRevenue),
    pendingInvoices: new Intl.NumberFormat("vi-VN").format(dashboard.stats.pendingInvoices),
    medicineRevenue: formatCompactCurrency(dashboard.stats.medicineRevenue),
    bookingRate: `${dashboard.stats.bookingRate}%`,
  }
  const trends: Partial<Record<AdminStatKey, number | null>> = {
    totalUsers: dashboard.trends.totalUsers,
    totalPets: dashboard.trends.totalPets,
    monthlyRevenue: dashboard.trends.monthlyRevenue,
    bookingRate: dashboard.trends.bookingRate,
  }
  const statKeys: AdminStatKey[] = [
    "totalUsers",
    "totalPets",
    "medicalAppointments",
    "boardingOccupancy",
    "monthlyRevenue",
    "pendingInvoices",
    "medicineRevenue",
    "bookingRate",
  ]

  return statCardConfig.map((stat, index) => {
    const key = statKeys[index]
    const trend = trends[key]

    return {
      ...stat,
      value: values[key],
      trend: trend === null || trend === undefined ? undefined : `${trend > 0 ? "+" : ""}${trend}%`,
      trendTone: trend !== null && trend !== undefined && trend < 0 ? "danger" : undefined,
      suffix: key === "boardingOccupancy" ? `${dashboard.stats.bookingRate}%` : undefined,
      progressPercentage: key === "boardingOccupancy" ? dashboard.stats.bookingRate : undefined,
    }
  })
}

function buildLoadingStatCards(): AdminStatCard[] {
  return statCardConfig.map((stat) => ({
    ...stat,
    value: "...",
  }))
}

function getAdminActivityCategoryMeta(category: string): { label: string; icon: LucideIcon; className: string } {
  return adminActivityCategoryMeta[category] ?? {
    label: category || "Khác",
    icon: Clock3,
    className: "bg-petcenter-sidebar text-petcenter-text-secondary",
  }
}

function mergeAdminActivities(
  currentActivities: AdminDashboardRecentActivity[],
  nextActivities: AdminDashboardRecentActivity[]
): AdminDashboardRecentActivity[] {
  const existingIds = new Set(currentActivities.map((activity) => activity.activityLogId))
  const uniqueNextActivities = nextActivities.filter((activity) => !existingIds.has(activity.activityLogId))

  return [...currentActivities, ...uniqueNextActivities]
}

function groupAdminActivitiesByDate(
  activities: AdminDashboardRecentActivity[]
): Array<{ label: string; activities: AdminDashboardRecentActivity[] }> {
  const groups = new Map<string, AdminDashboardRecentActivity[]>()

  activities.forEach((activity) => {
    const label = getAdminActivityDateGroupLabel(activity.occurredAt)
    const currentActivities = groups.get(label) ?? []

    currentActivities.push(activity)
    groups.set(label, currentActivities)
  })

  return Array.from(groups.entries()).map(([label, groupedItems]) => ({
    label,
    activities: groupedItems,
  }))
}

function getAdminActivityDateGroupLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Không rõ ngày"

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Hôm nay"
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua"

  return formatDate(value)
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`

  return new Intl.NumberFormat("vi-VN").format(value)
}

function getRecentActivityKey(activity: AdminDashboardRecentActivity): string {
  return activity.activityLogId
}

function getRecentActivityTime(activity: AdminDashboardRecentActivity): React.ReactNode {
  const date = new Date(activity.occurredAt)

  const dateLabel = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
  const timeLabel = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

  return (
    <span className="flex flex-col">
      <span>{timeLabel}</span>
      <span className="label-sm text-petcenter-text-secondary">{dateLabel}</span>
    </span>
  )
}

function getRecentActivityCustomer(activity: AdminDashboardRecentActivity): string {
  return activity.customerName
}

function getRecentActivityPet(activity: AdminDashboardRecentActivity): string {
  return activity.petName ?? ""
}

function getRecentActivityStatusLabel(activity: AdminDashboardRecentActivity): string {
  return normalizeStatusLabel(activity.statusLabel)
}

function getRecentActivityStatusClassName(activity: AdminDashboardRecentActivity): string {
  if (activity.status === "completed" || activity.status === "confirmed") {
    return "bg-petcenter-success-bg text-petcenter-success-text"
  }

  if (activity.status === "failed" || activity.status === "rejected" || activity.status === "cancelled") {
    return "bg-petcenter-danger-bg text-petcenter-danger-text"
  }

  return "bg-petcenter-warning-bg text-petcenter-warning-text"
}

function normalizeStatusLabel(label: string): string {
  const labels: Record<string, string> = {
    "Đã lên lịch": "Đã lên lịch",
    "Da len lich": "Đã lên lịch",
    "Đang chờ": "Đang chờ",
    "Dang cho": "Đang chờ",
    "Đã xác nhận": "Đã xác nhận",
    "Da xac nhan": "Đã xác nhận",
    "Hoàn thành": "Hoàn thành",
    "Hoan thanh": "Hoàn thành",
    "Đã hủy": "Đã hủy",
    "Da huy": "Đã hủy",
    "Từ chối": "Từ chối",
    "Tu choi": "Từ chối",
    "Thất bại": "Thất bại",
    "That bai": "Thất bại",
  }

  return labels[label] ?? label
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

function getAlertKey(alert: AdminDashboardAlert): string {
  return alert.id
}

function getAlertClassName(alert: AdminDashboardAlert): string {
  if (alert.severity === "danger") return "border-red-200 bg-red-50 text-red-700"
  if (alert.severity === "warning") return "border-amber-200 bg-amber-50 text-amber-700"

  return "border-petcenter-border bg-petcenter-filter text-petcenter-text-secondary"
}

function renderAlertIcon(alert: AdminDashboardAlert) {
  if (alert.type === "payment_failed") return <FileWarning className="h-5 w-5" />
  if (alert.type === "boarding_capacity") return <BedDouble className="h-5 w-5" />
  if (alert.type === "medicine_inventory") return <Pill className="h-5 w-5" />

  return <Clock3 className="h-5 w-5" />
}

function DateRangePicker({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: { startDate: string; endDate: string }) => void
  value: { startDate: string; endDate: string }
}) {
  const applyPreset = (preset: DateRangePreset) => {
    if (preset === "today") {
      const today = formatDateInputValue(new Date())
      onChange({ startDate: today, endDate: today })
      return
    }

    if (preset === "last7Days") {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 6)
      onChange({
        startDate: formatDateInputValue(startDate),
        endDate: formatDateInputValue(endDate),
      })
      return
    }

    onChange(getLast30DaysRange())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="label-md inline-flex h-10 w-fit max-w-full items-center gap-2 rounded-control border border-petcenter-border-strong bg-white px-4 font-semibold text-petcenter-text-secondary shadow-card transition-colors hover:bg-petcenter-sidebar"
          type="button"
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="z-50 w-[320px] rounded-card border-petcenter-border bg-white p-4 shadow-modal">
        <div className="space-y-4">
          <div>
            <h3 className="title-md text-petcenter-text">{"Chọn khoảng thời gian"}</h3>
            <p className="body-sm mt-1 text-petcenter-text-secondary">
              {"Dùng để xem số liệu dashboard theo giai đoạn."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button className="label-md rounded-control border border-petcenter-border bg-petcenter-filter px-2 py-2 text-petcenter-text-secondary hover:border-petcenter-primary hover:text-petcenter-primary" onClick={() => applyPreset("today")} type="button">
              {"Hôm nay"}
            </button>
            <button className="label-md rounded-control border border-petcenter-border bg-petcenter-filter px-2 py-2 text-petcenter-text-secondary hover:border-petcenter-primary hover:text-petcenter-primary" onClick={() => applyPreset("last7Days")} type="button">
              {"7 ngày"}
            </button>
            <button className="label-md rounded-control border border-petcenter-border bg-petcenter-filter px-2 py-2 text-petcenter-text-secondary hover:border-petcenter-primary hover:text-petcenter-primary" onClick={() => applyPreset("last30Days")} type="button">
              {"30 ngày"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="label-md text-petcenter-text-secondary">{"Từ ngày"}</span>
              <input
                className="h-10 w-full rounded-control border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary"
                max={value.endDate}
                onChange={(event) => onChange({ ...value, startDate: event.target.value })}
                type="date"
                value={value.startDate}
              />
            </label>
            <label className="space-y-1">
              <span className="label-md text-petcenter-text-secondary">{"Đến ngày"}</span>
              <input
                className="h-10 w-full rounded-control border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary"
                min={value.startDate}
                onChange={(event) => onChange({ ...value, endDate: event.target.value })}
                type="date"
                value={value.endDate}
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RevenueTrendPanel({ data }: { data?: AdminDashboardRevenuePoint[] }) {
  const [activePoint, setActivePoint] = React.useState<(AdminDashboardRevenuePoint & { x: number; y: number }) | null>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null)
  const maxRevenue = Math.max(...(data?.map((item) => item.revenue) ?? [0]), 0)
  const chartWidth = 420
  const chartHeight = 140
  const points =
    data?.map((item, index, items) => {
      const x = items.length <= 1 ? chartWidth / 2 : (index / (items.length - 1)) * chartWidth
      const y = maxRevenue > 0 ? chartHeight - (item.revenue / maxRevenue) * (chartHeight - 16) - 8 : chartHeight - 8

      return { ...item, x, y }
    }) ?? []
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
      : ""

  return (
    <section className="flex h-64 flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card">
      <h2 className="title-md text-petcenter-text">{"Xu hướng doanh thu"}</h2>
      <div
        className="relative mt-4 flex flex-1 flex-col overflow-visible rounded-control border border-petcenter-border bg-petcenter-filter px-4 py-4"
        data-chart-tooltip-root
      >
        {points.length > 0 ? (
          <>
            <svg className="h-full min-h-0 w-full flex-1" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <defs>
                <linearGradient id="admin-revenue-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00796b" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00796b" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#admin-revenue-area)" />
              <path d={linePath} fill="none" stroke="#00796b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" vectorEffect="non-scaling-stroke" />
              {points.map((point) => (
                <g key={point.label}>
                  <circle
                    className="cursor-pointer"
                    cx={point.x}
                    cy={point.y}
                    fill="#ffffff"
                    onMouseEnter={(event) => {
                      setActivePoint(point)
                      setTooltipPosition(getLocalMousePosition(event))
                    }}
                    onMouseLeave={() => {
                      setActivePoint(null)
                      setTooltipPosition(null)
                    }}
                    onMouseMove={(event) => setTooltipPosition(getLocalMousePosition(event))}
                    r="5"
                    stroke="#00796b"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    className="cursor-pointer opacity-0"
                    cx={point.x}
                    cy={point.y}
                    fill="#00796b"
                    onMouseEnter={(event) => {
                      setActivePoint(point)
                      setTooltipPosition(getLocalMousePosition(event))
                    }}
                    onMouseLeave={() => {
                      setActivePoint(null)
                      setTooltipPosition(null)
                    }}
                    onMouseMove={(event) => setTooltipPosition(getLocalMousePosition(event))}
                    r="18"
                  />
                </g>
              ))}
            </svg>
            {activePoint && tooltipPosition ? (
              <ChartTooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                <p className="label-md font-semibold text-petcenter-text">{"Tháng"} {activePoint.label}</p>
                <p className="body-sm mt-1 text-petcenter-primary">{formatCurrency(activePoint.revenue)}</p>
              </ChartTooltip>
            ) : null}
            <div className="mt-2 grid grid-cols-6 gap-1">
              {points.map((point) => (
                <div className="min-w-0 text-center" key={point.label}>
                  <p className="label-sm truncate text-petcenter-text-muted">{point.label}</p>
                  <p className="label-sm truncate text-petcenter-text">{formatCompactCurrency(point.revenue)}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="label-md text-petcenter-text-secondary">{"Chưa có dữ liệu doanh thu"}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function ServiceRevenuePanel({ data }: { data?: AdminDashboardServiceRevenue[] }) {
  const rows = data ?? []
  const [activeSegment, setActiveSegment] = React.useState<AdminDashboardServiceRevenue | null>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null)

  return (
    <section className="flex h-64 flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card">
      <h2 className="title-md text-petcenter-text">{"Doanh thu theo dịch vụ"}</h2>
      <div className="mt-4 flex flex-1 items-center justify-center gap-6">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center" data-chart-tooltip-root>
          {rows.length > 0 ? (
            <DonutChart
              data={rows}
              onHover={(item, event) => {
                setActiveSegment(item)
                setTooltipPosition(item && event ? getLocalMousePosition(event) : null)
              }}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-petcenter-sidebar">
              <ChartNoAxesCombined className="h-6 w-6 text-petcenter-primary" />
            </div>
          )}
          {activeSegment ? (
            <ChartTooltip x={tooltipPosition?.x ?? 64} y={tooltipPosition?.y ?? 64}>
              <p className="label-md font-semibold text-petcenter-text">{normalizeServiceLabel(activeSegment.label)}</p>
              <p className="body-sm mt-1 text-petcenter-primary">{formatCurrency(activeSegment.revenue)}</p>
            </ChartTooltip>
          ) : null}
        </div>
        <div className="space-y-2">
          {rows.length > 0 ? rows.map((item) => (
            <Legend
              color={getServiceColor(item.category)}
              key={item.category}
              label={normalizeServiceLabel(item.label)}
              onMouseEnter={() => setActiveSegment(item)}
              onMouseLeave={() => setActiveSegment(null)}
              value={`${item.percentage}%`}
            />
          )) : (
            <p className="body-sm max-w-[160px] text-petcenter-text-secondary">{"Chưa có doanh thu theo dịch vụ"}</p>
          )}
        </div>
      </div>
    </section>
  )
}

function OperationsSnapshotPanel({ dashboard }: { dashboard: AdminDashboardOverview | null }) {
  const items = dashboard
    ? [
        {
          label: "Lịch khám",
          value: dashboard.stats.medicalAppointments,
          max: Math.max(dashboard.stats.medicalAppointments, dashboard.stats.pendingInvoices, dashboard.stats.currentBoardingPets, 1),
          color: "bg-petcenter-primary",
        },
        {
          label: "Hóa đơn chờ",
          value: dashboard.stats.pendingInvoices,
          max: Math.max(dashboard.stats.medicalAppointments, dashboard.stats.pendingInvoices, dashboard.stats.currentBoardingPets, 1),
          color: "bg-petcenter-cta",
        },
        {
          label: "Lưu trú",
          value: dashboard.stats.currentBoardingPets,
          max: Math.max(dashboard.stats.medicalAppointments, dashboard.stats.pendingInvoices, dashboard.stats.currentBoardingPets, 1),
          color: "bg-sky-700",
        },
      ]
    : []

  return (
    <section className="flex h-64 flex-col rounded-card border border-petcenter-border bg-white p-5 shadow-card">
      <h2 className="title-md text-petcenter-text">{"Tải vận hành"}</h2>
      <div className="mt-5 flex flex-1 flex-col justify-center gap-4">
        {items.length > 0 ? items.map((item) => (
          <div className="space-y-2" key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <span className="body-sm font-medium text-petcenter-text-secondary">{item.label}</span>
              <span className="title-md text-petcenter-text">{new Intl.NumberFormat("vi-VN").format(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-petcenter-sidebar">
              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max((item.value / item.max) * 100, item.value > 0 ? 8 : 0)}%` }} />
            </div>
          </div>
        )) : (
          <div className="flex flex-1 items-center justify-center rounded-control border border-dashed border-petcenter-border-strong bg-petcenter-filter">
            <span className="label-md text-petcenter-text-secondary">{"Chưa có dữ liệu vận hành"}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function getServiceColor(category: AdminDashboardServiceRevenue["category"]): string {
  const colors: Record<AdminDashboardServiceRevenue["category"], string> = {
    medical: "bg-petcenter-primary",
    grooming: "bg-petcenter-cta",
    boarding: "bg-sky-700",
    medicine: "bg-gray-400",
    other: "bg-petcenter-text-muted",
  }

  return colors[category]
}

function normalizeServiceLabel(label: string): string {
  const labels: Record<string, string> = {
    "Kham benh": "Khám bệnh",
    Khac: "Khác",
  }

  return labels[label] ?? label
}

function DonutChart({
  data,
  onHover,
}: {
  data: AdminDashboardServiceRevenue[]
  onHover: (item: AdminDashboardServiceRevenue | null, event?: React.MouseEvent<SVGElement>) => void
}) {
  const radius = 46
  const strokeWidth = 16
  const center = 64
  const segments = data.reduce<Array<{ item: AdminDashboardServiceRevenue; startAngle: number; endAngle: number }>>(
    (result, item) => {
      const startAngle = result.length > 0 ? result[result.length - 1].endAngle : -90
      const endAngle = startAngle + (item.percentage / 100) * 360

      result.push({ item, startAngle, endAngle })

      return result
    },
    []
  )

  return (
    <svg className="h-32 w-32" viewBox="0 0 128 128">
      <circle cx={center} cy={center} fill="none" r={radius} stroke="#eef0e6" strokeWidth={strokeWidth} />
      {segments.map(({ endAngle, item, startAngle }) => {
        if (item.percentage >= 99.999) {
          return (
            <circle
              cx={center}
              cy={center}
              fill="none"
              key={item.category}
              onMouseEnter={(event) => onHover(item, event)}
              onMouseLeave={() => onHover(null)}
              onMouseMove={(event) => onHover(item, event)}
              r={radius}
              stroke={getServiceHexColor(item.category)}
              strokeWidth={strokeWidth}
            />
          )
        }

        return (
          <path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            key={item.category}
            onMouseEnter={(event) => onHover(item, event)}
            onMouseLeave={() => onHover(null)}
            onMouseMove={(event) => onHover(item, event)}
            stroke={getServiceHexColor(item.category)}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
        )
      })}
      <circle cx={center} cy={center} fill="#ffffff" r="30" />
      <ChartNoAxesCombined className="text-petcenter-primary" height="24" width="24" x="52" y="52" />
    </svg>
  )
}

function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function getServiceHexColor(category: AdminDashboardServiceRevenue["category"]): string {
  const colors: Record<AdminDashboardServiceRevenue["category"], string> = {
    medical: "#00796b",
    grooming: "#f59e0b",
    boarding: "#0369a1",
    medicine: "#9ca3af",
    other: "#7a837f",
  }

  return colors[category]
}

function Legend({
  color,
  label,
  onMouseEnter,
  onMouseLeave,
  value,
}: {
  color: string
  label: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  value: string
}) {
  return (
    <div
      className="label-md flex items-center gap-2 text-petcenter-text-secondary"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      <span>{label}</span>
      <span className="font-semibold text-petcenter-text">{value}</span>
    </div>
  )
}

function ChartTooltip({
  children,
  x,
  y,
}: {
  children: React.ReactNode
  x: number
  y: number
}) {
  const shouldFlipHorizontal = x > 260
  const shouldMoveDown = y < 48

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-36 rounded-control border border-petcenter-border bg-white px-3 py-2 text-left shadow-modal"
      style={{
        left: x,
        top: y,
        transform: `translate(${shouldFlipHorizontal ? "calc(-100% - 12px)" : "12px"}, ${shouldMoveDown ? "12px" : "-50%"})`,
      }}
    >
      {children}
    </div>
  )
}

function getLocalMousePosition(event: React.MouseEvent<Element>): { x: number; y: number } {
  const rect = event.currentTarget.getBoundingClientRect()
  const root = event.currentTarget.closest("[data-chart-tooltip-root]")
  const parentRect = root?.getBoundingClientRect() ?? rect

  return {
    x: event.clientX - parentRect.left,
    y: event.clientY - parentRect.top,
  }
}

function getLast30DaysRange(): { startDate: string; endDate: string } {
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(today.getDate() - 29)

  return {
    startDate: formatDateInputValue(startDate),
    endDate: formatDateInputValue(today),
  }
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDateRangeLabel(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "Chọn khoảng thời gian"

  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}
