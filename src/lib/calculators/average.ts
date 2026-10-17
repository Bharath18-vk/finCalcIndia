import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
  CalculatorResultModel,
} from "./types";
import { registerCalculator } from "./registry";

export interface AverageInput {
  numbers: string;
}

export interface AverageResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  modeString: string;
  min: number;
  max: number;
  range: number;
  geometricMean: number | null;
  sampleStandardDeviation: number;
  populationStandardDeviation: number;
  sortedNumbers: number[];
  parsedNumbers: number[];
}

/**
 * Robust numerical token parser for comma, space, semicolon, or newline delimited inputs
 */
export function parseNumberList(input: string): number[] {
  if (!input || typeof input !== "string") return [];

  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const numbers: number[] = [];
  for (const token of tokens) {
    const num = Number(token);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

export const averageInputSchema = z.object({
  numbers: z
    .string({ invalid_type_error: "Please enter numbers" })
    .min(1, "Please enter at least one number")
    .refine((val) => parseNumberList(val).length > 0, {
      message: "Please enter valid numeric values separated by commas, spaces, or lines",
    })
    .refine((val) => parseNumberList(val).length <= 1000, {
      message: "Dataset cannot exceed 1,000 numbers",
    }),
});

export const defaultAverageInput: AverageInput = {
  numbers: "10, 25, 30, 45, 90",
};

/**
 * Pure calculation engine for statistical average, median, mode, and dispersion
 */
export function calculateAverage(input: AverageInput): AverageResult {
  const parsed = parseNumberList(input.numbers);

  if (parsed.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      modes: [],
      modeString: "None",
      min: 0,
      max: 0,
      range: 0,
      geometricMean: null,
      sampleStandardDeviation: 0,
      populationStandardDeviation: 0,
      sortedNumbers: [],
      parsedNumbers: [],
    };
  }

  const count = parsed.length;
  const sum = parsed.reduce((acc, curr) => acc + curr, 0);
  const rawMean = sum / count;
  const mean = Number(rawMean.toFixed(4));

  const sorted = [...parsed].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = Number((max - min).toFixed(4));

  // Median
  let median: number;
  if (count % 2 === 1) {
    median = sorted[Math.floor(count / 2)];
  } else {
    const mid1 = sorted[count / 2 - 1];
    const mid2 = sorted[count / 2];
    median = Number(((mid1 + mid2) / 2).toFixed(4));
  }

  // Mode
  const frequencyMap = new Map<number, number>();
  for (const num of sorted) {
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
  }

  let maxFreq = 0;
  for (const freq of frequencyMap.values()) {
    if (freq > maxFreq) maxFreq = freq;
  }

  let modes: number[] = [];
  if (maxFreq > 1 && frequencyMap.size > 1) {
    for (const [val, freq] of frequencyMap.entries()) {
      if (freq === maxFreq) {
        modes.push(val);
      }
    }
  }

  const modeString = modes.length > 0 ? modes.join(", ") : "No unique mode";

  // Geometric Mean (only valid if all values > 0)
  let geometricMean: number | null = null;
  const allPositive = parsed.every((n) => n > 0);
  if (allPositive) {
    const sumLog = parsed.reduce((acc, curr) => acc + Math.log(curr), 0);
    geometricMean = Number(Math.exp(sumLog / count).toFixed(4));
  }

  // Standard Deviations
  const sumSquaredDiffs = parsed.reduce((acc, curr) => acc + Math.pow(curr - rawMean, 2), 0);

  const sampleStandardDeviation =
    count > 1 ? Number(Math.sqrt(sumSquaredDiffs / (count - 1)).toFixed(4)) : 0;

  const populationStandardDeviation = Number(Math.sqrt(sumSquaredDiffs / count).toFixed(4));

  return {
    count,
    sum: Number(sum.toFixed(4)),
    mean,
    median,
    modes,
    modeString,
    min,
    max,
    range,
    geometricMean,
    sampleStandardDeviation,
    populationStandardDeviation,
    sortedNumbers: sorted,
    parsedNumbers: parsed,
  };
}

export const averageFields: CalculatorField<AverageInput>[] = [
  {
    name: "numbers",
    label: "Dataset (Numbers separated by commas or spaces)",
    type: "text",
    defaultValue: "10, 25, 30, 45, 90",
    placeholder: "e.g., 10, 25, 30, 45, 90",
    helperText: "Enter integers or decimals separated by commas, spaces, or line breaks",
    presets: [
      { label: "10, 25, 30, 45, 90", value: "10, 25, 30, 45, 90" },
      { label: "Test Scores (65, 78, 82, 90, 95)", value: "65, 78, 82, 90, 95" },
      { label: "Decimals (2.5, 3.8, 4.1, 7.9)", value: "2.5, 3.8, 4.1, 7.9" },
      { label: "Heights (160, 165, 170, 175, 180)", value: "160, 165, 170, 175, 180" },
    ],
  },
];

export const averageMetadata: CalculatorMetadata = {
  id: "average",
  name: "Average Calculator",
  shortDescription:
    "Calculate arithmetic mean, median, mode, geometric mean, range, sum, count, and standard deviation for any dataset with instant step-by-step statistics.",
  category: "math",
  subcategory: "statistics",
  route: "/average-calculator",
  badge: "Math & Statistics",
  directAnswer:
    "The average (arithmetic mean) is calculated by adding all the numbers in a dataset together and dividing the sum by the count of numbers (Mean = Sum ÷ Count). For example, the average of 10, 25, 30, 45, and 90 is (200 ÷ 5) = 40.",
  keywords: [
    "average calculator",
    "mean calculator",
    "arithmetic mean",
    "median calculator",
    "mode calculator",
    "calculate average",
    "math average finder",
    "standard deviation calculator",
  ],
  formula: {
    expression: "Mean (x̄) = (Σ x) / n  |  Median = Middle value of sorted dataset  |  Mode = Most frequent value",
    variables: [
      { symbol: "x̄", label: "Arithmetic Mean", description: "The central average of the dataset" },
      { symbol: "n", label: "Sample Count", description: "The total number of data points entered" },
      { symbol: "Σ x", label: "Sum of Values", description: "The total addition of all numbers in the sample" },
      { symbol: "s", label: "Sample Std Dev", description: "The measure of dispersion around the mean" },
    ],
    steps: [
      { label: "Sum All Numbers", expression: "Σ x = x₁ + x₂ + ... + xₙ", explanation: "Add all input values together." },
      { label: "Count Data Points", expression: "n = Total valid numbers entered", explanation: "Count the number of valid numerical entries." },
      { label: "Divide Sum by Count", expression: "x̄ = (Sum of Values) / n", explanation: "Divide the sum by the count to determine the arithmetic mean." },
      { label: "Sort for Median & Mode", expression: "x₍₁₎ ≤ x₍₂₎ ≤ ... ≤ x₍ₙ₎", explanation: "Order the numbers to identify the central median and most frequent mode." },
    ],
    notes: [
      "The arithmetic mean is sensitive to extreme outliers; inspect the median when working with skewed data (like salaries).",
      "Geometric mean is computed when all values are positive, ideal for growth rates and investment returns.",
      "Sample standard deviation uses Bessel's correction (n - 1) in the denominator.",
    ],
  },
  faqs: [
    {
      question: "What is the difference between mean, median, and mode?",
      answer:
        "The mean is the calculated arithmetic average (Sum ÷ Count). The median is the middle value when all numbers are ordered from smallest to largest. The mode is the most frequently occurring number in the dataset.",
    },
    {
      question: "When should I use the median instead of the mean?",
      answer:
        "The median is preferred when your dataset contains extreme outliers or is heavily skewed (for example, income, real estate prices, or net worth), because outliers can heavily distort the arithmetic mean.",
    },
    {
      question: "How does the calculator handle decimals and negative numbers?",
      answer:
        "The calculator handles positive numbers, negative numbers, and floating-point decimals accurately. Negative numbers are included in sum, mean, median, and standard deviation calculations, though geometric mean requires all positive values.",
    },
    {
      question: "What is the difference between sample and population standard deviation?",
      answer:
        "Sample standard deviation divides squared differences by (N − 1) to provide an unbiased estimate for a subset of data. Population standard deviation divides by N when the dataset contains all items in the entire group.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release of Average & Statistics Engine under CalculatorEngine contract.",
  },
};

export const averageEngine: CalculatorEngine<AverageInput, AverageResult> = {
  id: "average",
  metadata: averageMetadata,
  schema: averageInputSchema,
  defaultInputs: defaultAverageInput,
  fields: averageFields,
  calculate: calculateAverage,
  formatResult: (result: AverageResult) => {
    return {
      raw: result,
      primary: {
        key: "mean",
        label: "Average (Arithmetic Mean)",
        value: result.mean,
        formattedValue: result.mean.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
        subtext: `Based on ${result.count} numbers (Sum: ${result.sum.toLocaleString("en-IN")})`,
        highlight: true,
      },
      secondary: [
        {
          key: "median",
          label: "Median",
          value: result.median,
          formattedValue: result.median.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
        },
        {
          key: "mode",
          label: "Mode",
          value: result.modeString,
          formattedValue: result.modeString,
        },
        {
          key: "sum",
          label: "Sum (Total)",
          value: result.sum,
          formattedValue: result.sum.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
        },
        {
          key: "count",
          label: "Count (N)",
          value: result.count,
          formattedValue: String(result.count),
        },
        {
          key: "range",
          label: `Range (Min: ${result.min}, Max: ${result.max})`,
          value: result.range,
          formattedValue: String(result.range),
        },
        ...(result.geometricMean !== null
          ? [
              {
                key: "geometricMean",
                label: "Geometric Mean",
                value: result.geometricMean,
                formattedValue: result.geometricMean.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
              },
            ]
          : []),
        {
          key: "stdDev",
          label: "Sample Std Dev (s)",
          value: result.sampleStandardDeviation,
          formattedValue: result.sampleStandardDeviation.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
        },
      ],
      summaryText: `The arithmetic mean of the ${result.count} numbers is ${result.mean}, with a median of ${result.median} and total sum of ${result.sum}.`,
    };
  },
};

registerCalculator(averageEngine);
