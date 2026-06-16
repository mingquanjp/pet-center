import {
  normalizeTimestamp,
  requireTimestamp,
  calculateStayDays
} from "../boarding.mapper.js";
import type {
  StaffBoardingCareUpdateDto,
  StaffBoardingDetailDto,
  StaffBoardingListItemDto,
  StaffBoardingPaymentStatusDto,
  StaffBoardingTimelineItemDto,
  StaffBoardingTimelineLabelToneDto,
  StaffBoardingUpdateAlertLevelDto,
  StaffBoardingUpdateVisibilityDto
} from "../boarding.types.js";

export function mapDbAlertLevelToDto(level: string | null): StaffBoardingUpdateAlertLevelDto {
  if (level === "attention") return "NEED_ATTENTION";
  if (level === "urgent") return "WARNING";
  return "NORMAL";
}

export function mapDbVisibilityStatusToDto(status: string | null): StaffBoardingUpdateVisibilityDto {
  if (status === "draft") return "DRAFT";
  return "PUBLISHED";
}

export function mapDtoAlertLevelToDb(level: string | undefined): "normal" | "attention" | "urgent" {
  if (level === "NEED_ATTENTION") return "attention";
  if (level === "WARNING") return "urgent";
  return "normal";
}

export function mapDtoVisibilityStatusToDb(status: string | undefined): "draft" | "published" {
  if (status === "DRAFT") return "draft";
  return "published";
}

export function getRoomTypeName(record: { room_type_name?: string | null }): string {
  return record.room_type_name || "Chưa phân phòng";
}

export function mapPaymentStatus(record: any): StaffBoardingPaymentStatusDto {
  return record.invoice_status === "paid" || record.has_success_payment ? "PAID" : "UNPAID";
}

export function normalizeAttachmentUrlsStaff(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  if (typeof value === "string") return [value];
  return [];
}

export function getPayloadAttachmentUrls(payload: { attachmentUrl?: string | null; attachmentUrls?: string[] }): string[] | null {
  if (payload.attachmentUrls) return payload.attachmentUrls;
  return payload.attachmentUrl ? [payload.attachmentUrl] : null;
}

export function toApiDateTime(value: unknown): string {
  return requireTimestamp(value);
}

export function buildCurrentDayLabel(record: any): string | null {
  if (record.boarding_status === "checked_out") return "Đã hoàn tất";
  if (record.boarding_status !== "staying" || !record.actual_check_in_at) return null;
  const checkedInAt = new Date(record.actual_check_in_at).getTime();
  const day = Math.floor((Date.now() - checkedInAt) / (24 * 60 * 60 * 1000)) + 1;
  return `Ngày thứ ${Math.max(1, day)}`;
}

export function buildUpdateTitleFromAlertLevel(level: string | null): string {
  if (level === "attention") return "Cần theo dõi";
  if (level === "urgent") return "Cảnh báo chăm sóc";
  return "Cập nhật hằng ngày";
}

export function getCareUpdateLabel(level: string | null): string {
  if (level === "attention") return "Cần theo dõi";
  if (level === "urgent") return "Bất thường";
  return "Bình thường";
}

export function getCareUpdateLabelTone(level: string | null): StaffBoardingTimelineLabelToneDto {
  if (level === "attention") return "warning";
  if (level === "urgent") return "danger";
  return "success";
}

export function mapDbBoardingStatusToDto(status: string): any {
  return status.toUpperCase();
}

export function buildStaffBoardingTimeline(record: any, careUpdates: any[]): StaffBoardingTimelineItemDto[] {
  const timeline: StaffBoardingTimelineItemDto[] = [];

  let fallbackStaff = record.handled_by_staff_id ? { id: record.handled_by_staff_id, fullName: record.handled_by_staff_name || "Nhân viên" } : null;
  let confirmedBy = fallbackStaff;
  let checkedInBy = fallbackStaff;
  let checkedOutBy = fallbackStaff;
  let rejectedBy = fallbackStaff;

  const actualCareUpdates = [];
  for (const update of careUpdates) {
    if (update.update_note?.startsWith("[SYSTEM_CONFIRM]")) {
      confirmedBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_CHECKIN]")) {
      checkedInBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_CHECKOUT]")) {
      checkedOutBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else if (update.update_note?.startsWith("[SYSTEM_REJECT]")) {
      rejectedBy = update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null;
    } else {
      actualCareUpdates.push(update);
    }
  }

  if (record.boarding_status === "rejected") {
    timeline.push({
      id: `${record.boarding_record_id}_rejected`,
      type: "REJECTED",
      title: "Từ chối lưu trú",
      label: "Đã từ chối",
      labelTone: "danger",
      description: record.rejection_reason ? `Lý do từ chối: ${record.rejection_reason}` : "Nhân viên đã từ chối yêu cầu lưu trú này.",
      createdAt: normalizeTimestamp(careUpdates.find((update) => update.update_note?.startsWith("[SYSTEM_REJECT]"))?.updated_at) || normalizeTimestamp(record.created_at) || new Date().toISOString(),
      createdBy: rejectedBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "checked_out") {
    timeline.push({
      id: `${record.boarding_record_id}_checked_out`,
      type: "CHECKED_OUT",
      title: "Trả thú cưng",
      label: "Đã trả thú cưng",
      labelTone: "success",
      description: "Thú cưng đã được trả cho chủ nuôi.",
      createdAt: normalizeTimestamp(record.actual_check_out_at) || new Date().toISOString(),
      createdBy: checkedOutBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "staying" || record.boarding_status === "checked_out") {
    for (const update of actualCareUpdates) {
      timeline.push({
        id: update.boarding_update_id,
        type: "CARE_UPDATE",
        title: buildUpdateTitleFromAlertLevel(update.alert_level),
        label: getCareUpdateLabel(update.alert_level),
        labelTone: getCareUpdateLabelTone(update.alert_level),
        description: update.update_note,
        createdAt: normalizeTimestamp(update.updated_at) || new Date().toISOString(),
        createdBy: update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null,
        source: "BOARDING_UPDATE",
        alertLevel: mapDbAlertLevelToDto(update.alert_level),
        attachmentUrls: normalizeAttachmentUrlsStaff(update.attachment_url)
      });
    }

    timeline.push({
      id: `${record.boarding_record_id}_check_in`,
      type: "CHECKED_IN",
      title: "Nhận thú cưng",
      label: record.boarding_status === "checked_out" ? "Đã hoàn tất lưu trú" : "Đang lưu trú",
      labelTone: "success",
      description: "Thú cưng đã được nhận tại trung tâm và bắt đầu thời gian lưu trú.",
      createdAt: normalizeTimestamp(record.actual_check_in_at) || normalizeTimestamp(record.planned_check_in_at) || new Date().toISOString(),
      createdBy: checkedInBy,
      source: "SYSTEM"
    });
  }

  if (record.boarding_status === "confirmed" || record.boarding_status === "staying" || record.boarding_status === "checked_out") {
    timeline.push({
      id: `${record.boarding_record_id}_confirmed`,
      type: "CONFIRMED",
      title: "Xác nhận lưu trú",
      label: record.boarding_status === "confirmed" ? "Chờ check-in" : "Đã check-in",
      labelTone: record.boarding_status === "confirmed" ? "info" : "success",
      description: "Nhân viên đã xác nhận yêu cầu lưu trú.",
      createdAt: normalizeTimestamp(record.created_at) || new Date().toISOString(),
      createdBy: confirmedBy,
      source: "SYSTEM"
    });
  }

  timeline.push({
    id: `${record.boarding_record_id}_created`,
    type: "CREATED",
    title: "Yêu cầu lưu trú được tạo",
    label: record.boarding_status === "pending" ? "Chờ xác nhận" : "Đã xác nhận",
    labelTone: record.boarding_status === "pending" ? "warning" : "success",
    description: "Chủ nuôi đã gửi yêu cầu lưu trú.",
    createdAt: normalizeTimestamp(record.created_at) || new Date().toISOString(),
    source: "SYSTEM"
  });

  return timeline;
}

export function mapStaffBoardingListItem(record: any): StaffBoardingListItemDto {
  const roomTypeName = getRoomTypeName(record);

  return {
    id: record.boarding_record_id,
    boardingCode: record.boarding_record_id,
    pet: {
      id: record.pet_id,
      name: record.pet_name,
      species: record.species,
      breed: record.breed,
      ageText: record.age_text,
      imageUrl: record.profile_image_url
    },
    owner: {
      id: record.owner_id,
      fullName: record.owner_name,
      phoneNumber: record.owner_phone,
      email: record.owner_email
    },
    room: {
      id: record.room_type_id || "unknown",
      code: roomTypeName,
      name: roomTypeName,
      roomType: roomTypeName
    },
    requestedRoomType: roomTypeName,
    checkInDate: toApiDateTime(record.planned_check_in_at),
    checkOutDate: toApiDateTime(record.planned_check_out_at),
    totalDays: calculateStayDays(new Date(record.planned_check_in_at), new Date(record.planned_check_out_at)),
    status: mapDbBoardingStatusToDto(record.boarding_status),
    paymentStatus: mapPaymentStatus(record),
    estimatedAmount: Number(record.estimated_total),
    finalAmount: record.boarding_status === "checked_out" ? Number(record.final_amount ?? record.estimated_total) : null,
    currency: "VND",
    specialRequest: record.care_request ?? null,
    latestUpdateAt: normalizeTimestamp(record.latest_update_at)
  };
}

export function mapStaffBoardingDetail(record: any, careUpdates: any[]): StaffBoardingDetailDto {
  const roomTypeName = getRoomTypeName(record);
  const mappedCareUpdates: StaffBoardingCareUpdateDto[] = careUpdates.map((update) => ({
    id: update.boarding_update_id,
    title: buildUpdateTitleFromAlertLevel(update.alert_level),
    description: update.update_note,
    alertLevel: mapDbAlertLevelToDto(update.alert_level),
    visibilityStatus: mapDbVisibilityStatusToDto(update.visibility_status),
    attachmentUrl: normalizeAttachmentUrlsStaff(update.attachment_url)[0] ?? null,
    attachmentUrls: normalizeAttachmentUrlsStaff(update.attachment_url),
    updatedAt: normalizeTimestamp(update.updated_at) || new Date().toISOString(),
    createdBy: update.created_by_user_id ? { id: update.created_by_user_id, fullName: update.created_by_full_name || "Nhân viên" } : null
  }));
  const paymentStatus = mapPaymentStatus(record);

  return {
    id: record.boarding_record_id,
    boardingCode: record.boarding_record_id,
    pet: {
      id: record.pet_id,
      name: record.pet_name,
      species: record.species,
      breed: record.breed,
      ageText: record.age_text,
      imageUrl: record.profile_image_url
    },
    owner: {
      id: record.owner_id,
      fullName: record.owner_name,
      phoneNumber: record.owner_phone,
      email: record.owner_email
    },
    room: {
      id: record.room_type_id || "unknown",
      code: roomTypeName,
      name: roomTypeName,
      roomType: roomTypeName
    },
    requestedRoomType: roomTypeName,
    checkInDate: toApiDateTime(record.planned_check_in_at),
    checkOutDate: toApiDateTime(record.planned_check_out_at),
    actualCheckInAt: normalizeTimestamp(record.actual_check_in_at),
    actualCheckOutAt: normalizeTimestamp(record.actual_check_out_at),
    currentDayLabel: buildCurrentDayLabel(record),
    totalDays: calculateStayDays(new Date(record.planned_check_in_at), new Date(record.planned_check_out_at)),
    status: mapDbBoardingStatusToDto(record.boarding_status),
    paymentStatus,
    estimatedAmount: Number(record.estimated_total),
    finalAmount: record.boarding_status === "checked_out" ? Number(record.final_amount ?? record.estimated_total) : null,
    currency: "VND",
    specialRequests: record.care_request ? [record.care_request] : [],
    note: null,
    rejectionReason: record.rejection_reason,
    payment: {
      paymentMethod: record.payment_option === "online" ? "ONLINE" : "AT_COUNTER",
      paymentStatus,
      amount: Number(record.final_amount ?? record.estimated_total),
      currency: "VND"
    },
    careUpdates: mappedCareUpdates,
    careLogs: mappedCareUpdates,
    timeline: buildStaffBoardingTimeline(record, careUpdates)
  };
}
