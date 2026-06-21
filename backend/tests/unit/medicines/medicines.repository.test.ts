import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "../../../src/db/query.js";
import {
  findAdminMedicines,
  countAdminMedicines,
  getAdminMedicineStats,
  findMedicineById
} from "../../../src/modules/medicines/medicines.repository.js";

vi.mock("../../../src/db/query.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("medicines.repository unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAdminMedicines", () => {
    it("UTX-MEDICINES-326 - findAdminMedicines generates parameterized query and returns matched rows", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            medicine_id: "med_1",
            medicine_name: "Aspirin",
            unit: "pill",
            description: "Pain relief",
            usage_note: null,
            unit_price: 500,
            stock_quantity: 100,
            medicine_status: "active",
            prescription_usage_count: 5
          }
        ]
      } as any);

      const result = await findAdminMedicines({ page: 1, limit: 10 });
      expect(mockQuery).toHaveBeenCalled();
      const lastCallArgs = mockQuery.mock.calls[0];
      const sqlQuery = lastCallArgs[0];
      expect(sqlQuery).toContain("SELECT");
      expect(sqlQuery).toContain("pet_center.medicines");
      expect(result).toHaveLength(1);
      expect(result[0].medicine_name).toBe("Aspirin");
    });

    it("UTX-MEDICINES-327 - findAdminMedicines correctly appends filters and limits/offsets", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      await findAdminMedicines({
        search: "paracetamol",
        unit: "pill",
        status: "active",
        page: 2,
        limit: 5
      });

      expect(mockQuery).toHaveBeenCalled();
      const lastCallArgs = mockQuery.mock.calls[0];
      const sqlQuery = lastCallArgs[0];
      const sqlParams = lastCallArgs[1];

      expect(sqlQuery).toContain("ILIKE");
      expect(sqlQuery).toContain("m.unit =");
      expect(sqlQuery).toContain("m.medicine_status =");
      expect(sqlQuery).toContain("LIMIT");
      expect(sqlQuery).toContain("OFFSET");

      // Verify params matching search, unit, status, limit, offset
      expect(sqlParams).toContain("%paracetamol%");
      expect(sqlParams).toContain("pill");
      expect(sqlParams).toContain("active");
      expect(sqlParams).toContain(5); // limit
      expect(sqlParams).toContain(5); // offset ((2-1)*5)
    });
  });

  describe("countAdminMedicines", () => {
    it("UTX-MEDICINES-328 - countAdminMedicines counts total matched medicines", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ total: "42" }]
      } as any);

      const result = await countAdminMedicines({});
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toBe(42);
    });

    it("UTX-MEDICINES-329 - countAdminMedicines filters correct SQL and handles query rejections", async () => {
      mockQuery.mockRejectedValue(new Error("Query failed"));

      await expect(countAdminMedicines({ search: "a", unit: "pill", status: "active" })).rejects.toThrow("Query failed");
    });
  });

  describe("getAdminMedicineStats", () => {
    it("UTX-MEDICINES-330 - getAdminMedicineStats generates correct query and returns statistics", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            total_medicines: "50",
            active_medicines: "45",
            inactive_medicines: "5"
          }
        ]
      } as any);

      const result = await getAdminMedicineStats();
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual({
        totalMedicines: 50,
        activeMedicines: 45,
        inactiveMedicines: 5
      });
    });

    it("UTX-MEDICINES-331 - getAdminMedicineStats handles empty results gracefully", async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getAdminMedicineStats();
      expect(result).toEqual({
        totalMedicines: 0,
        activeMedicines: 0,
        inactiveMedicines: 0
      });
    });
  });

  describe("findMedicineById", () => {
    it("UTX-MEDICINES-332 - findMedicineById returns true when row exists", async () => {
      mockQuery.mockResolvedValue({ rowCount: 1, rows: [{ "1": 1 }] } as any);

      const result = await findMedicineById("med_1");
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("medicine_id = $1"), ["med_1"]);
      expect(result).toBe(true);
    });

    it("UTX-MEDICINES-333 - findMedicineById returns false when row does not exist", async () => {
      mockQuery.mockResolvedValue({ rowCount: 0, rows: [] } as any);

      const result = await findMedicineById("med_invalid");
      expect(result).toBe(false);
    });
  });
});
