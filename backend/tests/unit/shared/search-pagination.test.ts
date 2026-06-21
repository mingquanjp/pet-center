import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "../../../src/shared/utils/search.js";
import { createPagination, normalizePagination } from "../../../src/shared/utils/pagination.js";

describe("shared search and pagination utilities", () => {
  it.each([
    ["  Nguyễn Văn ĐỨC  ", "nguyen van duc"],
    ["Thú cưng", "thu cung"],
    ["PET CENTER", "pet center"],
    ["", ""],
  ])("normalizes search text %#", (input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });

  it("uses pagination defaults", () => {
    expect(normalizePagination()).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it("clamps page and limit to supported boundaries", () => {
    expect(normalizePagination(0, 0)).toEqual({ page: 1, limit: 1, offset: 0 });
    expect(normalizePagination(3, 500)).toEqual({ page: 3, limit: 100, offset: 200 });
  });

  it("computes pagination metadata including an empty result", () => {
    expect(createPagination(2, 10, 21)).toEqual({ page: 2, limit: 10, total: 21, totalPages: 3 });
    expect(createPagination(1, 20, 0)).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 });
  });
});
