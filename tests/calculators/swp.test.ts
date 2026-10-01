import { describe, it, expect } from "vitest";
import { calculateSWP } from "@/lib/calculators/swp";

describe("Systematic Withdrawal Plan (SWP) Calculation Engine", () => {
  it("calculates sustainable withdrawal where corpus appreciates", () => {
    // ₹10 Lakh initial, ₹5,000/mo withdrawal (₹60k/yr = 6%), 10% annual return, 5 years
    const result = calculateSWP({
      initialInvestment: 1000000,
      monthlyWithdrawal: 5000,
      expectedAnnualReturn: 10,
      tenureYears: 5,
    });

    expect(result.totalWithdrawn).toBe(300000);
    expect(result.isDepleted).toBe(false);
    expect(result.finalValue).toBeGreaterThan(1000000);
    expect(result.totalProfitGenerated).toBeGreaterThan(300000);
    expect(result.yearlyBreakdown.length).toBe(5);
  });

  it("detects capital depletion when withdrawal rate is excessively high", () => {
    // ₹1 Lakh initial, ₹20,000/mo withdrawal, 8% return, 3 years
    const result = calculateSWP({
      initialInvestment: 100000,
      monthlyWithdrawal: 20000,
      expectedAnnualReturn: 8,
      tenureYears: 3,
    });

    expect(result.isDepleted).toBe(true);
    expect(result.depletionMonth).toBeDefined();
    expect(result.depletionMonth).toBeLessThanOrEqual(6);
    expect(result.finalValue).toBe(0);
    expect(result.totalWithdrawn).toBeLessThan(120000);
  });

  it("handles zero withdrawal accurately as pure compounding", () => {
    const result = calculateSWP({
      initialInvestment: 100000,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 12,
      tenureYears: 1,
    });

    expect(result.totalWithdrawn).toBe(0);
    expect(result.finalValue).toBeGreaterThan(112000); // monthly compounding of 12%
    expect(result.isDepleted).toBe(false);
  });

  it("handles zero return safely without errors", () => {
    const result = calculateSWP({
      initialInvestment: 120000,
      monthlyWithdrawal: 10000,
      expectedAnnualReturn: 0,
      tenureYears: 1,
    });

    expect(result.totalWithdrawn).toBe(120000);
    expect(result.finalValue).toBe(0);
    expect(result.totalProfitGenerated).toBe(0);
  });
});
