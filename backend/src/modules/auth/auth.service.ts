import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import * as authRepository from "./auth.repository.js";
import { sendPasswordResetEmail } from "../mail/mail.service.js";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload
} from "./auth.schema.js";
import type { AuthResponse, AuthUserDto, AuthUserRecord } from "./auth.types.js";

const scrypt = promisify(scryptCallback);
const passwordResetLifetimeMinutes = 30;

function toUserDto(user: AuthUserRecord): AuthUserDto {
  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    address: user.address,
    createdAt: user.createdAt
  };
}

function base64UrlEncode(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecodeJson<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, salt, storedKey] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedKey, "base64url");

  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user: AuthUserDto): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      iat: now,
      exp: now + env.JWT_EXPIRES_IN_SECONDS
    })
  );
  const signature = createHmac("sha256", env.JWT_SECRET).update(`${header}.${payload}`).digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifyAccessToken(token: string): AuthUser {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Malformed token");
  }

  const expectedSignature = createHmac("sha256", env.JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const claims = base64UrlDecodeJson<{
    sub: string;
    email: string;
    fullName: string;
    role: AuthUser["role"];
    exp: number;
  }>(payload);

  if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return {
    userId: claims.sub,
    email: claims.email,
    fullName: claims.fullName,
    role: claims.role
  };
}

function assertActiveUser(user: AuthUserRecord): void {
  if (user.accountStatus !== "active") {
    throw new AppError("Tài khoản chưa được kích hoạt hoặc đã bị khóa", "ACCOUNT_NOT_ACTIVE", httpStatus.FORBIDDEN);
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const existingUser = await authRepository.findUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError("Email này đã được sử dụng", "EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
  }

  const user = await authRepository.createOwnerUser({
    userId: `usr_${randomBytes(12).toString("hex")}`,
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: await hashPassword(payload.password),
    phoneNumber: payload.phoneNumber,
    address: payload.address
  });
  const userDto = toUserDto(user);

  return {
    accessToken: signAccessToken(userDto),
    user: userDto
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const user = await authRepository.findUserByEmail(payload.email);

  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    throw new AppError("Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS", httpStatus.UNAUTHORIZED);
  }

  assertActiveUser(user);

  const userDto = toUserDto(user);

  return {
    accessToken: signAccessToken(userDto),
    user: userDto
  };
}

export async function me(authUser: AuthUser): Promise<AuthUserDto> {
  const user = await authRepository.findUserById(authUser.userId);

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.UNAUTHORIZED);
  }

  assertActiveUser(user);

  return toUserDto(user);
}

export async function updateProfile(authUser: AuthUser, payload: UpdateProfilePayload): Promise<AuthUserDto> {
  const user = await authRepository.updateCurrentUserProfile(authUser.userId, {
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
    address: payload.address
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  assertActiveUser(user);
  return toUserDto(user);
}

export async function changePassword(authUser: AuthUser, payload: ChangePasswordPayload): Promise<void> {
  const user = await authRepository.findUserById(authUser.userId);

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", "USER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  assertActiveUser(user);

  if (!(await verifyPassword(payload.currentPassword, user.passwordHash))) {
    throw new AppError("Mật khẩu hiện tại không đúng", "CURRENT_PASSWORD_INVALID", httpStatus.BAD_REQUEST);
  }

  if (await verifyPassword(payload.newPassword, user.passwordHash)) {
    throw new AppError("Mật khẩu mới phải khác mật khẩu hiện tại", "PASSWORD_UNCHANGED", httpStatus.BAD_REQUEST);
  }

  await authRepository.updateCurrentUserPassword(authUser.userId, await hashPassword(payload.newPassword));
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  const user = await authRepository.findUserByEmail(payload.email);

  if (!user || user.accountStatus !== "active") {
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + passwordResetLifetimeMinutes * 60 * 1000);

  await authRepository.createPasswordResetToken({
    resetTokenId: `prt_${randomBytes(12).toString("hex")}`,
    userId: user.userId,
    tokenHash,
    expiresAt
  });

  try {
    const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetUrl,
      expiresInMinutes: passwordResetLifetimeMinutes
    });
  } catch (error) {
    await authRepository.invalidatePasswordResetToken(tokenHash);
    throw error;
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const tokenHash = hashResetToken(payload.token);
  const resetToken = await authRepository.findValidPasswordResetToken(tokenHash);

  if (!resetToken) {
    throw new AppError(
      "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      "PASSWORD_RESET_TOKEN_INVALID",
      httpStatus.BAD_REQUEST
    );
  }

  const user = await authRepository.findUserById(resetToken.user_id);

  if (!user || user.accountStatus !== "active") {
    await authRepository.invalidatePasswordResetToken(tokenHash);
    throw new AppError("Tài khoản không còn khả dụng", "ACCOUNT_NOT_ACTIVE", httpStatus.FORBIDDEN);
  }

  if (await verifyPassword(payload.newPassword, user.passwordHash)) {
    throw new AppError("Mật khẩu mới phải khác mật khẩu hiện tại", "PASSWORD_UNCHANGED", httpStatus.BAD_REQUEST);
  }

  const consumed = await authRepository.consumePasswordResetToken({
    resetTokenId: resetToken.reset_token_id,
    userId: resetToken.user_id,
    passwordHash: await hashPassword(payload.newPassword)
  });

  if (!consumed) {
    throw new AppError(
      "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      "PASSWORD_RESET_TOKEN_INVALID",
      httpStatus.BAD_REQUEST
    );
  }
}
