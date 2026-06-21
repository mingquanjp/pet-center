import { afterEach, describe, expect, it, vi } from "vitest";
import { assertBoardingTransition } from "../../../src/modules/boarding/boarding-status.policy.js";
import { assertSchedulableTime, getVietnamTimeParts } from "../../../src/modules/grooming/grooming-availability.policy.js";
import {
  getOwnerInvoiceNote,
  mapInvoiceStatus,
  mapOwnerInvoiceStatus,
  mapPaymentOption,
} from "../../../src/modules/invoices/invoice-status.mapper.js";
import { mapServiceType } from "../../../src/modules/invoices/invoice-service-type.mapper.js";
import {
  formatAppointmentCode,
  formatExaminationCode,
  formatPetAge,
  mapStatus,
  mapTypeCode,
} from "../../../src/modules/appointments/appointment.mapper.js";

describe("boarding status policy", () => {
  it.each([
    ["pending", "confirmed"], ["pending", "rejected"], ["confirmed", "staying"], ["staying", "checked_out"],
  ] as const)("allows %s -> %s", (current, next) => {
    expect(() => assertBoardingTransition(current, next)).not.toThrow();
  });

  it.each([
    ["checked_out", "staying"], ["cancelled", "confirmed"], ["rejected", "pending"], ["staying", "cancelled"],
  ] as const)("rejects %s -> %s", (current, next) => {
    expect(() => assertBoardingTransition(current, next)).toThrowError(expect.objectContaining({ code: "INVALID_BOARDING_STATUS", statusCode: 400 }));
  });
});

describe("grooming availability policy", () => {
  afterEach(() => vi.useRealTimers());

  it("extracts Vietnam time parts", () => {
    expect(getVietnamTimeParts(new Date("2026-06-20T01:30:00.000Z"))).toEqual({ hour: 8, minute: 30 });
  });

  it.each(["2026-06-20T01:00:00.000Z", "2026-06-20T10:30:00.000Z"])("accepts a valid slot %s", (slot) => {
    vi.setSystemTime(new Date("2026-06-19T00:00:00.000Z"));
    expect(() => assertSchedulableTime(new Date(slot))).not.toThrow();
  });

  it.each(["2026-06-20T00:30:00.000Z", "2026-06-20T10:45:00.000Z", "2026-06-20T11:00:00.000Z"])("rejects an invalid slot %s", (slot) => {
    vi.setSystemTime(new Date("2026-06-19T00:00:00.000Z"));
    expect(() => assertSchedulableTime(new Date(slot))).toThrowError(expect.objectContaining({ code: "INVALID_SCHEDULE_TIME" }));
  });

  it("rejects a past slot", () => {
    vi.setSystemTime(new Date("2026-06-20T02:00:00.000Z"));
    expect(() => assertSchedulableTime(new Date("2026-06-20T01:30:00.000Z"))).toThrowError(expect.objectContaining({ code: "INVALID_SCHEDULE_TIME" }));
  });
});

describe("invoice and appointment mappers", () => {
  it("maps invoice statuses and payment options", () => {
    const past = new Date("2020-01-01T00:00:00.000Z");
    expect(mapInvoiceStatus("pending_payment", past, "counter")).toBe("OVERDUE");
    expect(mapInvoiceStatus("pending_payment", null, "online")).toBe("PAID");
    expect(mapOwnerInvoiceStatus("paid", null, null)).toBe("PAID");
    expect(mapOwnerInvoiceStatus("pending_payment", past, null)).toBe("OVERDUE");
    expect(mapPaymentOption("online")).toBe("ONLINE");
    expect(mapPaymentOption("counter")).toBe("AT_COUNTER");
    expect(getOwnerInvoiceNote("CANCELLED")).not.toBe("");
  });

  it.each([
    ["medical_exam", "MEDICAL"], ["grooming", "GROOMING"], ["boarding", "BOARDING"],
    ["prescription", "PRESCRIPTION"], [null, "OTHER"], ["unknown", "OTHER"],
  ])("maps service source %#", (source, expected) => {
    expect(mapServiceType(source)).toBe(expected);
  });

  it("normalizes simple appointment fields", () => {
    expect(mapStatus("pending")).toBe("PENDING");
    expect(mapTypeCode("general_checkup")).toBe("GENERAL_CHECKUP");
    expect(formatAppointmentCode("appt_1")).toBe("appt_1");
    expect(formatExaminationCode("mex_1")).toBe("mex_1");
  });

  it("formats estimated age and rejects invalid age", () => {
    expect(formatPetAge({ birth_date: null, estimated_age: "2" } as any)).toContain("2");
    expect(formatPetAge({ birth_date: null, estimated_age: "0.5" } as any)).not.toBeUndefined();
    expect(formatPetAge({ birth_date: null, estimated_age: "invalid" } as any)).toBeUndefined();
    expect(formatPetAge({ birth_date: null, estimated_age: null } as any)).toBeUndefined();
  });
});
