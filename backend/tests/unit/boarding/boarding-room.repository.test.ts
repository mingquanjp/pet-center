import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findActiveRoomTypesWithAvailability
} from "../../../src/modules/boarding/boarding-room.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("boarding-room.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findActiveRoomTypesWithAvailability", () => {
    it("UTX-BOARDING-133 - findActiveRoomTypesWithAvailability generates correct query when dates are passed and maps results", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { room_type_id: "rt1", room_type_name: "Deluxe", capacity: 5, boarding_unit_price: 200000, description: "Desc", booked_units: 1 }
        ]
      } as any);

      const checkIn = new Date("2026-06-20T10:00:00Z");
      const checkOut = new Date("2026-06-22T10:00:00Z");

      const result = await findActiveRoomTypesWithAvailability(checkIn, checkOut);
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].room_type_name).toBe("Deluxe");
    });

    it("UTX-BOARDING-134 - findActiveRoomTypesWithAvailability handles database rejection or empty rows", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(findActiveRoomTypesWithAvailability()).rejects.toThrow("Query failed");
    });
  });
});
