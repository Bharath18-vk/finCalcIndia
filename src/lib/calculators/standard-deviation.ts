import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export interface StandardDeviationInput {
  dataset: string;
  calculationType: "sample" | "population";
}

export interface DeviationStepRow {
  index: number;
  value: number;
  deviation: number; // x - mean
  squaredDeviation: number; // (x - mean)^2
}

export interface StandardDeviationResult {
  count: number;
  sum: number;
  mean: number;
  sumOfSquares: number;
  sampleVariance: number;
  sampleStdDev: number;
  populationVariance: number;
  populationStdDev: number;
  activeStdDev: number;
  activeVariance: number;
  calculationType: "sample" | "population";
  standardErrorOfMean: number;
  coefficientOfVariation: number;
  range: number;
  min: number;
  max: number;
  confidence68: [number, number];
  confidence95: [number, number];
  confidence99: [number, number];
  tableRows: DeviationStepRow[];
  parsedNumbers: number[];
  steps: string[];
}

export function parseDataset(input: string): number[] {
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

export const standardDeviationInputSchema = z.object({
  dataset: z
    .string({ invalid_type_error: "Please enter numbers" })
    .min(1, "Please provide numbers")
    .refine((val) => parseDataset(val).length >= 2, {
      message: "Please enter at least 2 numbers for standard deviation",
    })
    .refine((val) => parseDataset(val).length <= 1000, {
      message: "Dataset cannot exceed 1,000 numbers",
    }),
  calculationType: z.enum(["sample", "population"]),
});

export const defaultStandardDeviationInput: StandardDeviationInput = {
  dataset: "10, 12, 23, 23, 16, 23, 21, 16",
  calculationType: "sample",
};

/**
 * Pure calculation engine for Standard Deviation & Statistical Dispersion
 */
export function calculateStandardDeviation(input: StandardDeviationInput): StandardDeviationResult {
  const numbers = parseDataset(input.dataset);
  const type = input.calculationType || "sample";
  const steps: string[] = [];

  if (numbers.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      sumOfSquares: 0,
      sampleVariance: 0,
      sampleStdDev: 0,
      populationVariance: 0,
      populationStdDev: 0,
      activeStdDev: 0,
      activeVariance: 0,
      calculationType: type,
      standardErrorOfMean: 0,
      coefficientOfVariation: 0,
      range: 0,
      min: 0,
      max: 0,
      confidence68: [0, 0],
      confidence95: [0, 0],
      confidence99: [0, 0],
      tableRows: [],
      parsedNumbers: [],
      steps: ["No data provided."],
    };
  }

  const count = numbers.length;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const rawMean = sum / count;
  const mean = Number(rawMean.toFixed(4));

  const sorted = [...numbers].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = Number((max - min).toFixed(4));

  let sumOfSquares = 0;
  const tableRows: DeviationStepRow[] = [];

  for (let i = 0; i < numbers.length; i++) {
    const val = numbers[i];
    const dev = Number((val - rawMean).toFixed(4));
    const sqDev = Number(Math.pow(val - rawMean, 2).toFixed(4));
    sumOfSquares += Math.pow(val - rawMean, 2);
    tableRows.push({
      index: i + 1,
      value: val,
      deviation: dev,
      squaredDeviation: sqDev,
    });
  }

  sumOfSquares = Number(sumOfSquares.toFixed(4));

  // Sample Variance & Std Dev (Bessel's correction n - 1)
  const sampleVariance = count > 1 ? Number((sumOfSquares / (count - 1)).toFixed(4)) : 0;
  const sampleStdDev = count > 1 ? Number(Math.sqrt(sumOfSquares / (count - 1)).toFixed(4)) : 0;

  // Population Variance & Std Dev (divided by n)
  const populationVariance = Number((sumOfSquares / count).toFixed(4));
  const populationStdDev = Number(Math.sqrt(sumOfSquares / count).toFixed(4));

  const activeStdDev = type === "sample" ? sampleStdDev : populationStdDev;
  const activeVariance = type === "sample" ? sampleVariance : populationVariance;

  // Standard Error of the Mean (SEM = s / sqrt(n))
  const standardErrorOfMean = Number((sampleStdDev / Math.sqrt(count)).toFixed(4));

  // Coefficient of Variation (CV = s / mean * 100)
  const coefficientOfVariation =
    rawMean !== 0 ? Number(((sampleStdDev / Math.abs(rawMean)) * 100).toFixed(2)) : 0;

  // Empirical Rule Confidence Intervals
  const s = activeStdDev;
  const confidence68: [number, number] = [Number((rawMean - s).toFixed(2)), Number((rawMean + s).toFixed(2))];
  const confidence95: [number, number] = [Number((rawMean - 2 * s).toFixed(2)), Number((rawMean + 2 * s).toFixed(2))];
  const confidence99: [number, number] = [Number((rawMean - 3 * s).toFixed(2)), Number((rawMean + 3 * s).toFixed(2))];

  steps.push(`1. Calculate Mean (x̄): Sum of all values ÷ N = ${sum} ÷ ${count} = ${mean}`);
  steps.push(`2. Calculate Deviations: Subtract mean from each data point (x_i − x̄).`);
  steps.push(`3. Square Each Deviation: (x_i − x̄)², ensuring all values are positive.`);
  steps.push(`4. Sum of Squared Deviations (SS): SS = ${sumOfSquares}`);

  if (type === "sample") {
    steps.push(`5. Sample Variance (s²): SS ÷ (N − 1) = ${sumOfSquares} ÷ ${count - 1} = ${sampleVariance}`);
    steps.push(`6. Sample Standard Deviation (s): √s² = √${sampleVariance} = ${sampleStdDev}`);
  } else {
    steps.push(`5. Population Variance (σ²): SS ÷ N = ${sumOfSquares} ÷ ${count} = ${populationVariance}`);
    steps.push(`6. Population Standard Deviation (σ): √σ² = √${populationVariance} = ${populationStdDev}`);
  }

  return {
    count,
    sum: Number(sum.toFixed(4)),
    mean,
    sumOfSquares,
    sampleVariance,
    sampleStdDev,
    populationVariance,
    populationStdDev,
    activeStdDev,
    activeVariance,
    calculationType: type,
    standardErrorOfMean,
    coefficientOfVariation,
    range,
    min,
    max,
    confidence68,
    confidence95,
    confidence99,
    tableRows,
    parsedNumbers: numbers,
    steps,
  };
}

export const standardDeviationFields: CalculatorField<StandardDeviationInput>[] = [
  {
    name: "dataset",
    label: "Dataset (Values separated by commas or spaces)",
    type: "text",
    defaultValue: "10, 12, 23, 23, 16, 23, 21, 16",
    placeholder: "e.g., 10, 12, 23, 23, 16, 23, 21, 16",
    helperText: "Enter at least 2 numbers separated by commas, spaces, or lines",
    presets: [
      { label: "Sample Data (10, 12, 23, 23, 16, 23, 21, 16)", value: "10, 12, 23, 23, 16, 23, 21, 16" },
      { label: "Class Test (60, 72, 85, 90, 68, 78, 92)", value: "60, 72, 85, 90, 68, 78, 92" },
      { label: "Heights cm (160, 165, 170, 172, 168, 175)", value: "160, 165, 170, 172, 168, 175" },
      { label: "Close Spread (10, 11, 10, 11, 10, 12)", value: "10, 11, 10, 11, 10, 12" },
    ],
  },
  {
    name: "calculationType",
    label: "Formula Type",
    type: "select",
    defaultValue: "sample",
    options: [
      { label: "Sample (s, N - 1) - Default", value: "sample" },
      { label: "Population (σ, N)", value: "population" },
    ],
  },
];

export const standardDeviationMetadata: CalculatorMetadata = {
  id: "standard-deviation",
  name: "Standard Deviation Calculator",
  shortDescription:
    "Calculate sample and population standard deviation, variance, standard error of the mean, sum of squares, and step-by-step deviations table for any dataset.",
  category: "math",
  subcategory: "statistics",
  route: "/standard-deviation-calculator",
  badge: "Math & Statistics",
  directAnswer:
    "Standard deviation measures the spread or dispersion of numbers from their average. For a sample, s = √[ Σ(x − x̄)² / (N − 1) ]. For example, the sample standard deviation of [10, 12, 23, 23, 16, 23, 21, 16] is 5.237, with a mean of 18.0.",
  keywords: [
    "standard deviation calculator",
    "sample standard deviation",
    "population standard deviation",
    "variance calculator",
    "calculate standard deviation",
    "standard error calculator",
    "sum of squares calculator",
    "empirical rule calculator",
  ],
  formula: {
    expression: "s = \\sqrt{\\frac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n - 1}} \\quad | \\quad \\sigma = \\sqrt{\\frac{\\sum_{i=1}^N (x_i - \\mu)^2}{N}}",
    variables: [
      { symbol: "s", label: "Sample Std Dev", description: "Dispersion of a sample subset (uses n - 1 Bessel correction)" },
      { symbol: "\\sigma", label: "Population Std Dev", description: "Dispersion of entire population (uses N)" },
      { symbol: "\\bar{x}", label: "Sample Mean", description: "Arithmetic average of the values" },
      { symbol: "\\sum (x_i - \\bar{x})^2", label: "Sum of Squares (SS)", description: "Total squared deviations from the mean" },
    ],
    steps: [
      { label: "Mean Calculation", expression: "\\bar{x} = \\sum x_i / n", explanation: "Add all data points and divide by sample size." },
      { label: "Deviations", expression: "d_i = x_i - \\bar{x}", explanation: "Subtract the mean from each data point." },
      { label: "Square Deviations", expression: "d_i^2 = (x_i - \\bar{x})^2", explanation: "Square each deviation to remove negative signs." },
      { label: "Variance", expression: "s^2 = \\sum d_i^2 / (n - 1)", explanation: "Sum the squares and divide by degrees of freedom." },
      { label: "Square Root", expression: "s = \\sqrt{s^2}", explanation: "Take the square root to return to original units." },
    ],
    notes: [
      "Use Sample Standard Deviation (s) when your data represents a sample of a larger group.",
      "Use Population Standard Deviation (σ) only when you have collected data from every single member of the population.",
    ],
  },
  faqs: [
    {
      question: "What is the difference between sample and population standard deviation?",
      answer:
        "Sample standard deviation divides by (N − 1) to correct for bias when estimating population parameters from a sample (Bessel's correction). Population standard deviation divides by N because all members of the population are known.",
    },
    {
      question: "What does a low vs high standard deviation mean?",
      answer:
        "A low standard deviation means data points are clustered closely around the mean (low volatility). A high standard deviation means values are spread out over a wide range (high volatility or unpredictability).",
    },
    {
      question: "What is the 68-95-99.7 Empirical Rule?",
      answer:
        "In a normal bell curve distribution, approximately 68.27% of values fall within 1 standard deviation of the mean, 95.45% within 2 standard deviations, and 99.73% within 3 standard deviations.",
    },
    {
      question: "Can standard deviation ever be negative?",
      answer:
        "No. Because deviations are squared before summing, variance and standard deviation are always greater than or equal to zero. It equals 0 only if all numbers in the dataset are identical.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const standardDeviationEngine: CalculatorEngine<StandardDeviationInput, StandardDeviationResult> = {
  id: "standard-deviation",
  metadata: standardDeviationMetadata,
  schema: standardDeviationInputSchema,
  defaultInputs: defaultStandardDeviationInput,
  fields: standardDeviationFields,
  calculate: calculateStandardDeviation,
  formatResult: (result: StandardDeviationResult) => {
    const isSample = result.calculationType === "sample";
    return {
      raw: result,
      primary: {
        key: "stdDev",
        label: isSample ? "Sample Standard Deviation (s)" : "Population Standard Deviation (σ)",
        value: result.activeStdDev,
        formattedValue: String(result.activeStdDev),
        subtext: `Variance: ${result.activeVariance} | Mean: ${result.mean} (N = ${result.count})`,
        highlight: true,
      },
      secondary: [
        {
          key: "variance",
          label: isSample ? "Sample Variance (s²)" : "Population Variance (σ²)",
          value: result.activeVariance,
          formattedValue: String(result.activeVariance),
        },
        {
          key: "mean",
          label: "Arithmetic Mean (x̄)",
          value: result.mean,
          formattedValue: String(result.mean),
        },
        {
          key: "sumSquares",
          label: "Sum of Squares (SS)",
          value: result.sumOfSquares,
          formattedValue: String(result.sumOfSquares),
        },
        {
          key: "sem",
          label: "Standard Error (SEM)",
          value: result.standardErrorOfMean,
          formattedValue: String(result.standardErrorOfMean),
        },
        {
          key: "cv",
          label: "Coefficient of Variation (CV)",
          value: result.coefficientOfVariation,
          formattedValue: `${result.coefficientOfVariation}%`,
        },
        {
          key: "alternate",
          label: isSample ? "Population Std Dev (σ)" : "Sample Std Dev (s)",
          value: isSample ? result.populationStdDev : result.sampleStdDev,
          formattedValue: String(isSample ? result.populationStdDev : result.sampleStdDev),
        },
      ],
      summaryText: `For the ${result.count} data values, the ${result.calculationType} standard deviation is ${result.activeStdDev} with a variance of ${result.activeVariance} and mean of ${result.mean}.`,
    };
  },
};

registerCalculator(standardDeviationEngine);
