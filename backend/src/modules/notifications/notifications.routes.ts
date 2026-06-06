import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as controller from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/notifications", authMiddleware, controller.getNotifications);
notificationsRouter.get("/notifications/unread-count", authMiddleware, controller.getUnreadCount);
notificationsRouter.patch("/notifications/read-all", authMiddleware, controller.markAllAsRead);
notificationsRouter.patch("/notifications/:notificationId/read", authMiddleware, controller.markAsRead);
