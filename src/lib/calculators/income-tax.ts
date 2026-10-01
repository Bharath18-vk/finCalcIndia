/**
 * Income Tax Calculation Engine (New vs Old Tax Regime)
 * Statutory Compliance: Income Tax Department, Government of India (Finance Act 2025 / Budget 2025).
 * Current Default: AY 2026-27 (FY 2025-26).
 *
 * Rules:
 * - Pure reusable function.
 * - Handles New Regime (Section 115BAC) with statutory slabs, standard deduction, and Section 87A rebate up to ₹60,000.
 * - Accurate Section 87A marginal relief when taxable income slightly exceeds ₹12,00,000.
 * - Handles Old Regime with standard deduction ₹50,000, 80C, 80D, 24(b), 80CCD(1B), and HRA deductions.
 * - Surcharge with marginal relief and 4% Health and Education Cess.
 * - Zero NaN, Infinity, negative or undefined outputs.
 */

import { getTaxRulesForAY, TaxRuleSet, TaxSlab } from "@/data/rates/taxRules";

export interface TaxSlabBreakdown {
  slab: string;
  rate: number;
  taxableAmountInSlab: number;
  taxForSlab: number;
}

export interface RegimeResult {
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate87A: number;
  marginalRelief87A: number;
  taxAfterRebate: number;
  surcharge: number;
  marginalReliefSurcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  monthlyTax: number;
  inHandAnnual: number;
  inHandMonthly: number;
  breakdown: TaxSlabBreakdown[];
}

export interface IncomeTaxInputs {
  grossAnnualIncome: number;
  isSalaried?: boolean;
  ageGroup?: "general" | "senior" | "superSenior"; // general (<60), senior (60-80), superSenior (80+)
  assessmentYear?: "2026-27" | "2025-26"; // Default "2026-27"

  // Old Regime Deductions
  deduction80C?: number; // Capped at 1,50,000
  deduction80D?: number; // Health Insurance (Self + Parents)
  homeLoanInterest24b?: number; // Capped at 2,00,000 for self-occupied
  nps80CCD1B?: number; // Capped at 50,000
  hraExemption?: number; // Section 10(13A)
  otherDeductions?: number; // 80E, 80G, 80TTA, etc.
}

export interface IncomeTaxResult {
  grossIncome: number;
  assessmentYear: string;
  financialYear: string;
  newRegime: RegimeResult;
  oldRegime: RegimeResult;
  recommendedRegime: "new" | "old" | "equal";
  taxSaved: number;
  summaryText: string;
}

/**
 * Computes progressive tax across defined slabs
 */
function computeSlabTax(taxableIncome: number, slabs: TaxSlab[]): { totalTax: number; breakdown: TaxSlabBreakdown[] } {
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  const breakdown: TaxSlabBreakdown[] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) {
      breakdown.push({
        slab: slab.label,
        rate: slab.rate,
        taxableAmountInSlab: 0,
        taxForSlab: 0,
      });
      continue;
    }

    const slabSpan = slab.max - slab.min;
    const taxableInThisSlab = Math.min(Math.max(0, taxableIncome - slab.min), slabSpan);
    const taxInThisSlab = Math.round(taxableInThisSlab * slab.rate);

    totalTax += taxInThisSlab;
    breakdown.push({
      slab: slab.label,
      rate: slab.rate,
      taxableAmountInSlab: taxableInThisSlab,
      taxForSlab: taxInThisSlab,
    });
  }

  return { totalTax, breakdown };
}

/**
 * Computes surcharge with statutory marginal relief
 */
function computeSurchargeWithMarginalRelief(
  taxableIncome: number,
  taxAfterRebate: number,
  regime: "new" | "old",
  rules: TaxRuleSet
): { surcharge: number; marginalRelief: number } {
  const tiers = regime === "new" ? rules.newRegime.surcharges : rules.oldRegime.surcharges;

  // Determine applicable tier
  let applicableTier = null;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (taxableIncome > tiers[i].threshold) {
      applicableTier = tiers[i];
      break;
    }
  }

  if (!applicableTier) {
    return { surcharge: 0, marginalRelief: 0 };
  }

  const rawSurcharge = Math.round(taxAfterRebate * applicableTier.rate);
  const totalTaxWithSurcharge = taxAfterRebate + rawSurcharge;

  // Compute tax on threshold
  const slabs = regime === "new" ? rules.newRegime.slabs : rules.oldRegime.slabsGeneral;
  const { totalTax: taxAtThreshold } = computeSlabTax(applicableTier.threshold, slabs);

  // If there was a lower tier surcharge at threshold
  let surchargeAtThreshold = 0;
  const prevTierIndex = tiers.indexOf(applicableTier) - 1;
  if (prevTierIndex >= 0) {
    surchargeAtThreshold = Math.round(taxAtThreshold * tiers[prevTierIndex].rate);
  }

  const maxAllowableTotalTax = taxAtThreshold + surchargeAtThreshold + (taxableIncome - applicableTier.threshold);

  if (totalTaxWithSurcharge > maxAllowableTotalTax) {
    const relief = totalTaxWithSurcharge - maxAllowableTotalTax;
    const finalSurcharge = Math.max(0, rawSurcharge - relief);
    return { surcharge: finalSurcharge, marginalRelief: relief };
  }

  return { surcharge: rawSurcharge, marginalRelief: 0 };
}

export function calculateIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResult {
  const gross = Math.max(0, Math.round(Number(inputs.grossAnnualIncome) || 0));
  const isSalaried = inputs.isSalaried !== false; // Default true
  const ageGroup = inputs.ageGroup || "general";
  const rules = getTaxRulesForAY(inputs.assessmentYear);

  // Sanitize Old Regime Deductions
  const ded80C = Math.min(150000, Math.max(0, Number(inputs.deduction80C) || 0));
  const ded80D = Math.max(0, Number(inputs.deduction80D) || 0);
  const homeLoan24b = Math.min(200000, Math.max(0, Number(inputs.homeLoanInterest24b) || 0));
  const nps80CCD = Math.min(50000, Math.max(0, Number(inputs.nps80CCD1B) || 0));
  const hra = Math.max(0, Number(inputs.hraExemption) || 0);
  const other = Math.max(0, Number(inputs.otherDeductions) || 0);

  // ----------------------------------------------------
  // 1. NEW TAX REGIME (Section 115BAC)
  // ----------------------------------------------------
  const stdDedNew = isSalaried ? rules.newRegime.standardDeductionSalaried : 0;
  const taxableNew = Math.max(0, gross - stdDedNew);

  const { totalTax: slabTaxNew, breakdown: breakdownNew } = computeSlabTax(taxableNew, rules.newRegime.slabs);

  // Section 87A Rebate & Marginal Relief
  let rebate87ANew = 0;
  let marginalRelief87ANew = 0;
  let taxAfterRebateNew = slabTaxNew;

  if (taxableNew <= rules.newRegime.rebate87A.thresholdIncome) {
    // Full rebate up to maxRebate (₹60,000 for AY 2026-27)
    rebate87ANew = Math.min(slabTaxNew, rules.newRegime.rebate87A.maxRebate);
    taxAfterRebateNew = Math.max(0, slabTaxNew - rebate87ANew);
  } else if (rules.newRegime.rebate87A.marginalReliefApplicable) {
    // Marginal relief: Tax payable cannot exceed excess of taxable income over threshold
    const excessIncome = taxableNew - rules.newRegime.rebate87A.thresholdIncome;
    if (slabTaxNew > excessIncome) {
      marginalRelief87ANew = slabTaxNew - excessIncome;
      rebate87ANew = marginalRelief87ANew;
      taxAfterRebateNew = excessIncome;
    }
  }

  // Surcharge & Cess
  const { surcharge: surchargeNew, marginalRelief: surchargeReliefNew } = computeSurchargeWithMarginalRelief(
    taxableNew,
    taxAfterRebateNew,
    "new",
    rules
  );

  const cessNew = Math.round((taxAfterRebateNew + surchargeNew) * rules.newRegime.cessRate);
  const totalTaxNew = taxAfterRebateNew + surchargeNew + cessNew;
  const effectiveRateNew = gross > 0 ? Number(((totalTaxNew / gross) * 100).toFixed(2)) : 0;

  const newRegimeResult: RegimeResult = {
    grossIncome: gross,
    standardDeduction: stdDedNew,
    otherDeductions: 0,
    taxableIncome: taxableNew,
    slabTax: slabTaxNew,
    rebate87A: rebate87ANew,
    marginalRelief87A: marginalRelief87ANew,
    taxAfterRebate: taxAfterRebateNew,
    surcharge: surchargeNew,
    marginalReliefSurcharge: surchargeReliefNew,
    cess: cessNew,
    totalTax: totalTaxNew,
    effectiveTaxRate: effectiveRateNew,
    monthlyTax: Math.round(totalTaxNew / 12),
    inHandAnnual: Math.max(0, gross - totalTaxNew),
    inHandMonthly: Math.round(Math.max(0, gross - totalTaxNew) / 12),
    breakdown: breakdownNew,
  };

  // ----------------------------------------------------
  // 2. OLD TAX REGIME
  // ----------------------------------------------------
  const stdDedOld = isSalaried ? rules.oldRegime.standardDeductionSalaried : 0;
  const totalOtherDeductionsOld = ded80C + ded80D + homeLoan24b + nps80CCD + hra + other;
  const taxableOld = Math.max(0, gross - stdDedOld - totalOtherDeductionsOld);

  let oldSlabs = rules.oldRegime.slabsGeneral;
  if (ageGroup === "senior") oldSlabs = rules.oldRegime.slabsSeniorCitizen;
  else if (ageGroup === "superSenior") oldSlabs = rules.oldRegime.slabsSuperSeniorCitizen;

  const { totalTax: slabTaxOld, breakdown: breakdownOld } = computeSlabTax(taxableOld, oldSlabs);

  // Section 87A Rebate for Old Regime
  let rebate87AOld = 0;
  let taxAfterRebateOld = slabTaxOld;
  if (taxableOld <= rules.oldRegime.rebate87A.thresholdIncome) {
    rebate87AOld = Math.min(slabTaxOld, rules.oldRegime.rebate87A.maxRebate);
    taxAfterRebateOld = Math.max(0, slabTaxOld - rebate87AOld);
  }

  // Surcharge & Cess
  const { surcharge: surchargeOld, marginalRelief: surchargeReliefOld } = computeSurchargeWithMarginalRelief(
    taxableOld,
    taxAfterRebateOld,
    "old",
    rules
  );

  const cessOld = Math.round((taxAfterRebateOld + surchargeOld) * rules.oldRegime.cessRate);
  const totalTaxOld = taxAfterRebateOld + surchargeOld + cessOld;
  const effectiveRateOld = gross > 0 ? Number(((totalTaxOld / gross) * 100).toFixed(2)) : 0;

  const oldRegimeResult: RegimeResult = {
    grossIncome: gross,
    standardDeduction: stdDedOld,
    otherDeductions: totalOtherDeductionsOld,
    taxableIncome: taxableOld,
    slabTax: slabTaxOld,
    rebate87A: rebate87AOld,
    marginalRelief87A: 0,
    taxAfterRebate: taxAfterRebateOld,
    surcharge: surchargeOld,
    marginalReliefSurcharge: surchargeReliefOld,
    cess: cessOld,
    totalTax: totalTaxOld,
    effectiveTaxRate: effectiveRateOld,
    monthlyTax: Math.round(totalTaxOld / 12),
    inHandAnnual: Math.max(0, gross - totalTaxOld),
    inHandMonthly: Math.round(Math.max(0, gross - totalTaxOld) / 12),
    breakdown: breakdownOld,
  };

  // ----------------------------------------------------
  // 3. RECOMMENDATION LOGIC
  // ----------------------------------------------------
  let recommendedRegime: "new" | "old" | "equal" = "new";
  let taxSaved = 0;

  if (totalTaxNew < totalTaxOld) {
    recommendedRegime = "new";
    taxSaved = totalTaxOld - totalTaxNew;
  } else if (totalTaxOld < totalTaxNew) {
    recommendedRegime = "old";
    taxSaved = totalTaxNew - totalTaxOld;
  } else {
    recommendedRegime = "equal";
    taxSaved = 0;
  }

  const summaryText =
    recommendedRegime === "equal"
      ? `Both regimes yield an identical tax liability of ₹${totalTaxNew.toLocaleString("en-IN")}.`
      : `The ${recommendedRegime === "new" ? "New" : "Old"} Tax Regime saves you ₹${taxSaved.toLocaleString(
          "en-IN"
        )} annually for AY ${rules.assessmentYear}.`;

  return {
    grossIncome: gross,
    assessmentYear: rules.assessmentYear,
    financialYear: rules.financialYear,
    newRegime: newRegimeResult,
    oldRegime: oldRegimeResult,
    recommendedRegime,
    taxSaved,
    summaryText,
  };
}
