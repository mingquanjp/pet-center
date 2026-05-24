import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
import { httpStatus } from "../shared/errors/http-status.js";
import type { UserRole } from "../shared/types/auth.js";

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", "UNAUTHORIZED", httpStatus.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Permission denied", "FORBIDDEN", httpStatus.FORBIDDEN));
      return;
    }

    next();
  };
}
