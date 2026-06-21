import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as groomingRepository from "../../../src/modules/grooming/grooming.repository.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";
import {
  listStaffAvailableServices,
  getStaffCounterAvailability,
  getStaffCounterOptions,
  createStaffCounterTicket
} from "../../../src/modules/grooming/staff/staff-grooming.service.js";

vi.mock("../../../src/modules/grooming/grooming.repository.js");
vi.mock("../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js", () => ({
  findGroomingActivityContext: vi.fn().mockResolvedValue({ pet_id: "pet_1", owner_user_id: "own_1", pet_name: "Buddy" }),
  upsertPetActivityLog: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../src/modules/notifications/notification-events.js", () => ({
  notifyGroomingCreated: vi.fn().mockResolvedValue(undefined),
  notifyGroomingAccepted: vi.fn().mockResolvedValue(undefined),
  notifyGroomingCompleted: vi.fn().mockResolvedValue(undefined),
}));

const mockRepo = vi.mocked(groomingRepository);
const mockActivityLogs = vi.mocked(petActivityLogs);

describe("staff-grooming.service unit tests", () => {
  const staffUser = { userId: "stf_1", role: "STAFF" as const, email: "staff@example.com", fullName: "Jane Staff" };
  const ownerUser = { userId: "own_1", role: "OWNER" as const, email: "owner@example.com", fullName: "John Owner" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listStaffAvailableServices", () => {
    it("UTX-GROOMING-199 - listStaffAvailableServices returns active spa services for staff", async () => {
      mockRepo.findActiveGroomingServices.mockResolvedValue([{ serviceId: "s1", serviceName: "Tắm sấy" }] as any);

      const result = await listStaffAvailableServices(staffUser);
      expect(result).toHaveLength(1);
      expect(mockRepo.findActiveGroomingServices).toHaveBeenCalled();
    });

    it("throws forbidden if non-staff calls listStaffAvailableServices", async () => {
      await expect(listStaffAvailableServices(ownerUser)).rejects.toThrowError(
        expect.objectContaining({ code: "FORBIDDEN", statusCode: httpStatus.FORBIDDEN })
      );
    });
  });

  describe("getStaffCounterAvailability", () => {
    it("UTX-GROOMING-200 - getStaffCounterAvailability returns counter availability for valid input", async () => {
      mockRepo.findBookingServicePriceBase.mockResolvedValue({ serviceId: "s1", estimatedDurationMinutes: 30 } as any);
      mockRepo.getAvailability.mockResolvedValue({ slots: [{ time: "09:00", available: true }] } as any);

      const result = await getStaffCounterAvailability(staffUser, { date: new Date("2026-06-20"), serviceId: "s1" });
      expect(result.slots).toBeDefined();
    });

    it("UTX-GROOMING-201 - getStaffCounterAvailability throws NOT_FOUND for invalid serviceId", async () => {
      mockRepo.findBookingServicePriceBase.mockResolvedValue(null);

      await expect(getStaffCounterAvailability(staffUser, { date: new Date("2026-06-20"), serviceId: "invalid" })).rejects.toThrowError(
        expect.objectContaining({ code: "GROOMING_SERVICE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("getStaffCounterOptions", () => {
    it("UTX-GROOMING-202 - getStaffCounterOptions returns matching pets and services", async () => {
      mockRepo.findStaffCounterPets.mockResolvedValue([{ petId: "pet_1", petName: "Buddy", weightKg: 12 }] as any);
      mockRepo.findStaffCounterPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: 12 } as any);
      mockRepo.findBookingServicePriceBases.mockResolvedValue([
        { serviceId: "s1", serviceName: "Spa", basePrice: 150000 }
      ] as any);

      const result = await getStaffCounterOptions(staffUser, { petId: "pet_1", search: "Buddy", limit: 10 });
      expect(result.pets).toHaveLength(1);
      expect(result.selectedPet?.petName).toBe("Buddy");
      expect(result.services[0].appliedPrice).toBe(300000); // 150k base + 150k weight surcharge for 12kg
    });

    it("UTX-GROOMING-203 - getStaffCounterOptions throws NOT_FOUND for non-existent pet ID", async () => {
      mockRepo.findStaffCounterPets.mockResolvedValue([]);
      mockRepo.findStaffCounterPet.mockResolvedValue(null);

      await expect(getStaffCounterOptions(staffUser, { petId: "invalid_pet", search: "", limit: 10 })).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("createStaffCounterTicket", () => {
    const payload = {
      petId: "pet_1",
      serviceId: "s1",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days ahead
      specialRequest: "Special care"
    };
    payload.scheduledAt.setHours(11, 0, 0, 0); // 11:00 AM

    it("UTX-GROOMING-204 - createStaffCounterTicket successfully creates ticket and logs activity", async () => {
      mockRepo.findStaffCounterPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: 12, ownerUserId: "own_1" } as any);
      mockRepo.findBookingServicePriceBase.mockResolvedValue({ serviceId: "s1", serviceName: "Spa", basePrice: 150000 } as any);
      mockRepo.createGroomingBooking.mockResolvedValue({
        groomingTicketId: "t1",
        ticketStatus: "scheduled",
        invoiceId: "inv_1",
        totalAmount: 300000
      } as any);

      const result = await createStaffCounterTicket(staffUser, payload);
      expect(result.groomingTicketId).toBe("t1");
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledTimes(2);
    });

    it("UTX-GROOMING-205 - createStaffCounterTicket throws error if slot full or pet weight missing", async () => {
      mockRepo.findStaffCounterPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: null, ownerUserId: "own_1" } as any);

      await expect(createStaffCounterTicket(staffUser, payload)).rejects.toThrowError(
        expect.objectContaining({ code: "PET_WEIGHT_REQUIRED", statusCode: httpStatus.UNPROCESSABLE_ENTITY })
      );
    });
  });
});
