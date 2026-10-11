import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export interface StepUpSwpInput {
  initialCorpus: number;
  initialMonthlyWithdrawal: number;
  annualStepUpPercent: number; // Annual increase % e.g. 6%
  expectedAnnualReturnPercent: number; // Expected portfolio return e.g. 8.5%
  tenureYears: number; // Duration of SWP in years e.g. 25 or 30
}

export interface StepUpSwpYearSchedule {
  year: number;
  openingBalance: number;
  monthlyPayoutInYear: number;
  totalAnnualWithdrawal: number;
  annualReturnsEarned: number;
  closingBalance: number;
}

export interface StepUpSwpResult {
  initialCorpus: number;
  initialMonthlyWithdrawal: number;
  finalMonthlyWithdrawalAtEnd: number;
  annualStepUpPercent: number;
  expectedAnnualReturnPercent: number;
  tenureYears: number;
  totalAmountWithdrawn: number;
  finalPortfolioBalance: number;
  isDepletedBeforeTenure: boolean;
  exhaustionYear: number | null;
  exhaustionMonth: number | null;
  longevityYears: number;
  maxSustainableInitialMonthlyWithdrawal: number;
  annualSchedule: StepUpSwpYearSchedule[];
  verdictNote: string;
}

export const stepUpSwpSchema = z.object({
  initialCorpus: z
    .number({ invalid_type_error: "Initial corpus must be a number" })
    .positive("Initial corpus must be greater than zero")
    .max(10000000000, "Corpus cannot exceed ₹1,000 Crores"),
  initialMonthlyWithdrawal: z
    .number({ invalid_type_error: "Monthly withdrawal must be a number" })
    .positive("Monthly withdrawal must be greater than zero")
    .max(100000000, "Monthly withdrawal cannot exceed ₹10 Crores"),
  annualStepUpPercent: z
    .number({ invalid_type_error: "Annual step-up must be a number" })
    .min(0, "Step-up cannot be negative")
    .max(25, "Step-up cannot exceed 25%"),
  expectedAnnualReturnPercent: z
    .number({ invalid_type_error: "Return rate must be a number" })
    .min(0, "Return cannot be negative")
    .max(25, "Return cannot exceed 25%"),
  tenureYears: z
    .number({ invalid_type_error: "Tenure must be a number" })
    .int("Tenure must be whole years")
    .min(1, "Tenure must be at least 1 year")
    .max(50, "Tenure cannot exceed 50 years"),
});

export const defaultStepUpSwpInputs: StepUpSwpInput = {
  initialCorpus: 10000000, // ₹1 Crore
  initialMonthlyWithdrawal: 45000, // ₹45,000 / month
  annualStepUpPercent: 6.0, // 6% annual step-up for inflation
  expectedAnnualReturnPercent: 8.5, // 8.5% hybrid/debt mutual fund return
  tenureYears: 25,
};

export function calculateStepUpSwp(input: StepUpSwpInput): StepUpSwpResult {
  const {
    initialCorpus,
    initialMonthlyWithdrawal,
    annualStepUpPercent,
    expectedAnnualReturnPercent,
    tenureYears,
  } = input;

  const monthlyReturnRate =
    Math.pow(1 + expectedAnnualReturnPercent / 100, 1 / 12) - 1;

  let balance = initialCorpus;
  let currentMonthlyPayout = initialMonthlyWithdrawal;
  let totalWithdrawn = 0;
  let isDepleted = false;
  let exhaustionYear: number | null = null;
  let exhaustionMonth: number | null = null;

  const annualSchedule: StepUpSwpYearSchedule[] = [];

  for (let year = 1; year <= tenureYears; year++) {
    const openingBalance = balance;
    let yearWithdrawal = 0;
    let yearReturns = 0;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) {
        if (!isDepleted) {
          isDepleted = true;
          exhaustionYear = year;
          exhaustionMonth = month;
        }
        break;
      }

      const actualPayout = Math.min(balance, currentMonthlyPayout);
      yearWithdrawal += actualPayout;
      totalWithdrawn += actualPayout;
      balance -= actualPayout;

      if (balance > 0) {
        const interest = balance * monthlyReturnRate;
        yearReturns += interest;
        balance += interest;
      }
    }

    const closingBalance = Math.max(0, Math.round(balance));

    annualSchedule.push({
      year,
      openingBalance: Math.round(openingBalance),
      monthlyPayoutInYear: Math.round(currentMonthlyPayout),
      totalAnnualWithdrawal: Math.round(yearWithdrawal),
      annualReturnsEarned: Math.round(yearReturns),
      closingBalance,
    });

    if (balance <= 0 && !isDepleted) {
      isDepleted = true;
      exhaustionYear = year;
      exhaustionMonth = 12;
    }

    // Step up monthly payout for next year
    currentMonthlyPayout = currentMonthlyPayout * (1 + annualStepUpPercent / 100);
  }

  // Calculate maximum sustainable initial withdrawal that lasts the full tenure without reaching 0
  // Binary search between 1000 and initialCorpus
  let low = 1000;
  let high = initialCorpus;
  let maxSustainable = initialMonthlyWithdrawal;

  for (let iter = 0; iter < 30; iter++) {
    const mid = (low + high) / 2;
    let testBal = initialCorpus;
    let testPayout = mid;
    let testDepleted = false;

    for (let y = 1; y <= tenureYears; y++) {
      for (let m = 1; m <= 12; m++) {
        if (testBal < testPayout) {
          testDepleted = true;
          break;
        }
        testBal -= testPayout;
        testBal += testBal * monthlyReturnRate;
      }
      if (testDepleted) break;
      testPayout *= 1 + annualStepUpPercent / 100;
    }

    if (!testDepleted && testBal >= 0) {
      maxSustainable = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  const longevityYears = isDepleted && exhaustionYear ? exhaustionYear : tenureYears;
  const finalMonthlyWithdrawalAtEnd = Math.round(
    initialMonthlyWithdrawal *
      Math.pow(1 + annualStepUpPercent / 100, longevityYears - 1)
  );

  let verdictNote = "";
  if (!isDepleted) {
    verdictNote = `Your ₹${(initialCorpus / 10000000).toFixed(
      2
    )} Cr corpus successfully sustains all ${tenureYears} years with an annual ${annualStepUpPercent}% inflation step-up! At the end of ${tenureYears} years, you still retain an estimated balance of ₹${Math.round(
      balance
    ).toLocaleString("en-IN")}.`;
  } else {
    verdictNote = `Corpus depletion alert: At ₹${initialMonthlyWithdrawal.toLocaleString(
      "en-IN"
    )}/month stepping up at ${annualStepUpPercent}%, your corpus will be exhausted in Year ${exhaustionYear}. To ensure it survives all ${tenureYears} years, consider capping your initial monthly withdrawal at ₹${Math.round(
      maxSustainable
    ).toLocaleString("en-IN")}.`;
  }

  return {
    initialCorpus,
    initialMonthlyWithdrawal,
    finalMonthlyWithdrawalAtEnd,
    annualStepUpPercent,
    expectedAnnualReturnPercent,
    tenureYears,
    totalAmountWithdrawn: Math.round(totalWithdrawn),
    finalPortfolioBalance: Math.max(0, Math.round(balance)),
    isDepletedBeforeTenure: isDepleted,
    exhaustionYear,
    exhaustionMonth,
    longevityYears,
    maxSustainableInitialMonthlyWithdrawal: Math.round(maxSustainable),
    annualSchedule,
    verdictNote,
  };
}

export const stepUpSwpFields: CalculatorField<StepUpSwpInput>[] = [
  {
    name: "initialCorpus",
    label: "Total Retirement Corpus",
    type: "currency",
    defaultValue: 10000000,
    unit: "₹",
    min: 100000,
    max: 1000000000,
    step: 100000,
    presets: [
      { label: "₹50 Lakh", value: 5000000 },
      { label: "₹1 Crore", value: 10000000 },
      { label: "₹2 Crore", value: 20000000 },
      { label: "₹5 Crore", value: 50000000 },
    ],
  },
  {
    name: "initialMonthlyWithdrawal",
    label: "Initial Monthly Withdrawal (Year 1)",
    type: "currency",
    defaultValue: 45000,
    unit: "₹",
    min: 5000,
    max: 5000000,
    step: 1000,
    presets: [
      { label: "₹30,000", value: 30000 },
      { label: "₹45,000", value: 45000 },
      { label: "₹75,000", value: 75000 },
      { label: "₹1,00,000", value: 100000 },
    ],
  },
  {
    name: "annualStepUpPercent",
    label: "Annual Withdrawal Step-Up (Inflation Hedge)",
    type: "percentage",
    defaultValue: 6.0,
    unit: "%",
    min: 0,
    max: 15,
    step: 0.5,
    presets: [
      { label: "0% (Fixed SWP)", value: 0 },
      { label: "5.0% p.a.", value: 5.0 },
      { label: "6.0% (Indian CPI)", value: 6.0 },
      { label: "8.0% p.a.", value: 8.0 },
    ],
  },
  {
    name: "expectedAnnualReturnPercent",
    label: "Expected Portfolio Return (p.a.)",
    type: "percentage",
    defaultValue: 8.5,
    unit: "%",
    min: 4.0,
    max: 18.0,
    step: 0.25,
    presets: [
      { label: "7.0% (Conservative Debt)", value: 7.0 },
      { label: "8.5% (Conservative Hybrid)", value: 8.5 },
      { label: "10.0% (Balanced Advantage)", value: 10.0 },
      { label: "11.5% (Equity Heavy)", value: 11.5 },
    ],
  },
  {
    name: "tenureYears",
    label: "Retirement Horizon (Years)",
    type: "tenure",
    defaultValue: 25,
    unit: "years",
    min: 5,
    max: 45,
    step: 1,
    presets: [
      { label: "15 Years", value: 15 },
      { label: "20 Years", value: 20 },
      { label: "25 Years", value: 25 },
      { label: "30 Years", value: 30 },
    ],
  },
];

export const stepUpSwpMetadata: CalculatorMetadata = {
  id: "step-up-swp-calculator",
  name: "Step-Up SWP Calculator (Inflation-Adjusted Systematic Withdrawal)",
  shortDescription:
    "Model inflation-beating retirement cashflows with annual percentage step-ups. Calculate corpus longevity, year-by-year balance depletion, and safe starting withdrawals.",
  category: "finance",
  subcategory: "Retirement",
  route: "/step-up-swp-calculator",
  badge: "Inflation-Adjusted Cashflow",
  directAnswer:
    "A Step-Up SWP increases your monthly retirement payout each year by a set percentage (typically 5-6% to match Indian inflation). This prevents lifestyle degradation while modeling exact portfolio balance depletion and ensuring your money does not run out during retirement.",
  keywords: [
    "step up swp calculator",
    "inflation adjusted swp calculator",
    "retirement swp longevity calculator",
    "mutual fund step up systematic withdrawal",
    "swp depletion schedule india",
  ],
  formula: {
    expression: "Monthly Payout (Year y) = Initial Payout × (1 + StepUp)^(y-1)",
    variables: [
      { symbol: "W_0", label: "Initial Payout", description: "First year monthly cash withdrawal" },
      { symbol: "g", label: "Step-Up %", description: "Annual withdrawal growth rate to match inflation" },
      { symbol: "r", label: "Portfolio Return", description: "Expected annual compounding return on remaining balance" },
      { symbol: "T", label: "Tenure", description: "Total planned retirement duration in years" },
    ],
    steps: [
      {
        label: "Annual Payout Escalation",
        expression: "Monthly Payout_y = Monthly Payout_1 × (1 + g)^(y-1)",
        explanation: "Every 12 months, the monthly withdrawal steps up by your inflation target percentage.",
      },
      {
        label: "Month-by-Month Compounding & Depletion",
        expression: "Balance_m = (Balance_{m-1} - Withdrawal_m) × (1 + r/12)",
        explanation: "Withdrawals are disbursed monthly, and the remaining capital continues compounding at the portfolio return rate.",
      },
      {
        label: "Depletion & Longevity Verification",
        expression: "Check if Balance_m ≤ 0 at any month m within Tenure",
        explanation: "Tracks the exact year and month when capital exhausts or confirms portfolio solvency.",
      },
    ],
  },
  faqs: [
    {
      question: "Why is a Step-Up SWP better than a regular fixed SWP for retirement?",
      answer:
        "A flat SWP of ₹50,000 might cover your lifestyle today, but with 6% annual inflation, ₹50,000 will have the purchasing power of only ₹27,900 in 10 years. A step-up SWP escalates your payout annually so your real living standard remains unchanged throughout retirement.",
    },
    {
      question: "What is a safe initial withdrawal percentage for a Step-Up SWP in India?",
      answer:
        "When factoring in a 5-6% annual withdrawal increase, financial planners recommend an initial withdrawal rate of 4% to 5% of the starting corpus (e.g., ₹35,000–₹42,000 per month on a ₹1 Crore corpus) assuming a hybrid portfolio earning 8.5–9.5% p.a.",
    },
    {
      question: "How are SWP withdrawals taxed in India?",
      answer:
        "Only the capital gains component of each monthly SWP unit redemption is subject to tax. Under post-Budget 2024 rules: Equity mutual fund LTCG held >12 months is taxed at 12.5% on gains exceeding ₹1.25 Lakh per year; debt mutual fund gains are taxed at your income tax slab rate.",
    },
  ],
  sources: [
    {
      name: "Association of Mutual Funds in India (AMFI) - SWP Guidelines",
      url: "https://www.amfiindia.com",
    },
  ],
  version: {
    version: "1.0.0",
    effectiveFrom: "2024-01-01",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release of Step-Up SWP engine with longevity solver and year-by-year cashflow schedule.",
  },
};

export const stepUpSwpEngine: CalculatorEngine<StepUpSwpInput, StepUpSwpResult> = {
  id: "step-up-swp-calculator",
  metadata: stepUpSwpMetadata,
  schema: stepUpSwpSchema,
  defaultInputs: defaultStepUpSwpInputs,
  fields: stepUpSwpFields,
  calculate: calculateStepUpSwp,
};

registerCalculator(stepUpSwpEngine);
