import React, { useState, useEffect, useMemo } from "react";
import { AdminBoardingRoom, AdminBoardingRoomUsageRecord, AdminBoardingRoomUsageFilters } from "../../types/room.types";
import { formatVnd, calculateOccupancyRate } from "../../utils/room-format";
import { X, Search, FileText, History } from "lucide-react";
import { adminBoardingRoomsApi } from "../../api/rooms.api";

// Helper for date formatting
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function AdminRoomDetailDialog({ room, onClose }: { room: AdminBoardingRoom, onClose: () => void, onEdit: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [records, setRecords] = useState<AdminBoardingRoomUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for History Tab
  const [filters, setFilters] = useState<AdminBoardingRoomUsageFilters>({
    search: "",
    boardingStatus: "ALL",
    paymentStatus: "ALL"
  });

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await adminBoardingRoomsApi.getRoomUsageHistory(room.id);
        setRecords(data);
      } catch (error) {
        console.error("Failed to load usage history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [room.id]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = filters.search === "" || 
        r.boardingCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.petName.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchBoardingStatus = filters.boardingStatus === "ALL" || r.boardingStatus === filters.boardingStatus;
      const matchPaymentStatus = filters.paymentStatus === "ALL" || r.paymentStatus === filters.paymentStatus;

      return matchSearch && matchBoardingStatus && matchPaymentStatus;
    });
  }, [records, filters]);

  // Derived Stats for Overview Tab
  const stats = useMemo(() => {
    const totalStay = records.length;
    const staying = records.filter(r => r.boardingStatus === "staying").length;
    const checkedOut = records.filter(r => r.boardingStatus === "checked_out").length;
    const cancelled = records.filter(r => r.boardingStatus === "cancelled" || r.boardingStatus === "rejected").length;
    const revenue = records.filter(r => r.paymentStatus === "paid").reduce((sum, r) => sum + r.totalAmount, 0);
    return { totalStay, staying, checkedOut, cancelled, revenue };
  }, [records]);

  const occRate = calculateOccupancyRate(room);

  // Status mapping
  const boardingStatusMap: Record<string, { label: string, color: string }> = {
    pending_payment: { label: "Chờ thanh toán", color: "bg-orange-100 text-orange-700" },
    pending: { label: "Chờ xác nhận", color: "bg-orange-100 text-orange-700" },
    confirmed: { label: "Chờ check-in", color: "bg-blue-100 text-blue-700" },
    staying: { label: "Đang lưu trú", color: "bg-green-100 text-green-700" },
    checked_out: { label: "Đã trả thú cưng", color: "bg-stone-100 text-stone-600" },
    rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
    cancelled: { label: "Đã hủy", color: "bg-stone-100 text-stone-500" },
  };

  const paymentStatusMap: Record<string, { label: string, color: string }> = {
    paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
    unpaid: { label: "Chưa thanh toán", color: "bg-orange-100 text-orange-700" },
    refunded: { label: "Đã hoàn tiền", color: "bg-stone-100 text-stone-600" },
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-250 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-petcenter-border bg-stone-50/50 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-petcenter-text">{room.name}</h2>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${room.status === "active" ? "bg-petcenter-success-bg text-petcenter-success-text" : "bg-stone-200 text-stone-500"}`}>
                  {room.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-petcenter-text-muted">
                <span className="font-semibold px-2 py-0.5 bg-stone-200 rounded-md text-stone-600 uppercase text-xs">{room.code}</span>
                <span>•</span>
                <span>{room.description || "Không có mô tả"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-petcenter-border text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mt-2 border-b border-petcenter-border px-2">
            {[
              { id: "overview", label: "Tổng quan", icon: FileText },
              { id: "history", label: "Lịch sử sử dụng", icon: History },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "history")}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? "border-petcenter-primary text-petcenter-primary" : "border-transparent text-petcenter-text-muted hover:text-petcenter-text"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Info Card */}
                <div className="bg-white border border-petcenter-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-petcenter-text uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Thông tin phòng</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Mã loại phòng</span><span className="font-semibold">{room.code}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Tên loại phòng</span><span className="font-semibold">{room.name}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Trạng thái</span><span className="font-semibold">{room.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Giá / ngày</span><span className="font-bold text-petcenter-primary">{formatVnd(room.boardingUnitPrice).replace("₫", "đ")}</span></div>
                  </div>
                </div>

                {/* Capacity Card */}
                <div className="bg-white border border-petcenter-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-petcenter-text uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Hiệu suất sử dụng</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-petcenter-text">{occRate}%</span>
                    <span className="text-xs font-semibold text-stone-500 uppercase bg-stone-100 px-2 py-1 rounded-md">Hiệu suất</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-petcenter-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(occRate, 100)}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-stone-100 pt-3">
                    <div>
                      <div className="text-xs text-stone-500 mb-1">Sức chứa</div>
                      <div className="font-bold">{room.capacity}</div>
                    </div>
                    <div className="border-x border-stone-100">
                      <div className="text-xs text-stone-500 mb-1">Đang dùng</div>
                      <div className="font-bold">{room.currentOccupancy}</div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 mb-1">Còn trống</div>
                      <div className={`font-bold ${room.capacity - room.currentOccupancy <= 0 ? 'text-petcenter-cta' : 'text-petcenter-success-text'}`}>{room.capacity - room.currentOccupancy}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Stats from Usage */}
              <h3 className="text-sm font-bold text-petcenter-text uppercase tracking-wider mb-1 mt-2">Thống kê lịch sử sử dụng</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white border border-petcenter-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-stone-500 uppercase font-semibold mb-1">Tổng lượt</span>
                  <span className="text-xl font-bold">{stats.totalStay}</span>
                </div>
                <div className="bg-white border border-petcenter-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-stone-500 uppercase font-semibold mb-1">Đang lưu trú</span>
                  <span className="text-xl font-bold text-petcenter-primary">{stats.staying}</span>
                </div>
                <div className="bg-white border border-petcenter-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-stone-500 uppercase font-semibold mb-1">Đã trả</span>
                  <span className="text-xl font-bold text-petcenter-success-text">{stats.checkedOut}</span>
                </div>
                <div className="bg-white border border-petcenter-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-stone-500 uppercase font-semibold mb-1">Đã hủy/Từ chối</span>
                  <span className="text-xl font-bold text-stone-400">{stats.cancelled}</span>
                </div>
                <div className="border border-petcenter-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center bg-petcenter-primary/5">
                  <span className="text-xs text-petcenter-primary uppercase font-semibold mb-1">Doanh thu (Ước tính)</span>
                  <span className="text-xl font-bold text-petcenter-primary">{formatVnd(stats.revenue).replace("₫", "đ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-4 h-full">
              {/* Filter Bar */}
              <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-petcenter-border shadow-sm">
                <div className="relative flex-1 min-w-50">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm mã lưu trú, thú cưng, chủ nuôi..." 
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-petcenter-primary/20 outline-none transition-all"
                    value={filters.search}
                    onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <select 
                  className="px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white outline-none min-w-37.5"
                  value={filters.boardingStatus}
                  onChange={e => setFilters(prev => ({ ...prev, boardingStatus: e.target.value as AdminBoardingRoomUsageFilters["boardingStatus"] }))}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="pending_payment">Chờ thanh toán</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Chờ check-in</option>
                  <option value="staying">Đang lưu trú</option>
                  <option value="checked_out">Đã trả thú cưng</option>
                  <option value="rejected">Từ chối</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <select 
                  className="px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white outline-none min-w-37.5"
                  value={filters.paymentStatus}
                  onChange={e => setFilters(prev => ({ ...prev, paymentStatus: e.target.value as AdminBoardingRoomUsageFilters["paymentStatus"] }))}
                >
                  <option value="ALL">Tất cả thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white border border-petcenter-border rounded-xl shadow-sm overflow-hidden flex-1">
                {loading ? (
                  <div className="p-10 text-center text-stone-500 text-sm">Đang tải dữ liệu...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-3">
                      <History className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-petcenter-text mb-1">Chưa có lịch sử sử dụng</h3>
                    <p className="text-sm text-petcenter-text-secondary">Loại phòng này chưa có lượt lưu trú nào phù hợp.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-stone-50 border-b border-petcenter-border text-xs uppercase font-bold text-stone-500">
                        <tr>
                          <th className="px-4 py-3">Mã lưu trú</th>
                          <th className="px-4 py-3">Thú cưng</th>
                          <th className="px-4 py-3">Chủ nuôi</th>
                          <th className="px-4 py-3">Thời gian</th>
                          <th className="px-4 py-3 text-center">Số ngày</th>
                          <th className="px-4 py-3">Lưu trú</th>
                          <th className="px-4 py-3">Thanh toán</th>
                          <th className="px-4 py-3 text-right">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-petcenter-border">
                        {filteredRecords.map(r => (
                          <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-petcenter-text">{r.boardingCode}</td>
                            <td className="px-4 py-3 text-petcenter-text">{r.petName} <span className="text-xs text-stone-400">({r.petSpecies})</span></td>
                            <td className="px-4 py-3 text-petcenter-text">{r.ownerName}</td>
                            <td className="px-4 py-3 text-stone-600 text-xs">
                              {formatDate(r.plannedCheckInAt)} - {formatDate(r.plannedCheckOutAt)}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{r.totalDays}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-[11px] font-bold rounded-md ${boardingStatusMap[r.boardingStatus]?.color || "bg-stone-100"}`}>
                                {boardingStatusMap[r.boardingStatus]?.label || r.boardingStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-[11px] font-bold rounded-md ${paymentStatusMap[r.paymentStatus]?.color || "bg-stone-100"}`}>
                                {paymentStatusMap[r.paymentStatus]?.label || r.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-petcenter-primary">
                              {formatVnd(r.totalAmount).replace("₫", "đ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}



        </div>
      </div>
    </div>
  );
}
