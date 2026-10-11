import { describe, it, expect } from "vitest";
import {
  calculateProbability,
  probabilityEngine,
  probabilityInputSchema,
  combinations,
} from "@/lib/calculators/probability";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Probability Calculator Engine & Contract (Phase A Batch 2)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes single event probability: rolling a 6 on a 6-sided die = 16.67% (Golden Fixture)", () => {
      const result = calculateProbability({
        mode: "single",
        favorableOutcomes: 1,
        totalOutcomes: 6,
      });

      expect(result.primaryProbability).toBeCloseTo(0.166667, 4);
      expect(result.primaryPercentage).toBe(16.67);
      expect(result.ratioFraction).toBe("1 / 6");
      expect(result.oddsInFavor).toBe("1 : 5");
      expect(result.oddsAgainst).toBe("5 : 1");
      expect(result.complementaryProb).toBeCloseTo(0.833333, 4);
    });

    it("computes two independent events intersection & union: P(A)=0.5, P(B)=0.5", () => {
      const result = calculateProbability({
        mode: "two_events",
        probA: 0.5,
        probB: 0.5,
        twoEventRelationship: "independent",
      });

      // P(A and B) = 0.5 * 0.5 = 0.25
      expect(result.probAAndB).toBe(0.25);
      // P(A or B) = 0.5 + 0.5 - 0.25 = 0.75
      expect(result.probAOrB).toBe(0.75);
      expect(result.primaryPercentage).toBe(75);
      expect(result.probNeither).toBe(0.25);
    });

    it("computes binomial probability: 5 heads in 10 fair coin flips = 24.6094%", () => {
      const result = calculateProbability({
        mode: "binomial",
        trials: 10,
        successProb: 0.5,
        targetSuccesses: 5,
      });

      // C(10, 5) * (0.5)^10 = 252 / 1024 = 0.24609375
      expect(result.probExactK).toBeCloseTo(0.246094, 4);
      expect(result.expectedValue).toBe(5); // 10 * 0.5
      expect(result.variance).toBe(2.5); // 10 * 0.5 * 0.5
    });
  });

  describe("2. Zero Cases", () => {
    it("handles zero favorable outcomes (impossible event)", () => {
      const result = calculateProbability({
        mode: "single",
        favorableOutcomes: 0,
        totalOutcomes: 10,
      });

      expect(result.primaryProbability).toBe(0);
      expect(result.primaryPercentage).toBe(0);
      expect(result.complementaryProb).toBe(1);
    });

    it("handles mutually exclusive events with P(A and B) = 0", () => {
      const result = calculateProbability({
        mode: "two_events",
        probA: 0.3,
        probB: 0.4,
        twoEventRelationship: "mutually_exclusive",
      });

      expect(result.probAAndB).toBe(0);
      expect(result.probAOrB).toBe(0.7);
      expect(result.probNeither).toBe(0.3);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles certain event (favorable = total)", () => {
      const result = calculateProbability({
        mode: "single",
        favorableOutcomes: 52,
        totalOutcomes: 52,
      });

      expect(result.primaryProbability).toBe(1);
      expect(result.primaryPercentage).toBe(100);
      expect(result.complementaryProb).toBe(0);
      expect(result.ratioFraction).toBe("1 / 1");
    });

    it("handles binomial boundary k = 0", () => {
      const result = calculateProbability({
        mode: "binomial",
        trials: 5,
        successProb: 0.2,
        targetSuccesses: 0,
      });

      // (0.8)^5 = 0.32768
      expect(result.probExactK).toBeCloseTo(0.32768, 4);
    });
  });

  describe("4. Decimal Probabilities", () => {
    it("handles precise decimal probabilities in two-event calculations", () => {
      const result = calculateProbability({
        mode: "two_events",
        probA: 0.125,
        probB: 0.375,
        twoEventRelationship: "independent",
      });

      // 0.125 * 0.375 = 0.046875 => 0.0469
      expect(result.probAAndB).toBeCloseTo(0.0469, 3);
      expect(result.probAOrB).toBeCloseTo(0.4531, 3);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects negative favorable outcomes", () => {
      const validation = validateCalculatorInput(probabilityInputSchema, {
        mode: "single",
        favorableOutcomes: -1,
        totalOutcomes: 10,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.favorableOutcomes).toContain("cannot be negative");
    });

    it("rejects probability exceeding 1", () => {
      const validation = validateCalculatorInput(probabilityInputSchema, {
        mode: "two_events",
        probA: 1.5,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.probA).toContain("cannot exceed 1");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes probability on large outcome sample spaces", () => {
      const result = calculateProbability({
        mode: "single",
        favorableOutcomes: 1000000,
        totalOutcomes: 50000000,
      });

      // 1M / 50M = 0.02 (2%)
      expect(result.primaryProbability).toBe(0.02);
      expect(result.primaryPercentage).toBe(2);
      expect(result.ratioFraction).toBe("1 / 50");
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'probability'", () => {
      const registered = getCalculatorById("probability");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("probability");
      expect(registered?.metadata.name).toBe("Probability Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/probability-calculator");
    });

    it("conforms to formatResult output model across modes", () => {
      // Single event formatting
      const rawSingle = probabilityEngine.calculate({ ...probabilityEngine.defaultInputs, mode: "single" });
      const formatSingle = probabilityEngine.formatResult!(rawSingle, { ...probabilityEngine.defaultInputs, mode: "single" });
      expect(formatSingle.primary.label).toContain("Probability of Event");

      // Two events formatting
      const rawTwo = probabilityEngine.calculate({ ...probabilityEngine.defaultInputs, mode: "two_events" });
      const formatTwo = probabilityEngine.formatResult!(rawTwo, { ...probabilityEngine.defaultInputs, mode: "two_events" });
      expect(formatTwo.primary.label).toContain("P(A or B)");

      // Binomial formatting
      const rawBinom = probabilityEngine.calculate({ ...probabilityEngine.defaultInputs, mode: "binomial" });
      const formatBinom = probabilityEngine.formatResult!(rawBinom, { ...probabilityEngine.defaultInputs, mode: "binomial" });
      expect(formatBinom.primary.label).toContain("Successes");
    });
  });
});
