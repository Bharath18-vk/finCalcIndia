import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export interface LcmGcdInput {
  numbers: string; // e.g. "24, 36" or "12, 18, 30"
}

export interface PrimeFactor {
  prime: number;
  power: number;
}

export interface NumberFactorization {
  num: number;
  factors: PrimeFactor[];
  formatted: string;
}

export interface LcmGcdResult {
  numbers: number[];
  count: number;
  gcd: number;
  lcm: number;
  factorizations: NumberFactorization[];
  commonFactors: number[];
  firstMultiples: number[];
  steps: string[];
}

export function parseIntegerList(input: string): number[] {
  if (!input || typeof input !== "string") return [];
  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const numbers: number[] = [];
  for (const token of tokens) {
    const num = Number(token);
    if (!Number.isNaN(num) && Number.isInteger(num) && num > 0) {
      numbers.push(num);
    }
  }
  return numbers;
}

/**
 * Prime factorization of a positive integer
 */
export function getPrimeFactorization(n: number): NumberFactorization {
  let temp = n;
  const factors: PrimeFactor[] = [];

  // Check 2
  let count2 = 0;
  while (temp % 2 === 0) {
    count2++;
    temp = temp / 2;
  }
  if (count2 > 0) factors.push({ prime: 2, power: count2 });

  // Odd factors
  for (let d = 3; d * d <= temp; d += 2) {
    let countD = 0;
    while (temp % d === 0) {
      countD++;
      temp = temp / d;
    }
    if (countD > 0) factors.push({ prime: d, power: countD });
  }

  if (temp > 1) {
    factors.push({ prime: temp, power: 1 });
  }

  const formatted =
    factors.length > 0
      ? factors
          .map((f) => (f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`))
          .join(" × ")
      : `${n}`;

  return { num: n, factors, formatted };
}

/**
 * GCD of two positive integers using Euclidean Algorithm
 */
export function gcdTwo(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * LCM of two positive integers
 */
export function lcmTwo(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.round((Math.abs(a) / gcdTwo(a, b)) * Math.abs(b));
}

export const lcmGcdInputSchema = z.object({
  numbers: z
    .string({ invalid_type_error: "Please enter numbers" })
    .min(1, "Please provide numbers")
    .refine((val) => parseIntegerList(val).length >= 2, {
      message: "Please enter at least 2 positive integers separated by commas or spaces",
    })
    .refine((val) => parseIntegerList(val).length <= 20, {
      message: "Maximum 20 numbers allowed",
    }),
});

export const defaultLcmGcdInput: LcmGcdInput = {
  numbers: "24, 36",
};

/**
 * Pure calculation engine for LCM & GCD (HCF)
 */
export function calculateLcmGcd(input: LcmGcdInput): LcmGcdResult {
  const nums = parseIntegerList(input.numbers);
  const steps: string[] = [];

  if (nums.length < 2) {
    return {
      numbers: nums,
      count: nums.length,
      gcd: nums[0] || 1,
      lcm: nums[0] || 1,
      factorizations: [],
      commonFactors: [],
      firstMultiples: [],
      steps: ["Enter at least 2 positive integers."],
    };
  }

  // Calculate GCD across all numbers
  let currentGcd = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentGcd = gcdTwo(currentGcd, nums[i]);
  }

  // Calculate LCM across all numbers
  let currentLcm = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentLcm = lcmTwo(currentLcm, nums[i]);
  }

  // Prime factorizations
  const factorizations = nums.map(getPrimeFactorization);

  // Common factors of GCD
  const commonFactors: number[] = [];
  for (let d = 1; d <= currentGcd; d++) {
    if (currentGcd % d === 0) {
      commonFactors.push(d);
    }
  }

  // First 5 multiples of LCM
  const firstMultiples: number[] = [];
  for (let m = 1; m <= 5; m++) {
    firstMultiples.push(currentLcm * m);
  }

  steps.push(`Input numbers: ${nums.join(", ")}`);
  steps.push(`1. Prime Factorization:`);
  for (const f of factorizations) {
    steps.push(`   ${f.num} = ${f.formatted}`);
  }

  steps.push(`2. Greatest Common Divisor (GCD / HCF):`);
  steps.push(`   Taking lowest powers of all common prime factors: GCD = ${currentGcd}`);
  steps.push(`   Common factors of {${nums.join(", ")}} are: ${commonFactors.join(", ")}`);

  steps.push(`3. Least Common Multiple (LCM):`);
  steps.push(`   Taking highest powers of all prime factors: LCM = ${currentLcm}`);
  steps.push(`   First 5 common multiples: ${firstMultiples.join(", ")}`);

  return {
    numbers: nums,
    count: nums.length,
    gcd: currentGcd,
    lcm: currentLcm,
    factorizations,
    commonFactors,
    firstMultiples,
    steps,
  };
}

export const lcmGcdFields: CalculatorField<LcmGcdInput>[] = [
  {
    name: "numbers",
    label: "Positive Integers (Separated by commas or spaces)",
    type: "text",
    defaultValue: "24, 36",
    placeholder: "e.g., 24, 36 or 12, 18, 30",
    helperText: "Enter 2 or more positive integers",
    presets: [
      { label: "24, 36", value: "24, 36" },
      { label: "12, 18, 30", value: "12, 18, 30" },
      { label: "15, 25, 45", value: "15, 25, 45" },
      { label: "8, 12, 16, 24", value: "8, 12, 16, 24" },
      { label: "Coprime (7, 11)", value: "7, 11" },
    ],
  },
];

export const lcmGcdMetadata: CalculatorMetadata = {
  id: "lcm-gcd",
  name: "LCM and GCD Calculator",
  shortDescription:
    "Calculate the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) for two or more integers with prime factorization trees and division steps.",
  category: "math",
  subcategory: "arithmetic",
  route: "/lcm-gcd-calculator",
  badge: "Math & Arithmetic",
  directAnswer:
    "The Greatest Common Divisor (GCD / HCF) of 24 and 36 is 12 (the largest number dividing both). The Least Common Multiple (LCM) is 72 (the smallest number that is a multiple of both). For two numbers, LCM(a, b) = (a × b) ÷ GCD(a, b).",
  keywords: [
    "lcm calculator",
    "gcd calculator",
    "hcf calculator",
    "least common multiple",
    "greatest common divisor",
    "hcf and lcm calculator",
    "prime factorization calculator",
  ],
  formula: {
    expression: "\\gcd(a, b) = \\text{largest integer dividing both} \\quad | \\quad \\text{lcm}(a, b) = \\frac{|a \\times b|}{\\gcd(a, b)}",
    variables: [
      { symbol: "GCD", label: "Greatest Common Divisor (HCF)", description: "Largest positive integer that divides all numbers without remainder" },
      { symbol: "LCM", label: "Least Common Multiple", description: "Smallest positive integer that is a multiple of all numbers" },
      { symbol: "a, b", label: "Input Integers", description: "Given whole numbers" },
    ],
    steps: [
      { label: "Prime Factorize", expression: "n = p_1^{a_1} \\times p_2^{a_2} \\dots", explanation: "Express each number as a product of prime powers." },
      { label: "Find GCD", expression: "\\gcd = \\prod p_i^{\\min(a_i, b_i)}", explanation: "Multiply lowest powers of common prime factors." },
      { label: "Find LCM", expression: "\\text{lcm} = \\prod p_i^{\\max(a_i, b_i)}", explanation: "Multiply highest powers of all prime factors." },
    ],
    notes: [
      "For any two positive integers a and b, the fundamental identity holds: GCD(a, b) × LCM(a, b) = a × b.",
      "If GCD(a, b) = 1, the numbers are said to be relatively prime or coprime.",
    ],
  },
  faqs: [
    {
      question: "What is the difference between LCM and GCD (HCF)?",
      answer:
        "GCD (Greatest Common Divisor, or HCF - Highest Common Factor) is the largest number that divides all numbers evenly. LCM (Least Common Multiple) is the smallest number that all numbers can divide into evenly.",
    },
    {
      question: "What is the relationship between GCD and LCM for two numbers?",
      answer:
        "The product of any two numbers equals the product of their GCD and LCM: a × b = GCD(a, b) × LCM(a, b). This means LCM(a, b) = (a × b) ÷ GCD(a, b).",
    },
    {
      question: "How do you find LCM and GCD using prime factorization?",
      answer:
        "Factor each number into primes. For GCD, take the lowest power of all common prime factors and multiply them. For LCM, take the highest power of every prime factor that appears in any of the numbers and multiply them.",
    },
    {
      question: "Can LCM and GCD be calculated for three or more numbers?",
      answer:
        "Yes. For three numbers a, b, and c: GCD(a, b, c) = GCD(GCD(a, b), c). Similarly, LCM(a, b, c) = LCM(LCM(a, b), c).",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const lcmGcdEngine: CalculatorEngine<LcmGcdInput, LcmGcdResult> = {
  id: "lcm-gcd",
  metadata: lcmGcdMetadata,
  schema: lcmGcdInputSchema,
  defaultInputs: defaultLcmGcdInput,
  fields: lcmGcdFields,
  calculate: calculateLcmGcd,
  formatResult: (result: LcmGcdResult) => {
    return {
      raw: result,
      primary: {
        key: "lcmGcd",
        label: `GCD = ${result.gcd} | LCM = ${result.lcm}`,
        value: result.gcd,
        formattedValue: `GCD: ${result.gcd} | LCM: ${result.lcm}`,
        subtext: `For ${result.numbers.join(", ")} | Common Factors: ${result.commonFactors.join(", ")}`,
        highlight: true,
      },
      secondary: [
        {
          key: "gcd",
          label: "Greatest Common Divisor (HCF)",
          value: result.gcd,
          formattedValue: String(result.gcd),
        },
        {
          key: "lcm",
          label: "Least Common Multiple (LCM)",
          value: result.lcm,
          formattedValue: String(result.lcm),
        },
        {
          key: "count",
          label: "Numbers Evaluated",
          value: result.count,
          formattedValue: String(result.count),
        },
        {
          key: "commonFactors",
          label: "All Common Divisors",
          value: result.commonFactors.length,
          formattedValue: result.commonFactors.join(", "),
        },
      ],
      summaryText: `For {${result.numbers.join(", ")}}, the Greatest Common Divisor is ${result.gcd} and the Least Common Multiple is ${result.lcm}.`,
    };
  },
};

registerCalculator(lcmGcdEngine);
