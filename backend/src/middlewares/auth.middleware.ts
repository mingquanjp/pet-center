import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
import { httpStatus } from "../shared/errors/http-status.js";
import { verifyAccessToken } from "../modules/auth/auth.service.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Vui lòng đăng nhập để tiếp tục", "UNAUTHORIZED", httpStatus.UNAUTHORIZED));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn", "UNAUTHORIZED", httpStatus.UNAUTHORIZED));
  }
};
