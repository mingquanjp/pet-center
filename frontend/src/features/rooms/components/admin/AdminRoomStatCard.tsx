import React from "react";

export function AdminRoomStatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="h-26 p-5 bg-white rounded-2xl shadow-sm border border-petcenter-border flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <span className="text-petcenter-text-secondary text-sm font-medium">{title}</span>
      </div>
      <div className="text-petcenter-text text-2xl font-bold">{value}</div>
    </div>
  );
}
