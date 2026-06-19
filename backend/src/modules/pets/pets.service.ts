import { randomBytes } from "node:crypto";
import { hashPassword, hashGeneratedPassword } from "../../shared/security/password.service.js";
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
import { upsertPetActivityLog } from "../pet-activity-logs/pet-activity-logs.repository.js";


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
    throw new AppError("Bạn không có quyền truy cập danh sách thú cưng", "FORBIDDEN", httpStatus.FORBIDDEN);
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
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
    throw new AppError("Số điện thoại này đã thuộc về một chủ nuôi", "OWNER_PHONE_ALREADY_EXISTS", httpStatus.CONFLICT);
  }

  const email = payload.email?.trim() || createInternalOwnerEmail(phoneNumber);
  const existingEmailOwner = await petsRepository.findOwnerByEmail(email);

  if (existingEmailOwner) {
    throw new AppError("Email này đã thuộc về một chủ nuôi", "OWNER_EMAIL_ALREADY_EXISTS", httpStatus.CONFLICT);
  }

  return petsRepository.createStaffOwner({
    userId: await createId("own"),
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
    throw new AppError("Không tìm thấy chủ nuôi hợp lệ", "OWNER_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const createdPet = await petsRepository.createPet(payload.ownerUserId, payload);
  await upsertPetActivityLog({
    petId: createdPet.petId,
    ownerUserId: payload.ownerUserId,
    actorUserId: authUser.userId,
    activityCategory: "profile",
    activityType: "pet_profile_created",
    activityStatus: "completed",
    title: "Đã tạo hồ sơ thú cưng",
    summary: `${payload.petName.trim()} đã được thêm vào hồ sơ thú cưng.`,
    sourceType: "pet",
    sourceId: createdPet.petId,
    metadata: {
      species: payload.species,
      createdByRole: authUser.role
    }
  });
  const staffPet = await petsRepository.findStaffPetById(createdPet.petId);

  if (!staffPet) {
    throw new AppError("Không thể tải hồ sơ thú cưng vừa tạo", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  return staffPet;
}

export async function updateStaffPet(authUser: AuthUser, petId: string, payload: UpdatePetPayload) {
  assertStaff(authUser);

  const existingPet = await petsRepository.findStaffPetById(petId);

  if (!existingPet) {
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  const updatedPet = await petsRepository.updatePet(existingPet.owner.userId, petId, payload);

  if (!updatedPet) {
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  await upsertPetActivityLog({
    petId,
    ownerUserId: existingPet.owner.userId,
    actorUserId: authUser.userId,
    activityCategory: "profile",
    activityType: "pet_profile_updated",
    activityStatus: "completed",
    title: "Đã cập nhật hồ sơ thú cưng",
    summary: `Hồ sơ của ${existingPet.petName} vừa được cập nhật.`,
    sourceType: "pet",
    sourceId: petId,
    metadata: {
      updatedFields: Object.keys(payload),
      updatedByRole: authUser.role
    }
  });

  const staffPet = await petsRepository.findStaffPetById(petId);

  if (!staffPet) {
    throw new AppError("Không thể tải hồ sơ thú cưng vừa cập nhật", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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

  const pet = await petsRepository.createPet(authUser.userId, payload);
  await upsertPetActivityLog({
    petId: pet.petId,
    ownerUserId: authUser.userId,
    actorUserId: authUser.userId,
    activityCategory: "profile",
    activityType: "pet_profile_created",
    activityStatus: "completed",
    title: "Đã tạo hồ sơ thú cưng",
    summary: `${payload.petName.trim()} đã được thêm vào hồ sơ thú cưng.`,
    sourceType: "pet",
    sourceId: pet.petId,
    metadata: {
      species: payload.species,
      createdByRole: authUser.role
    }
  });

  return pet;
}

export async function updateOwnerPet(authUser: AuthUser, petId: string, payload: UpdatePetPayload) {
  assertOwner(authUser);

  const pet = await petsRepository.updatePet(authUser.userId, petId, payload);

  if (!pet) {
    throw new AppError("Không tìm thấy hồ sơ thú cưng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
  }

  await upsertPetActivityLog({
    petId,
    ownerUserId: authUser.userId,
    actorUserId: authUser.userId,
    activityCategory: "profile",
    activityType: "pet_profile_updated",
    activityStatus: "completed",
    title: "Đã cập nhật hồ sơ thú cưng",
    summary: `Hồ sơ của ${pet.petName} vừa được cập nhật.`,
    sourceType: "pet",
    sourceId: petId,
    metadata: {
      updatedFields: Object.keys(payload),
      updatedByRole: authUser.role
    }
  });

  return pet;
}
