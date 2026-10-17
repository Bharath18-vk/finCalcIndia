import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export type ProbabilityMode = "single" | "two_events" | "binomial";

export interface ProbabilityInput {
  mode: ProbabilityMode;
  // Single event inputs
  favorableOutcomes?: number;
  totalOutcomes?: number;
  // Two events inputs (expressed as decimals between 0 and 1, or percentages)
  probA?: number; // 0 to 1
  probB?: number; // 0 to 1
  twoEventRelationship?: "independent" | "mutually_exclusive";
  // Binomial experiment inputs
  trials?: number; // n
  successProb?: number; // p (0 to 1)
  targetSuccesses?: number; // k
}

export interface ProbabilityResult {
  mode: ProbabilityMode;
  // Primary result formatted
  primaryProbability: number; // 0 to 1
  primaryPercentage: number; // 0 to 100%
  primaryFormatted: string;

  // Single event metrics
  complementaryProb?: number;
  oddsInFavor?: string;
  oddsAgainst?: string;
  ratioFraction?: string;

  // Two events metrics
  probA?: number;
  probB?: number;
  probAAndB?: number;
  probAOrB?: number;
  probANotB?: number;
  probNeither?: number;

  // Binomial metrics
  trials?: number;
  targetSuccesses?: number;
  probExactK?: number;
  probAtLeastK?: number;
  probAtMostK?: number;
  expectedValue?: number;
  variance?: number;

  steps: string[];
}

/**
 * Combinations formula nCr = n! / (r! * (n-r)!)
 */
export function combinations(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let c = 1;
  const k = Math.min(r, n - r);
  for (let i = 1; i <= k; i++) {
    c = (c * (n - i + 1)) / i;
  }
  return Math.round(c);
}

/**
 * Greatest common divisor for simplifying fractions
 */
function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export const probabilityInputSchema = z.object({
  mode: z.enum(["single", "two_events", "binomial"]),
  favorableOutcomes: z
    .number({ invalid_type_error: "Favorable outcomes must be a number" })
    .min(0, "Favorable outcomes cannot be negative")
    .max(1000000000, "Too large")
    .optional(),
  totalOutcomes: z
    .number({ invalid_type_error: "Total outcomes must be a number" })
    .min(1, "Total outcomes must be at least 1")
    .max(1000000000, "Too large")
    .optional(),
  probA: z
    .number({ invalid_type_error: "P(A) must be a number" })
    .min(0, "Probability cannot be less than 0")
    .max(1, "Probability cannot exceed 1")
    .optional(),
  probB: z
    .number({ invalid_type_error: "P(B) must be a number" })
    .min(0, "Probability cannot be less than 0")
    .max(1, "Probability cannot exceed 1")
    .optional(),
  twoEventRelationship: z.enum(["independent", "mutually_exclusive"]).optional(),
  trials: z
    .number({ invalid_type_error: "Trials must be an integer" })
    .int("Trials must be an integer")
    .min(1, "Trials must be at least 1")
    .max(170, "Maximum 170 trials supported")
    .optional(),
  successProb: z
    .number({ invalid_type_error: "Success probability must be a number" })
    .min(0, "Probability cannot be less than 0")
    .max(1, "Probability cannot exceed 1")
    .optional(),
  targetSuccesses: z
    .number({ invalid_type_error: "Successes must be an integer" })
    .int("Successes must be an integer")
    .min(0, "Cannot be negative")
    .max(170, "Cannot exceed trials")
    .optional(),
});

export const defaultProbabilityInput: ProbabilityInput = {
  mode: "single",
  favorableOutcomes: 1,
  totalOutcomes: 6,
  probA: 0.5,
  probB: 0.5,
  twoEventRelationship: "independent",
  trials: 10,
  successProb: 0.5,
  targetSuccesses: 5,
};

/**
 * Pure calculation engine for Probability & Odds
 */
export function calculateProbability(input: ProbabilityInput): ProbabilityResult {
  const mode = input.mode || "single";
  const steps: string[] = [];

  if (mode === "two_events") {
    const pA = Math.max(0, Math.min(1, input.probA !== undefined ? input.probA : 0.5));
    const pB = Math.max(0, Math.min(1, input.probB !== undefined ? input.probB : 0.5));
    const rel = input.twoEventRelationship || "independent";

    let pAnd = 0;
    let pOr = 0;
    let pANotB = 0;
    let pNeither = 0;

    if (rel === "independent") {
      pAnd = Number((pA * pB).toFixed(4));
      pOr = Number((pA + pB - pAnd).toFixed(4));
      pANotB = Number((pA * (1 - pB)).toFixed(4));
      pNeither = Number(((1 - pA) * (1 - pB)).toFixed(4));

      steps.push(`Events are independent:`);
      steps.push(`P(A and B) = P(A) × P(B) = ${pA} × ${pB} = ${pAnd}`);
      steps.push(`P(A or B) = P(A) + P(B) − P(A and B) = ${pA} + ${pB} − ${pAnd} = ${pOr}`);
      steps.push(`P(A only) = P(A) × (1 − P(B)) = ${pA} × ${1 - pB} = ${pANotB}`);
      steps.push(`P(Neither) = (1 − P(A)) × (1 − P(B)) = ${1 - pA} × ${1 - pB} = ${pNeither}`);
    } else {
      // mutually exclusive
      pAnd = 0;
      pOr = Number(Math.min(1, pA + pB).toFixed(4));
      pANotB = pA;
      pNeither = Number(Math.max(0, 1 - (pA + pB)).toFixed(4));

      steps.push(`Events are mutually exclusive (cannot occur together):`);
      steps.push(`P(A and B) = 0`);
      steps.push(`P(A or B) = P(A) + P(B) = ${pA} + ${pB} = ${pOr}`);
      steps.push(`P(Neither) = 1 − (P(A) + P(B)) = ${pNeither}`);
    }

    return {
      mode,
      primaryProbability: pOr,
      primaryPercentage: Number((pOr * 100).toFixed(2)),
      primaryFormatted: `${(pOr * 100).toFixed(2)}%`,
      probA: pA,
      probB: pB,
      probAAndB: pAnd,
      probAOrB: pOr,
      probANotB: pANotB,
      probNeither: pNeither,
      steps,
    };
  }

  if (mode === "binomial") {
    const n = Math.max(1, Math.min(170, Math.round(input.trials || 10)));
    const p = Math.max(0, Math.min(1, input.successProb !== undefined ? input.successProb : 0.5));
    const k = Math.max(0, Math.min(n, Math.round(input.targetSuccesses !== undefined ? input.targetSuccesses : 5)));
    const q = 1 - p;

    // P(X = k) = nCr * p^k * q^(n-k)
    const nCr = combinations(n, k);
    const pExact = Number((nCr * Math.pow(p, k) * Math.pow(q, n - k)).toFixed(6));

    // P(X <= k)
    let pAtMost = 0;
    for (let i = 0; i <= k; i++) {
      pAtMost += combinations(n, i) * Math.pow(p, i) * Math.pow(q, n - i);
    }
    pAtMost = Number(Math.min(1, pAtMost).toFixed(6));

    // P(X >= k)
    let pAtLeast = 0;
    for (let i = k; i <= n; i++) {
      pAtLeast += combinations(n, i) * Math.pow(p, i) * Math.pow(q, n - i);
    }
    pAtLeast = Number(Math.min(1, pAtLeast).toFixed(6));

    const expectedValue = Number((n * p).toFixed(4));
    const variance = Number((n * p * q).toFixed(4));

    steps.push(`Binomial experiment with n = ${n} trials, success probability p = ${p}:`);
    steps.push(`Formula: P(X = ${k}) = C(${n}, ${k}) × (${p})^${k} × (${q})^${n - k}`);
    steps.push(`Combinations C(${n}, ${k}) = ${nCr}`);
    steps.push(`P(X = ${k}) = ${nCr} × ${(Math.pow(p, k)).toExponential(3)} × ${(Math.pow(q, n - k)).toExponential(3)} = ${pExact}`);
    steps.push(`Expected value (Mean μ) = n × p = ${expectedValue}`);
    steps.push(`Variance (σ²) = n × p × (1 − p) = ${variance}`);

    return {
      mode,
      primaryProbability: pExact,
      primaryPercentage: Number((pExact * 100).toFixed(4)),
      primaryFormatted: `${(pExact * 100).toFixed(4)}%`,
      trials: n,
      targetSuccesses: k,
      probExactK: pExact,
      probAtLeastK: pAtLeast,
      probAtMostK: pAtMost,
      expectedValue,
      variance,
      steps,
    };
  }

  // Default Single Event mode: P(A) = favorable / total
  const fav = Math.max(0, Math.round(input.favorableOutcomes !== undefined ? input.favorableOutcomes : 1));
  const tot = Math.max(1, Math.round(input.totalOutcomes !== undefined ? input.totalOutcomes : 6));
  const boundedFav = Math.min(fav, tot);

  const prob = boundedFav / tot;
  const primaryProbability = Number(prob.toFixed(6));
  const primaryPercentage = Number((prob * 100).toFixed(2));
  const complementaryProb = Number((1 - prob).toFixed(6));

  const g = gcd(boundedFav, tot);
  const simFav = boundedFav / g;
  const simTot = tot / g;
  const ratioFraction = `${simFav} / ${simTot}`;

  const unfav = tot - boundedFav;
  const gOdds = gcd(boundedFav, unfav);
  const oddsInFavor = `${boundedFav / gOdds} : ${unfav / gOdds}`;
  const oddsAgainst = `${unfav / gOdds} : ${boundedFav / gOdds}`;

  steps.push(`Favorable outcomes n(A) = ${boundedFav}`);
  steps.push(`Total sample space outcomes n(S) = ${tot}`);
  steps.push(`Probability P(A) = n(A) ÷ n(S) = ${boundedFav} ÷ ${tot} = ${ratioFraction} = ${primaryProbability}`);
  steps.push(`Percentage = ${primaryPercentage}%`);
  steps.push(`Complementary probability P(not A) = 1 − ${primaryProbability} = ${complementaryProb}`);
  steps.push(`Odds in favor = ${oddsInFavor} | Odds against = ${oddsAgainst}`);

  return {
    mode,
    primaryProbability,
    primaryPercentage,
    primaryFormatted: `${primaryPercentage}% (${ratioFraction})`,
    complementaryProb,
    oddsInFavor,
    oddsAgainst,
    ratioFraction,
    steps,
  };
}

export const probabilityFields: CalculatorField<ProbabilityInput>[] = [
  {
    name: "mode",
    label: "Calculation Type",
    type: "select",
    defaultValue: "single",
    options: [
      { label: "Single Event P(A)", value: "single" },
      { label: "Two Events P(A & B)", value: "two_events" },
      { label: "Binomial Probability P(X = k)", value: "binomial" },
    ],
  },
  {
    name: "favorableOutcomes",
    label: "Favorable Outcomes n(A)",
    type: "number",
    defaultValue: 1,
    min: 0,
    max: 1000000,
    step: 1,
    presets: [
      { label: "Rolling a 6 (1)", value: 1 },
      { label: "Rolling Even (3)", value: 3 },
      { label: "Coin Heads (1)", value: 1 },
      { label: "Drawing an Ace (4)", value: 4 },
      { label: "Drawing a Heart (13)", value: 13 },
    ],
    helperText: "Number of successful or desired outcomes",
  },
  {
    name: "totalOutcomes",
    label: "Total Possible Outcomes n(S)",
    type: "number",
    defaultValue: 6,
    min: 1,
    max: 1000000,
    step: 1,
    presets: [
      { label: "Six-sided Die (6)", value: 6 },
      { label: "Coin Toss (2)", value: 2 },
      { label: "Deck of Cards (52)", value: 52 },
      { label: "Roulette (37)", value: 37 },
    ],
    helperText: "Total size of the sample space",
  },
];

export const probabilityMetadata: CalculatorMetadata = {
  id: "probability",
  name: "Probability Calculator",
  shortDescription:
    "Calculate single event probability, complementary odds, two-event independent and mutually exclusive intersections, and binomial distribution probabilities.",
  category: "math",
  subcategory: "statistics",
  route: "/probability-calculator",
  badge: "Math & Statistics",
  directAnswer:
    "The probability of an event P(A) is the number of favorable outcomes divided by total possible outcomes: P(A) = n(A) / n(S). For example, rolling a 6 on a 6-sided die is 1 ÷ 6 = 16.67% (0.1667), with odds of 1 to 5.",
  keywords: [
    "probability calculator",
    "calculate probability",
    "odds calculator",
    "event probability calculator",
    "binomial probability calculator",
    "independent events probability",
    "dice probability calculator",
  ],
  formula: {
    expression: "Single Event: P(A) = Favorable / Total = n(A) / n(S)  |  Union: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)  |  Binomial: P(X = k) = C(n, k) × pᵏ × (1 - p)ⁿ⁻ᵏ",
    variables: [
      { symbol: "P(A)", label: "Probability of Event A", description: "Likelihood of event A occurring (0 to 1)" },
      { symbol: "n(A)", label: "Favorable Outcomes", description: "Count of successful event occurrences" },
      { symbol: "n(S)", label: "Total Outcomes", description: "Complete sample space of all possibilities" },
      { symbol: "n", label: "Trials", description: "Number of trials in a binomial experiment" },
      { symbol: "p", label: "Success Rate", description: "Probability of success on each trial" },
    ],
    steps: [
      { label: "Count Outcomes", expression: "n(A) ≤ n(S)", explanation: "Identify favorable cases and total cases." },
      { label: "Divide", expression: "P(A) = n(A) / n(S)", explanation: "Divide favorable by total to find decimal probability." },
      { label: "Complement", expression: "P(A') = 1 - P(A)", explanation: "Subtract from 1 to find failure probability." },
    ],
    notes: [
      "Probability is always bounded between 0 (impossible event) and 1 (certain event).",
      "Odds in favor express the ratio of successes to failures (a : b), whereas probability expresses successes to total outcomes (a / (a + b)).",
    ],
  },
  faqs: [
    {
      question: "How do you calculate the probability of an event?",
      answer:
        "Divide the number of favorable outcomes by the total number of possible outcomes. For example, drawing an Ace from a standard 52-card deck has 4 favorable outcomes out of 52 total cards: 4 ÷ 52 = 1/13 ≈ 7.69%.",
    },
    {
      question: "What is the difference between probability and odds?",
      answer:
        "Probability is the ratio of favorable outcomes to all outcomes (Wins ÷ Total). Odds is the ratio of favorable outcomes to unfavorable outcomes (Wins : Losses). For example, a 1 in 4 probability (25%) equals 1 to 3 odds.",
    },
    {
      question: "What are independent vs mutually exclusive events?",
      answer:
        "Independent events do not affect each other's occurrence (e.g. flipping two coins, P(A and B) = P(A) × P(B)). Mutually exclusive events cannot occur at the same time (e.g. rolling a 2 and a 5 on one roll, P(A and B) = 0).",
    },
    {
      question: "What is a binomial probability experiment?",
      answer:
        "A binomial experiment has a fixed number of independent trials (n), each with only two outcomes (success or failure), and a constant probability of success (p). It calculates the probability of getting exactly k successes.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const probabilityEngine: CalculatorEngine<ProbabilityInput, ProbabilityResult> = {
  id: "probability",
  metadata: probabilityMetadata,
  schema: probabilityInputSchema,
  defaultInputs: defaultProbabilityInput,
  fields: probabilityFields,
  calculate: calculateProbability,
  formatResult: (result: ProbabilityResult) => {
    if (result.mode === "two_events") {
      return {
        raw: result,
        primary: {
          key: "probOr",
          label: "Probability P(A or B)",
          value: result.primaryPercentage,
          formattedValue: `${result.primaryPercentage}%`,
          subtext: `Decimal: ${result.primaryProbability} | P(A and B): ${(Number(result.probAAndB || 0) * 100).toFixed(2)}%`,
          highlight: true,
        },
        secondary: [
          {
            key: "probAnd",
            label: "P(A and B) Intersection",
            value: result.probAAndB || 0,
            formattedValue: `${((result.probAAndB || 0) * 100).toFixed(2)}% (${result.probAAndB})`,
          },
          {
            key: "probNeither",
            label: "P(Neither A nor B)",
            value: result.probNeither || 0,
            formattedValue: `${((result.probNeither || 0) * 100).toFixed(2)}% (${result.probNeither})`,
          },
          {
            key: "probAOnly",
            label: "P(A only, not B)",
            value: result.probANotB || 0,
            formattedValue: `${((result.probANotB || 0) * 100).toFixed(2)}% (${result.probANotB})`,
          },
        ],
        summaryText: `For events A (${(Number(result.probA) * 100).toFixed(1)}%) and B (${(Number(result.probB) * 100).toFixed(1)}%), P(A or B) = ${result.primaryFormatted}.`,
      };
    }

    if (result.mode === "binomial") {
      return {
        raw: result,
        primary: {
          key: "probExact",
          label: `P(Exactly ${result.targetSuccesses} Successes)`,
          value: result.primaryPercentage,
          formattedValue: `${result.primaryPercentage}%`,
          subtext: `In ${result.trials} trials | Expected Value (Mean): ${result.expectedValue}`,
          highlight: true,
        },
        secondary: [
          {
            key: "probAtLeast",
            label: `P(At Least ${result.targetSuccesses} Successes)`,
            value: result.probAtLeastK || 0,
            formattedValue: `${((result.probAtLeastK || 0) * 100).toFixed(2)}%`,
          },
          {
            key: "probAtMost",
            label: `P(At Most ${result.targetSuccesses} Successes)`,
            value: result.probAtMostK || 0,
            formattedValue: `${((result.probAtMostK || 0) * 100).toFixed(2)}%`,
          },
          {
            key: "mean",
            label: "Expected Mean (μ)",
            value: result.expectedValue || 0,
            formattedValue: String(result.expectedValue),
          },
          {
            key: "variance",
            label: "Variance (σ²)",
            value: result.variance || 0,
            formattedValue: String(result.variance),
          },
        ],
        summaryText: `In ${result.trials} binomial trials, the probability of exactly ${result.targetSuccesses} successes is ${result.primaryFormatted}.`,
      };
    }

    // Default Single Event mode
    return {
      raw: result,
      primary: {
        key: "probability",
        label: "Probability of Event P(A)",
        value: result.primaryPercentage,
        formattedValue: result.primaryFormatted,
        subtext: `Decimal: ${result.primaryProbability} | Complement P(A'): ${(Number(result.complementaryProb) * 100).toFixed(2)}%`,
        highlight: true,
      },
      secondary: [
        {
          key: "fraction",
          label: "Simplified Fraction",
          value: result.ratioFraction || "",
          formattedValue: result.ratioFraction,
        },
        {
          key: "oddsFavor",
          label: "Odds in Favor",
          value: result.oddsInFavor || "",
          formattedValue: result.oddsInFavor,
        },
        {
          key: "oddsAgainst",
          label: "Odds Against",
          value: result.oddsAgainst || "",
          formattedValue: result.oddsAgainst,
        },
        {
          key: "complementary",
          label: "Probability of NOT occurring",
          value: result.complementaryProb || 0,
          formattedValue: `${((result.complementaryProb || 0) * 100).toFixed(2)}% (${result.complementaryProb})`,
        },
      ],
      summaryText: `The probability is ${result.primaryFormatted}, representing ${result.oddsInFavor} odds in favor.`,
    };
  },
};

registerCalculator(probabilityEngine);
