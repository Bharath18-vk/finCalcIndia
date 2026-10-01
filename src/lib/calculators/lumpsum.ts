/**
 * Lumpsum (One-Time Mutual Fund / Equity Investment) Calculation Engine
 *
 * Formula:
 *   A = P x (1 + r)^t
 * where:
 *   P = One-time initial principal investment
 *   r = Annual expected rate of return (as decimal, Rate / 100)
 *   t = Tenure in years
 *
 * Wealth Gained = A - P
 */

export interface LumpsumInput {
  totalInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
}

export interface LumpsumYearlyBreakdown {
  year: number;
  investedCapital: number;
  growthThisYear: number;
  totalWealthGained: number;
  futureValue: number;
}

export interface LumpsumSensitivityScenario {
  rate: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  differenceValue: number;
}

export interface LumpsumTenureScenario {
  tenureYears: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  growthMultiple: number;
}

export interface LumpsumResult {
  totalInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
  wealthGained: number;
  futureValue: number;
  growthMultiple: number; // futureValue / totalInvestment
  yearlyBreakdown: LumpsumYearlyBreakdown[];
  sensitivityTable: LumpsumSensitivityScenario[];
  tenureComparisonTable: LumpsumTenureScenario[];
}

export function calculateLumpsum(input: LumpsumInput): LumpsumResult {
  const p = Math.max(0, isNaN(input.totalInvestment) || !isFinite(input.totalInvestment) ? 0 : input.totalInvestment);
  const annualRate = Math.max(0, isNaN(input.annualReturnRate) || !isFinite(input.annualReturnRate) ? 0 : input.annualReturnRate);
  const years = Math.max(0, isNaN(input.tenureYears) || !isFinite(input.tenureYears) ? 0 : Math.floor(input.tenureYears));

  if (p === 0 || years === 0) {
    return {
      totalInvestment: p,
      annualReturnRate: annualRate,
      tenureYears: years,
      wealthGained: 0,
      futureValue: p,
      growthMultiple: 1,
      yearlyBreakdown: [],
      sensitivityTable: [],
      tenureComparisonTable: [],
    };
  }

  const r = annualRate / 100;
  const fvRaw = p * Math.pow(1 + r, years);
  const futureValue = Math.round(fvRaw);
  const wealthGained = Math.max(0, futureValue - p);
  const growthMultiple = p > 0 ? +(futureValue / p).toFixed(2) : 1;

  // Yearly breakdown
  const yearlyBreakdown: LumpsumYearlyBreakdown[] = [];
  let previousValue = p;

  for (let y = 1; y <= years; y++) {
    const valYear = Math.round(p * Math.pow(1 + r, y));
    const growth = valYear - previousValue;
    const totalGained = valYear - p;

    yearlyBreakdown.push({
      year: y,
      investedCapital: p,
      growthThisYear: growth,
      totalWealthGained: totalGained,
      futureValue: valYear,
    });

    previousValue = valYear;
  }

  // Sensitivity table
  const deltas = [-4, -2, 0, 2, 4];
  const sensitivityTable: LumpsumSensitivityScenario[] = [];

  for (const delta of deltas) {
    const testRate = Math.max(0, +(annualRate + delta).toFixed(2));
    const testR = testRate / 100;
    const testFV = Math.round(p * Math.pow(1 + testR, years));
    const testGained = Math.max(0, testFV - p);

    sensitivityTable.push({
      rate: testRate,
      totalInvested: p,
      wealthGained: testGained,
      futureValue: testFV,
      differenceValue: testFV - futureValue,
    });
  }

  // Tenure table
  const compareYears = [1, 3, 5, 10, 15, 20, 25];
  const tenureComparisonTable: LumpsumTenureScenario[] = [];

  for (const tY of compareYears) {
    const tFV = Math.round(p * Math.pow(1 + r, tY));
    const tGained = Math.max(0, tFV - p);

    tenureComparisonTable.push({
      tenureYears: tY,
      totalInvested: p,
      wealthGained: tGained,
      futureValue: tFV,
      growthMultiple: p > 0 ? +(tFV / p).toFixed(2) : 1,
    });
  }

  return {
    totalInvestment: p,
    annualReturnRate: annualRate,
    tenureYears: years,
    wealthGained,
    futureValue,
    growthMultiple,
    yearlyBreakdown,
    sensitivityTable,
    tenureComparisonTable,
  };
}
