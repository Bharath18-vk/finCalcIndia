import { describe, it, expect } from "vitest";
import {
  calculateAverage,
  averageEngine,
  averageInputSchema,
  parseNumberList,
} from "@/lib/calculators/average";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Average Calculator Engine & Contract (Phase A)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes average of [10, 25, 30, 45, 90] = 40 (Golden Fixture)", () => {
      const result = calculateAverage({ numbers: "10, 25, 30, 45, 90" });

      expect(result.count).toBe(5);
      expect(result.sum).toBe(200);
      expect(result.mean).toBe(40);
      expect(result.median).toBe(30);
      expect(result.min).toBe(10);
      expect(result.max).toBe(90);
      expect(result.range).toBe(80);
      expect(result.geometricMean).toBeCloseTo(31.3692, 2);
      expect(result.sampleStandardDeviation).toBeGreaterThan(0);
    });

    it("computes median correctly for even-length dataset", () => {
      const result = calculateAverage({ numbers: "10, 20, 30, 40" });

      expect(result.count).toBe(4);
      expect(result.sum).toBe(100);
      expect(result.mean).toBe(25);
      expect(result.median).toBe(25); // (20 + 30) / 2
    });

    it("identifies unique mode and multimodal distributions", () => {
      const singleMode = calculateAverage({ numbers: "2, 3, 3, 5, 7" });
      expect(singleMode.modes).toEqual([3]);
      expect(singleMode.modeString).toBe("3");

      const multiMode = calculateAverage({ numbers: "2, 2, 4, 4, 5" });
      expect(multiMode.modes).toEqual([2, 4]);
      expect(multiMode.modeString).toBe("2, 4");
    });
  });

  describe("2. Zero Cases", () => {
    it("computes statistics when all values are zero", () => {
      const result = calculateAverage({ numbers: "0, 0, 0" });

      expect(result.count).toBe(3);
      expect(result.sum).toBe(0);
      expect(result.mean).toBe(0);
      expect(result.median).toBe(0);
      expect(result.geometricMean).toBeNull(); // non-positive numbers
    });

    it("handles zero present in dataset with other numbers", () => {
      const result = calculateAverage({ numbers: "0, 10, 20" });

      expect(result.count).toBe(3);
      expect(result.sum).toBe(30);
      expect(result.mean).toBe(10);
      expect(result.median).toBe(10);
      expect(result.geometricMean).toBeNull();
    });
  });

  describe("3. Boundary Cases & Delimiters", () => {
    it("handles single-element dataset", () => {
      const result = calculateAverage({ numbers: "42" });

      expect(result.count).toBe(1);
      expect(result.sum).toBe(42);
      expect(result.mean).toBe(42);
      expect(result.median).toBe(42);
      expect(result.range).toBe(0);
      expect(result.sampleStandardDeviation).toBe(0);
    });

    it("parses diverse separators (spaces, semicolons, tabs, newlines)", () => {
      const result = calculateAverage({
        numbers: "10   20; 30\n40\t50",
      });

      expect(result.count).toBe(5);
      expect(result.sum).toBe(150);
      expect(result.mean).toBe(30);
    });
  });

  describe("4. Decimal & Negative Cases", () => {
    it("computes decimals with high precision", () => {
      const result = calculateAverage({ numbers: "1.5, 2.5, 3.5, 4.5" });

      expect(result.count).toBe(4);
      expect(result.sum).toBe(12);
      expect(result.mean).toBe(3);
      expect(result.median).toBe(3);
    });

    it("handles negative numbers properly in mean and median", () => {
      const result = calculateAverage({ numbers: "-10, -5, 0, 5, 10" });

      expect(result.count).toBe(5);
      expect(result.sum).toBe(0);
      expect(result.mean).toBe(0);
      expect(result.median).toBe(0);
      expect(result.range).toBe(20);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects empty string input", () => {
      const validation = validateCalculatorInput(averageInputSchema, {
        numbers: "",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.numbers).toBeDefined();
    });

    it("rejects non-numeric string garbage", () => {
      const validation = validateCalculatorInput(averageInputSchema, {
        numbers: "abc, def, ghi",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.numbers).toContain("Please enter valid numeric values");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes statistics on billions accurately", () => {
      const result = calculateAverage({
        numbers: "1000000000, 2000000000, 3000000000",
      });

      expect(result.count).toBe(3);
      expect(result.sum).toBe(6000000000);
      expect(result.mean).toBe(2000000000);
      expect(result.median).toBe(2000000000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'average'", () => {
      const registered = getCalculatorById("average");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("average");
      expect(registered?.metadata.name).toBe("Average Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/average-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = averageEngine.calculate(averageEngine.defaultInputs);
      const formatted = averageEngine.formatResult!(raw, averageEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Average (Arithmetic Mean)");
      expect(formatted.primary.value).toBe(40);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
