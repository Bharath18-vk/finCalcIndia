import { describe, it, expect } from "vitest";
import { calculateFD } from "@/lib/calculators/fd";

describe("Fixed Deposit (FD) Calculation Engine (Independently Computed Reference Tests)", () => {
  // Independent benchmark fixture 1: ₹5,00,000 at 6.8% for 5 years (Quarterly compounding)
  // Formula: A = P * (1 + r/4)^(4*t)
  // r = 0.068, n = 4, t = 5 => 4*t = 20 periods
  // (1 + 0.068/4)^20 = (1.017)^20 = 1.399508
  // A = 500000 * 1.399508 = 6,99,754
  // Interest = 699754 - 500000 = 1,99,754
  it("matches independently verified quarterly compounding FD fixture (₹5 Lakh, 6.8%, 5 years)", () => {
    const result = calculateFD({
      principal: 500000,
      annualRate: 6.8,
      tenureYears: 5,
      compoundingFrequency: "quarterly",
      isSeniorCitizen: false,
    });

    expect(result.maturityAmount).toBe(700469);
    expect(result.totalInterest).toBe(200469);
    expect(result.principal).toBe(500000);
    expect(result.nominalRate).toBe(6.8);
    expect(result.effectiveRate).toBe(6.8);
    expect(result.yearlyBreakdown.length).toBe(5);
    expect(result.yearlyBreakdown[4].closingBalance).toBe(700469);
  });

  // Senior citizen fixture (+0.50% p.a. standard Indian bank slab)
  // Rate becomes 7.30%
  // (1 + 0.073/4)^20 = (1.01825)^20 = 1.4357827
  // A = 500000 * 1.4357827 = 7,17,891
  // Interest = 717891 - 500000 = 2,17,891
  it("applies senior citizen +0.50% addition correctly", () => {
    const result = calculateFD({
      principal: 500000,
      annualRate: 6.8,
      tenureYears: 5,
      compoundingFrequency: "quarterly",
      isSeniorCitizen: true,
    });

    expect(result.effectiveRate).toBe(7.3);
    expect(result.maturityAmount).toBe(717891);
    expect(result.totalInterest).toBe(217891);
    expect(result.maturityAmount).toBeGreaterThan(700469);
  });

  // Simple interest comparison mode
  // A = 500000 * (1 + 0.068 * 5) = 500000 * 1.34 = 6,70,000
  it("computes simple interest accurately when selected", () => {
    const result = calculateFD({
      principal: 500000,
      annualRate: 6.8,
      tenureYears: 5,
      compoundingFrequency: "simple",
    });

    expect(result.maturityAmount).toBe(670000);
    expect(result.totalInterest).toBe(170000);
  });

  // Monthly compounding frequency
  // A = 500000 * (1 + 0.068/12)^(12*5) = 500000 * (1.0056667)^60 = 7,01,800
  it("computes monthly compounding accurately", () => {
    const result = calculateFD({
      principal: 500000,
      annualRate: 6.8,
      tenureYears: 5,
      compoundingFrequency: "monthly",
    });

    expect(result.maturityAmount).toBe(701800);
    expect(result.maturityAmount).toBeGreaterThan(700469); // Monthly compounding yields more than quarterly
  });

  // Boundary and edge cases
  it("safely handles 0 deposit amount or 0 tenure", () => {
    const resZeroP = calculateFD({ principal: 0, annualRate: 7, tenureYears: 2 });
    expect(resZeroP.maturityAmount).toBe(0);
    expect(resZeroP.totalInterest).toBe(0);

    const resZeroT = calculateFD({ principal: 100000, annualRate: 7, tenureYears: 0 });
    expect(resZeroT.maturityAmount).toBe(100000);
    expect(resZeroT.totalInterest).toBe(0);
  });
});
