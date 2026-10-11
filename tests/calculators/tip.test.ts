import { describe, it, expect } from "vitest";
import {
  calculateTip,
  tipEngine,
  tipInputSchema,
} from "@/lib/calculators/tip";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Tip & Bill Split Calculator Engine & Contract (Phase A Batch 3)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes bill split, tax, and tip for golden fixture (₹2,400, 10% tip, 5% tax, 4 people)", () => {
      const result = calculateTip({
        billAmount: 2400,
        tipPercentage: 10,
        splitCount: 4,
        taxPercentage: 5,
        roundUp: "none",
      });

      expect(result.billAmount).toBe(2400);
      expect(result.taxAmount).toBe(120); // 5% of 2400
      expect(result.tipAmount).toBe(240); // 10% of 2400
      expect(result.totalAmount).toBe(2760); // 2400 + 120 + 240
      expect(result.splitCount).toBe(4);
      expect(result.totalPerPerson).toBe(690); // 2760 / 4
      expect(result.tipPerPerson).toBe(60); // 240 / 4
      expect(result.billPerPerson).toBe(600); // 2400 / 4
      expect(result.taxPerPerson).toBe(30); // 120 / 4
    });
  });

  describe("2. Zero Cases", () => {
    it("handles zero bill amount cleanly without NaN or infinite values", () => {
      const result = calculateTip({
        billAmount: 0,
        tipPercentage: 15,
        splitCount: 2,
        taxPercentage: 5,
        roundUp: "none",
      });

      expect(result.billAmount).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.tipAmount).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.totalPerPerson).toBe(0);
    });

    it("handles 0% tip and 0% tax (pure equal split)", () => {
      const result = calculateTip({
        billAmount: 1500,
        tipPercentage: 0,
        splitCount: 3,
        taxPercentage: 0,
        roundUp: "none",
      });

      expect(result.tipAmount).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.totalAmount).toBe(1500);
      expect(result.totalPerPerson).toBe(500);
    });
  });

  describe("3. Boundary Cases & Rounding Modes", () => {
    it("handles 1 person (solo diner) where per-person equals total bill", () => {
      const result = calculateTip({
        billAmount: 850,
        tipPercentage: 10,
        splitCount: 1,
        taxPercentage: 5,
        roundUp: "none",
      });

      expect(result.splitCount).toBe(1);
      expect(result.totalPerPerson).toBe(result.totalAmount);
    });

    it("rounds up per person to whole integer when requested (₹1,000 / 3 = ₹333.33 -> ₹334)", () => {
      const result = calculateTip({
        billAmount: 1000,
        tipPercentage: 0,
        splitCount: 3,
        taxPercentage: 0,
        roundUp: "perPerson",
      });

      expect(result.totalPerPerson).toBeCloseTo(333.33, 1);
      expect(result.roundedPerPerson).toBe(334);
      expect(result.totalAmount).toBe(334 * 3); // 1002
      expect(result.roundingDifference).toBe(2);
    });

    it("rounds up total bill when requested", () => {
      const result = calculateTip({
        billAmount: 1000.4,
        tipPercentage: 0,
        splitCount: 2,
        taxPercentage: 0,
        roundUp: "total",
      });

      expect(result.totalAmount).toBe(1001);
      expect(result.roundingDifference).toBeCloseTo(0.6, 1);
    });
  });

  describe("4. Decimal Percentage Cases", () => {
    it("calculates accurate values with decimal tip and tax percentages", () => {
      const result = calculateTip({
        billAmount: 1250,
        tipPercentage: 7.5,
        splitCount: 2,
        taxPercentage: 2.5,
        roundUp: "none",
      });

      expect(result.tipAmount).toBe(93.75); // 1250 * 0.075
      expect(result.taxAmount).toBe(31.25); // 1250 * 0.025
      expect(result.totalAmount).toBe(1375); // 1250 + 93.75 + 31.25
      expect(result.totalPerPerson).toBe(687.5);
    });
  });

  describe("5. Invalid Input & Schema Validation Cases", () => {
    it("fails validation when split count is less than 1", () => {
      const validation = validateCalculatorInput(tipInputSchema, {
        billAmount: 500,
        tipPercentage: 10,
        splitCount: 0,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.splitCount).toBe("At least 1 person is required");
    });

    it("fails validation when bill amount is negative", () => {
      const validation = validateCalculatorInput(tipInputSchema, {
        billAmount: -100,
        tipPercentage: 10,
        splitCount: 2,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.billAmount).toBe("Bill amount cannot be negative");
    });

    it("fails validation when tip percentage exceeds 100%", () => {
      const validation = validateCalculatorInput(tipInputSchema, {
        billAmount: 500,
        tipPercentage: 150,
        splitCount: 2,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.tipPercentage).toBe("Tip percentage cannot exceed 100%");
    });
  });

  describe("6. Large-Value / Banquet Cases", () => {
    it("calculates large corporate banquet bills without overflow (₹5,00,000 for 50 people)", () => {
      const result = calculateTip({
        billAmount: 500000,
        tipPercentage: 10,
        splitCount: 50,
        taxPercentage: 18,
        roundUp: "none",
      });

      expect(result.taxAmount).toBe(90000);
      expect(result.tipAmount).toBe(50000);
      expect(result.totalAmount).toBe(640000);
      expect(result.totalPerPerson).toBe(12800);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'tip'", () => {
      const registered = getCalculatorById("tip");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("tip");
      expect(registered?.metadata.name).toBe("Tip & Bill Split Calculator");
      expect(registered?.metadata.category).toBe("everyday");
      expect(registered?.metadata.route).toBe("/tip-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = tipEngine.calculate(tipEngine.defaultInputs);
      const formatted = tipEngine.formatResult!(raw, tipEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Total Per Person");
      expect(formatted.primary.value).toBe(690);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
