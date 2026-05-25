import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";
import { httpStatus } from "../shared/errors/http-status.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));

    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: details[0]?.message ?? "Dữ liệu không hợp lệ",
        details
      }
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Đã có lỗi xảy ra trên máy chủ"
    }
  });
};
