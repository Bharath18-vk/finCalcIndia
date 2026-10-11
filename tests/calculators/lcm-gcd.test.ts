import { describe, it, expect } from "vitest";
import {
  calculateLcmGcd,
  lcmGcdEngine,
  lcmGcdInputSchema,
  getPrimeFactorization,
  gcdTwo,
  lcmTwo,
} from "@/lib/calculators/lcm-gcd";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("LCM and GCD Calculator Engine & Contract (Phase A Batch 2)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes GCD = 12 and LCM = 72 for 24 and 36 (Golden Fixture)", () => {
      const result = calculateLcmGcd({ numbers: "24, 36" });

      expect(result.count).toBe(2);
      expect(result.gcd).toBe(12);
      expect(result.lcm).toBe(72);
      expect(result.commonFactors).toEqual([1, 2, 3, 4, 6, 12]);
      expect(result.firstMultiples).toEqual([72, 144, 216, 288, 360]);

      // Check prime factorizations
      expect(result.factorizations[0].formatted).toBe("2^3 × 3");
      expect(result.factorizations[1].formatted).toBe("2^2 × 3^2");
    });

    it("computes GCD and LCM for three numbers (12, 18, 30)", () => {
      const result = calculateLcmGcd({ numbers: "12, 18, 30" });

      expect(result.count).toBe(3);
      expect(result.gcd).toBe(6);
      expect(result.lcm).toBe(180);
    });
  });

  describe("2. Coprime Numbers", () => {
    it("computes GCD = 1 and LCM = a * b for coprime numbers (7, 11)", () => {
      const result = calculateLcmGcd({ numbers: "7, 11" });

      expect(result.gcd).toBe(1);
      expect(result.lcm).toBe(77);
      expect(result.commonFactors).toEqual([1]);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles identical numbers: GCD and LCM equal the number", () => {
      const result = calculateLcmGcd({ numbers: "15, 15" });

      expect(result.gcd).toBe(15);
      expect(result.lcm).toBe(15);
    });

    it("handles powers of 2 where largest is multiple: 8, 16, 32", () => {
      const result = calculateLcmGcd({ numbers: "8, 16, 32" });

      expect(result.gcd).toBe(8);
      expect(result.lcm).toBe(32);
    });

    it("handles 1 with another number", () => {
      const result = calculateLcmGcd({ numbers: "1, 10" });

      expect(result.gcd).toBe(1);
      expect(result.lcm).toBe(10);
    });
  });

  describe("4. Diverse Delimiters", () => {
    it("parses spaces, semicolons, tabs, and commas correctly", () => {
      const result = calculateLcmGcd({ numbers: "15   25;  45" });

      expect(result.count).toBe(3);
      expect(result.gcd).toBe(5);
      expect(result.lcm).toBe(225);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects fewer than 2 numbers", () => {
      const validation = validateCalculatorInput(lcmGcdInputSchema, {
        numbers: "24",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.numbers).toContain("at least 2 positive integers");
    });

    it("rejects non-numeric garbage", () => {
      const validation = validateCalculatorInput(lcmGcdInputSchema, {
        numbers: "foo, bar",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.numbers).toBeDefined();
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes GCD and LCM for larger values (1000, 2500)", () => {
      const result = calculateLcmGcd({ numbers: "1000, 2500" });

      expect(result.gcd).toBe(500);
      expect(result.lcm).toBe(5000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'lcm-gcd'", () => {
      const registered = getCalculatorById("lcm-gcd");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("lcm-gcd");
      expect(registered?.metadata.name).toBe("LCM and GCD Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/lcm-gcd-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = lcmGcdEngine.calculate(lcmGcdEngine.defaultInputs);
      const formatted = lcmGcdEngine.formatResult!(raw, lcmGcdEngine.defaultInputs);

      expect(formatted.primary.label).toContain("GCD = 12 | LCM = 72");
      expect(formatted.primary.value).toBe(12);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
