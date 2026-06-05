"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  Clock3,
  Eye,
  Layers3,
  LoaderCircle,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  SearchX,
  SlidersHorizontal,
  Stethoscope,
  Tags,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { AppPagination } from "@/components/ui/app-pagination"
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
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { normalizeSearchText } from "@/lib/search"
import { cn } from "@/lib/utils"
import { useAdminServiceCategories } from "../../hooks/useAdminServiceCategories"
import {
  AdminServiceCategory,
  ServiceCategoryFilters,
  ServiceCategoryFormValues,
  ServiceCategoryKind,
  ServiceCategoryStatus,
} from "../../types/service-category.types"

const categoryOptions: Array<{ value: ServiceCategoryKind; label: string; className: string }> = [
  { value: "medical", label: "Khám bệnh", className: "bg-petcenter-info-bg text-petcenter-info-text" },
  { value: "grooming", label: "Spa & Grooming", className: "bg-petcenter-warning-bg text-petcenter-warning-text" },
  { value: "boarding", label: "Lưu trú", className: "bg-[#EEE8FF] text-[#6D4AFF]" },
  { value: "medicine", label: "Thuốc", className: "bg-petcenter-success-bg text-petcenter-success-text" },
  { value: "other", label: "Khác", className: "bg-stone-100 text-petcenter-text-secondary" },
]

const defaultFilters: ServiceCategoryFilters = {
  search: "",
  category: "ALL",
  status: "ALL",
}

const pageSize = 5

export function AdminServiceCategoriesPage() {
  const [filters, setFilters] = useState<ServiceCategoryFilters>(defaultFilters)
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [selectedService, setSelectedService] = useState<AdminServiceCategory | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "detail" | "delete" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchValue, 500)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(debouncedSearch)

  const apiFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch.trim() }),
    [debouncedSearch, filters]
  )

  const {
    services,
    stats,
    pagination,
    isLoading,
    error,
    refetch,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
  } = useAdminServiceCategories(apiFilters, page, pageSize)

  const resetFilters = () => {
    setSearchValue("")
    setFilters(defaultFilters)
    setPage(1)
  }

  const openCreate = () => {
    setSelectedService(null)
    setActionError(null)
    setDialogMode("create")
  }

  const openEdit = (service: AdminServiceCategory) => {
    setSelectedService(service)
    setActionError(null)
    setDialogMode("edit")
  }

  const openDetail = (service: AdminServiceCategory) => {
    setSelectedService(service)
    setDialogMode("detail")
  }

  const openDelete = (service: AdminServiceCategory) => {
    setSelectedService(service)
    setActionError(null)
    setDialogMode("delete")
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedService(null)
    setActionError(null)
  }

  const saveService = async (values: ServiceCategoryFormValues) => {
    setActionError(null)

    try {
      if (dialogMode === "edit" && selectedService) {
        await updateServiceCategory({ id: selectedService.id, ...values })
        toast.success("Đã cập nhật dịch vụ.")
      } else {
        await createServiceCategory(values)
        setPage(1)
        toast.success("Đã tạo dịch vụ mới.")
      }

      closeDialog()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Không thể lưu dịch vụ."
      setActionError(message)
      toast.error(message)
    }
  }

  const deleteService = async () => {
    if (!selectedService) return
    setActionError(null)

    try {
      const result = await deleteServiceCategory(selectedService.id)
      if (result.deactivated) {
        toast.warning("Dịch vụ đã phát sinh dữ liệu nên đã được chuyển sang ngừng hoạt động.")
      } else {
        toast.success("Đã xóa dịch vụ.")
      }
      closeDialog()
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Không thể xóa dịch vụ."
      setActionError(message)
      toast.error(message)
    }
  }

  const showInitialLoading = isLoading && services.length === 0
  const isRefreshingResults = !showInitialLoading && (isLoading || isSearchSettling)

  return (
    <div className="flex-1 space-y-6">
      <PageHeader onCreate={openCreate} />

      <ServiceStats stats={stats} />

      <FilterBar
        filters={filters}
        isRefreshingResults={isRefreshingResults}
        resultCount={services.length}
        searchValue={searchValue}
        shouldShowLoadingText={showInitialLoading}
        totalCount={pagination.total}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        onFiltersChange={(nextFilters) => {
          setFilters((current) => ({ ...current, ...nextFilters }))
          setPage(1)
        }}
        onReset={resetFilters}
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : showInitialLoading ? (
        <LoadingBlock />
      ) : services.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className={cn("transition-opacity duration-200", isRefreshingResults && "opacity-80 pointer-events-none")}>
          <ServiceTable
            services={services}
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            isLoading={isLoading}
            onPageChange={setPage}
            onView={openDetail}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </div>
      )}

      {(dialogMode === "create" || dialogMode === "edit") && (
        <ServiceFormDialog error={actionError} service={selectedService} onClose={closeDialog} onSave={saveService} />
      )}

      {dialogMode === "detail" && selectedService && (
        <ServiceDetailDialog
          service={selectedService}
          onClose={closeDialog}
          onEdit={() => {
            setActionError(null)
            setDialogMode("edit")
          }}
        />
      )}

      {dialogMode === "delete" && selectedService && (
        <ServiceDeleteDialog error={actionError} service={selectedService} onClose={closeDialog} onConfirm={deleteService} />
      )}
    </div>
  )
}

function PageHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="heading-lg text-petcenter-text tracking-tight">Quản lý danh mục dịch vụ</h2>
        <p className="body-md text-petcenter-text-secondary mt-1">
          Quản lý nhóm dịch vụ, thời lượng, giá cơ bản và trạng thái sử dụng trong trung tâm.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white px-5 rounded-[12px] text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-9 self-start md:self-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Thêm dịch vụ</span>
      </button>
    </div>
  )
}

function ServiceStats({
  stats,
}: {
  stats: {
    totalServices: number
    activeServices: number
    inactiveServices: number
    medicalServices: number
    averagePrice: number
  }
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      <StatCard icon={Layers3} iconClassName="bg-petcenter-info-bg text-petcenter-info-text" label="Tổng dịch vụ" value={stats.totalServices} />
      <StatCard icon={Activity} iconClassName="bg-petcenter-success-bg text-petcenter-success-text" label="Đang hoạt động" value={stats.activeServices} />
      <StatCard icon={AlertCircle} iconClassName="bg-petcenter-danger-bg text-petcenter-danger-text" label="Ngừng hoạt động" value={stats.inactiveServices} />
      <StatCard icon={Stethoscope} iconClassName="bg-petcenter-primary/10 text-petcenter-primary" label="Khám & điều trị" value={stats.medicalServices} />
      <StatCard icon={Tags} iconClassName="bg-petcenter-warning-bg text-petcenter-warning-text" label="Giá trung bình" value={formatVnd(stats.averagePrice)} />
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
  value: number | string
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-petcenter-border bg-petcenter-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-petcenter-text-secondary">{label}</p>
        <p className="truncate text-2xl font-bold text-petcenter-text">{value}</p>
      </div>
    </article>
  )
}

function FilterBar({
  filters,
  isRefreshingResults,
  searchValue,
  resultCount,
  shouldShowLoadingText,
  totalCount,
  onSearchChange,
  onFiltersChange,
  onReset,
}: {
  filters: ServiceCategoryFilters
  isRefreshingResults: boolean
  searchValue: string
  resultCount: number
  shouldShowLoadingText: boolean
  totalCount: number
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: Partial<ServiceCategoryFilters>) => void
  onReset: () => void
}) {
  return (
    <div className="rounded-card border border-petcenter-border bg-petcenter-filter p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          {isRefreshingResults ? (
            <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-petcenter-primary" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
          )}
          <input
            className="body-md h-11 w-full rounded-pill border border-petcenter-border-strong bg-white pl-11 pr-4 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm mã, tên hoặc mô tả dịch vụ..."
            type="search"
            value={searchValue}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="label-md whitespace-nowrap text-petcenter-text-muted">Danh mục:</span>
          <select
            className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            value={filters.category}
            onChange={(event) => onFiltersChange({ category: event.target.value as ServiceCategoryFilters["category"] })}
          >
            <option value="ALL">Tất cả</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="label-md whitespace-nowrap text-petcenter-text-muted">Trạng thái:</span>
          <select
            className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            value={filters.status}
            onChange={(event) => onFiltersChange({ status: event.target.value as ServiceCategoryFilters["status"] })}
          >
            <option value="ALL">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>

        <button onClick={onReset} className="body-md flex h-10 shrink-0 items-center justify-center gap-2 rounded-control border border-petcenter-border-strong bg-white px-4 font-medium text-petcenter-text-secondary transition hover:bg-petcenter-sidebar hover:text-petcenter-text">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>

        <div className="label-md flex min-w-[170px] items-center justify-start gap-2 text-petcenter-text-secondary xl:ml-auto xl:justify-end">
          <SlidersHorizontal className="h-4 w-4" />
          {shouldShowLoadingText ? "Đang tải..." : isRefreshingResults ? "Đang tìm..." : `Hiển thị ${resultCount}/${totalCount} dịch vụ`}
        </div>
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
function ServiceTable({
  services,
  page,
  limit,
  total,
  totalPages,
  isLoading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: {
  services: AdminServiceCategory[]
  page: number
  limit: number
  total: number
  totalPages: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onView: (service: AdminServiceCategory) => void
  onEdit: (service: AdminServiceCategory) => void
  onDelete: (service: AdminServiceCategory) => void
}) {
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  return (
    <div className="w-full bg-white rounded-2xl shadow-card border border-petcenter-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[1040px]">
          <colgroup>
            <col className="w-[160px]" />
            <col className="w-auto" />
            <col className="w-[180px]" />
            <col className="w-[140px]" />
            <col className="w-[150px]" />
            <col className="w-[160px]" />
            <col className="w-[150px]" />
          </colgroup>
          <thead>
            <tr className="bg-petcenter-filter border-b border-petcenter-border">
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Mã dịch vụ</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Tên dịch vụ</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Danh mục</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Thời lượng</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Giá cơ bản</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Trạng thái</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-petcenter-border hover:bg-petcenter-filter/50 h-[72px] transition-colors align-middle">
                <td className="px-5 py-4 text-sm font-medium text-petcenter-text-muted whitespace-nowrap">{service.code}</td>
                <td className="px-5 py-4 text-sm text-petcenter-text">
                  <p className="font-semibold text-petcenter-text truncate">{service.serviceName}</p>
                  <p className="text-sm text-petcenter-text-muted truncate mt-1">{service.description || "Chưa có mô tả"}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <CategoryBadge category={service.category} />
                </td>
                <td className="px-5 py-4 text-sm text-petcenter-text-secondary whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4 text-petcenter-text-muted" />
                    {formatDuration(service.durationMinutes)}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-petcenter-primary whitespace-nowrap">{formatVnd(service.basePrice)}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={service.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton label="Xem chi tiết" onClick={() => onView(service)} icon={<Eye className="w-4 h-4" />} />
                    <IconButton label="Chỉnh sửa" onClick={() => onEdit(service)} icon={<Pencil className="w-4 h-4" />} />
                    <IconButton label="Xóa" onClick={() => onDelete(service)} icon={<Trash2 className="w-4 h-4" />} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex items-center justify-between text-sm text-petcenter-text-muted bg-white border-t border-petcenter-border">
        <div>
          Hiển thị {startIndex}-{endIndex} của {total} kết quả
        </div>
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          ariaLabel="Phân trang danh sách dịch vụ"
          isLoading={isLoading}
          size="sm"
        />
      </div>
    </div>
  )
}

function IconButton({ label, icon, onClick, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-[36px] h-[36px] shrink-0 rounded-lg border border-petcenter-border flex items-center justify-center transition-colors ${
        danger
          ? "text-petcenter-danger-text hover:bg-petcenter-danger-bg"
          : "text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-primary"
      }`}
    >
      {icon}
    </button>
  )
}

function CategoryBadge({ category }: { category: ServiceCategoryKind }) {
  const meta = categoryOptions.find((item) => item.value === category) ?? categoryOptions[categoryOptions.length - 1]

  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${meta.className}`}>{meta.label}</span>
}

function StatusBadge({ status }: { status: ServiceCategoryStatus }) {
  const isActive = status === "active"

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${isActive ? "bg-petcenter-success-bg text-petcenter-success-text" : "bg-stone-100 text-petcenter-text-muted"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-petcenter-success-text" : "bg-petcenter-text-muted"}`} />
      {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
    </span>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full text-center py-12 text-petcenter-danger-text flex flex-col items-center gap-3">
      <AlertCircle className="w-8 h-8" />
      <span className="body-md">{message}</span>
      <button onClick={onRetry} className="px-5 py-2 bg-petcenter-primary text-white rounded-xl body-md font-medium hover:bg-petcenter-primary-hover transition-colors">
        Thử lại
      </button>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="w-full flex justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-petcenter-primary" />
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
      <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-petcenter-primary" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-petcenter-card rounded-full flex items-center justify-center shadow-sm border border-petcenter-border">
          <Tags className="w-4 h-4 text-petcenter-text-muted" />
        </div>
      </div>
      <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy dịch vụ</h3>
      <p className="body-md text-petcenter-text-secondary mb-6">Thử thay đổi bộ lọc hoặc đặt lại điều kiện tìm kiếm.</p>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
      </button>
    </div>
  )
}

function ServiceFormDialog({
  service,
  error,
  onClose,
  onSave,
}: {
  service: AdminServiceCategory | null
  error: string | null
  onClose: () => void
  onSave: (values: ServiceCategoryFormValues) => Promise<void>
}) {
  const [formData, setFormData] = useState<ServiceCategoryFormValues>({
    serviceName: service?.serviceName ?? "",
    category: service?.category ?? "medical",
    durationMinutes: service?.durationMinutes ?? 30,
    basePrice: service?.basePrice ?? 0,
    status: service?.status ?? "active",
    description: service?.description ?? "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    await onSave({
      ...formData,
      serviceName: formData.serviceName.trim(),
      description: formData.description?.trim() || null,
      basePrice: Number(formData.basePrice) || 0,
      durationMinutes: formData.durationMinutes === null ? null : Number(formData.durationMinutes) || null,
    })

    setIsSaving(false)
  }

  const isEdit = Boolean(service)
  const HeaderIcon = isEdit ? Pencil : Plus

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onClose()
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-petcenter-border bg-white p-0 text-petcenter-text shadow-[0_18px_48px_rgba(31,38,31,0.14)] outline-none ring-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-background px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-petcenter-primary/10 text-petcenter-primary">
              <HeaderIcon className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="title-md text-petcenter-text">{isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                {isEdit
                  ? "Cập nhật danh mục, thời lượng, giá và trạng thái dịch vụ."
                  : "Khai báo dịch vụ mới. Mã dịch vụ sẽ được hệ thống tự sinh sau khi tạo."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(560px,calc(100vh-12rem))] overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <FormField label="Tên dịch vụ" required>
                <Input
                  autoFocus
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  maxLength={150}
                  onChange={(event) => setFormData((current) => ({ ...current, serviceName: event.target.value }))}
                  placeholder="Ví dụ: Khám tổng quát"
                  required
                  value={formData.serviceName}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Danh mục" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value as ServiceCategoryKind }))}
                    value={formData.category}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Trạng thái" required>
                  <select
                    className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                    onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as ServiceCategoryStatus }))}
                    value={formData.status}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Thời lượng (phút)">
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    min={1}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        durationMinutes: event.target.value === "" ? null : Number(event.target.value),
                      }))
                    }
                    placeholder="Để trống nếu không áp dụng"
                    type="number"
                    value={formData.durationMinutes ?? ""}
                  />
                </FormField>

                <FormField label="Giá cơ bản (đ)" required>
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    min={0}
                    onChange={(event) => setFormData((current) => ({ ...current, basePrice: Number(event.target.value) }))}
                    required
                    step={1000}
                    type="number"
                    value={formData.basePrice}
                  />
                </FormField>
              </div>

              <FormField label="Mô tả">
                <textarea
                  className="min-h-26 w-full resize-none rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 py-2 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                  maxLength={500}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Ghi chú phạm vi áp dụng, điều kiện sử dụng hoặc lưu ý vận hành..."
                  value={formData.description ?? ""}
                />
              </FormField>

              {error && <p className="text-sm font-medium text-petcenter-danger-text">{error}</p>}
            </div>
          </div>

          <DialogFooter className="m-0 gap-3 border-t border-petcenter-border bg-petcenter-background px-6 py-5 sm:justify-end">
            <Button
              className="h-10 rounded-[0.75rem] border-petcenter-border bg-white px-5 text-petcenter-text hover:bg-petcenter-sidebar"
              disabled={isSaving}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Hủy bỏ
            </Button>
            <Button
              className="h-10 rounded-[0.75rem] bg-petcenter-primary px-5 font-semibold text-white hover:bg-petcenter-primary-hover"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Lưu thay đổi" : "Tạo dịch vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-petcenter-text">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function ServiceDetailDialog({ service, onClose, onEdit }: { service: AdminServiceCategory; onClose: () => void; onEdit: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-stone-200/50 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-petcenter-border bg-stone-50/50">
          <p className="text-sm font-semibold text-petcenter-text-muted mb-1">{service.code}</p>
          <h2 className="text-lg font-bold text-petcenter-text">{service.serviceName}</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={service.category} />
            <StatusBadge status={service.status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoBlock label="Thời lượng" value={formatDuration(service.durationMinutes)} />
            <InfoBlock label="Giá cơ bản" value={formatVnd(service.basePrice)} />
            <InfoBlock label="Lượt sử dụng" value={String(service.usageCount)} />
          </div>
          <div>
            <p className="text-sm font-semibold text-petcenter-text mb-2">Mô tả</p>
            <p className="body-md text-petcenter-text-secondary">{service.description || "Chưa có mô tả."}</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-petcenter-border bg-stone-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-petcenter-text-secondary hover:text-petcenter-text hover:bg-stone-200/50 rounded-xl transition-colors">
            Đóng
          </button>
          <button onClick={onEdit} className="px-6 py-2.5 text-sm font-bold bg-petcenter-primary text-white rounded-xl hover:bg-petcenter-primary-hover transition-all">
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-petcenter-border bg-petcenter-filter p-4">
      <p className="body-sm text-petcenter-text-muted">{label}</p>
      <p className="text-sm font-bold text-petcenter-text mt-1">{value}</p>
    </div>
  )
}

function ServiceDeleteDialog({
  service,
  error,
  onClose,
  onConfirm,
}: {
  service: AdminServiceCategory
  error: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    await onConfirm()
    setIsDeleting(false)
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isDeleting) onClose()
      }}
    >
      <DialogContent className="overflow-hidden rounded-2xl border border-petcenter-border bg-white p-0 text-petcenter-text shadow-[0_18px_48px_rgba(31,38,31,0.14)] outline-none ring-0 sm:max-w-[460px]">
        <DialogHeader className="border-b border-petcenter-border bg-petcenter-background px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-petcenter-danger-bg text-petcenter-danger-text">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="title-md text-petcenter-text">Xóa dịch vụ?</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                Nếu dịch vụ đã phát sinh dữ liệu, hệ thống sẽ chuyển sang ngừng hoạt động.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-[0.75rem] border border-petcenter-border bg-petcenter-background p-4">
            <p className="font-semibold text-petcenter-text">{service.serviceName}</p>
            <p className="body-sm mt-1 break-all text-petcenter-text-secondary">{service.code}</p>
          </div>
          <p className="body-sm text-petcenter-text-secondary">Bạn có chắc chắn muốn xóa dịch vụ này không?</p>
          {error && <p className="text-sm font-medium text-petcenter-danger-text">{error}</p>}
        </div>

        <DialogFooter className="m-0 gap-3 border-t border-petcenter-border bg-petcenter-background px-5 py-4 sm:justify-end">
          <Button
            className="h-10 rounded-[0.75rem] border-petcenter-border bg-white px-5 text-petcenter-text hover:bg-petcenter-sidebar"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Hủy bỏ
          </Button>
          <Button
            className="h-10 rounded-[0.75rem] bg-petcenter-danger-text px-5 font-semibold text-white hover:bg-petcenter-danger-text/90"
            disabled={isDeleting}
            onClick={handleConfirm}
            type="button"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Xóa dịch vụ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("₫", "đ")
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Không áp dụng"
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} ngày`
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} giờ`
  return `${minutes} phút`
}
