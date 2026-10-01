/**
 * Fixed Deposit (FD) Calculation Engine
 *
 * In Indian commercial banking, cumulative fixed deposits are compounded
 * QUARTERLY by default according to RBI guidelines.
 *
 * Formula:
 *   A = P x (1 + r / n)^(n x t)
 * where:
 *   P = Principal deposit amount
 *   r = Annual interest rate (decimal = Rate / 100)
 *   n = Compounding frequency per year (Quarterly = 4, Monthly = 12, Half-Yearly = 2, Annual = 1)
 *   t = Tenure in years (Years + Months / 12 + Days / 365)
 *
 * Senior citizen benefit:
 *   Indian banks typically offer an additional 0.50% p.a. rate for senior citizens.
 */

export type CompoundingFrequency = "monthly" | "quarterly" | "half-yearly" | "annual" | "simple";

export interface FDInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
  tenureMonths?: number;
  tenureDays?: number;
  compoundingFrequency?: CompoundingFrequency;
  isSeniorCitizen?: boolean;
}

export interface FDYearlyBreakdown {
  year: number;
  openingPrincipal: number;
  interestEarned: number;
  closingBalance: number;
}

export interface FDTenureComparisonScenario {
  tenureYears: number;
  principal: number;
  totalInterest: number;
  maturityAmount: number;
  effectiveAnnualYield: number;
}

export interface FDResult {
  principal: number;
  nominalRate: number;
  effectiveRate: number; // Rate after senior citizen addition if applicable
  isSeniorCitizen: boolean;
  compoundingFrequency: CompoundingFrequency;
  tenureInYears: number;
  maturityAmount: number;
  totalInterest: number;
  effectiveAnnualYield: number; // APY
  yearlyBreakdown: FDYearlyBreakdown[];
  tenureComparisonTable: FDTenureComparisonScenario[];
}

export function calculateFD(input: FDInput): FDResult {
  const p = Math.max(0, isNaN(input.principal) || !isFinite(input.principal) ? 0 : input.principal);
  const baseRate = Math.max(0, isNaN(input.annualRate) || !isFinite(input.annualRate) ? 0 : input.annualRate);
  const years = Math.max(0, isNaN(input.tenureYears) || !isFinite(input.tenureYears) ? 0 : Math.floor(input.tenureYears));
  const months = Math.max(0, isNaN(input.tenureMonths ?? 0) || !isFinite(input.tenureMonths ?? 0) ? 0 : Math.floor(input.tenureMonths ?? 0));
  const days = Math.max(0, isNaN(input.tenureDays ?? 0) || !isFinite(input.tenureDays ?? 0) ? 0 : Math.floor(input.tenureDays ?? 0));
  const freq = input.compoundingFrequency || "quarterly";
  const isSenior = Boolean(input.isSeniorCitizen);

  const effectiveRate = isSenior ? +(baseRate + 0.50).toFixed(2) : baseRate;
  const tenureInYears = years + months / 12 + days / 365;

  if (p === 0 || tenureInYears === 0) {
    return {
      principal: p,
      nominalRate: baseRate,
      effectiveRate,
      isSeniorCitizen: isSenior,
      compoundingFrequency: freq,
      tenureInYears,
      maturityAmount: p,
      totalInterest: 0,
      effectiveAnnualYield: effectiveRate,
      yearlyBreakdown: [],
      tenureComparisonTable: [],
    };
  }

  const r = effectiveRate / 100;
  let maturityRaw = p;
  let n = 4; // default quarterly

  if (freq === "simple") {
    maturityRaw = p * (1 + r * tenureInYears);
  } else {
    switch (freq) {
      case "monthly":
        n = 12;
        break;
      case "quarterly":
        n = 4;
        break;
      case "half-yearly":
        n = 2;
        break;
      case "annual":
        n = 1;
        break;
    }
    maturityRaw = p * Math.pow(1 + r / n, n * tenureInYears);
  }

  const maturityAmount = Math.round(maturityRaw);
  const totalInterest = Math.max(0, maturityAmount - p);

  // Effective annual yield (Annual Percentage Yield)
  const apy = freq === "simple" ? effectiveRate : (Math.pow(1 + r / n, n) - 1) * 100;

  // Yearly progression simulation
  const yearlyBreakdown: FDYearlyBreakdown[] = [];
  const fullYears = Math.ceil(tenureInYears);
  let runningBalance = p;

  for (let y = 1; y <= fullYears; y++) {
    const opening = runningBalance;
    const actualYearTenure = Math.min(y, tenureInYears);
    const yearEndBalance = freq === "simple"
      ? Math.round(p * (1 + r * actualYearTenure))
      : Math.round(p * Math.pow(1 + r / n, n * actualYearTenure));

    const interestThisYear = Math.max(0, yearEndBalance - opening);
    runningBalance = yearEndBalance;

    yearlyBreakdown.push({
      year: y,
      openingPrincipal: Math.round(opening),
      interestEarned: interestThisYear,
      closingBalance: yearEndBalance,
    });
  }

  // Tenure comparison table: 1, 2, 3, 5, 10 years
  const compareTenures = [1, 2, 3, 5, 10];
  const tenureComparisonTable: FDTenureComparisonScenario[] = [];

  for (const tY of compareTenures) {
    const tMaturityRaw = freq === "simple"
      ? p * (1 + r * tY)
      : p * Math.pow(1 + r / n, n * tY);
    const tMaturity = Math.round(tMaturityRaw);

    tenureComparisonTable.push({
      tenureYears: tY,
      principal: p,
      totalInterest: Math.max(0, tMaturity - p),
      maturityAmount: tMaturity,
      effectiveAnnualYield: +apy.toFixed(2),
    });
  }

  return {
    principal: p,
    nominalRate: baseRate,
    effectiveRate,
    isSeniorCitizen: isSenior,
    compoundingFrequency: freq,
    tenureInYears: +tenureInYears.toFixed(4),
    maturityAmount,
    totalInterest,
    effectiveAnnualYield: +apy.toFixed(2),
    yearlyBreakdown,
    tenureComparisonTable,
  };
}
