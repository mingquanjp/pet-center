"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  LoaderCircle,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  PawPrint,
  Phone,
  Pencil,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/ui/loading-state"
import { normalizeSearchText } from "@/lib/search"
import { cn } from "@/lib/utils"
import { adminUsersApi } from "../../api/admin-users.api"
import { useAdminUsers } from "../../hooks/useAdminUsers"
import type {
  AdminUser,
  AdminUserActivity,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserPagination,
  AdminUserPet,
  AdminUserRole,
  AdminUserStats,
  AdminUserStatus,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "../../types/admin-user.types"

const defaultFilters: AdminUserFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  page: 1,
  limit: 5,
}

const initialCreateForm: CreateAdminUserInput = {
  fullName: "",
  email: "",
  phoneNumber: "",
  address: "",
  password: "12345678",
  role: "Staff",
  accountStatus: "active",
}

function parseFiltersFromParams(params: URLSearchParams): AdminUserFilters {
  return {
    search: params.get("search") || "",
    role: (params.get("role") as AdminUserFilters["role"]) || "ALL",
    status: (params.get("status") as AdminUserFilters["status"]) || "ALL",
    page: Number(params.get("page")) || 1,
    limit: defaultFilters.limit,
  }
}

export function AdminUsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const filters = React.useMemo(() => parseFiltersFromParams(searchParams), [searchParams])
  const { data, stats, pagination, isLoading, isInitialLoading, isError, refetch } = useAdminUsers(filters)
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null)
  const [userDetail, setUserDetail] = React.useState<AdminUserDetail | null>(null)
  const [detailActivities, setDetailActivities] = React.useState<AdminUserActivity[]>([])
  const [detailActivitiesPagination, setDetailActivitiesPagination] = React.useState<AdminUserDetail["activitiesPagination"] | null>(null)
  const [isDetailLoading, setIsDetailLoading] = React.useState(false)
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = React.useState(false)
  const [detailError, setDetailError] = React.useState<string | null>(null)
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<AdminUser | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [statusActionUserId, setStatusActionUserId] = React.useState<string | null>(null)
  const [deleteActionUserId, setDeleteActionUserId] = React.useState<string | null>(null)

  function updateFilters(nextFilters: AdminUserFilters) {
    const params = new URLSearchParams()

    if (nextFilters.search) params.set("search", nextFilters.search)
    if (nextFilters.role !== "ALL") params.set("role", nextFilters.role)
    if (nextFilters.status !== "ALL") params.set("status", nextFilters.status)
    if (nextFilters.page > 1) params.set("page", String(nextFilters.page))

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  function handleFilterChange(nextFilters: AdminUserFilters) {
    updateFilters({ ...nextFilters, page: 1 })
  }

  function handlePageChange(page: number) {
    updateFilters({ ...filters, page })
  }

  async function handleOpenDetails(user: AdminUser) {
    setSelectedUser(user)
    setUserDetail(null)
    setDetailActivities([])
    setDetailActivitiesPagination(null)
    setDetailError(null)
    setIsDetailLoading(true)

    try {
      const detail = await adminUsersApi.getDetail(user.id)
      setUserDetail(detail)
      setDetailActivities(detail.activities)
      setDetailActivitiesPagination(detail.activitiesPagination)
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Không thể tải hồ sơ chi tiết.")
    } finally {
      setIsDetailLoading(false)
    }
  }

  async function handleLoadMoreActivities() {
    if (!selectedUser || !detailActivitiesPagination?.hasMore || isLoadingMoreActivities) return

    try {
      setIsLoadingMoreActivities(true)
      const nextOffset = detailActivities.length
      const response = await adminUsersApi.listActivities(selectedUser.id, {
        limit: detailActivitiesPagination.limit,
        offset: nextOffset,
      })

      setDetailActivities((currentActivities) => [...currentActivities, ...response.data])
      setDetailActivitiesPagination(response.pagination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải thêm lịch sử hoạt động.")
    } finally {
      setIsLoadingMoreActivities(false)
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    const nextStatus: AdminUserStatus = user.status === "locked" ? "active" : "locked"

    try {
      setStatusActionUserId(user.id)
      await adminUsersApi.update(user.id, { accountStatus: nextStatus })
      toast.success(nextStatus === "active" ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.")
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái tài khoản.")
    } finally {
      setStatusActionUserId(null)
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    try {
      setDeleteActionUserId(user.id)
      await adminUsersApi.delete(user.id)
      toast.success("Đã xóa người dùng.")
      setDeletingUser(null)
      if (selectedUser?.id === user.id) {
        setSelectedUser(null)
        setUserDetail(null)
        setDetailActivities([])
        setDetailActivitiesPagination(null)
      }
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa người dùng.")
    } finally {
      setDeleteActionUserId(null)
    }
  }

  async function handleRestoreUser(user: AdminUser) {
    try {
      setStatusActionUserId(user.id)
      await adminUsersApi.update(user.id, { accountStatus: "active" })
      toast.success("Đã mở lại tài khoản.")
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mở lại tài khoản.")
    } finally {
      setStatusActionUserId(null)
    }
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

          <Button
            className="h-9 gap-2 rounded-[0.75rem] bg-petcenter-primary px-4 text-white shadow-sm transition-all hover:bg-petcenter-primary-hover active:scale-95"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>

        <UserStats stats={stats} />

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
          <UserFilterBar
            filters={filters}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
            onChange={handleFilterChange}
          />

          <div className={cn("relative flex-1", isLoading && !isInitialLoading && "opacity-50")}>
            {isInitialLoading ? (
              <div className="py-10">
                <LoadingState
                  description="Vui lòng đợi trong khi hệ thống tải danh sách tài khoản."
                  title="Đang tải người dùng..."
                />
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
                deleteActionUserId={deleteActionUserId}
                statusActionUserId={statusActionUserId}
                users={data}
                onDelete={setDeletingUser}
                onEdit={setEditingUser}
                onOpenDetails={(user) => {
                  void handleOpenDetails(user)
                }}
                onPageChange={handlePageChange}
                onRestore={(user) => {
                  void handleRestoreUser(user)
                }}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        </div>
      </div>

      <UserDetailDrawer
        errorMessage={detailError}
        fallbackUser={selectedUser}
        isLoading={isDetailLoading}
        detail={userDetail}
        activities={detailActivities}
        activitiesPagination={detailActivitiesPagination}
        isLoadingMoreActivities={isLoadingMoreActivities}
        onClose={() => {
          setSelectedUser(null)
          setUserDetail(null)
          setDetailActivities([])
          setDetailActivitiesPagination(null)
          setDetailError(null)
        }}
        onLoadMoreActivities={() => {
          void handleLoadMoreActivities()
        }}
        onRetry={() => {
          if (selectedUser) void handleOpenDetails(selectedUser)
        }}
      />
      <EditUserDialog
        open={Boolean(editingUser)}
        user={editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
        onUpdated={() => {
          void refetch()
        }}
      />
      <CreateUserDialog
        open={isCreateDialogOpen}
        onCreated={() => {
          void refetch()
        }}
        onOpenChange={setIsCreateDialogOpen}
      />
      <DeleteUserDialog
        isDeleting={deleteActionUserId === deletingUser?.id}
        open={Boolean(deletingUser)}
        user={deletingUser}
        onConfirm={(user) => {
          void handleDeleteUser(user)
        }}
        onOpenChange={(open) => {
          if (!open && !deleteActionUserId) setDeletingUser(null)
        }}
      />
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
  isInitialLoading,
  isLoading,
  onChange,
}: {
  filters: AdminUserFilters
  isInitialLoading: boolean
  isLoading: boolean
  onChange: (filters: AdminUserFilters) => void
}) {
  const [searchValue, setSearchValue] = React.useState(filters.search)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(filters.search)
  const isRefreshingResults = !isInitialLoading && (isLoading || isSearchSettling)

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
          {isRefreshingResults ? (
            <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-petcenter-primary" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          )}
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
      </div>
      <div
        className={cn(
          "mt-3 h-0.5 overflow-hidden rounded-full bg-petcenter-border transition-opacity duration-200",
          isRefreshingResults ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-1/3 animate-[search-progress_1.1s_ease-in-out_infinite] rounded-full bg-petcenter-primary" />
      </div>
    </div>
  )
}

function UserTable({
  deleteActionUserId,
  onDelete,
  onEdit,
  onOpenDetails,
  onPageChange,
  onRestore,
  onToggleStatus,
  statusActionUserId,
  users: rows,
  pagination,
}: {
  deleteActionUserId: string | null
  onDelete: (user: AdminUser) => void
  onEdit: (user: AdminUser) => void
  onOpenDetails: (user: AdminUser) => void
  onPageChange: (page: number) => void
  onRestore: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
  statusActionUserId: string | null
  users: AdminUser[]
  pagination: AdminUserPagination
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Users className="h-12 w-12 text-petcenter-text-secondary" />
        <p className="font-medium text-petcenter-text-secondary">Không tìm thấy người dùng phù hợp</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start overflow-hidden">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-220 table-fixed border-collapse text-left">
          <thead className="border-b border-petcenter-border bg-petcenter-background">
            <tr>
              <th className="w-[19%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Người dùng</th>
              <th className="w-[25%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Email</th>
              <th className="w-[13%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Số điện thoại</th>
              <th className="w-[12%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Vai trò</th>
              <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
              <th className="w-[9%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Ngày tạo</th>
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
                <td className="px-6 py-4 text-petcenter-text">
                  <span className="block max-w-full break-all text-sm leading-5" title={user.email}>
                    {user.email}
                  </span>
                </td>
                <td className="px-6 py-4 text-petcenter-text">{user.phone ?? "Chưa cập nhật"}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 text-petcenter-text-secondary">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <ActionIconButton label="Xem hồ sơ" onClick={() => onOpenDetails(user)} tone="view">
                      <Eye className="h-4 w-4" />
                    </ActionIconButton>
                    <ActionIconButton label="Chỉnh sửa" onClick={() => onEdit(user)} tone="edit">
                      <Pencil className="h-4 w-4" />
                    </ActionIconButton>
                    {user.status === "inactive" ? null : user.status === "locked" ? (
                      <ActionIconButton
                        disabled={statusActionUserId === user.id}
                        label="Mở khóa"
                        onClick={() => onToggleStatus(user)}
                        tone="unlock"
                      >
                        {statusActionUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />}
                      </ActionIconButton>
                    ) : (
                      <ActionIconButton
                        disabled={statusActionUserId === user.id}
                        label="Khóa tài khoản"
                        onClick={() => onToggleStatus(user)}
                        tone="lock"
                      >
                        {statusActionUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      </ActionIconButton>
                    )}
                    {user.status === "inactive" ? (
                      <ActionIconButton
                        disabled={statusActionUserId === user.id}
                        label="Mở lại tài khoản"
                        onClick={() => onRestore(user)}
                        tone="unlock"
                      >
                        {statusActionUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />}
                      </ActionIconButton>
                    ) : (
                      <ActionIconButton
                        disabled={deleteActionUserId === user.id}
                        label="Xóa người dùng"
                        onClick={() => onDelete(user)}
                        tone="delete"
                      >
                        {deleteActionUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </ActionIconButton>
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
          -<span className="font-medium text-petcenter-text">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span>{" "}
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

function CreateUserDialog({
  onCreated,
  onOpenChange,
  open,
}: {
  onCreated: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [form, setForm] = React.useState<CreateAdminUserInput>(initialCreateForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function updateField<T extends keyof CreateAdminUserInput>(field: T, value: CreateAdminUserInput[T]) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function resetForm() {
    setForm(initialCreateForm)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload: CreateAdminUserInput = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber?.trim() || undefined,
      address: form.address?.trim() || undefined,
      password: form.password.trim(),
    }

    if (!payload.fullName || !payload.email || !payload.password) {
      toast.error("Vui lòng nhập họ tên, email và mật khẩu tạm thời.")
      return
    }

    if (payload.password.length < 8) {
      toast.error("Mật khẩu tạm thời phải có ít nhất 8 ký tự.")
      return
    }

    try {
      setIsSubmitting(true)
      await adminUsersApi.create(payload)
      toast.success("Đã tạo người dùng mới.")
      resetForm()
      onOpenChange(false)
      onCreated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo người dùng.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-petcenter-border bg-white p-0 text-petcenter-text shadow-[0_18px_48px_rgba(31,38,31,0.14)] outline-none ring-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-background px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-petcenter-primary/10 text-petcenter-primary">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="title-md text-petcenter-text">Thêm người dùng</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                Tạo tài khoản cho chủ nuôi, nhân viên, bác sĩ hoặc quản trị viên.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(560px,calc(100vh-12rem))] overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <FormField label="Họ và tên" required>
                <Input
                  autoFocus
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={form.fullName}
                />
              </FormField>

              <FormField label="Email" required>
                <Input
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  inputMode="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="user@example.com"
                  type="email"
                  value={form.email}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Số điện thoại">
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    inputMode="tel"
                    onChange={(event) => updateField("phoneNumber", event.target.value)}
                    placeholder="0901 234 567"
                    value={form.phoneNumber}
                  />
                </FormField>

                <FormField label="Vai trò" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => updateField("role", event.target.value as AdminUserRole)}
                    value={form.role}
                  >
                    <option value="Staff">Nhân viên</option>
                    <option value="Doctor">Bác sĩ</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Trạng thái" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => updateField("accountStatus", event.target.value as AdminUserStatus)}
                    value={form.accountStatus}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="locked">Tạm khóa</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </FormField>

                <FormField label="Mật khẩu tạm thời" required>
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    onChange={(event) => updateField("password", event.target.value)}
                    type="text"
                    value={form.password}
                  />
                </FormField>
              </div>

              <FormField label="Địa chỉ liên hệ">
                <Input
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="123 Đường ABC, Quận X, TP.HCM"
                  value={form.address}
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="m-0 gap-3 border-t border-petcenter-border bg-petcenter-background px-6 py-5 sm:justify-end">
            <Button
              className="h-10 rounded-[0.75rem] border-petcenter-border bg-white px-5 text-petcenter-text hover:bg-petcenter-sidebar"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy bỏ
            </Button>
            <Button
              className="h-10 rounded-[0.75rem] bg-petcenter-primary px-5 font-semibold text-white hover:bg-petcenter-primary-hover"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Tạo người dùng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteUserDialog({
  isDeleting,
  onConfirm,
  onOpenChange,
  open,
  user,
}: {
  isDeleting: boolean
  onConfirm: (user: AdminUser) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  user: AdminUser | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl border border-petcenter-border bg-white p-0 text-petcenter-text shadow-[0_18px_48px_rgba(31,38,31,0.14)] outline-none ring-0 sm:max-w-[460px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-background px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-petcenter-danger-bg text-petcenter-danger-text">
              <Trash2 className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="title-md text-petcenter-text">Xóa tài khoản?</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                Tài khoản sẽ được chuyển sang trạng thái không hoạt động.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-[0.75rem] border border-petcenter-border bg-petcenter-background p-4">
            <p className="font-semibold text-petcenter-text">{user?.name ?? "Người dùng"}</p>
            <p className="body-sm mt-1 break-all text-petcenter-text-secondary">{user?.email}</p>
          </div>
          <p className="body-sm text-petcenter-text-secondary">Bạn có chắc chắn muốn xóa tài khoản này không?</p>
        </div>

        <DialogFooter className="m-0 gap-3 border-t border-petcenter-border bg-petcenter-background px-5 py-4 sm:justify-end">
          <Button
            className="h-10 rounded-[0.75rem] border-petcenter-border bg-white px-5 text-petcenter-text hover:bg-petcenter-sidebar"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Hủy bỏ
          </Button>
          <Button
            className="h-10 rounded-[0.75rem] bg-petcenter-danger-text px-5 font-semibold text-white hover:bg-petcenter-danger-text/90"
            disabled={isDeleting || !user}
            onClick={() => {
              if (user) onConfirm(user)
            }}
            type="button"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Xóa tài khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditUserDialog({
  onOpenChange,
  onUpdated,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  open: boolean
  user: AdminUser | null
}) {
  const [form, setForm] = React.useState<UpdateAdminUserInput>({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "Owner",
    accountStatus: "active",
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!user) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      fullName: user.name,
      email: user.email,
      phoneNumber: user.phone ?? "",
      address: user.address ?? "",
      role: user.role,
      accountStatus: user.status,
    })
  }, [user])

  function updateField<T extends keyof UpdateAdminUserInput>(field: T, value: UpdateAdminUserInput[T]) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return

    const payload: UpdateAdminUserInput = {
      fullName: form.fullName?.trim(),
      email: form.email?.trim(),
      phoneNumber: form.phoneNumber?.trim() || null,
      address: form.address?.trim() || null,
      role: form.role,
      accountStatus: form.accountStatus,
    }

    if (!payload.fullName || !payload.email) {
      toast.error("Vui lòng nhập họ tên và email.")
      return
    }

    try {
      setIsSubmitting(true)
      await adminUsersApi.update(user.id, payload)
      toast.success("Đã cập nhật người dùng.")
      onOpenChange(false)
      onUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật người dùng.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-petcenter-border bg-white p-0 text-petcenter-text shadow-[0_18px_48px_rgba(31,38,31,0.14)] outline-none ring-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-background px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-petcenter-primary/10 text-petcenter-primary">
              <Pencil className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="title-md text-petcenter-text">Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                Cập nhật thông tin liên hệ, vai trò và trạng thái tài khoản.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(560px,calc(100vh-12rem))] overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <FormField label="Họ và tên" required>
                <Input
                  autoFocus
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  onChange={(event) => updateField("fullName", event.target.value)}
                  value={form.fullName ?? ""}
                />
              </FormField>

              <FormField label="Email" required>
                <Input
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  inputMode="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  type="email"
                  value={form.email ?? ""}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Số điện thoại">
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    inputMode="tel"
                    onChange={(event) => updateField("phoneNumber", event.target.value)}
                    value={form.phoneNumber ?? ""}
                  />
                </FormField>

                <FormField label="Vai trò" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => updateField("role", event.target.value as AdminUserRole)}
                    value={form.role ?? "Owner"}
                  >
                    <option value="Owner">Chủ nuôi</option>
                    <option value="Staff">Nhân viên</option>
                    <option value="Doctor">Bác sĩ</option>
                    <option value="Admin">Quản trị viên</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Trạng thái" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => updateField("accountStatus", event.target.value as AdminUserStatus)}
                    value={form.accountStatus ?? "active"}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="locked">Tạm khóa</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </FormField>

                <FormField label="Mã tài khoản">
                  <Input className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-petcenter-background" disabled value={user?.id ?? ""} />
                </FormField>
              </div>

              <FormField label="Địa chỉ liên hệ">
                <Input
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  onChange={(event) => updateField("address", event.target.value)}
                  value={form.address ?? ""}
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="m-0 gap-3 border-t border-petcenter-border bg-petcenter-background px-6 py-5 sm:justify-end">
            <Button
              className="h-10 rounded-[0.75rem] border-petcenter-border bg-white px-5 text-petcenter-text hover:bg-petcenter-sidebar"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy bỏ
            </Button>
            <Button
              className="h-10 rounded-[0.75rem] bg-petcenter-primary px-5 font-semibold text-white hover:bg-petcenter-primary-hover"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  children,
  className,
  label,
  required,
}: {
  children: React.ReactNode
  className?: string
  label: string
  required?: boolean
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-semibold text-petcenter-text">
        {label} {required ? <span className="text-petcenter-danger-text">*</span> : null}
      </span>
      {children}
    </label>
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
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium", meta[status].className)}>
      {meta[status].label}
    </span>
  )
}

function ActionIconButton({
  children,
  disabled,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode
  disabled?: boolean
  label: string
  onClick?: () => void
  tone: "view" | "edit" | "lock" | "unlock" | "delete"
}) {
  const toneClassName = {
    view: "text-petcenter-primary hover:bg-petcenter-primary/10",
    edit: "text-petcenter-cta-hover hover:bg-petcenter-warning-bg",
    lock: "text-petcenter-danger-text hover:bg-petcenter-danger-bg",
    unlock: "text-petcenter-success-text hover:bg-petcenter-success-bg",
    delete: "text-petcenter-danger-text hover:bg-petcenter-danger-bg",
  }[tone]

  return (
    <button
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-transparent transition disabled:cursor-not-allowed disabled:opacity-60",
        toneClassName
      )}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function UserDetailDrawer({
  activities,
  activitiesPagination,
  detail,
  errorMessage,
  fallbackUser,
  isLoading,
  isLoadingMoreActivities,
  onClose,
  onLoadMoreActivities,
  onRetry,
}: {
  activities: AdminUserActivity[]
  activitiesPagination: AdminUserDetail["activitiesPagination"] | null
  detail: AdminUserDetail | null
  errorMessage: string | null
  fallbackUser: AdminUser | null
  isLoading: boolean
  isLoadingMoreActivities: boolean
  onClose: () => void
  onLoadMoreActivities: () => void
  onRetry: () => void
}) {
  const isOpen = Boolean(fallbackUser)
  const user = detail?.user ?? fallbackUser

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-petcenter-text/20 transition-opacity", isOpen ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-petcenter-border bg-white shadow-modal transition-transform sm:w-[520px]",
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

            {isLoading ? (
              <div className="rounded-2xl border border-petcenter-border bg-white py-8">
                <LoadingState description="Đang tải thú cưng và lịch sử hoạt động." title="Đang tải hồ sơ..." />
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-petcenter-danger-bg bg-white p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-petcenter-danger-text" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-petcenter-text">Không thể tải hồ sơ chi tiết</p>
                    <p className="body-sm mt-1 text-petcenter-text-secondary">{errorMessage}</p>
                    <Button className="mt-4 h-9 rounded-[0.75rem] border-petcenter-border" onClick={onRetry} variant="outline">
                      Thử lại
                    </Button>
                  </div>
                </div>
              </div>
            ) : detail ? (
              <>
                <UserPetsSection petCount={detail.user.petCount} pets={detail.pets} />
                <UserActivitiesSection
                  activities={activities}
                  hasMore={activitiesPagination?.hasMore ?? false}
                  isLoadingMore={isLoadingMoreActivities}
                  onLoadMore={onLoadMoreActivities}
                  total={activitiesPagination?.total ?? activities.length}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </aside>
    </>
  )
}

function UserPetsSection({ petCount, pets }: { petCount: number; pets: AdminUserPet[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="title-md flex items-center gap-2 text-petcenter-text">
          <PawPrint className="h-5 w-5 text-petcenter-primary" />
          Thú cưng sở hữu ({petCount})
        </h4>
        {petCount > pets.length ? <span className="text-xs font-medium text-petcenter-text-secondary">Hiển thị 4 gần nhất</span> : null}
      </div>
      {pets.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <p className="body-sm rounded-[0.75rem] border border-dashed border-petcenter-border bg-white p-4 text-petcenter-text-secondary">
          Tài khoản này chưa liên kết thú cưng.
        </p>
      )}
    </section>
  )
}

function PetCard({ pet }: { pet: AdminUserPet }) {
  return (
    <article className="min-w-[180px] flex-1 rounded-2xl border border-petcenter-border bg-white p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        {pet.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={pet.name} className="h-11 w-11 shrink-0 rounded-full object-cover" src={pet.profileImageUrl} />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-sm font-bold text-petcenter-primary">
            {getInitials(pet.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-petcenter-text">{pet.name}</p>
          <p className="body-sm mt-0.5 text-petcenter-text-secondary">{pet.breed ?? pet.speciesLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-petcenter-background px-2.5 py-1 text-xs font-medium text-petcenter-text-secondary">{pet.ageLabel}</span>
        <span className="rounded-full bg-petcenter-background px-2.5 py-1 text-xs font-medium text-petcenter-text-secondary">{pet.genderLabel}</span>
      </div>
    </article>
  )
}

function UserActivitiesSection({
  activities,
  hasMore,
  isLoadingMore,
  onLoadMore,
  total,
}: {
  activities: AdminUserActivity[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  total: number
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="title-md flex items-center gap-2 text-petcenter-text">
          <Clock3 className="h-5 w-5 text-petcenter-primary" />
          Lịch sử & hoạt động
        </h4>
        {total > 0 ? (
          <span className="text-xs font-medium text-petcenter-text-secondary">
            {activities.length}/{total}
          </span>
        ) : null}
      </div>
      {activities.length > 0 ? (
        <>
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem activity={activity} key={activity.id} />
            ))}
          </div>
          {hasMore ? (
            <Button
              className="h-10 w-full rounded-[0.75rem] border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-sidebar"
              disabled={isLoadingMore}
              onClick={onLoadMore}
              type="button"
              variant="outline"
            >
              {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4 rotate-90" />}
              Xem thêm lịch sử
            </Button>
          ) : null}
        </>
      ) : (
        <p className="body-sm rounded-[0.75rem] border border-dashed border-petcenter-border bg-white p-4 text-petcenter-text-secondary">
          Chưa có hoạt động visible nào cho tài khoản này.
        </p>
      )}
    </section>
  )
}

function ActivityItem({ activity }: { activity: AdminUserActivity }) {
  return (
    <article className="rounded-2xl border border-petcenter-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-petcenter-primary/10 text-petcenter-primary">
          {getActivityIcon(activity.category)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-petcenter-background px-2.5 py-1 text-xs font-semibold text-petcenter-text-secondary">
              {activity.categoryLabel}
            </span>
            <ActivityStatusBadge status={activity.status} label={activity.statusLabel} />
          </div>
          <p className="mt-2 font-semibold text-petcenter-text">{activity.title}</p>
          <p className="body-sm mt-1 text-petcenter-text-secondary">
            {[activity.petName, activity.actorName ? `Bởi ${activity.actorName}` : null, formatDateTime(activity.occurredAt)]
              .filter(Boolean)
              .join(" • ")}
          </p>
          {activity.summary ? <p className="body-sm mt-2 text-petcenter-text-secondary">{activity.summary}</p> : null}
        </div>
      </div>
    </article>
  )
}

function ActivityStatusBadge({ label, status }: { label: string; status: AdminUserActivity["status"] }) {
  const className =
    status === "completed" || status === "confirmed"
      ? "bg-petcenter-success-bg text-petcenter-success-text"
      : status === "cancelled" || status === "rejected" || status === "failed"
        ? "bg-petcenter-danger-bg text-petcenter-danger-text"
        : "bg-petcenter-warning-bg text-petcenter-warning-text"

  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>
}

function getActivityIcon(category: AdminUserActivity["category"]) {
  const Icon = {
    medical: Stethoscope,
    vaccination: Stethoscope,
    grooming: PawPrint,
    boarding: CalendarDays,
    invoice: Mail,
    payment: Mail,
    profile: Users,
  }[category]

  return <Icon className="h-5 w-5" />
}

function DrawerMeta({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 text-petcenter-text-secondary">
      <Icon className="h-4 w-4" />
      <span className="body-sm">{text}</span>
    </div>
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
