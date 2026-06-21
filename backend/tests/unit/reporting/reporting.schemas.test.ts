import { describe, expect, it } from "vitest";
import {
  adminDashboardActivityLogsQuerySchema,
  adminDashboardQuerySchema,
  doctorDashboardQuerySchema,
  staffDashboardQuerySchema,
} from "../../../src/modules/dashboard/dashboard.schema.js";
import { exportAdminReportsSchema, getAdminReportsQuerySchema } from "../../../src/modules/reports/reports.schema.js";
import {
  confirmPaymentSchema,
  invoiceParamsSchema,
  listOwnerInvoicesQuerySchema,
  listStaffInvoicesQuerySchema,
} from "../../../src/modules/invoices/invoices.schema.js";

describe("dashboard schemas", () => {
  it("UTX-DASHBOARD-SCHEMA-001 applies role dashboard defaults", () => {
    expect(staffDashboardQuerySchema.parse({})).toEqual({ taskLimit: 2 });
    expect(doctorDashboardQuerySchema.parse({})).toEqual({ examLimit: 5, activityLimit: 3 });
  });

  it.each([[{ taskLimit: 0 }], [{ taskLimit: 11 }]])("UTX-DASHBOARD-SCHEMA-002 rejects invalid staff limit %#", (payload) => {
    expect(staffDashboardQuerySchema.safeParse(payload).success).toBe(false);
  });

  it("UTX-DASHBOARD-SCHEMA-003 validates date format and ordering", () => {
    expect(adminDashboardQuerySchema.safeParse({ startDate: "2026-06-01", endDate: "2026-06-30" }).success).toBe(true);
    expect(adminDashboardQuerySchema.safeParse({ startDate: "2026/06/01" }).success).toBe(false);
    expect(adminDashboardQuerySchema.safeParse({ startDate: "2026-07-01", endDate: "2026-06-01" }).success).toBe(false);
  });

  it("UTX-DASHBOARD-SCHEMA-004 validates activity pagination", () => {
    expect(adminDashboardActivityLogsQuerySchema.safeParse({ page: "1", limit: "100" }).success).toBe(true);
    expect(adminDashboardActivityLogsQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(adminDashboardActivityLogsQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe("reports schemas", () => {
  it("UTX-REPORTS-SCHEMA-001 applies report defaults", () => {
    expect(getAdminReportsQuerySchema.parse({})).toMatchObject({ timeRange: "LAST_30_DAYS", compareMode: "NONE", groupBy: "DAY", tab: "ALL" });
    expect(exportAdminReportsSchema.parse({})).toMatchObject({ format: "excel" });
  });

  it("UTX-REPORTS-SCHEMA-002 requires both custom dates", () => {
    expect(getAdminReportsQuerySchema.safeParse({ timeRange: "CUSTOM" }).success).toBe(false);
    expect(getAdminReportsQuerySchema.safeParse({ timeRange: "CUSTOM", fromDate: "2026-06-01", toDate: "2026-06-30" }).success).toBe(true);
  });

  it("UTX-REPORTS-SCHEMA-003 rejects reversed range and invalid enum values", () => {
    expect(getAdminReportsQuerySchema.safeParse({ fromDate: "2026-07-01", toDate: "2026-06-01" }).success).toBe(false);
    expect(getAdminReportsQuerySchema.safeParse({ groupBy: "HOUR" }).success).toBe(false);
    expect(exportAdminReportsSchema.safeParse({ format: "csv" }).success).toBe(false);
  });
});

describe("invoice schemas", () => {
  it("UTX-INVOICES-SCHEMA-001 applies pagination defaults", () => {
    expect(listStaffInvoicesQuerySchema.parse({})).toMatchObject({ limit: 10 });
    expect(listOwnerInvoicesQuerySchema.parse({})).toMatchObject({ page: 1, limit: 6 });
  });

  it.each([
    [listStaffInvoicesQuerySchema, { limit: 51 }],
    [listStaffInvoicesQuerySchema, { status: "REFUNDED" }],
    [listOwnerInvoicesQuerySchema, { page: 0 }],
    [listOwnerInvoicesQuerySchema, { serviceType: "OTHER" }],
  ] as const)("UTX-INVOICES-SCHEMA-002 rejects invalid query %#", (schema, payload) => {
    expect(schema.safeParse(payload).success).toBe(false);
  });

  it("UTX-INVOICES-SCHEMA-003 validates payment method and invoice ID", () => {
    expect(confirmPaymentSchema.safeParse({ paymentMethod: "at_counter" }).success).toBe(true);
    expect(confirmPaymentSchema.safeParse({ paymentMethod: "online" }).success).toBe(false);
    expect(invoiceParamsSchema.safeParse({ invoiceId: "inv_001" }).success).toBe(true);
    expect(invoiceParamsSchema.safeParse({ invoiceId: "x".repeat(31) }).success).toBe(false);
  });
});
