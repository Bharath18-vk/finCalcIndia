import { describe, it, expect } from "vitest";
import {
  calculateFraction,
  fractionEngine,
  fractionInputSchema,
  gcd,
  lcm,
} from "@/lib/calculators/fraction";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Fraction Calculator Engine & Contract (Phase A)", () => {
  describe("Mathematical Utilities (GCD & LCM)", () => {
    it("computes GCD correctly using Euclidean algorithm", () => {
      expect(gcd(12, 18)).toBe(6);
      expect(gcd(100, 25)).toBe(25);
      expect(gcd(7, 13)).toBe(1);
    });

    it("computes LCM correctly", () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(2, 3)).toBe(6);
      expect(lcm(5, 10)).toBe(10);
    });
  });

  describe("1. Normal Cases & Golden Fixtures", () => {
    it("adds fractions correctly (1/2 + 1/3 = 5/6)", () => {
      const result = calculateFraction({
        num1: 1,
        den1: 2,
        operator: "+",
        num2: 1,
        den2: 3,
      });

      expect(result.resultNum).toBe(5);
      expect(result.resultDen).toBe(6);
      expect(result.formattedResult).toBe("5/6");
      expect(result.decimalValue).toBeCloseTo(0.833333, 4);
      expect(result.isError).toBeFalsy();
    });

    it("subtracts fractions correctly (3/4 - 1/4 = 1/2 with reduction)", () => {
      const result = calculateFraction({
        num1: 3,
        den1: 4,
        operator: "-",
        num2: 1,
        den2: 4,
      });

      expect(result.resultNum).toBe(1);
      expect(result.resultDen).toBe(2);
      expect(result.formattedResult).toBe("1/2");
    });

    it("multiplies fractions correctly (2/3 * 3/4 = 1/2)", () => {
      const result = calculateFraction({
        num1: 2,
        den1: 3,
        operator: "*",
        num2: 3,
        den2: 4,
      });

      expect(result.resultNum).toBe(1);
      expect(result.resultDen).toBe(2);
      expect(result.formattedResult).toBe("1/2");
      expect(result.decimalValue).toBe(0.5);
    });

    it("divides fractions correctly (1/2 / 1/3 = 3/2 = 1 1/2 mixed number)", () => {
      const result = calculateFraction({
        num1: 1,
        den1: 2,
        operator: "/",
        num2: 1,
        den2: 3,
      });

      expect(result.resultNum).toBe(3);
      expect(result.resultDen).toBe(2);
      expect(result.formattedResult).toBe("3/2");
      expect(result.mixedNumber).toBe("1 1/2");
      expect(result.decimalValue).toBe(1.5);
    });
  });

  describe("2. Zero Cases", () => {
    it("handles zero numerator in first fraction (0/5 + 1/5 = 1/5)", () => {
      const result = calculateFraction({
        num1: 0,
        den1: 5,
        operator: "+",
        num2: 1,
        den2: 5,
      });

      expect(result.resultNum).toBe(1);
      expect(result.resultDen).toBe(5);
      expect(result.formattedResult).toBe("1/5");
    });

    it("handles zero numerator in multiplication (0/3 * 4/5 = 0)", () => {
      const result = calculateFraction({
        num1: 0,
        den1: 3,
        operator: "*",
        num2: 4,
        den2: 5,
      });

      expect(result.resultNum).toBe(0);
      expect(result.formattedResult).toBe("0");
      expect(result.decimalValue).toBe(0);
    });
  });

  describe("3. Boundary Cases & Integer Results", () => {
    it("formats whole number results cleanly when denominator reduces to 1 (4/2 = 2)", () => {
      const result = calculateFraction({
        num1: 4,
        den1: 2,
        operator: "+",
        num2: 0,
        den2: 1,
      });

      expect(result.resultNum).toBe(2);
      expect(result.resultDen).toBe(1);
      expect(result.formattedResult).toBe("2");
    });

    it("handles negative fractions properly (-1/3 + 2/3 = 1/3)", () => {
      const result = calculateFraction({
        num1: -1,
        den1: 3,
        operator: "+",
        num2: 2,
        den2: 3,
      });

      expect(result.resultNum).toBe(1);
      expect(result.resultDen).toBe(3);
      expect(result.formattedResult).toBe("1/3");
    });
  });

  describe("4. Decimal Equivalence", () => {
    it("computes exact decimal conversion for simple fractions (1/4 = 0.25)", () => {
      const result = calculateFraction({
        num1: 1,
        den1: 4,
        operator: "+",
        num2: 0,
        den2: 1,
      });

      expect(result.decimalValue).toBe(0.25);
      expect(result.formattedDecimal).toBe("0.25");
    });
  });

  describe("5. Invalid Input & Division by Zero Cases", () => {
    it("gracefully catches division by zero when divisor numerator is 0 in division", () => {
      const result = calculateFraction({
        num1: 1,
        den1: 2,
        operator: "/",
        num2: 0,
        den2: 3,
      });

      expect(result.isError).toBe(true);
      expect(result.errorMessage).toContain("Cannot divide by zero");
    });

    it("rejects denominator of zero in Zod validation", () => {
      const validation = validateCalculatorInput(fractionInputSchema, {
        num1: 1,
        den1: 0,
        operator: "+",
        num2: 1,
        den2: 3,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.den1).toContain("cannot be 0");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("reduces large numbers accurately (1,000,000 / 2,000,000 = 1/2)", () => {
      const result = calculateFraction({
        num1: 1000000,
        den1: 2000000,
        operator: "+",
        num2: 0,
        den2: 1,
      });

      expect(result.resultNum).toBe(1);
      expect(result.resultDen).toBe(2);
      expect(result.formattedResult).toBe("1/2");
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'fraction'", () => {
      const registered = getCalculatorById("fraction");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("fraction");
      expect(registered?.metadata.name).toBe("Fraction Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/fraction-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = fractionEngine.calculate(fractionEngine.defaultInputs);
      const formatted = fractionEngine.formatResult!(raw, fractionEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Resulting Fraction");
      expect(formatted.primary.formattedValue).toBe("5/6");
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
