import { describe, expect, it, vi } from "vitest";
import { createId } from "../../../src/shared/utils/id.js";

describe("id utility unit tests", () => {
  const mockClient = {
    query: vi.fn()
  };

  it("UTX-SHARED-521 - createId generates ID using valid prefix and calls sequence query", async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: "own_101" }]
    } as any);

    const result = await createId("own", mockClient as any);

    expect(mockClient.query).toHaveBeenCalled();
    const [sql, params] = mockClient.query.mock.calls[0];
    expect(sql).toContain("nextval($2::regclass)");
    expect(params).toEqual(["own", "pet_center.own_id_seq"]);
    expect(result).toBe("own_101");
  });

  it("UTX-SHARED-522 - createId throws Error for unsupported prefixes without calling query", async () => {
    mockClient.query.mockReset();

    await expect(createId("unsupported_prefix", mockClient as any)).rejects.toThrow(
      "Unsupported ID prefix: unsupported_prefix"
    );

    expect(mockClient.query).not.toHaveBeenCalled();
  });
});
