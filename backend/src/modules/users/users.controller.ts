import type { Request, Response } from "express";
import * as usersService from "./users.service.js";
import type { ListAdminUsersQuery } from "./users.schema.js";

export async function listAdminUsers(req: Request, res: Response) {
  const result = await usersService.listAdminUsers(req.query as unknown as ListAdminUsersQuery);

  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}
