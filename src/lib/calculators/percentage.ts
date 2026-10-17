import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
  CalculatorResultModel,
} from "./types";
import { registerCalculator } from "./registry";

export type PercentageMode =
  | "what-is-x-percent-of-y"
  | "x-is-what-percent-of-y"
  | "percentage-increase"
  | "percentage-decrease"
  | "percentage-difference";

export interface PercentageInput {
  mode: PercentageMode;
  valX: number;
  valY: number;
}

export interface PercentageResult {
  mode: PercentageMode;
  valX: number;
  valY: number;
  resultValue: number;
  formattedResult: string;
  explanation: string;
  detailedSteps: string[];
  secondaryMetrics: {
    key: string;
    label: string;
    value: number | string;
    formattedValue?: string;
    subtext?: string;
  }[];
  isDivisionByZero?: boolean;
}

export const percentageInputSchema = z.object({
  mode: z.enum([
    "what-is-x-percent-of-y",
    "x-is-what-percent-of-y",
    "percentage-increase",
    "percentage-decrease",
    "percentage-difference",
  ]),
  valX: z
    .number({ invalid_type_error: "Value X must be a valid number" })
    .min(-1e14, "Value cannot be less than -100 Trillion")
    .max(1e14, "Value cannot exceed 100 Trillion"),
  valY: z
    .number({ invalid_type_error: "Value Y must be a valid number" })
    .min(-1e14, "Value cannot be less than -100 Trillion")
    .max(1e14, "Value cannot exceed 100 Trillion"),
});

export const defaultPercentageInput: PercentageInput = {
  mode: "what-is-x-percent-of-y",
  valX: 10,
  valY: 500,
};

/**
 * Pure, Zero-Dependency Mathematical Engine for Percentage Operations
 */
export function calculatePercentage(input: PercentageInput): PercentageResult {
  const mode = input.mode || "what-is-x-percent-of-y";
  const x = Number(input.valX) || 0;
  const y = Number(input.valY) || 0;

  switch (mode) {
    case "what-is-x-percent-of-y": {
      // What is X% of Y? => (X / 100) * Y
      const result = (x / 100) * y;
      const formatted = Number(result.toFixed(4)).toString();
      const valAdded = y + result;
      const valSubtracted = y - result;

      return {
        mode,
        valX: x,
        valY: y,
        resultValue: result,
        formattedResult: formatted,
        explanation: `${x}% of ${y} is ${formatted}`,
        detailedSteps: [
          `Step 1: Convert percentage to decimal: ${x} ÷ 100 = ${(x / 100).toFixed(4)}`,
          `Step 2: Multiply by base value: ${(x / 100).toFixed(4)} × ${y} = ${formatted}`,
        ],
        secondaryMetrics: [
          {
            key: "base",
            label: "Original Base (Y)",
            value: y,
            formattedValue: y.toLocaleString("en-IN"),
          },
          {
            key: "added",
            label: `Base + ${x}%`,
            value: valAdded,
            formattedValue: Number(valAdded.toFixed(2)).toLocaleString("en-IN"),
            subtext: "Value after percentage addition",
          },
          {
            key: "subtracted",
            label: `Base − ${x}%`,
            value: valSubtracted,
            formattedValue: Number(valSubtracted.toFixed(2)).toLocaleString("en-IN"),
            subtext: "Value after percentage discount/subtraction",
          },
        ],
      };
    }

    case "x-is-what-percent-of-y": {
      // X is what percent of Y? => (X / Y) * 100
      if (y === 0) {
        return {
          mode,
          valX: x,
          valY: y,
          resultValue: 0,
          formattedResult: "0%",
          explanation: "Division by zero: Base value (Y) cannot be 0.",
          detailedSteps: ["Cannot calculate percentage of 0."],
          secondaryMetrics: [
            { key: "ratio", label: "Fraction Ratio", value: "Undefined" },
          ],
          isDivisionByZero: true,
        };
      }

      const ratio = x / y;
      const percent = ratio * 100;
      const formatted = `${Number(percent.toFixed(2))}%`;

      return {
        mode,
        valX: x,
        valY: y,
        resultValue: percent,
        formattedResult: formatted,
        explanation: `${x} is ${formatted} of ${y}`,
        detailedSteps: [
          `Step 1: Divide part by whole: ${x} ÷ ${y} = ${ratio.toFixed(6)}`,
          `Step 2: Multiply by 100 to convert to percent: ${ratio.toFixed(6)} × 100 = ${formatted}`,
        ],
        secondaryMetrics: [
          {
            key: "ratio",
            label: "Decimal Ratio",
            value: Number(ratio.toFixed(4)),
            formattedValue: ratio.toFixed(4),
          },
          {
            key: "remaining",
            label: "Complementary % (100% - Result)",
            value: Number((100 - percent).toFixed(2)),
            formattedValue: `${Number((100 - percent).toFixed(2))}%`,
            subtext: "Percentage remaining of whole",
          },
        ],
      };
    }

    case "percentage-increase": {
      // Increase from X to Y => ((Y - X) / X) * 100
      if (x === 0) {
        return {
          mode,
          valX: x,
          valY: y,
          resultValue: 0,
          formattedResult: "0%",
          explanation: "Initial value (X) cannot be zero for percentage increase.",
          detailedSteps: ["Cannot compute percentage growth from a zero base."],
          secondaryMetrics: [{ key: "diff", label: "Absolute Increase", value: y }],
          isDivisionByZero: true,
        };
      }

      const diff = y - x;
      const percentInc = (diff / x) * 100;
      const formatted = `${percentInc >= 0 ? "+" : ""}${Number(percentInc.toFixed(2))}%`;

      return {
        mode,
        valX: x,
        valY: y,
        resultValue: percentInc,
        formattedResult: formatted,
        explanation: `Changing from ${x} to ${y} is an increase of ${formatted}`,
        detailedSteps: [
          `Step 1: Find absolute difference: ${y} − ${x} = ${diff}`,
          `Step 2: Divide by initial value: ${diff} ÷ ${x} = ${(diff / x).toFixed(6)}`,
          `Step 3: Convert to percentage: ${(diff / x).toFixed(6)} × 100 = ${formatted}`,
        ],
        secondaryMetrics: [
          {
            key: "diff",
            label: "Absolute Increase",
            value: diff,
            formattedValue: Number(diff.toFixed(2)).toLocaleString("en-IN"),
          },
          {
            key: "multiplier",
            label: "Growth Multiplier",
            value: Number((y / x).toFixed(4)),
            formattedValue: `${(y / x).toFixed(2)}x`,
          },
        ],
      };
    }

    case "percentage-decrease": {
      // Decrease from X to Y => ((X - Y) / X) * 100
      if (x === 0) {
        return {
          mode,
          valX: x,
          valY: y,
          resultValue: 0,
          formattedResult: "0%",
          explanation: "Initial value (X) cannot be zero for percentage decrease.",
          detailedSteps: ["Cannot compute percentage drop from a zero base."],
          secondaryMetrics: [{ key: "diff", label: "Absolute Decrease", value: -y }],
          isDivisionByZero: true,
        };
      }

      const diff = x - y;
      const percentDec = (diff / x) * 100;
      const formatted = `${Number(percentDec.toFixed(2))}%`;

      return {
        mode,
        valX: x,
        valY: y,
        resultValue: percentDec,
        formattedResult: formatted,
        explanation: `Changing from ${x} to ${y} is a decrease of ${formatted}`,
        detailedSteps: [
          `Step 1: Find drop amount: ${x} − ${y} = ${diff}`,
          `Step 2: Divide by initial base: ${diff} ÷ ${x} = ${(diff / x).toFixed(6)}`,
          `Step 3: Multiply by 100: ${(diff / x).toFixed(6)} × 100 = ${formatted}`,
        ],
        secondaryMetrics: [
          {
            key: "diff",
            label: "Absolute Reduction",
            value: diff,
            formattedValue: Number(diff.toFixed(2)).toLocaleString("en-IN"),
          },
          {
            key: "remainingRatio",
            label: "Remaining Fraction",
            value: Number((y / x).toFixed(4)),
            formattedValue: `${((y / x) * 100).toFixed(1)}%`,
          },
        ],
      };
    }

    case "percentage-difference": {
      // Percentage Difference between X and Y: |X - Y| / ((|X| + |Y|) / 2) * 100
      const absDiff = Math.abs(x - y);
      const avg = (Math.abs(x) + Math.abs(y)) / 2;

      if (avg === 0) {
        return {
          mode,
          valX: x,
          valY: y,
          resultValue: 0,
          formattedResult: "0%",
          explanation: "Both numbers are zero; percentage difference is 0%.",
          detailedSteps: ["Difference is 0 when both values are zero."],
          secondaryMetrics: [],
        };
      }

      const percentDiff = (absDiff / avg) * 100;
      const formatted = `${Number(percentDiff.toFixed(2))}%`;

      return {
        mode,
        valX: x,
        valY: y,
        resultValue: percentDiff,
        formattedResult: formatted,
        explanation: `The percentage difference between ${x} and ${y} is ${formatted}`,
        detailedSteps: [
          `Step 1: Calculate absolute difference: |${x} − ${y}| = ${absDiff}`,
          `Step 2: Calculate average of absolute values: (|${x}| + |${y}|) ÷ 2 = ${avg}`,
          `Step 3: Divide difference by average: ${absDiff} ÷ ${avg} = ${(absDiff / avg).toFixed(6)}`,
          `Step 4: Multiply by 100: ${(absDiff / avg).toFixed(6)} × 100 = ${formatted}`,
        ],
        secondaryMetrics: [
          {
            key: "absDiff",
            label: "Absolute Difference",
            value: absDiff,
            formattedValue: Number(absDiff.toFixed(2)).toLocaleString("en-IN"),
          },
          {
            key: "avg",
            label: "Midpoint / Average",
            value: avg,
            formattedValue: Number(avg.toFixed(2)).toLocaleString("en-IN"),
          },
        ],
      };
    }
  }
}

export const percentageFields: CalculatorField<PercentageInput>[] = [
  {
    name: "mode",
    label: "Calculation Type",
    type: "select",
    defaultValue: "what-is-x-percent-of-y",
    options: [
      { label: "What is X% of Y? (e.g. 10% of 500)", value: "what-is-x-percent-of-y" },
      { label: "X is what % of Y? (e.g. 50 is what % of 200)", value: "x-is-what-percent-of-y" },
      { label: "Percentage Increase (from X to Y)", value: "percentage-increase" },
      { label: "Percentage Decrease (from X to Y)", value: "percentage-decrease" },
      { label: "Percentage Difference (between X and Y)", value: "percentage-difference" },
    ],
    helperText: "Choose the mathematical percentage formula to evaluate.",
  },
  {
    name: "valX",
    label: "Value X",
    type: "number",
    defaultValue: 10,
    min: 0,
    max: 10000000,
    step: 1,
    presets: [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "20", value: 20 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
    ],
    helperText: "Percentage rate (%) or primary comparison value.",
  },
  {
    name: "valY",
    label: "Value Y",
    type: "number",
    defaultValue: 500,
    min: 0,
    max: 100000000,
    step: 10,
    presets: [
      { label: "100", value: 100 },
      { label: "500", value: 500 },
      { label: "1,000", value: 1000 },
      { label: "5,000", value: 5000 },
      { label: "10,000", value: 10000 },
    ],
    helperText: "Base number or secondary comparison value.",
  },
];

export const percentageMetadata: CalculatorMetadata = {
  id: "percentage",
  name: "Percentage Calculator",
  shortDescription:
    "Calculate percentages, percentage increase and decrease, percentage difference, and what percent one number is of another with step-by-step mathematical breakdowns.",
  category: "math",
  subcategory: "arithmetic",
  route: "/percentage-calculator",
  badge: "Math & Everyday",
  directAnswer:
    "To find what is X% of Y, multiply X by Y and divide by 100 (e.g., 10% of 500 = 50). To find what percent X is of Y, divide X by Y and multiply by 100 (e.g., 50 is 25% of 200). For percentage increase from X to Y, compute ((Y - X) / X) × 100 (e.g., 100 to 120 = +20%).",
  keywords: [
    "percentage calculator",
    "calculate percentage",
    "what is x percent of y",
    "percentage increase calculator",
    "percentage decrease calculator",
    "percentage difference calculator",
    "percent change calculator",
  ],
  formula: {
    expression: "Percentage Value = (X / 100) × Y  |  Rate (%) = (X / Y) × 100  |  Percentage Change (%) = ((Y - X) / X) × 100",
    variables: [
      { symbol: "X", label: "Percentage or First Number", description: "The rate to apply or the initial comparison value" },
      { symbol: "Y", label: "Base or Second Number", description: "The whole base quantity or subsequent final value" },
    ],
    steps: [
      { label: "Percent of Value", expression: "(X / 100) × Y", explanation: "Multiplies the decimal fraction by the total base quantity." },
      { label: "Fraction to Percent", expression: "(X / Y) × 100", explanation: "Expresses part X as a proportion out of 100 against whole Y." },
      { label: "Percentage Change", expression: "((Y - X) / X) × 100", explanation: "Calculates proportional growth or reduction relative to initial base X." },
    ],
    notes: [
      "Percentages represent hundredths: 1% = 0.01.",
      "Division by zero is undefined; base values (Y) cannot be zero when finding rates.",
    ],
  },
  faqs: [
    {
      question: "How do I calculate what percentage one number is of another?",
      answer:
        "Divide the part (X) by the total (Y), then multiply the resulting decimal by 100. For example, to find what percentage 25 is of 200: (25 ÷ 200) × 100 = 0.125 × 100 = 12.5%.",
    },
    {
      question: "How do you calculate percentage increase?",
      answer:
        "Subtract the starting number (X) from the final number (Y) to find the increase amount, divide by the starting number (X), and multiply by 100. Formula: ((Y - X) ÷ X) × 100. For example, growing from 100 to 120 gives ((120 - 100) ÷ 100) × 100 = 20% increase.",
    },
    {
      question: "How do you calculate percentage decrease?",
      answer:
        "Subtract the final number (Y) from the starting number (X) to determine the drop, divide by the initial number (X), and multiply by 100. Formula: ((X - Y) ÷ X) × 100. For example, dropping from 120 to 100 gives ((120 - 100) ÷ 120) × 100 = 16.67% decrease.",
    },
    {
      question: "What is the difference between percentage change and percentage difference?",
      answer:
        "Percentage change evaluates directional movement from a specific old starting value to a new value (divided by the old value). Percentage difference compares two numbers without direction, dividing the absolute difference by the average of the two numbers.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial reference implementation of scalable CalculatorEngine contract.",
  },
};

export const percentageEngine: CalculatorEngine<PercentageInput, PercentageResult> = {
  id: "percentage",
  metadata: percentageMetadata,
  schema: percentageInputSchema,
  defaultInputs: defaultPercentageInput,
  fields: percentageFields,
  calculate: calculatePercentage,
  formatResult: (result: PercentageResult) => {
    return {
      raw: result,
      primary: {
        key: "primary",
        label: "Calculated Result",
        value: result.resultValue,
        formattedValue: result.formattedResult,
        subtext: result.explanation,
        highlight: true,
      },
      secondary: result.secondaryMetrics.map((m) => ({
        key: m.key,
        label: m.label,
        value: m.value,
        formattedValue: m.formattedValue,
        subtext: m.subtext,
      })),
      summaryText: result.explanation,
    };
  },
};

// Register in central registry
registerCalculator(percentageEngine);
