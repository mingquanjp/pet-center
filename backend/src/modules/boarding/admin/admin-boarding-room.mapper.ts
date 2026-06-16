import type {
  AdminBoardingPaymentStatus,
  AdminBoardingRoomCapacityLevel,
  AdminBoardingRoomStatus
} from "../boarding.types.js";

export function formatRoomTypeCode(roomTypeId: string, index?: number): string {
  if (index !== undefined) {
    return `RT-${String(index + 1).padStart(3, '0')}`;
  }
  const numericSuffix = roomTypeId.match(/^rt([0-9]+)$/i)?.[1];
  const suffix = numericSuffix ?? roomTypeId.slice(-3);
  return `RT-${suffix.padStart(3, "0")}`;
}

export function mapAdminBoardingRoomListRow(row: any, index: number) {
  const capacity = Number(row.capacity);
  const currentOccupancy = Number(row.current_occupancy);
  const availableSlots = Math.max(capacity - currentOccupancy, 0);
  const occupancyRate = capacity > 0 ? Math.round((currentOccupancy / capacity) * 100) : 0;
  
  let capacityLevel: AdminBoardingRoomCapacityLevel = "AVAILABLE";
  if (occupancyRate >= 100) {
    capacityLevel = "FULL";
  } else if (occupancyRate >= 70) {
    capacityLevel = "NEAR_FULL";
  }

  return {
    id: row.room_type_id,
    code: formatRoomTypeCode(row.room_type_id, index),
    name: row.room_type_name,
    description: row.description,
    capacity,
    currentOccupancy,
    availableSlots,
    occupancyRate,
    capacityLevel,
    boardingUnitPrice: Number(row.boarding_unit_price),
    status: row.room_type_status as AdminBoardingRoomStatus
  };
}

export function mapAdminBoardingRoomUsageHistoryRow(row: any) {
  const plannedCheckIn = new Date(row.planned_check_in_at);
  const plannedCheckOut = new Date(row.planned_check_out_at);
  const diffTime = Math.abs(plannedCheckOut.getTime() - plannedCheckIn.getTime());
  const totalDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

  let paymentStatus = "unpaid";
  if (row.invoice_status === "paid") paymentStatus = "paid";

  return {
    id: row.boarding_record_id,
    boardingCode: row.boarding_record_id,
    roomTypeId: row.room_type_id,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    ownerName: row.owner_name,
    plannedCheckInAt: row.planned_check_in_at,
    plannedCheckOutAt: row.planned_check_out_at,
    actualCheckInAt: row.actual_check_in_at,
    actualCheckOutAt: row.actual_check_out_at,
    totalDays,
    boardingStatus: row.boarding_status,
    paymentStatus: paymentStatus as AdminBoardingPaymentStatus,
    totalAmount: Number(row.invoice_total) > 0 ? Number(row.invoice_total) : Number(row.estimated_total)
  };
}
