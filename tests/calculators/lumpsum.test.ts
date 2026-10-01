import { describe, it, expect } from "vitest";
import { calculateLumpsum } from "@/lib/calculators/lumpsum";

describe("Lumpsum Calculation Engine (Independently Computed Reference Tests)", () => {
  // Independent benchmark fixture: ₹10,00,000 at 12% p.a. for 10 years
  // Formula: A = P * (1 + r)^t
  // 1.12^10 = 3.1058482
  // A = 1000000 * 3.1058482 = 31,05,848
  // Wealth Gained = 3105848 - 1000000 = 21,05,848
  it("matches independently verified lumpsum fixture (₹10 Lakh, 12%, 10 years)", () => {
    const result = calculateLumpsum({
      totalInvestment: 1000000,
      annualReturnRate: 12,
      tenureYears: 10,
    });

    expect(result.futureValue).toBe(3105848);
    expect(result.wealthGained).toBe(2105848);
    expect(result.growthMultiple).toBe(3.11);
    expect(result.yearlyBreakdown.length).toBe(10);
    expect(result.yearlyBreakdown[9].futureValue).toBe(3105848);
  });

  it("handles 0% annual return rate (preserves invested capital)", () => {
    const result = calculateLumpsum({
      totalInvestment: 500000,
      annualReturnRate: 0,
      tenureYears: 5,
    });

    expect(result.futureValue).toBe(500000);
    expect(result.wealthGained).toBe(0);
    expect(result.growthMultiple).toBe(1);
  });

  it("safely handles 0 investment or 0 tenure", () => {
    const resZeroP = calculateLumpsum({ totalInvestment: 0, annualReturnRate: 12, tenureYears: 10 });
    expect(resZeroP.futureValue).toBe(0);

    const resZeroT = calculateLumpsum({ totalInvestment: 100000, annualReturnRate: 12, tenureYears: 0 });
    expect(resZeroT.futureValue).toBe(100000);
    expect(resZeroT.wealthGained).toBe(0);
  });
});
