import { describe, expect, it } from "vitest";
import {
  bookingOptionsQuerySchema,
  availabilityQuerySchema,
  listGroomingTicketsQuerySchema,
  listGroomingTicketHistoryQuerySchema,
  groomingTicketParamsSchema,
  createGroomingTicketSchema
} from "../../../src/modules/grooming/grooming.schema.js";

function expectIssue(schema: any, payload: any, message?: string): void {
  const result = schema.safeParse(payload);
  expect(result.success).toBe(false);
  if (!result.success && message) {
    expect(result.error.issues.some((issue: any) => issue.message.includes(message))).toBe(true);
  }
}

describe("grooming.schema unit tests", () => {
  describe("bookingOptionsQuerySchema", () => {
    it("UTX-GROOMING-206 - bookingOptionsQuerySchema accepts valid petId or empty payload", () => {
      expect(bookingOptionsQuerySchema.safeParse({}).success).toBe(true);
      expect(bookingOptionsQuerySchema.safeParse({ petId: "pet_123" }).success).toBe(true);
    });

    it("UTX-GROOMING-207 - bookingOptionsQuerySchema rejects too long petId", () => {
      expectIssue(bookingOptionsQuerySchema, { petId: "a".repeat(31) });
    });
  });

  describe("availabilityQuerySchema", () => {
    it("UTX-GROOMING-208 - availabilityQuerySchema accepts valid date and optional serviceId", () => {
      expect(availabilityQuerySchema.safeParse({ date: "2026-06-20" }).success).toBe(true);
      expect(availabilityQuerySchema.safeParse({ date: "2026-06-20", serviceId: "service_abc" }).success).toBe(true);
    });

    it("UTX-GROOMING-209 - availabilityQuerySchema rejects invalid date or too long serviceId", () => {
      expectIssue(availabilityQuerySchema, { date: "invalid-date" });
      expectIssue(availabilityQuerySchema, { date: "2026-06-20", serviceId: "s".repeat(31) });
    });
  });

  describe("listGroomingTicketsQuerySchema", () => {
    const validPayload = {
      search: "premium",
      petId: "pet_1",
      status: "pending",
      timeRange: "today",
      page: 2,
      limit: 20
    };

    it("UTX-GROOMING-210 - listGroomingTicketsQuerySchema accepts valid filter payload", () => {
      expect(listGroomingTicketsQuerySchema.safeParse(validPayload).success).toBe(true);
      expect(listGroomingTicketsQuerySchema.safeParse({}).success).toBe(true);
    });

    it("UTX-GROOMING-211 - listGroomingTicketsQuerySchema rejects invalid enum values or out of bounds pagination", () => {
      expectIssue(listGroomingTicketsQuerySchema, { status: "invalid_status" });
      expectIssue(listGroomingTicketsQuerySchema, { timeRange: "invalid_range" });
      expectIssue(listGroomingTicketsQuerySchema, { page: 0 });
      expectIssue(listGroomingTicketsQuerySchema, { limit: 101 });
    });
  });

  describe("listGroomingTicketHistoryQuerySchema", () => {
    const validPayload = {
      search: "history",
      petId: "pet_2",
      status: "completed",
      timeRange: "past",
      page: 1,
      limit: 10
    };

    it("UTX-GROOMING-212 - listGroomingTicketHistoryQuerySchema accepts valid payload", () => {
      expect(listGroomingTicketHistoryQuerySchema.safeParse(validPayload).success).toBe(true);
      expect(listGroomingTicketHistoryQuerySchema.safeParse({}).success).toBe(true);
    });

    it("UTX-GROOMING-213 - listGroomingTicketHistoryQuerySchema rejects invalid enum or wrong pagination", () => {
      expectIssue(listGroomingTicketHistoryQuerySchema, { status: "pending" }); // only completed/cancelled
      expectIssue(listGroomingTicketHistoryQuerySchema, { limit: 0 });
    });
  });

  describe("groomingTicketParamsSchema", () => {
    it("UTX-GROOMING-214 - groomingTicketParamsSchema accepts valid ticketId", () => {
      expect(groomingTicketParamsSchema.safeParse({ ticketId: "ticket_123" }).success).toBe(true);
    });

    it("UTX-GROOMING-215 - groomingTicketParamsSchema rejects empty or too long ticketId", () => {
      expectIssue(groomingTicketParamsSchema, { ticketId: "" });
      expectIssue(groomingTicketParamsSchema, { ticketId: "t".repeat(31) });
    });
  });

  describe("createGroomingTicketSchema", () => {
    const validPayload = {
      petId: "pet_1",
      serviceId: "srv_1",
      scheduledAt: "2026-06-20T10:00:00Z",
      specialRequest: "Handle with care",
      paymentOption: "online"
    };

    it("UTX-GROOMING-216 - createGroomingTicketSchema accepts valid booking inputs", () => {
      expect(createGroomingTicketSchema.safeParse(validPayload).success).toBe(true);
      expect(createGroomingTicketSchema.safeParse({ ...validPayload, specialRequest: null }).success).toBe(true);
    });

    it("UTX-GROOMING-217 - createGroomingTicketSchema rejects missing fields or invalid option", () => {
      expectIssue(createGroomingTicketSchema, { ...validPayload, petId: "" }, "Thú cưng là bắt buộc");
      expectIssue(createGroomingTicketSchema, { ...validPayload, serviceId: "" }, "Dịch vụ là bắt buộc");
      expectIssue(createGroomingTicketSchema, { ...validPayload, paymentOption: "cash" });
    });
  });
});
