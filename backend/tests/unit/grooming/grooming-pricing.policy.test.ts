import { describe, expect, it } from "vitest";
import {
  calculateGroomingPrice,
  getAppliedPricingConditionLabel,
} from "../../../src/modules/grooming/grooming-pricing.policy.js";

describe("grooming pricing policy", () => {
  it("uses the Vietnamese label for pets under 5 kg", () => {
    expect(getAppliedPricingConditionLabel(4.9)).toBe("Dưới 5 kg");
  });

  it("applies the first surcharge step from 5 kg to under 8 kg", () => {
    expect(getAppliedPricingConditionLabel(5)).toBe("Phụ thu theo cân nặng hiện tại: +50.000 VND");
    expect(getAppliedPricingConditionLabel(7.9)).toBe("Phụ thu theo cân nặng hiện tại: +50.000 VND");
    expect(calculateGroomingPrice(150_000, 5)).toBe(200_000);
  });

  it("applies another surcharge at each 3 kg boundary", () => {
    expect(getAppliedPricingConditionLabel(8)).toBe("Phụ thu theo cân nặng hiện tại: +100.000 VND");
    expect(getAppliedPricingConditionLabel(11)).toBe("Phụ thu theo cân nặng hiện tại: +150.000 VND");
    expect(calculateGroomingPrice(150_000, 8)).toBe(250_000);
  });
});
