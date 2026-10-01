import { describe, it, expect } from "vitest";
import { calculateRD } from "@/lib/calculators/rd";

describe("Recurring Deposit (RD) Calculation Engine", () => {
  it("calculates standard 1-year RD maturity correctly with quarterly compounding", () => {
    // ₹5,000/month for 12 months at 6.8% p.a.
    const result = calculateRD({
      monthlyDeposit: 5000,
      annualRate: 6.8,
      tenureMonths: 12,
    });

    expect(result.totalDeposit).toBe(60000);
    // Calculated independently: ₹62,244 maturity amount
    expect(result.maturityAmount).toBe(62244);
    expect(result.totalInterest).toBe(2244);
    expect(result.effectiveAnnualYield).toBe(6.98); // (1+0.068/4)^4 - 1
  });

  it("adds +0.50% p.a. premium for senior citizens", () => {
    const general = calculateRD({
      monthlyDeposit: 10000,
      annualRate: 7.0,
      tenureMonths: 24,
      isSeniorCitizen: false,
    });

    const senior = calculateRD({
      monthlyDeposit: 10000,
      annualRate: 7.0,
      tenureMonths: 24,
      isSeniorCitizen: true,
    });

    expect(general.effectiveRate).toBe(7.0);
    expect(senior.effectiveRate).toBe(7.5);
    expect(senior.maturityAmount).toBeGreaterThan(general.maturityAmount);
    expect(senior.totalInterest).toBeGreaterThan(general.totalInterest);
  });

  it("handles zero interest rate safely without NaN", () => {
    const result = calculateRD({
      monthlyDeposit: 5000,
      annualRate: 0,
      tenureMonths: 12,
    });

    expect(result.totalDeposit).toBe(60000);
    expect(result.maturityAmount).toBe(60000);
    expect(result.totalInterest).toBe(0);
    expect(Number.isNaN(result.maturityAmount)).toBe(false);
  });

  it("handles boundary values (zero deposit, fractional tenure) safely", () => {
    const zeroDeposit = calculateRD({
      monthlyDeposit: 0,
      annualRate: 6.8,
      tenureMonths: 12,
    });
    expect(zeroDeposit.totalDeposit).toBe(0);
    expect(zeroDeposit.maturityAmount).toBe(0);
    expect(zeroDeposit.totalInterest).toBe(0);

    const highTenure = calculateRD({
      monthlyDeposit: 1000,
      annualRate: 7.1,
      tenureMonths: 120, // 10 years
    });
    expect(highTenure.totalDeposit).toBe(120000);
    expect(highTenure.maturityAmount).toBeGreaterThan(120000);
    expect(highTenure.yearlyBreakdown.length).toBe(10);
  });

  it("generates structured yearly breakdown accurately", () => {
    const result = calculateRD({
      monthlyDeposit: 5000,
      annualRate: 7.0,
      tenureMonths: 36, // 3 years
    });

    expect(result.yearlyBreakdown.length).toBe(3);
    const lastYear = result.yearlyBreakdown[2];
    expect(lastYear.depositedSoFar).toBe(180000);
    expect(lastYear.closingBalance).toBe(result.maturityAmount);
    expect(lastYear.cumulativeInterest).toBe(result.totalInterest);
  });
});
