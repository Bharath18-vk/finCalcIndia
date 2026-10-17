import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export interface InflationInput {
  currentAmount: number;
  inflationRate: number; // Annual rate in percent e.g. 6.0%
  timeHorizonYears: number; // 1 to 50 years
  mode?: "future" | "cii";
  purchaseYear?: string;
  saleYear?: string;
}

export interface InflationMilestone {
  category: string;
  todayCost: number;
  futureCost: number;
}

export interface InflationYearSchedule {
  year: number;
  calendarYear: number;
  futureCost: number;
  purchasingPowerEquivalent: number;
  cumulativeInflationMultiplier: number;
}

export interface InflationResult {
  currentAmount: number;
  inflationRate: number;
  timeHorizonYears: number;
  futureCost: number; // What you need to spend in the future for same lifestyle
  purchasingPower: number; // What current money is worth in future terms
  purchasingPowerLossPercent: number; // % loss of purchasing power
  effectiveMultiplier: number; // e.g. 2.4x
  annualSchedule: InflationYearSchedule[];
  milestones: InflationMilestone[];
  ciiResult?: {
    purchaseCost: number;
    purchaseCii: number;
    saleCii: number;
    indexedCost: number;
    taxExemptInflationGains: number;
  };
}

// Official CBDT Cost Inflation Index (CII) Table (Base 2001-02 = 100)
export const CII_TABLE: Record<string, number> = {
  "2001-02": 100,
  "2002-03": 105,
  "2003-04": 109,
  "2004-05": 113,
  "2005-06": 117,
  "2006-07": 122,
  "2007-08": 129,
  "2008-09": 137,
  "2009-10": 148,
  "2010-11": 167,
  "2011-12": 184,
  "2012-13": 200,
  "2013-14": 220,
  "2014-15": 240,
  "2015-16": 254,
  "2016-17": 264,
  "2017-18": 272,
  "2018-19": 280,
  "2019-20": 289,
  "2020-21": 301,
  "2021-22": 317,
  "2022-23": 331,
  "2023-24": 348,
  "2024-25": 363,
};

export const inflationInputSchema = z.object({
  currentAmount: z
    .number({ invalid_type_error: "Current amount must be a number" })
    .positive("Current amount must be greater than zero")
    .max(1000000000, "Amount cannot exceed ₹100 Crores"),
  inflationRate: z
    .number({ invalid_type_error: "Inflation rate must be a number" })
    .min(0, "Inflation rate cannot be negative")
    .max(30, "Inflation rate cannot exceed 30%"),
  timeHorizonYears: z
    .number({ invalid_type_error: "Time horizon must be a number" })
    .int("Tenure must be whole years")
    .min(1, "Tenure must be at least 1 year")
    .max(50, "Tenure cannot exceed 50 years"),
  mode: z.enum(["future", "cii"]).default("future"),
  purchaseYear: z.string().optional(),
  saleYear: z.string().optional(),
});

export function calculateInflation(input: InflationInput): InflationResult {
  const currentAmount = Math.max(1, isFinite(input.currentAmount) ? input.currentAmount : 100000);
  const inflationRate = Math.max(0, isFinite(input.inflationRate) ? input.inflationRate : 6);
  const timeHorizonYears = Math.min(
    50,
    Math.max(1, Math.floor(isFinite(input.timeHorizonYears) ? input.timeHorizonYears : 10))
  );

  const r = inflationRate / 100;
  const currentCalendarYear = new Date().getFullYear();

  // Multiplier = (1 + r)^t
  const multiplier = Math.pow(1 + r, timeHorizonYears);
  const futureCost = Math.round(currentAmount * multiplier);
  const purchasingPower = Math.round(currentAmount / multiplier);
  const purchasingPowerLossPercent = Math.round((1 - 1 / multiplier) * 1000) / 10;
  const effectiveMultiplier = Math.round(multiplier * 100) / 100;

  // Year-by-year compounding progression
  const annualSchedule: InflationYearSchedule[] = [];
  for (let year = 1; year <= timeHorizonYears; year++) {
    const yrMultiplier = Math.pow(1 + r, year);
    annualSchedule.push({
      year,
      calendarYear: currentCalendarYear + year,
      futureCost: Math.round(currentAmount * yrMultiplier),
      purchasingPowerEquivalent: Math.round(currentAmount / yrMultiplier),
      cumulativeInflationMultiplier: Math.round(yrMultiplier * 100) / 100,
    });
  }

  // Common Indian Financial Goals Escalation
  const milestoneCategories = [
    { category: "Child Higher Education", todayCost: 2000000 },
    { category: "Retirement Monthly Expense", todayCost: 50000 },
    { category: "Comprehensive Family Healthcare", todayCost: 1000000 },
    { category: "Family Wedding Budget", todayCost: 1500000 },
    { category: "Mid-Segment Car Purchase", todayCost: 1200000 },
  ];

  const milestones: InflationMilestone[] = milestoneCategories.map((item) => ({
    category: item.category,
    todayCost: item.todayCost,
    futureCost: Math.round(item.todayCost * multiplier),
  }));

  // Optional CII calculation
  let ciiResult: InflationResult["ciiResult"] = undefined;
  if (input.purchaseYear && input.saleYear) {
    const pCii = CII_TABLE[input.purchaseYear] ?? 100;
    const sCii = CII_TABLE[input.saleYear] ?? 363;
    const indexedCost = Math.round((currentAmount * sCii) / pCii);
    ciiResult = {
      purchaseCost: currentAmount,
      purchaseCii: pCii,
      saleCii: sCii,
      indexedCost,
      taxExemptInflationGains: Math.max(0, indexedCost - currentAmount),
    };
  }

  return {
    currentAmount,
    inflationRate,
    timeHorizonYears,
    futureCost,
    purchasingPower,
    purchasingPowerLossPercent,
    effectiveMultiplier,
    annualSchedule,
    milestones,
    ciiResult,
  };
}

export const defaultInflationInputs: InflationInput = {
  currentAmount: 100000,
  inflationRate: 6.0,
  timeHorizonYears: 15,
  mode: "future",
};

const inflationFields: CalculatorField<InflationInput>[] = [
  {
    name: "currentAmount",
    label: "Current Cost / Value (₹)",
    type: "number",
    defaultValue: 100000,
    min: 1000,
    max: 100000000,
    step: 10000,
    unit: "₹",
    helperText: "Today's expense or target savings value.",
  },
  {
    name: "inflationRate",
    label: "Expected Annual Inflation Rate (%)",
    type: "number",
    defaultValue: 6.0,
    min: 1,
    max: 20,
    step: 0.1,
    unit: "%",
    helperText: "Long-term historical retail CPI inflation in India averages ~6.0% p.a.",
  },
  {
    name: "timeHorizonYears",
    label: "Time Horizon (Years)",
    type: "number",
    defaultValue: 15,
    min: 1,
    max: 50,
    step: 1,
    unit: "years",
    helperText: "Number of years into the future.",
  },
];

const inflationMetadata: CalculatorMetadata = {
  id: "inflation",
  name: "Inflation Calculator India",
  route: "/inflation-calculator",
  category: "finance",
  shortDescription:
    "Calculate future cost of living, purchasing power erosion, and Indian Cost Inflation Index (CII) indexation.",
  badge: "CPI & CII Indexation",
  directAnswer:
    "At an average annual inflation rate of 6%, prices double approximately every 12 years (Rule of 72). A ₹1,00,000 lifestyle today will require ₹2,39,656 in 15 years, reducing today's purchasing power of ₹1,00,000 to just ₹41,727.",
  formula: {
    expression: "Future Cost = Current Value × (1 + Inflation Rate)ᵗ  |  Purchasing Power = Current Value / (1 + Inflation Rate)ᵗ",
    variables: [
      { symbol: "PV", label: "Current Cost", description: "Current cost or monetary amount in today's rupees" },
      { symbol: "FV", label: "Future Value", description: "Required amount in the future to purchase the identical goods or service" },
      { symbol: "PP", label: "Purchasing Power", description: "The reduced purchasing value of today's amount after t years" },
      { symbol: "r", label: "Inflation Rate", description: "Annual consumer price inflation rate expressed as a decimal" },
      { symbol: "t", label: "Tenure Years", description: "Number of years into the future" },
    ],
    steps: [
      { label: "Convert Inflation Rate", expression: "r = Annual Inflation Rate % / 100", explanation: "Convert annual percentage rate to decimal." },
      { label: "Compute Compounding Factor", expression: "Factor = (1 + r)ᵗ", explanation: "Compound price increase over tenure." },
      { label: "Calculate Future Cost", expression: "Future Cost = Present Value × Factor", explanation: "Multiply current expense by inflation multiplier." },
    ],
    notes: [
      "RBI targets retail CPI inflation within a band of 4% (+/- 2%). Over the last two decades, Indian headline inflation has averaged between 5.5% and 6.5%.",
      "Higher education and private healthcare in India typically inflate at 10% to 12% annually, faster than general retail food and fuel inflation.",
    ],
  },
  faqs: [
    {
      question: "What is a realistic inflation rate to plan for in India?",
      answer:
        "For long-term financial goals in India, financial planners recommend using 6.0% to 7.0% for general retirement living expenses. For education and healthcare, a higher rate of 8.0% to 10.0% should be assumed.",
    },
    {
      question: "What is the Rule of 72 in inflation?",
      answer:
        "The Rule of 72 estimates how long it takes for prices to double due to inflation: divide 72 by the annual inflation rate. At 6% inflation, prices will double in approximately 72 / 6 = 12 years.",
    },
    {
      question: "What is the Cost Inflation Index (CII) in India?",
      answer:
        "The Cost Inflation Index (CII) is a measure notified annually by the Central Board of Direct Taxes (CBDT) under Section 48 of the Income Tax Act. It is used to adjust the purchase price of long-term capital assets for inflation, reducing capital gains tax liability.",
    },
    {
      question: "How does inflation affect my fixed deposits and savings?",
      answer:
        "If your bank fixed deposit yields 6.5% interest and annual inflation is 6.0%, your 'real' pre-tax return is only 0.5%. After accounting for 30% income tax on interest (bringing net FD return to 4.55%), your savings actually lose purchasing power over time.",
    },
  ],
  keywords: [
    "inflation calculator",
    "inflation calculator india",
    "future value of money calculator",
    "purchasing power calculator",
    "cost inflation index calculator",
    "cpi inflation calculator",
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "CPI inflation compounding and CBDT Cost Inflation Index table.",
  },
};

export const inflationEngine: CalculatorEngine<InflationInput, InflationResult> = {
  id: "inflation",
  metadata: inflationMetadata,
  schema: inflationInputSchema,
  defaultInputs: defaultInflationInputs,
  fields: inflationFields,
  calculate: calculateInflation,
};

registerCalculator(inflationEngine);
