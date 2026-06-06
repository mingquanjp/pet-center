import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as authController from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "./auth.schema.js";

export const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register an owner account
 *     description: Creates a new owner account and returns an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "12345678"
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 example: "123 Nguyen Trai, Ho Chi Minh City"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Email này đã được sử dụng
 */
authRouter.post("/auth/register", validateRequest({ body: registerSchema }), asyncHandler(authController.register));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     description: Authenticates a user and returns an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
authRouter.post("/auth/login", validateRequest({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post(
  "/auth/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);
authRouter.post(
  "/auth/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout
 *     description: Logs out the current authenticated user on the client side.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         description: Vui lòng đăng nhập để tiếp tục
 */
authRouter.post("/auth/logout", authMiddleware, authController.logout);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user
 *     description: Returns the current authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Vui lòng đăng nhập để tiếp tục
 *       403:
 *         description: Tài khoản chưa được kích hoạt hoặc đã bị khóa
 */
authRouter.get("/auth/me", authMiddleware, asyncHandler(authController.me));
authRouter.patch(
  "/auth/profile",
  authMiddleware,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(authController.updateProfile)
);
authRouter.patch(
  "/auth/password",
  authMiddleware,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword)
);
