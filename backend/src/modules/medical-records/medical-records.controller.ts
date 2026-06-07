import type { Request, Response, NextFunction } from "express";
import { getDoctorMedicalRecords } from "./medical-records.service.js";
import { getDoctorMedicalRecordsQuerySchema } from "./medical-records.schema.js";

export async function getDoctorMedicalRecordsController(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getDoctorMedicalRecordsQuerySchema.parse(req.query);
    const data = await getDoctorMedicalRecords(query);

    res.status(200).json({
      success: true,
      data,
      message: "Lấy danh sách bệnh án thành công.",
    });
  } catch (error) {
    next(error);
  }
}
