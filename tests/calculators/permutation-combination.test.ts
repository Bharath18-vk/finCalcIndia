import { describe, it, expect } from "vitest";
import {
  calculatePermutationCombination,
  permutationCombinationEngine,
  permutationCombinationInputSchema,
  computeNCr,
  computeNPr,
} from "@/lib/calculators/permutation-combination";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Permutation and Combination Calculator Engine & Contract (Phase A Batch 2)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes 10P3 = 720 and 10C3 = 120 accurately (Golden Fixture)", () => {
      const result = calculatePermutationCombination({
        n: 10,
        r: 3,
        allowRepetition: false,
      });

      expect(result.nPr).toBe(720);
      expect(result.nCr).toBe(120);
      expect(result.activePermutations).toBe(720);
      expect(result.activeCombinations).toBe(120);
      expect(result.formattedCombinations).toBe("120");
      expect(result.rFactorial).toBe(6); // 3! = 6
    });

    it("verifies combinations symmetry 10C3 === 10C7", () => {
      const c3 = computeNCr(10, 3);
      const c7 = computeNCr(10, 7);
      expect(c3).toBe(c7);
      expect(c3).toBe(120);
    });
  });

  describe("2. Zero Cases", () => {
    it("handles r = 0 correctly: nP0 = 1 and nC0 = 1", () => {
      const result = calculatePermutationCombination({
        n: 5,
        r: 0,
        allowRepetition: false,
      });

      expect(result.nPr).toBe(1);
      expect(result.nCr).toBe(1);
      expect(result.activeCombinations).toBe(1);
    });

    it("handles n = 0 and r = 0: 0P0 = 1 and 0C0 = 1", () => {
      const result = calculatePermutationCombination({
        n: 0,
        r: 0,
        allowRepetition: false,
      });

      expect(result.nPr).toBe(1);
      expect(result.nCr).toBe(1);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles n = r boundary: nPn = n! and nCn = 1", () => {
      const result = calculatePermutationCombination({
        n: 5,
        r: 5,
        allowRepetition: false,
      });

      // 5! = 120, 5C5 = 1
      expect(result.nPr).toBe(120);
      expect(result.nCr).toBe(1);
    });

    it("handles r = 1 boundary: nP1 = n and nC1 = n", () => {
      const result = calculatePermutationCombination({
        n: 8,
        r: 1,
        allowRepetition: false,
      });

      expect(result.nPr).toBe(8);
      expect(result.nCr).toBe(8);
    });
  });

  describe("4. Repetition Allowed Cases", () => {
    it("computes permutations and combinations with repetition (n=4, r=2)", () => {
      const result = calculatePermutationCombination({
        n: 4,
        r: 2,
        allowRepetition: true,
      });

      // n^r = 4^2 = 16
      expect(result.activePermutations).toBe(16);
      // C(n + r - 1, r) = C(4 + 2 - 1, 2) = C(5, 2) = 10
      expect(result.activeCombinations).toBe(10);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects r > n when repetition is not allowed", () => {
      const validation = validateCalculatorInput(permutationCombinationInputSchema, {
        n: 4,
        r: 6,
        allowRepetition: false,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.r).toContain("cannot be greater than n");
    });

    it("rejects negative n", () => {
      const validation = validateCalculatorInput(permutationCombinationInputSchema, {
        n: -2,
        r: 1,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.n).toContain("cannot be negative");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes 5-card poker hands from 52 cards (52C5 = 2,598,960)", () => {
      const result = calculatePermutationCombination({
        n: 52,
        r: 5,
        allowRepetition: false,
      });

      expect(result.nCr).toBe(2598960);
      expect(result.formattedCombinations).toBe("25,98,960");
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'permutation-combination'", () => {
      const registered = getCalculatorById("permutation-combination");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("permutation-combination");
      expect(registered?.metadata.name).toBe("Permutation and Combination Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/permutation-combination-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = permutationCombinationEngine.calculate(permutationCombinationEngine.defaultInputs);
      const formatted = permutationCombinationEngine.formatResult!(raw, permutationCombinationEngine.defaultInputs);

      expect(formatted.primary.label).toContain("Combinations");
      expect(formatted.primary.value).toBe(120);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(3);
    });
  });
});
