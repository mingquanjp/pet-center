import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { AppNotification } from "../types/notification.types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
  : "http://localhost:8080";

interface UseNotificationSocketProps {
  enabled?: boolean;
  onNotification?: (notification: AppNotification) => void;
}

export function useNotificationSocket({ enabled = true, onNotification }: UseNotificationSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,
      path: "/socket.io"
    });

    socket.on("connect", () => {
      console.log("Notification socket connected");
    });

    socket.on("notification:new", (notification: AppNotification) => {
      if (onNotification) {
        onNotification(notification);
      }
    });

    socket.on("disconnect", () => {
      console.log("Notification socket disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, onNotification]);
}
