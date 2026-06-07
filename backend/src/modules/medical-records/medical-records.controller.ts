import type { Request, Response, NextFunction } from "express";
import { getDoctorMedicalRecordDetail, getDoctorMedicalRecords } from "./medical-records.service.js";
import { getDoctorMedicalRecordDetailParamsSchema, getDoctorMedicalRecordsQuerySchema } from "./medical-records.schema.js";

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

export async function getDoctorMedicalRecordDetailController(req: Request, res: Response, next: NextFunction) {
  try {
    const { petId } = getDoctorMedicalRecordDetailParamsSchema.parse(req.params);
    const data = await getDoctorMedicalRecordDetail(petId);

    res.status(200).json({
      success: true,
      data,
      message: "Lấy chi tiết bệnh án thành công.",
    });
  } catch (error) {
    next(error);
  }
}
