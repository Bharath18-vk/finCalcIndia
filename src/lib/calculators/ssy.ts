import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";
import { formatINR } from "@/lib/formatters";

export interface SsyInput {
  yearlyDeposit: number;
  interestRate?: number;
  startYear?: number;
  girlChildAge?: number;
}

export interface SsyScheduleYear {
  yearNumber: number;
  calendarYear: number;
  girlAge: number;
  openingBalance: number;
  deposit: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeDeposit: number;
}

export interface SsyResult {
  yearlyDeposit: number;
  interestRate: number;
  startYear: number;
  maturityYear: number;
  depositTenureYears: number; // strictly 15 years
  maturityTenureYears: number; // strictly 21 years
  totalDeposit: number;
  totalInterest: number;
  maturityAmount: number;
  schedule: SsyScheduleYear[];
  steps: string[];
}

export const ssyInputSchema = z.object({
  yearlyDeposit: z
    .number({ invalid_type_error: "Yearly deposit must be a number" })
    .min(250, "Minimum yearly deposit in SSY is ₹250")
    .max(150000, "Maximum yearly deposit in SSY is ₹1,50,000 per financial year"),
  interestRate: z
    .number({ invalid_type_error: "Interest rate must be a number" })
    .min(4, "Interest rate must be at least 4%")
    .max(15, "Interest rate cannot exceed 15%")
    .optional(),
  startYear: z
    .number({ invalid_type_error: "Start year must be a number" })
    .int("Start year must be an integer")
    .min(2015, "SSY scheme was launched in 2015")
    .max(2050, "Start year cannot exceed 2050")
    .optional(),
  girlChildAge: z
    .number({ invalid_type_error: "Girl child age must be a number" })
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(10, "Girl child must be 10 years or younger to open an SSY account")
    .optional(),
});

export const defaultSsyInput: SsyInput = {
  yearlyDeposit: 150000,
  interestRate: 8.2,
  startYear: 2026,
  girlChildAge: 1,
};

/**
 * Pure calculation engine for Sukanya Samriddhi Yojana (SSY)
 * Rules:
 * - Deposits for first 15 years
 * - Maturity after 21 years
 * - Years 16 to 21 earn compound interest with zero deposit
 */
export function calculateSsy(input: SsyInput): SsyResult {
  const yearlyDeposit = Math.max(0, input.yearlyDeposit || 0);
  const interestRate = input.interestRate ?? 8.2;
  const startYear = input.startYear ?? new Date().getFullYear();
  const girlChildAge = input.girlChildAge ?? 1;

  const depositTenureYears = 15;
  const maturityTenureYears = 21;
  const maturityYear = startYear + maturityTenureYears;

  let currentBalance = 0;
  let totalDeposit = 0;
  const schedule: SsyScheduleYear[] = [];

  for (let year = 1; year <= maturityTenureYears; year++) {
    const calendarYear = startYear + year - 1;
    const girlAge = girlChildAge + year - 1;
    const openingBalance = currentBalance;

    // Deposits allowed only during the first 15 years
    const deposit = year <= depositTenureYears ? yearlyDeposit : 0;
    totalDeposit += deposit;

    // Compounding: interest earned on (opening balance + deposit)
    const taxableBase = openingBalance + deposit;
    const interestEarned = Math.round(((taxableBase * interestRate) / 100) * 100) / 100;
    const closingBalance = Math.round((taxableBase + interestEarned) * 100) / 100;

    currentBalance = closingBalance;

    schedule.push({
      yearNumber: year,
      calendarYear,
      girlAge,
      openingBalance: Math.round(openingBalance * 100) / 100,
      deposit,
      interestEarned,
      closingBalance,
      cumulativeDeposit: Math.round(totalDeposit * 100) / 100,
    });
  }

  const maturityAmount = Math.round(currentBalance);
  const totalInterest = Math.round(maturityAmount - totalDeposit);

  const steps = [
    `Yearly Deposit: ${formatINR(yearlyDeposit)} per year for 15 years`,
    `Total Principal Deposited: ${formatINR(totalDeposit)} (${depositTenureYears} installments)`,
    `Statutory Interest Rate: ${interestRate}% p.a. (compounded annually)`,
    `Non-Deposit Growth Period: Years 16 to 21 (balance compounds without fresh deposits)`,
    `Total Interest Earned: ${formatINR(totalInterest)}`,
    `Maturity Corpus in ${maturityYear}: ${formatINR(maturityAmount)} (100% Tax-Free under Section 10(11A))`,
  ];

  return {
    yearlyDeposit,
    interestRate,
    startYear,
    maturityYear,
    depositTenureYears,
    maturityTenureYears,
    totalDeposit,
    totalInterest,
    maturityAmount,
    schedule,
    steps,
  };
}

export const ssyFields: CalculatorField<SsyInput>[] = [
  {
    name: "yearlyDeposit",
    label: "Yearly Investment (₹)",
    type: "currency",
    defaultValue: 150000,
    min: 250,
    max: 150000,
    step: 1000,
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
    name: "girlChildAge",
    label: "Girl Child Current Age (Years)",
    type: "number",
    defaultValue: 1,
    min: 0,
    max: 10,
    step: 1,
  },
  {
    name: "startYear",
    label: "Account Opening Year",
    type: "number",
    defaultValue: 2026,
    min: 2015,
    max: 2050,
    step: 1,
  },
];

export const ssyMetadata: CalculatorMetadata = {
  id: "ssy",
  name: "Sukanya Samriddhi Yojana (SSY) Calculator",
  shortDescription:
    "Calculate maturity corpus, interest earned, and year-by-year schedule for the government Sukanya Samriddhi Yojana scheme with the current 8.2% interest rate.",
  category: "finance",
  subcategory: "government",
  route: "/ssy-calculator",
  badge: "Government Scheme",
  directAnswer:
    "Depositing ₹1,50,000 annually into Sukanya Samriddhi Yojana (SSY) for 15 years at the statutory 8.2% interest rate generates a total deposit of ₹22,50,000 and matures to approximately ₹71,82,119 after 21 years. The entire maturity amount is completely exempt from income tax.",
  keywords: [
    "ssy calculator",
    "sukanya samriddhi yojana calculator",
    "ssy maturity calculator",
    "sukanya samriddhi scheme interest rate",
    "post office ssy calculator",
    "ssy calculator 2026",
    "girl child savings scheme calculator",
  ],
  formula: {
    expression: "Yearly Compounded Balance: Balance_t = (Balance_{t-1} + Deposit_t) × (1 + Interest Rate / 100)",
    variables: [
      { symbol: "Balance_t", label: "Closing Balance Year t", description: "Accumulated corpus at the end of year t" },
      { symbol: "Deposit_t", label: "Annual Deposit", description: "Deposit made in year t (₹0 for years 16 to 21)" },
      { symbol: "r", label: "Interest Rate", description: "Notified annual interest rate (currently 8.2% p.a.)" },
      { symbol: "t", label: "Tenure Year", description: "Year of account existence (1 to 21)" },
    ],
    steps: [
      { label: "Deposit Period", expression: "Annual Deposit > 0 for Years 1 to 15", explanation: "Deposits must be made annually for the first 15 years." },
      { label: "Lock-in Growth", expression: "Deposit = 0 for Years 16 to 21", explanation: "No deposits made; corpus continues to compound for 6 more years." },
      { label: "Maturity", expression: "Final Accumulated Balance after 21 Years", explanation: "Full accumulated tax-free maturity value paid out after 21 years." },
    ],
    notes: [
      "Interest is compounded annually and reviewed quarterly by the Ministry of Finance.",
      "Partial withdrawal of up to 50% of the previous financial year's balance is allowed after the girl child turns 18 for higher education.",
      "Full account closure occurs upon completion of 21 years or upon marriage after age 18.",
    ],
  },
  faqs: [
    {
      question: "What is the current interest rate for Sukanya Samriddhi Yojana (SSY)?",
      answer:
        "The current interest rate for Sukanya Samriddhi Yojana is 8.2% per annum, compounded annually. The interest rate is reviewed and set quarterly by the Ministry of Finance, Government of India.",
    },
    {
      question: "For how many years do I need to deposit in an SSY account?",
      answer:
        "Deposits must be made for 15 years from the date of account opening. From year 16 through year 21 (a 6-year period), no fresh deposits are required or permitted, but the accumulated corpus continues to earn compounded interest.",
    },
    {
      question: "What is the minimum and maximum deposit limit in SSY?",
      answer:
        "The minimum deposit is ₹250 per financial year, and the maximum deposit is ₹1,50,000 per financial year. Deposits exceeding ₹1,50,000 do not earn any interest and are refunded.",
    },
    {
      question: "Is the maturity amount from SSY taxable?",
      answer:
        "No. Sukanya Samriddhi Yojana enjoys Exempt-Exempt-Exempt (EEE) tax status. Deposits qualify for tax deduction under Section 80C (up to ₹1.5 Lakh), the annual interest earned is tax-exempt, and the final maturity amount is 100% tax-free under Section 10(11A) of the Income Tax Act.",
    },
    {
      question: "Can an SSY account be closed before 21 years?",
      answer:
        "Yes, the account can be closed early if the girl child marries after reaching 18 years of age (marriage cannot take place earlier). Additionally, up to 50% partial withdrawal is allowed after age 18 to fund certified higher education expenses.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release under CalculatorEngine contract with 8.2% statutory rate and 21-year schedule.",
  },
};

export const ssyEngine: CalculatorEngine<SsyInput, SsyResult> = {
  id: "ssy",
  metadata: ssyMetadata,
  schema: ssyInputSchema,
  defaultInputs: defaultSsyInput,
  fields: ssyFields,
  calculate: calculateSsy,
  formatResult: (result: SsyResult) => {
    return {
      raw: result,
      primary: {
        key: "maturityAmount",
        label: "Maturity Corpus (After 21 Years)",
        value: result.maturityAmount,
        formattedValue: formatINR(result.maturityAmount),
        subtext: `Maturity in ${result.maturityYear} | 100% Tax-Free under Section 10(11A)`,
        highlight: true,
      },
      secondary: [
        {
          key: "totalDeposit",
          label: "Total Amount Deposited",
          value: result.totalDeposit,
          formattedValue: formatINR(result.totalDeposit),
        },
        {
          key: "totalInterest",
          label: "Total Interest Earned",
          value: result.totalInterest,
          formattedValue: formatINR(result.totalInterest),
        },
        {
          key: "interestRate",
          label: "Interest Rate",
          value: result.interestRate,
          formattedValue: `${result.interestRate}% p.a.`,
        },
        {
          key: "maturityYear",
          label: "Year of Maturity",
          value: result.maturityYear,
          formattedValue: `${result.maturityYear}`,
        },
      ],
      summaryText: `By investing ${formatINR(result.yearlyDeposit)} every year for 15 years (total ${formatINR(result.totalDeposit)}), your daughter will receive a maturity sum of ${formatINR(result.maturityAmount)} at 21 years in ${result.maturityYear}. Total interest earned is ${formatINR(result.totalInterest)}.`,
    };
  },
};

registerCalculator(ssyEngine);
