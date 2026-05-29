import { apiRequest } from "@/lib/api";
import { StaffAppointment, StaffAppointmentFilters, StaffAppointmentDetail } from "../types/appointment.types";

export interface StaffAppointmentListResponse {
  data: StaffAppointment[];
  stats: {
    pendingCount: number;
    confirmedCount: number;
    rejectedCount: number;
    cancelledCount: number;
    todayTotalCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const appointmentsApi = {
  getStaffAppointments: async (filters: StaffAppointmentFilters) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "ALL") params.append("status", filters.status);
    if (filters.serviceType !== "ALL") params.append("serviceType", filters.serviceType);
    if (filters.date) params.append("date", filters.date);
    if (filters.tab !== "ALL") params.append("tab", filters.tab);
    params.append("page", String(filters.page));
    params.append("limit", String(filters.limit));

    const qs = params.toString();
    const res = await apiRequest<StaffAppointment[]>(`/staff/appointments?${qs}`);

    return res as unknown as StaffAppointmentListResponse;
  },
  getStaffAppointmentDetail: async (appointmentId: string) => {
    const res = await apiRequest<StaffAppointmentDetail>(`/staff/appointments/${appointmentId}`);
    return res.data;
  },
  confirmStaffAppointment: async (appointmentId: string, payload: { doctorUserId?: string; internalNote?: string }) => {
    const res = await apiRequest<StaffAppointmentDetail>(`/staff/appointments/${appointmentId}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  rejectStaffAppointment: async (appointmentId: string, payload: { rejectionReason: string; internalNote?: string }) => {
    const res = await apiRequest<StaffAppointmentDetail>(`/staff/appointments/${appointmentId}/reject`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
