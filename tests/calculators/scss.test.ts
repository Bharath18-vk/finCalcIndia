import { describe, it, expect } from "vitest";
import {
  calculateScss,
  scssEngine,
  scssInputSchema,
} from "@/lib/calculators/scss";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Senior Citizen Savings Scheme (SCSS) Calculator Engine & Contract (Phase A Batch 3)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes quarterly payout and cash flows for golden fixture (₹15,00,000 @ 8.2% for 5 years)", () => {
      const result = calculateScss({
        depositAmount: 1500000,
        interestRate: 8.2,
        tenureYears: 5,
        investorAge: 60,
      });

      expect(result.depositAmount).toBe(1500000);
      expect(result.interestRate).toBe(8.2);
      expect(result.tenureYears).toBe(5);

      // (15,00,000 * 8.2) / 400 = 30,750
      expect(result.quarterlyPayout).toBe(30750);
      expect(result.monthlyEquivalent).toBe(10250);
      expect(result.annualPayout).toBe(123000); // 30750 * 4
      expect(result.totalInterest).toBe(615000); // 123000 * 5
      expect(result.totalPayout).toBe(2115000); // 1500000 + 615000

      // Section 80TTB Tax Exemption
      expect(result.section80TtbDeduction).toBe(50000);
      expect(result.taxableAnnualInterest).toBe(73000); // 123000 - 50000

      // Schedule verification
      expect(result.schedule).toHaveLength(5);
      expect(result.schedule[0].quarterlyInterest).toBe(30750);
      expect(result.schedule[4].cumulativeInterest).toBe(615000);
    });
  });

  describe("2. Minimum Statutory Deposit Cases", () => {
    it("computes accurately for minimum permitted deposit of ₹1,000", () => {
      const result = calculateScss({
        depositAmount: 1000,
        interestRate: 8.2,
        tenureYears: 5,
      });

      // (1000 * 8.2) / 400 = 20.5
      expect(result.quarterlyPayout).toBe(20.5);
      expect(result.annualPayout).toBe(82);
      expect(result.totalInterest).toBe(410);
      expect(result.totalPayout).toBe(1410);
      expect(result.section80TtbDeduction).toBe(82); // all exempt
      expect(result.taxableAnnualInterest).toBe(0);
    });
  });

  describe("3. Boundary Cases & Maximum Limit", () => {
    it("computes accurately for enhanced maximum limit of ₹30,00,000 (Union Budget 2023)", () => {
      const result = calculateScss({
        depositAmount: 3000000,
        interestRate: 8.2,
        tenureYears: 5,
      });

      // (30,00,000 * 8.2) / 400 = 61,500
      expect(result.quarterlyPayout).toBe(61500);
      expect(result.annualPayout).toBe(246000);
      expect(result.totalInterest).toBe(1230000);
      expect(result.totalPayout).toBe(4230000);
    });

    it("handles extended 8-year tenure option", () => {
      const result = calculateScss({
        depositAmount: 3000000,
        interestRate: 8.2,
        tenureYears: 8,
      });

      expect(result.tenureYears).toBe(8);
      expect(result.schedule).toHaveLength(8);
      expect(result.totalInterest).toBe(1968000); // 246000 * 8
      expect(result.totalPayout).toBe(4968000);
    });
  });

  describe("4. Decimal Interest Rate Sensitivity Cases", () => {
    it("computes accurate quarterly payouts across rate variations (7.4% vs 8.2%)", () => {
      const res74 = calculateScss({ depositAmount: 1000000, interestRate: 7.4 });
      const res82 = calculateScss({ depositAmount: 1000000, interestRate: 8.2 });

      // (10L * 7.4) / 400 = 18,500
      expect(res74.quarterlyPayout).toBe(18500);
      // (10L * 8.2) / 400 = 20,500
      expect(res82.quarterlyPayout).toBe(20500);
      expect(res82.quarterlyPayout).toBeGreaterThan(res74.quarterlyPayout);
    });
  });

  describe("5. Invalid Input & Schema Validation Cases", () => {
    it("fails validation when deposit is below minimum ₹1,000", () => {
      const validation = validateCalculatorInput(scssInputSchema, {
        depositAmount: 500,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.depositAmount).toBe("Minimum deposit in SCSS is ₹1,000");
    });

    it("fails validation when deposit exceeds ₹30,00,000 cap", () => {
      const validation = validateCalculatorInput(scssInputSchema, {
        depositAmount: 3500000,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.depositAmount).toBe(
        "Maximum deposit limit in SCSS is ₹30,00,000 per individual"
      );
    });

    it("fails validation when investor age is below 50", () => {
      const validation = validateCalculatorInput(scssInputSchema, {
        depositAmount: 500000,
        investorAge: 45,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.investorAge).toBe(
        "Minimum age for retired personnel is 50, general is 60"
      );
    });
  });

  describe("6. Large-Value Cases", () => {
    it("processes ₹30 Lakh deposit across 8 years with exact precision", () => {
      const result = calculateScss({
        depositAmount: 3000000,
        interestRate: 8.2,
        tenureYears: 8,
      });

      expect(result.schedule[7].cumulativeInterest).toBe(1968000);
      expect(result.totalPayout).toBe(4968000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'scss'", () => {
      const registered = getCalculatorById("scss");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("scss");
      expect(registered?.metadata.name).toBe("Senior Citizen Savings Scheme (SCSS) Calculator");
      expect(registered?.metadata.category).toBe("finance");
      expect(registered?.metadata.route).toBe("/scss-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = scssEngine.calculate(scssEngine.defaultInputs);
      const formatted = scssEngine.formatResult!(raw, scssEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Quarterly Regular Income");
      expect(formatted.primary.value).toBe(raw.quarterlyPayout);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
