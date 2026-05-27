import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { groomingRouter } from "../modules/grooming/grooming.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { petsRouter } from "../modules/pets/pets.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";
import { invoicesRouter } from "../modules/invoices/invoices.routes.js";
import { appointmentsRouter } from "../modules/appointments/appointments.routes.js";
import { boardingRouter } from "../modules/boarding/boarding.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(healthRouter);
apiRouter.use(groomingRouter);
apiRouter.use(petsRouter);
apiRouter.use(uploadsRouter);
apiRouter.use(invoicesRouter);
apiRouter.use(appointmentsRouter);
apiRouter.use(boardingRouter);
