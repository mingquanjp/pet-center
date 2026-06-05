import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import * as medicinesRepository from "./medicines.repository.js";
import type {
  AdminMedicineDto,
  AdminMedicinesListResultDto,
  AdminMedicinesQueryDto,
  CreateAdminMedicineBody,
  MedicineUnit,
  MedicineStatus,
  UpdateAdminMedicineBody,
  UpdateAdminMedicineStatusBody
} from "./medicines.types.js";

function mapMedicineRowToAdminDto(row: any): AdminMedicineDto {
  return {
    id: row.medicine_id,
    code: row.medicine_id,
    medicineName: row.medicine_name,
    unit: row.unit as MedicineUnit,
    description: row.description,
    usageNote: row.usage_note,
    unitPrice: Number(row.unit_price),
    medicineStatus: row.medicine_status as MedicineStatus,
    prescriptionUsageCount: Number(row.prescription_usage_count)
  };
}

export async function getAdminMedicines(query: AdminMedicinesQueryDto): Promise<AdminMedicinesListResultDto> {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    
    const [rows, total, stats] = await Promise.all([
      medicinesRepository.findAdminMedicines(query),
      medicinesRepository.countAdminMedicines(query),
      medicinesRepository.getAdminMedicineStats()
    ]);

    const items = rows.map(mapMedicineRowToAdminDto);
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  } catch (error) {
    throw new AppError("Không thể tải danh sách thuốc.", "ADMIN_MEDICINES_FETCH_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function getAdminMedicineDetail(medicineId: string): Promise<AdminMedicineDto> {
  const row = await medicinesRepository.findMedicineDetailById(medicineId);
  if (!row) {
    throw new AppError("Không tìm thấy thuốc.", "MEDICINE_NOT_FOUND", httpStatus.NOT_FOUND);
  }
  
  return mapMedicineRowToAdminDto(row);
}

export async function createAdminMedicine(body: CreateAdminMedicineBody): Promise<AdminMedicineDto> {
  try {
    const nameExists = await medicinesRepository.checkMedicineNameExists(body.medicineName);
    if (nameExists) {
      throw new AppError("Tên thuốc đã tồn tại.", "MEDICINE_NAME_EXISTS", httpStatus.BAD_REQUEST);
    }

    const nextId = await medicinesRepository.getNextMedicineId();
    await medicinesRepository.createAdminMedicine(nextId, body);

    const createdRow = await medicinesRepository.findMedicineDetailById(nextId);
    if (!createdRow) {
      throw new Error("Created row not found");
    }

    return mapMedicineRowToAdminDto(createdRow);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể tạo thuốc.", "ADMIN_MEDICINE_CREATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function updateAdminMedicine(medicineId: string, body: UpdateAdminMedicineBody): Promise<AdminMedicineDto> {
  try {
    const exists = await medicinesRepository.findMedicineById(medicineId);
    if (!exists) {
      throw new AppError("Không tìm thấy thuốc.", "MEDICINE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (body.medicineName) {
      const nameExists = await medicinesRepository.checkMedicineNameExists(body.medicineName, medicineId);
      if (nameExists) {
        throw new AppError("Tên thuốc đã tồn tại.", "MEDICINE_NAME_EXISTS", httpStatus.BAD_REQUEST);
      }
    }

    await medicinesRepository.updateAdminMedicine(medicineId, body);

    const updatedRow = await medicinesRepository.findMedicineDetailById(medicineId);
    if (!updatedRow) {
      throw new Error("Updated row not found");
    }

    return mapMedicineRowToAdminDto(updatedRow);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể cập nhật thuốc.", "ADMIN_MEDICINE_UPDATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function updateAdminMedicineStatus(medicineId: string, body: UpdateAdminMedicineStatusBody): Promise<{ dto: AdminMedicineDto, message: string }> {
  try {
    const row = await medicinesRepository.findMedicineDetailById(medicineId);
    if (!row) {
      throw new AppError("Không tìm thấy thuốc.", "MEDICINE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (row.medicine_status !== body.medicineStatus) {
      await medicinesRepository.updateMedicineStatus(medicineId, body.medicineStatus);
    }

    const updatedRow = await medicinesRepository.findMedicineDetailById(medicineId);
    const dto = mapMedicineRowToAdminDto(updatedRow!);
    
    const message = body.medicineStatus === "active" ? "Kích hoạt thuốc thành công." : "Ngừng hoạt động thuốc thành công.";

    return { dto, message };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể cập nhật trạng thái thuốc.", "ADMIN_MEDICINE_UPDATE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export async function deleteAdminMedicine(medicineId: string): Promise<{ deleted: boolean; deactivated: boolean; id: string; message: string }> {
  try {
    const exists = await medicinesRepository.findMedicineById(medicineId);
    if (!exists) {
      throw new AppError("Không tìm thấy thuốc.", "MEDICINE_NOT_FOUND", httpStatus.NOT_FOUND);
    }

    const usageCount = await medicinesRepository.countPrescriptionUsageByMedicineId(medicineId);

    if (usageCount > 0) {
      await medicinesRepository.updateMedicineStatus(medicineId, "inactive");
      return {
        deleted: false,
        deactivated: true,
        id: medicineId,
        message: "Thuốc đã từng được dùng trong đơn thuốc nên đã được chuyển sang ngừng hoạt động."
      };
    } else {
      await medicinesRepository.deleteMedicine(medicineId);
      return {
        deleted: true,
        deactivated: false,
        id: medicineId,
        message: "Xóa thuốc thành công."
      };
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Không thể xóa thuốc.", "ADMIN_MEDICINE_DELETE_FAILED", httpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
