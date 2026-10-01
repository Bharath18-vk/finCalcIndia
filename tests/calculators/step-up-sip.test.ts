import { describe, it, expect } from "vitest";
import { calculateStepUpSIP } from "@/lib/calculators/step-up-sip";

describe("Step-Up SIP Calculation Engine (Independently Computed Reference Tests)", () => {
  // Test fixture: ₹5,000 initial monthly investment, 10% annual step-up, 12% return for 2 years
  // Month 1-12: ₹5,000/month.
  // Month 13-24: ₹5,500/month (5000 * 1.10).
  // Total invested = (5000 * 12) + (5500 * 12) = 60,000 + 66,000 = 1,26,000
  it("matches 2-year annual 10% step-up simulation", () => {
    const result = calculateStepUpSIP({
      monthlyInvestment: 5000,
      annualReturnRate: 12,
      tenureYears: 2,
      annualStepUpPercentage: 10,
    });

    expect(result.totalInvested).toBe(126000);
    expect(result.finalMonthlyInvestment).toBe(5500);
    expect(result.regularSIPTotalInvested).toBe(120000); // 5000 * 24
    expect(result.futureValue).toBeGreaterThan(result.regularSIPFutureValue);
    expect(result.differenceFutureValue).toBeGreaterThan(0);
    expect(result.yearlyBreakdown.length).toBe(2);
    expect(result.yearlyBreakdown[0].monthlyContribution).toBe(5000);
    expect(result.yearlyBreakdown[1].monthlyContribution).toBe(5500);
  });

  // Long-term fixture: ₹5,000 initial, 10% step-up, 12% return for 15 years
  it("computes 15-year step-up SIP with superior wealth accumulation over flat SIP", () => {
    const result = calculateStepUpSIP({
      monthlyInvestment: 5000,
      annualReturnRate: 12,
      tenureYears: 15,
      annualStepUpPercentage: 10,
    });

    // In 15 years with 10% annual step-up:
    // Regular SIP invested = 5000 * 180 = 9,00,000. Reg FV = 25,22,880.
    // Step-up invested = 19,06,349. Step-up FV = 43,41,925.
    expect(result.totalInvested).toBeGreaterThan(1900000);
    expect(result.futureValue).toBe(4341925);
    expect(result.regularSIPFutureValue).toBe(2522880);
    expect(result.differenceFutureValue).toBe(1819045);
  });

  it("handles 0% step-up (behaves identically to regular SIP)", () => {
    const result = calculateStepUpSIP({
      monthlyInvestment: 5000,
      annualReturnRate: 12,
      tenureYears: 5,
      annualStepUpPercentage: 0,
    });

    expect(result.totalInvested).toBe(result.regularSIPTotalInvested);
    expect(result.futureValue).toBe(result.regularSIPFutureValue);
  });

  it("safely handles edge cases and zeros", () => {
    const res = calculateStepUpSIP({
      monthlyInvestment: 0,
      annualReturnRate: 12,
      tenureYears: 10,
    });
    expect(res.futureValue).toBe(0);
    expect(res.totalInvested).toBe(0);
  });
});
