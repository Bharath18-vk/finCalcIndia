import { describe, it, expect } from "vitest";
import { calculateCompoundInterest } from "@/lib/calculators/compound-interest";

describe("Compound Interest Calculation Engine", () => {
  it("calculates annual compounding accurately against manual reference", () => {
    // ₹1,00,000 at 10% for 3 years
    const result = calculateCompoundInterest({
      principal: 100000,
      annualRate: 10,
      tenureYears: 3,
      frequency: "annual",
    });

    expect(result.maturityAmount).toBe(133100);
    expect(result.totalInterest).toBe(33100);
    expect(result.simpleInterestAmount).toBe(30000);
    expect(result.compoundingBonus).toBe(3100);
    expect(result.effectiveAnnualRate).toBe(10.0);
  });

  it("calculates quarterly and monthly compounding differences correctly", () => {
    const annual = calculateCompoundInterest({
      principal: 100000,
      annualRate: 8,
      tenureYears: 5,
      frequency: "annual",
    });

    const quarterly = calculateCompoundInterest({
      principal: 100000,
      annualRate: 8,
      tenureYears: 5,
      frequency: "quarterly",
    });

    const monthly = calculateCompoundInterest({
      principal: 100000,
      annualRate: 8,
      tenureYears: 5,
      frequency: "monthly",
    });

    // Higher frequency yields more interest
    expect(quarterly.maturityAmount).toBeGreaterThan(annual.maturityAmount);
    expect(monthly.maturityAmount).toBeGreaterThan(quarterly.maturityAmount);
  });

  it("handles zero interest rate safely", () => {
    const result = calculateCompoundInterest({
      principal: 50000,
      annualRate: 0,
      tenureYears: 5,
    });

    expect(result.maturityAmount).toBe(50000);
    expect(result.totalInterest).toBe(0);
    expect(result.compoundingBonus).toBe(0);
  });

  it("produces frequency comparison across all 5 standard periods", () => {
    const result = calculateCompoundInterest({
      principal: 100000,
      annualRate: 12,
      tenureYears: 2,
    });

    expect(result.frequencyComparison.length).toBe(5);
    const daily = result.frequencyComparison.find((f) => f.frequency === "daily");
    const annual = result.frequencyComparison.find((f) => f.frequency === "annual");
    expect(daily!.maturityAmount).toBeGreaterThan(annual!.maturityAmount);
  });
});
