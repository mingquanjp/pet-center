import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as usersController from "./users.controller.js";
import {
  adminUserActivitiesQuerySchema,
  adminUserIdParamsSchema,
  createAdminUserBodySchema,
  listAdminUsersQuerySchema,
  updateAdminUserBodySchema,
} from "./users.schema.js";

export const usersRouter = Router();

usersRouter.get(
  "/admin/users",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: listAdminUsersQuerySchema }),
  asyncHandler(usersController.listAdminUsers)
);

usersRouter.post(
  "/admin/users",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createAdminUserBodySchema }),
  asyncHandler(usersController.createAdminUser)
);

usersRouter.get(
  "/admin/users/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: adminUserIdParamsSchema }),
  asyncHandler(usersController.getAdminUserDetail)
);

usersRouter.get(
  "/admin/users/:userId/activities",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: adminUserIdParamsSchema, query: adminUserActivitiesQuerySchema }),
  asyncHandler(usersController.listAdminUserActivities)
);

usersRouter.patch(
  "/admin/users/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: adminUserIdParamsSchema, body: updateAdminUserBodySchema }),
  asyncHandler(usersController.updateAdminUser)
);

usersRouter.delete(
  "/admin/users/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: adminUserIdParamsSchema }),
  asyncHandler(usersController.deleteAdminUser)
);
