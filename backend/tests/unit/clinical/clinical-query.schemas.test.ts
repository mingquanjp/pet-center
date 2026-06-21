import { describe, expect, it } from "vitest";
import { followUpParamsSchema, listDoctorFollowUpsQuerySchema } from "../../../src/modules/follow-ups/follow-ups.schema.js";
import { listDoctorPrescriptionsQuerySchema, prescriptionParamsSchema } from "../../../src/modules/prescriptions/prescriptions.schema.js";
import { getDoctorMedicalRecordDetailParamsSchema, getDoctorMedicalRecordsQuerySchema } from "../../../src/modules/medical-records/medical-records.schema.js";

describe("clinical list and parameter schemas", () => {
  it("UTX-FOLLOW-UPS-SCHEMA-001 applies defaults and coercion", () => {
    expect(listDoctorFollowUpsQuerySchema.parse({})).toMatchObject({ page: 1, limit: 10 });
    expect(listDoctorFollowUpsQuerySchema.parse({ page: "2", limit: "50", status: "overdue" })).toMatchObject({ page: 2, limit: 50 });
  });

  it.each([[{ page: 0 }], [{ limit: 51 }], [{ status: "cancelled" }], [{ search: "x".repeat(121) }]])("UTX-FOLLOW-UPS-SCHEMA-002 rejects invalid query %#", (payload) => {
    expect(listDoctorFollowUpsQuerySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-FOLLOW-UPS-SCHEMA-003 validates follow-up ID boundaries", () => {
    expect(followUpParamsSchema.safeParse({ followUpId: "fui_001" }).success).toBe(true);
    expect(followUpParamsSchema.safeParse({ followUpId: "" }).success).toBe(false);
    expect(followUpParamsSchema.safeParse({ followUpId: "x".repeat(31) }).success).toBe(false);
  });

  it("UTX-PRESCRIPTIONS-SCHEMA-001 applies defaults and accepts valid filters", () => {
    expect(listDoctorPrescriptionsQuerySchema.parse({})).toMatchObject({ page: 1, limit: 10 });
    expect(listDoctorPrescriptionsQuerySchema.safeParse({ status: "prescribed", date: "2026-06-20" }).success).toBe(true);
  });

  it.each([[{ page: 0 }], [{ limit: 51 }], [{ status: "cancelled" }], [{ search: "x".repeat(121) }]])("UTX-PRESCRIPTIONS-SCHEMA-002 rejects invalid query %#", (payload) => {
    expect(listDoctorPrescriptionsQuerySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-PRESCRIPTIONS-SCHEMA-003 validates prescription ID", () => {
    expect(prescriptionParamsSchema.safeParse({ prescriptionId: "pre_001" }).success).toBe(true);
    expect(prescriptionParamsSchema.safeParse({ prescriptionId: "" }).success).toBe(false);
    expect(prescriptionParamsSchema.safeParse({ prescriptionId: "x".repeat(31) }).success).toBe(false);
  });

  it("UTX-MEDICAL-RECORDS-SCHEMA-001 applies defaults", () => {
    expect(getDoctorMedicalRecordsQuerySchema.parse({})).toEqual({ keyword: "", species: "ALL", examStatus: "ALL", page: 1, limit: 10 });
  });

  it.each([[{ species: "Bird" }], [{ examStatus: "draft" }], [{ page: 0 }], [{ limit: 101 }], [{ keyword: "x".repeat(101) }]])("UTX-MEDICAL-RECORDS-SCHEMA-002 rejects invalid query %#", (payload) => {
    expect(getDoctorMedicalRecordsQuerySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-MEDICAL-RECORDS-SCHEMA-003 validates pet ID", () => {
    expect(getDoctorMedicalRecordDetailParamsSchema.safeParse({ petId: "pet_001" }).success).toBe(true);
    expect(getDoctorMedicalRecordDetailParamsSchema.safeParse({ petId: " " }).success).toBe(false);
    expect(getDoctorMedicalRecordDetailParamsSchema.safeParse({ petId: "x".repeat(31) }).success).toBe(false);
  });
});
