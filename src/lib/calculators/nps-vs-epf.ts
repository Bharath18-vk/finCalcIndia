import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export interface NpsVsEpfInput {
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  epfInterestRate: number; // e.g. 8.25%
  npsExpectedReturn: number; // e.g. 10.5%
  npsAnnuityPercent: number; // min 40%, up to 100%
  expectedAnnuityRate: number; // e.g. 6.0%
  taxBracketPercent: number; // 0, 5, 10, 15, 20, 30%
}

export interface NpsVsEpfYearlyBreakdown {
  year: number;
  age: number;
  totalInvested: number;
  epfBalance: number;
  npsBalance: number;
  gapAmount: number;
}

export interface NpsVsEpfResult {
  tenureYears: number;
  totalInvested: number;
  epfTotalCorpus: number;
  epfInterestEarned: number;
  epfLumpSum: number;
  epfMonthlyPension: number;
  epfTaxExemptPercent: number;
  npsTotalCorpus: number;
  npsGainsEarned: number;
  npsLumpSum: number;
  npsAnnuityCorpus: number;
  npsMonthlyPension: number;
  npsTaxFreeLumpSumPercent: number;
  corpusDifference: number;
  corpusOutperformancePercent: number;
  additionalTaxSavings80CCD: number;
  schedule: NpsVsEpfYearlyBreakdown[];
}

export const npsVsEpfInputSchema = z
  .object({
    monthlyContribution: z
      .number({ invalid_type_error: "Monthly contribution must be a number" })
      .min(500, "Minimum monthly contribution is ₹500")
      .max(500000, "Maximum monthly contribution is ₹5,00,000"),
    currentAge: z
      .number({ invalid_type_error: "Current age must be a number" })
      .int("Age must be an integer")
      .min(18, "Minimum age is 18 years")
      .max(65, "Maximum age is 65 years"),
    retirementAge: z
      .number({ invalid_type_error: "Retirement age must be a number" })
      .int("Retirement age must be an integer")
      .min(45, "Minimum retirement age is 45 years")
      .max(75, "Maximum retirement age is 75 years"),
    epfInterestRate: z
      .number({ invalid_type_error: "EPF rate must be a number" })
      .min(4, "EPF interest rate must be at least 4%")
      .max(15, "EPF interest rate cannot exceed 15%"),
    npsExpectedReturn: z
      .number({ invalid_type_error: "NPS return must be a number" })
      .min(5, "NPS return rate must be at least 5%")
      .max(20, "NPS return rate cannot exceed 20%"),
    npsAnnuityPercent: z
      .number({ invalid_type_error: "Annuity percentage must be a number" })
      .min(40, "PFRDA mandates at least 40% annuity purchase")
      .max(100, "Annuity percentage cannot exceed 100%"),
    expectedAnnuityRate: z
      .number({ invalid_type_error: "Annuity yield rate must be a number" })
      .min(3, "Annuity return rate must be at least 3%")
      .max(12, "Annuity return rate cannot exceed 12%"),
    taxBracketPercent: z
      .number({ invalid_type_error: "Tax bracket must be a number" })
      .min(0, "Tax bracket cannot be negative")
      .max(30, "Tax bracket cannot exceed 30%"),
  })
  .refine((data) => data.retirementAge > data.currentAge, {
    message: "Retirement age must be strictly greater than current age",
    path: ["retirementAge"],
  });

export function calculateNpsVsEpf(input: NpsVsEpfInput): NpsVsEpfResult {
  const monthly = Math.max(0, isFinite(input.monthlyContribution) ? input.monthlyContribution : 10000);
  const curAge = Math.min(65, Math.max(18, Math.floor(isFinite(input.currentAge) ? input.currentAge : 30)));
  const retAge = Math.min(75, Math.max(curAge + 1, Math.floor(isFinite(input.retirementAge) ? input.retirementAge : 60)));
  const tenureYears = Math.max(1, retAge - curAge);

  const epfRate = (isFinite(input.epfInterestRate) && input.epfInterestRate > 0 ? input.epfInterestRate : 8.25) / 100;
  const npsRate = (isFinite(input.npsExpectedReturn) && input.npsExpectedReturn > 0 ? input.npsExpectedReturn : 10.5) / 100;
  const annuityPct = Math.min(100, Math.max(40, isFinite(input.npsAnnuityPercent) ? input.npsAnnuityPercent : 40)) / 100;
  const annuityYield = (isFinite(input.expectedAnnuityRate) && input.expectedAnnuityRate > 0 ? input.expectedAnnuityRate : 6.0) / 100;
  const taxBracket = Math.min(30, Math.max(0, isFinite(input.taxBracketPercent) ? input.taxBracketPercent : 30)) / 100;

  let epfBalance = 0;
  let npsBalance = 0;
  let totalInvested = 0;
  const schedule: NpsVsEpfYearlyBreakdown[] = [];

  const npsMonthlyRate = npsRate / 12;

  // Year by year progression
  for (let yr = 1; yr <= tenureYears; yr++) {
    // 12 monthly deposits in the year
    for (let m = 1; m <= 12; m++) {
      totalInvested += monthly;

      // NPS standard monthly compounding: balance grows each month + contribution
      npsBalance = (npsBalance + monthly) * (1 + npsMonthlyRate);

      // EPF crediting logic: interest computed on monthly running balance, credited at end of year
      // Approximate running monthly balance interest for year = monthly * (13 - m) * (epfRate / 12)
    }

    // EPF annual interest calculation:
    // Interest on opening balance: epfBalance * epfRate
    // Interest on new monthly deposits: monthly * (12 * 13 / 2) * (epfRate / 12) = monthly * 6.5 * epfRate
    const annualDeposit = monthly * 12;
    const epfInterestForYear = epfBalance * epfRate + monthly * 6.5 * epfRate;
    epfBalance = epfBalance + annualDeposit + epfInterestForYear;

    schedule.push({
      year: yr,
      age: curAge + yr,
      totalInvested: Math.round(totalInvested),
      epfBalance: Math.round(epfBalance),
      npsBalance: Math.round(npsBalance),
      gapAmount: Math.round(npsBalance - epfBalance),
    });
  }

  const epfTotalCorpus = Math.round(epfBalance);
  const npsTotalCorpus = Math.round(npsBalance);
  const totalInvestedRounded = Math.round(totalInvested);

  const epfInterestEarned = Math.max(0, epfTotalCorpus - totalInvestedRounded);
  const npsGainsEarned = Math.max(0, npsTotalCorpus - totalInvestedRounded);

  // EPF: 100% lump sum, 0 mandatory annuity, 100% tax free
  const epfLumpSum = epfTotalCorpus;
  const epfMonthlyPension = 0;
  const epfTaxExemptPercent = 100;

  // NPS: Max 60% lump sum (tax free under 10(12A)), Min 40% mandatory annuity
  const npsAnnuityCorpus = Math.round(npsTotalCorpus * annuityPct);
  const npsLumpSum = Math.max(0, npsTotalCorpus - npsAnnuityCorpus);
  const npsMonthlyPension = Math.round((npsAnnuityCorpus * annuityYield) / 12);
  const npsTaxFreeLumpSumPercent = Math.round((1 - annuityPct) * 100);

  const corpusDifference = npsTotalCorpus - epfTotalCorpus;
  const corpusOutperformancePercent =
    epfTotalCorpus > 0 ? Math.round(((npsTotalCorpus - epfTotalCorpus) / epfTotalCorpus) * 1000) / 10 : 0;

  // Additional 80CCD(1B) Tax Savings:
  // Up to ₹50,000 extra deduction per year not available for EPF
  // Annual tax saving = min(50000, monthly * 12) * taxBracket * 1.04 (cess)
  const annualEligible80CCD = Math.min(50000, monthly * 12);
  const annualTaxSaved = annualEligible80CCD * taxBracket * 1.04;
  const additionalTaxSavings80CCD = Math.round(annualTaxSaved * tenureYears);

  return {
    tenureYears,
    totalInvested: totalInvestedRounded,
    epfTotalCorpus,
    epfInterestEarned,
    epfLumpSum,
    epfMonthlyPension,
    epfTaxExemptPercent,
    npsTotalCorpus,
    npsGainsEarned,
    npsLumpSum,
    npsAnnuityCorpus,
    npsMonthlyPension,
    npsTaxFreeLumpSumPercent,
    corpusDifference,
    corpusOutperformancePercent,
    additionalTaxSavings80CCD,
    schedule,
  };
}

export const defaultNpsVsEpfInputs: NpsVsEpfInput = {
  monthlyContribution: 10000,
  currentAge: 30,
  retirementAge: 60,
  epfInterestRate: 8.25,
  npsExpectedReturn: 10.5,
  npsAnnuityPercent: 40,
  expectedAnnuityRate: 6.0,
  taxBracketPercent: 30,
};

const npsVsEpfFields: CalculatorField<NpsVsEpfInput>[] = [
  {
    name: "monthlyContribution",
    label: "Monthly Contribution (₹)",
    type: "number",
    defaultValue: 10000,
    min: 500,
    max: 500000,
    step: 500,
    unit: "₹",
    helperText: "Equal monthly amount invested in both schemes for comparison.",
  },
  {
    name: "currentAge",
    label: "Current Age (Years)",
    type: "number",
    defaultValue: 30,
    min: 18,
    max: 65,
    step: 1,
    unit: "yrs",
  },
  {
    name: "retirementAge",
    label: "Retirement Age (Years)",
    type: "number",
    defaultValue: 60,
    min: 45,
    max: 75,
    step: 1,
    unit: "yrs",
  },
  {
    name: "epfInterestRate",
    label: "EPF Statutory Interest Rate (% p.a.)",
    type: "number",
    defaultValue: 8.25,
    min: 4,
    max: 15,
    step: 0.05,
    unit: "%",
    helperText: "Current EPFO declared rate for FY 2023-24 & 2024-25 is 8.25%.",
  },
  {
    name: "npsExpectedReturn",
    label: "NPS Expected Return (CAGR % p.a.)",
    type: "number",
    defaultValue: 10.5,
    min: 5,
    max: 20,
    step: 0.25,
    unit: "%",
    helperText: "Historical long-term multi-asset return (Equity + Debt) ranges 10%–12%.",
  },
  {
    name: "npsAnnuityPercent",
    label: "NPS Annuity Allocation (%)",
    type: "number",
    defaultValue: 40,
    min: 40,
    max: 100,
    step: 5,
    unit: "%",
    helperText: "PFRDA mandates at least 40% of NPS corpus for monthly annuity pension.",
  },
  {
    name: "expectedAnnuityRate",
    label: "Expected Annuity Return (% p.a.)",
    type: "number",
    defaultValue: 6.0,
    min: 3,
    max: 12,
    step: 0.25,
    unit: "%",
    helperText: "Annuity service provider annual yield (e.g., LIC, SBI Life).",
  },
  {
    name: "taxBracketPercent",
    label: "Your Income Tax Bracket (%)",
    type: "select",
    defaultValue: 30,
    options: [
      { label: "30% Slab (Highest)", value: 30 },
      { label: "20% Slab", value: 20 },
      { label: "15% Slab", value: 15 },
      { label: "10% Slab", value: 10 },
      { label: "5% Slab", value: 5 },
      { label: "0% (Exempt)", value: 0 },
    ],
    helperText: "Used to compute additional annual Section 80CCD(1B) tax savings.",
  },
];

const npsVsEpfMetadata: CalculatorMetadata = {
  id: "nps-vs-epf",
  name: "NPS vs EPF Calculator",
  route: "/nps-vs-epf-calculator",
  category: "finance",
  shortDescription:
    "Compare National Pension System (NPS) vs Employees' Provident Fund (EPF): retirement corpus, lump-sum tax rules, monthly pension, and Section 80CCD tax savings.",
  badge: "Retirement Strategy",
  directAnswer:
    "While EPF offers a sovereign-guaranteed 8.25% return and 100% tax-free lump-sum withdrawal at retirement, NPS delivers significantly higher long-term compounding (10%–12% CAGR) due to equity allocation. However, NPS mandates that at least 40% of the corpus must be converted into a taxable monthly annuity pension.",
  formula: {
    expression: "\\text{Corpus Gap} = \\text{FV}_{\\text{NPS}} - \\text{FV}_{\\text{EPF}} \\quad \\mid \\quad \\text{Annuity Pension} = \\frac{\\text{Corpus}_{\\text{NPS}} \\times A_{\\%} \\times R_{\\text{ann}}}{12}",
    variables: [
      { symbol: "\\text{FV}_{\\text{EPF}}", label: "EPF Maturity Corpus", description: "EPF maturity corpus compounded with 8.25% p.a. annual interest crediting" },
      { symbol: "\\text{FV}_{\\text{NPS}}", label: "NPS Market Corpus", description: "NPS market-linked corpus compounded monthly at expected CAGR" },
      { symbol: "A_{\\%}", label: "Annuity Allocation", description: "Mandatory annuity allocation percentage (minimum 40%)" },
      { symbol: "R_{\\text{ann}}", label: "Annuity Return Rate", description: "Annuity provider annual yield generating monthly pension" },
      { symbol: "\\text{80CCD}", label: "Section 80CCD(1B)", description: "Exclusive ₹50,000 additional annual tax deduction for NPS Tier-1" },
    ],
    steps: [
      { label: "Simulate Compounding", expression: "\\text{FV}_{\\text{EPF}} \\text{ vs } \\text{FV}_{\\text{NPS}}", explanation: "Simulate 30-year career wealth under EPF statutory crediting and NPS market CAGR." },
      { label: "Partition Liquidity & Pension", expression: "60\\% \\text{ Lump Sum} + 40\\% \\text{ Annuity}", explanation: "Allocate 60% tax-free withdrawal and 40% mandatory monthly pension." },
      { label: "Calculate Career Tax Alpha", expression: "\\text{Tax Saved} = 50000 \\times t_{\\text{slab}} \\times n", explanation: "Compute lifetime tax deductions under Section 80CCD(1B)." },
    ],
    notes: [
      "EPF enjoys EEE tax status: 100% tax exemption on contributions (up to ₹2.5L/yr), interest accrued, and maturity lump sum.",
      "NPS lump-sum withdrawal (up to 60%) is 100% tax-free under Section 10(12A). Annuity income received monthly is taxable as pension under your income tax slab.",
      "NPS provides an additional ₹50,000 tax deduction under Section 80CCD(1B), beyond the ₹1.5 lakh Section 80C limit.",
    ],
  },
  faqs: [
    {
      question: "Which is better for retirement: NPS or EPF?",
      answer:
        "Neither is universally superior; they serve complementary roles. EPF provides guaranteed capital security with 8.25% sovereign returns and 100% tax-free lump-sum liquidity. NPS delivers superior long-term wealth creation via equity exposure (10%–12% CAGR) and forces disciplined retirement income via its mandatory 40% annuity pension.",
    },
    {
      question: "Can I invest in both EPF and NPS simultaneously?",
      answer:
        "Yes, and financial planners strongly recommend doing so. Salaried employees can contribute their mandatory 12% to EPF for sovereign safety and an additional ₹50,000 annually to NPS Tier-1 to claim exclusive tax deductions under Section 80CCD(1B).",
    },
    {
      question: "Is NPS maturity corpus completely tax-free like EPF?",
      answer:
        "At retirement (age 60), 60% of the NPS corpus can be withdrawn as a 100% tax-free lump sum under Section 10(12A). The remaining 40% must be used to purchase an annuity, which is not taxed at purchase; however, the monthly pension payouts are taxed as regular income.",
    },
    {
      question: "What is the extra tax benefit of NPS over EPF?",
      answer:
        "Under Section 80CCD(1B), individual NPS subscribers can claim an exclusive deduction of up to ₹50,000 per financial year, over and above the ₹1.5 lakh limit of Section 80C. In the 30% tax bracket with 4% cess, this saves ₹15,600 in tax every single year.",
    },
  ],
  keywords: [
    "nps vs epf calculator",
    "epf vs nps comparison",
    "national pension system vs provident fund",
    "nps annuity calculator",
    "80ccd 1b tax savings calculator",
    "nps returns vs epf returns",
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Retirement comparison between EPFO and PFRDA regulatory frameworks.",
  },
};

export const npsVsEpfEngine: CalculatorEngine<NpsVsEpfInput, NpsVsEpfResult> = {
  id: "nps-vs-epf",
  metadata: npsVsEpfMetadata,
  schema: npsVsEpfInputSchema,
  defaultInputs: defaultNpsVsEpfInputs,
  fields: npsVsEpfFields,
  calculate: calculateNpsVsEpf,
};

registerCalculator(npsVsEpfEngine);
