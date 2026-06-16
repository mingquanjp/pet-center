import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import * as petsController from "./pets.controller.js";
import {
  createPetSchema,
  listPetsQuerySchema,
  petMedicalExamParamsSchema,
  petMedicalExamsQuerySchema,
  petParamsSchema,
  petSpaHistoryQuerySchema,
  petVaccinationsQuerySchema,
  staffCreateOwnerSchema,
  staffCreatePetSchema,
  staffOwnerSearchQuerySchema,
  updatePetSchema
} from "./pets.schema.js";

export const petsRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 3
 *         totalPages:
 *           type: integer
 *           example: 1
 *     PetHealthProfile:
 *       type: object
 *       properties:
 *         medicalHistory:
 *           type: string
 *           nullable: true
 *           example: Từng bị viêm da nhẹ.
 *         allergyNotes:
 *           type: string
 *           nullable: true
 *           example: Cần theo dõi phản ứng với hải sản.
 *         chronicConditionNotes:
 *           type: string
 *           nullable: true
 *           example: null
 *         foodType:
 *           type: string
 *           nullable: true
 *           example: Hạt mềm cho chó nhỏ
 *         feedingPortion:
 *           type: string
 *           nullable: true
 *           example: 2 bữa/ngày
 *         specialCareNotes:
 *           type: string
 *           nullable: true
 *           example: Theo dõi da và lông trong lần chăm sóc tiếp theo.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Pet:
 *       type: object
 *       properties:
 *         petId:
 *           type: string
 *           example: pet_123
 *         petName:
 *           type: string
 *           example: Lucky
 *         species:
 *           type: string
 *           enum: [Dog, Cat, Other]
 *           example: Dog
 *         speciesLabel:
 *           type: string
 *           example: Chó
 *         breed:
 *           type: string
 *           nullable: true
 *           example: Golden Retriever
 *         gender:
 *           type: string
 *           nullable: true
 *           enum: [male, female, unknown]
 *           example: male
 *         genderLabel:
 *           type: string
 *           example: Đực
 *         birthDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2024-05-26"
 *         estimatedAge:
 *           type: number
 *           nullable: true
 *           example: 2
 *         ageLabel:
 *           type: string
 *           example: 2 năm tuổi
 *         furColor:
 *           type: string
 *           nullable: true
 *           example: Vàng kem
 *         weightKg:
 *           type: number
 *           nullable: true
 *           example: 28.5
 *         profileImageUrl:
 *           type: string
 *           nullable: true
 *           example: https://example.com/lucky.jpg
 *         identifyingMarks:
 *           type: string
 *           nullable: true
 *           example: Có vùng lông trắng ở ngực
 *     PetDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Pet'
 *         - type: object
 *           properties:
 *             healthProfile:
 *               $ref: '#/components/schemas/PetHealthProfile'
 *     CreatePetRequest:
 *       type: object
 *       required:
 *         - petName
 *         - species
 *       properties:
 *         petName:
 *           type: string
 *           maxLength: 100
 *           example: Lucky
 *         species:
 *           type: string
 *           enum: [Dog, Cat, Other]
 *           example: Dog
 *         breed:
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           example: Golden Retriever
 *         gender:
 *           type: string
 *           nullable: true
 *           enum: [male, female, unknown]
 *           example: male
 *         birthDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2024-05-26"
 *         estimatedAge:
 *           type: number
 *           nullable: true
 *           example: 2
 *         furColor:
 *           type: string
 *           nullable: true
 *           maxLength: 80
 *           example: Vàng kem
 *         weightKg:
 *           type: number
 *           nullable: true
 *           example: 28.5
 *         profileImageUrl:
 *           type: string
 *           nullable: true
 *           example: https://example.com/lucky.jpg
 *         identifyingMarks:
 *           type: string
 *           nullable: true
 *           example: Có vùng lông trắng ở ngực
 *         healthProfile:
 *           $ref: '#/components/schemas/PetHealthProfile'
 *     UpdatePetRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreatePetRequest'
 *         - type: object
 *           description: All fields are optional when updating a pet profile.
 *     PetListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Pet'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     PetDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/PetDetail'
 *         message:
 *           type: string
 *           example: Thành công
 */

/**
 * @openapi
 * /api/v1/pets:
 *   get:
 *     tags:
 *       - Pets
 *     summary: List current owner's pets
 *     description: "Returns pets for the Owner 'Thú cưng của tôi' screen. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search across all pets owned by the current user by pet name, breed, or pet id.
 *         example: doraemon
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: [all, Dog, Cat, Other]
 *           default: all
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [petName:asc, petName:desc]
 *           default: petName:asc
 *     responses:
 *       200:
 *         description: Pets returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetListResponse'
 *       400:
 *         description: Invalid query.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
petsRouter.get(
  "/staff/pets",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: listPetsQuerySchema }),
  asyncHandler(petsController.listStaffPets)
);

petsRouter.get(
  "/staff/owners/search",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ query: staffOwnerSearchQuerySchema }),
  asyncHandler(petsController.searchStaffOwners)
);

petsRouter.post(
  "/staff/owners",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ body: staffCreateOwnerSchema }),
  asyncHandler(petsController.createStaffOwner)
);

petsRouter.post(
  "/staff/pets",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ body: staffCreatePetSchema }),
  asyncHandler(petsController.createStaffPet)
);

petsRouter.patch(
  "/staff/pets/:petId",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: petParamsSchema, body: updatePetSchema }),
  asyncHandler(petsController.updateStaffPet)
);

petsRouter.get(
  "/staff/pets/:petId",
  authMiddleware,
  requireRole("STAFF", "ADMIN"),
  validateRequest({ params: petParamsSchema }),
  asyncHandler(petsController.getStaffPet)
);

petsRouter.get(
  "/pets",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ query: listPetsQuerySchema }),
  asyncHandler(petsController.listPets)
);

/**
 * @openapi
 * /api/v1/pets:
 *   post:
 *     tags:
 *       - Pets
 *     summary: Create an owner pet profile
 *     description: "Creates a pet profile for the current owner. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePetRequest'
 *           examples:
 *             dog:
 *               summary: Dog profile
 *               value:
 *                 petName: Lucky
 *                 species: Dog
 *                 breed: Golden Retriever
 *                 gender: male
 *                 estimatedAge: 2
 *                 furColor: Vàng kem
 *                 weightKg: 28.5
 *                 profileImageUrl: https://example.com/lucky.jpg
 *                 identifyingMarks: Có vùng lông trắng ở ngực
 *                 healthProfile:
 *                   medicalHistory: Khám tổng quát định kỳ.
 *                   allergyNotes: null
 *                   chronicConditionNotes: null
 *                   foodType: Hạt khô cho chó trưởng thành
 *                   feedingPortion: 2 bữa/ngày
 *                   specialCareNotes: null
 *     responses:
 *       201:
 *         description: Pet profile created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetDetailResponse'
 *       400:
 *         description: Invalid body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
petsRouter.post(
  "/pets",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ body: createPetSchema }),
  asyncHandler(petsController.createPet)
);

/**
 * @openapi
 * /api/v1/pets/{petId}:
 *   get:
 *     tags:
 *       - Pets
 *     summary: Get owner pet detail
 *     description: "Returns one pet profile owned by the current owner. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 30
 *         example: pet_123
 *     responses:
 *       200:
 *         description: Pet returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetDetailResponse'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pet not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
petsRouter.get(
  "/pets/:petId/medical-exams/:examId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petMedicalExamParamsSchema }),
  asyncHandler(petsController.getPetMedicalExam)
);

petsRouter.get(
  "/pets/:petId/medical-exams",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petParamsSchema, query: petMedicalExamsQuerySchema }),
  asyncHandler(petsController.listPetMedicalExams)
);

petsRouter.get(
  "/pets/:petId/vaccinations",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petParamsSchema, query: petVaccinationsQuerySchema }),
  asyncHandler(petsController.listPetVaccinations)
);

petsRouter.get(
  "/pets/:petId/spa-history",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petParamsSchema, query: petSpaHistoryQuerySchema }),
  asyncHandler(petsController.listPetSpaHistory)
);

petsRouter.get(
  "/pets/:petId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petParamsSchema }),
  asyncHandler(petsController.getPet)
);

/**
 * @openapi
 * /api/v1/pets/{petId}:
 *   patch:
 *     tags:
 *       - Pets
 *     summary: Update owner pet profile
 *     description: "Updates a pet profile owned by the current owner. Security BearerAuth. Roles: OWNER."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 30
 *         example: pet_123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePetRequest'
 *           examples:
 *             updateBasic:
 *               summary: Update basic profile
 *               value:
 *                 petName: Lucky
 *                 weightKg: 29
 *                 healthProfile:
 *                   specialCareNotes: Cần theo dõi cân nặng.
 *     responses:
 *       200:
 *         description: Pet profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetDetailResponse'
 *       400:
 *         description: Invalid body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role is not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pet not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
petsRouter.patch(
  "/pets/:petId",
  authMiddleware,
  requireRole("OWNER"),
  validateRequest({ params: petParamsSchema, body: updatePetSchema }),
  asyncHandler(petsController.updatePet)
);
