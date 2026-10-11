import { describe, it, expect } from "vitest";
import {
  calculateStandardDeviation,
  standardDeviationEngine,
  standardDeviationInputSchema,
} from "@/lib/calculators/standard-deviation";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Standard Deviation Calculator Engine & Contract (Phase A Batch 2)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes sample and population standard deviation on [10, 12, 23, 23, 16, 23, 21, 16] (Golden Fixture)", () => {
      const result = calculateStandardDeviation({
        dataset: "10, 12, 23, 23, 16, 23, 21, 16",
        calculationType: "sample",
      });

      expect(result.count).toBe(8);
      expect(result.sum).toBe(144);
      expect(result.mean).toBe(18);
      expect(result.sumOfSquares).toBe(192);
      expect(result.sampleVariance).toBeCloseTo(27.4286, 3);
      expect(result.sampleStdDev).toBeCloseTo(5.2372, 3);
      expect(result.populationVariance).toBe(24);
      expect(result.populationStdDev).toBeCloseTo(4.899, 3);
      expect(result.tableRows.length).toBe(8);
      expect(result.tableRows[0].squaredDeviation).toBe(64); // (10 - 18)^2
    });

    it("switches to population calculation when requested", () => {
      const result = calculateStandardDeviation({
        dataset: "10, 12, 23, 23, 16, 23, 21, 16",
        calculationType: "population",
      });

      expect(result.activeStdDev).toBeCloseTo(4.899, 3);
      expect(result.activeVariance).toBe(24);
    });
  });

  describe("2. Zero Cases", () => {
    it("returns zero standard deviation when all data points are identical", () => {
      const result = calculateStandardDeviation({
        dataset: "5, 5, 5, 5",
        calculationType: "sample",
      });

      expect(result.count).toBe(4);
      expect(result.mean).toBe(5);
      expect(result.sumOfSquares).toBe(0);
      expect(result.sampleStdDev).toBe(0);
      expect(result.sampleVariance).toBe(0);
      expect(result.populationStdDev).toBe(0);
    });

    it("returns zero standard deviation when all values are zero", () => {
      const result = calculateStandardDeviation({
        dataset: "0, 0, 0",
        calculationType: "sample",
      });

      expect(result.mean).toBe(0);
      expect(result.sampleStdDev).toBe(0);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles minimum sample size of 2 numbers", () => {
      const result = calculateStandardDeviation({
        dataset: "10, 20",
        calculationType: "sample",
      });

      expect(result.count).toBe(2);
      expect(result.mean).toBe(15);
      // SS = (10-15)^2 + (20-15)^2 = 25 + 25 = 50.
      // Sample variance = 50 / 1 = 50. Sample std dev = sqrt(50) = 7.0711
      expect(result.sampleVariance).toBe(50);
      expect(result.sampleStdDev).toBeCloseTo(7.0711, 4);
      // Population variance = 50 / 2 = 25. Population std dev = 5
      expect(result.populationStdDev).toBe(5);
    });
  });

  describe("4. Decimal Cases", () => {
    it("computes decimals with high floating-point precision", () => {
      const result = calculateStandardDeviation({
        dataset: "1.5, 2.5, 3.5, 4.5",
        calculationType: "sample",
      });

      expect(result.count).toBe(4);
      expect(result.mean).toBe(3);
      // SS = 2.25 + 0.25 + 0.25 + 2.25 = 5
      // Sample variance = 5 / 3 = 1.6667 => sqrt(5/3) = 1.2910
      expect(result.sampleStdDev).toBeCloseTo(1.291, 3);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects fewer than 2 numbers", () => {
      const validation = validateCalculatorInput(standardDeviationInputSchema, {
        dataset: "42",
        calculationType: "sample",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.dataset).toContain("at least 2 numbers");
    });

    it("rejects empty dataset", () => {
      const validation = validateCalculatorInput(standardDeviationInputSchema, {
        dataset: "",
        calculationType: "sample",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.dataset).toBeDefined();
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes standard deviation on billions accurately", () => {
      const result = calculateStandardDeviation({
        dataset: "1000000000, 2000000000, 3000000000",
        calculationType: "sample",
      });

      expect(result.count).toBe(3);
      expect(result.mean).toBe(2000000000);
      expect(result.sampleStdDev).toBe(1000000000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'standard-deviation'", () => {
      const registered = getCalculatorById("standard-deviation");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("standard-deviation");
      expect(registered?.metadata.name).toBe("Standard Deviation Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/standard-deviation-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = standardDeviationEngine.calculate(standardDeviationEngine.defaultInputs);
      const formatted = standardDeviationEngine.formatResult!(raw, standardDeviationEngine.defaultInputs);

      expect(formatted.primary.label).toContain("Standard Deviation");
      expect(formatted.primary.value).toBe(raw.sampleStdDev);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
