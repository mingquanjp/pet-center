import type { Request, Response } from "express";
import * as appointmentsService from "./appointments.service.js";

export async function listStaffAppointments(req: Request, res: Response) {
  const result = await appointmentsService.listStaffAppointments(req.query);
  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}
