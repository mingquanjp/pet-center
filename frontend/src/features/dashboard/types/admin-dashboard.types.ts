export type AdminDashboardStats = {
  totalUsers: number
  totalPets: number
  medicalAppointments: number
  currentBoardingPets: number
  totalBoardingCapacity: number
  monthlyRevenue: number
  pendingInvoices: number
  medicineRevenue: number
  bookingRate: number
}

export type AdminDashboardTrends = {
  totalUsers: number | null
  totalPets: number | null
  monthlyRevenue: number | null
  bookingRate: number | null
}

export type AdminDashboardRevenuePoint = {
  label: string
  revenue: number
}

export type AdminDashboardServiceRevenue = {
  category: "medical" | "grooming" | "boarding" | "medicine" | "other"
  label: string
  revenue: number
  percentage: number
}

export type AdminDashboardRecentActivity = {
  activityLogId: string
  occurredAt: string
  code: string
  customerName: string
  petName: string | null
  action: string
  status: string
  statusLabel: string
  category: string
  sourceType: string
  sourceId: string
}

export type AdminDashboardAlert = {
  id: string
  type: "boarding_capacity" | "payment_failed" | "appointment_delay" | "medicine_inventory"
  severity: "info" | "warning" | "danger"
  title: string
  description: string
  sourceType: string | null
  sourceId: string | null
  occurredAt: string | null
}

export type AdminDashboardOverview = {
  range: {
    startDate: string
    endDate: string
  }
  stats: AdminDashboardStats
  trends: AdminDashboardTrends
  revenueTrend: AdminDashboardRevenuePoint[]
  serviceRevenue: AdminDashboardServiceRevenue[]
  recentActivities: AdminDashboardRecentActivity[]
  operationAlerts: AdminDashboardAlert[]
}
