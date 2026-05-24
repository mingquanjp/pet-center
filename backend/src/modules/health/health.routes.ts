import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import * as healthController from "./health.controller.js";

export const healthRouter = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is healthy
 */
healthRouter.get("/health", healthController.checkHealth);

/**
 * @openapi
 * /api/v1/db/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check database connection
 *     responses:
 *       200:
 *         description: Database is connected
 *       500:
 *         description: Database health check failed
 */
healthRouter.get("/db/health", asyncHandler(healthController.checkDatabaseHealth));
