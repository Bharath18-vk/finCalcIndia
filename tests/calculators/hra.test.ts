import { describe, it, expect } from "vitest";
import { calculateHRA } from "@/lib/calculators/hra";

describe("HRA Exemption Calculator (Rule 2A)", () => {
  it("independently verifies the 3 statutory conditions and identifies the limiting condition", () => {
    // Basic: 6,00,000 (50k/mo)
    // HRA received: 2,40,000 (20k/mo)
    // Rent paid: 1,80,000 (15k/mo) in Metro
    // Condition 1: 2,40,000
    // Condition 2: 50% of 6,00,000 = 3,00,000
    // Condition 3: 1,80,000 - 60,000 (10% of basic) = 1,20,000
    // Min = 1,20,000
    const result = calculateHRA({
      basicSalaryAnnual: 600000,
      hraReceivedAnnual: 240000,
      rentPaidAnnual: 180000,
      isMetroCity: true,
      taxBracketPercentage: 30,
    });

    expect(result.actualHRAReceived).toBe(240000);
    expect(result.percentageOfSalaryLimit).toBe(300000);
    expect(result.rentMinusTenPercentSalary).toBe(120000);
    expect(result.exemptHRA).toBe(120000);
    expect(result.taxableHRA).toBe(120000);
    expect(result.limitingFactor).toBe("rent_paid_minus_ten_percent");
    // 30% slab + 4% cess = 31.2% -> 1,20,000 * 0.312 = 37,440
    expect(result.estimatedTaxSaved).toBe(37440);
  });

  it("applies the 40% salary limit for non-metro cities correctly", () => {
    // Non-metro: Condition 2 is 40% of 10,00,000 = 4,00,000
    const result = calculateHRA({
      basicSalaryAnnual: 1000000,
      hraReceivedAnnual: 500000,
      rentPaidAnnual: 600000,
      isMetroCity: false,
    });

    expect(result.percentageOfSalaryLimit).toBe(400000);
    // Condition 1 = 500,000, Condition 2 = 400,000, Condition 3 = 600k - 100k = 500,000
    // Min = 400,000
    expect(result.exemptHRA).toBe(400000);
    expect(result.taxableHRA).toBe(100000);
    expect(result.limitingFactor).toBe("salary_percentage");
  });

  it("handles zero rent or zero inputs safely without NaN", () => {
    const result = calculateHRA({
      basicSalaryAnnual: 500000,
      hraReceivedAnnual: 100000,
      rentPaidAnnual: 0,
    });

    expect(result.exemptHRA).toBe(0);
    expect(result.taxableHRA).toBe(100000);
    expect(result.estimatedTaxSaved).toBe(0);
    expect(Number.isNaN(result.exemptHRA)).toBe(false);
  });
});
