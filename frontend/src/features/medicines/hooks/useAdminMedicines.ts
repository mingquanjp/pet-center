import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AdminMedicine,
  AdminMedicineFilters,
  AdminMedicinePagination,
  AdminMedicineStats,
  CreateAdminMedicinePayload,
  UpdateAdminMedicinePayload,
} from "../types/medicine.types"
import { adminMedicinesApi } from "../api/medicines.api"

export function useAdminMedicines() {
  const [medicines, setMedicines] = useState<AdminMedicine[]>([])
  const [stats, setStats] = useState<AdminMedicineStats>({
    totalMedicines: 0,
    activeMedicines: 0,
    inactiveMedicines: 0,
  })
  const [pagination, setPagination] = useState<AdminMedicinePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFiltersState] = useState<AdminMedicineFilters>({
    search: "",
    unit: "ALL",
    status: "ALL",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<AdminMedicine | null>(null)

  const fetchMedicines = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    try {
      const data = await adminMedicinesApi.getMedicines({
        filters,
        page: pagination.page,
        limit: pagination.limit,
      })
      setMedicines(data.items)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err)
      toast.error(err.message || "Không thể tải danh sách thuốc")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchMedicines(true)
  }, [fetchMedicines])

  const setFilters = (newFilters: Partial<AdminMedicineFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset page on filter
  }

  const resetFilters = () => {
    setFiltersState({ search: "", unit: "ALL", status: "ALL" })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
  }

  const openCreate = () => {
    setIsCreateOpen(true)
  }

  const openEdit = (medicine: AdminMedicine) => {
    setSelectedMedicine(medicine)
    setIsEditOpen(true)
  }

  const openDetail = (medicine: AdminMedicine) => {
    setSelectedMedicine(medicine)
    setIsDetailOpen(true)
  }

  const openDelete = (medicine: AdminMedicine) => {
    setSelectedMedicine(medicine)
    setIsDeleteOpen(true)
  }

  const closeDialogs = () => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setIsDetailOpen(false)
    setIsDeleteOpen(false)
    setSelectedMedicine(null)
  }

  const createMedicine = async (payload: CreateAdminMedicinePayload) => {
    try {
      await adminMedicinesApi.createMedicine(payload)
      toast.success("Thêm thuốc thành công")
      closeDialogs()
      fetchMedicines(false)
    } catch (err: any) {
      toast.error(err.message || "Thêm thuốc thất bại")
    }
  }

  const updateMedicine = async (payload: UpdateAdminMedicinePayload) => {
    try {
      await adminMedicinesApi.updateMedicine(payload)
      toast.success("Cập nhật thuốc thành công")
      closeDialogs()
      fetchMedicines(false)
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thuốc thất bại")
    }
  }

  const toggleMedicineStatus = async (id: string) => {
    try {
      const res = await adminMedicinesApi.toggleMedicineStatus(id)
      
      // Cập nhật state nội bộ (Optimistic Update)
      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, medicineStatus: res.medicineStatus } : m))
      )
      
      setStats((prev) => {
        const isActive = res.medicineStatus === "active"
        return {
          ...prev,
          activeMedicines: prev.activeMedicines + (isActive ? 1 : -1),
          inactiveMedicines: prev.inactiveMedicines + (isActive ? -1 : 1),
        }
      })

      toast.success(
        res.medicineStatus === "active"
          ? "Đã kích hoạt thuốc"
          : "Đã ngừng hoạt động thuốc"
      )
    } catch (err: any) {
      toast.error(err.message || "Đổi trạng thái thất bại")
    }
  }

  const deleteMedicine = async (id: string) => {
    try {
      const result = await adminMedicinesApi.deleteMedicine(id)
      if (result.deactivated) {
        toast.info(
          "Thuốc đã được sử dụng nên chỉ chuyển sang trạng thái Ngừng hoạt động."
        )
      } else {
        toast.success("Xóa thuốc thành công")
      }
      closeDialogs()
      fetchMedicines(false)
    } catch (err: any) {
      toast.error(err.message || "Xóa thuốc thất bại")
    }
  }

  return {
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
    setLimit,
    openCreate,
    openEdit,
    openDetail,
    openDelete,
    closeDialogs,
    createMedicine,
    updateMedicine,
    toggleMedicineStatus,
    deleteMedicine,
    refetch: fetchMedicines,
  }
}
