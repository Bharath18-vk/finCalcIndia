import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validateCalculatorInput,
  coerceAndValidateInput,
  commonValidators,
} from "@/lib/validation/validator";
import {
  emiInputSchema,
  sipInputSchema,
  stepUpSipInputSchema,
  lumpsumInputSchema,
  fdInputSchema,
} from "@/lib/validation/schemas";

describe("Input Validation and Coercion Suite", () => {
  describe("validateCalculatorInput", () => {
    const testSchema = z.object({
      amount: z.number().min(100),
      label: z.string().min(2),
    });

    it("returns success and parsed data for valid input", () => {
      const result = validateCalculatorInput(testSchema, {
        amount: 500,
        label: "Savings",
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ amount: 500, label: "Savings" });
      expect(result.errors).toBeUndefined();
    });

    it("returns mapped field errors for invalid input", () => {
      const result = validateCalculatorInput(testSchema, {
        amount: 50,
        label: "A",
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.amount).toBeDefined();
      expect(result.errors?.label).toBeDefined();
    });

    it("maps root/general errors properly", () => {
      const literalSchema = z.literal("fixed");
      const result = validateCalculatorInput(literalSchema, "variable");
      expect(result.success).toBe(false);
      expect(result.errors?._general).toBeDefined();
    });
  });

  describe("coerceAndValidateInput", () => {
    const schema = z.object({
      principal: z.number().min(1000).max(1000000),
      rate: z.number().min(1).max(30),
      isSenior: z.boolean(),
      plan: z.string(),
    });

    const defaults = {
      principal: 100000,
      rate: 7.5,
      isSenior: false,
      plan: "standard",
    };

    it("successfully coerces string numbers and booleans into typed data", () => {
      const raw = {
        principal: "250000",
        rate: "8.25",
        isSenior: "true",
        plan: "growth",
      };

      const result = coerceAndValidateInput(schema, raw, defaults);
      expect(result.isValid).toBe(true);
      expect(result.data.principal).toBe(250000);
      expect(result.data.rate).toBe(8.25);
      expect(result.data.isSenior).toBe(true);
      expect(result.data.plan).toBe("growth");
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it("falls back to default when raw value is empty, null, or undefined", () => {
      const raw = {
        principal: "",
        rate: null,
        plan: undefined,
      };

      const result = coerceAndValidateInput(schema, raw, defaults);
      expect(result.isValid).toBe(true);
      expect(result.data.principal).toBe(100000);
      expect(result.data.rate).toBe(7.5);
      expect(result.data.plan).toBe("standard");
    });

    it("falls back to default number when raw numeric string is NaN", () => {
      const raw = {
        principal: "invalid_string_not_a_number",
      };

      const result = coerceAndValidateInput(schema, raw, defaults);
      expect(result.isValid).toBe(true);
      expect(result.data.principal).toBe(100000);
    });

    it("returns validation errors and isValid=false if coerced values violate schema boundaries", () => {
      const raw = {
        principal: 50, // Below min 1000
        rate: 55, // Above max 30
      };

      const result = coerceAndValidateInput(schema, raw, defaults);
      expect(result.isValid).toBe(false);
      expect(result.errors.principal).toBeDefined();
      expect(result.errors.rate).toBeDefined();
      expect(result.data.principal).toBe(50);
      expect(result.data.rate).toBe(55);
    });
  });

  describe("commonValidators helpers", () => {
    it("validates positiveNumber correctly", () => {
      const validator = commonValidators.positiveNumber("Investment", 500, 100000);
      expect(validator.safeParse(1000).success).toBe(true);
      expect(validator.safeParse(100).success).toBe(false);
      expect(validator.safeParse(5000000).success).toBe(false);
      expect(validator.safeParse("text").success).toBe(false);
    });

    it("validates nonNegativeNumber correctly", () => {
      const validator = commonValidators.nonNegativeNumber("Balance", 50000);
      expect(validator.safeParse(0).success).toBe(true);
      expect(validator.safeParse(25000).success).toBe(true);
      expect(validator.safeParse(-10).success).toBe(false);
      expect(validator.safeParse(100000).success).toBe(false);
    });

    it("validates percentage correctly", () => {
      const validator = commonValidators.percentage("Tax Rate", 0, 50);
      expect(validator.safeParse(18).success).toBe(true);
      expect(validator.safeParse(0).success).toBe(true);
      expect(validator.safeParse(50).success).toBe(true);
      expect(validator.safeParse(-1).success).toBe(false);
      expect(validator.safeParse(51).success).toBe(false);
    });

    it("validates tenureYears correctly", () => {
      const validator = commonValidators.tenureYears(1, 30);
      expect(validator.safeParse(15).success).toBe(true);
      expect(validator.safeParse(0).success).toBe(false);
      expect(validator.safeParse(35).success).toBe(false);
      expect(validator.safeParse(15.5).success).toBe(false); // must be integer
    });
  });

  describe("Predefined Production Schemas", () => {
    it("validates emiInputSchema limits", () => {
      expect(
        emiInputSchema.safeParse({
          principal: 5000000,
          annualRate: 8.5,
          tenureYears: 20,
        }).success
      ).toBe(true);

      expect(
        emiInputSchema.safeParse({
          principal: 500, // Below 1,000
          annualRate: 8.5,
          tenureYears: 20,
        }).success
      ).toBe(false);
    });

    it("validates sipInputSchema limits", () => {
      expect(
        sipInputSchema.safeParse({
          monthlyInvestment: 5000,
          annualReturnRate: 12,
          tenureYears: 10,
        }).success
      ).toBe(true);

      expect(
        sipInputSchema.safeParse({
          monthlyInvestment: 50, // Below 100
          annualReturnRate: 12,
          tenureYears: 10,
        }).success
      ).toBe(false);
    });

    it("validates stepUpSipInputSchema limits", () => {
      expect(
        stepUpSipInputSchema.safeParse({
          monthlyInvestment: 10000,
          annualReturnRate: 12,
          tenureYears: 15,
          annualStepUpPercentage: 10,
        }).success
      ).toBe(true);

      expect(
        stepUpSipInputSchema.safeParse({
          monthlyInvestment: 10000,
          annualReturnRate: 12,
          tenureYears: 15,
          annualStepUpPercentage: -5, // Negative
        }).success
      ).toBe(false);
    });

    it("validates lumpsumInputSchema limits", () => {
      expect(
        lumpsumInputSchema.safeParse({
          totalInvestment: 100000,
          annualReturnRate: 12,
          tenureYears: 10,
        }).success
      ).toBe(true);

      expect(
        lumpsumInputSchema.safeParse({
          totalInvestment: 200, // Below 500
          annualReturnRate: 12,
          tenureYears: 10,
        }).success
      ).toBe(false);
    });

    it("validates fdInputSchema options and defaults", () => {
      const parsed = fdInputSchema.safeParse({
        principal: 100000,
        annualRate: 7.1,
        tenureYears: 5,
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.compoundingFrequency).toBe("quarterly");
        expect(parsed.data.isSeniorCitizen).toBe(false);
      }
    });
  });
});
