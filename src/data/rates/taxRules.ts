/**
 * Versioned Income Tax Rules Registry
 * Sourced directly from Income Tax Department, Ministry of Finance, Government of India.
 *
 * Versions:
 * - AY 2026-27 (FY 2025-26): Current statutory new-regime slabs & Section 87A rebate up to ₹60,000.
 * - AY 2025-26 (FY 2024-25): Budget 2024 revisions (₹0-3L, ₹3-7L, etc.) for retrospective reference.
 */

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export interface SurchargeTier {
  threshold: number;
  rate: number;
}

export interface TaxRuleSet {
  assessmentYear: string;
  financialYear: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  effectiveFrom: string;
  notes: string;

  newRegime: {
    standardDeductionSalaried: number;
    standardDeductionFamilyPension: number;
    slabs: TaxSlab[];
    rebate87A: {
      maxRebate: number;
      thresholdIncome: number; // Income up to which rebate applies
      marginalReliefApplicable: boolean;
      marginalReliefCeiling?: number; // Income level up to which marginal relief operates
    };
    surcharges: SurchargeTier[];
    maxSurchargeRate: number; // 25% under New Regime
    cessRate: number; // 4% Health & Education Cess
  };

  oldRegime: {
    standardDeductionSalaried: number;
    slabsGeneral: TaxSlab[];
    slabsSeniorCitizen: TaxSlab[];
    slabsSuperSeniorCitizen: TaxSlab[];
    rebate87A: {
      maxRebate: number;
      thresholdIncome: number;
    };
    surcharges: SurchargeTier[];
    maxSurchargeRate: number; // 37% under Old Regime for income > ₹5 Cr
    cessRate: number; // 4%
  };
}

/**
 * Current AY 2026-27 (FY 2025-26) Statutory Rules
 * Statutory Authority: Income Tax Act, 1961 as amended by Finance Act, 2025 / Budget 2025.
 *
 * New Regime (Section 115BAC):
 * - ₹0 - ₹4,00,000: 0%
 * - ₹4,00,001 - ₹8,00,000: 5%
 * - ₹8,00,001 - ₹12,00,000: 10%
 * - ₹12,00,001 - ₹16,00,000: 15%
 * - ₹16,00,001 - ₹20,00,000: 20%
 * - ₹20,00,001 - ₹24,00,000: 25%
 * - Above ₹24,00,000: 30%
 *
 * Section 87A Rebate:
 * - Up to ₹60,000 for total taxable income up to ₹12,00,000.
 * - Marginal Relief: If taxable income exceeds ₹12,00,000, tax payable before cess shall not exceed
 *   the excess of income over ₹12,00,000.
 * - Salaried individuals receive ₹75,000 standard deduction, so gross salary up to ₹12,75,000 pays ₹0 tax.
 */
export const TAX_RULES_AY_2026_27: TaxRuleSet = {
  assessmentYear: "2026-27",
  financialYear: "2025-26",
  sourceName: "Income Tax Department, Ministry of Finance, Government of India (Finance Act 2025)",
  sourceUrl: "https://incometaxindia.gov.in",
  verifiedAt: "2025-02-15",
  effectiveFrom: "2025-04-01",
  notes:
    "Current statutory new tax regime slabs for AY 2026-27 (FY 2025-26). Standard deduction of ₹75,000 for salaried employees. Full Section 87A rebate of up to ₹60,000 for taxable income up to ₹12,00,000 with statutory marginal relief.",

  newRegime: {
    standardDeductionSalaried: 75000,
    standardDeductionFamilyPension: 25000,
    slabs: [
      { min: 0, max: 400000, rate: 0, label: "Up to ₹4 Lakh" },
      { min: 400000, max: 800000, rate: 0.05, label: "₹4 Lakh to ₹8 Lakh" },
      { min: 800000, max: 1200000, rate: 0.10, label: "₹8 Lakh to ₹12 Lakh" },
      { min: 1200000, max: 1600000, rate: 0.15, label: "₹12 Lakh to ₹16 Lakh" },
      { min: 1600000, max: 2000000, rate: 0.20, label: "₹16 Lakh to ₹20 Lakh" },
      { min: 2000000, max: 2400000, rate: 0.25, label: "₹20 Lakh to ₹24 Lakh" },
      { min: 2400000, max: Infinity, rate: 0.30, label: "Above ₹24 Lakh" },
    ],
    rebate87A: {
      maxRebate: 60000,
      thresholdIncome: 1200000,
      marginalReliefApplicable: true,
      marginalReliefCeiling: 1270588, // Tax on 12L + 15% on excess exceeds excess at ~₹12,70,588
    },
    surcharges: [
      { threshold: 5000000, rate: 0.10 },
      { threshold: 10000000, rate: 0.15 },
      { threshold: 20000000, rate: 0.25 },
    ],
    maxSurchargeRate: 0.25,
    cessRate: 0.04,
  },

  oldRegime: {
    standardDeductionSalaried: 50000,
    slabsGeneral: [
      { min: 0, max: 250000, rate: 0, label: "Up to ₹2.5 Lakh" },
      { min: 250000, max: 500000, rate: 0.05, label: "₹2.5 Lakh to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    slabsSeniorCitizen: [
      { min: 0, max: 300000, rate: 0, label: "Up to ₹3 Lakh" },
      { min: 300000, max: 500000, rate: 0.05, label: "₹3 Lakh to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    slabsSuperSeniorCitizen: [
      { min: 0, max: 500000, rate: 0, label: "Up to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    rebate87A: {
      maxRebate: 12500,
      thresholdIncome: 500000,
    },
    surcharges: [
      { threshold: 5000000, rate: 0.10 },
      { threshold: 10000000, rate: 0.15 },
      { threshold: 20000000, rate: 0.25 },
      { threshold: 50000000, rate: 0.37 },
    ],
    maxSurchargeRate: 0.37,
    cessRate: 0.04,
  },
};

/**
 * Historical AY 2025-26 (FY 2024-25) Rules
 * Maintained for retrospective tax calculations and filing comparison.
 */
export const TAX_RULES_AY_2025_26: TaxRuleSet = {
  assessmentYear: "2025-26",
  financialYear: "2024-25",
  sourceName: "Income Tax Department, Ministry of Finance, Government of India (Finance Act 2024)",
  sourceUrl: "https://incometaxindia.gov.in",
  verifiedAt: "2024-07-23",
  effectiveFrom: "2024-04-01",
  notes:
    "Statutory new tax regime slabs for AY 2025-26 (FY 2024-25) with ₹75,000 standard deduction and Section 87A rebate up to ₹25,000 for income up to ₹7,00,000.",

  newRegime: {
    standardDeductionSalaried: 75000,
    standardDeductionFamilyPension: 25000,
    slabs: [
      { min: 0, max: 300000, rate: 0, label: "Up to ₹3 Lakh" },
      { min: 300000, max: 700000, rate: 0.05, label: "₹3 Lakh to ₹7 Lakh" },
      { min: 700000, max: 1000000, rate: 0.10, label: "₹7 Lakh to ₹10 Lakh" },
      { min: 1000000, max: 1200000, rate: 0.15, label: "₹10 Lakh to ₹12 Lakh" },
      { min: 1200000, max: 1500000, rate: 0.20, label: "₹12 Lakh to ₹15 Lakh" },
      { min: 1500000, max: Infinity, rate: 0.30, label: "Above ₹15 Lakh" },
    ],
    rebate87A: {
      maxRebate: 25000,
      thresholdIncome: 700000,
      marginalReliefApplicable: true,
      marginalReliefCeiling: 727777,
    },
    surcharges: [
      { threshold: 5000000, rate: 0.10 },
      { threshold: 10000000, rate: 0.15 },
      { threshold: 20000000, rate: 0.25 },
    ],
    maxSurchargeRate: 0.25,
    cessRate: 0.04,
  },

  oldRegime: {
    standardDeductionSalaried: 50000,
    slabsGeneral: [
      { min: 0, max: 250000, rate: 0, label: "Up to ₹2.5 Lakh" },
      { min: 250000, max: 500000, rate: 0.05, label: "₹2.5 Lakh to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    slabsSeniorCitizen: [
      { min: 0, max: 300000, rate: 0, label: "Up to ₹3 Lakh" },
      { min: 300000, max: 500000, rate: 0.05, label: "₹3 Lakh to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    slabsSuperSeniorCitizen: [
      { min: 0, max: 500000, rate: 0, label: "Up to ₹5 Lakh" },
      { min: 500000, max: 1000000, rate: 0.20, label: "₹5 Lakh to ₹10 Lakh" },
      { min: 1000000, max: Infinity, rate: 0.30, label: "Above ₹10 Lakh" },
    ],
    rebate87A: {
      maxRebate: 12500,
      thresholdIncome: 500000,
    },
    surcharges: [
      { threshold: 5000000, rate: 0.10 },
      { threshold: 10000000, rate: 0.15 },
      { threshold: 20000000, rate: 0.25 },
      { threshold: 50000000, rate: 0.37 },
    ],
    maxSurchargeRate: 0.37,
    cessRate: 0.04,
  },
};

export const SUPPORTED_TAX_RULES: Record<string, TaxRuleSet> = {
  "2026-27": TAX_RULES_AY_2026_27,
  "2025-26": TAX_RULES_AY_2025_26,
};

export const CURRENT_TAX_RULES = TAX_RULES_AY_2026_27;

export function getTaxRulesForAY(assessmentYear?: string): TaxRuleSet {
  if (assessmentYear && SUPPORTED_TAX_RULES[assessmentYear]) {
    return SUPPORTED_TAX_RULES[assessmentYear];
  }
  return CURRENT_TAX_RULES;
}
