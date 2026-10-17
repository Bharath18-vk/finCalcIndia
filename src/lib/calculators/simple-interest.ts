import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
  CalculatorResultModel,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export interface SimpleInterestInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
  tenureMonths?: number;
}

export interface SimpleInterestYearlyBreakdown {
  year: number;
  openingBalance: number;
  interestEarned: number;
  cumulativeInterest: number;
  closingBalance: number;
}

export interface SimpleInterestResult {
  principal: number;
  annualRate: number;
  tenureYearsTotal: number;
  interestAmount: number;
  totalAmount: number;
  monthlyInterest: number;
  compoundInterestComparison: {
    compoundQuarterly: number;
    compoundAnnual: number;
    differenceQuarterly: number;
  };
  yearlyBreakdown: SimpleInterestYearlyBreakdown[];
}

export const simpleInterestInputSchema = z.object({
  principal: z
    .number({ invalid_type_error: "Principal must be a number" })
    .min(0, "Principal amount cannot be negative")
    .max(1000000000, "Principal cannot exceed ₹100 Crore"),
  annualRate: z
    .number({ invalid_type_error: "Interest rate must be a number" })
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  tenureYears: z
    .number({ invalid_type_error: "Tenure years must be a number" })
    .min(0, "Tenure cannot be negative")
    .max(50, "Tenure cannot exceed 50 years"),
  tenureMonths: z
    .number({ invalid_type_error: "Tenure months must be a number" })
    .min(0, "Months cannot be negative")
    .max(11, "Months cannot exceed 11")
    .optional()
    .default(0),
});

export const defaultSimpleInterestInput: SimpleInterestInput = {
  principal: 100000,
  annualRate: 7.5,
  tenureYears: 3,
  tenureMonths: 0,
};

/**
 * Pure calculation engine for Simple Interest
 * Formula: SI = (P * R * T) / 100
 */
export function calculateSimpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const p = Math.max(0, Number(input.principal) || 0);
  const r = Math.max(0, Number(input.annualRate) || 0);
  const y = Math.max(0, Number(input.tenureYears) || 0);
  const m = Math.max(0, Math.min(11, Number(input.tenureMonths) || 0));

  const totalYears = y + m / 12;
  const totalMonths = y * 12 + m;

  const interestAmount = Math.round((p * r * totalYears) / 100);
  const totalAmount = p + interestAmount;
  const monthlyInterest = totalMonths > 0 ? Math.round(interestAmount / totalMonths) : 0;

  // Comparison vs Compound Interest
  let compoundAnnual = p;
  let compoundQuarterly = p;
  if (totalYears > 0 && r > 0) {
    compoundAnnual = Math.round(p * Math.pow(1 + r / 100, totalYears));
    compoundQuarterly = Math.round(p * Math.pow(1 + r / 400, 4 * totalYears));
  }
  const differenceQuarterly = Math.max(0, compoundQuarterly - totalAmount);

  // Generate yearly breakdown
  const yearlyBreakdown: SimpleInterestYearlyBreakdown[] = [];
  const fullYears = Math.ceil(totalYears);
  const annualInterest = Math.round((p * r) / 100);

  let cumulativeInterest = 0;
  for (let yr = 1; yr <= fullYears; yr++) {
    const isLastYearFractional = yr === fullYears && totalYears % 1 !== 0;
    const fraction = isLastYearFractional ? totalYears % 1 : 1;
    const yrInterest = Math.round(annualInterest * fraction);
    cumulativeInterest += yrInterest;

    yearlyBreakdown.push({
      year: yr,
      openingBalance: p,
      interestEarned: yrInterest,
      cumulativeInterest,
      closingBalance: p + cumulativeInterest,
    });
  }

  return {
    principal: p,
    annualRate: r,
    tenureYearsTotal: Number(totalYears.toFixed(2)),
    interestAmount,
    totalAmount,
    monthlyInterest,
    compoundInterestComparison: {
      compoundQuarterly,
      compoundAnnual,
      differenceQuarterly,
    },
    yearlyBreakdown,
  };
}

export const simpleInterestFields: CalculatorField<SimpleInterestInput>[] = [
  {
    name: "principal",
    label: "Principal Amount (P)",
    type: "currency",
    defaultValue: 100000,
    min: 1000,
    max: 10000000,
    step: 5000,
    presets: [
      { label: "₹25,000", value: 25000 },
      { label: "₹50,000", value: 50000 },
      { label: "₹1 Lakh", value: 100000 },
      { label: "₹5 Lakh", value: 500000 },
      { label: "₹10 Lakh", value: 1000000 },
    ],
    helperText: "Initial loan or deposit amount",
  },
  {
    name: "annualRate",
    label: "Annual Interest Rate (% p.a.)",
    type: "percentage",
    defaultValue: 7.5,
    min: 1,
    max: 30,
    step: 0.1,
    presets: [
      { label: "5%", value: 5 },
      { label: "7.5%", value: 7.5 },
      { label: "10%", value: 10 },
      { label: "12%", value: 12 },
      { label: "15%", value: 15 },
    ],
    helperText: "Annual simple interest rate",
  },
  {
    name: "tenureYears",
    label: "Tenure (Years)",
    type: "number",
    defaultValue: 3,
    min: 1,
    max: 30,
    step: 1,
    presets: [
      { label: "1 Yr", value: 1 },
      { label: "2 Yrs", value: 2 },
      { label: "3 Yrs", value: 3 },
      { label: "5 Yrs", value: 5 },
      { label: "10 Yrs", value: 10 },
    ],
    helperText: "Duration in years",
  },
];

export const simpleInterestMetadata: CalculatorMetadata = {
  id: "simple-interest",
  name: "Simple Interest Calculator",
  shortDescription:
    "Calculate simple interest and total maturity amount using the standard SI = (P × R × T) / 100 formula with yearly amortization schedule and compound interest comparison.",
  category: "math",
  subcategory: "arithmetic",
  route: "/simple-interest-calculator",
  badge: "Math & Finance",
  directAnswer:
    "Simple Interest is calculated by multiplying Principal (P) by Rate (R) and Time (T in years), then dividing by 100: SI = (P × R × T) / 100. For example, ₹1,00,000 at 7.5% per annum for 3 years earns exactly ₹22,500 in interest, giving a total maturity amount of ₹1,22,500.",
  keywords: [
    "simple interest calculator",
    "calculate simple interest",
    "simple interest formula",
    "si calculator",
    "interest calculator india",
    "simple vs compound interest",
  ],
  formula: {
    expression: "Simple Interest (SI) = (P × R × T) / 100  |  Maturity Amount (A) = P + SI",
    variables: [
      { symbol: "P", label: "Principal", description: "The initial sum of money deposited or borrowed" },
      { symbol: "R", label: "Annual Rate", description: "The annual percentage interest rate" },
      { symbol: "T", label: "Time", description: "The duration of the deposit/loan in years" },
      { symbol: "A", label: "Total Amount", description: "Principal plus accumulated simple interest" },
    ],
    steps: [
      { label: "Compute Interest", expression: "(P × R × T) / 100", explanation: "Calculates the total interest earned over the entire holding period." },
      { label: "Compute Maturity", expression: "P + SI", explanation: "Adds total simple interest to original principal." },
      { label: "Compute Monthly Yield", expression: "SI / (T × 12)", explanation: "Calculates average monthly interest yield." },
    ],
    notes: [
      "In simple interest, interest is paid ONLY on the principal and never compounded.",
      "Most commercial bank deposits in India compound quarterly; simple interest applies to certain sovereign bonds, agricultural loans, or short-term personal lending.",
    ],
  },
  faqs: [
    {
      question: "What is the formula for Simple Interest?",
      answer:
        "The formula is SI = (P × R × T) / 100, where P is Principal, R is the annual interest rate, and T is time in years. Total repayment amount is A = P + SI.",
    },
    {
      question: "How does simple interest differ from compound interest?",
      answer:
        "In simple interest, interest is calculated solely on the original principal for each period. In compound interest, accumulated interest from previous periods is added to the principal, earning 'interest on interest' and yielding a higher final amount over time.",
    },
    {
      question: "Where is simple interest used in India?",
      answer:
        "Simple interest is commonly used for agricultural credit, promissory notes, peer-to-peer personal loans, car loans that use flat rates, and short-term sovereign money market instruments.",
    },
    {
      question: "Can tenure include months or days?",
      answer:
        "Yes. To convert months into years, divide by 12 (e.g. 6 months = 0.5 years). To convert days into years, divide by 365 (e.g. 73 days = 0.2 years).",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-05",
    changelogNotes: "Initial release under CalculatorEngine contract.",
  },
};

export const simpleInterestEngine: CalculatorEngine<SimpleInterestInput, SimpleInterestResult> = {
  id: "simple-interest",
  metadata: simpleInterestMetadata,
  schema: simpleInterestInputSchema,
  defaultInputs: defaultSimpleInterestInput,
  fields: simpleInterestFields,
  calculate: calculateSimpleInterest,
  formatResult: (result: SimpleInterestResult) => {
    return {
      raw: result,
      primary: {
        key: "interest",
        label: "Total Simple Interest Earned",
        value: result.interestAmount,
        formattedValue: formatINR(result.interestAmount),
        subtext: `Total Maturity Amount: ${formatINR(result.totalAmount)}`,
        highlight: true,
      },
      secondary: [
        {
          key: "total",
          label: "Total Maturity Amount",
          value: result.totalAmount,
          formattedValue: formatINR(result.totalAmount),
        },
        {
          key: "principal",
          label: "Principal Deposited",
          value: result.principal,
          formattedValue: formatINR(result.principal),
        },
        {
          key: "monthly",
          label: "Average Monthly Interest",
          value: result.monthlyInterest,
          formattedValue: formatINR(result.monthlyInterest),
        },
      ],
      summaryText: `₹${result.principal.toLocaleString("en-IN")} at ${result.annualRate}% p.a. for ${result.tenureYearsTotal} years yields ₹${result.interestAmount.toLocaleString("en-IN")} in simple interest.`,
    };
  },
};

registerCalculator(simpleInterestEngine);
