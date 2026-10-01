import { describe, it, expect } from "vitest";
import { calculateLoanEligibility } from "@/lib/calculators/loan-eligibility";

describe("Loan Eligibility Calculation Engine", () => {
  it("calculates borrowing capacity accurately using FOIR method", () => {
    // ₹1,00,000 net income, ₹10,000 existing EMI, 50% FOIR => ₹40,000 available EMI
    // 8.5% for 20 years
    const result = calculateLoanEligibility({
      netMonthlyIncome: 100000,
      existingMonthlyEMIs: 10000,
      annualRate: 8.5,
      tenureYears: 20,
      foirPercentage: 50,
    });

    expect(result.maxAllowableTotalEMI).toBe(50000);
    expect(result.availableNewEMI).toBe(40000);
    // Independently verified fixture: ₹46,09,234
    expect(result.eligibleLoanAmount).toBe(4609234);
    expect(result.totalRepaymentAmount).toBe(40000 * 240);
    expect(result.totalInterestPayable).toBe(result.totalRepaymentAmount - result.eligibleLoanAmount);
  });

  it("handles zero existing EMI correctly", () => {
    const result = calculateLoanEligibility({
      netMonthlyIncome: 80000,
      existingMonthlyEMIs: 0,
      annualRate: 8.5,
      tenureYears: 15,
      foirPercentage: 50,
    });

    expect(result.availableNewEMI).toBe(40000);
    expect(result.eligibleLoanAmount).toBeGreaterThan(3500000);
  });

  it("returns zero loan eligibility when existing EMIs exceed allowable FOIR limit", () => {
    const result = calculateLoanEligibility({
      netMonthlyIncome: 50000,
      existingMonthlyEMIs: 30000, // 60% of income, exceeding 50% FOIR
      annualRate: 8.5,
      tenureYears: 20,
      foirPercentage: 50,
    });

    expect(result.availableNewEMI).toBe(0);
    expect(result.eligibleLoanAmount).toBe(0);
    expect(result.totalInterestPayable).toBe(0);
  });

  it("produces multi-tenure sensitivity comparisons", () => {
    const result = calculateLoanEligibility({
      netMonthlyIncome: 150000,
      existingMonthlyEMIs: 20000,
      annualRate: 8.5,
      tenureYears: 20,
    });

    expect(result.tenureComparisonTable.length).toBe(6);
    // Longer tenure yields larger borrowing capacity for same available EMI
    const tenYear = result.tenureComparisonTable.find((s) => s.tenureYears === 10);
    const thirtyYear = result.tenureComparisonTable.find((s) => s.tenureYears === 30);
    expect(thirtyYear!.eligibleLoanAmount).toBeGreaterThan(tenYear!.eligibleLoanAmount);
  });
});
