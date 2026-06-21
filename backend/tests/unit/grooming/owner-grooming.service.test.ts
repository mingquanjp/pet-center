import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import * as groomingRepository from "../../../src/modules/grooming/grooming.repository.js";
import * as petActivityLogs from "../../../src/modules/pet-activity-logs/pet-activity-logs.repository.js";
import {
  listAvailableServices,
  getBookingOptions,
  getAvailability,
  listBookedTickets,
  listTicketHistory,
  getBookedTicket,
  cancelBookedTicket,
  createTicket
} from "../../../src/modules/grooming/owner/owner-grooming.service.js";

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

describe("owner-grooming.service unit tests", () => {
  const ownerUser = { userId: "own_1", role: "OWNER" as const, email: "owner@example.com", fullName: "John Owner" };
  const staffUser = { userId: "stf_1", role: "STAFF" as const, email: "staff@example.com", fullName: "Jane Staff" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAvailableServices", () => {
    it("UTX-GROOMING-184 - listAvailableServices returns active grooming services for owner", async () => {
      mockRepo.findActiveGroomingServices.mockResolvedValue([{ serviceId: "s1", serviceName: "Tắm sấy" }] as any);

      const result = await listAvailableServices(ownerUser);
      expect(result).toHaveLength(1);
      expect(result[0].serviceName).toBe("Tắm sấy");
      expect(mockRepo.findActiveGroomingServices).toHaveBeenCalled();
    });

    it("throws forbidden error if user is not OWNER", async () => {
      await expect(listAvailableServices(staffUser)).rejects.toThrowError(
        expect.objectContaining({ code: "FORBIDDEN", statusCode: httpStatus.FORBIDDEN })
      );
    });
  });

  describe("getBookingOptions", () => {
    it("UTX-GROOMING-185 - getBookingOptions returns owner pets and weight-adjusted service prices", async () => {
      mockRepo.findOwnerBookingPets.mockResolvedValue([{ petId: "pet_1", petName: "Buddy", weightKg: 10 }] as any);
      mockRepo.findOwnerBookingPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: 10 } as any);
      mockRepo.findBookingServicePriceBases.mockResolvedValue([
        { serviceId: "s1", serviceName: "Grooming", basePrice: 100000, estimatedDurationMinutes: 30 }
      ] as any);

      const result = await getBookingOptions(ownerUser, { petId: "pet_1" });
      expect(result.pets).toHaveLength(1);
      expect(result.selectedPet?.petName).toBe("Buddy");
      expect(result.services).toHaveLength(1);
      // Base price 100k + surcharge for 10kg (+100k) = 200k
      expect(result.services[0].appliedPrice).toBe(200000);
    });

    it("UTX-GROOMING-186 - getBookingOptions throws NOT_FOUND if specified pet is not found or owned by user", async () => {
      mockRepo.findOwnerBookingPets.mockResolvedValue([]);
      mockRepo.findOwnerBookingPet.mockResolvedValue(null);

      await expect(getBookingOptions(ownerUser, { petId: "invalid_pet" })).rejects.toThrowError(
        expect.objectContaining({ code: "PET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("getAvailability", () => {
    it("UTX-GROOMING-187 - getAvailability returns slots for valid input", async () => {
      mockRepo.findBookingServicePriceBase.mockResolvedValue({
        serviceId: "s1",
        estimatedDurationMinutes: 45
      } as any);
      mockRepo.getAvailability.mockResolvedValue({ slots: [{ time: "08:00", available: true }] } as any);

      const result = await getAvailability(ownerUser, { date: new Date("2026-06-20"), serviceId: "s1" });
      expect(result.slots).toBeDefined();
      expect(mockRepo.getAvailability).toHaveBeenCalledWith("2026-06-20", 45);
    });

    it("UTX-GROOMING-188 - getAvailability throws NOT_FOUND for non-existent serviceId", async () => {
      mockRepo.findBookingServicePriceBase.mockResolvedValue(null);

      await expect(getAvailability(ownerUser, { date: new Date("2026-06-20"), serviceId: "invalid_s" })).rejects.toThrowError(
        expect.objectContaining({ code: "GROOMING_SERVICE_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("listBookedTickets", () => {
    it("UTX-GROOMING-189 - listBookedTickets returns active booked tickets paginated", async () => {
      mockRepo.findBookedGroomingTickets.mockResolvedValue({ tickets: [{ groomingTicketId: "t1" }], total: 1 } as any);

      const result = await listBookedTickets(ownerUser, { page: 1, limit: 10, status: "all", timeRange: "all" });
      expect(result.tickets).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("UTX-GROOMING-190 - listBookedTickets returns empty list when no bookings exist", async () => {
      mockRepo.findBookedGroomingTickets.mockResolvedValue({ tickets: [], total: 0 } as any);

      const result = await listBookedTickets(ownerUser, { page: 1, limit: 10, status: "all", timeRange: "all" });
      expect(result.tickets).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("listTicketHistory", () => {
    it("UTX-GROOMING-191 - listTicketHistory returns completed/cancelled ticket history", async () => {
      mockRepo.findGroomingTicketHistory.mockResolvedValue({ tickets: [{ groomingTicketId: "t1" }], total: 1 } as any);

      const result = await listTicketHistory(ownerUser, { page: 1, limit: 10, status: "all", timeRange: "all" });
      expect(result.tickets).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("UTX-GROOMING-192 - listTicketHistory returns empty list when no history exists", async () => {
      mockRepo.findGroomingTicketHistory.mockResolvedValue({ tickets: [], total: 0 } as any);

      const result = await listTicketHistory(ownerUser, { page: 1, limit: 10, status: "all", timeRange: "all" });
      expect(result.tickets).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getBookedTicket", () => {
    it("UTX-GROOMING-193 - getBookedTicket returns details for owned ticket ID", async () => {
      mockRepo.findBookedGroomingTicketById.mockResolvedValue({ groomingTicketId: "t1", petName: "Buddy" } as any);

      const result = await getBookedTicket(ownerUser, "t1");
      expect(result.groomingTicketId).toBe("t1");
    });

    it("UTX-GROOMING-194 - getBookedTicket throws NOT_FOUND if ticket not found or belongs to other user", async () => {
      mockRepo.findBookedGroomingTicketById.mockResolvedValue(null);

      await expect(getBookedTicket(ownerUser, "invalid_t")).rejects.toThrowError(
        expect.objectContaining({ code: "GROOMING_TICKET_NOT_FOUND", statusCode: httpStatus.NOT_FOUND })
      );
    });
  });

  describe("cancelBookedTicket", () => {
    it("UTX-GROOMING-195 - cancelBookedTicket cancels ticket successfully and logs activity", async () => {
      mockRepo.cancelBookedGroomingTicket.mockResolvedValue({ groomingTicketId: "t1", ticketStatus: "cancelled" } as any);

      const result = await cancelBookedTicket(ownerUser, "t1");
      expect(result.ticketStatus).toBe("cancelled");
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: "grooming_cancelled", activityStatus: "cancelled" })
      );
    });

    it("UTX-GROOMING-196 - cancelBookedTicket throws conflict error if already paid or in progress", async () => {
      mockRepo.cancelBookedGroomingTicket.mockRejectedValue(new Error("GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED"));

      await expect(cancelBookedTicket(ownerUser, "t1")).rejects.toThrowError(
        expect.objectContaining({ code: "GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED", statusCode: httpStatus.CONFLICT })
      );
    });
  });

  describe("createTicket", () => {
    const validPayload = {
      petId: "pet_1",
      serviceId: "s1",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      specialRequest: "N/A",
      paymentOption: "counter" as const
    };

    // Force date to be 10:00 AM to satisfy policies (assertSchedulableTime)
    validPayload.scheduledAt.setHours(10, 0, 0, 0);

    it("UTX-GROOMING-197 - createTicket creates booking ticket, issues invoice and logs activity", async () => {
      mockRepo.findOwnerBookingPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: 10 } as any);
      mockRepo.findBookingServicePriceBase.mockResolvedValue({
        serviceId: "s1",
        serviceName: "Grooming",
        basePrice: 100000,
        estimatedDurationMinutes: 30
      } as any);
      mockRepo.createGroomingBooking.mockResolvedValue({
        groomingTicketId: "t1",
        ticketStatus: "scheduled",
        invoiceId: "inv_1",
        totalAmount: 250000
      } as any);

      const result = await createTicket(ownerUser, validPayload, "127.0.0.1");
      expect(result.groomingTicketId).toBe("t1");
      expect(mockActivityLogs.upsertPetActivityLog).toHaveBeenCalledTimes(2); // One for booking, one for invoice
    });

    it("UTX-GROOMING-198 - createTicket throws error if slot full or pet weight required", async () => {
      // Missing pet weight
      mockRepo.findOwnerBookingPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: null } as any);
      await expect(createTicket(ownerUser, validPayload, "127.0.0.1")).rejects.toThrowError(
        expect.objectContaining({ code: "PET_WEIGHT_REQUIRED", statusCode: httpStatus.UNPROCESSABLE_ENTITY })
      );

      // Slot full
      mockRepo.findOwnerBookingPet.mockResolvedValue({ petId: "pet_1", petName: "Buddy", weightKg: 10 } as any);
      mockRepo.findBookingServicePriceBase.mockResolvedValue({
        serviceId: "s1",
        serviceName: "Grooming",
        basePrice: 100000
      } as any);
      mockRepo.createGroomingBooking.mockRejectedValue(new Error("GROOMING_SLOT_FULL"));

      await expect(createTicket(ownerUser, validPayload, "127.0.0.1")).rejects.toThrowError(
        expect.objectContaining({ code: "GROOMING_SLOT_FULL", statusCode: httpStatus.CONFLICT })
      );
    });
  });
});
