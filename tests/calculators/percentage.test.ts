import { describe, it, expect } from "vitest";
import {
  calculatePercentage,
  percentageEngine,
  percentageInputSchema,
} from "@/lib/calculators/percentage";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Percentage Calculator Engine & Architecture Contract (Phase A Reference Implementation)", () => {
  describe("Mode 1: What is X% of Y? (Fractional multiplication)", () => {
    it("computes 10% of 500 = 50 (Golden Fixture)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 10,
        valY: 500,
      });

      expect(result.resultValue).toBe(50);
      expect(result.formattedResult).toBe("50");
      expect(result.explanation).toBe("10% of 500 is 50");
      expect(result.isDivisionByZero).toBeUndefined();

      // Check secondary metrics (base, base + result, base - result)
      const added = result.secondaryMetrics.find((m) => m.key === "added");
      const subtracted = result.secondaryMetrics.find((m) => m.key === "subtracted");
      expect(added?.value).toBe(550);
      expect(subtracted?.value).toBe(450);
    });

    it("computes 25% of 1,200 = 300", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 25,
        valY: 1200,
      });

      expect(result.resultValue).toBe(300);
      expect(result.formattedResult).toBe("300");
    });

    it("handles 0% of 500 = 0 (Zero Boundary)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 0,
        valY: 500,
      });

      expect(result.resultValue).toBe(0);
      expect(result.formattedResult).toBe("0");
    });

    it("handles 100% of 500 = 500 (Full Boundary)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 100,
        valY: 500,
      });

      expect(result.resultValue).toBe(500);
    });

    it("handles decimal percentages (12.5% of 80 = 10)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 12.5,
        valY: 80,
      });

      expect(result.resultValue).toBe(10);
      expect(result.formattedResult).toBe("10");
    });

    it("handles negative percentage (-10% of 500 = -50)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: -10,
        valY: 500,
      });

      expect(result.resultValue).toBe(-50);
      expect(result.formattedResult).toBe("-50");
    });

    it("handles extremely large values (15% of 1,00,00,00,000 = 15,00,00,000)", () => {
      const result = calculatePercentage({
        mode: "what-is-x-percent-of-y",
        valX: 15,
        valY: 1000000000,
      });

      expect(result.resultValue).toBe(150000000);
    });
  });

  describe("Mode 2: X is what % of Y? (Ratio to Percentage)", () => {
    it("computes 50 is what percentage of 200 = 25% (Golden Fixture)", () => {
      const result = calculatePercentage({
        mode: "x-is-what-percent-of-y",
        valX: 50,
        valY: 200,
      });

      expect(result.resultValue).toBe(25);
      expect(result.formattedResult).toBe("25%");
      expect(result.explanation).toBe("50 is 25% of 200");

      const remaining = result.secondaryMetrics.find((m) => m.key === "remaining");
      expect(remaining?.value).toBe(75);
    });

    it("computes 75 is what percentage of 300 = 25%", () => {
      const result = calculatePercentage({
        mode: "x-is-what-percent-of-y",
        valX: 75,
        valY: 300,
      });

      expect(result.resultValue).toBe(25);
      expect(result.formattedResult).toBe("25%");
    });

    it("gracefully protects against division by zero when Y is 0", () => {
      const result = calculatePercentage({
        mode: "x-is-what-percent-of-y",
        valX: 50,
        valY: 0,
      });

      expect(result.resultValue).toBe(0);
      expect(result.isDivisionByZero).toBe(true);
      expect(result.explanation).toContain("Division by zero");
      expect(result.formattedResult).toBe("0%");
    });

    it("handles values where X > Y (150 is what % of 100 = 150%)", () => {
      const result = calculatePercentage({
        mode: "x-is-what-percent-of-y",
        valX: 150,
        valY: 100,
      });

      expect(result.resultValue).toBe(150);
      expect(result.formattedResult).toBe("150%");
    });
  });

  describe("Mode 3: Percentage Increase (from X to Y)", () => {
    it("computes 100 -> 120 = +20% increase (Golden Fixture)", () => {
      const result = calculatePercentage({
        mode: "percentage-increase",
        valX: 100,
        valY: 120,
      });

      expect(result.resultValue).toBe(20);
      expect(result.formattedResult).toBe("+20%");
      expect(result.explanation).toContain("increase of +20%");

      const diff = result.secondaryMetrics.find((m) => m.key === "diff");
      expect(diff?.value).toBe(20);
    });

    it("gracefully handles initial value of zero (cannot compute growth from 0)", () => {
      const result = calculatePercentage({
        mode: "percentage-increase",
        valX: 0,
        valY: 100,
      });

      expect(result.resultValue).toBe(0);
      expect(result.isDivisionByZero).toBe(true);
      expect(result.explanation).toContain("Initial value (X) cannot be zero");
    });
  });

  describe("Mode 4: Percentage Decrease (from X to Y)", () => {
    it("computes 120 -> 100 = 16.67% decrease (Golden Fixture)", () => {
      const result = calculatePercentage({
        mode: "percentage-decrease",
        valX: 120,
        valY: 100,
      });

      // (120 - 100) / 120 * 100 = 20 / 120 * 100 = 16.6667%
      expect(result.resultValue).toBeCloseTo(16.6667, 3);
      expect(result.formattedResult).toBe("16.67%");
      expect(result.explanation).toContain("decrease of 16.67%");

      const diff = result.secondaryMetrics.find((m) => m.key === "diff");
      expect(diff?.value).toBe(20);
    });

    it("gracefully handles initial value of zero for decrease", () => {
      const result = calculatePercentage({
        mode: "percentage-decrease",
        valX: 0,
        valY: 100,
      });

      expect(result.resultValue).toBe(0);
      expect(result.isDivisionByZero).toBe(true);
      expect(result.explanation).toContain("Initial value (X) cannot be zero");
    });
  });

  describe("Mode 5: Percentage Difference (between X and Y)", () => {
    it("computes percentage difference between 100 and 120 = 18.18%", () => {
      // |100 - 120| / ((100 + 120)/2) * 100 = 20 / 110 * 100 = 18.1818%
      const result = calculatePercentage({
        mode: "percentage-difference",
        valX: 100,
        valY: 120,
      });

      expect(result.resultValue).toBeCloseTo(18.1818, 3);
      expect(result.formattedResult).toBe("18.18%");
    });

    it("handles zero difference when X = Y", () => {
      const result = calculatePercentage({
        mode: "percentage-difference",
        valX: 50,
        valY: 50,
      });

      expect(result.resultValue).toBe(0);
      expect(result.formattedResult).toBe("0%");
    });

    it("handles both values zero without NaN or crash", () => {
      const result = calculatePercentage({
        mode: "percentage-difference",
        valX: 0,
        valY: 0,
      });

      expect(result.resultValue).toBe(0);
      expect(result.formattedResult).toBe("0%");
    });
  });

  describe("Zod Validation Schema & Error Mapping", () => {
    it("validates correct input successfully", () => {
      const validation = validateCalculatorInput(percentageInputSchema, {
        mode: "what-is-x-percent-of-y",
        valX: 15,
        valY: 600,
      });

      expect(validation.success).toBe(true);
      expect(validation.data?.valX).toBe(15);
      expect(validation.data?.valY).toBe(600);
    });

    it("rejects non-numeric inputs and provides human-readable errors", () => {
      const validation = validateCalculatorInput(percentageInputSchema, {
        mode: "what-is-x-percent-of-y",
        valX: "not-a-number",
        valY: 500,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.valX).toBeDefined();
      expect(validation.errors?.valX).toContain("must be a valid number");
    });

    it("rejects invalid mode", () => {
      const validation = validateCalculatorInput(percentageInputSchema, {
        mode: "invalid-mode",
        valX: 10,
        valY: 500,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.mode).toBeDefined();
    });
  });

  describe("Calculator Engine Contract & Registry Compliance", () => {
    it("is registered in the central registry under ID 'percentage'", () => {
      const registered = getCalculatorById("percentage");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("percentage");
      expect(registered?.metadata.name).toBe("Percentage Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/percentage-calculator");
    });

    it("conforms to CalculatorEngine contract fields and methods", () => {
      expect(percentageEngine.id).toBe("percentage");
      expect(percentageEngine.fields.length).toBeGreaterThanOrEqual(3);
      expect(percentageEngine.defaultInputs.valX).toBe(10);
      expect(percentageEngine.defaultInputs.valY).toBe(500);

      // Verify formatResult output
      const raw = percentageEngine.calculate(percentageEngine.defaultInputs);
      const formatted = percentageEngine.formatResult!(raw, percentageEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Calculated Result");
      expect(formatted.primary.value).toBe(50);
      expect(formatted.primary.formattedValue).toBe("50");
      expect(formatted.secondary?.length).toBeGreaterThan(0);
    });
  });
});
