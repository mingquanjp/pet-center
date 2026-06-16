import { getIO } from "./socket.js";

export function emitToUser(userId: string, eventName: string, payload: unknown) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(eventName, payload);
  } catch (error) {
    console.warn("Failed to emit to user (socket.io might not be initialized):", error);
  }
}

export function emitToRole(role: string, eventName: string, payload: unknown) {
  try {
    const io = getIO();
    io.to(`role:${role.toUpperCase()}`).emit(eventName, payload);
  } catch (error) {
    console.warn("Failed to emit to role (socket.io might not be initialized):", error);
  }
}
