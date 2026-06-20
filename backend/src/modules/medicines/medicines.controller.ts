import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/responses/api-response.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as medicinesService from "./medicines.service.js";
import type { 
  AdminMedicinesQueryDto, 
  CreateAdminMedicineBody, 
  UpdateAdminMedicineBody, 
  UpdateAdminMedicineStatusBody 
} from "./medicines.types.js";

export async function getAdminMedicinesController(req: Request, res: Response) {
  const query = req.query as unknown as AdminMedicinesQueryDto;
  const result = await medicinesService.getAdminMedicines(query);
  sendSuccess(res, result, "Lấy danh sách thuốc thành công.", httpStatus.OK);
}

export async function getAdminMedicineDetailController(req: Request, res: Response) {
  const medicineId = req.params.medicineId as string;
  const data = await medicinesService.getAdminMedicineDetail(medicineId);
  sendSuccess(res, data, "Lấy chi tiết thuốc thành công.", httpStatus.OK);
}

export async function createAdminMedicineController(req: Request, res: Response) {
  const body = req.body as CreateAdminMedicineBody;
  const data = await medicinesService.createAdminMedicine(body);
  sendSuccess(res, data, "Tạo thuốc thành công.", httpStatus.CREATED);
}

export async function updateAdminMedicineController(req: Request, res: Response) {
  const medicineId = req.params.medicineId as string;
  const body = req.body as UpdateAdminMedicineBody;
  const data = await medicinesService.updateAdminMedicine(medicineId, body);
  sendSuccess(res, data, "Cập nhật thuốc thành công.", httpStatus.OK);
}

export async function updateAdminMedicineStatusController(req: Request, res: Response) {
  const medicineId = req.params.medicineId as string;
  const body = req.body as UpdateAdminMedicineStatusBody;
  const { dto, message } = await medicinesService.updateAdminMedicineStatus(medicineId, body);
  sendSuccess(res, dto, message, httpStatus.OK);
}

export async function deleteAdminMedicineController(req: Request, res: Response) {
  const medicineId = req.params.medicineId as string;
  const result = await medicinesService.deleteAdminMedicine(medicineId);
  sendSuccess(res, result, result.message, httpStatus.OK);
}

export async function getMedicineUnitsController(req: Request, res: Response) {
  const data = await medicinesService.getMedicineUnitsService();
  sendSuccess(res, data, "Lay danh sach don vi thanh cong.", httpStatus.OK);
}

