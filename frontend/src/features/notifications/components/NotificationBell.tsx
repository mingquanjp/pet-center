import React from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { useNotifications } from "../hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppNotification } from "../types/notification.types";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isDropdownOpen,
    setDropdownOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (notification: AppNotification) => {
    if (notification.notificationStatus === "unread") {
      await markAsRead(notification.id);
    }
    setDropdownOpen(false);
  };

  return (
    <Popover open={isDropdownOpen} onOpenChange={setDropdownOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative size-12 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 outline-none hover:bg-muted/50">
          <Bell className="size-7 text-petcenter-text" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 bg-white z-50 border border-petcenter-border-strong shadow-lg focus-visible:ring-0 focus:ring-0 ring-0 outline-none" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold text-sm">Thông báo</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-auto p-0"
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const isUnread = notification.notificationStatus === "unread";
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex flex-col gap-1 border-b px-4 py-3 text-left transition-colors focus-visible:ring-0 focus:ring-0 ring-0 outline-none",
                      isUnread
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "bg-white opacity-60 hover:bg-muted/40 hover:opacity-80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm leading-tight",
                          isUnread ? "font-semibold text-petcenter-text" : "font-medium text-petcenter-text-secondary"
                        )}
                      >
                        {notification.title}
                      </span>
                      {isUnread && (
                        <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
