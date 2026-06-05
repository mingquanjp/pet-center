import type { Request, Response } from "express";
import * as usersService from "./users.service.js";
import type { AdminUserActivitiesQuery, CreateAdminUserBody, ListAdminUsersQuery, UpdateAdminUserBody } from "./users.schema.js";

export async function listAdminUsers(req: Request, res: Response) {
  const result = await usersService.listAdminUsers(req.query as unknown as ListAdminUsersQuery);

  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}

export async function createAdminUser(req: Request, res: Response) {
  const user = await usersService.createAdminUser(req.body as CreateAdminUserBody);

  res.status(201).json({
    success: true,
    data: user,
    message: "Tạo người dùng thành công",
  });
}

export async function getAdminUserDetail(req: Request, res: Response) {
  const detail = await usersService.getAdminUserDetail(req.params.userId as string);

  res.json({
    success: true,
    data: detail,
  });
}

export async function listAdminUserActivities(req: Request, res: Response) {
  const result = await usersService.listAdminUserActivities(req.params.userId as string, req.query as unknown as AdminUserActivitiesQuery);

  res.json({
    success: true,
    data: result.activities,
    pagination: result.pagination,
  });
}

export async function updateAdminUser(req: Request, res: Response) {
  const user = await usersService.updateAdminUser(req.params.userId as string, req.body as UpdateAdminUserBody);

  res.json({
    success: true,
    data: user,
    message: "Cập nhật người dùng thành công",
  });
}

export async function deleteAdminUser(req: Request, res: Response) {
  const user = await usersService.deleteAdminUser(req.params.userId as string, req.user?.userId);

  res.json({
    success: true,
    data: user,
    message: "XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng",
  });
}
