"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  Clock3,
  Eye,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Stethoscope,
  Tags,
  Trash2,
} from "lucide-react"

import { AppPagination } from "@/components/ui/app-pagination"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
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

const pageSize = 10

export function AdminServiceCategoriesPage() {
  const [filters, setFilters] = useState<ServiceCategoryFilters>(defaultFilters)
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [selectedService, setSelectedService] = useState<AdminServiceCategory | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "detail" | "delete" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchValue, 400)

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
      } else {
        await createServiceCategory(values)
        setPage(1)
      }

      closeDialog()
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "Không thể lưu dịch vụ.")
    }
  }

  const deleteService = async () => {
    if (!selectedService) return
    setActionError(null)

    try {
      await deleteServiceCategory(selectedService.id)
      closeDialog()
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "Không thể xóa dịch vụ.")
    }
  }

  const showInitialLoading = isLoading && services.length === 0

  return (
    <div className="flex-1 space-y-6">
      <PageHeader onCreate={openCreate} />

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4 w-full">
        <StatCard title="Tổng dịch vụ" value={stats.totalServices} icon={<Layers3 className="w-5 h-5 text-petcenter-primary" />} color="bg-petcenter-info-bg" />
        <StatCard title="Đang hoạt động" value={stats.activeServices} icon={<Activity className="w-5 h-5 text-petcenter-success-text" />} color="bg-petcenter-success-bg" />
        <StatCard title="Khám & điều trị" value={stats.medicalServices} icon={<Stethoscope className="w-5 h-5 text-petcenter-info-text" />} color="bg-petcenter-info-bg" />
        <StatCard title="Giá trung bình" value={formatVnd(stats.averagePrice)} icon={<Tags className="w-5 h-5 text-petcenter-cta" />} color="bg-petcenter-cta/15" />
      </section>

      <FilterBar
        filters={filters}
        searchValue={searchValue}
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
        <div className={isLoading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
          <ServiceTable
            services={services}
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
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
        <h2 className="heading-lg text-petcenter-text tracking-tight">Quản lý Danh mục dịch vụ</h2>
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

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="h-26 p-5 bg-white rounded-2xl shadow-sm border border-petcenter-border flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none text-petcenter-text">{value}</p>
        <p className="body-sm text-petcenter-text-secondary mt-1">{title}</p>
      </div>
    </div>
  )
}

function FilterBar({
  filters,
  searchValue,
  onSearchChange,
  onFiltersChange,
  onReset,
}: {
  filters: ServiceCategoryFilters
  searchValue: string
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: Partial<ServiceCategoryFilters>) => void
  onReset: () => void
}) {
  return (
    <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-petcenter-border">
      <div className="flex flex-wrap items-center gap-4 w-full">
        <div className="relative flex-[2] min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
          <input
            type="text"
            placeholder="Tìm mã, tên hoặc mô tả dịch vụ..."
            className="w-full pl-9 pr-3 py-2.5 bg-petcenter-background body-md border border-petcenter-border rounded-xl focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Danh mục:</span>
          <select
            className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
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

        <label className="flex items-center gap-2 flex-1 min-w-[190px]">
          <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Trạng thái:</span>
          <select
            className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
            value={filters.status}
            onChange={(event) => onFiltersChange({ status: event.target.value as ServiceCategoryFilters["status"] })}
          >
            <option value="ALL">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>

        <button onClick={onReset} className="shrink-0 p-2.5 px-5 gap-2 bg-petcenter-background text-petcenter-text-secondary border border-petcenter-border rounded-xl hover:bg-petcenter-border hover:text-petcenter-text transition-colors flex items-center justify-center body-md font-medium">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>
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

  const handleSubmit = async (event: React.FormEvent) => {
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-stone-200/50 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-petcenter-border flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-lg font-bold text-petcenter-text leading-none">{service ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
            <p className="text-sm text-petcenter-text-secondary mt-1">{service ? "Cập nhật thông tin dịch vụ đang cung cấp" : "Mã dịch vụ sẽ được hệ thống tự sinh sau khi tạo"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <form id="service-category-form" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Tên dịch vụ" required>
            <input
              required
              maxLength={150}
              type="text"
              placeholder="VD: Khám tổng quát"
              className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
              value={formData.serviceName}
              onChange={(event) => setFormData((current) => ({ ...current, serviceName: event.target.value }))}
            />
          </Field>
          <Field label="Danh mục" required>
            <select
              className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
              value={formData.category}
              onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value as ServiceCategoryKind }))}
            >
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái" required>
            <select
              className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
              value={formData.status}
              onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as ServiceCategoryStatus }))}
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </Field>
          <Field label="Thời lượng (phút)">
            <input
              min={1}
              type="number"
              placeholder="Để trống nếu không áp dụng"
              className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
              value={formData.durationMinutes ?? ""}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  durationMinutes: event.target.value === "" ? null : Number(event.target.value),
                }))
              }
            />
          </Field>
          <Field label="Giá cơ bản (đ)" required>
            <input
              required
              min={0}
              step={1000}
              type="number"
              className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
              value={formData.basePrice}
              onChange={(event) => setFormData((current) => ({ ...current, basePrice: Number(event.target.value) }))}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Mô tả">
              <textarea
                maxLength={500}
                placeholder="Ghi chú phạm vi áp dụng, điều kiện sử dụng hoặc lưu ý vận hành..."
                className="w-full bg-petcenter-background border border-petcenter-border rounded-xl px-4 py-3 text-sm h-28 resize-none focus:bg-white focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 transition-all outline-none"
                value={formData.description ?? ""}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
          </div>
          {error && <p className="md:col-span-2 text-sm font-medium text-petcenter-danger-text">{error}</p>}
        </form>

        <div className="px-6 py-4 border-t border-petcenter-border bg-stone-50/50 flex justify-end gap-3 items-center">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-petcenter-text-secondary hover:text-petcenter-text hover:bg-stone-200/50 rounded-xl transition-colors">
            Hủy bỏ
          </button>
          <button type="submit" form="service-category-form" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold bg-petcenter-primary text-white rounded-xl hover:bg-petcenter-primary-hover disabled:opacity-60 transition-all shadow-sm shadow-petcenter-primary/20 flex items-center gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {service ? "Lưu thay đổi" : "Tạo dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-petcenter-text mb-2">
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
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-petcenter-danger-text">
            <Trash2 className="w-6 h-6" />
            <h3 className="text-lg font-bold text-petcenter-text tracking-tight">Xác nhận xóa dịch vụ</h3>
          </div>
          <p className="text-petcenter-text-secondary body-md">
            Bạn có chắc muốn xóa <strong>{service.serviceName}</strong> không? Nếu dịch vụ đã phát sinh dữ liệu, hệ thống sẽ chuyển sang ngừng hoạt động.
          </p>
          {error && <p className="text-sm font-medium text-petcenter-danger-text mt-3">{error}</p>}
        </div>
        <div className="px-6 py-4 bg-stone-50/80 border-t border-petcenter-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-petcenter-text-secondary hover:bg-stone-200 rounded-xl transition-colors">
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-petcenter-danger-text hover:bg-[#DC2626] disabled:opacity-60 rounded-xl transition-colors shadow-sm flex items-center gap-2">
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa dịch vụ
          </button>
        </div>
      </div>
    </div>
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
