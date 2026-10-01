import { describe, it, expect } from "vitest";
import { calculateSIP } from "@/lib/calculators/sip";

describe("SIP Calculation Engine (Independently Computed Reference Tests)", () => {
  // Independent benchmark fixture 1: ₹5,000/month for 10 years at 12% p.a.
  // Convention: Annuity Due (monthly compounding, investment at start of each month)
  // r = 0.12 / 12 = 0.01
  // n = 120
  // (1 + r)^120 = 3.30038689
  // FV = 5000 * ((3.30038689 - 1) / 0.01) * 1.01 = 11,61,695.38 => 11,61,695
  // Total Invested = 5000 * 120 = 6,00,000
  // Wealth Gained = 1161695 - 600000 = 5,61,695
  it("matches independently verified SIP fixture (₹5,000, 12%, 10 years)", () => {
    const result = calculateSIP({
      monthlyInvestment: 5000,
      annualReturnRate: 12,
      tenureYears: 10,
    });

    expect(result.futureValue).toBe(1161695);
    expect(result.totalInvested).toBe(600000);
    expect(result.wealthGained).toBe(561695);
    expect(result.totalMonths).toBe(120);
    expect(result.wealthMultiple).toBe(1.94);
    expect(result.yearlyBreakdown.length).toBe(10);
    expect(result.yearlyBreakdown[9].futureValue).toBe(1161695);
  });

  // Zero return test
  it("handles 0% annual return rate accurately (returns invested principal only)", () => {
    const result = calculateSIP({
      monthlyInvestment: 5000,
      annualReturnRate: 0,
      tenureYears: 5,
    });

    expect(result.totalInvested).toBe(300000);
    expect(result.futureValue).toBe(300000);
    expect(result.wealthGained).toBe(0);
    expect(result.wealthMultiple).toBe(1);
  });

  // Short tenure test: 1 year (12 months) at 12%
  // FV = 1000 * ((1.01^12 - 1) / 0.01) * 1.01 = 1000 * 12.682503 * 1.01 = 12809.33 => 12809
  it("matches 1-year short horizon calculation", () => {
    const result = calculateSIP({
      monthlyInvestment: 1000,
      annualReturnRate: 12,
      tenureYears: 1,
    });

    expect(result.totalInvested).toBe(12000);
    expect(result.futureValue).toBe(12809);
    expect(result.wealthGained).toBe(809);
  });

  // Fractional rate test
  it("handles fractional return rate (e.g. 13.5%)", () => {
    const result = calculateSIP({
      monthlyInvestment: 10000,
      annualReturnRate: 13.5,
      tenureYears: 15,
    });

    expect(result.futureValue).toBeGreaterThan(5000000);
    expect(Number.isFinite(result.futureValue)).toBe(true);
  });

  // Edge cases
  it("safely handles 0 monthly investment or 0 tenure", () => {
    const resZeroP = calculateSIP({ monthlyInvestment: 0, annualReturnRate: 12, tenureYears: 10 });
    expect(resZeroP.futureValue).toBe(0);
    expect(resZeroP.totalInvested).toBe(0);

    const resZeroT = calculateSIP({ monthlyInvestment: 5000, annualReturnRate: 12, tenureYears: 0 });
    expect(resZeroT.futureValue).toBe(0);
  });

  it("safely handles negative inputs without crashing", () => {
    const res = calculateSIP({ monthlyInvestment: -5000, annualReturnRate: -12, tenureYears: -5 });
    expect(res.futureValue).toBe(0);
    expect(isNaN(res.futureValue)).toBe(false);
  });
});
