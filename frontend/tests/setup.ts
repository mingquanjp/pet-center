import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({
      appointmentId: "appt-1",
      petId: "pet-1",
      boardingRecordId: "brd-1",
      boardingId: "brd-1",
      examId: "exam-1",
    }),
    redirect: vi.fn(),
  };
});

// Mock next/image
vi.mock("next/image", () => {
  return {
    default: (props: any) => React.createElement("img", props),
  };
});

// Mock lucide-react icons globally with ESM dynamic proxy traps
vi.mock("lucide-react", () => {
  const React = require("react");
  const iconMock = (props: any) => React.createElement("span", { ...props, "data-testid": "lucide-icon" });
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === "string" && /^[A-Z]/.test(prop)) {
          return iconMock;
        }
        return (target as any)[prop];
      },
      has: (target, prop) => {
        if (typeof prop === "string" && /^[A-Z]/.test(prop)) {
          return true;
        }
        return prop in target;
      },
      getOwnPropertyDescriptor: (target, prop) => {
        if (typeof prop === "string" && /^[A-Z]/.test(prop)) {
          return {
            configurable: true,
            enumerable: true,
            value: iconMock,
            writable: true,
          };
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      },
      ownKeys: () => ["User", "ChevronRight", "Search", "Plus", "Trash2", "Pencil", "Eye", "CalendarDays", "ChevronDown", "ChevronUp"],
    }
  );
});


// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock localStorage & sessionStorage
const storageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};
Object.defineProperty(window, "localStorage", { value: storageMock() });
Object.defineProperty(window, "sessionStorage", { value: storageMock() });

// Mock recharts
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => React.createElement("div", { "data-testid": "responsive-container" }, children),
    BarChart: ({ children }: any) => React.createElement("div", { "data-testid": "bar-chart" }, children),
    LineChart: ({ children }: any) => React.createElement("div", { "data-testid": "line-chart" }, children),
    AreaChart: ({ children }: any) => React.createElement("div", { "data-testid": "area-chart" }, children),
    PieChart: ({ children }: any) => React.createElement("div", { "data-testid": "pie-chart" }, children),
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Bar: () => null,
    Line: () => null,
    Area: () => null,
    Cell: () => null,
  };
});

// Mock sonner toast
vi.mock("sonner", () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// Mock 3D Dog scene
vi.mock("@/components/ui/dog-3d", () => {
  return {
    Dog3DScene: () => React.createElement("div", { "data-testid": "dog-3d-scene" }, "Mock 3D Dog Scene"),
  };
});

// Mock apiRequest globally
vi.mock("@/lib/api", () => {
  const mockApiRequest = vi.fn().mockImplementation(async (path: string, options?: any) => {
    let data: any = [];
    
    // Normalise path
    const cleanPath = path.split("?")[0];

    if (cleanPath.includes("/boarding/create-options")) {
      data = {
        owners: [{ id: "owner-1", fullName: "Mock Owner" }],
        pets: [{ id: "pet-1", name: "Bông", ownerId: "owner-1" }],
        roomTypes: [{ id: "type-1", name: "Standard Room" }]
      };
    } else if (cleanPath.includes("/create-options")) {
      data = {
        pets: [{ id: "pet-1", name: "Bông" }],
        examTypes: [{ id: "type-1", name: "General Exam" }],
        timeSlots: [{ time: "10:00", available: true }]
      };
    } else if (cleanPath.includes("/available-slots")) {
      data = [{ time: "10:00", available: true }];
    } else if (cleanPath.includes("/auth/me") || cleanPath.includes("/auth/profile")) {
      data = { id: "mock-user-id", email: "mock@example.com", fullName: "Mock User", role: "Admin", phoneNumber: "0987654321", createdAt: "2026-06-21T00:00:00.000Z" };
    } else if (cleanPath.includes("/auth/login") || cleanPath.includes("/auth/register")) {
      data = {
        accessToken: "mock-access-token",
        user: { id: "mock-user-id", email: "mock@example.com", fullName: "Mock User", role: "Admin" }
      };
    } else if (cleanPath.includes("/owner/dashboard")) {
      data = {
        ownerName: "Mock Owner",
        summary: {
          petCount: 1,
          upcomingAppointmentCount: 1,
          unpaidInvoiceCount: 0,
          unreadNotificationCount: 0,
          pendingServiceCount: 0
        },
        pets: [],
        upcomingAppointments: [],
        recentActivities: [],
        healthReminders: []
      };
    } else if (cleanPath.includes("/overview")) {
      data = {
        stats: {
          totalUsers: 10, totalPets: 10, medicalAppointments: 5, currentBoardingPets: 2, totalBoardingCapacity: 10,
          monthlyRevenue: 10000000, pendingInvoices: 3, medicineRevenue: 2000000, bookingRate: 80,
          totalRoomTypes: 5, activeRoomTypes: 4, inactiveRoomTypes: 1, stayingPets: 2, totalRooms: 10, availableRooms: 8,
          pendingAppointments: 1, pendingGroomingTickets: 2, todayInvoices: 3,
          totalRoomsCount: 10, bookedRoomsCount: 2, availableRoomsCount: 8, maintenanceRoomsCount: 0,
          todayRevenue: 5000000, activeDoctorCount: 3, activeStaffCount: 5, occupancyRate: 20,
          todayExamCount: 0, waitingExamCount: 0, inProgressExamCount: 0, followUpCount: 0
        },
        trends: {
          totalUsers: 10,
          totalPets: 5,
          monthlyRevenue: 15,
          bookingRate: 2
        },
        staff: { fullName: "Mock Staff" },
        doctor: { id: "doc-1", fullName: "Mock Doctor", roleLabel: "Veterinarian" },
        owner: { fullName: "Mock Owner" },
        appointmentTasks: [],
        recentRevenue: [],
        assignedExams: [],
        recentActivities: []
      };
    } else if (cleanPath.includes("availability")) {
      data = {
        slots: [{ time: "09:00", available: true }, { time: "10:00", available: true }]
      };
    } else if (cleanPath.includes("/pets")) {
      data = [{
        id: "pet-1",
        petId: "pet-1",
        name: "Bông",
        petName: "Bông",
        type: "Dog",
        species: "Dog",
        speciesLabel: "Dog",
        breed: "Poodle",
        age: 2,
        ageLabel: "2 tuổi",
        weight: 5,
        gender: "Female",
        genderLabel: "Cái",
        status: "active",
        profileImageUrl: null,
        owner: { id: "owner-1", fullName: "Mock Owner", phoneNumber: "0987654321" }
      }];
    } else if (cleanPath.includes("/rooms")) {
      data = {
        items: [{ id: "room-1", name: "Standard Room", capacity: 5, price: 100000, status: "active", currentOccupancy: 0 }],
        stats: { totalRoomTypes: 1, activeRoomTypes: 1, inactiveRoomTypes: 0, stayingPets: 0, totalCapacity: 5, todayOccupancyRate: 0 }
      };
    } else if (cleanPath.includes("/appointments")) {
      data = [{
        id: "appt-1",
        appointmentCode: "APT-0001",
        petName: "Bông",
        serviceName: "Grooming",
        dateTime: "2026-06-21T20:00:00Z",
        scheduledAt: "2026-06-21T20:00:00Z",
        status: "PENDING",
        doctorName: "Dr. Smith",
        roomName: "Room A",
        appointmentType: "medical",
        pet: {
          id: "pet-1",
          name: "Bông",
          imageUrl: null,
          breed: "Poodle",
          gender: "female",
          age: 2
        },
        owner: {
          fullName: "Mock Owner",
          phoneNumber: "0987654321"
        },
        examType: {
          name: "Khám tổng quát"
        }
      }];
    } else if (cleanPath.includes("/boarding")) {
      data = [{
        id: "brd-1",
        petName: "Bông",
        roomName: "Standard Room",
        checkInDate: "2026-06-21",
        checkOutDate: "2026-06-25",
        status: "staying",
        statusLabel: "Đang lưu trú",
        boardingCode: "BRD-0001",
        pet: {
          name: "Bông",
          petName: "Bông",
          imageUrl: null,
          profileImageUrl: null,
          breed: "Poodle",
          gender: "female"
        },
        room: {
          roomTypeId: "type-1",
          roomTypeName: "Standard Room"
        },
        owner: {
          fullName: "Mock Owner"
        },
        payment: {
          paymentStatus: "unpaid"
        }
      }];
    } else if (cleanPath.includes("/spa")) {
      data = [{ id: "spa-1", petName: "Bông", serviceName: "Grooming", dateTime: "2026-06-21T20:00:00Z", status: "pending" }];
    } else if (cleanPath.includes("/invoices")) {
      data = [{
        id: "inv-1",
        title: "Hóa đơn dịch vụ",
        invoiceCode: "INV-0001",
        pet: { name: "Bông" },
        owner: { fullName: "Mock Owner" },
        serviceDate: "2026-06-21",
        issuedAt: "2026-06-21",
        paymentOption: "ONLINE",
        paymentStatus: "PENDING_PAYMENT",
        totalAmount: 150000
      }];
    } else if (cleanPath.includes("/admin/medicines-units") || cleanPath.includes("/medicines-units")) {
      data = ["vỉ", "hộp", "chai", "viên", "tuýp", "ống"];
    } else if (cleanPath.includes("/medicines")) {
      data = {
        items: [{ id: "med-1", name: "Paracetamol", price: 10000, quantity: 100, status: "active", unit: "vỉ", medicineStatus: "active" }],
        stats: { totalMedicines: 1, activeMedicines: 1, inactiveMedicines: 0 },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
    } else if (cleanPath.includes("/users")) {
      data = [{ id: "user-1", name: "John Doe", fullName: "John Doe", email: "john@example.com", role: "Staff", status: "active", createdAt: "2026-06-21T00:00:00.000Z" }];
    } else if (cleanPath.includes("/service-categories")) {
      data = {
        items: [{ id: "cat-1", name: "Grooming", status: "active", code: "SPA", price: 100000 }],
        stats: { totalCategories: 1, activeCategories: 1, inactiveCategories: 0 },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
    } else if (cleanPath.includes("/prescriptions")) {
      data = [{
        id: "pres-1",
        prescriptionId: "pres-1",
        prescriptionCode: "PSC-0001",
        petName: "Bông",
        medicineName: "Paracetamol",
        dosage: "1 tablet daily",
        duration: "5 days",
        prescribedDate: "2026-06-21",
        medicineCount: 2,
        pet: { name: "Bông", species: "Dog", speciesLabel: "Chó", breed: "Poodle" },
        owner: { fullName: "Mock Owner" }
      }];
    } else if (cleanPath.includes("/follow-ups")) {
      data = [{
        id: "follow-1",
        petName: "Bông",
        date: "2026-06-28",
        reason: "Check incision",
        status: "upcoming",
        followUpDate: "2026-06-28",
        examinationCode: "EXM-0001",
        pet: { name: "Bông", species: "Dog", speciesLabel: "Chó", breed: "Poodle" },
        owner: { fullName: "Mock Owner" }
      }];
    } else if (cleanPath.includes("/doctor/examinations")) {
      data = {
        data: [{
          id: "exam-1",
          appointmentId: "appt-1",
          petName: "Bông",
          serviceName: "General Exam",
          status: "WAITING",
          doctorName: "Dr. Smith",
          roomName: "Room A",
          appointmentType: "medical",
          examinationCode: "EXM-0001",
          scheduledAt: "2026-06-21T10:00:00Z",
          pet: { name: "Bông", species: "Dog", breed: "Poodle", ageText: "2 tuổi" },
          owner: { fullName: "Mock Owner", phoneNumber: "0987654321" },
          examType: { name: "Khám tổng quát" }
        }],
        stats: { totalCount: 1, waitingCount: 1, examiningCount: 0, completedCount: 0, followUpCount: 0 },
        tabStats: { totalCount: 1, waitingCount: 1, examiningCount: 0, completedCount: 0, followUpCount: 0 },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      };
    } else if (cleanPath.endsWith("/doctor/medical-records")) {
      data = {
        items: [{ petId: "pet-1", petName: "Bông", species: "Dog", ownerId: "owner-1", ownerName: "Mock Owner", latestExamId: "exam-1", latestExamDate: "2026-06-21", latestDiagnosis: "Healthy", examTypeCode: "GENERAL_CHECKUP", examTypeName: "General Checkup", examStatus: "result_recorded" }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    } else if (cleanPath.includes("/medical-records")) {
      data = {
        profile: { petId: "pet-1", petName: "Bông", species: "Dog", breed: "Poodle", gender: "female", birthDate: "2024-06-21", estimatedAge: 2, furColor: "White", weightKg: 5, avatarUrl: null, owner: { ownerId: "owner-1", fullName: "Mock Owner", phoneNumber: "0987654321" } },
        exams: [],
        vaccinations: [],
        prescriptions: [],
        followUps: []
      };
    } else if (cleanPath.includes("/reports")) {
      data = {
        revenueByService: [],
        revenueByDate: [],
        summary: { totalRevenue: 10000000, totalOrders: 20 }
      };
    } else if (cleanPath.includes("/notifications")) {
      data = [{ id: "notif-1", title: "Test", message: "Test", isRead: false }];
    }

    return {
      success: true,
      data: data?.data !== undefined ? data.data : data,
      pagination: data?.pagination !== undefined ? data.pagination : { page: 1, limit: 10, total: 1, totalPages: 1 },
      stats: data?.stats !== undefined ? data.stats : {
        upcomingCount: 1,
        overdueCount: 1,
        totalRoomTypes: 1,
        activeRoomTypes: 1,
        inactiveRoomTypes: 0,
        stayingPets: 0,
        totalCapacity: 5,
        todayOccupancyRate: 0
      },
      tabStats: data?.tabStats !== undefined ? data.tabStats : {
        totalCount: 1,
        waitingCount: 0,
        examiningCount: 1,
        completedCount: 0,
        followUpCount: 0
      }
    };
  });

  return {
    apiRequest: mockApiRequest,
    clearApiCache: vi.fn(),
    ApiError: class ApiError extends Error {
      code?: string;
      details?: any;
      constructor(message: string, code?: string, details?: any) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
      }
    }
  };
});


