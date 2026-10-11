import { describe, it, expect } from "vitest";
import {
  calculateSimpleInterest,
  simpleInterestEngine,
  simpleInterestInputSchema,
} from "@/lib/calculators/simple-interest";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Simple Interest Calculator Engine & Contract (Phase A)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes SI on ₹1,00,000 at 7.5% for 3 years = ₹22,500 (Golden Fixture)", () => {
      const result = calculateSimpleInterest({
        principal: 100000,
        annualRate: 7.5,
        tenureYears: 3,
      });

      expect(result.principal).toBe(100000);
      expect(result.annualRate).toBe(7.5);
      expect(result.tenureYearsTotal).toBe(3);
      expect(result.interestAmount).toBe(22500);
      expect(result.totalAmount).toBe(122500);
      expect(result.monthlyInterest).toBe(Math.round(22500 / 36));
      expect(result.yearlyBreakdown.length).toBe(3);
      expect(result.yearlyBreakdown[2].closingBalance).toBe(122500);
    });

    it("computes compound interest comparison accurately", () => {
      const result = calculateSimpleInterest({
        principal: 100000,
        annualRate: 10,
        tenureYears: 2,
      });

      // SI = 100000 * 0.10 * 2 = 20,000 => Total 1,20,000
      expect(result.interestAmount).toBe(20000);
      expect(result.totalAmount).toBe(120000);

      // Annual compounding: 100000 * (1.1)^2 = 1,21,000
      expect(result.compoundInterestComparison.compoundAnnual).toBe(121000);
      // Quarterly compounding exceeds annual compounding
      expect(result.compoundInterestComparison.compoundQuarterly).toBeGreaterThan(121000);
      expect(result.compoundInterestComparison.differenceQuarterly).toBeGreaterThan(1000);
    });
  });

  describe("2. Zero Cases", () => {
    it("returns zero interest when principal is zero", () => {
      const result = calculateSimpleInterest({
        principal: 0,
        annualRate: 8,
        tenureYears: 5,
      });

      expect(result.interestAmount).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it("returns zero interest when annual rate is zero", () => {
      const result = calculateSimpleInterest({
        principal: 50000,
        annualRate: 0,
        tenureYears: 3,
      });

      expect(result.interestAmount).toBe(0);
      expect(result.totalAmount).toBe(50000);
    });

    it("returns zero interest when tenure is zero", () => {
      const result = calculateSimpleInterest({
        principal: 50000,
        annualRate: 10,
        tenureYears: 0,
        tenureMonths: 0,
      });

      expect(result.interestAmount).toBe(0);
      expect(result.totalAmount).toBe(50000);
    });
  });

  describe("3. Boundary Cases & Fractional Tenures", () => {
    it("handles tenure with fractional months (6 months = 0.5 years)", () => {
      const result = calculateSimpleInterest({
        principal: 100000,
        annualRate: 10,
        tenureYears: 0,
        tenureMonths: 6,
      });

      // 100000 * 0.10 * 0.5 = 5,000
      expect(result.tenureYearsTotal).toBe(0.5);
      expect(result.interestAmount).toBe(5000);
      expect(result.totalAmount).toBe(105000);
    });

    it("handles 1 year exact boundary", () => {
      const result = calculateSimpleInterest({
        principal: 200000,
        annualRate: 6,
        tenureYears: 1,
      });

      expect(result.interestAmount).toBe(12000);
      expect(result.totalAmount).toBe(212000);
    });
  });

  describe("4. Decimal Rates", () => {
    it("computes interest with decimal rates accurately (8.25% p.a.)", () => {
      const result = calculateSimpleInterest({
        principal: 80000,
        annualRate: 8.25,
        tenureYears: 2,
      });

      // 80000 * 0.0825 * 2 = 13,200
      expect(result.interestAmount).toBe(13200);
      expect(result.totalAmount).toBe(93200);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects negative principal", () => {
      const validation = validateCalculatorInput(simpleInterestInputSchema, {
        principal: -5000,
        annualRate: 8,
        tenureYears: 2,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.principal).toContain("cannot be negative");
    });

    it("rejects rate over 100%", () => {
      const validation = validateCalculatorInput(simpleInterestInputSchema, {
        principal: 10000,
        annualRate: 120,
        tenureYears: 2,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.annualRate).toContain("cannot exceed 100%");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes interest on ₹10 Crore ($10^8) accurately without overflow", () => {
      const result = calculateSimpleInterest({
        principal: 100000000,
        annualRate: 8,
        tenureYears: 5,
      });

      // 10 Cr * 8% * 5 yrs = 4 Cr
      expect(result.interestAmount).toBe(40000000);
      expect(result.totalAmount).toBe(140000000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'simple-interest'", () => {
      const registered = getCalculatorById("simple-interest");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("simple-interest");
      expect(registered?.metadata.name).toBe("Simple Interest Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/simple-interest-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = simpleInterestEngine.calculate(simpleInterestEngine.defaultInputs);
      const formatted = simpleInterestEngine.formatResult!(raw, simpleInterestEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Total Simple Interest Earned");
      expect(formatted.primary.formattedValue).toBe("₹22,500");
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
