/**
 * House Rent Allowance (HRA) Exemption Engine
 * Statutory Authority: Section 10(13A) of Income Tax Act, 1961 read with Rule 2A of Income Tax Rules, 1962.
 * Administering Body: Income Tax Department, Ministry of Finance, Government of India.
 *
 * Statutory Rule 2A Provisions:
 * The exempt amount is strictly the LEAST of the following three conditions:
 * 1. Actual HRA received from the employer for the relevant period.
 * 2. 50% of eligible salary for metro cities (Mumbai, Delhi, Kolkata, Chennai) or 40% of salary for non-metro cities.
 * 3. Actual rent paid in excess of 10% of eligible salary (i.e. Rent Paid - 10% of Salary).
 *
 * Eligible Salary Definition (Rule 2A):
 * - "Salary" includes Basic Salary + Dearness Allowance (DA) if terms of employment so provide (i.e. forming part of retirement benefits)
 *   + Commission based on fixed percentage of turnover achieved by the employee.
 * - All other allowances/perquisites (Special allowance, bonuses, medical) are excluded.
 *
 * Disclaimer:
 * Calculations provide an estimate based on user-entered annual/monthly figures and assumptions.
 */

export interface HRAStatutoryMetadata {
  section: string;
  rule: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  notes: string;
  disclaimer: string;
}

export const HRA_STATUTORY_METADATA: HRAStatutoryMetadata = {
  section: "Section 10(13A)",
  rule: "Rule 2A, Income Tax Rules, 1962",
  sourceName: "Income Tax Department, Ministry of Finance, Government of India",
  sourceUrl: "https://incometaxindia.gov.in",
  verifiedAt: "2024-10-01",
  notes:
    "Exemption under Section 10(13A) is calculated as the minimum of actual HRA received, 50% (metro) / 40% (non-metro) of salary, and rent paid minus 10% of salary. Salary includes Basic + DA (retirement benefits) only.",
  disclaimer:
    "This calculator provides an illustrative tax estimate based on the figures and city classification entered. Actual exemption is determined during tax assessment under Rule 2A.",
};

export interface HRAInputs {
  basicSalaryAnnual: number;
  dearnessAllowanceAnnual?: number; // DA forming part of retirement benefits
  hraReceivedAnnual: number;
  rentPaidAnnual: number;
  isMetroCity?: boolean; // Delhi, Mumbai, Kolkata, Chennai -> 50%, Others -> 40%
  taxBracketPercentage?: number; // E.g. 30, 20, 10, 5 (for estimating tax savings)
}

export interface HRAResult {
  basicPlusDA: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;

  // The 3 statutory Rule 2A conditions:
  actualHRAReceived: number;
  percentageOfSalaryLimit: number; // 50% or 40% of Basic + DA
  rentMinusTenPercentSalary: number; // Rent Paid - 10% of Basic + DA

  exemptHRA: number;
  taxableHRA: number;
  estimatedTaxSaved: number;

  monthlyBreakdown: {
    basicPlusDAMonthly: number;
    hraReceivedMonthly: number;
    rentPaidMonthly: number;
    exemptHRAMonthly: number;
    taxableHRAMonthly: number;
    taxSavedMonthly: number;
  };

  limitingFactor: "actual_hra" | "salary_percentage" | "rent_paid_minus_ten_percent";
  limitingFactorDescription: string;
  statutoryMetadata: HRAStatutoryMetadata;
}

export function calculateHRA(inputs: HRAInputs): HRAResult {
  const basic = Math.max(0, Math.round(Number(inputs.basicSalaryAnnual) || 0));
  const da = Math.max(0, Math.round(Number(inputs.dearnessAllowanceAnnual) || 0));
  const basicPlusDA = basic + da;

  const hraReceived = Math.max(0, Math.round(Number(inputs.hraReceivedAnnual) || 0));
  const rentPaid = Math.max(0, Math.round(Number(inputs.rentPaidAnnual) || 0));
  const isMetro = Boolean(inputs.isMetroCity);
  const taxRate = Math.min(30, Math.max(0, Number(inputs.taxBracketPercentage ?? 30))) / 100;
  const effectiveTaxWithCess = taxRate * 1.04;

  if (basicPlusDA === 0 || hraReceived === 0 || rentPaid === 0) {
    return {
      basicPlusDA,
      hraReceived,
      rentPaid,
      isMetro,
      actualHRAReceived: hraReceived,
      percentageOfSalaryLimit: 0,
      rentMinusTenPercentSalary: 0,
      exemptHRA: 0,
      taxableHRA: hraReceived,
      estimatedTaxSaved: 0,
      monthlyBreakdown: {
        basicPlusDAMonthly: Math.round(basicPlusDA / 12),
        hraReceivedMonthly: Math.round(hraReceived / 12),
        rentPaidMonthly: Math.round(rentPaid / 12),
        exemptHRAMonthly: 0,
        taxableHRAMonthly: Math.round(hraReceived / 12),
        taxSavedMonthly: 0,
      },
      limitingFactor: "actual_hra",
      limitingFactorDescription: "Rent or salary is zero. Full HRA received is taxable.",
      statutoryMetadata: HRA_STATUTORY_METADATA,
    };
  }

  // Condition 1: Actual HRA received
  const c1 = hraReceived;

  // Condition 2: 50% (metro) or 40% (non-metro) of Basic + DA
  const pctLimit = isMetro ? 0.50 : 0.40;
  const c2 = Math.round(basicPlusDA * pctLimit);

  // Condition 3: Actual Rent Paid minus 10% of Basic + DA
  const tenPercentSalary = basicPlusDA * 0.10;
  const c3 = Math.max(0, Math.round(rentPaid - tenPercentSalary));

  // Exemption is min of c1, c2, c3
  const exemptHRA = Math.min(c1, c2, c3);
  const taxableHRA = Math.max(0, hraReceived - exemptHRA);
  const estimatedTaxSaved = Math.round(exemptHRA * effectiveTaxWithCess);

  let limitingFactor: "actual_hra" | "salary_percentage" | "rent_paid_minus_ten_percent" = "actual_hra";
  let limitingFactorDescription = "";

  if (exemptHRA === c1) {
    limitingFactor = "actual_hra";
    limitingFactorDescription = "Actual HRA received is the lowest of the 3 conditions (full HRA is tax-exempt).";
  } else if (exemptHRA === c3) {
    limitingFactor = "rent_paid_minus_ten_percent";
    limitingFactorDescription = "Rent paid minus 10% of salary is the limiting factor (capped by rent outflow).";
  } else {
    limitingFactor = "salary_percentage";
    limitingFactorDescription = `Statutory ${isMetro ? "50%" : "40%"} salary limit is the limiting factor.`;
  }

  return {
    basicPlusDA,
    hraReceived,
    rentPaid,
    isMetro,
    actualHRAReceived: c1,
    percentageOfSalaryLimit: c2,
    rentMinusTenPercentSalary: c3,
    exemptHRA,
    taxableHRA,
    estimatedTaxSaved,
    monthlyBreakdown: {
      basicPlusDAMonthly: Math.round(basicPlusDA / 12),
      hraReceivedMonthly: Math.round(hraReceived / 12),
      rentPaidMonthly: Math.round(rentPaid / 12),
      exemptHRAMonthly: Math.round(exemptHRA / 12),
      taxableHRAMonthly: Math.round(taxableHRA / 12),
      taxSavedMonthly: Math.round(estimatedTaxSaved / 12),
    },
    limitingFactor,
    limitingFactorDescription,
    statutoryMetadata: HRA_STATUTORY_METADATA,
  };
}
