import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { getDoctorMedicalRecordDetailController, getDoctorMedicalRecordsController } from "./medical-records.controller.js";

export const medicalRecordsRouter = Router();

medicalRecordsRouter.get(
  "/doctor/medical-records",
  authMiddleware,
  requireRole("DOCTOR", "ADMIN"),
  asyncHandler(getDoctorMedicalRecordsController)
);

medicalRecordsRouter.get(
  "/doctor/medical-records/:petId",
  authMiddleware,
  requireRole("DOCTOR", "ADMIN"),
  asyncHandler(getDoctorMedicalRecordDetailController)
);
