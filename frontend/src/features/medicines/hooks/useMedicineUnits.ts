import { useCallback, useEffect, useState } from "react"
import { adminMedicinesApi } from "../api/medicines.api"
import { toast } from "sonner"

export function useMedicineUnits() {
  const [units, setUnits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUnits = useCallback(async () => {
    try {
      const data = await adminMedicinesApi.getMedicineUnits()
      setUnits(data)
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách đơn vị")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  return {
    units,
    isLoading,
    refetch: fetchUnits,
  }
}
