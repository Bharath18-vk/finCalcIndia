import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export type RootExponentMode = "root" | "exponent";

export interface SquareRootInput {
  mode: RootExponentMode;
  // Root mode inputs
  radicand?: number; // x in n-th root of x
  rootDegree?: number; // n in n-th root of x (default 2)
  // Exponent mode inputs
  base?: number; // x in x^y
  exponent?: number; // y in x^y
}

export interface SquareRootResult {
  mode: RootExponentMode;
  // Primary result
  primaryValue: number;
  primaryFormatted: string;

  // Root fields
  radicand?: number;
  rootDegree?: number;
  isPerfectRoot?: boolean;
  simplifiedRadical?: string; // e.g. "6√2" or "12"
  outerFactor?: number;
  innerRadicand?: number;

  // Exponent fields
  base?: number;
  exponent?: number;
  scientificNotation?: string;
  inversePower?: number; // 1 / x^y

  steps: string[];
}

/**
 * Simplify radical √x into k√r where k^2 is largest square factor dividing x
 */
export function simplifySquareRoot(n: number): { outer: number; inner: number; formatted: string; isPerfect: boolean } {
  if (n <= 0) return { outer: 0, inner: 0, formatted: "0", isPerfect: true };
  if (!Number.isInteger(n)) {
    return { outer: 1, inner: n, formatted: `√${n}`, isPerfect: false };
  }

  let outer = 1;
  let inner = n;

  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    const sq = i * i;
    if (inner % sq === 0) {
      outer = i;
      inner = inner / sq;
      break;
    }
  }

  const isPerfect = inner === 1;
  let formatted = "";
  if (isPerfect) {
    formatted = `${outer}`;
  } else if (outer > 1) {
    formatted = `${outer}√${inner}`;
  } else {
    formatted = `√${n}`;
  }

  return { outer, inner, formatted, isPerfect };
}

export const squareRootInputSchema = z.object({
  mode: z.enum(["root", "exponent"]),
  radicand: z
    .number({ invalid_type_error: "Number must be numeric" })
    .min(0, "Radicand cannot be negative for real roots")
    .max(1000000000000, "Number is too large")
    .optional(),
  rootDegree: z
    .number({ invalid_type_error: "Root degree must be an integer" })
    .int("Root degree must be an integer")
    .min(2, "Root degree must be at least 2")
    .max(100, "Maximum root degree is 100")
    .optional(),
  base: z
    .number({ invalid_type_error: "Base must be numeric" })
    .min(-1000000, "Base too small")
    .max(1000000, "Base too large")
    .optional(),
  exponent: z
    .number({ invalid_type_error: "Exponent must be numeric" })
    .min(-100, "Exponent too small")
    .max(100, "Exponent too large")
    .optional(),
});

export const defaultSquareRootInput: SquareRootInput = {
  mode: "root",
  radicand: 144,
  rootDegree: 2,
  base: 2,
  exponent: 10,
};

/**
 * Pure calculation engine for Roots & Exponents
 */
export function calculateSquareRoot(input: SquareRootInput): SquareRootResult {
  const mode = input.mode || "root";
  const steps: string[] = [];

  if (mode === "exponent") {
    const b = input.base !== undefined ? input.base : 2;
    const exp = input.exponent !== undefined ? input.exponent : 10;

    const rawVal = Math.pow(b, exp);
    const primaryValue = Number.isFinite(rawVal) ? Number(rawVal.toFixed(6)) : 0;
    const scientificNotation = rawVal.toExponential(4);
    const inversePower = rawVal !== 0 ? Number((1 / rawVal).toFixed(6)) : 0;

    steps.push(`Base: ${b}, Exponent: ${exp}`);
    steps.push(`Expression: ${b}^${exp}`);
    if (exp === 0) {
      steps.push(`Any non-zero number to the power of 0 equals 1.`);
    } else if (exp < 0) {
      steps.push(`Negative exponent rule: ${b}^${exp} = 1 / (${b}^${Math.abs(exp)}) = ${primaryValue}`);
    } else {
      steps.push(`Multiply base ${b} by itself ${exp} times = ${primaryValue}`);
    }

    const primaryFormatted =
      Math.abs(primaryValue) >= 1e9 || (Math.abs(primaryValue) > 0 && Math.abs(primaryValue) < 1e-4)
        ? scientificNotation
        : primaryValue.toLocaleString("en-IN", { maximumFractionDigits: 6 });

    return {
      mode,
      primaryValue,
      primaryFormatted,
      base: b,
      exponent: exp,
      scientificNotation,
      inversePower,
      steps,
    };
  }

  // Root mode
  const rad = Math.max(0, input.radicand !== undefined ? input.radicand : 144);
  const deg = Math.max(2, Math.round(input.rootDegree !== undefined ? input.rootDegree : 2));

  const rawVal = Math.pow(rad, 1 / deg);
  const primaryValue = Number(rawVal.toFixed(6));

  let isPerfectRoot = false;
  let simplifiedRadical = `√${rad}`;
  let outerFactor = 1;
  let innerRadicand = rad;

  if (deg === 2) {
    const sim = simplifySquareRoot(rad);
    isPerfectRoot = sim.isPerfect;
    simplifiedRadical = sim.formatted;
    outerFactor = sim.outer;
    innerRadicand = sim.inner;

    steps.push(`Expression: √${rad}`);
    if (isPerfectRoot) {
      steps.push(`${rad} is a perfect square: ${outerFactor}² = ${rad}`);
      steps.push(`Principal square root: √${rad} = ${outerFactor}`);
    } else {
      steps.push(`Largest square factor of ${rad} is ${outerFactor}² = ${outerFactor * outerFactor}`);
      steps.push(`Radical simplification: √${rad} = √(${outerFactor * outerFactor} × ${innerRadicand}) = ${simplifiedRadical}`);
      steps.push(`Decimal approximation: ${primaryValue}`);
    }
  } else {
    // Higher degree roots
    const rounded = Math.round(rawVal);
    if (Math.pow(rounded, deg) === rad) {
      isPerfectRoot = true;
      simplifiedRadical = `${rounded}`;
      steps.push(`${rad} is a perfect ${deg}-th root: ${rounded}^${deg} = ${rad}`);
      steps.push(`Principal root = ${rounded}`);
    } else {
      isPerfectRoot = false;
      simplifiedRadical = `${deg}√${rad}`;
      steps.push(`Expression: ${deg}√${rad} = ${rad}^(1/${deg}) = ${primaryValue}`);
    }
  }

  return {
    mode,
    primaryValue,
    primaryFormatted: isPerfectRoot ? String(primaryValue) : `${primaryValue} (${simplifiedRadical})`,
    radicand: rad,
    rootDegree: deg,
    isPerfectRoot,
    simplifiedRadical,
    outerFactor,
    innerRadicand,
    steps,
  };
}

export const squareRootFields: CalculatorField<SquareRootInput>[] = [
  {
    name: "mode",
    label: "Calculation Type",
    type: "select",
    defaultValue: "root",
    options: [
      { label: "Radical / Root (√x)", value: "root" },
      { label: "Exponent / Power (xʸ)", value: "exponent" },
    ],
  },
  {
    name: "radicand",
    label: "Number under Radical (Radicand)",
    type: "number",
    defaultValue: 144,
    min: 0,
    max: 1000000000,
    step: 1,
    presets: [
      { label: "√144 (12)", value: 144 },
      { label: "√72 (6√2)", value: 72 },
      { label: "√256 (16)", value: 256 },
      { label: "√2 (1.414)", value: 2 },
      { label: "√1000 (10√10)", value: 1000 },
    ],
    helperText: "The number inside the square root symbol",
  },
  {
    name: "rootDegree",
    label: "Root Degree (n)",
    type: "number",
    defaultValue: 2,
    min: 2,
    max: 20,
    step: 1,
    presets: [
      { label: "Square Root (n=2)", value: 2 },
      { label: "Cube Root (n=3)", value: 3 },
      { label: "4th Root (n=4)", value: 4 },
      { label: "5th Root (n=5)", value: 5 },
    ],
    helperText: "2 for square root, 3 for cube root",
  },
];

export const squareRootMetadata: CalculatorMetadata = {
  id: "square-root",
  name: "Square Root & Exponent Calculator",
  shortDescription:
    "Calculate principal square roots, cube roots, n-th radicals, simplified radical forms (k√r), powers (xʸ), and scientific notations.",
  category: "math",
  subcategory: "arithmetic",
  route: "/square-root-calculator",
  badge: "Math & Arithmetic",
  directAnswer:
    "The square root of a number x is a value y such that y × y = x (√x = y). For example, √144 = 12. For non-perfect squares like √72, the simplified radical is 6√2 ≈ 8.4853.",
  keywords: [
    "square root calculator",
    "cube root calculator",
    "radical simplifier",
    "exponent calculator",
    "power calculator",
    "nth root calculator",
    "simplify square root",
  ],
  formula: {
    expression: "ⁿ√x = x^(1/n)  |  xʸ = x × x × ... × x  |  √(a² × b) = a × √b",
    variables: [
      { symbol: "x", label: "Radicand / Base", description: "The base number being evaluated" },
      { symbol: "n", label: "Root Degree", description: "Order of root (2 for square root, 3 for cube root)" },
      { symbol: "y", label: "Exponent", description: "Power to which the base is raised" },
      { symbol: "a√b", label: "Simplified Radical", description: "Radical with largest perfect square factored out" },
    ],
    steps: [
      { label: "Factor Perfect Squares", expression: "x = a² × b", explanation: "Find the largest perfect square factor dividing the radicand." },
      { label: "Extract Outer Factor", expression: "√x = a × √b", explanation: "Extract the square root of the square factor outside the radical." },
      { label: "Compute Decimal", expression: "x^(1/n)", explanation: "Evaluate principal real root as decimal." },
    ],
    notes: [
      "In the real number system, the square root of a negative number is undefined.",
      "Every positive number has two square roots (±√x); this calculator computes the principal (positive) square root.",
    ],
  },
  faqs: [
    {
      question: "How do you simplify a square root without a calculator?",
      answer:
        "Find the largest perfect square factor (4, 9, 16, 25, 36, etc.) that divides the number evenly. Take the square root of that factor outside the radical. For example, √72 = √(36 × 2) = 6√2.",
    },
    {
      question: "What is the difference between a square root and a cube root?",
      answer:
        "A square root finds a number that multiplies by itself twice to equal x (√x). A cube root finds a number that multiplies by itself three times to equal x (³√x). For example, √64 = 8, but ³√64 = 4.",
    },
    {
      question: "How do negative exponents work?",
      answer:
        "A negative exponent means taking the reciprocal of the base raised to the positive power: x⁻ʸ = 1 / (xʸ). For example, 2⁻³ = 1 / (2³) = 1/8 = 0.125.",
    },
    {
      question: "What is a perfect square?",
      answer:
        "A perfect square is an integer that is the square of another integer (e.g. 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144). Its square root is a whole number with no remainder.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const squareRootEngine: CalculatorEngine<SquareRootInput, SquareRootResult> = {
  id: "square-root",
  metadata: squareRootMetadata,
  schema: squareRootInputSchema,
  defaultInputs: defaultSquareRootInput,
  fields: squareRootFields,
  calculate: calculateSquareRoot,
  formatResult: (result: SquareRootResult) => {
    if (result.mode === "exponent") {
      return {
        raw: result,
        primary: {
          key: "power",
          label: `${result.base}^${result.exponent} Result`,
          value: result.primaryValue,
          formattedValue: result.primaryFormatted,
          subtext: `Scientific: ${result.scientificNotation} | Inverse (1/xʸ): ${result.inversePower}`,
          highlight: true,
        },
        secondary: [
          {
            key: "sci",
            label: "Scientific Notation",
            value: result.scientificNotation || "",
            formattedValue: result.scientificNotation,
          },
          {
            key: "inverse",
            label: "Inverse Power (1 / xʸ)",
            value: result.inversePower || 0,
            formattedValue: String(result.inversePower),
          },
          {
            key: "expression",
            label: "Exponential Expression",
            value: `${result.base}^${result.exponent}`,
            formattedValue: `${result.base}^${result.exponent}`,
          },
        ],
        summaryText: `${result.base} raised to the power of ${result.exponent} equals ${result.primaryFormatted}.`,
      };
    }

    // Root mode
    return {
      raw: result,
      primary: {
        key: "root",
        label: result.rootDegree === 2 ? `√${result.radicand} Square Root` : `${result.rootDegree}√${result.radicand} Root`,
        value: result.primaryValue,
        formattedValue: String(result.primaryValue),
        subtext: result.isPerfectRoot
          ? `Perfect Root: ${result.primaryValue}² = ${result.radicand}`
          : `Simplified Radical: ${result.simplifiedRadical}`,
        highlight: true,
      },
      secondary: [
        {
          key: "simplified",
          label: "Simplified Radical Form",
          value: result.simplifiedRadical || "",
          formattedValue: result.simplifiedRadical,
        },
        {
          key: "perfect",
          label: "Perfect Square / Root?",
          value: result.isPerfectRoot ? "Yes" : "No",
          formattedValue: result.isPerfectRoot ? "Yes (Integer Root)" : "No (Irrational Decimal)",
        },
        {
          key: "degree",
          label: "Root Degree (n)",
          value: result.rootDegree || 2,
          formattedValue: String(result.rootDegree),
        },
      ],
      summaryText: `The principal ${result.rootDegree === 2 ? "square root" : `${result.rootDegree}-th root`} of ${result.radicand} is ${result.primaryValue} (${result.simplifiedRadical}).`,
    };
  },
};

registerCalculator(squareRootEngine);
