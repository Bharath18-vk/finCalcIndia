/**
 * Compound Interest Calculation Engine
 *
 * Formula:
 *   A = P * (1 + r / n)^(n * t)
 * where:
 *   P = Principal
 *   r = Annual interest rate (decimal = rate / 100)
 *   n = Compounding periods per year (1, 2, 4, 12, 365)
 *   t = Tenure in years
 *
 * Comparison against Simple Interest:
 *   SI = (P * rate * t) / 100
 *   Gain from Compounding = CI - SI
 */

export type CompoundFrequency = "annual" | "half-yearly" | "quarterly" | "monthly" | "daily";

export interface CompoundInterestInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
  frequency?: CompoundFrequency;
}

export interface CompoundYearlyBreakdown {
  year: number;
  openingPrincipal: number;
  interestEarned: number;
  cumulativeInterest: number;
  closingBalance: number;
}

export interface FrequencyComparisonItem {
  frequency: CompoundFrequency;
  label: string;
  periodsPerYear: number;
  maturityAmount: number;
  totalInterest: number;
  effectiveAnnualRate: number;
}

export interface CompoundInterestResult {
  principal: number;
  annualRate: number;
  tenureYears: number;
  frequency: CompoundFrequency;
  periodsPerYear: number;
  maturityAmount: number;
  totalInterest: number;
  simpleInterestAmount: number;
  compoundingBonus: number; // CI - SI
  effectiveAnnualRate: number; // APY
  yearlyBreakdown: CompoundYearlyBreakdown[];
  frequencyComparison: FrequencyComparisonItem[];
}

export function getPeriodsPerYear(frequency: CompoundFrequency): number {
  switch (frequency) {
    case "daily":
      return 365;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "half-yearly":
      return 2;
    case "annual":
    default:
      return 1;
  }
}

export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
  const principal = Math.max(0, input.principal || 0);
  const annualRate = Math.max(0, input.annualRate || 0);
  const tenureYears = Math.max(0.1, input.tenureYears || 1);
  const frequency = input.frequency || "annual";
  const periodsPerYear = getPeriodsPerYear(frequency);

  let maturityAmount = principal;
  let totalInterest = 0;

  if (principal > 0 && annualRate > 0) {
    const rateDecimal = annualRate / 100;
    maturityAmount = Math.round(
      principal * Math.pow(1 + rateDecimal / periodsPerYear, periodsPerYear * tenureYears)
    );
    totalInterest = Math.max(0, maturityAmount - principal);
  }

  // Simple Interest Comparison
  const simpleInterestAmount = Math.round((principal * annualRate * tenureYears) / 100);
  const compoundingBonus = Math.max(0, totalInterest - simpleInterestAmount);

  // Effective Annual Rate (APY)
  const effectiveAnnualRate =
    annualRate > 0
      ? Number(((Math.pow(1 + annualRate / (100 * periodsPerYear), periodsPerYear) - 1) * 100).toFixed(2))
      : 0;

  // Yearly Breakdown
  const fullYears = Math.max(1, Math.round(tenureYears));
  const yearlyBreakdown: CompoundYearlyBreakdown[] = [];
  let currentBalance = principal;
  let cumulativeInterest = 0;

  for (let y = 1; y <= fullYears; y++) {
    const openingPrincipal = currentBalance;
    let balanceAtYearEnd = openingPrincipal;
    if (principal > 0 && annualRate > 0) {
      const rateDecimal = annualRate / 100;
      balanceAtYearEnd = Math.round(
        principal * Math.pow(1 + rateDecimal / periodsPerYear, periodsPerYear * y)
      );
    }
    const interestEarned = Math.max(0, balanceAtYearEnd - openingPrincipal);
    cumulativeInterest += interestEarned;
    currentBalance = balanceAtYearEnd;

    yearlyBreakdown.push({
      year: y,
      openingPrincipal,
      interestEarned,
      cumulativeInterest,
      closingBalance: currentBalance,
    });
  }

  // Frequency Comparison
  const allFrequencies: { freq: CompoundFrequency; label: string }[] = [
    { freq: "annual", label: "Annually (1x/yr)" },
    { freq: "half-yearly", label: "Semi-Annually (2x/yr)" },
    { freq: "quarterly", label: "Quarterly (4x/yr)" },
    { freq: "monthly", label: "Monthly (12x/yr)" },
    { freq: "daily", label: "Daily (365x/yr)" },
  ];

  const frequencyComparison: FrequencyComparisonItem[] = allFrequencies.map(({ freq, label }) => {
    const n = getPeriodsPerYear(freq);
    let mat = principal;
    if (principal > 0 && annualRate > 0) {
      const r = annualRate / 100;
      mat = Math.round(principal * Math.pow(1 + r / n, n * tenureYears));
    }
    const apy =
      annualRate > 0
        ? Number(((Math.pow(1 + annualRate / (100 * n), n) - 1) * 100).toFixed(2))
        : 0;

    return {
      frequency: freq,
      label,
      periodsPerYear: n,
      maturityAmount: mat,
      totalInterest: Math.max(0, mat - principal),
      effectiveAnnualRate: apy,
    };
  });

  return {
    principal,
    annualRate,
    tenureYears,
    frequency,
    periodsPerYear,
    maturityAmount,
    totalInterest,
    simpleInterestAmount,
    compoundingBonus,
    effectiveAnnualRate,
    yearlyBreakdown,
    frequencyComparison,
  };
}
