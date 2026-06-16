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

/**
 * @openapi
 * components:
 *   schemas:
 *     UploadedImage:
 *       type: object
 *       properties:
 *         publicId:
 *           type: string
 *           example: pet-center/abc123
 *         url:
 *           type: string
 *           example: http://res.cloudinary.com/demo/image/upload/v123/pet-center/abc123.jpg
 *         secureUrl:
 *           type: string
 *           example: https://res.cloudinary.com/demo/image/upload/v123/pet-center/abc123.jpg
 *         width:
 *           type: integer
 *           example: 800
 *         height:
 *           type: integer
 *           example: 600
 *         format:
 *           type: string
 *           example: jpg
 *         bytes:
 *           type: integer
 *           example: 124000
 *     UploadedImageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UploadedImage'
 *         message:
 *           type: string
 *           example: Upload ảnh thành công
 *
 * /api/v1/uploads/image:
 *   post:
 *     tags:
 *       - Uploads
 *     summary: Upload an image to Cloudinary
 *     description: Uploads a system image, such as a pet profile photo. Security BearerAuth.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedImageResponse'
 *       400:
 *         description: Missing file, invalid type, or file too large.
 *       401:
 *         description: Missing or invalid token.
 *       503:
 *         description: Cloudinary is not configured or temporarily unavailable.
 */
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

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1
  }
});

uploadsRouter.post(
  "/uploads/file",
  authMiddleware,
  fileUpload.single("file"),
  (req, _res, next) => {
    if (!req.file) {
      next(new AppError("Vui lòng chọn tệp để upload", "FILE_REQUIRED", httpStatus.BAD_REQUEST));
      return;
    }

    next();
  },
  asyncHandler(uploadsController.uploadFile)
);

uploadsRouter.post(
  "/uploads/file/view-url",
  authMiddleware,
  (req, _res, next) => {
    if (typeof req.body.url !== "string" || !req.body.url.trim()) {
      next(new AppError("URL tệp không hợp lệ", "INVALID_FILE_URL", httpStatus.BAD_REQUEST));
      return;
    }

    next();
  },
  asyncHandler(uploadsController.getFileViewUrl)
);

