import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as serviceCategoriesRepository from "./service-categories.repository.js";
import type {
  AdminServiceCategoriesListResultDto,
  AdminServiceCategoriesQueryDto,
  AdminServiceCategoryDto,
  CreateAdminServiceCategoryBody,
  ServiceCategoryKind,
  ServiceCategoryStatus,
  UpdateAdminServiceCategoryBody,
} from "./service-categories.types.js";

function mapServiceCategoryRowToDto(row: serviceCategoriesRepository.AdminServiceCategoryRow): AdminServiceCategoryDto {
  return {
    id: row.service_id,
    code: row.service_id,
    serviceName: row.service_name,
    category: row.service_category as ServiceCategoryKind,
    description: row.description,
    durationMinutes: row.estimated_duration_minutes,
    basePrice: Number(row.base_price),
    status: row.service_status as ServiceCategoryStatus,
    updatedAt: null,
    usageCount: Number(row.usage_count ?? 0),
  };
}

export async function getAdminServiceCategories(query: AdminServiceCategoriesQueryDto): Promise<AdminServiceCategoriesListResultDto> {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [rows, total, stats] = await Promise.all([
      serviceCategoriesRepository.findAdminServiceCategories(query),
      serviceCategoriesRepository.countAdminServiceCategories(query),
      serviceCategoriesRepository.getAdminServiceCategoryStats(),
    ]);

    return {
      items: rows.map(mapServiceCategoryRowToDto),
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError("Không thể tải danh sách dịch vụ.", "ADMIN_SERVICE_CATEGORIES_FETCH_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function getAdminServiceCategoryDetail(serviceId: string): Promise<AdminServiceCategoryDto> {
  const row = await serviceCategoriesRepository.findServiceCategoryDetailById(serviceId);
  if (!row) {
    throw new AppError("Không tìm thấy dịch vụ.", "SERVICE_CATEGORY_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return mapServiceCategoryRowToDto(row);
}

export async function createAdminServiceCategory(body: CreateAdminServiceCategoryBody): Promise<AdminServiceCategoryDto> {
  try {
    const nameExists = await serviceCategoriesRepository.checkServiceNameExists(body.serviceName);
    if (nameExists) {
      throw new AppError("Tên dịch vụ đã tồn tại.", "SERVICE_CATEGORY_NAME_EXISTS", httpStatus.BAD_REQUEST);
    }

    const nextId = await serviceCategoriesRepository.getNextServiceCategoryId();
    await serviceCategoriesRepository.createAdminServiceCategory(nextId, body);

    const createdRow = await serviceCategoriesRepository.findServiceCategoryDetailById(nextId);
    if (!createdRow) throw new Error("Created service category row not found");

    return mapServiceCategoryRowToDto(createdRow);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể tạo dịch vụ.", "ADMIN_SERVICE_CATEGORY_CREATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function updateAdminServiceCategory(serviceId: string, body: UpdateAdminServiceCategoryBody): Promise<AdminServiceCategoryDto> {
  try {
    const exists = await serviceCategoriesRepository.findServiceCategoryById(serviceId);
    if (!exists) {
      throw new AppError("Không tìm thấy dịch vụ.", "SERVICE_CATEGORY_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (body.serviceName) {
      const nameExists = await serviceCategoriesRepository.checkServiceNameExists(body.serviceName, serviceId);
      if (nameExists) {
        throw new AppError("Tên dịch vụ đã tồn tại.", "SERVICE_CATEGORY_NAME_EXISTS", httpStatus.BAD_REQUEST);
      }
    }

    await serviceCategoriesRepository.updateAdminServiceCategory(serviceId, body);
    const updatedRow = await serviceCategoriesRepository.findServiceCategoryDetailById(serviceId);
    if (!updatedRow) throw new Error("Updated service category row not found");

    return mapServiceCategoryRowToDto(updatedRow);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể cập nhật dịch vụ.", "ADMIN_SERVICE_CATEGORY_UPDATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function updateAdminServiceCategoryStatus(serviceId: string, status: ServiceCategoryStatus): Promise<AdminServiceCategoryDto> {
  try {
    const exists = await serviceCategoriesRepository.findServiceCategoryById(serviceId);
    if (!exists) {
      throw new AppError("Không tìm thấy dịch vụ.", "SERVICE_CATEGORY_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    await serviceCategoriesRepository.updateServiceCategoryStatus(serviceId, status);
    const updatedRow = await serviceCategoriesRepository.findServiceCategoryDetailById(serviceId);
    if (!updatedRow) throw new Error("Updated service category row not found");

    return mapServiceCategoryRowToDto(updatedRow);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể cập nhật trạng thái dịch vụ.", "ADMIN_SERVICE_CATEGORY_STATUS_UPDATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function deleteAdminServiceCategory(serviceId: string): Promise<{ deleted: boolean; deactivated: boolean; id: string; message: string }> {
  try {
    const row = await serviceCategoriesRepository.findServiceCategoryDetailById(serviceId);
    if (!row) {
      throw new AppError("Không tìm thấy dịch vụ.", "SERVICE_CATEGORY_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (Number(row.usage_count) > 0) {
      await serviceCategoriesRepository.updateServiceCategoryStatus(serviceId, "inactive");
      return {
        deleted: false,
        deactivated: true,
        id: serviceId,
        message: "Dịch vụ đã phát sinh dữ liệu nên đã được chuyển sang ngừng hoạt động.",
      };
    }

    await serviceCategoriesRepository.deleteServiceCategory(serviceId);
    return {
      deleted: true,
      deactivated: false,
      id: serviceId,
      message: "Xóa dịch vụ thành công.",
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể xóa dịch vụ.", "ADMIN_SERVICE_CATEGORY_DELETE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
