import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as followUpsController from "./follow-ups.controller.js";
import {
  followUpParamsSchema,
  listDoctorFollowUpsQuerySchema,
} from "./follow-ups.schema.js";

export const followUpsRouter = Router();

followUpsRouter.get(
  "/doctor/follow-ups",
  authMiddleware,
  requireRole("DOCTOR"),
  validateRequest({ query: listDoctorFollowUpsQuerySchema }),
  asyncHandler(followUpsController.listDoctorFollowUps)
);

followUpsRouter.get(
  "/doctor/follow-ups/:followUpId",
  authMiddleware,
  requireRole("DOCTOR"),
  validateRequest({ params: followUpParamsSchema }),
  asyncHandler(followUpsController.getDoctorFollowUpDetail)
);
