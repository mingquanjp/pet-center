"use client"

import * as React from "react"
import { Bell, CircleHelp, Search } from "lucide-react"

type SessionUser = {
  fullName: string;
  role: string;
};

function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "NV";

  return words
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as SessionUser;
  } catch {
    return null;
  }
}

export function StaffHeader() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const fullName = user?.fullName ?? "";
  const initials = fullName ? getInitials(fullName) : "NV";
  const roleLabel = user?.role === "ADMIN" ? "Admin" : "Nhân viên";

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUser(getSessionUser());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <header className="z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#bdc9c5] bg-[#fbfaee] px-6 pb-[9px] pt-2 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="min-w-px flex-1">
        <label className="relative block w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-[#3e4946]" />
          <input
            className="h-[37px] w-full rounded-[12px] border-0 bg-[#e4e3d7] pl-10 pr-4 text-sm font-normal leading-normal text-[#3e4946] outline-none placeholder:text-[#3e4946]"
            placeholder="Tìm kiếm lịch hẹn, thú cưng, chủ nuôi..."
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex size-9 items-center justify-center rounded-full text-[#3e4946] transition-colors hover:bg-[#e4e3d7]">
          <Bell className="h-5 w-4" />
          <span className="absolute right-[8px] top-2 size-2 rounded-full bg-[#fea619]" />
        </button>
        <button className="flex size-9 items-center justify-center rounded-full text-[#3e4946] transition-colors hover:bg-[#e4e3d7]">
          <CircleHelp className="size-5" />
        </button>
        <div className="h-8 w-px bg-[#bdc9c5]" />
        <button className="flex items-center gap-2 rounded-full">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#00796b] text-center text-sm font-bold leading-5 text-[#a1feec]">
            {initials}
          </span>
          <span className="flex flex-col items-start">
            <span className="whitespace-nowrap text-center text-xs font-semibold leading-[15px] text-[#1b1c15]">
              {fullName}
            </span>
            <span className="whitespace-nowrap text-center text-[10px] font-normal leading-[12.5px] text-[#3e4946]">
              {roleLabel}
            </span>
          </span>
        </button>
      </div>
    </header>
  )
}
