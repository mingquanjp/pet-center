import { AdminBoardingRoom, AdminBoardingRoomFilters, AdminBoardingRoomStats, AdminBoardingRoomCapacityLevel, AdminBoardingRoomStatus } from "../types/room.types";

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function calculateOccupancyRate(room: AdminBoardingRoom): number {
  if (room.capacity <= 0) return 0;
  return Math.round((room.currentOccupancy / room.capacity) * 100);
}

export function getCapacityLevel(room: AdminBoardingRoom): AdminBoardingRoomCapacityLevel {
  const rate = calculateOccupancyRate(room);
  if (rate >= 100) return "FULL";
  if (rate >= 70) return "NEAR_FULL";
  return "AVAILABLE";
}

export function getCapacityLevelLabel(level: AdminBoardingRoomCapacityLevel): string {
  switch (level) {
    case "AVAILABLE": return "Còn chỗ";
    case "NEAR_FULL": return "Gần đầy";
    case "FULL": return "Đã đầy";
    default: return "";
  }
}

export function getStatusLabel(status: AdminBoardingRoomStatus): string {
  return status === "active" ? "Đang hoạt động" : "Tạm ngưng";
}

export function getStatusBadgeClass(status: AdminBoardingRoomStatus): string {
  return status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-gray-200 text-gray-800";
}

export function filterAdminBoardingRooms(rooms: AdminBoardingRoom[], filters: AdminBoardingRoomFilters): AdminBoardingRoom[] {
  return rooms.filter((room) => {
    // Search
    const searchLower = filters.search.toLowerCase();
    const matchSearch =
      !filters.search ||
      room.code.toLowerCase().includes(searchLower) ||
      room.name.toLowerCase().includes(searchLower) ||
      (room.description && room.description.toLowerCase().includes(searchLower));

    // Status
    const matchStatus = filters.status === "ALL" || room.status === filters.status;

    // Capacity Level
    const capacityLevel = getCapacityLevel(room);
    const matchCapacity = filters.capacityLevel === "ALL" || capacityLevel === filters.capacityLevel;

    // Price
    let matchPrice = true;
    if (filters.priceRange !== "ALL") {
      if (filters.priceRange === "UNDER_200K") matchPrice = room.boardingUnitPrice < 200000;
      else if (filters.priceRange === "FROM_200K_TO_400K") matchPrice = room.boardingUnitPrice >= 200000 && room.boardingUnitPrice <= 400000;
      else if (filters.priceRange === "OVER_400K") matchPrice = room.boardingUnitPrice > 400000;
    }

    return matchSearch && matchStatus && matchCapacity && matchPrice;
  });
}

export function calculateAdminBoardingRoomStats(rooms: AdminBoardingRoom[]): AdminBoardingRoomStats {
  let active = 0;
  let inactive = 0;
  let stayingPets = 0;
  let totalCapacity = 0;

  rooms.forEach((room) => {
    if (room.status === "active") active++;
    else inactive++;
    
    stayingPets += room.currentOccupancy;
    totalCapacity += room.capacity;
  });

  return {
    totalRoomTypes: rooms.length,
    activeRoomTypes: active,
    inactiveRoomTypes: inactive,
    stayingPets,
    todayOccupancyRate: totalCapacity > 0 ? Math.round((stayingPets / totalCapacity) * 100) : 0,
  };
}
