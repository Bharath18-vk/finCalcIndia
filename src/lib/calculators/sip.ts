/**
 * Systematic Investment Plan (SIP) Calculation Engine
 *
 * Convention:
 *   Monthly compounding with investments made at the start of each month (Annuity Due).
 *
 * Formula:
 *   FV = P x [ (1 + r)^n - 1 ] x (1 + r) / r
 * where:
 *   P = Monthly installment amount
 *   r = Expected monthly return rate = (Annual Return Rate / 12) / 100
 *   n = Number of monthly installments (Years x 12)
 *
 * Special case:
 *   When r = 0, FV = P x n. Wealth Gained = 0.
 */

export interface SIPInput {
  monthlyInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
}

export interface SIPYearlyBreakdown {
  year: number;
  investedCapital: number;
  yearlyInterest: number;
  totalWealthGained: number;
  futureValue: number;
}

export interface SIPSensitivityScenario {
  rate: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  differenceValue: number;
}

export interface SIPTenureScenario {
  tenureYears: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  growthMultiple: number; // futureValue / totalInvested
}

export interface SIPResult {
  monthlyInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
  totalMonths: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  wealthMultiple: number; // futureValue / totalInvested
  yearlyBreakdown: SIPYearlyBreakdown[];
  sensitivityTable: SIPSensitivityScenario[];
  tenureComparisonTable: SIPTenureScenario[];
}

export function calculateSIP(input: SIPInput): SIPResult {
  const p = Math.max(0, isNaN(input.monthlyInvestment) || !isFinite(input.monthlyInvestment) ? 0 : input.monthlyInvestment);
  const annualRate = Math.max(0, isNaN(input.annualReturnRate) || !isFinite(input.annualReturnRate) ? 0 : input.annualReturnRate);
  const years = Math.max(0, isNaN(input.tenureYears) || !isFinite(input.tenureYears) ? 0 : Math.floor(input.tenureYears));

  const totalMonths = years * 12;

  if (p === 0 || totalMonths === 0) {
    return {
      monthlyInvestment: p,
      annualReturnRate: annualRate,
      tenureYears: years,
      totalMonths,
      totalInvested: 0,
      wealthGained: 0,
      futureValue: 0,
      wealthMultiple: 1,
      yearlyBreakdown: [],
      sensitivityTable: [],
      tenureComparisonTable: [],
    };
  }

  const r = annualRate / 12 / 100;
  let futureValue = 0;

  if (r === 0) {
    futureValue = p * totalMonths;
  } else {
    futureValue = p * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
  }

  const roundedFV = Math.round(futureValue);
  const totalInvested = Math.round(p * totalMonths);
  const wealthGained = Math.max(0, roundedFV - totalInvested);
  const wealthMultiple = totalInvested > 0 ? +(roundedFV / totalInvested).toFixed(2) : 1;

  // Month-by-month simulation to generate precise yearly breakdowns
  const yearlyBreakdown: SIPYearlyBreakdown[] = [];
  let runningFV = 0;
  let runningInvested = 0;
  let previousFV = 0;

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      runningInvested += p;
      runningFV = (runningFV + p) * (1 + r);
    }
    const currentYearEndFV = Math.round(runningFV);
    const yearlyInterest = currentYearEndFV - previousFV - (p * 12);
    const totalGained = Math.max(0, currentYearEndFV - runningInvested);

    yearlyBreakdown.push({
      year: y,
      investedCapital: Math.round(runningInvested),
      yearlyInterest: Math.round(yearlyInterest),
      totalWealthGained: Math.round(totalGained),
      futureValue: currentYearEndFV,
    });

    previousFV = currentYearEndFV;
  }

  // Sensitivity table: rate -4%, -2%, 0%, +2%, +4%
  const deltas = [-4, -2, 0, 2, 4];
  const sensitivityTable: SIPSensitivityScenario[] = [];

  for (const delta of deltas) {
    const testRate = Math.max(0, +(annualRate + delta).toFixed(2));
    const testR = testRate / 12 / 100;
    let testFV = 0;
    if (testR === 0) {
      testFV = p * totalMonths;
    } else {
      testFV = p * ((Math.pow(1 + testR, totalMonths) - 1) / testR) * (1 + testR);
    }
    const testRoundedFV = Math.round(testFV);
    const testGained = Math.max(0, testRoundedFV - totalInvested);

    sensitivityTable.push({
      rate: testRate,
      totalInvested,
      wealthGained: testGained,
      futureValue: testRoundedFV,
      differenceValue: testRoundedFV - roundedFV,
    });
  }

  // Tenure comparison table: 5, 10, 15, 20, 25, 30 years
  const compareYears = [5, 10, 15, 20, 25, 30];
  const tenureComparisonTable: SIPTenureScenario[] = [];

  for (const tY of compareYears) {
    const tMonths = tY * 12;
    const tInvested = Math.round(p * tMonths);
    let tFV = 0;
    if (r === 0) {
      tFV = tInvested;
    } else {
      tFV = p * ((Math.pow(1 + r, tMonths) - 1) / r) * (1 + r);
    }
    const roundedTfv = Math.round(tFV);
    const tGained = Math.max(0, roundedTfv - tInvested);

    tenureComparisonTable.push({
      tenureYears: tY,
      totalInvested: tInvested,
      wealthGained: tGained,
      futureValue: roundedTfv,
      growthMultiple: tInvested > 0 ? +(roundedTfv / tInvested).toFixed(2) : 1,
    });
  }

  return {
    monthlyInvestment: p,
    annualReturnRate: annualRate,
    tenureYears: years,
    totalMonths,
    totalInvested,
    wealthGained,
    futureValue: roundedFV,
    wealthMultiple,
    yearlyBreakdown,
    sensitivityTable,
    tenureComparisonTable,
  };
}
