import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export interface ScssInput {
  depositAmount: number;
  interestRate?: number;
  tenureYears?: 5 | 8;
  investorAge?: number;
}

export interface ScssYearlySchedule {
  yearNumber: number;
  openingPrincipal: number;
  quarterlyInterest: number;
  annualInterest: number;
  cumulativeInterest: number;
  closingPrincipal: number;
}

export interface ScssResult {
  depositAmount: number;
  interestRate: number;
  tenureYears: number;
  quarterlyPayout: number;
  monthlyEquivalent: number;
  annualPayout: number;
  totalInterest: number;
  totalPayout: number; // Principal + Total Interest
  section80TtbDeduction: number; // Max ₹50,000/yr for senior citizens
  taxableAnnualInterest: number;
  schedule: ScssYearlySchedule[];
  steps: string[];
}

export const scssInputSchema = z.object({
  depositAmount: z
    .number({ invalid_type_error: "Deposit amount must be a number" })
    .min(1000, "Minimum deposit in SCSS is ₹1,000")
    .max(3000000, "Maximum deposit limit in SCSS is ₹30,00,000 per individual"),
  interestRate: z
    .number({ invalid_type_error: "Interest rate must be a number" })
    .min(4, "Interest rate must be at least 4%")
    .max(15, "Interest rate cannot exceed 15%")
    .optional(),
  tenureYears: z.union([z.literal(5), z.literal(8)]).optional(),
  investorAge: z
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be an integer")
    .min(50, "Minimum age for retired personnel is 50, general is 60")
    .max(120, "Age cannot exceed 120 years")
    .optional(),
});

export const defaultScssInput: ScssInput = {
  depositAmount: 1500000,
  interestRate: 8.2,
  tenureYears: 5,
  investorAge: 60,
};

/**
 * Pure calculation engine for Senior Citizen Savings Scheme (SCSS)
 * Rules:
 * - Deposit limit: ₹1,000 to ₹30,00,000
 * - Quarterly interest payout: (P * R) / 400
 * - Does NOT compound; interest credited quarterly
 * - Section 80TTB provides up to ₹50,000 interest exemption per financial year
 */
export function calculateScss(input: ScssInput): ScssResult {
  const depositAmount = Math.max(0, input.depositAmount || 0);
  const interestRate = input.interestRate ?? 8.2;
  const tenureYears = input.tenureYears ?? 5;

  // Quarterly Interest = (P * R) / 400
  const quarterlyPayout = Math.round(((depositAmount * interestRate) / 400) * 100) / 100;
  const monthlyEquivalent = Math.round((quarterlyPayout / 3) * 100) / 100;
  const annualPayout = Math.round(quarterlyPayout * 4 * 100) / 100;
  const totalInterest = Math.round(annualPayout * tenureYears * 100) / 100;
  const totalPayout = Math.round((depositAmount + totalInterest) * 100) / 100;

  // Section 80TTB deduction for Senior Citizens (up to ₹50,000/year)
  const section80TtbDeduction = Math.min(annualPayout, 50000);
  const taxableAnnualInterest = Math.max(0, annualPayout - section80TtbDeduction);

  const schedule: ScssYearlySchedule[] = [];
  let cumulativeInterest = 0;

  for (let year = 1; year <= tenureYears; year++) {
    cumulativeInterest += annualPayout;
    schedule.push({
      yearNumber: year,
      openingPrincipal: depositAmount,
      quarterlyInterest: quarterlyPayout,
      annualInterest: annualPayout,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
      closingPrincipal: depositAmount,
    });
  }

  const steps = [
    `Principal Deposited: ${formatINR(depositAmount)} (Tenure: ${tenureYears} Years)`,
    `Notified Interest Rate: ${interestRate}% p.a.`,
    `Quarterly Interest Payout: [${formatINR(depositAmount)} × ${interestRate}] / 400 = ${formatINR(quarterlyPayout)} every quarter`,
    `Monthly Equivalent Income: ~${formatINR(monthlyEquivalent)} per month`,
    `Annual Regular Income: ${formatINR(annualPayout)} per year`,
    `Total Interest Income over ${tenureYears} years: ${formatINR(totalInterest)}`,
    `Total Cash Flow (Principal returned at maturity): ${formatINR(totalPayout)}`,
  ];

  return {
    depositAmount,
    interestRate,
    tenureYears,
    quarterlyPayout,
    monthlyEquivalent,
    annualPayout,
    totalInterest,
    totalPayout,
    section80TtbDeduction,
    taxableAnnualInterest,
    schedule,
    steps,
  };
}

export const scssFields: CalculatorField<ScssInput>[] = [
  {
    name: "depositAmount",
    label: "Deposit Amount (₹)",
    type: "currency",
    defaultValue: 1500000,
    min: 1000,
    max: 3000000,
    step: 10000,
  },
  {
    name: "interestRate",
    label: "Interest Rate (% p.a.)",
    type: "percentage",
    defaultValue: 8.2,
    min: 4,
    max: 15,
    step: 0.1,
  },
  {
    name: "tenureYears",
    label: "Investment Tenure",
    type: "select",
    defaultValue: 5,
    options: [
      { label: "5 Years (Standard)", value: 5 },
      { label: "8 Years (Extended 3-Year Block)", value: 8 },
    ],
  },
  {
    name: "investorAge",
    label: "Investor Age (Years)",
    type: "number",
    defaultValue: 60,
    min: 50,
    max: 100,
    step: 1,
  },
];

export const scssMetadata: CalculatorMetadata = {
  id: "scss",
  name: "Senior Citizen Savings Scheme (SCSS) Calculator",
  shortDescription:
    "Calculate quarterly interest payouts, annual regular income, tax deductions under Section 80TTB, and 5 to 8-year cash flows under the 8.2% SCSS scheme.",
  category: "finance",
  subcategory: "retirement",
  route: "/scss-calculator",
  badge: "Government Scheme",
  directAnswer:
    "Under the Senior Citizen Savings Scheme (SCSS) at 8.2% p.a., depositing the maximum ₹30,00,000 earns ₹61,500 every quarter (₹20,500/month equivalent), totaling ₹12,30,000 in interest over 5 years. Principal of ₹30,00,000 is fully refunded at maturity.",
  keywords: [
    "scss calculator",
    "senior citizen savings scheme calculator",
    "scss interest rate",
    "post office senior citizen scheme",
    "scss quarterly interest calculator",
    "senior citizen monthly income scheme",
    "scss calculator 2026",
  ],
  formula: {
    expression: "Q = \\frac{P \\times R}{400}",
    variables: [
      { symbol: "Q", label: "Quarterly Interest", description: "Interest credited on the 1st of April, July, October, January" },
      { symbol: "P", label: "Principal Deposit", description: "Deposit amount (₹1,000 to ₹30,00,000)" },
      { symbol: "R", label: "Interest Rate", description: "Notified annual interest rate (currently 8.2% p.a.)" },
      { symbol: "T", label: "Tenure", description: "5 years standard, extendable by 3 years" },
    ],
    steps: [
      { label: "Quarterly Payout", expression: "\\frac{P \\times R}{400}", explanation: "Annual interest divided into 4 equal quarters." },
      { label: "Annual Cash Flow", expression: "4 \\times Q", explanation: "Total guaranteed regular income earned per year." },
      { label: "Total Interest", expression: "4 \\times Q \\times T", explanation: "Cumulative interest received over the entire tenure." },
      { label: "Maturity", expression: "P + \\text{Total Interest}", explanation: "Principal returned in full at maturity alongside regular quarterly payouts." },
    ],
    notes: [
      "Maximum deposit limit was increased from ₹15 Lakhs to ₹30 Lakhs in Union Budget 2023.",
      "Senior citizens (60+) can claim tax exemption of up to ₹50,000 on interest income under Section 80TTB.",
      "Interest does not compound; it is credited directly to the depositor's savings account each quarter.",
    ],
  },
  faqs: [
    {
      question: "What is the maximum investment limit in SCSS?",
      answer:
        "The maximum investment limit in the Senior Citizen Savings Scheme is ₹30 Lakhs per individual. If a spouse is also a eligible senior citizen, the couple can invest up to ₹60 Lakhs in separate or joint accounts.",
    },
    {
      question: "When is interest paid in SCSS?",
      answer:
        "Interest is paid quarterly on the first working day of April, July, October, and January. It is directly credited to the investor's linked savings account in the post office or authorized commercial bank.",
    },
    {
      question: "Is SCSS interest exempt from income tax?",
      answer:
        "SCSS interest is fully taxable under 'Income from Other Sources'. However, under Section 80TTB, senior citizens can claim a deduction of up to ₹50,000 per financial year on total interest income from bank and post office deposits. TDS applies if interest exceeds ₹50,000 in a year.",
    },
    {
      question: "Can an SCSS account be extended after 5 years?",
      answer:
        "Yes, an SCSS account can be extended once for a block of 3 years by submitting an application within 1 year from the date of maturity, making the total tenure 8 years.",
    },
    {
      question: "Can money be withdrawn before 5 years from SCSS?",
      answer:
        "Premature closure is permitted after 1 year. If closed between 1 and 2 years, a penalty of 1.5% of the deposit is deducted. If closed after 2 years, a penalty of 1% is deducted.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release under CalculatorEngine contract with ₹30L limit and quarterly payout schedule.",
  },
};

export const scssEngine: CalculatorEngine<ScssInput, ScssResult> = {
  id: "scss",
  metadata: scssMetadata,
  schema: scssInputSchema,
  defaultInputs: defaultScssInput,
  fields: scssFields,
  calculate: calculateScss,
  formatResult: (result: ScssResult) => {
    return {
      raw: result,
      primary: {
        key: "quarterlyPayout",
        label: "Quarterly Regular Income",
        value: result.quarterlyPayout,
        formattedValue: formatINR(result.quarterlyPayout),
        subtext: `~${formatINR(result.monthlyEquivalent)}/month equivalent (${result.interestRate}% p.a.)`,
        highlight: true,
      },
      secondary: [
        {
          key: "annualPayout",
          label: "Annual Regular Income",
          value: result.annualPayout,
          formattedValue: formatINR(result.annualPayout),
        },
        {
          key: "totalInterest",
          label: `Total Interest (${result.tenureYears} Years)`,
          value: result.totalInterest,
          formattedValue: formatINR(result.totalInterest),
        },
        {
          key: "principalReturned",
          label: "Principal Returned at Maturity",
          value: result.depositAmount,
          formattedValue: formatINR(result.depositAmount),
        },
        {
          key: "sec80ttb",
          label: "Sec 80TTB Tax-Free Interest",
          value: result.section80TtbDeduction,
          formattedValue: `${formatINR(result.section80TtbDeduction)}/yr`,
        },
      ],
      summaryText: `Investing ${formatINR(result.depositAmount)} in SCSS at ${result.interestRate}% yields ${formatINR(result.quarterlyPayout)} every quarter (${formatINR(result.annualPayout)}/year). Over ${result.tenureYears} years, you earn ${formatINR(result.totalInterest)} in total interest, and receive your ${formatINR(result.depositAmount)} principal back at maturity.`,
    };
  },
};

registerCalculator(scssEngine);
