import { z } from "zod";
import { ValidationResult } from "@/lib/calculators/types";

/**
 * Validates arbitrary inputs against a Zod schema and maps issues to field-level errors.
 */
export function validateCalculatorInput<T>(
  schema: z.ZodType<T>,
  input: unknown
): ValidationResult<T> {
  const parseResult = schema.safeParse(input);

  if (parseResult.success) {
    return {
      success: true,
      data: parseResult.data,
    };
  }

  const errors: Record<string, string> = {};
  for (const issue of parseResult.error.issues) {
    const fieldName = issue.path.join(".") || "_general";
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  }

  return {
    success: false,
    errors,
  };
}

/**
 * Coerces raw string/unknown inputs into typed values matching the default inputs,
 * validates against the schema, and falls back to defaults for any unrecoverable errors.
 *
 * This ensures the calculation engine always receives type-safe, non-crashing data,
 * while the UI receives exact validation error messages to show the user.
 */
export function coerceAndValidateInput<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  rawInput: Record<string, any>,
  defaultInputs: T
): { data: T; errors: Record<string, string>; isValid: boolean } {
  const coerced: Record<string, any> = { ...defaultInputs };

  for (const [key, defaultVal] of Object.entries(defaultInputs)) {
    const rawVal = rawInput[key];

    if (rawVal === undefined || rawVal === null || rawVal === "") {
      coerced[key] = defaultVal;
      continue;
    }

    if (typeof defaultVal === "number") {
      const num = Number(rawVal);
      coerced[key] = isNaN(num) ? defaultVal : num;
    } else if (typeof defaultVal === "boolean") {
      coerced[key] = rawVal === true || rawVal === "true" || rawVal === 1 || rawVal === "1";
    } else {
      coerced[key] = rawVal;
    }
  }

  const validation = validateCalculatorInput(schema, coerced);

  if (validation.success && validation.data) {
    return {
      data: validation.data,
      errors: {},
      isValid: true,
    };
  }

  return {
    data: coerced as T,
    errors: validation.errors || {},
    isValid: false,
  };
}

/**
 * Standard Zod Schema Helpers for Calculator Fields
 */
export const commonValidators = {
  positiveNumber: (label: string, min = 1, max = 1000000000) =>
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(min, `${label} must be at least ${min}`)
      .max(max, `${label} cannot exceed ${max.toLocaleString("en-IN")}`),

  nonNegativeNumber: (label: string, max = 1000000000) =>
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .max(max, `${label} cannot exceed ${max.toLocaleString("en-IN")}`),

  percentage: (label = "Percentage", min = 0, max = 100) =>
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(min, `${label} cannot be less than ${min}%`)
      .max(max, `${label} cannot exceed ${max}%`),

  tenureYears: (min = 1, max = 50) =>
    z
      .number({ invalid_type_error: "Tenure must be a valid number of years" })
      .int("Tenure must be a whole number of years")
      .min(min, `Tenure must be at least ${min} year`)
      .max(max, `Tenure cannot exceed ${max} years`),
};
