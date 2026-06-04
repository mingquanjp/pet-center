import type { Request, Response } from "express";
import * as prescriptionsService from "./prescriptions.service.js";

export async function listDoctorPrescriptions(req: Request, res: Response) {
  const doctorUserId = req.user?.userId as string;
  const result = await prescriptionsService.listDoctorPrescriptions(doctorUserId, req.query as any);

  res.json({
    success: true,
    data: result.data,
    stats: result.stats,
    pagination: result.pagination,
  });
}

export async function getDoctorPrescriptionDetail(req: Request, res: Response) {
  const doctorUserId = req.user?.userId as string;
  const result = await prescriptionsService.getDoctorPrescriptionDetail(
    doctorUserId,
    req.params.prescriptionId as string
  );

  res.json({
    success: true,
    data: result,
  });
}
