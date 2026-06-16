import type { Request, Response } from "express";
import * as followUpsService from "./follow-ups.service.js";

export async function listDoctorFollowUps(req: Request, res: Response) {
  const doctorUserId = req.user?.userId as string;
  const result = await followUpsService.listDoctorFollowUps(doctorUserId, req.query as any);

  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}

export async function getDoctorFollowUpDetail(req: Request, res: Response) {
  const doctorUserId = req.user?.userId as string;
  const result = await followUpsService.getDoctorFollowUpDetail(
    doctorUserId,
    req.params.followUpId as string
  );

  res.json({
    success: true,
    data: result,
  });
}
