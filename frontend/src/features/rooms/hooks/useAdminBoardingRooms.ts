import { useState, useEffect, useCallback } from "react";
import { AdminBoardingRoom, AdminBoardingRoomFilters, CreateAdminBoardingRoomPayload, UpdateAdminBoardingRoomPayload, AdminBoardingRoomStats } from "../types/room.types";
import { adminBoardingRoomsApi } from "../api/rooms.api";

export function useAdminBoardingRooms() {
  const [rooms, setRooms] = useState<AdminBoardingRoom[]>([]);
  const [stats, setStats] = useState<AdminBoardingRoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AdminBoardingRoomFilters>({
    search: "",
    status: "ALL",
    capacityLevel: "ALL",
    priceRange: "ALL",
  });

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminBoardingRoomsApi.getRooms(filters);
      setRooms(data.items);
      setStats(data.stats);
    } catch (err) {
      setError("Không thể tải danh sách phòng lưu trú.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRooms]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "ALL",
      capacityLevel: "ALL",
      priceRange: "ALL",
    });
  }, []);

  const createRoom = async (payload: CreateAdminBoardingRoomPayload) => {
    const newRoom = await adminBoardingRoomsApi.createRoom(payload);
    setRooms(prev => [newRoom, ...prev]);
  };

  const updateRoom = async (payload: UpdateAdminBoardingRoomPayload) => {
    const updated = await adminBoardingRoomsApi.updateRoom(payload);
    setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const toggleStatus = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const newStatus = room.status === "active" ? "inactive" : "active";
    const updated = await adminBoardingRoomsApi.toggleRoomStatus(roomId, newStatus);
    setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const deleteRoom = async (roomId: string) => {
    await adminBoardingRoomsApi.deleteRoom(roomId);
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  return {
    rooms,
    filteredRooms: rooms,
    stats: stats || { totalRoomTypes: 0, activeRoomTypes: 0, inactiveRoomTypes: 0, stayingPets: 0, totalCapacity: 0, todayOccupancyRate: 0 },
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    viewMode,
    setViewMode,
    createRoom,
    updateRoom,
    toggleStatus,
    deleteRoom,
    refreshRooms: fetchRooms
  };
}
