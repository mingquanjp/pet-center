import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as prescriptionsController from "./prescriptions.controller.js";
import {
  listDoctorPrescriptionsQuerySchema,
  prescriptionParamsSchema,
} from "./prescriptions.schema.js";

export const prescriptionsRouter = Router();

prescriptionsRouter.get(
  "/doctor/prescriptions",
  authMiddleware,
  requireRole("DOCTOR"),
  validateRequest({ query: listDoctorPrescriptionsQuerySchema }),
  asyncHandler(prescriptionsController.listDoctorPrescriptions)
);

prescriptionsRouter.get(
  "/doctor/prescriptions/:prescriptionId",
  authMiddleware,
  requireRole("DOCTOR"),
  validateRequest({ params: prescriptionParamsSchema }),
  asyncHandler(prescriptionsController.getDoctorPrescriptionDetail)
);
