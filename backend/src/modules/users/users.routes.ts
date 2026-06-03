import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as usersController from "./users.controller.js";
import { listAdminUsersQuerySchema } from "./users.schema.js";

export const usersRouter = Router();

usersRouter.get(
  "/admin/users",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: listAdminUsersQuerySchema }),
  asyncHandler(usersController.listAdminUsers)
);
