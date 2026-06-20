import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as medicinesController from "./medicines.controller.js";
import {
  createAdminMedicineSchema,
  getAdminMedicinesQuerySchema,
  medicineIdParamSchema,
  updateAdminMedicineSchema,
  updateAdminMedicineStatusSchema
} from "./medicines.schema.js";

export const medicinesRouter = Router();

medicinesRouter.get(
  "/admin/medicines-units",
  authMiddleware,
  requireRole("ADMIN"),
  asyncHandler(medicinesController.getMedicineUnitsController)
);

medicinesRouter.get(
  "/admin/medicines",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ query: getAdminMedicinesQuerySchema }),
  asyncHandler(medicinesController.getAdminMedicinesController)
);

medicinesRouter.post(
  "/admin/medicines",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createAdminMedicineSchema }),
  asyncHandler(medicinesController.createAdminMedicineController)
);

medicinesRouter.get(
  "/admin/medicines/:medicineId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: medicineIdParamSchema }),
  asyncHandler(medicinesController.getAdminMedicineDetailController)
);

medicinesRouter.patch(
  "/admin/medicines/:medicineId/status",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: medicineIdParamSchema, body: updateAdminMedicineStatusSchema }),
  asyncHandler(medicinesController.updateAdminMedicineStatusController)
);

medicinesRouter.patch(
  "/admin/medicines/:medicineId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: medicineIdParamSchema, body: updateAdminMedicineSchema }),
  asyncHandler(medicinesController.updateAdminMedicineController)
);

medicinesRouter.delete(
  "/admin/medicines/:medicineId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ params: medicineIdParamSchema }),
  asyncHandler(medicinesController.deleteAdminMedicineController)
);
