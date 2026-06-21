import { describe, expect, it } from "vitest";
import {
  listBoardingRecordsQuerySchema,
  boardingBookingOptionsQuerySchema,
  createBoardingRecordSchema,
  boardingRecordParamsSchema,
  staffBoardingIdParamsSchema,
  staffBoardingOwnerParamsSchema
} from "../../../src/modules/boarding/boarding.schema.js";

function expectIssue(schema: any, payload: any, message?: string): void {
  const result = schema.safeParse(payload);
  expect(result.success).toBe(false);
  if (!result.success && message) {
    expect(result.error.issues.some((issue: any) => issue.message.includes(message))).toBe(true);
  }
}

describe("boarding.schema unit tests", () => {
  describe("listBoardingRecordsQuerySchema", () => {
    it("UTX-BOARDING-106 - listBoardingRecordsQuerySchema accepts valid filter payload", () => {
      expect(listBoardingRecordsQuerySchema.safeParse({ search: "Buddy", page: 1, limit: 10 }).success).toBe(true);
      expect(listBoardingRecordsQuerySchema.safeParse({}).success).toBe(true);
    });

    it("UTX-BOARDING-107 - listBoardingRecordsQuerySchema rejects invalid enum values or pagination", () => {
      expectIssue(listBoardingRecordsQuerySchema, { status: "invalid_status" });
      expectIssue(listBoardingRecordsQuerySchema, { limit: 101 });
      expectIssue(listBoardingRecordsQuerySchema, { page: 0 });
    });
  });

  describe("boardingBookingOptionsQuerySchema", () => {
    it("UTX-BOARDING-108 - boardingBookingOptionsQuerySchema accepts valid options", () => {
      expect(boardingBookingOptionsQuerySchema.safeParse({ petId: "pet_123", plannedCheckInAt: "2026-06-20", plannedCheckOutAt: "2026-06-25" }).success).toBe(true);
      expect(boardingBookingOptionsQuerySchema.safeParse({}).success).toBe(true);
    });

    it("UTX-BOARDING-109 - boardingBookingOptionsQuerySchema rejects too long petId or invalid dates", () => {
      expectIssue(boardingBookingOptionsQuerySchema, { petId: "p".repeat(31) });
      expectIssue(boardingBookingOptionsQuerySchema, { plannedCheckInAt: "invalid-date" });
    });
  });

  describe("createBoardingRecordSchema", () => {
    const validPayload = {
      petId: "pet_1",
      roomTypeId: "room_1",
      plannedCheckInAt: "2026-06-20T10:00:00Z",
      plannedCheckOutAt: "2026-06-22T10:00:00Z",
      paymentOption: "online" as const,
      careRequest: "Feed twice a day"
    };

    it("UTX-BOARDING-110 - createBoardingRecordSchema accepts valid payload within boundaries", () => {
      expect(createBoardingRecordSchema.safeParse(validPayload).success).toBe(true);
      expect(createBoardingRecordSchema.safeParse({ ...validPayload, careRequest: null }).success).toBe(true);
    });

    it("UTX-BOARDING-111 - createBoardingRecordSchema rejects missing fields or invalid option", () => {
      expectIssue(createBoardingRecordSchema, { ...validPayload, petId: "" }, "Thú cưng là bắt buộc");
      expectIssue(createBoardingRecordSchema, { ...validPayload, roomTypeId: "" }, "Loại phòng là bắt buộc");
      expectIssue(createBoardingRecordSchema, { ...validPayload, paymentOption: "cash" });
    });
  });

  describe("boardingRecordParamsSchema", () => {
    it("UTX-BOARDING-112 - boardingRecordParamsSchema accepts valid boardingRecordId", () => {
      expect(boardingRecordParamsSchema.safeParse({ boardingRecordId: "rec_123" }).success).toBe(true);
    });

    it("UTX-BOARDING-113 - boardingRecordParamsSchema rejects empty or too long ID", () => {
      expectIssue(boardingRecordParamsSchema, { boardingRecordId: "" });
      expectIssue(boardingRecordParamsSchema, { boardingRecordId: "r".repeat(31) });
    });
  });

  describe("staffBoardingIdParamsSchema", () => {
    it("UTX-BOARDING-114 - staffBoardingIdParamsSchema accepts valid boardingId", () => {
      expect(staffBoardingIdParamsSchema.safeParse({ boardingId: "board_123" }).success).toBe(true);
    });

    it("UTX-BOARDING-115 - staffBoardingIdParamsSchema rejects empty or too long ID", () => {
      expectIssue(staffBoardingIdParamsSchema, { boardingId: "" });
      expectIssue(staffBoardingIdParamsSchema, { boardingId: "b".repeat(61) });
    });
  });

  describe("staffBoardingOwnerParamsSchema", () => {
    it("UTX-BOARDING-116 - staffBoardingOwnerParamsSchema accepts valid ownerId", () => {
      expect(staffBoardingOwnerParamsSchema.safeParse({ ownerId: "own_123" }).success).toBe(true);
    });

    it("UTX-BOARDING-117 - staffBoardingOwnerParamsSchema rejects empty or too long ID", () => {
      expectIssue(staffBoardingOwnerParamsSchema, { ownerId: "" });
      expectIssue(staffBoardingOwnerParamsSchema, { ownerId: "o".repeat(31) });
    });
  });
});
