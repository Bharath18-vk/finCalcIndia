import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export interface LoanOptionInput {
  principal: number;
  interestRate: number; // in %
  tenureYears: number; // in years
  processingFeePercent?: number; // in %
}

export interface LoanComparisonInput {
  loanA: LoanOptionInput;
  loanB: LoanOptionInput;
}

export interface LoanOptionResult {
  principal: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  emi: number;
  totalInterest: number;
  totalRepayment: number;
  processingFee: number;
  totalCost: number; // totalRepayment + processingFee
}

export interface LoanComparisonResult {
  optionA: LoanOptionResult;
  optionB: LoanOptionResult;
  emiDifference: number; // optionA.emi - optionB.emi
  interestDifference: number; // optionA.totalInterest - optionB.totalInterest
  totalCostDifference: number; // optionA.totalCost - optionB.totalCost
  cheaperOption: "A" | "B" | "Equal";
  lowerEmiOption: "A" | "B" | "Equal";
  totalSavings: number;
  monthlySavings: number;
}

const loanOptionSchema = z.object({
  principal: z
    .number({ invalid_type_error: "Loan amount must be a number" })
    .positive("Loan amount must be greater than zero")
    .max(1000000000, "Loan amount cannot exceed ₹100 Crores"),
  interestRate: z
    .number({ invalid_type_error: "Interest rate must be a number" })
    .min(0.1, "Interest rate must be at least 0.1%")
    .max(50, "Interest rate cannot exceed 50%"),
  tenureYears: z
    .number({ invalid_type_error: "Tenure must be a number" })
    .positive("Tenure must be positive")
    .max(40, "Tenure cannot exceed 40 years"),
  processingFeePercent: z
    .number({ invalid_type_error: "Processing fee must be a number" })
    .min(0, "Fee cannot be negative")
    .max(10, "Fee cannot exceed 10%")
    .default(0.5),
});

export const loanComparisonInputSchema = z.object({
  loanA: loanOptionSchema,
  loanB: loanOptionSchema,
});

function calculateSingleLoan(opt: LoanOptionInput): LoanOptionResult {
  const principal = Math.max(1000, isFinite(opt.principal) ? opt.principal : 2500000);
  const annualRate = Math.max(0.1, isFinite(opt.interestRate) ? opt.interestRate : 8.5);
  const tenureYears = Math.min(40, Math.max(0.5, isFinite(opt.tenureYears) ? opt.tenureYears : 20));
  const feePercent = Math.max(0, isFinite(opt.processingFeePercent ?? 0) ? (opt.processingFeePercent ?? 0) : 0);

  const tenureMonths = Math.round(tenureYears * 12);
  const monthlyRate = annualRate / 12 / 100;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = Math.round(principal / tenureMonths);
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  }

  const totalRepayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - principal);
  const processingFee = Math.round((principal * feePercent) / 100);
  const totalCost = totalRepayment + processingFee;

  return {
    principal,
    interestRate: annualRate,
    tenureYears,
    tenureMonths,
    emi,
    totalInterest,
    totalRepayment,
    processingFee,
    totalCost,
  };
}

export function calculateLoanComparison(input: LoanComparisonInput): LoanComparisonResult {
  const optionA = calculateSingleLoan(input.loanA);
  const optionB = calculateSingleLoan(input.loanB);

  const emiDifference = Math.round((optionA.emi - optionB.emi) * 100) / 100;
  const interestDifference = Math.round((optionA.totalInterest - optionB.totalInterest) * 100) / 100;
  const totalCostDifference = Math.round((optionA.totalCost - optionB.totalCost) * 100) / 100;

  let cheaperOption: "A" | "B" | "Equal" = "Equal";
  if (totalCostDifference > 0) {
    cheaperOption = "B";
  } else if (totalCostDifference < 0) {
    cheaperOption = "A";
  }

  let lowerEmiOption: "A" | "B" | "Equal" = "Equal";
  if (emiDifference > 0) {
    lowerEmiOption = "B";
  } else if (emiDifference < 0) {
    lowerEmiOption = "A";
  }

  const totalSavings = Math.abs(totalCostDifference);
  const monthlySavings = Math.abs(emiDifference);

  return {
    optionA,
    optionB,
    emiDifference,
    interestDifference,
    totalCostDifference,
    cheaperOption,
    lowerEmiOption,
    totalSavings,
    monthlySavings,
  };
}

export const defaultLoanComparisonInputs: LoanComparisonInput = {
  loanA: {
    principal: 5000000,
    interestRate: 8.5,
    tenureYears: 20,
    processingFeePercent: 0.5,
  },
  loanB: {
    principal: 5000000,
    interestRate: 8.75,
    tenureYears: 20,
    processingFeePercent: 0.25,
  },
};

const loanComparisonFields: CalculatorField<LoanComparisonInput>[] = [
  {
    name: "loanA",
    label: "Loan Option A",
    type: "number",
    defaultValue: defaultLoanComparisonInputs.loanA,
    helperText: "First loan offer parameters.",
  },
  {
    name: "loanB",
    label: "Loan Option B",
    type: "number",
    defaultValue: defaultLoanComparisonInputs.loanB,
    helperText: "Second loan offer parameters.",
  },
];

const loanComparisonMetadata: CalculatorMetadata = {
  id: "loan-comparison",
  name: "Loan Comparison Calculator India",
  route: "/loan-comparison-calculator",
  category: "finance",
  shortDescription:
    "Compare two home, personal, or car loan offers side by side: EMI, total interest, processing fees, and overall savings.",
  badge: "Bank Offer Comparison",
  directAnswer:
    "Comparing loan offers requires analyzing both monthly EMI and lifetime total cost including processing fees. A small 0.25% interest rate reduction on a ₹50 Lakh 20-year home loan saves over ₹1,87,000 in interest.",
  formula: {
    expression: "Monthly EMI = [P × r × (1 + r)ⁿ] / [(1 + r)ⁿ - 1]  |  Total Lifetime Outflow = (EMI × n) + Processing Fees",
    variables: [
      { symbol: "P", label: "Principal Amount", description: "Loan principal borrowed in Indian Rupees" },
      { symbol: "r", label: "Monthly Interest Rate", description: "Monthly rate = Annual Rate / 12 / 100" },
      { symbol: "n", label: "Number of Months", description: "Total monthly installments = Years × 12" },
      { symbol: "Cost", label: "Total Cost", description: "Lifetime principal + interest + upfront bank processing charges" },
    ],
    steps: [
      { label: "Compute Reducing Balance EMI", expression: "EMI = [P × r × (1 + r)ⁿ] / [(1 + r)ⁿ - 1]", explanation: "Calculate monthly installment for both loan options." },
      { label: "Aggregate Total Lifetime Outflow", expression: "Total Outflow = (EMI × n) + Upfront Fees", explanation: "Sum total monthly installments and upfront bank charges." },
      { label: "Compute Net Cost Differential", expression: "Net Savings = |Total Cost A - Total Cost B|", explanation: "Identify lowest cost option and exact lifetime rupee savings." },
    ],
    notes: [
      "A longer tenure reduces your monthly EMI but significantly increases the total interest burden.",
      "Factor in upfront processing fees and GST (18% on bank processing fee) when comparing low-rate offers from private banks vs PSBs.",
    ],
  },
  faqs: [
    {
      question: "How do I choose between a lower EMI and a lower interest rate?",
      answer:
        "If monthly cash flow is your primary constraint, a lower EMI helps keep debt within budget. However, if your goal is minimizing total money paid to the bank, always choose the option with lower total lifetime cost (usually shorter tenure or lower interest rate).",
    },
    {
      question: "Does a 0.25% difference in home loan interest rate really matter?",
      answer:
        "Yes, substantially. On a ₹50 Lakh home loan over 20 years, an 8.50% interest rate costs ₹54.13 Lakhs in interest, whereas an 8.75% rate costs ₹56.00 Lakhs—a difference of nearly ₹1.87 Lakhs for just a 25 basis point change.",
    },
    {
      question: "Are processing fees negotiable in Indian banks?",
      answer:
        "Yes. During festive seasons or balance transfer promotions, many public and private banks offer 50% to 100% processing fee waivers. Always factor in processing fee waivers when comparing offers.",
    },
  ],
  keywords: [
    "loan comparison calculator",
    "compare home loans india",
    "emi comparison calculator",
    "compare loan interest rates",
    "home loan balance transfer comparison",
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Parallel reducing-balance loan comparison with processing fee calculation.",
  },
};

export const loanComparisonEngine: CalculatorEngine<LoanComparisonInput, LoanComparisonResult> = {
  id: "loan-comparison",
  metadata: loanComparisonMetadata,
  schema: loanComparisonInputSchema,
  defaultInputs: defaultLoanComparisonInputs,
  fields: loanComparisonFields,
  calculate: calculateLoanComparison,
};

registerCalculator(loanComparisonEngine);
