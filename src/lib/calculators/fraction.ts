import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
  CalculatorResultModel,
} from "./types";
import { registerCalculator } from "./registry";

export type FractionOperator = "+" | "-" | "*" | "/";

export interface FractionInput {
  num1: number;
  den1: number;
  operator: FractionOperator;
  num2: number;
  den2: number;
}

export interface FractionResult {
  num1: number;
  den1: number;
  operator: FractionOperator;
  num2: number;
  den2: number;
  resultNum: number;
  resultDen: number;
  formattedResult: string;
  mixedNumber?: string;
  decimalValue: number;
  formattedDecimal: string;
  detailedSteps: string[];
  isError?: boolean;
  errorMessage?: string;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

export const fractionInputSchema = z
  .object({
    num1: z.number({ invalid_type_error: "Numerator 1 must be an integer" }).int(),
    den1: z.number({ invalid_type_error: "Denominator 1 must be an integer" }).int().refine((val) => val !== 0, {
      message: "Denominator 1 cannot be 0",
    }),
    operator: z.enum(["+", "-", "*", "/"], {
      errorMap: () => ({ message: "Operator must be +, -, *, or /" }),
    }),
    num2: z.number({ invalid_type_error: "Numerator 2 must be an integer" }).int(),
    den2: z.number({ invalid_type_error: "Denominator 2 must be an integer" }).int().refine((val) => val !== 0, {
      message: "Denominator 2 cannot be 0",
    }),
  })
  .refine(
    (data) => {
      if (data.operator === "/" && data.num2 === 0) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot divide by a fraction with numerator 0 (division by zero)",
      path: ["num2"],
    }
  );

export const defaultFractionInput: FractionInput = {
  num1: 1,
  den1: 2,
  operator: "+",
  num2: 1,
  den2: 3,
};

/**
 * Pure calculation engine for Fraction Arithmetic
 */
export function calculateFraction(input: FractionInput): FractionResult {
  const n1 = Math.round(Number(input.num1) || 0);
  const d1 = Math.round(Number(input.den1)) === 0 ? 1 : Math.round(Number(input.den1) || 1);
  const op = input.operator || "+";
  const n2 = Math.round(Number(input.num2) || 0);
  const d2 = Math.round(Number(input.den2)) === 0 ? 1 : Math.round(Number(input.den2) || 1);

  if (d1 === 0 || d2 === 0) {
    return {
      num1: n1,
      den1: d1,
      operator: op,
      num2: n2,
      den2: d2,
      resultNum: 0,
      resultDen: 1,
      formattedResult: "Undefined",
      decimalValue: 0,
      formattedDecimal: "Undefined",
      detailedSteps: ["Denominator cannot be 0."],
      isError: true,
      errorMessage: "Denominator cannot be 0.",
    };
  }

  if (op === "/" && n2 === 0) {
    return {
      num1: n1,
      den1: d1,
      operator: op,
      num2: n2,
      den2: d2,
      resultNum: 0,
      resultDen: 1,
      formattedResult: "Undefined",
      decimalValue: 0,
      formattedDecimal: "Undefined",
      detailedSteps: ["Cannot divide by 0 (the divisor numerator is 0)."],
      isError: true,
      errorMessage: "Cannot divide by zero.",
    };
  }

  let rawNum = 0;
  let rawDen = 1;
  const steps: string[] = [];

  if (op === "+") {
    const commonDen = lcm(d1, d2);
    const m1 = commonDen / d1;
    const m2 = commonDen / d2;
    rawNum = n1 * m1 + n2 * m2;
    rawDen = commonDen;

    steps.push(`Step 1: Find Least Common Multiple (LCM) of denominators ${d1} and ${d2} = ${commonDen}.`);
    steps.push(`Step 2: Adjust numerators: (${n1} × ${m1}) + (${n2} × ${m2}) = ${n1 * m1} + ${n2 * m2} = ${rawNum}.`);
    steps.push(`Step 3: Combine over common denominator: ${rawNum} / ${rawDen}.`);
  } else if (op === "-") {
    const commonDen = lcm(d1, d2);
    const m1 = commonDen / d1;
    const m2 = commonDen / d2;
    rawNum = n1 * m1 - n2 * m2;
    rawDen = commonDen;

    steps.push(`Step 1: Find Least Common Multiple (LCM) of denominators ${d1} and ${d2} = ${commonDen}.`);
    steps.push(`Step 2: Adjust numerators: (${n1} × ${m1}) − (${n2} × ${m2}) = ${n1 * m1} − ${n2 * m2} = ${rawNum}.`);
    steps.push(`Step 3: Combine over common denominator: ${rawNum} / ${rawDen}.`);
  } else if (op === "*") {
    rawNum = n1 * n2;
    rawDen = d1 * d2;

    steps.push(`Step 1: Multiply numerators: ${n1} × ${n2} = ${rawNum}.`);
    steps.push(`Step 2: Multiply denominators: ${d1} × ${d2} = ${rawDen}.`);
    steps.push(`Step 3: Form combined fraction: ${rawNum} / ${rawDen}.`);
  } else if (op === "/") {
    rawNum = n1 * d2;
    rawDen = d1 * n2;

    steps.push(`Step 1: Invert the second fraction (reciprocal): ${d2} / ${n2}.`);
    steps.push(`Step 2: Multiply first fraction by reciprocal: (${n1} × ${d2}) / (${d1} × ${n2}) = ${rawNum} / ${rawDen}.`);
  }

  // Ensure denominator is positive
  if (rawDen < 0) {
    rawNum = -rawNum;
    rawDen = -rawDen;
  }

  // Reduce via GCD
  const commonDiv = gcd(rawNum, rawDen);
  const redNum = rawNum / commonDiv;
  const redDen = rawDen / commonDiv;

  if (commonDiv > 1) {
    steps.push(`Step 4: Reduce to lowest terms by dividing by GCD(${Math.abs(rawNum)}, ${rawDen}) = ${commonDiv}: ${rawNum} ÷ ${commonDiv} / ${rawDen} ÷ ${commonDiv} = ${redNum} / ${redDen}.`);
  } else {
    steps.push(`Step 4: Fraction is already in its simplest irreducible form: ${redNum} / ${redDen}.`);
  }

  const decimal = redDen !== 0 ? redNum / redDen : 0;
  const formattedDecimal = Number(decimal.toFixed(6)).toString();

  // Mixed number formatting if improper fraction (|num| > den and den > 1)
  let mixedNumber: string | undefined;
  if (Math.abs(redNum) > redDen && redDen > 1) {
    const whole = Math.trunc(redNum / redDen);
    const rem = Math.abs(redNum % redDen);
    if (rem > 0) {
      mixedNumber = `${whole} ${rem}/${redDen}`;
      steps.push(`Step 5: Convert improper fraction to mixed number: ${redNum} ÷ ${redDen} = ${whole} with remainder ${rem} → ${mixedNumber}.`);
    }
  }

  const formattedResult = redDen === 1 ? `${redNum}` : `${redNum}/${redDen}`;

  return {
    num1: n1,
    den1: d1,
    operator: op,
    num2: n2,
    den2: d2,
    resultNum: redNum,
    resultDen: redDen,
    formattedResult,
    mixedNumber,
    decimalValue: decimal,
    formattedDecimal,
    detailedSteps: steps,
  };
}

export const fractionFields: CalculatorField<FractionInput>[] = [
  {
    name: "num1",
    label: "Numerator 1",
    type: "number",
    defaultValue: 1,
    step: 1,
    helperText: "Top number of the first fraction",
  },
  {
    name: "den1",
    label: "Denominator 1",
    type: "number",
    defaultValue: 2,
    step: 1,
    helperText: "Bottom number of the first fraction (cannot be 0)",
  },
  {
    name: "operator",
    label: "Operation",
    type: "select",
    defaultValue: "+",
    options: [
      { label: "+ (Addition)", value: "+" },
      { label: "− (Subtraction)", value: "-" },
      { label: "× (Multiplication)", value: "*" },
      { label: "÷ (Division)", value: "/" },
    ],
    helperText: "Choose arithmetic operation",
  },
  {
    name: "num2",
    label: "Numerator 2",
    type: "number",
    defaultValue: 1,
    step: 1,
    helperText: "Top number of the second fraction",
  },
  {
    name: "den2",
    label: "Denominator 2",
    type: "number",
    defaultValue: 3,
    step: 1,
    helperText: "Bottom number of the second fraction (cannot be 0)",
  },
];

export const fractionMetadata: CalculatorMetadata = {
  id: "fraction",
  name: "Fraction Calculator",
  shortDescription:
    "Add, subtract, multiply, and divide fractions with step-by-step solutions, simplification to lowest terms, mixed number conversions, and decimal values.",
  category: "math",
  subcategory: "arithmetic",
  route: "/fraction-calculator",
  badge: "Math & Arithmetic",
  directAnswer:
    "To add or subtract fractions, find a common denominator, adjust the numerators, and reduce using the greatest common divisor (e.g., 1/2 + 1/3 = 5/6). To multiply, multiply numerators and denominators directly (e.g., 1/2 × 1/3 = 1/6). To divide, multiply by the reciprocal (e.g., 1/2 ÷ 1/3 = 3/2 = 1 1/2).",
  keywords: [
    "fraction calculator",
    "adding fractions calculator",
    "subtracting fractions",
    "multiplying fractions",
    "dividing fractions",
    "fraction to decimal",
    "mixed number calculator",
    "simplify fractions",
  ],
  formula: {
    expression: "Addition: (n₁ / d₁) + (n₂ / d₂) = (n₁×d₂ + n₂×d₁) / (d₁×d₂)  |  Multiplication: (n₁ / d₁) × (n₂ / d₂) = (n₁×n₂) / (d₁×d₂)  |  Division: (n₁ / d₁) ÷ (n₂ / d₂) = (n₁×d₂) / (d₁×n₂)",
    variables: [
      { symbol: "n₁, n₂", label: "Numerators", description: "Top integers of the fractions" },
      { symbol: "d₁, d₂", label: "Denominators", description: "Bottom non-zero integers of the fractions" },
    ],
    steps: [
      { label: "Addition/Subtraction", expression: "(n₁×d₂ ± n₂×d₁) / (d₁×d₂)", explanation: "Finds common denominator and adds/subtracts adjusted numerators." },
      { label: "Multiplication", expression: "(n₁×n₂) / (d₁×d₂)", explanation: "Multiplies numerators together and denominators together." },
      { label: "Division", expression: "(n₁×d₂) / (d₁×n₂)", explanation: "Multiplies the first fraction by the reciprocal of the second." },
      { label: "Simplification", expression: "n ÷ GCD(n, d) and d ÷ GCD(n, d)", explanation: "Reduces to lowest terms using the Greatest Common Divisor." },
    ],
    notes: [
      "Denominators can never be zero.",
      "Improper fractions (numerator > denominator) are converted to mixed numbers.",
    ],
  },
  faqs: [
    {
      question: "How do you add fractions with different denominators?",
      answer:
        "Find the Least Common Denominator (LCD) of the two fractions. Multiply the numerator and denominator of each fraction so both have the LCD as their bottom number. Add the new numerators together while keeping the denominator unchanged, then simplify by dividing by the GCD.",
    },
    {
      question: "How do you multiply fractions?",
      answer:
        "Multiply the top numbers (numerators) together, and multiply the bottom numbers (denominators) together: (a/b) × (c/d) = (a×c) / (b×d). Finally, simplify the resulting fraction to its lowest terms.",
    },
    {
      question: "How do you divide fractions?",
      answer:
        "Invert the second fraction to find its reciprocal (swap numerator and denominator), then multiply: (a/b) ÷ (c/d) = (a/b) × (d/c) = (a×d) / (b×c).",
    },
    {
      question: "What is the difference between an improper fraction and a mixed number?",
      answer:
        "An improper fraction has a numerator greater than or equal to its denominator (like 7/3). A mixed number expresses the same amount as a whole number plus a proper fraction (like 2 1/3).",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release of Fraction Calculator under CalculatorEngine contract.",
  },
};

export const fractionEngine: CalculatorEngine<FractionInput, FractionResult> = {
  id: "fraction",
  metadata: fractionMetadata,
  schema: fractionInputSchema,
  defaultInputs: defaultFractionInput,
  fields: fractionFields,
  calculate: calculateFraction,
  formatResult: (result: FractionResult) => {
    return {
      raw: result,
      primary: {
        key: "primary",
        label: "Resulting Fraction",
        value: result.decimalValue,
        formattedValue: result.formattedResult,
        subtext: result.mixedNumber ? `Mixed Number: ${result.mixedNumber}` : `Decimal: ${result.formattedDecimal}`,
        highlight: true,
      },
      secondary: [
        {
          key: "decimal",
          label: "Decimal Equivalent",
          value: result.decimalValue,
          formattedValue: result.formattedDecimal,
        },
        ...(result.mixedNumber
          ? [
              {
                key: "mixed",
                label: "Mixed Number",
                value: result.mixedNumber,
                formattedValue: result.mixedNumber,
              },
            ]
          : []),
      ],
      summaryText: result.isError ? result.errorMessage : `${result.num1}/${result.den1} ${result.operator} ${result.num2}/${result.den2} = ${result.formattedResult}`,
    };
  },
};

registerCalculator(fractionEngine);
