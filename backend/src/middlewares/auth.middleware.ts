import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
import { httpStatus } from "../shared/errors/http-status.js";

export const authMiddleware: RequestHandler = (_req, _res, next) => {
  next(new AppError("Authentication is not implemented yet", "UNAUTHORIZED", httpStatus.UNAUTHORIZED));
};
