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
  VNPAY_PAYMENT_URL: z.string().default(""),
  VNPAY_TMN_CODE: z.string().default(""),
  VNPAY_HASH_SECRET: z.string().default(""),
  VNPAY_RETURN_URL: z.string().default(""),
  VNPAY_IPN_URL: z.string().default(""),
  VNPAY_PAYMENT_EXPIRE_MINUTES: z.coerce.number().int().positive().default(15),
  FRONTEND_BASE_URL: z.string().default("")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsedEnv.data;
