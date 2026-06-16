import { useState, useCallback, useEffect } from "react";
import * as api from "../api/notifications.api";
import type { AppNotification } from "../types/notification.types";
import { useNotificationSocket } from "./useNotificationSocket";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasLoadedInit, setHasLoadedInit] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getNotifications({ limit: 20 });
      setNotifications(data.items);
      setHasLoadedInit(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewNotification = useCallback((notification: AppNotification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (notification.notificationStatus === "unread") {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  useNotificationSocket({
    onNotification: handleNewNotification
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchUnreadCount().catch(console.error);
    }
  }, [fetchUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    const item = notifications.find((n) => n.id === notificationId);
    if (!item || item.notificationStatus === "read") return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, notificationStatus: "read" } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.markAsRead(notificationId);
    } catch (err) {
      // Revert if error
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, notificationStatus: "unread" } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, notificationStatus: "read" }))
    );
    setUnreadCount(0);

    try {
      await api.markAllAsRead();
    } catch (err) {
      void fetchUnreadCount();
      void fetchNotifications();
    }
  };

  const setDropdownOpen = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open && !hasLoadedInit) {
      void fetchNotifications();
    }
  };

  const closeDropdown = () => setIsDropdownOpen(false);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isDropdownOpen,
    setDropdownOpen,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}
