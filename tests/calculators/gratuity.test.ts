import { describe, it, expect } from "vitest";
import { calculateGratuity, STATUTORY_GRATUITY_EXEMPTION_LIMIT } from "@/lib/calculators/gratuity";

describe("Gratuity Calculator (Payment of Gratuity Act, 1972)", () => {
  it("independently computes gratuity using statutory 15/26 formula for covered employees", () => {
    // Basic: 50,000
    // Formula: (15 * 50,000 * 10) / 26 = 75,00,000 / 26 = 2,88,461.538... -> 2,88,462
    const result = calculateGratuity({
      monthlyBasicSalary: 50000,
      tenureYears: 10,
      tenureMonths: 0,
      isCoveredUnderAct: true,
    });

    expect(result.isEligible).toBe(true);
    expect(result.effectiveServiceYears).toBe(10);
    expect(result.totalGratuityCalculated).toBe(288462);
    expect(result.taxExemptGratuity).toBe(288462);
    expect(result.taxableGratuity).toBe(0);
    expect(result.formulaDisplay).toBe("15/26 × Last Drawn Wages × Completed Years of Service");
  });

  it("rounds up fraction of year exceeding 6 months to the next full year for covered employees", () => {
    // 7 years and 7 months -> rounded to 8 years
    // Formula: (15 * 60,000 * 8) / 26 = 72,00,000 / 26 = 2,76,923.07... -> 2,76,923
    const result = calculateGratuity({
      monthlyBasicSalary: 60000,
      tenureYears: 7,
      tenureMonths: 7,
      isCoveredUnderAct: true,
    });

    expect(result.effectiveServiceYears).toBe(8);
    expect(result.totalGratuityCalculated).toBe(276923);
  });

  it("applies 15/30 divisor and does not round partial years for non-covered employees", () => {
    // 7 years and 7 months for non-covered -> only 7 full years count
    // Formula: (15 * 60,000 * 7) / 30 = 63,00,000 / 30 = 2,10,000
    const result = calculateGratuity({
      monthlyBasicSalary: 60000,
      tenureYears: 7,
      tenureMonths: 7,
      isCoveredUnderAct: false,
    });

    expect(result.isCoveredUnderAct).toBe(false);
    expect(result.effectiveServiceYears).toBe(7);
    expect(result.totalGratuityCalculated).toBe(210000);
    expect(result.formulaDisplay).toBe("15/30 × Last Drawn Wages × Completed Years of Service");
  });

  it("waives the 5-year tenure requirement when death or permanent disablement applies under Section 4(1) proviso", () => {
    const result = calculateGratuity({
      monthlyBasicSalary: 50000,
      tenureYears: 2,
      tenureMonths: 4,
      isCoveredUnderAct: true,
      waiveFiveYearRuleForDeathOrDisablement: true,
    });

    // 2 years 4 months -> 2 effective years
    // (15 * 50000 * 2) / 26 = 15,00,000 / 26 = 57,692
    expect(result.isEligible).toBe(true);
    expect(result.eligibilityReason).toContain("Section 4(1) proviso");
    expect(result.totalGratuityCalculated).toBe(57692);
  });

  it("returns zero gratuity when service tenure is below statutory 5 years threshold and no waiver applies", () => {
    const result = calculateGratuity({
      monthlyBasicSalary: 75000,
      tenureYears: 4,
      tenureMonths: 6,
    });

    expect(result.isEligible).toBe(false);
    expect(result.totalGratuityCalculated).toBe(0);
    expect(result.taxExemptGratuity).toBe(0);
  });

  it("correctly enforces the ₹20,00,000 statutory tax exemption cap under Section 10(10)", () => {
    // Basic: 2,00,000 for 25 years
    // (15 * 2,00,000 * 25) / 26 = 7,50,00,000 / 26 = 28,84,615
    const result = calculateGratuity({
      monthlyBasicSalary: 200000,
      tenureYears: 25,
      isCoveredUnderAct: true,
    });

    expect(result.totalGratuityCalculated).toBe(2884615);
    expect(result.statutoryExemptionLimit).toBe(STATUTORY_GRATUITY_EXEMPTION_LIMIT);
    expect(result.taxExemptGratuity).toBe(2000000);
    expect(result.taxableGratuity).toBe(2884615 - 2000000);
  });
});
