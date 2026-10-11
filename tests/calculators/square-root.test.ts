import { describe, it, expect } from "vitest";
import {
  calculateSquareRoot,
  squareRootEngine,
  squareRootInputSchema,
  simplifySquareRoot,
} from "@/lib/calculators/square-root";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Square Root & Exponent Calculator Engine & Contract (Phase A Batch 2)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes principal square root of 144 = 12 (Golden Fixture)", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 144,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBe(12);
      expect(result.isPerfectRoot).toBe(true);
      expect(result.simplifiedRadical).toBe("12");
    });

    it("simplifies radical √72 into 6√2 accurately", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 72,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBeCloseTo(8.485281, 4);
      expect(result.isPerfectRoot).toBe(false);
      expect(result.simplifiedRadical).toBe("6√2");
      expect(result.outerFactor).toBe(6);
      expect(result.innerRadicand).toBe(2);
    });

    it("computes power 2^10 = 1024", () => {
      const result = calculateSquareRoot({
        mode: "exponent",
        base: 2,
        exponent: 10,
      });

      expect(result.primaryValue).toBe(1024);
      expect(result.inversePower).toBeCloseTo(1 / 1024, 6);
    });
  });

  describe("2. Zero Cases", () => {
    it("handles square root of 0 = 0", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 0,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBe(0);
      expect(result.isPerfectRoot).toBe(true);
    });

    it("handles power to 0 = 1 (x^0 = 1)", () => {
      const result = calculateSquareRoot({
        mode: "exponent",
        base: 42,
        exponent: 0,
      });

      expect(result.primaryValue).toBe(1);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles square root of 1 = 1", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 1,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBe(1);
      expect(result.isPerfectRoot).toBe(true);
    });

    it("computes cube root of 27 = 3", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 27,
        rootDegree: 3,
      });

      expect(result.primaryValue).toBe(3);
      expect(result.isPerfectRoot).toBe(true);
    });

    it("handles negative exponent (2^-3 = 0.125)", () => {
      const result = calculateSquareRoot({
        mode: "exponent",
        base: 2,
        exponent: -3,
      });

      expect(result.primaryValue).toBe(0.125);
    });
  });

  describe("4. Decimal Cases", () => {
    it("computes square root of 2 = 1.414214", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 2,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBeCloseTo(1.414214, 5);
      expect(result.simplifiedRadical).toBe("√2");
    });

    it("computes decimal powers (1.5^2 = 2.25)", () => {
      const result = calculateSquareRoot({
        mode: "exponent",
        base: 1.5,
        exponent: 2,
      });

      expect(result.primaryValue).toBe(2.25);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects negative radicand for real roots", () => {
      const validation = validateCalculatorInput(squareRootInputSchema, {
        mode: "root",
        radicand: -25,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.radicand).toContain("cannot be negative");
    });

    it("rejects root degree less than 2", () => {
      const validation = validateCalculatorInput(squareRootInputSchema, {
        mode: "root",
        radicand: 16,
        rootDegree: 1,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.rootDegree).toContain("at least 2");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes square root of 100,000,000 accurately", () => {
      const result = calculateSquareRoot({
        mode: "root",
        radicand: 100000000,
        rootDegree: 2,
      });

      expect(result.primaryValue).toBe(10000);
      expect(result.isPerfectRoot).toBe(true);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'square-root'", () => {
      const registered = getCalculatorById("square-root");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("square-root");
      expect(registered?.metadata.name).toBe("Square Root & Exponent Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/square-root-calculator");
    });

    it("conforms to formatResult output model across modes", () => {
      const rawRoot = squareRootEngine.calculate({ ...squareRootEngine.defaultInputs, mode: "root" });
      const formatRoot = squareRootEngine.formatResult!(rawRoot, { ...squareRootEngine.defaultInputs, mode: "root" });
      expect(formatRoot.primary.label).toContain("Root");

      const rawExp = squareRootEngine.calculate({ ...squareRootEngine.defaultInputs, mode: "exponent" });
      const formatExp = squareRootEngine.formatResult!(rawExp, { ...squareRootEngine.defaultInputs, mode: "exponent" });
      expect(formatExp.primary.label).toContain("Result");
    });
  });
});
