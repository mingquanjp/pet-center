import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as ownerBoardingRepository from "../../../src/modules/boarding/owner/owner-boarding.repository.js";
import * as boardingRoomRepository from "../../../src/modules/boarding/boarding-room.repository.js";
import * as boardingUpdateRepository from "../../../src/modules/boarding/boarding-update.repository.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";
import {
  getBookingOptions,
  createBoardingRecord,
  getOwnerBoardingRecordDetail,
  cancelOwnerBoardingRecord,
  listOwnerBoardingRecords
} from "../../../src/modules/boarding/owner/owner-boarding.service.js";

vi.mock("../../../src/modules/boarding/owner/owner-boarding.repository.js");
vi.mock("../../../src/modules/boarding/boarding-room.repository.js");
vi.mock("../../../src/modules/boarding/boarding-update.repository.js");
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  upsertPetActivityLog: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../src/modules/boarding/boarding-notification.publisher.js", () => ({
  boardingNotificationPublisher: {
    boardingCreated: vi.fn().mockResolvedValue(undefined),
    boardingCancelled: vi.fn().mockResolvedValue(undefined),
  }
}));

const mockOwnerRepo = vi.mocked(ownerBoardingRepository);
const mockRoomRepo = vi.mocked(boardingRoomRepository);
const mockUpdateRepo = vi.mocked(boardingUpdateRepository);
const mockActivityLogs = vi.mocked(petActivityLogs);

describe("owner-boarding.service unit tests", () => {
  const ownerUser = { userId: "own_1", role: "OWNER" as const, email: "owner@example.com", fullName: "John Owner" };
  const staffUser = { userId: "stf_1", role: "STAFF" as const, email: "staff@example.com", fullName: "Jane Staff" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBookingOptions", () => {
    it("UTX-BOARDING-097 - getBookingOptions returns owner pets and room types with availability stats", async () => {
      mockOwnerRepo.findOwnerBookingPets.mockResolvedValue([{ pet_id: "pet_1", pet_name: "Buddy", species: "Dog", weight_kg: 10, profile_image_url: null }] as any);
      mockOwnerRepo.findOwnerBookingPet.mockResolvedValue({ pet_id: "pet_1", pet_name: "Buddy", species: "Dog", weight_kg: 10, profile_image_url: null } as any);
      mockRoomRepo.findActiveRoomTypesWithAvailability.mockResolvedValue([
        { room_type_id: "rt1", room_type_name: "Deluxe", capacity: 5, booked_units: 2, boarding_unit_price: 200000, description: "Desc" }
      ] as any);

      // dates in future
      const plannedCheckInAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const plannedCheckOutAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

      const result = await getBookingOptions(ownerUser, { petId: "pet_1", plannedCheckInAt, plannedCheckOutAt });
      expect(result.pets).toHaveLength(1);
      expect(result.selectedPet?.petName).toBe("Buddy");
      expect(result.roomTypes).toHaveLength(1);
      expect(result.roomTypes[0].availableUnits).toBe(3);
    });

    it("UTX-BOARDING-098 - getBookingOptions throws PET_NOT_FOUND when specified pet does not belong to owner", async () => {
      mockOwnerRepo.findOwnerBookingPets.mockResolvedValue([]);
      mockOwnerRepo.findOwnerBookingPet.mockResolvedValue(null);

      await expect(getBookingOptions(ownerUser, { petId: "invalid_pet" })).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("createBoardingRecord", () => {
    const payload = {
      petId: "pet_1",
      roomTypeId: "rt1",
      plannedCheckInAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      plannedCheckOutAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      paymentOption: "online" as const,
      careRequest: "Feed daily"
    };

    it("UTX-BOARDING-099 - createBoardingRecord successfully creates booking, issues invoice and logs activity", async () => {
      mockOwnerRepo.findOwnerBookingPet.mockResolvedValue({ pet_id: "pet_1", pet_name: "Buddy", species: "Dog", weight_kg: 10, profile_image_url: null } as any);
      mockRoomRepo.findActiveRoomTypesWithAvailability.mockResolvedValue([
        { room_type_id: "rt1", room_type_name: "Deluxe", capacity: 5, booked_units: 2, boarding_unit_price: 200000, description: "Desc" }
      ] as any);
      mockOwnerRepo.createBoardingRecord.mockResolvedValue({
        boardingRecordId: "rec_1",
        boardingStatus: "scheduled",
        invoiceId: "inv_1",
        totalAmount: 400000
      } as any);

      const result = await createBoardingRecord(ownerUser, payload, "127.0.0.1");
      expect(result.boardingRecordId).toBe("rec_1");
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledTimes(2);
    });

    it("UTX-BOARDING-100 - createBoardingRecord throws error if room type not found or room is full", async () => {
      mockOwnerRepo.findOwnerBookingPet.mockResolvedValue({ pet_id: "pet_1", pet_name: "Buddy", species: "Dog", weight_kg: 10 } as any);
      
      // Room full
      mockRoomRepo.findActiveRoomTypesWithAvailability.mockResolvedValue([
        { room_type_id: "rt1", room_type_name: "Deluxe", capacity: 5, booked_units: 5, boarding_unit_price: 200000 }
      ] as any);

      await expect(createBoardingRecord(ownerUser, payload, "127.0.0.1")).rejects.toThrowError(
        expect.objectContaining({ code: "BOARDING_ROOM_FULL", statusCode: httpStatus.CONFLICT })
      );
    });
  });

  describe("getOwnerBoardingRecordDetail", () => {
    it("UTX-BOARDING-101 - getOwnerBoardingRecordDetail returns record details and published updates", async () => {
      mockOwnerRepo.findOwnerBoardingRecordDetail.mockResolvedValue({
        boarding_record_id: "rec_1",
        pet_id: "pet_1",
        pet_name: "Buddy",
        species: "Dog",
        weight_kg: 10,
        room_type_id: "rt1",
        room_type_name: "Deluxe",
        planned_check_in_at: "2026-06-20T10:00:00Z",
        planned_check_out_at: "2026-06-22T10:00:00Z",
        stay_days: 2,
        boarding_status: "staying",
        payment_option: "online",
        invoice_status: "paid",
        estimated_total: 400000
      } as any);
      mockUpdateRepo.findPublishedBoardingUpdates.mockResolvedValue([
        { boarding_update_id: "upd_1", updated_at: "2026-06-21T10:00:00Z", update_note: "Doing great", alert_level: "normal", attachment_url: null }
      ] as any);

      const result = await getOwnerBoardingRecordDetail(ownerUser, { boardingRecordId: "rec_1" });
      expect(result.boardingRecordId).toBe("rec_1");
      expect(result.careLogs).toHaveLength(2); // check-in log + daily update log
    });

    it("UTX-BOARDING-102 - getOwnerBoardingRecordDetail throws NOT_FOUND for invalid ID", async () => {
      mockOwnerRepo.findOwnerBoardingRecordDetail.mockResolvedValue(null);

      await expect(getOwnerBoardingRecordDetail(ownerUser, { boardingRecordId: "invalid" })).rejects.toThrowError(
        expect.objectContaining({ code: "BOARDING_RECORD_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("cancelOwnerBoardingRecord", () => {
    it("UTX-BOARDING-103 - cancelOwnerBoardingRecord successfully cancels booking and logs activity", async () => {
      mockOwnerRepo.findOwnerBoardingRecordDetail.mockResolvedValue({
        boarding_record_id: "rec_1",
        pet_id: "pet_1",
        pet_name: "Buddy",
        boarding_status: "pending",
        invoice_status: "unpaid",
        planned_check_in_at: "2026-06-20",
        planned_check_out_at: "2026-06-22"
      } as any);

      await cancelOwnerBoardingRecord(ownerUser, { boardingRecordId: "rec_1" });
      expect(mockOwnerRepo.updateBoardingRecordStatus).toHaveBeenCalledWith("rec_1", "cancelled");
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "boarding_cancelled", activityStatus: "cancelled" })
      );
    });

    it("UTX-BOARDING-104 - cancelOwnerBoardingRecord throws AppError if status is not pending or is already paid", async () => {
      mockOwnerRepo.findOwnerBoardingRecordDetail.mockResolvedValue({
        boarding_record_id: "rec_1",
        boarding_status: "confirmed",
        invoice_status: "paid"
      } as any);

      await expect(cancelOwnerBoardingRecord(ownerUser, { boardingRecordId: "rec_1" })).rejects.toThrowError(
        expect.objectContaining({ code: "INVALID_BOARDING_STATUS", statusCode: httpStatus.BAD_REQUEST })
      );
    });
  });

  describe("listOwnerBoardingRecords", () => {
    it("UTX-BOARDING-105 - listOwnerBoardingRecords returns filtered list of owner records", async () => {
      mockOwnerRepo.findOwnerBoardingRecords.mockResolvedValue([
        {
          boarding_record_id: "rec_1",
          pet_id: "pet_1",
          pet_name: "Buddy",
          room_type_id: "rt1",
          room_type_name: "Deluxe",
          planned_check_in_at: "2026-06-20T10:00:00Z",
          planned_check_out_at: "2026-06-22T10:00:00Z",
          stay_days: 2,
          boarding_status: "staying",
          payment_option: "online",
          invoice_status: "paid",
          estimated_total: 400000
        }
      ] as any);
      mockOwnerRepo.countOwnerBoardingRecords.mockResolvedValue(1);

      const result = await listOwnerBoardingRecords(ownerUser, { page: 1, limit: 10, status: "all", timeRange: "all" });
      expect(result.records).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
