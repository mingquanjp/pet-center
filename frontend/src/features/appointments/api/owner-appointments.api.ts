import { apiRequest } from "@/lib/api";
import {
  CreateOwnerAppointmentPayload,
  CreateOwnerAppointmentResult,
  OwnerAppointment,
  OwnerAppointmentDetail,
  OwnerAppointmentFilters,
  OwnerAppointmentPetOption,
  OwnerAppointmentTimeSlot,
  OwnerExamTypeOption,
} from "../types/appointment.types";

export interface OwnerAppointmentsListResponse {
  data: OwnerAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OwnerCreateAppointmentOptions {
  pets: OwnerAppointmentPetOption[];
  examTypes: OwnerExamTypeOption[];
  timeSlots: OwnerAppointmentTimeSlot[];
}

export const ownerAppointmentsApi = {
  async list({
    filters,
    limit,
    page,
  }: {
    filters: OwnerAppointmentFilters;
    limit: number;
    page: number;
  }): Promise<OwnerAppointmentsListResponse> {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.petId !== "ALL") params.set("petId", filters.petId);
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.date) params.set("date", filters.date);
    params.set("page", String(page));
    params.set("limit", String(limit));

    const response = await apiRequest<OwnerAppointment[]>(`/owner/appointments?${params.toString()}`);

    return {
      data: response.data,
      pagination: response.pagination ?? {
        page,
        limit,
        total: response.data.length,
        totalPages: 1,
      },
    };
  },

  async getDetail(appointmentId: string, init: RequestInit = {}) {
    const response = await apiRequest<OwnerAppointmentDetail>(
      `/owner/appointments/${encodeURIComponent(appointmentId)}`,
      init
    );
    return response.data;
  },

  async getCreateOptions() {
    const response = await apiRequest<OwnerCreateAppointmentOptions>("/owner/appointments/create-options");
    return response.data;
  },

  async getAvailableSlots(params: { date: string; examTypeId?: string }) {
    const searchParams = new URLSearchParams({ date: params.date });
    if (params.examTypeId) searchParams.set("examTypeId", params.examTypeId);

    const response = await apiRequest<OwnerAppointmentTimeSlot[]>(
      `/owner/appointments/available-slots?${searchParams.toString()}`
    );
    return response.data;
  },

  async create(payload: CreateOwnerAppointmentPayload) {
    const response = await apiRequest<CreateOwnerAppointmentResult>("/owner/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async cancel(appointmentId: string, payload: { reason?: string }) {
    const response = await apiRequest<OwnerAppointmentDetail>(
      `/owner/appointments/${encodeURIComponent(appointmentId)}/cancel`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },
};
