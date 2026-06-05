import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as serviceCategoriesController from "./service-categories.controller.js";
import {
  createAdminServiceCategorySchema,
  getAdminServiceCategoriesQuerySchema,
  serviceCategoryIdParamSchema,
  updateAdminServiceCategorySchema,
  updateAdminServiceCategoryStatusSchema,
} from "./service-categories.schema.js";

export const serviceCategoriesRouter = Router();

serviceCategoriesRouter.get(
  "/admin/service-categories",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: getAdminServiceCategoriesQuerySchema }),
  asyncHandler(serviceCategoriesController.getAdminServiceCategoriesController)
);

serviceCategoriesRouter.post(
  "/admin/service-categories",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createAdminServiceCategorySchema }),
  asyncHandler(serviceCategoriesController.createAdminServiceCategoryController)
);

serviceCategoriesRouter.get(
  "/admin/service-categories/:serviceId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: serviceCategoryIdParamSchema }),
  asyncHandler(serviceCategoriesController.getAdminServiceCategoryDetailController)
);

serviceCategoriesRouter.patch(
  "/admin/service-categories/:serviceId/status",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: serviceCategoryIdParamSchema, body: updateAdminServiceCategoryStatusSchema }),
  asyncHandler(serviceCategoriesController.updateAdminServiceCategoryStatusController)
);

serviceCategoriesRouter.patch(
  "/admin/service-categories/:serviceId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: serviceCategoryIdParamSchema, body: updateAdminServiceCategorySchema }),
  asyncHandler(serviceCategoriesController.updateAdminServiceCategoryController)
);

serviceCategoriesRouter.delete(
  "/admin/service-categories/:serviceId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: serviceCategoryIdParamSchema }),
  asyncHandler(serviceCategoriesController.deleteAdminServiceCategoryController)
);
