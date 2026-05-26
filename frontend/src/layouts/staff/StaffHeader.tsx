"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { clearAuthSession } from "@/features/auth/api/auth-session";

const notifications = [
  {
    title: "Lịch khám P-102 chờ xác nhận",
    time: "5 phút trước",
  },
  {
    title: "Milo cần check-in lưu trú lúc 09:30",
    time: "18 phút trước",
  },
  {
    title: "Hóa đơn INV-2041 đã thanh toán tại quầy",
    time: "32 phút trước",
  },
];

export function StaffHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthSession();
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <header className="z-10 flex h-[72px] w-full shrink-0 items-center justify-between border-b border-petcenter-border bg-[#FBFAEE] px-6 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative hidden w-full max-w-[520px] md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
          <Input
            aria-label="Tìm kiếm nhanh"
            placeholder="Tìm kiếm lịch hẹn, thú cưng, chủ nuôi..."
            className="h-11 rounded-control border-petcenter-border-strong bg-white pl-10 text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Trợ giúp"
          className="h-10 w-10 rounded-full text-petcenter-text-secondary hover:bg-petcenter-sidebar hover:text-petcenter-primary"
        >
          <CircleHelp className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Thông báo"
              className="relative h-10 w-10 rounded-full text-petcenter-text-secondary hover:bg-petcenter-sidebar hover:text-petcenter-primary"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#FBFAEE] bg-petcenter-cta" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 rounded-control border-petcenter-border-strong bg-white p-2 shadow-modal"
          >
            <DropdownMenuLabel className="flex items-center justify-between text-petcenter-text">
              <span>Thông báo gần đây</span>
              <span className="rounded-pill bg-petcenter-warning-bg px-2 py-0.5 text-xs font-medium text-petcenter-warning-text">
                3 mới
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.title}
                className="flex cursor-pointer flex-col items-start gap-1 rounded-control px-3 py-2 focus:bg-petcenter-filter"
              >
                <span className="text-sm font-medium text-petcenter-text">
                  {notification.title}
                </span>
                <span className="text-xs text-petcenter-text-muted">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/staff/notifications"
                className="cursor-pointer justify-center rounded-control text-sm font-semibold text-petcenter-primary focus:text-petcenter-primary"
              >
                Xem tất cả
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full border border-petcenter-border-strong bg-white py-1 pl-1 pr-3 text-left transition-colors hover:bg-petcenter-filter">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-petcenter-primary text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 md:block">
                <span className="block truncate text-sm font-semibold text-petcenter-text">
                  Nguyễn Minh An
                </span>
                <span className="flex items-center gap-1 text-xs text-petcenter-text-secondary">
                  <ShieldCheck className="h-3.5 w-3.5 text-petcenter-primary" />
                  Nhân viên
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-petcenter-text-muted md:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-control border-petcenter-border-strong bg-white shadow-modal"
          >
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/staff/profile" className="cursor-pointer">
                Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Đổi mật khẩu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-petcenter-danger-text focus:text-petcenter-danger-text"
              onSelect={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
