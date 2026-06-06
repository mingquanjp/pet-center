import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as pricingRepository from "./pricing.repository.js";
import type {
  AdminPriceRuleDto,
  AdminPricingListResultDto,
  AdminPricingQueryDto,
  CreateAdminPriceRuleBody,
  PricingServiceCategory,
  PricingStatus,
  UpdateAdminPriceRuleBody,
} from "./pricing.types.js";

function mapPriceRuleRow(row: pricingRepository.AdminPriceRuleRow): AdminPriceRuleDto {
  return {
    id: row.price_rule_id,
    code: row.price_rule_id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    serviceCategory: row.service_category as PricingServiceCategory,
    pricingCondition: row.pricing_condition,
    priceAmount: Number(row.price_amount),
    effectiveFrom: row.effective_from,
    status: row.price_status as PricingStatus,
  };
}

export async function getAdminPricing(query: AdminPricingQueryDto): Promise<AdminPricingListResultDto> {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [rows, total, stats, serviceRows] = await Promise.all([
      pricingRepository.findAdminPriceRules(query),
      pricingRepository.countAdminPriceRules(query),
      pricingRepository.getAdminPricingStats(),
      pricingRepository.findPricingServiceOptions(),
    ]);

    return {
      items: rows.map(mapPriceRuleRow),
      stats,
      serviceOptions: serviceRows.map((row) => ({
        id: row.service_id,
        name: row.service_name,
        category: row.service_category as PricingServiceCategory,
        basePrice: Number(row.base_price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError("Không thể tải bảng giá.", "ADMIN_PRICING_FETCH_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

async function validatePriceRuleUnique(payload: {
  serviceId: string;
  pricingCondition: string;
  effectiveFrom: string;
  excludePriceRuleId?: string;
}) {
  const serviceExists = await pricingRepository.serviceExists(payload.serviceId);
  if (!serviceExists) {
    throw new AppError("Không tìm thấy dịch vụ.", "PRICING_SERVICE_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const duplicated = await pricingRepository.checkPriceRuleUnique(payload);
  if (duplicated) {
    throw new AppError("Quy tắc giá cho dịch vụ, điều kiện và ngày hiệu lực này đã tồn tại.", "PRICE_RULE_DUPLICATED", httpStatus.BAD_REQUEST);
  }
}

export async function createAdminPriceRule(body: CreateAdminPriceRuleBody): Promise<AdminPriceRuleDto> {
  try {
    await validatePriceRuleUnique(body);
    const nextId = await pricingRepository.getNextPriceRuleId();
    await pricingRepository.createAdminPriceRule(nextId, body);
    const row = await pricingRepository.findPriceRuleById(nextId);
    if (!row) throw new Error("Created price rule row not found");
    return mapPriceRuleRow(row);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể tạo quy tắc giá.", "ADMIN_PRICE_RULE_CREATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function updateAdminPriceRule(priceRuleId: string, body: UpdateAdminPriceRuleBody): Promise<AdminPriceRuleDto> {
  try {
    const current = await pricingRepository.findPriceRuleById(priceRuleId);
    if (!current) {
      throw new AppError("Không tìm thấy quy tắc giá.", "PRICE_RULE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    const next = {
      serviceId: body.serviceId ?? current.service_id,
      pricingCondition: body.pricingCondition ?? current.pricing_condition,
      effectiveFrom: body.effectiveFrom ?? current.effective_from,
      excludePriceRuleId: priceRuleId,
    };
    await validatePriceRuleUnique(next);
    await pricingRepository.updateAdminPriceRule(priceRuleId, body);
    const updated = await pricingRepository.findPriceRuleById(priceRuleId);
    if (!updated) throw new Error("Updated price rule row not found");
    return mapPriceRuleRow(updated);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể cập nhật quy tắc giá.", "ADMIN_PRICE_RULE_UPDATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function deleteAdminPriceRule(priceRuleId: string): Promise<{ deleted: boolean; id: string; message: string }> {
  try {
    const exists = await pricingRepository.findPriceRuleById(priceRuleId);
    if (!exists) {
      throw new AppError("Không tìm thấy quy tắc giá.", "PRICE_RULE_NOT_FOUND", httpStatus.NOT_FOUND);
    }
    await pricingRepository.deleteAdminPriceRule(priceRuleId);
    return { deleted: true, id: priceRuleId, message: "Xóa quy tắc giá thành công." };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể xóa quy tắc giá.", "ADMIN_PRICE_RULE_DELETE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
