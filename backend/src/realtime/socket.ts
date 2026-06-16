import { Server, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../modules/auth/auth.service.js";

let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io"
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }
      
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    const userId = user.id || user.userId;
    const role = user.role;

    if (userId) {
      socket.join(`user:${userId}`);
    }
    
    if (role) {
      socket.join(`role:${role.toUpperCase()}`);
    }

    socket.emit("notification:connected", { success: true });

    socket.on("disconnect", () => {
      // Cleanup happens automatically for rooms
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
}
