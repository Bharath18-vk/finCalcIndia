import { describe, it, expect } from "vitest";
import { calculatePrepayment } from "@/lib/calculators/prepayment";

describe("Loan Prepayment Calculation Engine", () => {
  it("calculates tenure reduction and interest savings with extra monthly EMI", () => {
    // ₹30 Lakh at 8.5% for 20 years, +₹5,000 extra monthly
    const result = calculatePrepayment({
      principal: 3000000,
      annualRate: 8.5,
      tenureYears: 20,
      strategy: "reduce-tenure",
      monthlyExtraEMI: 5000,
    });

    expect(result.originalEMI).toBe(26035);
    expect(result.revisedTenureMonths).toBeLessThan(result.originalTenureMonths);
    expect(result.tenureMonthsSaved).toBeGreaterThan(60); // Saves over 5 years
    expect(result.totalInterestSaved).toBeGreaterThan(900000); // Saves over ₹9 Lakh
    expect(result.percentageInterestSaved).toBeGreaterThan(25);
  });

  it("calculates one-time lump sum prepayment impact accurately", () => {
    // ₹50 Lakh at 8.5% for 20 years, ₹5 Lakh prepayment at month 24
    const result = calculatePrepayment({
      principal: 5000000,
      annualRate: 8.5,
      tenureYears: 20,
      strategy: "reduce-tenure",
      oneTimePrepayment: {
        amount: 500000,
        atMonth: 24,
      },
    });

    expect(result.totalPrepaymentAmount).toBe(500000);
    expect(result.tenureMonthsSaved).toBeGreaterThan(30);
    expect(result.totalInterestSaved).toBeGreaterThan(800000);
  });

  it("calculates reduce-emi strategy by maintaining tenure and lowering monthly installment", () => {
    const result = calculatePrepayment({
      principal: 2000000,
      annualRate: 9.0,
      tenureYears: 15,
      strategy: "reduce-emi",
      oneTimePrepayment: {
        amount: 300000,
        atMonth: 12,
      },
    });

    expect(result.strategy).toBe("reduce-emi");
    expect(result.revisedEMI).toBeLessThan(result.originalEMI);
    expect(result.totalInterestSaved).toBeGreaterThan(200000);
  });

  it("handles zero prepayment safely returning original loan metrics", () => {
    const result = calculatePrepayment({
      principal: 1000000,
      annualRate: 8.5,
      tenureYears: 10,
    });

    expect(result.tenureMonthsSaved).toBe(0);
    expect(result.totalInterestSaved).toBe(0);
    expect(result.revisedEMI).toBe(result.originalEMI);
    expect(result.revisedTenureMonths).toBe(result.originalTenureMonths);
  });
});
