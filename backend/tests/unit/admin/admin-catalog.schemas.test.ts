import { describe, expect, it } from "vitest";
import {
  adminUserActivitiesQuerySchema,
  adminUserIdParamsSchema,
  createAdminUserBodySchema,
  listAdminUsersQuerySchema,
  updateAdminUserBodySchema,
} from "../../../src/modules/users/users.schema.js";
import {
  createAdminMedicineSchema,
  getAdminMedicinesQuerySchema,
  medicineIdParamSchema,
  updateAdminMedicineSchema,
  updateAdminMedicineStatusSchema,
} from "../../../src/modules/medicines/medicines.schema.js";
import {
  createAdminServiceCategorySchema,
  getAdminServiceCategoriesQuerySchema,
  serviceCategoryIdParamSchema,
  updateAdminServiceCategorySchema,
  updateAdminServiceCategoryStatusSchema,
} from "../../../src/modules/service-categories/service-categories.schema.js";

describe("admin user schemas", () => {
  it("UTX-USERS-SCHEMA-001 applies list defaults and coercion", () => {
    expect(listAdminUsersQuerySchema.parse({})).toMatchObject({ page: 1, limit: 10 });
    expect(listAdminUsersQuerySchema.parse({ page: "2", limit: "50", role: "Doctor" })).toMatchObject({ page: 2, limit: 50, role: "Doctor" });
  });

  it.each([
    [{ page: 0 }], [{ limit: 51 }], [{ role: "Vet" }], [{ status: "deleted" }],
  ])("UTX-USERS-SCHEMA-002 rejects invalid list query %#", (payload) => {
    expect(listAdminUsersQuerySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-USERS-SCHEMA-003 accepts a complete valid user and defaults status", () => {
    const result = createAdminUserBodySchema.parse({
      fullName: "Nguyen Van An", email: "an@example.com", password: "Valid@123", role: "Staff", phoneNumber: "+84 901 234 567",
    });
    expect(result.accountStatus).toBe("active");
  });

  it.each([
    [{ fullName: "A", email: "an@example.com", password: "Valid@123", role: "Staff" }],
    [{ fullName: "Valid Name", email: "invalid", password: "Valid@123", role: "Staff" }],
    [{ fullName: "Valid Name", email: "an@example.com", password: "short", role: "Staff" }],
    [{ fullName: "Valid Name", email: "an@example.com", password: "Valid@123", role: "Vet" }],
    [{ fullName: "Valid Name", email: "an@example.com", password: "Valid@123", role: "Staff", phoneNumber: "123" }],
  ])("UTX-USERS-SCHEMA-004 rejects invalid create payload %#", (payload) => {
    expect(createAdminUserBodySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-USERS-SCHEMA-005 accepts partial updates including nullable profile fields", () => {
    expect(updateAdminUserBodySchema.safeParse({ phoneNumber: null, address: null, accountStatus: "locked" }).success).toBe(true);
  });

  it("UTX-USERS-SCHEMA-006 validates identifiers and activity pagination", () => {
    expect(adminUserIdParamsSchema.safeParse({ userId: "" }).success).toBe(false);
    expect(adminUserActivitiesQuerySchema.parse({})).toEqual({ limit: 5, offset: 0 });
    expect(adminUserActivitiesQuerySchema.safeParse({ limit: 21 }).success).toBe(false);
    expect(adminUserActivitiesQuerySchema.safeParse({ offset: -1 }).success).toBe(false);
  });
});

describe("admin medicine schemas", () => {
  const validMedicine = { medicineName: "Amoxicillin", unit: "tablet", unitPrice: 12_000 };

  it("UTX-MEDICINES-SCHEMA-001 defaults stock and status", () => {
    expect(createAdminMedicineSchema.parse(validMedicine)).toMatchObject({ stockQuantity: 0, medicineStatus: "active" });
  });

  it.each([
    [{ ...validMedicine, medicineName: "" }], [{ ...validMedicine, unit: "" }],
    [{ ...validMedicine, unitPrice: -1 }], [{ ...validMedicine, stockQuantity: -1 }],
    [{ ...validMedicine, stockQuantity: 1.5 }], [{ ...validMedicine, medicineStatus: "deleted" }],
  ])("UTX-MEDICINES-SCHEMA-002 rejects invalid create payload %#", (payload) => {
    expect(createAdminMedicineSchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-MEDICINES-SCHEMA-003 requires at least one update field", () => {
    expect(updateAdminMedicineSchema.safeParse({}).success).toBe(false);
    expect(updateAdminMedicineSchema.safeParse({ stockQuantity: 10 }).success).toBe(true);
  });

  it("UTX-MEDICINES-SCHEMA-004 validates status, ID and query boundaries", () => {
    expect(updateAdminMedicineStatusSchema.safeParse({ medicineStatus: "inactive" }).success).toBe(true);
    expect(updateAdminMedicineStatusSchema.safeParse({ medicineStatus: "archived" }).success).toBe(false);
    expect(medicineIdParamSchema.safeParse({ medicineId: "" }).success).toBe(false);
    expect(getAdminMedicinesQuerySchema.parse({ page: "2", limit: "100" })).toMatchObject({ page: 2, limit: 100 });
    expect(getAdminMedicinesQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
  });
});

describe("admin service category schemas", () => {
  const validService = { serviceName: "Khám tổng quát", category: "medical", durationMinutes: 30, basePrice: 200_000 };

  it("UTX-SERVICE-CATEGORIES-SCHEMA-001 accepts valid service and defaults status", () => {
    expect(createAdminServiceCategorySchema.parse(validService)).toMatchObject({ status: "active" });
  });

  it.each([
    [{ ...validService, serviceName: "" }], [{ ...validService, category: "boarding" }],
    [{ ...validService, durationMinutes: 0 }], [{ ...validService, durationMinutes: 1.5 }],
    [{ ...validService, basePrice: -1 }],
  ])("UTX-SERVICE-CATEGORIES-SCHEMA-002 rejects invalid create payload %#", (payload) => {
    expect(createAdminServiceCategorySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-SERVICE-CATEGORIES-SCHEMA-003 requires update content", () => {
    expect(updateAdminServiceCategorySchema.safeParse({}).success).toBe(false);
    expect(updateAdminServiceCategorySchema.safeParse({ description: null }).success).toBe(true);
  });

  it("UTX-SERVICE-CATEGORIES-SCHEMA-004 validates status, ID and list boundaries", () => {
    expect(updateAdminServiceCategoryStatusSchema.safeParse({ status: "inactive" }).success).toBe(true);
    expect(updateAdminServiceCategoryStatusSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(serviceCategoryIdParamSchema.safeParse({ serviceId: "" }).success).toBe(false);
    expect(getAdminServiceCategoriesQuerySchema.parse({ page: "3", limit: "20" })).toMatchObject({ page: 3, limit: 20 });
    expect(getAdminServiceCategoriesQuerySchema.safeParse({ category: "boarding" }).success).toBe(false);
  });
});
