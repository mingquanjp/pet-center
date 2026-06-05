"use client"

import { useAdminMedicines } from "../../hooks/useAdminMedicines"
import { AdminMedicinesHeader } from "../../components/admin/AdminMedicinesHeader"
import { AdminMedicineStats } from "../../components/admin/AdminMedicineStats"
import { AdminMedicineFilterBar } from "../../components/admin/AdminMedicineFilterBar"
import { AdminMedicineTable } from "../../components/admin/AdminMedicineTable"
import { AdminMedicineEmptyState } from "../../components/admin/AdminMedicineEmptyState"
import { AdminMedicineFormDialog } from "../../components/admin/AdminMedicineFormDialog"
import { AdminMedicineDetailDialog } from "../../components/admin/AdminMedicineDetailDialog"
import { AdminMedicineDeleteConfirmDialog } from "../../components/admin/AdminMedicineDeleteConfirmDialog"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminMedicinesPage() {
  const {
    medicines,
    stats,
    pagination,
    filters,
    isLoading,
    error,
    isCreateOpen,
    isEditOpen,
    isDetailOpen,
    isDeleteOpen,
    selectedMedicine,
    setFilters,
    resetFilters,
    setPage,
    openCreate,
    openEdit,
    openDetail,
    openDelete,
    closeDialogs,
    createMedicine,
    updateMedicine,
    toggleMedicineStatus,
    deleteMedicine,
    refetch,
  } = useAdminMedicines()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-red-500 mb-4">Không thể tải danh sách thuốc.</p>
        <button
          onClick={() => refetch(true)}
          className="px-4 py-2 bg-petcenter-primary text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const isInitialLoading = isLoading && medicines.length === 0 && stats.totalMedicines === 0

  return (
    <div className="flex-1 space-y-6">
      <AdminMedicinesHeader onAddMedicine={openCreate} />

      {isInitialLoading ? (
        <section className="grid grid-cols-1 gap-gutter sm:grid-cols-3 w-full mb-6">
          <Skeleton className="h-26 rounded-2xl" />
          <Skeleton className="h-26 rounded-2xl" />
          <Skeleton className="h-26 rounded-2xl" />
        </section>
      ) : (
        <div className={isLoading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
          <AdminMedicineStats stats={stats} />
        </div>
      )}

      <AdminMedicineFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        onAddMedicine={openCreate}
      />

      {isInitialLoading ? (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className={isLoading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
          {medicines.length > 0 ? (
            <AdminMedicineTable
              medicines={medicines}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onView={openDetail}
              onEdit={openEdit}
              onToggleStatus={(med) => toggleMedicineStatus(med.id)}
              onDelete={openDelete}
            />
          ) : (
            <AdminMedicineEmptyState onResetFilters={resetFilters} />
          )}
        </div>
      )}

      {/* Dialogs */}
      <AdminMedicineFormDialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        medicine={isEditOpen ? selectedMedicine : null}
        onSubmit={isCreateOpen ? createMedicine : updateMedicine}
      />

      <AdminMedicineDetailDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        medicine={selectedMedicine}
        onEdit={(med) => {
          closeDialogs()
          setTimeout(() => openEdit(med), 150)
        }}
      />

      <AdminMedicineDeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs()
        }}
        medicine={selectedMedicine}
        onConfirm={deleteMedicine}
      />
    </div>
  )
}
