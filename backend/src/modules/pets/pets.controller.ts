import type { Request, Response } from "express";
import { httpStatus } from "../../shared/errors/http-status.js";
import { sendPaginated, sendSuccess } from "../../shared/responses/api-response.js";
import type {
  CreatePetPayload,
  ListPetsQuery,
  PetMedicalExamParams,
  PetMedicalExamsQuery,
  PetParams,
  PetSpaHistoryQuery,
  PetVaccinationsQuery,
  StaffCreateOwnerPayload,
  StaffCreatePetPayload,
  StaffOwnerSearchQuery,
  UpdatePetPayload
} from "./pets.schema.js";
import * as petsService from "./pets.service.js";

export async function listPets(req: Request, res: Response): Promise<void> {
  const result = await petsService.listOwnerPets(req.user!, req.query as unknown as ListPetsQuery);

  sendPaginated(res, result.data, result.pagination);
}

export async function listStaffPets(req: Request, res: Response): Promise<void> {
  const result = await petsService.listStaffPets(req.user!, req.query as unknown as ListPetsQuery);

  sendPaginated(res, result.data, result.pagination);
}

export async function getStaffPet(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const pet = await petsService.getStaffPet(req.user!, petId);

  sendSuccess(res, pet);
}

export async function searchStaffOwners(req: Request, res: Response): Promise<void> {
  const owners = await petsService.searchStaffOwners(req.user!, req.query as unknown as StaffOwnerSearchQuery);

  sendSuccess(res, owners);
}

export async function createStaffOwner(req: Request, res: Response): Promise<void> {
  const owner = await petsService.createStaffOwner(req.user!, req.body as StaffCreateOwnerPayload);

  sendSuccess(res, owner, "Tao tai khoan chu nuoi thanh cong", httpStatus.CREATED);
}

export async function createStaffPet(req: Request, res: Response): Promise<void> {
  const pet = await petsService.createStaffPet(req.user!, req.body as StaffCreatePetPayload);

  sendSuccess(res, pet, "Tao ho so thu cung tai quay thanh cong", httpStatus.CREATED);
}

export async function updateStaffPet(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const pet = await petsService.updateStaffPet(req.user!, petId, req.body as UpdatePetPayload);

  sendSuccess(res, pet, "Cap nhat ho so thu cung thanh cong");
}

export async function getPet(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const pet = await petsService.getOwnerPet(req.user!, petId);

  sendSuccess(res, pet);
}

export async function listPetMedicalExams(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const result = await petsService.listOwnerPetMedicalExams(req.user!, petId, req.query as unknown as PetMedicalExamsQuery);

  sendPaginated(res, result.data, result.pagination);
}

export async function getPetMedicalExam(req: Request, res: Response): Promise<void> {
  const { petId, examId } = req.params as PetMedicalExamParams;
  const exam = await petsService.getOwnerPetMedicalExam(req.user!, petId, examId);

  sendSuccess(res, exam);
}

export async function listPetVaccinations(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const result = await petsService.listOwnerPetVaccinations(req.user!, petId, req.query as unknown as PetVaccinationsQuery);

  sendPaginated(res, result.data, result.pagination);
}

export async function listPetSpaHistory(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const result = await petsService.listOwnerPetSpaHistory(req.user!, petId, req.query as unknown as PetSpaHistoryQuery);

  sendPaginated(res, result.data, result.pagination);
}

export async function createPet(req: Request, res: Response): Promise<void> {
  const pet = await petsService.createOwnerPet(req.user!, req.body as CreatePetPayload);

  sendSuccess(res, pet, "Tạo hồ sơ thú cưng thành công", httpStatus.CREATED);
}

export async function updatePet(req: Request, res: Response): Promise<void> {
  const { petId } = req.params as PetParams;
  const pet = await petsService.updateOwnerPet(req.user!, petId, req.body as UpdatePetPayload);

  sendSuccess(res, pet, "Cập nhật hồ sơ thú cưng thành công");
}
