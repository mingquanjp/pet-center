import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  sendSuccess(res, result, "Đăng ký thành công", httpStatus.CREATED);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  sendSuccess(res, result, "Đăng nhập thành công");
}

export function logout(_req: Request, res: Response): void {
  sendSuccess(res, null, "Đăng xuất thành công");
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.me(req.user!);
  sendSuccess(res, user);
}
