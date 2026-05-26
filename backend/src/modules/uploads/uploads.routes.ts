import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as uploadsController from "./uploads.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

export const uploadsRouter = Router();

uploadsRouter.post(
  "/uploads/image",
  authMiddleware,
  upload.single("file"),
  (req, _res, next) => {
    if (!req.file) {
      next(new AppError("Vui lòng chọn ảnh để upload", "IMAGE_FILE_REQUIRED", httpStatus.BAD_REQUEST));
      return;
    }

    next();
  },
  asyncHandler(uploadsController.uploadImage)
);
