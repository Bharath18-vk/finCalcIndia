import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export interface PermutationCombinationInput {
  n: number;
  r: number;
  allowRepetition?: boolean;
}

export interface PermutationCombinationResult {
  n: number;
  r: number;
  allowRepetition: boolean;
  // Without repetition
  nPr: number;
  nCr: number;
  // With repetition
  nPrWithRepetition: number;
  nCrWithRepetition: number;
  // Active outputs based on allowRepetition toggle
  activePermutations: number;
  activeCombinations: number;
  formattedPermutations: string;
  formattedCombinations: string;
  // Factorials
  nFactorial: number;
  rFactorial: number;
  diffFactorial: number; // (n - r)!
  steps: string[];
}

/**
 * BigInt-safe factorial calculation
 */
export function factorial(num: number): number {
  if (num < 0) return 0;
  if (num === 0 || num === 1) return 1;
  let res = 1;
  for (let i = 2; i <= num; i++) {
    res *= i;
  }
  return res;
}

export function computeNPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0) return 1;
  let res = 1;
  for (let i = 0; i < r; i++) {
    res *= n - i;
  }
  return res;
}

export function computeNCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  const k = Math.min(r, n - r);
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

export const permutationCombinationInputSchema = z
  .object({
    n: z
      .number({ invalid_type_error: "n must be an integer" })
      .int("n must be a whole number")
      .min(0, "n cannot be negative")
      .max(100, "n cannot exceed 100"),
    r: z
      .number({ invalid_type_error: "r must be an integer" })
      .int("r must be a whole number")
      .min(0, "r cannot be negative")
      .max(100, "r cannot exceed 100"),
    allowRepetition: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (!data.allowRepetition && data.r > data.n) {
        return false;
      }
      return true;
    },
    {
      message: "r cannot be greater than n when repetition is not allowed",
      path: ["r"],
    }
  );

export const defaultPermutationCombinationInput: PermutationCombinationInput = {
  n: 10,
  r: 3,
  allowRepetition: false,
};

/**
 * Pure calculation engine for Permutations (nPr) & Combinations (nCr)
 */
export function calculatePermutationCombination(
  input: PermutationCombinationInput
): PermutationCombinationResult {
  const n = Math.max(0, Math.min(100, Math.round(input.n !== undefined ? input.n : 10)));
  const r = Math.max(0, Math.min(100, Math.round(input.r !== undefined ? input.r : 3)));
  const allowRep = Boolean(input.allowRepetition);
  const steps: string[] = [];

  // Without repetition
  const nPr = r <= n ? computeNPr(n, r) : 0;
  const nCr = r <= n ? computeNCr(n, r) : 0;

  // With repetition: n^r and C(n + r - 1, r)
  const nPrWithRepetition = Math.pow(n, r);
  const nCrWithRepetition = n > 0 ? computeNCr(n + r - 1, r) : 0;

  const activePermutations = allowRep ? nPrWithRepetition : nPr;
  const activeCombinations = allowRep ? nCrWithRepetition : nCr;

  const formatLarge = (val: number) => {
    if (!Number.isFinite(val)) return "Infinity";
    if (val >= 1e12) return val.toExponential(4);
    return val.toLocaleString("en-IN");
  };

  const formattedPermutations = formatLarge(activePermutations);
  const formattedCombinations = formatLarge(activeCombinations);

  const nFactorial = n <= 20 ? factorial(n) : Infinity;
  const rFactorial = r <= 20 ? factorial(r) : Infinity;
  const diffFactorial = n >= r && n - r <= 20 ? factorial(n - r) : Infinity;

  steps.push(`Given total items n = ${n}, sample size r = ${r}:`);

  if (!allowRep) {
    steps.push(`1. Permutations (Order Matters) Formula: nPr = n! / (n − r)!`);
    steps.push(`   ${n}P${r} = ${n}! / (${n} − ${r})! = ${n}! / ${n - r}! = ${formattedPermutations}`);
    steps.push(`2. Combinations (Order Does NOT Matter) Formula: nCr = n! / [r! × (n − r)!]`);
    steps.push(`   ${n}C${r} = ${n}! / [${r}! × ${n - r}!] = ${formattedCombinations}`);
    steps.push(`3. Relation: nCr = nPr / r! = ${formattedPermutations} / ${r}! = ${formattedCombinations}`);
  } else {
    steps.push(`1. Permutations with Repetition Formula: n^r`);
    steps.push(`   ${n}^${r} = ${formattedPermutations}`);
    steps.push(`2. Combinations with Repetition Formula: C(n + r − 1, r)`);
    steps.push(`   C(${n} + ${r} − 1, ${r}) = C(${n + r - 1}, ${r}) = ${formattedCombinations}`);
  }

  return {
    n,
    r,
    allowRepetition: allowRep,
    nPr,
    nCr,
    nPrWithRepetition,
    nCrWithRepetition,
    activePermutations,
    activeCombinations,
    formattedPermutations,
    formattedCombinations,
    nFactorial,
    rFactorial,
    diffFactorial,
    steps,
  };
}

export const permutationCombinationFields: CalculatorField<PermutationCombinationInput>[] = [
  {
    name: "n",
    label: "Total Number of Items (n)",
    type: "number",
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 1,
    presets: [
      { label: "4 items", value: 4 },
      { label: "10 items", value: 10 },
      { label: "20 items", value: 20 },
      { label: "52 (Cards)", value: 52 },
    ],
    helperText: "Total elements in the set",
  },
  {
    name: "r",
    label: "Items to Choose / Arrange (r)",
    type: "number",
    defaultValue: 3,
    min: 0,
    max: 100,
    step: 1,
    presets: [
      { label: "Choose 2", value: 2 },
      { label: "Choose 3", value: 3 },
      { label: "Choose 5", value: 5 },
      { label: "Choose 10", value: 10 },
    ],
    helperText: "Number of elements selected",
  },
];

export const permutationCombinationMetadata: CalculatorMetadata = {
  id: "permutation-combination",
  name: "Permutation and Combination Calculator",
  shortDescription:
    "Calculate permutations (nPr - order matters) and combinations (nCr - order does not matter) with and without repetition, factorials, and step-by-step arithmetic.",
  category: "math",
  subcategory: "arithmetic",
  route: "/permutation-combination-calculator",
  badge: "Math & Combinatorics",
  directAnswer:
    "Permutations (nPr = n! / (n - r)!) count arrangements where order matters (e.g. 10P3 = 720). Combinations (nCr = n! / [r!(n - r)!]) count selections where order does not matter (e.g. 10C3 = 120).",
  keywords: [
    "permutation and combination calculator",
    "npr calculator",
    "ncr calculator",
    "combinations calculator",
    "permutations calculator",
    "factorial calculator",
    "combinatorics calculator",
  ],
  formula: {
    expression: "Permutations: nPr = n! / (n - r)!  |  Combinations: nCr = n! / [r! × (n - r)!] = nPr / r!",
    variables: [
      { symbol: "n", label: "Total Elements", description: "The total number of items in the set" },
      { symbol: "r", label: "Sample Size", description: "The number of items chosen or arranged" },
      { symbol: "nPr", label: "Permutations", description: "Number of ordered arrangements" },
      { symbol: "nCr", label: "Combinations", description: "Number of unordered groups / selections" },
    ],
    steps: [
      { label: "Factorial Expansion", expression: "n! = n × (n - 1) × (n - 2) × ... × 1", explanation: "Compute factorials for n, r, and (n - r)." },
      { label: "Permutations", expression: "nPr = n! / (n - r)!", explanation: "Divide n! by (n - r)! to find ordered permutations." },
      { label: "Combinations", expression: "nCr = nPr / r!", explanation: "Divide permutations by r! to remove order significance." },
    ],
    notes: [
      "Permutations are always greater than or equal to combinations (nPr ≥ nCr).",
      "0! is defined mathematically as 1 (0! = 1).",
      "When r = 0, both nP0 = 1 and nC0 = 1.",
    ],
  },
  faqs: [
    {
      question: "What is the key difference between permutations and combinations?",
      answer:
        "Order. In permutations, order matters (e.g., a locker combination 1-2-3 is different from 3-2-1). In combinations, order does not matter (e.g., choosing a team of Alice, Bob, and Charlie is the same as Charlie, Alice, and Bob).",
    },
    {
      question: "Why does 0! equal 1?",
      answer:
        "By mathematical definition and the recursive relation n! = n × (n - 1)!, setting n = 1 gives 1! = 1 × 0!, which requires 0! = 1. Combinatorially, there is exactly 1 way to arrange 0 items (an empty set).",
    },
    {
      question: "How do permutations with repetition work?",
      answer:
        "When elements can be reused repeatedly, each of the r positions has n independent choices: n × n × ... × n = n^r. For example, a 4-digit PIN using digits 0-9 has 10^4 = 10,000 possibilities.",
    },
    {
      question: "What is the relationship between nCr and nC(n-r)?",
      answer:
        "Combinations are symmetric: nCr = nC(n - r). For example, choosing 3 people from 10 (10C3 = 120) is identical to leaving 7 people out (10C7 = 120).",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const permutationCombinationEngine: CalculatorEngine<
  PermutationCombinationInput,
  PermutationCombinationResult
> = {
  id: "permutation-combination",
  metadata: permutationCombinationMetadata,
  schema: permutationCombinationInputSchema,
  defaultInputs: defaultPermutationCombinationInput,
  fields: permutationCombinationFields,
  calculate: calculatePermutationCombination,
  formatResult: (result: PermutationCombinationResult) => {
    return {
      raw: result,
      primary: {
        key: "nCr",
        label: `Combinations (${result.n}C${result.r})`,
        value: result.activeCombinations,
        formattedValue: result.formattedCombinations,
        subtext: `Permutations (${result.n}P${result.r}): ${result.formattedPermutations}`,
        highlight: true,
      },
      secondary: [
        {
          key: "nPr",
          label: `Permutations (${result.n}P${result.r} - Order Matters)`,
          value: result.activePermutations,
          formattedValue: result.formattedPermutations,
        },
        {
          key: "relation",
          label: "Ratio (nPr / nCr = r!)",
          value: result.rFactorial,
          formattedValue: String(result.rFactorial),
        },
        {
          key: "repetition",
          label: "Repetition Allowed?",
          value: result.allowRepetition ? "Yes" : "No",
          formattedValue: result.allowRepetition ? "Yes (With Replacement)" : "No (Without Replacement)",
        },
      ],
      summaryText: `Selecting ${result.r} items from ${result.n} results in ${result.formattedCombinations} combinations (groups) and ${result.formattedPermutations} permutations (arrangements).`,
    };
  },
};

registerCalculator(permutationCombinationEngine);
