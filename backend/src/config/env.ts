import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required").default("pet-center-local-development-secret-key"),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("pet-center"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().default("PetCenter"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  FRONTEND_BASE_URL: z.string().default(""),
  VNPAY_PAYMENT_URL: z.string().default(""),
  VNPAY_TMN_CODE: z.string().default(""),
  VNPAY_HASH_SECRET: z.string().default(""),
  VNPAY_RETURN_URL: z.string().default(""),
  VNPAY_IPN_URL: z.string().default(""),
  VNPAY_PAYMENT_EXPIRE_MINUTES: z.coerce.number().int().positive().default(15),
  VNPAY_DEBUG_LOG: z
    .enum(["true", "false", "TRUE", "FALSE", "1", "0"])
    .optional()
    .default("false")
    .transform((value) => value === "true" || value === "TRUE" || value === "1")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsedEnv.data;
