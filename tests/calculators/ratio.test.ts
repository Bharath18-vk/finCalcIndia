import { describe, it, expect } from "vitest";
import {
  calculateRatio,
  ratioEngine,
  ratioInputSchema,
  reduceRatio,
  gcd,
} from "@/lib/calculators/ratio";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Ratio Calculator Engine & Contract (Phase A)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("simplifies 12 : 18 to 2 : 3 with GCD 6 (Golden Fixture)", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 12,
        b: 18,
      });

      expect(result.simplifiedA).toBe(2);
      expect(result.simplifiedB).toBe(3);
      expect(result.simplifiedRatio).toBe("2 : 3");
      expect(result.gcdValue).toBe(6);
      expect(result.decimalValue).toBe(0.6667);
      expect(result.percentA).toBe(40);
      expect(result.percentB).toBe(60);
      expect(result.steps.length).toBeGreaterThanOrEqual(3);
    });

    it("solves 16 : 9 = 1920 : X proportion to X = 1080 (Screen Resolution)", () => {
      const result = calculateRatio({
        mode: "proportion",
        a: 16,
        b: 9,
        c: 1920,
      });

      expect(result.solvedX).toBe(1080);
      expect(result.solvedProportion).toBe("16 : 9 = 1920 : 1080");
      expect(result.scaleFactor).toBe(120);
    });

    it("divides ₹50,000 into 3 : 2 ratio = ₹30,000 and ₹20,000", () => {
      const result = calculateRatio({
        mode: "divide",
        a: 3,
        b: 2,
        total: 50000,
      });

      expect(result.shareA).toBe(30000);
      expect(result.shareB).toBe(20000);
      expect(result.percentA).toBe(60);
      expect(result.percentB).toBe(40);
    });
  });

  describe("2. Zero Cases", () => {
    it("handles zero total in divide mode", () => {
      const result = calculateRatio({
        mode: "divide",
        a: 4,
        b: 1,
        total: 0,
      });

      expect(result.shareA).toBe(0);
      expect(result.shareB).toBe(0);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles already simplified coprime ratio (7 : 11)", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 7,
        b: 11,
      });

      expect(result.simplifiedA).toBe(7);
      expect(result.simplifiedB).toBe(11);
      expect(result.gcdValue).toBe(1);
      expect(result.simplifiedRatio).toBe("7 : 11");
    });

    it("handles 1 : 1 equal ratio", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 50,
        b: 50,
      });

      expect(result.simplifiedA).toBe(1);
      expect(result.simplifiedB).toBe(1);
      expect(result.simplifiedRatio).toBe("1 : 1");
      expect(result.percentA).toBe(50);
      expect(result.percentB).toBe(50);
    });
  });

  describe("4. Decimal Ratios", () => {
    it("reduces decimal ratio 1.5 : 2.5 to 3 : 5", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 1.5,
        b: 2.5,
      });

      expect(result.simplifiedA).toBe(3);
      expect(result.simplifiedB).toBe(5);
      expect(result.simplifiedRatio).toBe("3 : 5");
    });

    it("reduces decimal ratio 0.25 : 0.75 to 1 : 3", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 0.25,
        b: 0.75,
      });

      expect(result.simplifiedA).toBe(1);
      expect(result.simplifiedB).toBe(3);
      expect(result.simplifiedRatio).toBe("1 : 3");
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects zero or negative term A", () => {
      const validation = validateCalculatorInput(ratioInputSchema, {
        mode: "simplify",
        a: 0,
        b: 10,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.a).toBeDefined();
    });

    it("rejects negative total in divide mode", () => {
      const validation = validateCalculatorInput(ratioInputSchema, {
        mode: "divide",
        a: 2,
        b: 3,
        total: -500,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.total).toContain("cannot be negative");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("simplifies large pixel values (192000000 : 108000000) to 16 : 9", () => {
      const result = calculateRatio({
        mode: "simplify",
        a: 192000000,
        b: 108000000,
      });

      expect(result.simplifiedA).toBe(16);
      expect(result.simplifiedB).toBe(9);
      expect(result.simplifiedRatio).toBe("16 : 9");
    });

    it("divides ₹10 Crore ($10^8) in 3 : 2 ratio accurately", () => {
      const result = calculateRatio({
        mode: "divide",
        a: 3,
        b: 2,
        total: 100000000,
      });

      expect(result.shareA).toBe(60000000); // 6 Cr
      expect(result.shareB).toBe(40000000); // 4 Cr
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'ratio'", () => {
      const registered = getCalculatorById("ratio");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("ratio");
      expect(registered?.metadata.name).toBe("Ratio Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/ratio-calculator");
    });

    it("conforms to formatResult output model across all modes", () => {
      // Simplify mode formatting
      const rawSimplify = ratioEngine.calculate({ ...ratioEngine.defaultInputs, mode: "simplify" });
      const formattedSimplify = ratioEngine.formatResult!(rawSimplify, { ...ratioEngine.defaultInputs, mode: "simplify" });
      expect(formattedSimplify.primary.label).toBe("Simplified Ratio");
      expect(formattedSimplify.primary.value).toBe("2 : 3");

      // Proportion mode formatting
      const rawProp = ratioEngine.calculate({ ...ratioEngine.defaultInputs, mode: "proportion", a: 16, b: 9, c: 1920 });
      const formattedProp = ratioEngine.formatResult!(rawProp, { ...ratioEngine.defaultInputs, mode: "proportion" });
      expect(formattedProp.primary.label).toBe("Unknown Term (X)");
      expect(formattedProp.primary.value).toBe(1080);

      // Divide mode formatting
      const rawDiv = ratioEngine.calculate({ ...ratioEngine.defaultInputs, mode: "divide", a: 3, b: 2, total: 50000 });
      const formattedDiv = ratioEngine.formatResult!(rawDiv, { ...ratioEngine.defaultInputs, mode: "divide" });
      expect(formattedDiv.primary.label).toContain("Share A");
      expect(formattedDiv.primary.value).toBe(30000);
    });
  });
});
