import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const optionalPositiveNumber = z.coerce.number().positive().optional().nullable();

export const petSpeciesSchema = z.enum(["Dog", "Cat", "Other"]);
export const petGenderSchema = z.enum(["male", "female", "unknown"]);

export const listPetsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  species: z
    .union([petSpeciesSchema, z.literal("all")])
    .optional()
    .transform((value) => (value === "all" ? undefined : value)),
  sort: z.enum(["petName:asc", "petName:desc"]).optional().default("petName:asc"),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const petParamsSchema = z.object({
  petId: z.string().trim().min(1).max(30)
});

export const petMedicalExamsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  examType: z
    .union([z.enum(["general_checkup", "vaccination", "lab_test", "recheck"]), z.literal("all")])
    .optional()
    .transform((value) => (value === "all" ? undefined : value)),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const petHealthProfileSchema = z
  .object({
    medicalHistory: optionalText(2000),
    allergyNotes: optionalText(1000),
    chronicConditionNotes: optionalText(1000),
    foodType: optionalText(100),
    feedingPortion: optionalText(150),
    specialCareNotes: optionalText(1000)
  })
  .optional();

export const createPetSchema = z
  .object({
    petName: z.string().trim().min(1, "Tên thú cưng là bắt buộc").max(100),
    species: petSpeciesSchema,
    breed: optionalText(100),
    gender: petGenderSchema.optional().nullable(),
    birthDate: z.coerce.date().max(new Date(), "Ngày sinh không được ở tương lai").optional().nullable(),
    estimatedAge: z.coerce.number().min(0).max(999.99).optional().nullable(),
    furColor: optionalText(80),
    weightKg: optionalPositiveNumber,
    profileImageUrl: optionalText(2000),
    identifyingMarks: optionalText(1000),
    healthProfile: petHealthProfileSchema
  })
  .refine((value) => value.birthDate || value.estimatedAge !== undefined && value.estimatedAge !== null, {
    path: ["estimatedAge"],
    message: "Cần nhập ngày sinh hoặc tuổi ước tính"
  });

export const updatePetSchema = z
  .object({
    petName: z.string().trim().min(1).max(100).optional(),
    species: petSpeciesSchema.optional(),
    breed: optionalText(100),
    gender: petGenderSchema.optional().nullable(),
    birthDate: z.coerce.date().max(new Date(), "Ngày sinh không được ở tương lai").optional().nullable(),
    estimatedAge: z.coerce.number().min(0).max(999.99).optional().nullable(),
    furColor: optionalText(80),
    weightKg: optionalPositiveNumber,
    profileImageUrl: optionalText(2000),
    identifyingMarks: optionalText(1000),
    petStatus: z.enum(["active", "inactive", "deceased"]).optional(),
    healthProfile: petHealthProfileSchema
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Cần có ít nhất một trường để cập nhật"
  });

export type ListPetsQuery = z.infer<typeof listPetsQuerySchema>;
export type PetParams = z.infer<typeof petParamsSchema>;
export type PetMedicalExamsQuery = z.infer<typeof petMedicalExamsQuerySchema>;
export type CreatePetPayload = z.infer<typeof createPetSchema>;
export type UpdatePetPayload = z.infer<typeof updatePetSchema>;
