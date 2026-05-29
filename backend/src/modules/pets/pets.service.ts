import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createId } from "../../shared/utils/id.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import type {
  CreatePetPayload,
  ListPetsQuery,
  PetMedicalExamsQuery,
  PetSpaHistoryQuery,
  PetVaccinationsQuery,
  StaffCreateOwnerPayload,
  StaffCreatePetPayload,
  StaffOwnerSearchQuery,
  UpdatePetPayload
} from "./pets.schema.js";
import * as petsRepository from "./pets.repository.js";

const scrypt = promisify(scryptCallback);

async function hashGeneratedPassword(): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const password = randomBytes(24).toString("base64url");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.trim();
}

function createInternalOwnerEmail(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "") || randomBytes(4).toString("hex");
  return `owner+${digits}.${Date.now()}@petcenter.local`;
}

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền thao tác với hồ sơ thú cưng của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

function assertStaff(authUser: AuthUser): void {
  if (authUser.role !== "STAFF" && authUser.role !== "ADMIN") {
    throw new AppError("Ban khong co quyen truy cap danh sach thu cung", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

export async function listOwnerPets(authUser: AuthUser, query: ListPetsQuery) {
  assertOwner(authUser);

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findPets({
    ownerUserId: authUser.userId,
    q: query.q,
    species: query.species,
    gender: query.gender,
    petStatus: query.petStatus,
    sort: query.sort,
    ...paginationInput
  });

  return {
    data: result.pets,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
}

export async function listStaffPets(authUser: AuthUser, query: ListPetsQuery) {
  assertStaff(authUser);

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findStaffPets({
    q: query.q,
    species: query.species,
    gender: query.gender,
    petStatus: query.petStatus,
    sort: query.sort,
    ...paginationInput
  });

  return {
    data: result.pets,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
}

export async function getStaffPet(authUser: AuthUser, petId: string) {
  assertStaff(authUser);

  const pet = await petsRepository.findStaffPetById(petId);

  if (!pet) {
    throw new AppError("Khong tim thay ho so thu cung", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return pet;
}

export async function searchStaffOwners(authUser: AuthUser, query: StaffOwnerSearchQuery) {
  assertStaff(authUser);

  return petsRepository.findOwnerCandidates(query.q, 5);
}

export async function createStaffOwner(authUser: AuthUser, payload: StaffCreateOwnerPayload) {
  assertStaff(authUser);

  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
  const existingPhoneOwner = await petsRepository.findOwnerByPhoneNumber(phoneNumber);

  if (existingPhoneOwner) {
    throw new AppError("So dien thoai nay da thuoc ve mot chu nuoi", "OWNER_PHONE_ALREADY_EXISTS", httpStatus.CONFLICT);
  }

  const email = payload.email?.trim() || createInternalOwnerEmail(phoneNumber);
  const existingEmailOwner = await petsRepository.findOwnerByEmail(email);

  if (existingEmailOwner) {
    throw new AppError("Email nay da thuoc ve mot chu nuoi", "OWNER_EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
  }

  return petsRepository.createStaffOwner({
    userId: createId("usr"),
    fullName: payload.fullName.trim(),
    email,
    passwordHash: await hashGeneratedPassword(),
    phoneNumber,
    address: payload.address ?? null
  });
}

export async function createStaffPet(authUser: AuthUser, payload: StaffCreatePetPayload) {
  assertStaff(authUser);

  const owner = await petsRepository.findOwnerById(payload.ownerUserId);

  if (!owner) {
    throw new AppError("Khong tim thay chu nuoi hop le", "OWNER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const createdPet = await petsRepository.createPet(payload.ownerUserId, payload);
  const staffPet = await petsRepository.findStaffPetById(createdPet.petId);

  if (!staffPet) {
    throw new AppError("Khong the tai ho so thu cung vua tao", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return staffPet;
}

export async function updateStaffPet(authUser: AuthUser, petId: string, payload: UpdatePetPayload) {
  assertStaff(authUser);

  const existingPet = await petsRepository.findStaffPetById(petId);

  if (!existingPet) {
    throw new AppError("Khong tim thay ho so thu cung", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const updatedPet = await petsRepository.updatePet(existingPet.owner.userId, petId, payload);

  if (!updatedPet) {
    throw new AppError("Khong tim thay ho so thu cung", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const staffPet = await petsRepository.findStaffPetById(petId);

  if (!staffPet) {
    throw new AppError("Khong the tai ho so thu cung vua cap nhat", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return staffPet;
}

export async function getOwnerPet(authUser: AuthUser, petId: string) {
  assertOwner(authUser);

  const pet = await petsRepository.findPetById(authUser.userId, petId);

  if (!pet) {
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return pet;
}

export async function listOwnerPetMedicalExams(authUser: AuthUser, petId: string, query: PetMedicalExamsQuery) {
  assertOwner(authUser);

  const pet = await petsRepository.findPetById(authUser.userId, petId);

  if (!pet) {
    throw new AppError("KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ thÃº cÆ°ng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findPetMedicalExams({
    ownerUserId: authUser.userId,
    petId,
    q: query.q,
    examType: query.examType,
    from: query.from,
    to: query.to,
    ...paginationInput
  });

  return {
    data: result.exams,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
}

export async function getOwnerPetMedicalExam(authUser: AuthUser, petId: string, examId: string) {
  assertOwner(authUser);

  const exam = await petsRepository.findPetMedicalExamDetail(authUser.userId, petId, examId);

  if (!exam) {
    throw new AppError("Không tìm thấy phiếu khám của thú cưng", "PET_EXAM_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return exam;
}

export async function listOwnerPetVaccinations(authUser: AuthUser, petId: string, query: PetVaccinationsQuery) {
  assertOwner(authUser);

  const pet = await petsRepository.findPetById(authUser.userId, petId);

  if (!pet) {
    throw new AppError("KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ thÃº cÆ°ng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findPetVaccinations({
    ownerUserId: authUser.userId,
    petId,
    q: query.q,
    status: query.status,
    ...paginationInput
  });

  return {
    data: result.vaccinations,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
}

export async function listOwnerPetSpaHistory(authUser: AuthUser, petId: string, query: PetSpaHistoryQuery) {
  assertOwner(authUser);

  const pet = await petsRepository.findPetById(authUser.userId, petId);

  if (!pet) {
    throw new AppError("Khong tim thay ho so thu cung", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findPetSpaHistory({
    ownerUserId: authUser.userId,
    petId,
    q: query.q,
    serviceType: query.serviceType,
    from: query.from,
    to: query.to,
    ...paginationInput
  });

  return {
    data: result.records,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
}

export async function createOwnerPet(authUser: AuthUser, payload: CreatePetPayload) {
  assertOwner(authUser);

  return petsRepository.createPet(authUser.userId, payload);
}

export async function updateOwnerPet(authUser: AuthUser, petId: string, payload: UpdatePetPayload) {
  assertOwner(authUser);

  const pet = await petsRepository.updatePet(authUser.userId, petId, payload);

  if (!pet) {
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return pet;
}
