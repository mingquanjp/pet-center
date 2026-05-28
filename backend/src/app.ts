import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors.js";
import { httpLoggerOptions } from "./config/logger.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(pinoHttp(httpLoggerOptions));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", apiRouter);

// Backward-compatible health endpoints for the current README.
app.use("/", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);
