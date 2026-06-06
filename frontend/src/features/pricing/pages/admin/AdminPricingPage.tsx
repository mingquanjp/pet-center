"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  CalendarDays,
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
import { useAdminPricing } from "../../hooks/useAdminPricing"
import {
  AdminPriceRule,
  AdminPricingServiceOption,
  PriceRuleFormValues,
  PricingFilters,
  PricingServiceCategory,
  PricingStatus,
} from "../../types/pricing.types"

const categoryOptions: Array<{ value: PricingServiceCategory; label: string; className: string }> = [
  { value: "medical", label: "Khám bệnh", className: "bg-petcenter-info-bg text-petcenter-info-text" },
  { value: "grooming", label: "Spa & Grooming", className: "bg-petcenter-warning-bg text-petcenter-warning-text" },
  { value: "boarding", label: "Lưu trú", className: "bg-[#EEE8FF] text-[#6D4AFF]" },
  { value: "medicine", label: "Thuốc", className: "bg-petcenter-success-bg text-petcenter-success-text" },
  { value: "other", label: "Khác", className: "bg-stone-100 text-petcenter-text-secondary" },
]

const defaultFilters: PricingFilters = {
  search: "",
  category: "ALL",
  status: "ALL",
  serviceId: "",
}

const pageSize = 5

export function AdminPricingPage() {
  const [filters, setFilters] = useState<PricingFilters>(defaultFilters)
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [selectedRule, setSelectedRule] = useState<AdminPriceRule | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "detail" | "delete" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(searchValue, 500)
  const isSearchSettling = normalizeSearchText(searchValue) !== normalizeSearchText(debouncedSearch)

  const apiFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch.trim() }),
    [debouncedSearch, filters]
  )

  const {
    rules,
    stats,
    serviceOptions,
    pagination,
    isLoading,
    error,
    refetch,
    createPriceRule,
    updatePriceRule,
    deletePriceRule,
  } = useAdminPricing(apiFilters, page, pageSize)

  const resetFilters = () => {
    setSearchValue("")
    setFilters(defaultFilters)
    setPage(1)
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedRule(null)
    setActionError(null)
  }

  const openCreate = () => {
    setSelectedRule(null)
    setActionError(null)
    setDialogMode("create")
  }

  const openEdit = (rule: AdminPriceRule) => {
    setSelectedRule(rule)
    setActionError(null)
    setDialogMode("edit")
  }

  const openDetail = (rule: AdminPriceRule) => {
    setSelectedRule(rule)
    setDialogMode("detail")
  }

  const openDelete = (rule: AdminPriceRule) => {
    setSelectedRule(rule)
    setActionError(null)
    setDialogMode("delete")
  }

  const saveRule = async (values: PriceRuleFormValues) => {
    setActionError(null)

    try {
      if (dialogMode === "edit" && selectedRule) {
        await updatePriceRule({ id: selectedRule.id, ...values })
        toast.success("Đã cập nhật quy tắc giá.")
      } else {
        await createPriceRule(values)
        setPage(1)
        toast.success("Đã tạo quy tắc giá mới.")
      }
      closeDialog()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Không thể lưu quy tắc giá."
      setActionError(message)
      toast.error(message)
    }
  }

  const deleteRule = async () => {
    if (!selectedRule) return
    setActionError(null)

    try {
      await deletePriceRule(selectedRule.id)
      toast.success("Đã xóa quy tắc giá.")
      closeDialog()
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Không thể xóa quy tắc giá."
      setActionError(message)
      toast.error(message)
    }
  }

  const showInitialLoading = isLoading && rules.length === 0
  const isRefreshingResults = !showInitialLoading && (isLoading || isSearchSettling)

  return (
    <div className="flex-1 space-y-6">
      <PageHeader onCreate={openCreate} />
      <PricingStats stats={stats} />

      <FilterBar
        filters={filters}
        isRefreshingResults={isRefreshingResults}
        searchValue={searchValue}
        serviceOptions={serviceOptions}
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
      ) : rules.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className={cn("transition-opacity duration-200", isRefreshingResults && "opacity-80 pointer-events-none")}>
          <PricingTable
            isLoading={isLoading}
            limit={pagination.limit}
            page={pagination.page}
            rules={rules}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onDelete={openDelete}
            onEdit={openEdit}
            onPageChange={setPage}
            onView={openDetail}
          />
        </div>
      )}

      {(dialogMode === "create" || dialogMode === "edit") && (
        <PriceRuleFormDialog
          error={actionError}
          rule={selectedRule}
          serviceOptions={serviceOptions}
          onClose={closeDialog}
          onSave={saveRule}
        />
      )}

      {dialogMode === "detail" && selectedRule && (
        <PriceRuleDetailDialog
          rule={selectedRule}
          onClose={closeDialog}
          onEdit={() => {
            setActionError(null)
            setDialogMode("edit")
          }}
        />
      )}

      {dialogMode === "delete" && selectedRule && (
        <PriceRuleDeleteDialog error={actionError} rule={selectedRule} onClose={closeDialog} onConfirm={deleteRule} />
      )}
    </div>
  )
}

function PageHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="heading-lg text-petcenter-text tracking-tight">Quản lý bảng giá</h2>
        <p className="body-md text-petcenter-text-secondary mt-1">
          Quản lý giá dịch vụ theo điều kiện áp dụng, ngày hiệu lực và trạng thái sử dụng.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white px-5 rounded-[12px] text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-9 self-start md:self-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Thêm giá</span>
      </button>
    </div>
  )
}

function PricingStats({
  stats,
}: {
  stats: { totalRules: number; activeRules: number; inactiveRules: number; averagePrice: number; serviceCount: number }
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      <StatCard icon={Layers3} iconClassName="bg-petcenter-info-bg text-petcenter-info-text" label="Tổng quy tắc" value={stats.totalRules} />
      <StatCard icon={Activity} iconClassName="bg-petcenter-success-bg text-petcenter-success-text" label="Đang hoạt động" value={stats.activeRules} />
      <StatCard icon={AlertCircle} iconClassName="bg-petcenter-danger-bg text-petcenter-danger-text" label="Ngừng hoạt động" value={stats.inactiveRules} />
      <StatCard icon={Tags} iconClassName="bg-petcenter-primary/10 text-petcenter-primary" label="Dịch vụ có giá" value={stats.serviceCount} />
      <StatCard icon={CalendarDays} iconClassName="bg-petcenter-warning-bg text-petcenter-warning-text" label="Giá trung bình" value={formatVnd(stats.averagePrice)} />
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
  serviceOptions,
  onSearchChange,
  onFiltersChange,
  onReset,
}: {
  filters: PricingFilters
  isRefreshingResults: boolean
  searchValue: string
  serviceOptions: AdminPricingServiceOption[]
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: Partial<PricingFilters>) => void
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
            placeholder="Tìm mã, dịch vụ hoặc điều kiện giá..."
            type="search"
            value={searchValue}
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="label-md whitespace-nowrap text-petcenter-text-muted">Dịch vụ:</span>
          <select
            className="body-md h-10 max-w-[220px] rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            value={filters.serviceId}
            onChange={(event) => onFiltersChange({ serviceId: event.target.value })}
          >
            <option value="">Tất cả</option>
            {serviceOptions.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="label-md whitespace-nowrap text-petcenter-text-muted">Danh mục:</span>
          <select
            className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
            value={filters.category}
            onChange={(event) => onFiltersChange({ category: event.target.value as PricingFilters["category"] })}
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
            onChange={(event) => onFiltersChange({ status: event.target.value as PricingFilters["status"] })}
          >
            <option value="ALL">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>

        <button onClick={onReset} className="body-md flex h-10 shrink-0 items-center justify-center gap-2 rounded-control border border-petcenter-border-strong bg-white px-4 font-medium text-petcenter-text-secondary transition hover:bg-petcenter-sidebar hover:text-petcenter-text">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
        </button>

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

function PricingTable({
  isLoading,
  limit,
  page,
  rules,
  total,
  totalPages,
  onDelete,
  onEdit,
  onPageChange,
  onView,
}: {
  isLoading: boolean
  limit: number
  page: number
  rules: AdminPriceRule[]
  total: number
  totalPages: number
  onDelete: (rule: AdminPriceRule) => void
  onEdit: (rule: AdminPriceRule) => void
  onPageChange: (page: number) => void
  onView: (rule: AdminPriceRule) => void
}) {
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  return (
    <div className="w-full bg-white rounded-2xl shadow-card border border-petcenter-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
          <colgroup>
            <col className="w-[150px]" />
            <col className="w-auto" />
            <col className="w-[170px]" />
            <col className="w-[190px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[160px]" />
          </colgroup>
          <thead>
            <tr className="bg-petcenter-filter border-b border-petcenter-border">
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Mã giá</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Dịch vụ</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Danh mục</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Điều kiện</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Giá</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em]">Hiệu lực</th>
              <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-[0.08em] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-petcenter-border hover:bg-petcenter-filter/50 h-[72px] transition-colors align-middle">
                <td className="px-5 py-4 text-sm font-medium text-petcenter-text-muted whitespace-nowrap">{rule.code}</td>
                <td className="px-5 py-4 text-sm text-petcenter-text">
                  <p className="font-semibold text-petcenter-text truncate">{rule.serviceName}</p>
                  <StatusBadge status={rule.status} />
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <CategoryBadge category={rule.serviceCategory} />
                </td>
                <td className="px-5 py-4 text-sm text-petcenter-text-secondary truncate">{rule.pricingCondition}</td>
                <td className="px-5 py-4 text-sm font-semibold text-petcenter-primary whitespace-nowrap">{formatVnd(rule.priceAmount)}</td>
                <td className="px-5 py-4 text-sm text-petcenter-text-secondary whitespace-nowrap">{formatDate(rule.effectiveFrom)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton label="Xem chi tiết" onClick={() => onView(rule)} icon={<Eye className="w-4 h-4" />} />
                    <IconButton label="Chỉnh sửa" onClick={() => onEdit(rule)} icon={<Pencil className="w-4 h-4" />} />
                    <IconButton label="Xóa" onClick={() => onDelete(rule)} icon={<Trash2 className="w-4 h-4" />} danger />
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
          ariaLabel="Phân trang bảng giá"
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

function CategoryBadge({ category }: { category: PricingServiceCategory }) {
  const meta = categoryOptions.find((item) => item.value === category) ?? categoryOptions[categoryOptions.length - 1]
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${meta.className}`}>{meta.label}</span>
}

function StatusBadge({ status }: { status: PricingStatus }) {
  const isActive = status === "active"
  return (
    <span className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${isActive ? "bg-petcenter-success-bg text-petcenter-success-text" : "bg-stone-100 text-petcenter-text-muted"}`}>
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
      <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy giá dịch vụ</h3>
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

function PriceRuleFormDialog({
  rule,
  error,
  serviceOptions,
  onClose,
  onSave,
}: {
  rule: AdminPriceRule | null
  error: string | null
  serviceOptions: AdminPricingServiceOption[]
  onClose: () => void
  onSave: (values: PriceRuleFormValues) => Promise<void>
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [formData, setFormData] = useState<PriceRuleFormValues>({
    serviceId: rule?.serviceId ?? serviceOptions[0]?.id ?? "",
    pricingCondition: rule?.pricingCondition ?? "",
    priceAmount: rule?.priceAmount ?? serviceOptions[0]?.basePrice ?? 0,
    effectiveFrom: rule?.effectiveFrom?.slice(0, 10) ?? today,
    status: rule?.status ?? "active",
  })
  const [isSaving, setIsSaving] = useState(false)
  const isEdit = Boolean(rule)
  const HeaderIcon = isEdit ? Pencil : Plus

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    await onSave({
      ...formData,
      pricingCondition: formData.pricingCondition.trim(),
      priceAmount: Number(formData.priceAmount) || 0,
    })
    setIsSaving(false)
  }

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
              <DialogTitle className="title-md text-petcenter-text">{isEdit ? "Chỉnh sửa giá" : "Thêm giá dịch vụ"}</DialogTitle>
              <DialogDescription className="body-sm mt-1 text-petcenter-text-secondary">
                Cập nhật giá theo dịch vụ, điều kiện áp dụng và ngày hiệu lực.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[min(560px,calc(100vh-12rem))] overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <FormField label="Dịch vụ" required>
                <select
                  className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                  onChange={(event) => {
                    const service = serviceOptions.find((item) => item.id === event.target.value)
                    setFormData((current) => ({
                      ...current,
                      serviceId: event.target.value,
                      priceAmount: current.priceAmount || service?.basePrice || 0,
                    }))
                  }}
                  required
                  value={formData.serviceId}
                >
                  <option value="" disabled>Chọn dịch vụ</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Điều kiện giá" required>
                <Input
                  autoFocus
                  className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                  maxLength={150}
                  onChange={(event) => setFormData((current) => ({ ...current, pricingCondition: event.target.value }))}
                  placeholder="Ví dụ: Giá tiêu chuẩn, Phụ thu thú cưng lớn..."
                  required
                  value={formData.pricingCondition}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Giá áp dụng (đ)" required>
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    min={0}
                    onChange={(event) => setFormData((current) => ({ ...current, priceAmount: Number(event.target.value) }))}
                    required
                    step={1000}
                    type="number"
                    value={formData.priceAmount}
                  />
                </FormField>
                <FormField label="Ngày hiệu lực" required>
                  <Input
                    className="h-10 rounded-[0.75rem] border-petcenter-border-strong bg-white"
                    onChange={(event) => setFormData((current) => ({ ...current, effectiveFrom: event.target.value }))}
                    required
                    type="date"
                    value={formData.effectiveFrom}
                  />
                </FormField>
              </div>

              <FormField label="Trạng thái" required>
                <select
                  className="h-10 w-full rounded-[0.75rem] border border-petcenter-border-strong bg-white px-3 text-sm text-petcenter-text outline-none focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
                  onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as PricingStatus }))}
                  value={formData.status}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
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
              {isEdit ? "Lưu thay đổi" : "Tạo giá"}
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

function PriceRuleDetailDialog({ rule, onClose, onEdit }: { rule: AdminPriceRule; onClose: () => void; onEdit: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-stone-200/50 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-petcenter-border bg-stone-50/50">
          <p className="text-sm font-semibold text-petcenter-text-muted mb-1">{rule.code}</p>
          <h2 className="text-lg font-bold text-petcenter-text">{rule.serviceName}</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={rule.serviceCategory} />
            <StatusBadge status={rule.status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoBlock label="Điều kiện" value={rule.pricingCondition} />
            <InfoBlock label="Giá" value={formatVnd(rule.priceAmount)} />
            <InfoBlock label="Hiệu lực" value={formatDate(rule.effectiveFrom)} />
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

function PriceRuleDeleteDialog({
  rule,
  error,
  onClose,
  onConfirm,
}: {
  rule: AdminPriceRule
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
        if (event.target === event.currentTarget && !isDeleting) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-petcenter-danger-text">
            <Trash2 className="w-6 h-6" />
            <h3 className="text-lg font-bold text-petcenter-text tracking-tight">Xác nhận xóa giá</h3>
          </div>
          <p className="text-petcenter-text-secondary body-md">
            Bạn có chắc muốn xóa giá <strong>{rule.pricingCondition}</strong> của dịch vụ <strong>{rule.serviceName}</strong> không?
          </p>
          {error && <p className="text-sm font-medium text-petcenter-danger-text mt-3">{error}</p>}
        </div>
        <div className="px-6 py-4 bg-stone-50/80 border-t border-petcenter-border flex justify-end gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-petcenter-text-secondary hover:bg-stone-200 disabled:opacity-60 rounded-xl transition-colors">
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-petcenter-danger-text hover:bg-[#DC2626] disabled:opacity-60 rounded-xl transition-colors shadow-sm flex items-center gap-2">
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa giá
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}
