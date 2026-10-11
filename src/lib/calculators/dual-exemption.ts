import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export type LivingArrangementScenario =
  | "different_city"
  | "same_city_workplace_distance"
  | "let_out_owned"
  | "under_construction";

export interface DualExemptionInput {
  basicSalaryMonthly: number; // Basic Salary + DA per month in ₹
  hraReceivedMonthly: number; // HRA allowance received per month in ₹
  rentPaidMonthly: number; // Actual rent paid per month in ₹
  cityType: "metro" | "non_metro"; // 50% for Delhi/Mumbai/Kolkata/Chennai, 40% other
  annualHomeLoanInterest: number; // Interest paid on home loan in ₹
  annualHomeLoanPrincipal: number; // Principal repaid in ₹ (Section 80C)
  isFirstTimeHomeBuyer80EEA?: boolean; // Section 80EEA eligible up to ₹1.5L
  scenario: LivingArrangementScenario;
  rentalIncomeReceivedAnnual?: number; // If owned home is let out
  existing80CDeductions?: number; // PF, ELSS, PPF already claiming 80C
  taxSlabRatePercent?: number; // 20% or 30% slab rate
}

export interface DualExemptionResult {
  // HRA Details
  annualBasicSalary: number;
  annualHraReceived: number;
  annualRentPaid: number;
  hraExemptionAnnual: number;
  taxableHraAnnual: number;

  // Home Loan Deductions
  allowableInterestSec24b: number;
  allowablePrincipalSec80C: number;
  allowableAdditionalSec80EEA: number;
  netHousePropertyIncomeOrLoss: number;

  // Combined Totals
  totalTaxDeductionsClaimed: number;
  taxSavedOldRegime: number;
  effectiveMonthlySavings: number;

  // Compliance & Regime Advisory
  scenarioNote: string;
  regimeComparisonAdvice: string;
  auditChecklist: string[];
}

export const dualExemptionSchema = z.object({
  basicSalaryMonthly: z
    .number({ invalid_type_error: "Basic salary must be a number" })
    .positive("Basic salary must be greater than zero")
    .max(5000000, "Monthly basic cannot exceed ₹50 Lakhs"),
  hraReceivedMonthly: z
    .number({ invalid_type_error: "HRA received must be a number" })
    .min(0, "HRA received cannot be negative")
    .max(5000000, "Monthly HRA cannot exceed ₹50 Lakhs"),
  rentPaidMonthly: z
    .number({ invalid_type_error: "Rent paid must be a number" })
    .min(0, "Rent paid cannot be negative")
    .max(5000000, "Monthly rent cannot exceed ₹50 Lakhs"),
  cityType: z.enum(["metro", "non_metro"]),
  annualHomeLoanInterest: z
    .number({ invalid_type_error: "Interest must be a number" })
    .min(0, "Interest cannot be negative")
    .max(50000000, "Interest cannot exceed ₹5 Crores"),
  annualHomeLoanPrincipal: z
    .number({ invalid_type_error: "Principal must be a number" })
    .min(0, "Principal cannot be negative")
    .max(10000000, "Principal cannot exceed ₹1 Crore"),
  isFirstTimeHomeBuyer80EEA: z.boolean().default(false),
  scenario: z.enum([
    "different_city",
    "same_city_workplace_distance",
    "let_out_owned",
    "under_construction",
  ]),
  rentalIncomeReceivedAnnual: z
    .number({ invalid_type_error: "Rental income must be a number" })
    .min(0)
    .default(0),
  existing80CDeductions: z
    .number({ invalid_type_error: "Existing 80C must be a number" })
    .min(0)
    .max(150000)
    .default(50000),
  taxSlabRatePercent: z
    .number({ invalid_type_error: "Tax slab must be a number" })
    .min(0)
    .max(39)
    .default(30),
});

export const defaultDualExemptionInputs: DualExemptionInput = {
  basicSalaryMonthly: 80000, // ₹80,000 / month basic
  hraReceivedMonthly: 35000, // ₹35,000 / month HRA
  rentPaidMonthly: 30000, // ₹30,000 / month rent paid
  cityType: "metro",
  annualHomeLoanInterest: 240000, // ₹2,40,000 interest
  annualHomeLoanPrincipal: 120000, // ₹1,20,000 principal
  isFirstTimeHomeBuyer80EEA: false,
  scenario: "different_city",
  rentalIncomeReceivedAnnual: 0,
  existing80CDeductions: 50000,
  taxSlabRatePercent: 30,
};

export function calculateDualExemption(
  input: DualExemptionInput
): DualExemptionResult {
  const {
    basicSalaryMonthly,
    hraReceivedMonthly,
    rentPaidMonthly,
    cityType,
    annualHomeLoanInterest,
    annualHomeLoanPrincipal,
    isFirstTimeHomeBuyer80EEA = false,
    scenario,
    rentalIncomeReceivedAnnual = 0,
    existing80CDeductions = 50000,
    taxSlabRatePercent = 30,
  } = input;

  const annualBasicSalary = basicSalaryMonthly * 12;
  const annualHraReceived = hraReceivedMonthly * 12;
  const annualRentPaid = rentPaidMonthly * 12;

  // 1. Calculate HRA Exemption under Section 10(13A) read with Rule 2A
  let hraExemptionAnnual = 0;
  if (annualRentPaid > 0 && annualHraReceived > 0) {
    const salaryPercentageLimit = cityType === "metro" ? 0.5 : 0.4;
    const criterion1 = annualHraReceived;
    const criterion2 = annualBasicSalary * salaryPercentageLimit;
    const criterion3 = Math.max(0, annualRentPaid - 0.1 * annualBasicSalary);

    hraExemptionAnnual = Math.round(
      Math.min(criterion1, criterion2, criterion3)
    );
  }
  const taxableHraAnnual = Math.max(0, annualHraReceived - hraExemptionAnnual);

  // 2. Calculate Home Loan Deductions
  let allowableInterestSec24b = 0;
  let netHousePropertyIncomeOrLoss = 0;

  if (scenario === "let_out_owned") {
    // Let-out house: Rental Income - Standard Deduction 30% - Full Interest
    const standardDeduction = rentalIncomeReceivedAnnual * 0.3;
    const netRentalIncome = rentalIncomeReceivedAnnual - standardDeduction;
    const lossFromProperty = netRentalIncome - annualHomeLoanInterest;

    // Under Section 71(3A), loss from house property set off against salary is capped at ₹2 Lakhs per FY
    if (lossFromProperty < 0) {
      allowableInterestSec24b = Math.min(200000, Math.abs(lossFromProperty));
      netHousePropertyIncomeOrLoss = -allowableInterestSec24b;
    } else {
      netHousePropertyIncomeOrLoss = lossFromProperty;
      allowableInterestSec24b = 0;
    }
  } else if (scenario === "under_construction") {
    // Under construction: Interest cannot be claimed until possession is completed
    allowableInterestSec24b = 0;
    netHousePropertyIncomeOrLoss = 0;
  } else {
    // Self-Occupied (different city or genuine same city commute)
    // Section 24(b) capped at ₹2,00,000 for self-occupied
    allowableInterestSec24b = Math.min(200000, annualHomeLoanInterest);
    netHousePropertyIncomeOrLoss = -allowableInterestSec24b;
  }

  // Section 80C Principal (capped at ₹1,50,000 combined limit)
  let allowablePrincipalSec80C = 0;
  if (scenario !== "under_construction") {
    const remaining80C = Math.max(0, 150000 - existing80CDeductions);
    allowablePrincipalSec80C = Math.min(remaining80C, annualHomeLoanPrincipal);
  }

  // Section 80EEA (First time home buyer affordable housing interest up to ₹1.5L)
  let allowableAdditionalSec80EEA = 0;
  if (isFirstTimeHomeBuyer80EEA && scenario !== "under_construction") {
    const excessInterest = Math.max(0, annualHomeLoanInterest - 200000);
    allowableAdditionalSec80EEA = Math.min(150000, excessInterest);
  }

  // Total Deductions
  const totalTaxDeductionsClaimed =
    hraExemptionAnnual +
    allowableInterestSec24b +
    allowablePrincipalSec80C +
    allowableAdditionalSec80EEA;

  // Tax Saved in Old Regime (Slab + 4% Cess)
  const effectiveTaxRate = (taxSlabRatePercent / 100) * 1.04;
  const taxSavedOldRegime = Math.round(
    totalTaxDeductionsClaimed * effectiveTaxRate
  );
  const effectiveMonthlySavings = Math.round(taxSavedOldRegime / 12);

  // Scenario explanation notes
  let scenarioNote = "";
  const auditChecklist: string[] = [
    "Valid registered rent agreement for rented residence",
    "Rent receipts with Landlord PAN (mandatory if annual rent > ₹1,00,000)",
    "Home Loan provisional interest certificate from lending bank/NBFC",
    "Proof of ownership / possession letter of owned property",
  ];

  if (scenario === "different_city") {
    scenarioNote =
      "Legally Fully Allowed: The Income Tax Act fully permits claiming HRA for a rented home in your work location and Section 24(b) (up to ₹2 Lakh) + Section 80C for an owned home in another city where your family resides or which you cannot occupy due to employment.";
    auditChecklist.push(
      "Employer appointment/deputation letter confirming your employment location"
    );
  } else if (scenario === "same_city_workplace_distance") {
    scenarioNote =
      "Allowed with Justification: If both properties are in the same city, you can claim both deductions only if your owned home is at an impractical distance from your workplace (e.g. 35+ km across town), or occupied by elderly parents. Maintain strict documentation of daily travel distance to satisfy assessing officers.";
    auditChecklist.push(
      "Proof of practical commuting distance between owned home, rented home, and office"
    );
  } else if (scenario === "let_out_owned") {
    scenarioNote =
      "Fully Allowed with Rental Declaration: Your owned property generates rental income, which is taxable under 'Income from House Property' after 30% standard deduction. You can deduct full interest, set off loss up to ₹2 Lakh against your salary, and claim 100% HRA for your rented living residence.";
    auditChecklist.push("Bank statements reflecting rental income credits from tenant");
  } else {
    scenarioNote =
      "Under-Construction Restriction: You can claim 100% HRA right now. However, home loan interest on an under-construction property CANNOT be claimed during construction. Accumulate this pre-construction interest; once possession is handed over, you can claim it in 5 equal annual installments under Section 24(b).";
    auditChecklist.push(
      "Builder allotment letter and construction milestone payment receipts"
    );
  }

  const regimeComparisonAdvice =
    "Tax Regime Alert: Under the New Tax Regime (Section 115BAC), neither HRA exemption nor Section 24(b) interest deduction for self-occupied property is allowed. With a massive deduction of ₹" +
    totalTaxDeductionsClaimed.toLocaleString("en-IN") +
    ", you save ₹" +
    taxSavedOldRegime.toLocaleString("en-IN") +
    " per year under the Old Tax Regime. Unless your total income is below ₹7.75 Lakhs, the Old Tax Regime is significantly more beneficial for you.";

  return {
    annualBasicSalary,
    annualHraReceived,
    annualRentPaid,
    hraExemptionAnnual,
    taxableHraAnnual,
    allowableInterestSec24b,
    allowablePrincipalSec80C,
    allowableAdditionalSec80EEA,
    netHousePropertyIncomeOrLoss,
    totalTaxDeductionsClaimed,
    taxSavedOldRegime,
    effectiveMonthlySavings,
    scenarioNote,
    regimeComparisonAdvice,
    auditChecklist,
  };
}

export const dualExemptionFields: CalculatorField<DualExemptionInput>[] = [
  {
    name: "scenario",
    label: "Living & Housing Scenario",
    type: "select",
    defaultValue: "different_city",
    options: [
      {
        label: "Owned home in Hometown, Rented home in Work City",
        value: "different_city",
        description: "100% allowable by law due to employment necessity",
      },
      {
        label: "Both Owned & Rented homes in Same City (Distance/Parents)",
        value: "same_city_workplace_distance",
        description: "Allowable with commuting distance & genuine necessity proof",
      },
      {
        label: "Owned home is Rented Out, living in Rented flat",
        value: "let_out_owned",
        description: "Declare rental income, deduct interest, and claim HRA",
      },
      {
        label: "Owned home is Under Construction, living on rent",
        value: "under_construction",
        description: "HRA allowed now; interest claimable in 5 installments post-possession",
      },
    ],
  },
  {
    name: "basicSalaryMonthly",
    label: "Basic Salary + DA (Monthly)",
    type: "currency",
    defaultValue: 80000,
    unit: "₹",
    min: 10000,
    max: 1000000,
    step: 5000,
    presets: [
      { label: "₹50,000", value: 50000 },
      { label: "₹80,000", value: 80000 },
      { label: "₹1,20,000", value: 120000 },
      { label: "₹2,00,000", value: 200000 },
    ],
  },
  {
    name: "hraReceivedMonthly",
    label: "HRA Received from Employer (Monthly)",
    type: "currency",
    defaultValue: 35000,
    unit: "₹",
    min: 0,
    max: 500000,
    step: 2500,
    presets: [
      { label: "₹20,000", value: 20000 },
      { label: "₹35,000", value: 35000 },
      { label: "₹50,000", value: 50000 },
      { label: "₹75,000", value: 75000 },
    ],
  },
  {
    name: "rentPaidMonthly",
    label: "Actual Rent Paid (Monthly)",
    type: "currency",
    defaultValue: 30000,
    unit: "₹",
    min: 0,
    max: 500000,
    step: 2500,
    presets: [
      { label: "₹18,000", value: 18000 },
      { label: "₹30,000", value: 30000 },
      { label: "₹45,000", value: 45000 },
      { label: "₹60,000", value: 60000 },
    ],
  },
  {
    name: "cityType",
    label: "Rented City Accommodation Type",
    type: "select",
    defaultValue: "metro",
    options: [
      { label: "Metro (Delhi, Mumbai, Kolkata, Chennai - 50% limit)", value: "metro" },
      { label: "Non-Metro (Bengaluru, Hyderabad, Pune, etc. - 40% limit)", value: "non_metro" },
    ],
  },
  {
    name: "annualHomeLoanInterest",
    label: "Annual Home Loan Interest Paid",
    type: "currency",
    defaultValue: 240000,
    unit: "₹",
    min: 0,
    max: 2000000,
    step: 10000,
    presets: [
      { label: "₹1,50,000", value: 150000 },
      { label: "₹2,00,000 (Sec 24 Cap)", value: 200000 },
      { label: "₹2,50,000", value: 250000 },
      { label: "₹3,50,000", value: 350000 },
    ],
  },
  {
    name: "annualHomeLoanPrincipal",
    label: "Annual Home Loan Principal Repaid",
    type: "currency",
    defaultValue: 120000,
    unit: "₹",
    min: 0,
    max: 1000000,
    step: 10000,
  },
];

export const dualExemptionMetadata: CalculatorMetadata = {
  id: "dual-exemption-calculator",
  name: "Dual Tax Exemption Optimizer (HRA + Home Loan Interest Simultaneous Claim)",
  shortDescription:
    "Evaluate simultaneous income tax claims for House Rent Allowance (Section 10(13A)) and Home Loan deductions (Section 24(b) & Section 80C) with legal compliance rules.",
  category: "finance",
  subcategory: "Taxation",
  route: "/dual-exemption-calculator",
  badge: "HRA + Home Loan Rules",
  directAnswer:
    "You can legally claim both HRA exemption under Section 10(13A) and Home Loan interest deduction up to ₹2 Lakh under Section 24(b) if you own a home in one city (or your hometown) but live in a rented home in another city due to your employment or business.",
  keywords: [
    "dual tax exemption calculator",
    "can i claim hra and home loan together",
    "hra and section 24b simultaneous deduction",
    "home loan tax benefit with rent",
    "income tax double exemption calculator india",
  ],
  formula: {
    expression: "Total Deduction = HRA Exemption (Rule 2A) + Section 24(b) (Max ₹2L) + Section 80C (Max ₹1.5L)",
    variables: [
      { symbol: "HRA", label: "HRA Exemption", description: "Least of actual HRA, 50%/40% Basic, or Rent - 10% Basic" },
      { symbol: "Sec 24(b)", label: "Interest Deduction", description: "Up to ₹2,00,000 for self-occupied home" },
      { symbol: "Sec 80C", label: "Principal Deduction", description: "Up to ₹1,50,000 subject to combined 80C limit" },
    ],
    steps: [
      {
        label: "Calculate Section 10(13A) HRA Exemption",
        expression: "HRA = min(Actual HRA, 50%/40% Basic, Rent - 10% Basic)",
        explanation: "Derive allowable HRA tax relief under Rule 2A of Income Tax Rules.",
      },
      {
        label: "Calculate Section 24(b) Interest Relief",
        expression: "Sec 24(b) = min(Annual Interest, ₹2,00,000)",
        explanation: "Cap interest deduction at ₹2,00,000 for self-occupied residential property.",
      },
      {
        label: "Combine Total Taxable Income Deductions",
        expression: "Total Deduction = HRA + Sec 24(b) + Sec 80C Principal",
        explanation: "Compute the combined reduction in gross taxable income under the Old Tax Regime.",
      },
    ],
  },
  faqs: [
    {
      question: "Can I claim both HRA and Home Loan interest in the same financial year?",
      answer:
        "Yes, absolutely. The Income Tax Act does not prohibit claiming both. If you own a house in one city (e.g. Pune) but live in a rented home in another city (e.g. Bangalore) because of your job, you can claim 100% of both HRA exemption and Section 24(b) interest deduction.",
    },
    {
      question: "Can I claim both if the rented house and owned house are in the same city?",
      answer:
        "Yes, but you must establish genuine necessity — for example, if your owned house is too far from your workplace (e.g., 35+ km commute across Delhi-NCR or Mumbai) or is occupied by dependent elderly parents. If scrutinized by the Income Tax Department, you will need to justify why you cannot live in your owned property.",
    },
    {
      question: "Is HRA and Home Loan deduction available under the New Tax Regime?",
      answer:
        "No. Under the New Tax Regime (Section 115BAC), both HRA exemption and Section 24(b) interest deduction on self-occupied properties are disallowed. If you have significant dual claims, the Old Tax Regime usually saves far more money.",
    },
    {
      question: "What documents must I keep for dual tax claims?",
      answer:
        "Keep your registered rent agreement, rent payment receipts, landlord's PAN (if annual rent exceeds ₹1 Lakh), bank home loan provisional interest certificate, and employment location proof.",
    },
  ],
  sources: [
    {
      name: "Income Tax Department India - Section 10(13A) & Rule 2A",
      url: "https://incometaxindia.gov.in",
    },
    {
      name: "Section 24(b) Deductions from Income from House Property",
      url: "https://incometaxindia.gov.in",
    },
  ],
  version: {
    version: "1.0.0",
    effectiveFrom: "2024-04-01",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release of Dual Tax Exemption Optimizer with multi-scenario statutory rules.",
  },
};

export const dualExemptionEngine: CalculatorEngine<
  DualExemptionInput,
  DualExemptionResult
> = {
  id: "dual-exemption-calculator",
  metadata: dualExemptionMetadata,
  schema: dualExemptionSchema,
  defaultInputs: defaultDualExemptionInputs,
  fields: dualExemptionFields,
  calculate: calculateDualExemption,
};

registerCalculator(dualExemptionEngine);
