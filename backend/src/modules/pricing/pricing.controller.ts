import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as pricingService from "./pricing.service.js";
import type { AdminPricingQueryDto, CreateAdminPriceRuleBody, UpdateAdminPriceRuleBody } from "./pricing.types.js";

export async function getAdminPricingController(req: Request, res: Response) {
  const result = await pricingService.getAdminPricing(req.query as unknown as AdminPricingQueryDto);
  sendSuccess(res, result, "Lấy bảng giá thành công.", httpStatus.OK);
}

export async function createAdminPriceRuleController(req: Request, res: Response) {
  const data = await pricingService.createAdminPriceRule(req.body as CreateAdminPriceRuleBody);
  sendSuccess(res, data, "Tạo quy tắc giá thành công.", httpStatus.CREATED);
}

export async function updateAdminPriceRuleController(req: Request, res: Response) {
  const data = await pricingService.updateAdminPriceRule(req.params.priceRuleId as string, req.body as UpdateAdminPriceRuleBody);
  sendSuccess(res, data, "Cập nhật quy tắc giá thành công.", httpStatus.OK);
}

export async function deleteAdminPriceRuleController(req: Request, res: Response) {
  const result = await pricingService.deleteAdminPriceRule(req.params.priceRuleId as string);
  sendSuccess(res, result, result.message, httpStatus.OK);
}
