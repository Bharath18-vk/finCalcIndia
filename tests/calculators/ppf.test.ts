import { describe, it, expect } from "vitest";
import { calculatePPF } from "@/lib/calculators/ppf";

describe("Public Provident Fund (PPF) Calculation Engine", () => {
  it("calculates standard 15-year PPF with annual ₹1.5 Lakh deposit at 7.1%", () => {
    const result = calculatePPF({
      depositAmount: 150000,
      depositFrequency: "annual",
      annualRate: 7.1,
      tenureYears: 15,
    });

    expect(result.totalDeposit).toBe(2250000);
    // Independently verified fixture: ₹40,68,208
    expect(result.maturityAmount).toBe(4068208);
    expect(result.totalInterest).toBe(1818208);
    expect(result.yearlyBreakdown.length).toBe(15);
  });

  it("calculates monthly deposit schedule accurately", () => {
    // ₹12,500/month = ₹1.5 Lakh/year
    const result = calculatePPF({
      depositAmount: 12500,
      depositFrequency: "monthly",
      annualRate: 7.1,
      tenureYears: 15,
    });

    expect(result.totalDeposit).toBe(2250000);
    // Monthly deposit interest is slightly lower than annual lump sum deposited in April
    expect(result.maturityAmount).toBeLessThan(4068209);
    expect(result.maturityAmount).toBeGreaterThan(3900000);
  });

  it("caps deposit at statutory ₹1.5 Lakh limit", () => {
    const result = calculatePPF({
      depositAmount: 250000, // over limit
      depositFrequency: "annual",
      annualRate: 7.1,
      tenureYears: 15,
    });

    expect(result.annualDepositEquivalent).toBe(150000);
    expect(result.totalDeposit).toBe(2250000);
  });

  it("computes loan eligibility (years 3-6) and withdrawal limit (years 7+) accurately", () => {
    const result = calculatePPF({
      depositAmount: 100000,
      depositFrequency: "annual",
      annualRate: 7.1,
      tenureYears: 15,
    });

    // Year 1 and 2: no loan eligibility
    expect(result.yearlyBreakdown[0].loanEligibility).toBe(0);
    expect(result.yearlyBreakdown[1].loanEligibility).toBe(0);

    // Year 3: 25% of Year 1 closing balance
    const y1Closing = result.yearlyBreakdown[0].closingBalance;
    expect(result.yearlyBreakdown[2].loanEligibility).toBe(Math.round(y1Closing * 0.25));

    // Year 7: partial withdrawal enabled
    expect(result.yearlyBreakdown[6].withdrawalLimit).toBeGreaterThan(0);
  });

  it("supports 5-year block extensions (20, 25, 30 years)", () => {
    const result20 = calculatePPF({
      depositAmount: 150000,
      annualRate: 7.1,
      tenureYears: 20,
    });
    expect(result20.yearlyBreakdown.length).toBe(20);
    expect(result20.maturityAmount).toBeGreaterThan(6000000);
  });

  it("handles zero interest rate safely", () => {
    const result = calculatePPF({
      depositAmount: 50000,
      annualRate: 0,
      tenureYears: 15,
    });

    expect(result.totalDeposit).toBe(750000);
    expect(result.maturityAmount).toBe(750000);
    expect(result.totalInterest).toBe(0);
  });
});
