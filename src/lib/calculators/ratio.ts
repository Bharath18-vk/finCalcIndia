import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export type RatioMode = "simplify" | "proportion" | "divide";

export interface RatioInput {
  mode: RatioMode;
  a: number;
  b: number;
  c?: number;
  total?: number;
}

export interface RatioResult {
  mode: RatioMode;
  a: number;
  b: number;
  // Simplify fields
  simplifiedA: number;
  simplifiedB: number;
  simplifiedRatio: string;
  gcdValue: number;
  decimalValue: number;
  unitRatio1: string; // 1 : N
  unitRatio2: string; // N : 1
  percentA: number;
  percentB: number;

  // Proportion fields
  c?: number;
  solvedX?: number;
  solvedProportion?: string;
  scaleFactor?: number;

  // Divide Total fields
  total?: number;
  shareA?: number;
  shareB?: number;

  steps: string[];
}

/**
 * Greatest common divisor using Euclidean algorithm
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Reduce a ratio of integers or floating decimals to simplest integer terms
 */
export function reduceRatio(a: number, b: number): { simplifiedA: number; simplifiedB: number; divisor: number } {
  if (a <= 0 || b <= 0) {
    return { simplifiedA: a, simplifiedB: b, divisor: 1 };
  }

  // Handle floating point decimals by shifting powers of 10
  const getDecimals = (n: number) => {
    const str = n.toString();
    const idx = str.indexOf(".");
    return idx >= 0 ? str.length - idx - 1 : 0;
  };

  const decA = getDecimals(a);
  const decB = getDecimals(b);
  const multiplier = Math.pow(10, Math.min(6, Math.max(decA, decB)));

  const intA = Math.round(a * multiplier);
  const intB = Math.round(b * multiplier);

  const divisor = gcd(intA, intB);
  return {
    simplifiedA: intA / divisor,
    simplifiedB: intB / divisor,
    divisor,
  };
}

export const ratioInputSchema = z.object({
  mode: z.enum(["simplify", "proportion", "divide"]),
  a: z
    .number({ invalid_type_error: "Term A must be a number" })
    .min(0.000001, "Term A must be greater than 0")
    .max(1000000000, "Term A cannot exceed 1,000,000,000"),
  b: z
    .number({ invalid_type_error: "Term B must be a number" })
    .min(0.000001, "Term B must be greater than 0")
    .max(1000000000, "Term B cannot exceed 1,000,000,000"),
  c: z
    .number({ invalid_type_error: "Term C must be a number" })
    .min(0.000001, "Term C must be greater than 0")
    .max(1000000000, "Term C cannot exceed 1,000,000,000")
    .optional(),
  total: z
    .number({ invalid_type_error: "Total must be a number" })
    .min(0, "Total cannot be negative")
    .max(10000000000, "Total cannot exceed 10,000,000,000")
    .optional(),
});

export const defaultRatioInput: RatioInput = {
  mode: "simplify",
  a: 12,
  b: 18,
  c: 1920,
  total: 50000,
};

/**
 * Pure calculation engine for Ratio Simplification, Proportions & Partitions
 */
export function calculateRatio(input: RatioInput): RatioResult {
  const mode = input.mode || "simplify";
  const a = Math.max(0.000001, Number(input.a) || 1);
  const b = Math.max(0.000001, Number(input.b) || 1);
  const c = input.c !== undefined ? Math.max(0.000001, Number(input.c)) : 1920;
  const total = input.total !== undefined ? Math.max(0, Number(input.total)) : 50000;

  const { simplifiedA, simplifiedB, divisor } = reduceRatio(a, b);
  const decimalValue = Number((a / b).toFixed(4));
  const sumTerms = a + b;
  const percentA = Number(((a / sumTerms) * 100).toFixed(2));
  const percentB = Number(((b / sumTerms) * 100).toFixed(2));

  const unit1 = Number((b / a).toFixed(4));
  const unit2 = Number((a / b).toFixed(4));
  const unitRatio1 = `1 : ${unit1}`;
  const unitRatio2 = `${unit2} : 1`;

  const steps: string[] = [];

  // Mode 1: Simplify
  if (mode === "simplify") {
    steps.push(`Given ratio: ${a} : ${b}`);
    if (divisor > 1) {
      steps.push(`Find Greatest Common Divisor (GCD): GCD = ${divisor}`);
      steps.push(`Divide both terms by ${divisor}: (${a} ÷ ${divisor}) : (${b} ÷ ${divisor}) = ${simplifiedA} : ${simplifiedB}`);
    } else {
      steps.push(`The terms have no common factor other than 1, so the ratio is already in simplest form: ${simplifiedA} : ${simplifiedB}`);
    }
    steps.push(`Decimal fraction: ${a} ÷ ${b} = ${decimalValue}`);
    steps.push(`Percentage breakdown: Term A is ${percentA}% of total, Term B is ${percentB}% of total.`);
  }

  // Mode 2: Proportion (A : B = C : X)
  let solvedX: number | undefined;
  let solvedProportion: string | undefined;
  let scaleFactor: number | undefined;

  if (mode === "proportion") {
    // Cross multiplication: A / B = C / X => X = (B * C) / A
    solvedX = Number(((b * c) / a).toFixed(4));
    scaleFactor = Number((c / a).toFixed(4));
    solvedProportion = `${a} : ${b} = ${c} : ${solvedX}`;

    steps.push(`Proportion equation: ${a} / ${b} = ${c} / X`);
    steps.push(`Cross multiply: ${a} × X = ${b} × ${c}`);
    steps.push(`Solve for X: X = (${b} × ${c}) ÷ ${a}`);
    steps.push(`Calculate: X = ${b * c} ÷ ${a} = ${solvedX}`);
    steps.push(`Completed proportion: ${solvedProportion}`);
  }

  // Mode 3: Divide Total
  let shareA: number | undefined;
  let shareB: number | undefined;

  if (mode === "divide") {
    const totalParts = a + b;
    shareA = Math.round((total * a) / totalParts);
    shareB = Math.round(total - shareA);

    steps.push(`Total amount to divide: ${total}`);
    steps.push(`Ratio: ${a} : ${b} (Total parts = ${a} + ${b} = ${totalParts})`);
    steps.push(`Share A = ${total} × (${a} ÷ ${totalParts}) = ${shareA} (${percentA}%)`);
    steps.push(`Share B = ${total} × (${b} ÷ ${totalParts}) = ${shareB} (${percentB}%)`);
  }

  return {
    mode,
    a,
    b,
    simplifiedA,
    simplifiedB,
    simplifiedRatio: `${simplifiedA} : ${simplifiedB}`,
    gcdValue: divisor,
    decimalValue,
    unitRatio1,
    unitRatio2,
    percentA,
    percentB,
    c,
    solvedX,
    solvedProportion,
    scaleFactor,
    total,
    shareA,
    shareB,
    steps,
  };
}

export const ratioFields: CalculatorField<RatioInput>[] = [
  {
    name: "mode",
    label: "Calculation Mode",
    type: "select",
    defaultValue: "simplify",
    options: [
      { label: "Simplify Ratio (A : B)", value: "simplify" },
      { label: "Solve Proportion (A : B = C : X)", value: "proportion" },
      { label: "Divide Total by Ratio", value: "divide" },
    ],
  },
  {
    name: "a",
    label: "First Term (A)",
    type: "number",
    defaultValue: 12,
    min: 0.01,
    max: 100000000,
    step: 1,
    presets: [
      { label: "4", value: 4 },
      { label: "12", value: 12 },
      { label: "16", value: 16 },
      { label: "1920", value: 1920 },
    ],
    helperText: "First quantity or antecedent in ratio",
  },
  {
    name: "b",
    label: "Second Term (B)",
    type: "number",
    defaultValue: 18,
    min: 0.01,
    max: 100000000,
    step: 1,
    presets: [
      { label: "3", value: 3 },
      { label: "9", value: 9 },
      { label: "18", value: 18 },
      { label: "1080", value: 1080 },
    ],
    helperText: "Second quantity or consequent in ratio",
  },
  {
    name: "c",
    label: "Third Term (C) [For Proportions]",
    type: "number",
    defaultValue: 1920,
    min: 0.01,
    max: 100000000,
    step: 1,
    helperText: "Known term in proportion A : B = C : X",
  },
  {
    name: "total",
    label: "Total Amount [For Divide Mode]",
    type: "currency",
    defaultValue: 50000,
    min: 0,
    max: 1000000000,
    step: 1000,
    helperText: "Total quantity or money to split according to ratio A : B",
  },
];

export const ratioMetadata: CalculatorMetadata = {
  id: "ratio",
  name: "Ratio Calculator",
  shortDescription:
    "Simplify ratios to lowest terms, solve proportions (A : B = C : X), scale aspect ratios, and divide quantities or money into proportional shares.",
  category: "math",
  subcategory: "arithmetic",
  route: "/ratio-calculator",
  badge: "Math & Everyday",
  directAnswer:
    "To simplify a ratio A : B, divide both numbers by their Greatest Common Divisor (GCD). For example, 12 : 18 simplifies to 2 : 3 (dividing both by 6). To solve a proportion A : B = C : X, cross-multiply: X = (B × C) ÷ A.",
  keywords: [
    "ratio calculator",
    "simplify ratio",
    "proportion calculator",
    "aspect ratio calculator",
    "divide ratio calculator",
    "ratio solver",
    "scale ratio",
  ],
  formula: {
    expression: "\\text{Simplify: } \\frac{A}{\\gcd(A,B)} : \\frac{B}{\\gcd(A,B)} \\quad | \\quad \\text{Proportion: } X = \\frac{B \\times C}{A} \\quad | \\quad \\text{Share } A = \\text{Total} \\times \\frac{A}{A + B}",
    variables: [
      { symbol: "A", label: "Term A", description: "First ratio term" },
      { symbol: "B", label: "Term B", description: "Second ratio term" },
      { symbol: "C", label: "Term C", description: "Known third term in proportion" },
      { symbol: "X", label: "Unknown X", description: "Solved fourth term in proportion" },
      { symbol: "\\text{Total}", label: "Total Amount", description: "Total quantity to split proportionally" },
    ],
    steps: [
      { label: "Find GCD", expression: "\\gcd(A, B)", explanation: "Identify greatest common divisor of both terms." },
      { label: "Simplify", expression: "A/\\gcd : B/\\gcd", explanation: "Divide both terms by GCD to obtain simplest integer ratio." },
      { label: "Solve Unknown", expression: "X = (B * C) / A", explanation: "Cross-multiply to find missing proportion value." },
      { label: "Divide Total", expression: "Share_A = Total * (A / (A+B))", explanation: "Multiply total by each term's fractional share." },
    ],
    notes: [
      "Ratio terms can be whole numbers or decimals; decimals are converted to integer equivalents automatically.",
      "In aspect ratios, 16:9 and 4:3 are standard video and display formats.",
    ],
  },
  faqs: [
    {
      question: "How do you simplify a ratio?",
      answer:
        "To simplify a ratio, find the Greatest Common Divisor (GCD) of both numbers and divide each number by that GCD. For instance, in 24 : 36, the GCD is 12, so dividing both by 12 yields 2 : 3.",
    },
    {
      question: "How do you solve for an unknown in a proportion?",
      answer:
        "Set up the proportion as equivalent fractions (A/B = C/X). Cross multiply to get A × X = B × C, then divide by A: X = (B × C) ÷ A.",
    },
    {
      question: "How do you divide an amount into a ratio?",
      answer:
        "Add the parts of the ratio together (e.g. 3 + 2 = 5). Then divide the total amount by 5 to find the value of one part, and multiply by each ratio number: Part 1 = Total × (3/5), Part 2 = Total × (2/5).",
    },
    {
      question: "Can ratios have decimals?",
      answer:
        "Yes, ratios can contain decimal numbers. For example, 1.5 : 2.5 multiplies by 10 to 15 : 25, which simplifies directly to 3 : 5.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const ratioEngine: CalculatorEngine<RatioInput, RatioResult> = {
  id: "ratio",
  metadata: ratioMetadata,
  schema: ratioInputSchema,
  defaultInputs: defaultRatioInput,
  fields: ratioFields,
  calculate: calculateRatio,
  formatResult: (result: RatioResult) => {
    if (result.mode === "proportion") {
      return {
        raw: result,
        primary: {
          key: "solvedX",
          label: "Unknown Term (X)",
          value: result.solvedX || 0,
          formattedValue: String(result.solvedX),
          subtext: `Full Proportion: ${result.solvedProportion}`,
          highlight: true,
        },
        secondary: [
          {
            key: "proportion",
            label: "Completed Proportion",
            value: result.solvedProportion || "",
            formattedValue: result.solvedProportion,
          },
          {
            key: "scaleFactor",
            label: "Scale Factor (C ÷ A)",
            value: result.scaleFactor || 0,
            formattedValue: String(result.scaleFactor),
          },
          {
            key: "baseRatio",
            label: "Simplified Base Ratio",
            value: result.simplifiedRatio,
            formattedValue: result.simplifiedRatio,
          },
        ],
        summaryText: `In the proportion ${result.a} : ${result.b} = ${result.c} : X, the missing value X is ${result.solvedX}.`,
      };
    }

    if (result.mode === "divide") {
      return {
        raw: result,
        primary: {
          key: "shareA",
          label: `Share A (${result.percentA}%)`,
          value: result.shareA || 0,
          formattedValue: formatINR(result.shareA || 0),
          subtext: `Share B: ${formatINR(result.shareB || 0)} (${result.percentB}%)`,
          highlight: true,
        },
        secondary: [
          {
            key: "shareB",
            label: `Share B (${result.percentB}%)`,
            value: result.shareB || 0,
            formattedValue: formatINR(result.shareB || 0),
          },
          {
            key: "total",
            label: "Total Divided",
            value: result.total || 0,
            formattedValue: formatINR(result.total || 0),
          },
          {
            key: "ratio",
            label: "Ratio Applied",
            value: `${result.a} : ${result.b}`,
            formattedValue: `${result.simplifiedRatio} (${result.a}:${result.b})`,
          },
        ],
        summaryText: `Dividing ${formatINR(result.total || 0)} in ratio ${result.a} : ${result.b} yields ${formatINR(result.shareA || 0)} and ${formatINR(result.shareB || 0)}.`,
      };
    }

    // Default Simplify mode
    return {
      raw: result,
      primary: {
        key: "simplifiedRatio",
        label: "Simplified Ratio",
        value: result.simplifiedRatio,
        formattedValue: result.simplifiedRatio,
        subtext: `GCD = ${result.gcdValue} | Decimal: ${result.decimalValue}`,
        highlight: true,
      },
      secondary: [
        {
          key: "decimal",
          label: "Decimal Value (A ÷ B)",
          value: result.decimalValue,
          formattedValue: String(result.decimalValue),
        },
        {
          key: "unit1",
          label: "Unit Ratio (1 : N)",
          value: result.unitRatio1,
          formattedValue: result.unitRatio1,
        },
        {
          key: "percentages",
          label: "Percentage Breakdown",
          value: 0,
          formattedValue: `${result.percentA}% : ${result.percentB}%`,
        },
        {
          key: "gcd",
          label: "Greatest Common Divisor",
          value: result.gcdValue,
          formattedValue: String(result.gcdValue),
        },
      ],
      summaryText: `The ratio ${result.a} : ${result.b} simplifies to ${result.simplifiedRatio} with a GCD of ${result.gcdValue}.`,
    };
  },
};

registerCalculator(ratioEngine);
