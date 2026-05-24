import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post("/auth/register", validateRequest({ body: registerSchema }), asyncHandler(authController.register));
authRouter.post("/auth/login", validateRequest({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post("/auth/logout", authMiddleware, authController.logout);
authRouter.get("/auth/me", authMiddleware, asyncHandler(authController.me));
