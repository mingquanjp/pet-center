"use client";

import React, { useState } from "react";
import { Bed, PawPrint, Home, ShieldCheck, PauseCircle, Eye, Pencil, Trash2, Plus, Search, BarChart3, AlertCircle, SearchX, RotateCcw } from "lucide-react";
import { useAdminBoardingRooms } from "../../hooks/useAdminBoardingRooms";
import { formatVnd, getStatusBadgeClass } from "../../utils/room-format";
import { AdminBoardingRoom, AdminBoardingRoomFilters } from "../../types/room.types";
import { AdminRoomStatCard } from "../../components/admin/AdminRoomStatCard";
import { AdminRoomCard } from "../../components/admin/AdminRoomCard";
import { AdminRoomFormDialog } from "../../components/admin/AdminRoomFormDialog";
import { AdminRoomDetailDialog } from "../../components/admin/AdminRoomDetailDialog";
import { AdminRoomDeleteDialog } from "../../components/admin/AdminRoomDeleteDialog";
export function AdminBoardingRoomsPage() {
  const {
    filteredRooms,
    stats,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    viewMode,
    createRoom,
    updateRoom,
    toggleStatus,
    deleteRoom,
  } = useAdminBoardingRooms();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<AdminBoardingRoom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<AdminBoardingRoom | null>(null);

  const handleOpenCreate = () => {
    setSelectedRoom(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: AdminBoardingRoom) => {
    setSelectedRoom(room);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (room: AdminBoardingRoom) => {
    setSelectedRoom(room);
    setIsDetailOpen(true);
  };

  const handleDelete = async (room: AdminBoardingRoom) => {
    if (room.currentOccupancy > 0) {
      alert("Không thể xóa loại phòng đang có thú cưng lưu trú.");
      return;
    }
    setRoomToDelete(room);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="heading-lg text-petcenter-text tracking-tight">Quản lý Phòng lưu trú</h2>
          <p className="body-md text-petcenter-text-secondary mt-1">
            Quản lý loại phòng, sức chứa, giá lưu trú và tình trạng sử dụng phòng trong trung tâm.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleOpenCreate}
            className="bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-white px-5 rounded-[12px] text-[14px] font-medium transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap h-9"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm phòng lưu trú</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-5 w-full">
        <AdminRoomStatCard title="Tổng loại phòng" value={stats.totalRoomTypes} icon={<Home className="w-5 h-5 text-petcenter-primary" />} color="bg-petcenter-info-bg" />
        <AdminRoomStatCard title="Đang hoạt động" value={stats.activeRoomTypes} icon={<ShieldCheck className="w-5 h-5 text-petcenter-success-text" />} color="bg-petcenter-success-bg" />
        <AdminRoomStatCard title="Tạm ngưng" value={stats.inactiveRoomTypes} icon={<PauseCircle className="w-5 h-5 text-petcenter-text-muted" />} color="bg-stone-100" />
        <AdminRoomStatCard title="Thú cưng đang lưu trú" value={stats.stayingPets} icon={<PawPrint className="w-5 h-5 text-petcenter-cta" />} color="bg-petcenter-cta/15" />

        <div className="h-26 p-5 bg-petcenter-primary rounded-2xl shadow-sm border border-petcenter-border flex flex-col justify-between items-start">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-white/90" />
            <span className="text-white/90 text-sm font-medium">Hiệu suất sử dụng</span>
          </div>
          <div className="w-full mt-1">
            <div className="flex items-end gap-2 mb-1.5">
              <span className="text-white text-2xl font-bold leading-none">{stats.todayOccupancyRate}%</span>
            </div>
            <div className="w-full h-1.5 relative bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stats.todayOccupancyRate}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Card */}
      <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-petcenter-border mb-6">
        <div className="flex flex-wrap items-center gap-4 w-full">
          {/* Search Input */}
          <div className="relative flex-[2] min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-petcenter-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm mã phòng, loại phòng..."
              className="w-full pl-9 pr-3 py-2.5 bg-petcenter-background body-md border border-petcenter-border rounded-xl focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary placeholder:text-petcenter-text-secondary text-petcenter-text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Trạng thái:</span>
            <select
              className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as AdminBoardingRoomFilters["status"] })}
            >
              <option value="ALL">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </label>

          <label className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Hiệu suất:</span>
            <select
              className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
              value={filters.capacityLevel}
              onChange={(e) => setFilters({ ...filters, capacityLevel: e.target.value as AdminBoardingRoomFilters["capacityLevel"] })}
            >
              <option value="ALL">Tất cả</option>
              <option value="AVAILABLE">Còn chỗ</option>
              <option value="NEAR_FULL">Gần đầy</option>
              <option value="FULL">Đã đầy</option>
            </select>
          </label>

          <label className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-sm font-medium text-petcenter-text-secondary whitespace-nowrap">Giá/ngày:</span>
            <select
              className="flex-1 min-w-0 w-full py-2.5 px-3 bg-petcenter-background body-md border border-petcenter-border rounded-xl text-petcenter-text focus:outline-none focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary"
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value as AdminBoardingRoomFilters["priceRange"] })}
            >
              <option value="ALL">Tất cả</option>
              <option value="UNDER_200K">Dưới 200.000đ</option>
              <option value="FROM_200K_TO_400K">200.000đ - 400.000đ</option>
              <option value="OVER_400K">Trên 400.000đ</option>
            </select>
          </label>

          <button onClick={resetFilters} className="shrink-0 p-2.5 px-5 gap-2 bg-petcenter-background text-petcenter-text-secondary border border-petcenter-border rounded-xl hover:bg-petcenter-border hover:text-petcenter-text transition-colors flex items-center justify-center body-md font-medium">
            <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`relative flex-1 transition-opacity duration-200 ${loading && filteredRooms.length > 0 ? "opacity-50 pointer-events-none" : ""}`}>
        {loading && filteredRooms.length === 0 ? (
          <div className="w-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petcenter-primary"></div>
          </div>
        ) : error ? (
          <div className="w-full text-center py-12 text-red-500 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <span>{error}</span>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
            <div className="relative w-20 h-20 rounded-full bg-petcenter-info-bg flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-petcenter-primary" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-petcenter-card rounded-full flex items-center justify-center shadow-sm border border-petcenter-border">
                <Bed className="w-4 h-4 text-petcenter-text-muted" />
              </div>
            </div>
            <h3 className="heading-sm text-petcenter-text mb-2">Không tìm thấy phòng lưu trú</h3>
            <p className="body-md text-petcenter-text-secondary mb-6">
              Thử thay đổi bộ lọc hoặc thêm loại phòng mới.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-petcenter-primary text-white rounded-[0.75rem] body-md font-medium hover:bg-petcenter-primary-hover transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Đặt lại bộ lọc
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
            {filteredRooms.map((room) => (
              <AdminRoomCard
                key={room.id}
                room={room}
                onDetail={() => handleOpenDetail(room)}
                onEdit={() => handleOpenEdit(room)}
                onToggle={() => toggleStatus(room.id)}
                onDelete={() => handleDelete(room)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl shadow-card border border-petcenter-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-petcenter-filter border-b border-petcenter-border">
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider">Mã</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider">Loại phòng</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider">Sức chứa</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider">Đang sử dụng</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider text-right">Giá/ngày</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-4 text-xs font-semibold text-petcenter-text-secondary uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => {
                  const isActive = room.status === "active";
                  return (
                    <tr key={room.id} className="border-b border-petcenter-border hover:bg-petcenter-filter/50 h-[72px] transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-petcenter-text-muted">{room.code}</td>
                      <td className="px-5 py-3 text-sm text-petcenter-text font-semibold max-w-[200px] truncate">{room.name}</td>
                      <td className="px-5 py-3 text-sm text-petcenter-text font-medium">{room.capacity}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-petcenter-primary">{room.currentOccupancy}/{room.capacity}</td>
                      <td className="px-5 py-3 text-sm font-bold text-petcenter-primary text-right">{formatVnd(room.boardingUnitPrice).replace("₫", "đ")}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadgeClass(room.status)}`}>
                          {isActive ? "Đang hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="px-5 py-3 flex items-center justify-end gap-1.5 h-[72px]">
                        <button onClick={() => handleOpenDetail(room)} title="Xem chi tiết" className="w-9 h-9 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(room)} title="Chỉnh sửa" className="w-9 h-9 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-text-secondary hover:bg-petcenter-background hover:text-petcenter-primary transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(room)} title="Xóa" disabled={room.currentOccupancy > 0} className="w-9 h-9 rounded-lg border border-petcenter-border flex items-center justify-center text-petcenter-danger-text hover:bg-petcenter-danger-bg disabled:opacity-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isFormOpen && (
        <AdminRoomFormDialog
          room={selectedRoom}
          onClose={() => setIsFormOpen(false)}
          onSave={async (data) => {
            if (selectedRoom) await updateRoom({ ...data, id: selectedRoom.id } as Parameters<typeof updateRoom>[0]);
            else await createRoom(data as Parameters<typeof createRoom>[0]);
            setIsFormOpen(false);
          }}
        />
      )}

      {roomToDelete && (
        <AdminRoomDeleteDialog
          room={roomToDelete}
          onClose={() => setRoomToDelete(null)}
          onConfirm={async () => {
            await deleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }}
        />
      )}

      {isDetailOpen && selectedRoom && (
        <AdminRoomDetailDialog
          room={selectedRoom}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleOpenEdit(selectedRoom);
          }}
        />
      )}
    </div>
  );
}


