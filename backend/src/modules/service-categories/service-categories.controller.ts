import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendSuccess } from "../../shared/responses/api-response.js";
import * as serviceCategoriesService from "./service-categories.service.js";
import type {
  AdminServiceCategoriesQueryDto,
  CreateAdminServiceCategoryBody,
  ServiceCategoryStatus,
  UpdateAdminServiceCategoryBody,
} from "./service-categories.types.js";

export async function getAdminServiceCategoriesController(req: Request, res: Response) {
  const result = await serviceCategoriesService.getAdminServiceCategories(req.query as unknown as AdminServiceCategoriesQueryDto);
  sendSuccess(res, result, "Lấy danh sách dịch vụ thành công.", httpStatus.OK);
}

export async function getAdminServiceCategoryDetailController(req: Request, res: Response) {
  const data = await serviceCategoriesService.getAdminServiceCategoryDetail(req.params.serviceId as string);
  sendSuccess(res, data, "Lấy chi tiết dịch vụ thành công.", httpStatus.OK);
}

export async function createAdminServiceCategoryController(req: Request, res: Response) {
  const data = await serviceCategoriesService.createAdminServiceCategory(req.body as CreateAdminServiceCategoryBody);
  sendSuccess(res, data, "Tạo dịch vụ thành công.", httpStatus.CREATED);
}

export async function updateAdminServiceCategoryController(req: Request, res: Response) {
  const data = await serviceCategoriesService.updateAdminServiceCategory(
    req.params.serviceId as string,
    req.body as UpdateAdminServiceCategoryBody
  );
  sendSuccess(res, data, "Cập nhật dịch vụ thành công.", httpStatus.OK);
}

export async function updateAdminServiceCategoryStatusController(req: Request, res: Response) {
  const data = await serviceCategoriesService.updateAdminServiceCategoryStatus(
    req.params.serviceId as string,
    req.body.status as ServiceCategoryStatus
  );
  sendSuccess(res, data, "Cập nhật trạng thái dịch vụ thành công.", httpStatus.OK);
}

export async function deleteAdminServiceCategoryController(req: Request, res: Response) {
  const result = await serviceCategoriesService.deleteAdminServiceCategory(req.params.serviceId as string);
  sendSuccess(res, result, result.message, httpStatus.OK);
}
