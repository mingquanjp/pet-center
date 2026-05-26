import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as controller from "./appointments.controller.js";
import { createAppointmentSchema, listAppointmentsSchema, appointmentIdSchema } from "./appointments.schema.js";

const router = Router();

// Toàn bộ API lịch hẹn yêu cầu đăng nhập
router.use(authMiddleware);

router.post(
  "/appointments",
  validateRequest(createAppointmentSchema),
  asyncHandler(controller.createAppointment)
);

router.get(
  "/appointments/my",
  validateRequest(listAppointmentsSchema),
  asyncHandler(controller.getMyList)
);

router.get(
  "/appointments/:id",
  validateRequest(appointmentIdSchema),
  asyncHandler(controller.getDetail)
);

router.patch(
  "/appointments/:id/cancel",
  validateRequest(appointmentIdSchema),
  asyncHandler(controller.cancelAppointment)
);

export const appointmentRoutes = router;
