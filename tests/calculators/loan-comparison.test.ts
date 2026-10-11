import { describe, it, expect } from "vitest";
import {
  calculateLoanComparison,
  loanComparisonInputSchema,
  loanComparisonEngine,
} from "@/lib/calculators/loan-comparison";
import { getCalculatorById } from "@/lib/calculators/registry";

describe("Loan Comparison Calculator Engine (Batch 4)", () => {
  // Case 1: Golden Fixture (₹50 Lakhs: 8.5% 20y vs 8.75% 20y)
  it("calculates loan offer comparison and lifetime savings accurately", () => {
    const result = calculateLoanComparison({
      loanA: {
        principal: 5000000,
        interestRate: 8.5,
        tenureYears: 20,
        processingFeePercent: 0.5,
      },
      loanB: {
        principal: 5000000,
        interestRate: 8.75,
        tenureYears: 20,
        processingFeePercent: 0.25,
      },
    });

    // Option A EMI at 8.5% = 43,391; Option B EMI at 8.75% = 44,186
    expect(result.optionA.emi).toBe(43391);
    expect(result.optionB.emi).toBe(44186);
    expect(result.lowerEmiOption).toBe("A");
    expect(result.cheaperOption).toBe("A");
    expect(result.monthlySavings).toBe(795); // 44,186 - 43,391
    expect(result.totalSavings).toBeGreaterThan(170000);
  });

  // Case 2: Identical Offer Case (Equal)
  it("identifies identical loan offers as equal without bias", () => {
    const result = calculateLoanComparison({
      loanA: {
        principal: 3000000,
        interestRate: 9.0,
        tenureYears: 15,
        processingFeePercent: 0.5,
      },
      loanB: {
        principal: 3000000,
        interestRate: 9.0,
        tenureYears: 15,
        processingFeePercent: 0.5,
      },
    });

    expect(result.cheaperOption).toBe("Equal");
    expect(result.lowerEmiOption).toBe("Equal");
    expect(result.totalSavings).toBe(0);
    expect(result.monthlySavings).toBe(0);
  });

  // Case 3: Tenure Trade-Off Case (15-year higher EMI vs 20-year lower EMI)
  it("accurately contrasts lower monthly EMI vs lower total interest over different tenures", () => {
    const result = calculateLoanComparison({
      loanA: {
        principal: 4000000,
        interestRate: 8.5,
        tenureYears: 15, // Shorter tenure, higher EMI, much lower interest
        processingFeePercent: 0,
      },
      loanB: {
        principal: 4000000,
        interestRate: 8.5,
        tenureYears: 25, // Longer tenure, lower EMI, much higher interest
        processingFeePercent: 0,
      },
    });

    // Loan B has lower monthly EMI
    expect(result.lowerEmiOption).toBe("B");
    // But Loan A is significantly cheaper overall
    expect(result.cheaperOption).toBe("A");
    expect(result.optionA.totalInterest).toBeLessThan(result.optionB.totalInterest);
    expect(result.totalSavings).toBeGreaterThan(1500000); // saves > ₹15 Lakhs
  });

  // Case 4: Fractional and Decimal Interest Rates
  it("handles fine-grained basis points (e.g. 8.35% vs 8.40%) with decimal precision", () => {
    const result = calculateLoanComparison({
      loanA: {
        principal: 2500000,
        interestRate: 8.35,
        tenureYears: 10,
      },
      loanB: {
        principal: 2500000,
        interestRate: 8.4,
        tenureYears: 10,
      },
    });

    expect(result.cheaperOption).toBe("A");
    expect(result.optionA.emi).toBeLessThan(result.optionB.emi);
  });

  // Case 5: Invalid Input Schema Validation
  it("validates nested loan parameters strictly via Zod schema", () => {
    const negativePrincipal = loanComparisonInputSchema.safeParse({
      loanA: { principal: -1000, interestRate: 8.5, tenureYears: 20 },
      loanB: { principal: 50000, interestRate: 8.5, tenureYears: 20 },
    });
    expect(negativePrincipal.success).toBe(false);

    const zeroInterest = loanComparisonInputSchema.safeParse({
      loanA: { principal: 100000, interestRate: 0, tenureYears: 20 },
      loanB: { principal: 100000, interestRate: 8.5, tenureYears: 20 },
    });
    expect(zeroInterest.success).toBe(false);

    const excessiveTenure = loanComparisonInputSchema.safeParse({
      loanA: { principal: 100000, interestRate: 8.5, tenureYears: 50 },
      loanB: { principal: 100000, interestRate: 8.5, tenureYears: 20 },
    });
    expect(excessiveTenure.success).toBe(false);
  });

  // Case 6: Large Value Stress Case (₹25 Crores commercial real estate loan)
  it("handles high-value commercial loans up to ₹25 Crores without arithmetic overflow", () => {
    const result = calculateLoanComparison({
      loanA: {
        principal: 250000000,
        interestRate: 9.25,
        tenureYears: 15,
        processingFeePercent: 0.1,
      },
      loanB: {
        principal: 250000000,
        interestRate: 9.5,
        tenureYears: 15,
        processingFeePercent: 0.1,
      },
    });

    expect(result.cheaperOption).toBe("A");
    expect(result.totalSavings).toBeGreaterThan(6000000);
  });

  // Case 7: Central Registry Contract Compliance
  it("is registered with valid metadata in the central calculator registry", () => {
    const registered = getCalculatorById("loan-comparison");
    expect(registered).toBeDefined();
    expect(registered?.metadata.name).toBe("Loan Comparison Calculator India");
    expect(registered?.metadata.route).toBe("/loan-comparison-calculator");
    expect(registered?.metadata.category).toBe("finance");
    expect(registered?.metadata.badge).toBe("Bank Offer Comparison");
    expect(registered?.metadata.directAnswer).toContain("Comparing loan offers");
    expect(registered?.metadata.formula?.steps?.length).toBeGreaterThan(0);
    expect(registered?.metadata.faqs.length).toBeGreaterThan(0);
  });
});
