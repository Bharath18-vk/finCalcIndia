/**
 * Salary In-Hand (CTC to Take-Home) Calculation Engine
 * Statutory & Structuring Rules:
 * - Cost to Company (CTC) = Gross Salary + Employer Statutory Contributions (Employer PF, Gratuity allocation, etc.)
 * - Gross Salary = Basic + HRA + Special Allowance + Other Allowances
 * - Employee Deductions = Employee EPF (12%) + Professional Tax (State-dependent) + Income Tax TDS (Section 192)
 * - Net In-Hand / Take-Home Salary = Gross Salary - Employee Deductions
 *
 * State Professional Tax (PT) Rules:
 * Professional tax is levied by State Governments under Article 276(2) of the Constitution (capped at ₹2,500/yr).
 * Not all Indian states levy PT (e.g. Delhi, Haryana, UP, Rajasthan have Nil PT).
 *
 * Engine uses current AY 2026-27 income tax engine for accurate TDS withholdings.
 */

import { calculateIncomeTax } from "./income-tax";

export type ProfessionalTaxState =
  | "maharashtra"
  | "karnataka"
  | "telangana_ap"
  | "tamilnadu"
  | "westbengal"
  | "gujarat"
  | "nil_pt_state" // Delhi, Haryana, UP, Rajasthan, Punjab, etc.
  | "custom";

export interface ProfessionalTaxConfig {
  state: ProfessionalTaxState;
  stateLabel: string;
  annualPT: number;
  monthlyPT: number;
  notes: string;
}

export const STATE_PT_CONFIGS: Record<ProfessionalTaxState, ProfessionalTaxConfig> = {
  maharashtra: {
    state: "maharashtra",
    stateLabel: "Maharashtra",
    annualPT: 2500,
    monthlyPT: 200, // ₹200 for 11 months, ₹300 in Feb
    notes: "Maharashtra State Tax on Professions: ₹200/mo (Mar-Jan) and ₹300 in February (Total ₹2,500/yr).",
  },
  karnataka: {
    state: "karnataka",
    stateLabel: "Karnataka",
    annualPT: 2400,
    monthlyPT: 200,
    notes: "Karnataka Professional Tax: ₹200/mo for gross salary exceeding ₹15,000/mo (Total ₹2,400/yr).",
  },
  telangana_ap: {
    state: "telangana_ap",
    stateLabel: "Telangana / Andhra Pradesh",
    annualPT: 2400,
    monthlyPT: 200,
    notes: "Telangana & AP Professional Tax: ₹200/mo for monthly gross salary exceeding ₹20,000.",
  },
  tamilnadu: {
    state: "tamilnadu",
    stateLabel: "Tamil Nadu",
    annualPT: 2500,
    monthlyPT: 208,
    notes: "Tamil Nadu Town Panchayats/Municipalities PT: ₹1,250 half-yearly (₹2,500/yr) for salary > ₹75,000 half-yearly.",
  },
  westbengal: {
    state: "westbengal",
    stateLabel: "West Bengal",
    annualPT: 2400,
    monthlyPT: 200,
    notes: "West Bengal State Tax on Professions: Slabs from ₹110 to ₹200/mo depending on gross salary.",
  },
  gujarat: {
    state: "gujarat",
    stateLabel: "Gujarat",
    annualPT: 2400,
    monthlyPT: 200,
    notes: "Gujarat Professional Tax: ₹200/mo for monthly salary exceeding ₹12,000.",
  },
  nil_pt_state: {
    state: "nil_pt_state",
    stateLabel: "Delhi / Haryana / UP / Rajasthan (No PT)",
    annualPT: 0,
    monthlyPT: 0,
    notes: "No Professional Tax is levied in Delhi, Haryana, Uttar Pradesh, Rajasthan, and several other states/UTs.",
  },
  custom: {
    state: "custom",
    stateLabel: "Custom Amount",
    annualPT: 2400,
    monthlyPT: 200,
    notes: "User-defined illustrative professional tax assumption.",
  },
};

export interface SalaryBreakdownItem {
  component: string;
  monthly: number;
  annual: number;
  percentageOfCTC: number;
  description?: string;
}

export interface SalaryCalculatorInputs {
  annualCTC: number; // Cost to Company
  basicPercentage?: number; // % of CTC allocated to Basic (default 40-50%)
  hraPercentage?: number; // % of Basic allocated to HRA (default 50% for metro)
  includeEmployerPFInCTC?: boolean; // Whether CTC includes Employer PF (default true)
  statePT?: ProfessionalTaxState; // Default 'maharashtra' or custom
  customProfessionalTaxMonthly?: number; // If statePT === 'custom'
  epfCapWageCeiling?: boolean; // Cap EPF calculation at ₹15,000 statutory wage ceiling (₹1,800/mo)
  taxRegime?: "new" | "old"; // Default 'new'
  assessmentYear?: "2026-27" | "2025-26"; // Default AY 2026-27

  // Deductions for Old Regime TDS
  deduction80C?: number;
  deduction80D?: number;
  homeLoanInterest24b?: number;
}

export interface SalaryResult {
  annualCTC: number;
  monthlyCTC: number;

  grossAnnualSalary: number;
  grossMonthlySalary: number;

  taxableIncomeAnnual: number;

  totalEmployeeDeductionsAnnual: number;
  totalEmployeeDeductionsMonthly: number;

  totalEmployerContributionsAnnual: number;
  totalEmployerContributionsMonthly: number;

  taxAnnual: number;
  taxMonthly: number;

  employeePFAnnual: number;
  employeePFMonthly: number;

  employerPFAnnual: number;
  employerPFMonthly: number;

  professionalTaxAnnual: number;
  professionalTaxMonthly: number;
  professionalTaxStateLabel: string;
  professionalTaxNotes: string;

  netTakeHomeAnnual: number;
  netTakeHomeMonthly: number;
  takeHomePercentage: number;

  earningsBreakdown: SalaryBreakdownItem[];
  deductionsBreakdown: SalaryBreakdownItem[];
  employerContributionsBreakdown: SalaryBreakdownItem[];
}

export function calculateSalary(inputs: SalaryCalculatorInputs): SalaryResult {
  const ctc = Math.max(0, Math.round(Number(inputs.annualCTC) || 0));
  const basicPct = Math.min(80, Math.max(20, Number(inputs.basicPercentage) || 40)) / 100;
  const hraPct = Math.min(100, Math.max(0, Number(inputs.hraPercentage) || 50)) / 100;
  const includeEmployerPF = inputs.includeEmployerPFInCTC !== false;
  const capWageCeiling = Boolean(inputs.epfCapWageCeiling);
  const taxRegime = inputs.taxRegime || "new";
  const assessmentYear = inputs.assessmentYear || "2026-27";

  // Resolve State PT
  const selectedState = inputs.statePT || "custom";
  const ptConfig = STATE_PT_CONFIGS[selectedState] || STATE_PT_CONFIGS.custom;
  let ptMonthly = ptConfig.monthlyPT;
  let ptAnnual = ptConfig.annualPT;

  if (selectedState === "custom" && inputs.customProfessionalTaxMonthly !== undefined) {
    ptMonthly = Math.max(0, Number(inputs.customProfessionalTaxMonthly));
    ptAnnual = ptMonthly * 12;
  }

  if (ctc === 0) {
    return {
      annualCTC: 0,
      monthlyCTC: 0,
      grossAnnualSalary: 0,
      grossMonthlySalary: 0,
      taxableIncomeAnnual: 0,
      totalEmployeeDeductionsAnnual: 0,
      totalEmployeeDeductionsMonthly: 0,
      totalEmployerContributionsAnnual: 0,
      totalEmployerContributionsMonthly: 0,
      taxAnnual: 0,
      taxMonthly: 0,
      employeePFAnnual: 0,
      employeePFMonthly: 0,
      employerPFAnnual: 0,
      employerPFMonthly: 0,
      professionalTaxAnnual: 0,
      professionalTaxMonthly: 0,
      professionalTaxStateLabel: ptConfig.stateLabel,
      professionalTaxNotes: ptConfig.notes,
      netTakeHomeAnnual: 0,
      netTakeHomeMonthly: 0,
      takeHomePercentage: 0,
      earningsBreakdown: [],
      deductionsBreakdown: [],
      employerContributionsBreakdown: [],
    };
  }

  // 1. Basic Salary
  const basicAnnual = Math.round(ctc * basicPct);
  const basicMonthly = Math.round(basicAnnual / 12);

  // 2. EPF Calculations
  let epfWageAnnual = basicAnnual;
  let epfWageMonthly = basicMonthly;

  if (capWageCeiling) {
    epfWageMonthly = Math.min(15000, basicMonthly);
    epfWageAnnual = epfWageMonthly * 12;
  }

  const employeePFAnnual = Math.round(epfWageAnnual * 0.12);
  const employeePFMonthly = Math.round(employeePFAnnual / 12);

  const employerPFAnnual = Math.round(epfWageAnnual * 0.12);
  const employerPFMonthly = Math.round(employerPFAnnual / 12);

  // 3. Gross Salary Decomposition
  const employerContributionsAnnual = includeEmployerPF ? employerPFAnnual : 0;
  const employerContributionsMonthly = includeEmployerPF ? employerPFMonthly : 0;

  const grossAnnual = Math.max(0, ctc - employerContributionsAnnual);
  const grossMonthly = Math.round(grossAnnual / 12);

  // Components of Gross Salary:
  // Gross = Basic + HRA + Special Allowance
  const hraAnnual = Math.round(basicAnnual * hraPct);
  const hraMonthly = Math.round(hraAnnual / 12);

  const specialAllowanceAnnual = Math.max(0, grossAnnual - basicAnnual - hraAnnual);
  const specialAllowanceMonthly = Math.round(specialAllowanceAnnual / 12);

  // 4. Income Tax / TDS Calculation (Using AY 2026-27 Engine)
  const taxResult = calculateIncomeTax({
    grossAnnualIncome: grossAnnual,
    isSalaried: true,
    assessmentYear,
    deduction80C: taxRegime === "old" ? Math.max(employeePFAnnual, Number(inputs.deduction80C) || 0) : 0,
    deduction80D: taxRegime === "old" ? Number(inputs.deduction80D) || 0 : 0,
    homeLoanInterest24b: taxRegime === "old" ? Number(inputs.homeLoanInterest24b) || 0 : 0,
  });

  const selectedRegimeResult = taxRegime === "new" ? taxResult.newRegime : taxResult.oldRegime;
  const taxAnnual = selectedRegimeResult.totalTax;
  const taxMonthly = Math.round(taxAnnual / 12);
  const taxableIncomeAnnual = selectedRegimeResult.taxableIncome;

  // 5. Total Deductions from Gross Salary
  const totalEmployeeDeductionsAnnual = employeePFAnnual + ptAnnual + taxAnnual;
  const totalEmployeeDeductionsMonthly = employeePFMonthly + ptMonthly + taxMonthly;

  // 6. Net Take-Home Salary
  const netTakeHomeAnnual = Math.max(0, grossAnnual - totalEmployeeDeductionsAnnual);
  const netTakeHomeMonthly = Math.round(netTakeHomeAnnual / 12);
  const takeHomePercentage = ctc > 0 ? Number(((netTakeHomeAnnual / ctc) * 100).toFixed(2)) : 0;

  // 7. Structured Breakdowns
  const earningsBreakdown: SalaryBreakdownItem[] = [
    {
      component: "Basic Salary",
      monthly: basicMonthly,
      annual: basicAnnual,
      percentageOfCTC: Number(((basicAnnual / ctc) * 100).toFixed(1)),
      description: "Core taxable salary component forming basis for EPF, Gratuity, and HRA limits.",
    },
    {
      component: "House Rent Allowance (HRA)",
      monthly: hraMonthly,
      annual: hraAnnual,
      percentageOfCTC: Number(((hraAnnual / ctc) * 100).toFixed(1)),
      description: "Allowance for accommodation expenses; partially or fully exempt under Rule 2A.",
    },
    {
      component: "Special Allowance / Other Allowances",
      monthly: specialAllowanceMonthly,
      annual: specialAllowanceAnnual,
      percentageOfCTC: Number(((specialAllowanceAnnual / ctc) * 100).toFixed(1)),
      description: "Balancing component of gross compensation; fully taxable.",
    },
  ];

  const deductionsBreakdown: SalaryBreakdownItem[] = [
    {
      component: "Employee EPF (12%)",
      monthly: employeePFMonthly,
      annual: employeePFAnnual,
      percentageOfCTC: Number(((employeePFAnnual / ctc) * 100).toFixed(1)),
      description: "Statutory 12% provident fund deduction credited to your EPFO retirement account.",
    },
    {
      component: `Professional Tax (${ptConfig.stateLabel})`,
      monthly: ptMonthly,
      annual: ptAnnual,
      percentageOfCTC: Number(((ptAnnual / ctc) * 100).toFixed(1)),
      description: ptConfig.notes,
    },
    {
      component: `Income Tax / TDS (${taxRegime === "new" ? "New" : "Old"} Regime, AY ${assessmentYear})`,
      monthly: taxMonthly,
      annual: taxAnnual,
      percentageOfCTC: Number(((taxAnnual / ctc) * 100).toFixed(1)),
      description: `Estimated monthly TDS withheld under Section 192 based on ${taxRegime === "new" ? "New (Section 115BAC)" : "Old"} regime rules.`,
    },
  ];

  const employerContributionsBreakdown: SalaryBreakdownItem[] = [
    {
      component: "Employer EPF (12%)",
      monthly: employerPFMonthly,
      annual: employerPFAnnual,
      percentageOfCTC: Number(((employerPFAnnual / ctc) * 100).toFixed(1)),
      description: "Employer statutory 12% PF contribution (split into EPS and EPF) included in CTC.",
    },
  ];

  return {
    annualCTC: ctc,
    monthlyCTC: Math.round(ctc / 12),
    grossAnnualSalary: grossAnnual,
    grossMonthlySalary: grossMonthly,
    taxableIncomeAnnual,
    totalEmployeeDeductionsAnnual,
    totalEmployeeDeductionsMonthly,
    totalEmployerContributionsAnnual: employerContributionsAnnual,
    totalEmployerContributionsMonthly: employerContributionsMonthly,
    taxAnnual,
    taxMonthly,
    employeePFAnnual,
    employeePFMonthly,
    employerPFAnnual,
    employerPFMonthly,
    professionalTaxAnnual: ptAnnual,
    professionalTaxMonthly: ptMonthly,
    professionalTaxStateLabel: ptConfig.stateLabel,
    professionalTaxNotes: ptConfig.notes,
    netTakeHomeAnnual,
    netTakeHomeMonthly,
    takeHomePercentage,
    earningsBreakdown,
    deductionsBreakdown,
    employerContributionsBreakdown,
  };
}
