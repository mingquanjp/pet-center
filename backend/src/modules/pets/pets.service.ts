import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { AuthUser } from "../../shared/types/auth.js";
import { createPagination, normalizePagination } from "../../shared/utils/pagination.js";
import type { CreatePetPayload, ListPetsQuery, PetMedicalExamsQuery, PetSpaHistoryQuery, PetVaccinationsQuery, UpdatePetPayload } from "./pets.schema.js";
import * as petsRepository from "./pets.repository.js";

function assertOwner(authUser: AuthUser): void {
  if (authUser.role !== "OWNER") {
    throw new AppError("Bạn không có quyền thao tác với hồ sơ thú cưng của chủ nuôi", "FORBIDDEN", httpStatus.FORBIDDEN);
  }
}

export async function listOwnerPets(authUser: AuthUser, query: ListPetsQuery) {
  assertOwner(authUser);

  const paginationInput = normalizePagination(query.page, query.limit);
  const result = await petsRepository.findPets({
    ownerUserId: authUser.userId,
    q: query.q,
    species: query.species,
    sort: query.sort,
    ...paginationInput
  });

  return {
    data: result.pets,
    pagination: createPagination(paginationInput.page, paginationInput.limit, result.total)
  };
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
    throw new AppError("KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ thÃº cÆ°ng", "PET_NOT_FOUND", httpStatus.NOT_FOUND);
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
