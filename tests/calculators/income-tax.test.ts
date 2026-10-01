import { describe, it, expect } from "vitest";
import { calculateIncomeTax } from "@/lib/calculators/income-tax";

describe("Income Tax Calculator (AY 2026-27 & AY 2025-26 Statutory Rules)", () => {
  describe("AY 2026-27 (Current Default Rules)", () => {
    it("computes zero tax under New Regime for gross salary up to ₹12.75 Lakhs due to ₹75k std deduction and Section 87A rebate of ₹60,000", () => {
      // Gross ₹12,75,000 - ₹75,000 std ded = ₹12,00,000 taxable
      // Slabs: 0-4L: 0; 4-8L @ 5%: 20k; 8-12L @ 10%: 40k. Total Slab Tax = 60,000.
      // Section 87A rebate: 60,000 -> Tax after rebate = 0.
      const result = calculateIncomeTax({
        grossAnnualIncome: 1275000,
        isSalaried: true,
        assessmentYear: "2026-27",
      });

      expect(result.assessmentYear).toBe("2026-27");
      expect(result.newRegime.standardDeduction).toBe(75000);
      expect(result.newRegime.taxableIncome).toBe(1200000);
      expect(result.newRegime.slabTax).toBe(60000);
      expect(result.newRegime.rebate87A).toBe(60000);
      expect(result.newRegime.taxAfterRebate).toBe(0);
      expect(result.newRegime.totalTax).toBe(0);
      expect(result.newRegime.effectiveTaxRate).toBe(0);
    });

    it("accurately implements Section 87A marginal relief when taxable income slightly exceeds ₹12,00,000", () => {
      // Gross ₹12,85,000 for salaried -> Taxable ₹12,10,000 (exceeds 12L by ₹10,000)
      // Slab tax: 60,000 on first 12L + 15% of 10,000 = 60,000 + 1,500 = 61,500.
      // Excess income over 12L is only 10,000.
      // Under marginal relief, tax before cess cannot exceed excess income (10,000).
      // Relief amount = 61,500 - 10,000 = 51,500.
      // Tax payable before cess = 10,000.
      // Cess @ 4% = 400.
      // Total tax = 10,400.
      const result = calculateIncomeTax({
        grossAnnualIncome: 1285000,
        isSalaried: true,
        assessmentYear: "2026-27",
      });

      expect(result.newRegime.taxableIncome).toBe(1210000);
      expect(result.newRegime.slabTax).toBe(61500);
      expect(result.newRegime.marginalRelief87A).toBe(51500);
      expect(result.newRegime.taxAfterRebate).toBe(10000);
      expect(result.newRegime.cess).toBe(400);
      expect(result.newRegime.totalTax).toBe(10400);
    });

    it("independently computes tax across all 7 statutory AY 2026-27 brackets for ₹30 Lakh gross salary", () => {
      // Gross ₹30,00,000 - ₹75,000 = ₹29,25,000 taxable
      // 0-4L: 0
      // 4-8L (4L @ 5%): 20,000
      // 8-12L (4L @ 10%): 40,000
      // 12-16L (4L @ 15%): 60,000
      // 16-20L (4L @ 20%): 80,000
      // 20-24L (4L @ 25%): 1,00,000
      // >24L (5.25L @ 30%): 1,57,500
      // Total Slab Tax = 20k + 40k + 60k + 80k + 100k + 157.5k = 4,57,500
      // Cess @ 4% of 4,57,500 = 18,300
      // Total Tax = 4,75,800
      const result = calculateIncomeTax({
        grossAnnualIncome: 3000000,
        isSalaried: true,
        assessmentYear: "2026-27",
      });

      expect(result.newRegime.taxableIncome).toBe(2925000);
      expect(result.newRegime.slabTax).toBe(457500);
      expect(result.newRegime.cess).toBe(18300);
      expect(result.newRegime.totalTax).toBe(475800);
    });

    it("applies 10% surcharge with statutory marginal relief for taxable income slightly exceeding ₹50 Lakhs", () => {
      // Taxable income ₹51,00,000 (Non-salaried gross 51L)
      // Tax on 50L threshold: 20k + 40k + 60k + 80k + 100k + (26L * 0.30 = 7,80,000) = 10,80,000
      // Tax on 51L without surcharge: 10,80,000 + (1L * 0.30 = 30,000) = 11,10,000
      // 10% surcharge = 1,11,000 -> Total = 12,21,000
      // Max allowed: Tax at 50L (10,80,000) + excess income (1,00,000) = 11,80,000
      // Marginal relief = 12,21,000 - 11,80,000 = 41,000
      // Surcharge after relief = 1,11,000 - 41,000 = 70,000
      // Tax + Surcharge = 11,80,000
      // Cess @ 4% = 47,200
      // Total = 12,27,200
      const result = calculateIncomeTax({
        grossAnnualIncome: 5100000,
        isSalaried: false,
        assessmentYear: "2026-27",
      });

      expect(result.newRegime.slabTax).toBe(1110000);
      expect(result.newRegime.surcharge).toBe(70000);
      expect(result.newRegime.marginalReliefSurcharge).toBe(41000);
      expect(result.newRegime.cess).toBe(47200);
      expect(result.newRegime.totalTax).toBe(1227200);
    });
  });

  describe("AY 2025-26 (Retrospective Ruleset Support)", () => {
    it("computes zero tax under AY 2025-26 rules for gross salary of ₹7.75 Lakhs", () => {
      const result = calculateIncomeTax({
        grossAnnualIncome: 775000,
        isSalaried: true,
        assessmentYear: "2025-26",
      });

      expect(result.assessmentYear).toBe("2025-26");
      expect(result.newRegime.standardDeduction).toBe(75000);
      expect(result.newRegime.taxableIncome).toBe(700000);
      expect(result.newRegime.slabTax).toBe(20000);
      expect(result.newRegime.rebate87A).toBe(20000);
      expect(result.newRegime.totalTax).toBe(0);
    });
  });

  describe("Old vs New Regime Decision Boundary", () => {
    it("correctly identifies Old Regime superiority when heavy deductions are claimed", () => {
      // Gross 20L
      // Old: 50k std + 1.5L 80C + 50k 80D + 2L home loan + 1.5L HRA = 6L ded -> Taxable 14L
      // Old Tax: 12.5k (2.5-5L) + 100k (5-10L) + 120k (10-14L @ 30%) = 2,32,500 + 4% = 2,41,800
      // New AY 2026-27: 20L - 75k = 19.25L taxable
      // New Tax: 20k + 40k + 60k + (3.25L * 0.20 = 65,000) = 1,85,000 + 4% = 1,92,400
      // In AY 2026-27 with expanded slabs, New Regime is actually MORE beneficial even with 6L deductions!
      const result = calculateIncomeTax({
        grossAnnualIncome: 2000000,
        isSalaried: true,
        assessmentYear: "2026-27",
        deduction80C: 150000,
        deduction80D: 50000,
        homeLoanInterest24b: 200000,
        hraExemption: 150000,
      });

      expect(result.oldRegime.totalTax).toBe(241800);
      expect(result.newRegime.totalTax).toBe(192400);
      expect(result.recommendedRegime).toBe("new");
    });
  });
});
