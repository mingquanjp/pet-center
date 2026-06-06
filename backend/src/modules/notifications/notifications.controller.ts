import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as service from "./notifications.service.js";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
  }

  const { status, page, limit } = req.query;
  const filters = {
    status: (status as any) || "all",
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  };

  const data = await service.getNotifications(userId, filters);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
  }

  const data = await service.getUnreadCount(userId);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
  }

  const notificationId = String(req.params.notificationId);
  const data = await service.markAsRead(notificationId, userId);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
  }

  const data = await service.markAllAsRead(userId);

  res.status(httpStatus.OK).json({
    success: true,
    data,
  });
});
