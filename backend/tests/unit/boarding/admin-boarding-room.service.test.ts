import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as boardingRoomRepository from "../../../src/modules/boarding/boarding-room.repository.js";
import {
  getAdminBoardingRooms,
  getAdminBoardingRoomDetail,
  getAdminBoardingRoomUsageHistory,
  createAdminBoardingRoom,
  updateAdminBoardingRoom,
  updateAdminBoardingRoomStatus,
  deleteAdminBoardingRoom
} from "../../../src/modules/boarding/admin/admin-boarding-room.service.js";

vi.mock("../../../src/modules/boarding/boarding-room.repository.js");
vi.mock("../../../src/shared/utils/id.js", () => ({
  createId: vi.fn().mockResolvedValue("rt_mock"),
}));

const mockRepo = vi.mocked(boardingRoomRepository);

describe("admin-boarding-room.service unit tests", () => {
  const adminUser = { userId: "adm_1", role: "ADMIN" as const, email: "admin@example.com", fullName: "Admin" };
  const ownerUser = { userId: "own_1", role: "OWNER" as const, email: "owner@example.com", fullName: "Owner" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminBoardingRooms", () => {
    it("UTX-BOARDING-083 - getAdminBoardingRooms returns lists of rooms with stats and pagination", async () => {
      mockRepo.findAdminBoardingRoomsBase.mockResolvedValue([
        { room_type_id: "rt1", room_type_name: "Deluxe", capacity: 10, current_occupancy: 2, boarding_unit_price: 200000, room_type_status: "active" }
      ] as any);
      mockRepo.findAdminBoardingRoomsStatsBase.mockResolvedValue([
        { room_type_id: "rt1", capacity: 10, current_occupancy: 2, room_type_status: "active" }
      ] as any);

      const result = await getAdminBoardingRooms(adminUser, { page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.stats.totalCapacity).toBe(10);
      expect(result.stats.stayingPets).toBe(2);
      expect(result.pagination.total).toBe(1);
    });

    it("UTX-BOARDING-084 - getAdminBoardingRooms throws FORBIDDEN if user is not ADMIN", async () => {
      await expect(getAdminBoardingRooms(ownerUser, {})).rejects.toThrowError(
        expect.objectContaining({ code: "FORBIDDEN", statusCode: httpStatus.FORBIDDEN })
      );
    });
  });

  describe("getAdminBoardingRoomDetail", () => {
    it("UTX-BOARDING-085 - getAdminBoardingRoomDetail returns detail of room type", async () => {
      mockRepo.findAdminBoardingRoomDetailRow.mockResolvedValue({
        room_type_id: "rt1",
        room_type_name: "Deluxe",
        capacity: 10,
        current_occupancy: 3,
        boarding_unit_price: 200000,
        room_type_status: "active"
      } as any);
      mockRepo.findAdminBoardingRoomUsageStats.mockResolvedValue({
        total_records: 15,
        currently_staying: 3,
        checked_out: 10,
        cancelled_or_rejected: 2,
        estimated_revenue: 2500000
      } as any);

      const result = await getAdminBoardingRoomDetail(adminUser, "rt1");
      expect(result.id).toBe("rt1");
      expect(result.usageStats.totalRecords).toBe(15);
      expect(result.availableSlots).toBe(7);
    });

    it("UTX-BOARDING-086 - getAdminBoardingRoomDetail throws NOT_FOUND if room type is missing", async () => {
      mockRepo.findAdminBoardingRoomDetailRow.mockResolvedValue(null);

      await expect(getAdminBoardingRoomDetail(adminUser, "invalid")).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("getAdminBoardingRoomUsageHistory", () => {
    it("UTX-BOARDING-087 - getAdminBoardingRoomUsageHistory returns records usage list with paginated results", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1" } as any);
      mockRepo.findAdminBoardingRoomUsageHistoryRows.mockResolvedValue([
        { boarding_record_id: "rec_1", planned_check_in_at: "2026-06-20", planned_check_out_at: "2026-06-21", invoice_status: "paid" }
      ] as any);
      mockRepo.countAdminBoardingRoomUsageHistory.mockResolvedValue(1);

      const result = await getAdminBoardingRoomUsageHistory(adminUser, "rt1", { page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("UTX-BOARDING-088 - getAdminBoardingRoomUsageHistory throws NOT_FOUND for invalid ID", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue(null);

      await expect(getAdminBoardingRoomUsageHistory(adminUser, "invalid", {})).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("createAdminBoardingRoom", () => {
    const payload = {
      name: "Super Deluxe",
      description: "Huge room",
      capacity: 5,
      boardingUnitPrice: 500000,
      status: "active" as const
    };

    it("UTX-BOARDING-089 - createAdminBoardingRoom successfully creates room type", async () => {
      mockRepo.checkRoomTypeNameExists.mockResolvedValue(false);
      mockRepo.createAdminBoardingRoom.mockResolvedValue({
        room_type_id: "rt_mock",
        room_type_name: payload.name,
        description: payload.description,
        capacity: payload.capacity,
        boarding_unit_price: payload.boardingUnitPrice,
        room_type_status: payload.status
      } as any);

      const result = await createAdminBoardingRoom(adminUser, payload);
      expect(result.id).toBe("rt_mock");
      expect(result.name).toBe("Super Deluxe");
    });

    it("UTX-BOARDING-090 - createAdminBoardingRoom throws AppError if name already exists", async () => {
      mockRepo.checkRoomTypeNameExists.mockResolvedValue(true);

      await expect(createAdminBoardingRoom(adminUser, payload)).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_NAME_EXISTS", statusCode: httpStatus.BAD_REQUEST })
      );
    });
  });

  describe("updateAdminBoardingRoom", () => {
    it("UTX-BOARDING-091 - updateAdminBoardingRoom updates room details successfully", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1", room_type_name: "Deluxe" } as any);
      mockRepo.checkRoomTypeNameExists.mockResolvedValue(false);
      mockRepo.countStayingPetsByRoomType.mockResolvedValue(2);
      mockRepo.updateAdminBoardingRoom.mockResolvedValue({} as any);

      // Setup detail mock for result check
      mockRepo.findAdminBoardingRoomDetailRow.mockResolvedValue({
        room_type_id: "rt1",
        room_type_name: "Deluxe Updated",
        capacity: 10,
        current_occupancy: 2,
        boarding_unit_price: 220000,
        room_type_status: "active"
      } as any);
      mockRepo.findAdminBoardingRoomUsageStats.mockResolvedValue({} as any);

      const result = await updateAdminBoardingRoom(adminUser, "rt1", { name: "Deluxe Updated", capacity: 10 });
      expect(result.name).toBe("Deluxe Updated");
      expect(mockRepo.updateAdminBoardingRoom).toHaveBeenCalled();
    });

    it("UTX-BOARDING-092 - updateAdminBoardingRoom throws errors for missing room or too small capacity", async () => {
      // Missing room
      mockRepo.findRoomTypeById.mockResolvedValue(null);
      await expect(updateAdminBoardingRoom(adminUser, "rt1", {})).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );

      // Too small capacity (staying count is 5, trying to reduce to 4)
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1", room_type_name: "Deluxe" } as any);
      mockRepo.countStayingPetsByRoomType.mockResolvedValue(5);
      await expect(updateAdminBoardingRoom(adminUser, "rt1", { capacity: 4 })).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_CAPACITY_TOO_SMALL", statusCode: httpStatus.BAD_REQUEST })
      );
    });
  });

  describe("updateAdminBoardingRoomStatus", () => {
    it("UTX-BOARDING-093 - updateAdminBoardingRoomStatus updates status successfully", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1", room_type_status: "active" } as any);
      mockRepo.findAdminBoardingRoomDetailRow.mockResolvedValue({
        room_type_id: "rt1",
        room_type_status: "inactive"
      } as any);
      mockRepo.findAdminBoardingRoomUsageStats.mockResolvedValue({} as any);

      const result = await updateAdminBoardingRoomStatus(adminUser, "rt1", { status: "inactive" });
      expect(result.status).toBe("inactive");
      expect(mockRepo.updateAdminBoardingRoomStatus).toHaveBeenCalledWith("rt1", "inactive");
    });

    it("UTX-BOARDING-094 - updateAdminBoardingRoomStatus throws NOT_FOUND for invalid ID", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue(null);

      await expect(updateAdminBoardingRoomStatus(adminUser, "invalid", { status: "active" })).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("deleteAdminBoardingRoom", () => {
    it("UTX-BOARDING-095 - deleteAdminBoardingRoom deletes room successfully if no history or occupants exist", async () => {
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1" } as any);
      mockRepo.countStayingPetsByRoomType.mockResolvedValue(0);
      mockRepo.countBoardingRecordsByRoomType.mockResolvedValue(0);

      const result = await deleteAdminBoardingRoom(adminUser, "rt1");
      expect(result.deleted).toBe(true);
      expect(mockRepo.deleteAdminBoardingRoom).toHaveBeenCalledWith("rt1");
    });

    it("UTX-BOARDING-096 - deleteAdminBoardingRoom deactivates room if history exists or throws error if occupants exist", async () => {
      // Occupants exist
      mockRepo.findRoomTypeById.mockResolvedValue({ room_type_id: "rt1" } as any);
      mockRepo.countStayingPetsByRoomType.mockResolvedValue(2);
      await expect(deleteAdminBoardingRoom(adminUser, "rt1")).rejects.toThrowError(
        expect.objectContaining({ code: "ROOM_TYPE_HAS_STAYING_PETS", statusCode: httpStatus.BAD_REQUEST })
      );

      // Usage history exists (so deactivates to inactive instead of deleting)
      mockRepo.countStayingPetsByRoomType.mockResolvedValue(0);
      mockRepo.countBoardingRecordsByRoomType.mockResolvedValue(5);

      const result = await deleteAdminBoardingRoom(adminUser, "rt1");
      expect(result.deleted).toBe(false);
      expect(result.deactivated).toBe(true);
      expect(mockRepo.updateAdminBoardingRoomStatus).toHaveBeenCalledWith("rt1", "inactive");
    });
  });
});
