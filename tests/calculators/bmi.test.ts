import { describe, it, expect } from "vitest";
import {
  calculateBmi,
  bmiEngine,
  bmiInputSchema,
  getWhoCategory,
  getAsianIndianCategory,
} from "@/lib/calculators/bmi";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("BMI Calculator Engine & Contract (Phase A Batch 3)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes exact BMI and classifications for golden fixture (175 cm, 70 kg)", () => {
      const result = calculateBmi({
        unit: "metric",
        heightCm: 175,
        weightKg: 70,
        heightFt: 5,
        heightIn: 9,
        weightLbs: 154,
      });

      // 70 / (1.75 * 1.75) = 22.857... => 22.9
      expect(result.bmi).toBe(22.9);
      expect(result.asianIndianCategory.category).toBe("Normal Weight");
      expect(result.whoCategory.category).toBe("Normal Weight");
      expect(result.bmiPrime).toBe(0.92);
      expect(result.ponderalIndex).toBe(13.1);
      expect(result.indianHealthyRange.minKg).toBe(55.1);
      expect(result.indianHealthyRange.maxKg).toBe(70.1);
    });

    it("identifies underweight correctly (170 cm, 45 kg)", () => {
      const result = calculateBmi({
        unit: "metric",
        heightCm: 170,
        weightKg: 45,
        heightFt: 5,
        heightIn: 7,
        weightLbs: 99,
      });

      // 45 / (1.7 * 1.7) = 15.57 => 15.6
      expect(result.bmi).toBe(15.6);
      expect(result.asianIndianCategory.category).toBe("Underweight");
      expect(result.whoCategory.category).toBe("Severe Thinness");
      expect(result.weightDiffToIndianNormalKg).toBeLessThan(0); // Needs to gain weight
    });
  });

  describe("2. Zero & Non-Positive Input Cases", () => {
    it("returns zero state safely when height or weight is zero", () => {
      const result = calculateBmi({
        unit: "metric",
        heightCm: 0,
        weightKg: 0,
        heightFt: 0,
        heightIn: 0,
        weightLbs: 0,
      });

      expect(result.bmi).toBe(0);
      expect(result.bmiPrime).toBe(0);
      expect(result.steps).toContain("Invalid zero or negative height/weight.");
    });
  });

  describe("3. Boundary Cases & Indian Cut-Offs", () => {
    it("differentiates Indian vs WHO cutoffs at BMI 23.5 (Normal in WHO, Overweight in India)", () => {
      // 170 cm, 68 kg -> 68 / 2.89 = 23.5
      const result = calculateBmi({
        unit: "metric",
        heightCm: 170,
        weightKg: 68,
        heightFt: 5,
        heightIn: 7,
        weightLbs: 150,
      });

      expect(result.bmi).toBe(23.5);
      expect(result.asianIndianCategory.category).toBe("Overweight");
      expect(result.whoCategory.category).toBe("Normal Weight");
    });

    it("differentiates Indian vs WHO cutoffs at BMI 26.0 (Overweight in WHO, Obese in India)", () => {
      // 170 cm, 75.1 kg -> 75.1 / 2.89 = 25.98 => 26.0
      const result = calculateBmi({
        unit: "metric",
        heightCm: 170,
        weightKg: 75.1,
        heightFt: 5,
        heightIn: 7,
        weightLbs: 165,
      });

      expect(result.bmi).toBe(26.0);
      expect(result.asianIndianCategory.category).toBe("Obese");
      expect(result.whoCategory.category).toBe("Overweight (Pre-obese)");
    });

    it("verifies category helper boundary mappings", () => {
      expect(getAsianIndianCategory(17.9).category).toBe("Underweight");
      expect(getAsianIndianCategory(18.0).category).toBe("Normal Weight");
      expect(getAsianIndianCategory(22.9).category).toBe("Normal Weight");
      expect(getAsianIndianCategory(23.0).category).toBe("Overweight");
      expect(getAsianIndianCategory(24.9).category).toBe("Overweight");
      expect(getAsianIndianCategory(25.0).category).toBe("Obese");

      expect(getWhoCategory(18.4).category).toBe("Mild Thinness (Underweight)");
      expect(getWhoCategory(18.5).category).toBe("Normal Weight");
      expect(getWhoCategory(24.9).category).toBe("Normal Weight");
      expect(getWhoCategory(25.0).category).toBe("Overweight (Pre-obese)");
      expect(getWhoCategory(30.0).category).toBe("Obese Class I");
      expect(getWhoCategory(35.0).category).toBe("Obese Class II");
      expect(getWhoCategory(40.0).category).toBe("Obese Class III");
    });
  });

  describe("4. Decimal & Imperial Unit Cases", () => {
    it("converts imperial height (5 ft 10 in) and weight (160 lbs) with high accuracy", () => {
      // 5 ft 10 in = 70 inches = 1.778 m. 160 lbs = 72.574 kg.
      // BMI = 72.574 / (1.778^2) = 22.95 => 23.0
      const result = calculateBmi({
        unit: "imperial",
        heightCm: 175,
        weightKg: 70,
        heightFt: 5,
        heightIn: 10,
        weightLbs: 160,
      });

      expect(result.bmi).toBe(23.0);
      expect(result.effectiveHeightCm).toBe(177.8);
      expect(result.effectiveWeightKg).toBe(72.6);
      expect(result.asianIndianCategory.category).toBe("Overweight");
    });
  });

  describe("5. Invalid Input & Schema Validation Cases", () => {
    it("fails validation when height is below minimum (40 cm)", () => {
      const validation = validateCalculatorInput(bmiInputSchema, {
        unit: "metric",
        heightCm: 40,
        weightKg: 60,
        heightFt: 5,
        heightIn: 9,
        weightLbs: 132,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.heightCm).toBe("Height must be at least 50 cm");
    });

    it("fails validation when weight is below minimum (5 kg)", () => {
      const validation = validateCalculatorInput(bmiInputSchema, {
        unit: "metric",
        heightCm: 170,
        weightKg: 5,
        heightFt: 5,
        heightIn: 7,
        weightLbs: 11,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.weightKg).toBe("Weight must be at least 10 kg");
    });
  });

  describe("6. Large-Value / Severe Obesity Cases", () => {
    it("evaluates extreme values without overflow (160 cm, 150 kg)", () => {
      const result = calculateBmi({
        unit: "metric",
        heightCm: 160,
        weightKg: 150,
        heightFt: 5,
        heightIn: 3,
        weightLbs: 330,
      });

      // 150 / (1.6 * 1.6) = 58.59 => 58.6
      expect(result.bmi).toBe(58.6);
      expect(result.whoCategory.category).toBe("Obese Class III");
      expect(result.asianIndianCategory.category).toBe("Obese");
      expect(result.weightDiffToIndianNormalKg).toBeGreaterThan(90);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'bmi'", () => {
      const registered = getCalculatorById("bmi");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("bmi");
      expect(registered?.metadata.name).toBe("BMI Calculator");
      expect(registered?.metadata.category).toBe("health");
      expect(registered?.metadata.route).toBe("/bmi-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = bmiEngine.calculate(bmiEngine.defaultInputs);
      const formatted = bmiEngine.formatResult!(raw, bmiEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Your Body Mass Index (BMI)");
      expect(formatted.primary.formattedValue).toBe("22.9 kg/m²");
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(3);
    });
  });
});
