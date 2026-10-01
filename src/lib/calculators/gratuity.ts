/**
 * Gratuity Calculation Engine
 * Statutory Authority: Payment of Gratuity Act, 1972 & Section 10(10) of Income Tax Act, 1961.
 *
 * Statutory Formulas:
 * 1. Covered Employees (Establishments under Payment of Gratuity Act, 1972 - Section 4(2)):
 *    Gratuity = (15 / 26) × Last Drawn Eligible Wages × Completed Years of Service
 *    Rounding Rule: Service exceeding 6 months in a year is rounded up to the next full year (e.g., 7 yrs 7 mos = 8 yrs).
 *    Note: 26 days represents working days in a month per Section 4(2).
 *
 * 2. Non-Covered Employees:
 *    Gratuity = (15 / 30) × Last Drawn Eligible Wages × Completed Years of Service
 *    Rounding Rule: Only fully completed years of service are counted (no rounding up for partial years).
 *    30 days divisor applies for half-month salary.
 *
 * Statutory Eligibility:
 * - Minimum 5 continuous years of service under Section 4(1).
 * - Statutory Exception: The 5-year requirement is waived in the event of death or permanent disablement of the employee.
 *
 * Tax Exemption under Section 10(10):
 * - Maximum statutory tax exemption ceiling is ₹20,00,000 (Twenty Lakh Rupees).
 * - Exemption is the least of:
 *   (i) Actual gratuity calculated / received
 *   (ii) Statutory exemption ceiling (₹20,00,000)
 *   (iii) Formula amount
 */

export interface GratuityStatutoryMetadata {
  statutoryExemptionLimit: number;
  statutoryAct: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  notes: string;
}

export const GRATUITY_STATUTORY_METADATA: GratuityStatutoryMetadata = {
  statutoryExemptionLimit: 2000000, // ₹20,00,000
  statutoryAct: "Payment of Gratuity Act, 1972",
  sourceName: "Ministry of Labour & Employment / India Code (Payment of Gratuity Act, 1972)",
  sourceUrl: "https://www.indiacode.nic.in",
  verifiedAt: "2024-10-01",
  notes:
    "Statutory formula 15/26 of last drawn wages per completed year of service for covered employees. Section 10(10) tax exemption limit is ₹20,00,000. Five-year service condition is waived upon death or disablement.",
};

export interface GratuityInputs {
  monthlyBasicSalary: number;
  monthlyDearnessAllowance?: number; // DA
  tenureYears: number;
  tenureMonths?: number;
  isCoveredUnderAct?: boolean; // Default true (covered by Payment of Gratuity Act, 1972)
  waiveFiveYearRuleForDeathOrDisablement?: boolean; // Section 4(1) proviso
}

export interface GratuityResult {
  monthlyBasicPlusDA: number;
  tenureYears: number;
  tenureMonths: number;
  effectiveServiceYears: number;
  isEligible: boolean;
  eligibilityReason: string;
  isCoveredUnderAct: boolean;

  totalGratuityCalculated: number;
  taxExemptGratuity: number;
  taxableGratuity: number;

  statutoryExemptionLimit: number;
  formulaDisplay: string;
  statutoryMetadata: GratuityStatutoryMetadata;
}

export const STATUTORY_GRATUITY_EXEMPTION_LIMIT = 2000000; // ₹20 Lakhs

export function calculateGratuity(inputs: GratuityInputs): GratuityResult {
  const basic = Math.max(0, Math.round(Number(inputs.monthlyBasicSalary) || 0));
  const da = Math.max(0, Math.round(Number(inputs.monthlyDearnessAllowance) || 0));
  const basicPlusDA = basic + da;

  const rawYears = Math.max(0, Math.floor(Number(inputs.tenureYears) || 0));
  const rawMonths = Math.min(11, Math.max(0, Math.floor(Number(inputs.tenureMonths) || 0)));
  const isCovered = inputs.isCoveredUnderAct !== false;
  const waiveFiveYearRule = Boolean(inputs.waiveFiveYearRuleForDeathOrDisablement);

  // Calculate effective service years per statutory rounding conventions
  let effectiveServiceYears = rawYears;
  if (isCovered) {
    // Under Section 4(2), period in excess of 6 months is reckoned as 1 full year
    if (rawMonths > 6) {
      effectiveServiceYears += 1;
    }
  } else {
    // For non-covered employees, only completed full years count
    effectiveServiceYears = rawYears;
  }

  // Statutory Eligibility Check (Section 4(1))
  const totalMonths = rawYears * 12 + rawMonths;
  let isEligible = false;
  let eligibilityReason = "";

  if (waiveFiveYearRule) {
    isEligible = totalMonths > 0;
    eligibilityReason = "Eligible under Section 4(1) proviso (5-year tenure condition waived due to death/disablement).";
  } else if (totalMonths >= 60) {
    isEligible = true;
    eligibilityReason = "Eligible: Continuous service requirement of 5 years (60 months) satisfied.";
  } else {
    isEligible = false;
    eligibilityReason = `Ineligible: Continuous service is ${rawYears} years ${rawMonths} months. Payment of Gratuity Act requires a minimum of 5 years (unless deceased or permanently disabled).`;
  }

  const formulaDisplay = isCovered
    ? "15/26 × Last Drawn Wages × Completed Years of Service"
    : "15/30 × Last Drawn Wages × Completed Years of Service";

  if (!isEligible || basicPlusDA === 0 || effectiveServiceYears === 0) {
    return {
      monthlyBasicPlusDA: basicPlusDA,
      tenureYears: rawYears,
      tenureMonths: rawMonths,
      effectiveServiceYears,
      isEligible,
      eligibilityReason,
      isCoveredUnderAct: isCovered,
      totalGratuityCalculated: 0,
      taxExemptGratuity: 0,
      taxableGratuity: 0,
      statutoryExemptionLimit: STATUTORY_GRATUITY_EXEMPTION_LIMIT,
      formulaDisplay,
      statutoryMetadata: GRATUITY_STATUTORY_METADATA,
    };
  }

  // Calculate Gratuity Amount
  let gratuityAmount = 0;
  if (isCovered) {
    // Gratuity = (15 / 26) * Wages * EffectiveYears
    gratuityAmount = Math.round((15 * basicPlusDA * effectiveServiceYears) / 26);
  } else {
    // Gratuity = (15 / 30) * Wages * EffectiveYears
    gratuityAmount = Math.round((15 * basicPlusDA * effectiveServiceYears) / 30);
  }

  // Tax Exemption under Section 10(10): Min(Calculated Gratuity, Statutory Cap of ₹20,00,000)
  const taxExemptGratuity = Math.min(gratuityAmount, STATUTORY_GRATUITY_EXEMPTION_LIMIT);
  const taxableGratuity = Math.max(0, gratuityAmount - taxExemptGratuity);

  return {
    monthlyBasicPlusDA: basicPlusDA,
    tenureYears: rawYears,
    tenureMonths: rawMonths,
    effectiveServiceYears,
    isEligible: true,
    eligibilityReason,
    isCoveredUnderAct: isCovered,
    totalGratuityCalculated: gratuityAmount,
    taxExemptGratuity,
    taxableGratuity,
    statutoryExemptionLimit: STATUTORY_GRATUITY_EXEMPTION_LIMIT,
    formulaDisplay,
    statutoryMetadata: GRATUITY_STATUTORY_METADATA,
  };
}
