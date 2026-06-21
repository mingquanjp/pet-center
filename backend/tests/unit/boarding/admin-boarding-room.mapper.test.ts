import { describe, expect, it } from "vitest";
import {
  formatRoomTypeCode,
  mapAdminBoardingRoomListRow,
  mapAdminBoardingRoomUsageHistoryRow
} from "../../../src/modules/boarding/admin/admin-boarding-room.mapper.js";

describe("admin-boarding-room.mapper unit tests", () => {
  describe("formatRoomTypeCode", () => {
    it("UTX-BOARDING-120 - formatRoomTypeCode formats roomTypeId correctly", () => {
      expect(formatRoomTypeCode("rt1", 0)).toBe("RT-001");
      expect(formatRoomTypeCode("rt12")).toBe("RT-012");
      expect(formatRoomTypeCode("room_abc")).toBe("RT-abc");
    });
  });

  describe("mapAdminBoardingRoomListRow", () => {
    it("UTX-BOARDING-121 - mapAdminBoardingRoomListRow maps DB row to room details DTO correctly", () => {
      const dbRow = {
        room_type_id: "rt1",
        room_type_name: "Deluxe Room",
        description: "Large room",
        capacity: 10,
        current_occupancy: 4,
        boarding_unit_price: 250000,
        room_type_status: "active"
      };

      const result = mapAdminBoardingRoomListRow(dbRow, 0);
      expect(result).toMatchObject({
        id: "rt1",
        code: "RT-001",
        name: "Deluxe Room",
        capacity: 10,
        currentOccupancy: 4,
        availableSlots: 6,
        occupancyRate: 40,
        capacityLevel: "AVAILABLE",
        boardingUnitPrice: 250000,
        status: "active"
      });
    });

    it("UTX-BOARDING-122 - mapAdminBoardingRoomListRow handles occupancy thresholds and empty/null descriptions", () => {
      const fullRow = {
        room_type_id: "rt2",
        room_type_name: "Standard",
        description: null,
        capacity: 5,
        current_occupancy: 5,
        boarding_unit_price: 150000,
        room_type_status: "active"
      };

      const fullResult = mapAdminBoardingRoomListRow(fullRow, 1);
      expect(fullResult.capacityLevel).toBe("FULL");
      expect(fullResult.description).toBeNull();

      const nearFullRow = {
        room_type_id: "rt3",
        capacity: 10,
        current_occupancy: 7
      };
      const nearFullResult = mapAdminBoardingRoomListRow(nearFullRow, 2);
      expect(nearFullResult.capacityLevel).toBe("NEAR_FULL");
    });
  });

  describe("mapAdminBoardingRoomUsageHistoryRow", () => {
    it("UTX-BOARDING-123 - mapAdminBoardingRoomUsageHistoryRow maps record details correctly", () => {
      const row = {
        boarding_record_id: "rec_1",
        room_type_id: "rt1",
        pet_name: "Buddy",
        pet_species: "Dog",
        owner_name: "John",
        planned_check_in_at: "2026-06-20T10:00:00Z",
        planned_check_out_at: "2026-06-22T10:00:00Z",
        actual_check_in_at: "2026-06-20T11:00:00Z",
        actual_check_out_at: null,
        boarding_status: "staying",
        invoice_status: "paid",
        invoice_total: 500000,
        estimated_total: 500000
      };

      const result = mapAdminBoardingRoomUsageHistoryRow(row);
      expect(result).toMatchObject({
        id: "rec_1",
        petName: "Buddy",
        totalDays: 2,
        paymentStatus: "paid",
        totalAmount: 500000
      });
    });

    it("UTX-BOARDING-124 - mapAdminBoardingRoomUsageHistoryRow handles unpaid invoice statuses and falls back to estimated totals", () => {
      const row = {
        boarding_record_id: "rec_2",
        planned_check_in_at: "2026-06-20T10:00:00Z",
        planned_check_out_at: "2026-06-21T10:00:00Z",
        invoice_status: "unpaid",
        invoice_total: 0,
        estimated_total: 250000
      };

      const result = mapAdminBoardingRoomUsageHistoryRow(row);
      expect(result.paymentStatus).toBe("unpaid");
      expect(result.totalAmount).toBe(250000);
      expect(result.totalDays).toBe(1);
    });
  });
});
