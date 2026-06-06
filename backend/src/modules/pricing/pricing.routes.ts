import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as pricingController from "./pricing.controller.js";
import {
  createAdminPriceRuleSchema,
  getAdminPricingQuerySchema,
  priceRuleIdParamSchema,
  updateAdminPriceRuleSchema,
} from "./pricing.schema.js";

export const pricingRouter = Router();

pricingRouter.get(
  "/admin/pricing",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: getAdminPricingQuerySchema }),
  asyncHandler(pricingController.getAdminPricingController)
);

pricingRouter.post(
  "/admin/pricing",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createAdminPriceRuleSchema }),
  asyncHandler(pricingController.createAdminPriceRuleController)
);

pricingRouter.patch(
  "/admin/pricing/:priceRuleId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: priceRuleIdParamSchema, body: updateAdminPriceRuleSchema }),
  asyncHandler(pricingController.updateAdminPriceRuleController)
);

pricingRouter.delete(
  "/admin/pricing/:priceRuleId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: priceRuleIdParamSchema }),
  asyncHandler(pricingController.deleteAdminPriceRuleController)
);
