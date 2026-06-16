export type AdminBoardingRoomStatus = "active" | "inactive";

export type AdminBoardingRoomCapacityLevel =
  | "AVAILABLE"
  | "NEAR_FULL"
  | "FULL";

export interface AdminBoardingRoom {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  capacity: number;
  currentOccupancy: number;
  availableSlots?: number;
  occupancyRate?: number;
  capacityLevel?: AdminBoardingRoomCapacityLevel;
  boardingUnitPrice: number;
  status: AdminBoardingRoomStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBoardingRoomStats {
  totalRoomTypes: number;
  activeRoomTypes: number;
  inactiveRoomTypes: number;
  stayingPets: number;
  totalCapacity?: number;
  todayOccupancyRate: number;
}

export interface AdminBoardingRoomsApiResponse {
  items: AdminBoardingRoom[];
  stats: AdminBoardingRoomStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminBoardingRoomFilters {
  search: string;
  status: "ALL" | AdminBoardingRoomStatus;
  capacityLevel: "ALL" | AdminBoardingRoomCapacityLevel;
  priceRange: "ALL" | "UNDER_200K" | "FROM_200K_TO_400K" | "OVER_400K";
}

export interface CreateAdminBoardingRoomPayload {
  name: string;
  description?: string | null;
  capacity: number;
  boardingUnitPrice: number;
  status: AdminBoardingRoomStatus;
}

export interface UpdateAdminBoardingRoomPayload {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  boardingUnitPrice: number;
  status: AdminBoardingRoomStatus;
}

export interface AdminBoardingRoomUsageRecord {
  id: string;
  boardingCode: string;
  roomTypeId: string;
  petName: string;
  petSpecies: "Dog" | "Cat" | "Other";
  ownerName: string;
  plannedCheckInAt: string;
  plannedCheckOutAt: string;
  actualCheckInAt?: string | null;
  actualCheckOutAt?: string | null;
  totalDays: number;
  boardingStatus:
    | "pending_payment"
    | "pending"
    | "confirmed"
    | "staying"
    | "checked_out"
    | "rejected"
    | "cancelled";
  paymentStatus: "paid" | "unpaid";
  totalAmount: number;
}

export interface AdminBoardingRoomUsageFilters {
  search: string;
  boardingStatus: "ALL" | AdminBoardingRoomUsageRecord["boardingStatus"];
  paymentStatus: "ALL" | AdminBoardingRoomUsageRecord["paymentStatus"];
}
