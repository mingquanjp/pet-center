"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Hotel,
  KeyRound,
  Lock,
  LockOpen,
  Mail,
  PawPrint,
  Phone,
  RefreshCw,
  RotateCcw,
  Scissors,
  Search,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import { cn } from "@/lib/utils"
import { useAdminUsers } from "../../hooks/useAdminUsers"
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserPagination,
  AdminUserRole,
  AdminUserStats,
  AdminUserStatus,
} from "../../types/admin-user.types"

const defaultFilters: AdminUserFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  page: 1,
  limit: 10,
}

function parseFiltersFromParams(params: URLSearchParams): AdminUserFilters {
  return {
    search: params.get("search") || "",
    role: (params.get("role") as AdminUserFilters["role"]) || "ALL",
    status: (params.get("status") as AdminUserFilters["status"]) || "ALL",
    page: Number(params.get("page")) || 1,
    limit: 10,
  }
}

export function AdminUsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const filters = React.useMemo(() => parseFiltersFromParams(searchParams), [searchParams])
  const { data, stats, pagination, isLoading, isInitialLoading, isError, refetch } = useAdminUsers(filters)
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null)
  const [filterResetKey, setFilterResetKey] = React.useState(0)

  function updateFilters(nextFilters: AdminUserFilters) {
    const params = new URLSearchParams()

    if (nextFilters.search) params.set("search", nextFilters.search)
    if (nextFilters.role !== "ALL") params.set("role", nextFilters.role)
    if (nextFilters.status !== "ALL") params.set("status", nextFilters.status)
    if (nextFilters.page > 1) params.set("page", String(nextFilters.page))

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  function resetFilters() {
    setFilterResetKey((currentKey) => currentKey + 1)
    updateFilters(defaultFilters)
  }

  function handleFilterChange(nextFilters: AdminUserFilters) {
    updateFilters({ ...nextFilters, page: 1 })
  }

  function handlePageChange(page: number) {
    updateFilters({ ...filters, page })
  }

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="heading-lg tracking-tight text-petcenter-text">Quản lý người dùng</h1>
            <p className="body-md mt-1 text-petcenter-text-secondary">
              Theo dõi tài khoản, phân quyền vai trò và trạng thái truy cập hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="h-9 gap-2 rounded-[0.75rem] border-petcenter-border text-petcenter-text transition-all hover:bg-petcenter-background active:scale-95"
              onClick={() => refetch()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
            <Button className="h-9 gap-2 rounded-[0.75rem] bg-petcenter-primary px-4 text-white shadow-sm transition-all hover:bg-petcenter-primary-hover active:scale-95">
              <UserPlus className="h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        <UserStats stats={stats} />

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
          <UserFilterBar
            filters={filters}
            key={filterResetKey}
            onReset={resetFilters}
            onChange={handleFilterChange}
          />

          <div className={cn("relative flex-1", isLoading && !isInitialLoading && "opacity-50")}>
            {isInitialLoading ? (
              <div className="py-10">
                <LoadingState title="Đang tải người dùng..." description="Vui lòng đợi trong khi hệ thống tải danh sách tài khoản." />
              </div>
            ) : isError && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
                <p className="font-medium text-petcenter-text-secondary">Không thể tải danh sách người dùng</p>
                <Button className="rounded-[0.75rem] border-petcenter-border" onClick={() => refetch()} variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : (
              <UserTable
                pagination={pagination}
                users={data}
                onOpenDetails={setSelectedUser}
                onPageChange={handlePageChange}
                onReset={resetFilters}
              />
            )}
          </div>
        </div>
      </div>

      <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  )
}

function UserStats({ stats }: { stats: AdminUserStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      <StatCard icon={Users} iconClassName="bg-petcenter-info-bg text-petcenter-info-text" label="Tổng tài khoản" value={stats.totalCount} />
      <StatCard icon={PawPrint} iconClassName="bg-petcenter-primary/10 text-petcenter-primary" label="Chủ nuôi" value={stats.ownerCount} />
      <StatCard icon={ShieldCheck} iconClassName="bg-petcenter-sidebar text-petcenter-text-secondary" label="Nhân viên" value={stats.staffCount} />
      <StatCard icon={Stethoscope} iconClassName="bg-petcenter-info-bg text-petcenter-info-text" label="Bác sĩ" value={stats.doctorCount} />
      <StatCard
        icon={AlertCircle}
        iconClassName="bg-petcenter-danger-bg text-petcenter-danger-text"
        label="Cần xử lý"
        value={stats.needsAttentionCount}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  label: string
  value: number
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-petcenter-border bg-petcenter-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", iconClassName)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-petcenter-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-petcenter-text">{value}</p>
      </div>
    </article>
  )
}

function UserFilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: AdminUserFilters
  onChange: (filters: AdminUserFilters) => void
  onReset: () => void
}) {
  const [searchValue, setSearchValue] = React.useState(filters.search)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchValue !== filters.search) {
        onChange({ ...filters, search: searchValue })
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [filters, onChange, searchValue])

  return (
    <div className="w-full border-b border-petcenter-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <input
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm mã tài khoản, tên, email, SĐT..."
            type="text"
            value={searchValue}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Vai trò:</span>
          <select
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            onChange={(event) => onChange({ ...filters, role: event.target.value as "ALL" | AdminUserRole })}
            value={filters.role}
          >
            <option value="ALL">Tất cả</option>
            <option value="Owner">Chủ nuôi</option>
            <option value="Staff">Nhân viên</option>
            <option value="Doctor">Bác sĩ</option>
            <option value="Admin">Quản trị</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">Trạng thái:</span>
          <select
            className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text focus:border-petcenter-primary focus:outline-none focus:ring-1 focus:ring-petcenter-primary"
            onChange={(event) => onChange({ ...filters, status: event.target.value as "ALL" | AdminUserStatus })}
            value={filters.status}
          >
            <option value="ALL">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Tạm khóa</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </label>

        <button
          aria-label="Đặt lại bộ lọc"
          className="body-md flex items-center justify-center gap-2 rounded-[0.75rem] border border-petcenter-border px-4 py-2 font-medium text-petcenter-text-secondary transition-colors hover:bg-petcenter-background hover:text-petcenter-text"
          onClick={onReset}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Đặt lại</span>
        </button>
      </div>
    </div>
  )
}

function UserTable({
  onOpenDetails,
  onPageChange,
  onReset,
  users: rows,
  pagination,
}: {
  onOpenDetails: (user: AdminUser) => void
  onPageChange: (page: number) => void
  onReset: () => void
  users: AdminUser[]
  pagination: AdminUserPagination
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Users className="h-12 w-12 text-petcenter-text-secondary" />
        <p className="font-medium text-petcenter-text-secondary">Không tìm thấy người dùng phù hợp</p>
        <Button className="rounded-[0.75rem] border-petcenter-border" onClick={onReset} variant="outline">
          Đặt lại bộ lọc
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start overflow-hidden">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-200 table-fixed border-collapse text-left">
          <thead className="border-b border-petcenter-border bg-petcenter-background">
            <tr>
              <th className="w-[20%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Người dùng</th>
              <th className="w-[20%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Email</th>
              <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Số điện thoại</th>
              <th className="w-[13%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Vai trò</th>
              <th className="w-[15%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
              <th className="w-[10%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Ngày tạo</th>
              <th className="w-[8%] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petcenter-border">
            {rows.map((user) => (
              <tr className="transition-colors hover:bg-petcenter-background/50" key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar initials={getInitials(user.name)} role={user.role} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-petcenter-text">{user.name}</p>
                      <p className="mt-0.5 text-xs text-petcenter-text-secondary">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="truncate px-6 py-4 text-petcenter-text">{user.email}</td>
                <td className="px-6 py-4 text-petcenter-text">{user.phone}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 text-petcenter-text-secondary">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      className="h-9 rounded-[0.75rem] bg-petcenter-cta px-4 font-semibold text-white shadow-sm transition-all hover:bg-petcenter-cta-hover active:scale-95"
                      onClick={() => onOpenDetails(user)}
                    >
                      Xem
                    </Button>
                    {user.status === "locked" ? (
                      <IconButton label="Mở khóa">
                        <LockOpen className="h-4 w-4" />
                      </IconButton>
                    ) : (
                      <IconButton label="Khóa">
                        <Lock className="h-4 w-4" />
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
        <p className="text-sm text-petcenter-text-secondary">
              Hiển thị{" "}
              <span className="font-medium text-petcenter-text">
                {pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1}
              </span>
              -
              <span className="font-medium text-petcenter-text">
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
              </span>{" "}
              của <span className="font-medium text-petcenter-text">{pagination.total}</span> người dùng
        </p>
        <nav aria-label="Phân trang" className="flex items-center gap-2">
          <button
            aria-label="Trang trước"
            className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.currentPage === 1}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {getPaginationItems(pagination.currentPage, pagination.totalPages).map((page, index) =>
            page === "ellipsis" ? (
              <span
                className="flex h-9 min-w-9 items-center justify-center text-sm font-medium text-petcenter-text-secondary"
                key={`ellipsis-${index}`}
              >
                ...
              </span>
            ) : (
              <button
                aria-current={page === pagination.currentPage ? "page" : undefined}
                className={cn(
                  "h-9 min-w-9 rounded-[0.75rem] px-3 text-sm font-medium transition",
                  page === pagination.currentPage
                    ? "bg-petcenter-primary text-white shadow-sm"
                    : "border border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-background"
                )}
                key={page}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            )
          )}
          <button
            aria-label="Trang sau"
            className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}

function UserAvatar({ initials, role }: { initials: string; role: AdminUserRole }) {
  const colorClass = {
    Admin: "bg-petcenter-warning-bg text-petcenter-warning-text",
    Doctor: "bg-petcenter-info-bg text-petcenter-info-text",
    Staff: "bg-petcenter-sidebar text-petcenter-text-secondary",
    Owner: "bg-petcenter-primary/10 text-petcenter-primary",
  }[role]

  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase", colorClass)}>
      {initials}
    </div>
  )
}

function RoleBadge({ role }: { role: AdminUserRole }) {
  const meta: Record<AdminUserRole, { label: string; className: string }> = {
    Admin: { label: "Quản trị", className: "bg-petcenter-warning-bg text-petcenter-warning-text" },
    Doctor: { label: "Bác sĩ", className: "bg-petcenter-info-bg text-petcenter-info-text" },
    Staff: { label: "Nhân viên", className: "bg-petcenter-sidebar text-petcenter-text-secondary" },
    Owner: { label: "Chủ nuôi", className: "bg-petcenter-primary/10 text-petcenter-primary" },
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", meta[role].className)}>
      {meta[role].label}
    </span>
  )
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const meta: Record<AdminUserStatus, { label: string; className: string }> = {
    active: { label: "Hoạt động", className: "bg-petcenter-success-bg text-petcenter-success-text" },
    locked: { label: "Tạm khóa", className: "bg-petcenter-danger-bg text-petcenter-danger-text" },
    inactive: { label: "Không hoạt động", className: "bg-gray-100 text-gray-600" },
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", meta[status].className)}>
      {meta[status].label}
    </span>
  )
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background hover:text-petcenter-text"
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function UserDetailDrawer({ onClose, user }: { onClose: () => void; user: AdminUser | null }) {
  const isOpen = Boolean(user)

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-petcenter-text/20 transition-opacity", isOpen ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-petcenter-border bg-white shadow-modal transition-transform sm:w-[480px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-petcenter-border bg-petcenter-background px-6 py-4">
          <h2 className="title-md text-petcenter-text">Hồ sơ chi tiết</h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-petcenter-text-secondary transition-colors hover:bg-petcenter-sidebar"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user ? (
          <div className="flex-1 space-y-8 overflow-y-auto bg-petcenter-background p-6">
            <div className="flex items-start gap-5">
              <UserAvatar initials={getInitials(user.name)} role={user.role} />
              <div className="flex-1">
                <h3 className="heading-sm mb-1 font-bold text-petcenter-text">{user.name}</h3>
                <div className="mb-3 flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                </div>
                <div className="space-y-1.5">
                  <DrawerMeta icon={Mail} text={user.email} />
                  <DrawerMeta icon={Phone} text={user.phone ?? "Chưa cập nhật"} />
                  <DrawerMeta icon={CalendarDays} text={`Tạo ngày ${formatDate(user.createdAt)}`} />
                </div>
              </div>
            </div>

            <div className="h-px bg-petcenter-border" />

            <section>
              <h4 className="title-md mb-3 flex items-center gap-2 text-petcenter-text">
                <PawPrint className="h-5 w-5 text-petcenter-primary" />
                Thú cưng sở hữu ({user.petCount})
              </h4>
              {user.petCount > 0 ? (
                <p className="body-sm rounded-[0.75rem] border border-petcenter-border bg-white p-4 text-petcenter-text-secondary">
                  Tài khoản đang liên kết {user.petCount} hồ sơ thú cưng.
                </p>
              ) : (
                <p className="body-sm rounded-[0.75rem] border border-dashed border-petcenter-border bg-white p-4 text-petcenter-text-secondary">
                  Tài khoản này chưa liên kết thú cưng.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="title-md flex items-center gap-2 text-petcenter-text">
                <Bell className="h-5 w-5 text-petcenter-primary" />
                Lịch sử & hoạt động
              </h4>
              <HistoryButton icon={Stethoscope} label="Lịch sử khám bệnh" />
              <HistoryButton icon={Scissors} label="Lịch sử Spa/Grooming" />
              <HistoryButton icon={Hotel} label="Lịch sử lưu trú" />
              <HistoryButton icon={KeyRound} label="Lịch sử bảo mật tài khoản" />
            </section>
          </div>
        ) : null}
      </aside>
    </>
  )
}

function DrawerMeta({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 text-petcenter-text-secondary">
      <Icon className="h-4 w-4" />
      <span className="body-sm">{text}</span>
    </div>
  )
}

function HistoryButton({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-[0.75rem] border border-petcenter-border bg-white px-4 py-3 transition-colors hover:bg-petcenter-sidebar"
      type="button"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-petcenter-primary" />
        <span className="text-sm font-medium text-petcenter-text">{label}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-petcenter-text-secondary" />
    </button>
  )
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) items.add(currentPage - 1)
  if (currentPage < totalPages) items.add(currentPage + 1)
  if (currentPage <= 3) {
    items.add(2)
    items.add(3)
    items.add(4)
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3)
    items.add(totalPages - 2)
    items.add(totalPages - 1)
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1]

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">
    }

    return [item]
  })
}
