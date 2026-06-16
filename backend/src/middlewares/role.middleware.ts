import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
import { httpStatus } from "../shared/errors/http-status.js";
import type { UserRole } from "../shared/types/auth.js";

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Vui lòng đăng nhập để tiếp tục", "UNAUTHORIZED", httpStatus.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Bạn không có quyền thực hiện thao tác này", "FORBIDDEN", httpStatus.FORBIDDEN));
      return;
    }

    next();
  };
}
