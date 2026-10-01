/**
 * Step-Up SIP (Top-Up SIP) Calculation Engine
 *
 * Simulates month-by-month investment where the monthly contribution
 * increases annually by a given percentage or amount.
 *
 * Monthly compounding with payment at the start of each month.
 */

export interface StepUpSIPInput {
  monthlyInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
  annualStepUpPercentage?: number;
  annualStepUpAmount?: number;
}

export interface StepUpSIPYearlyBreakdown {
  year: number;
  monthlyContribution: number;
  investedThisYear: number;
  cumulativeInvested: number;
  wealthGained: number;
  futureValue: number;
}

export interface StepUpSIPResult {
  initialMonthlyInvestment: number;
  finalMonthlyInvestment: number;
  annualReturnRate: number;
  tenureYears: number;
  stepUpPercentage: number;
  totalInvested: number;
  wealthGained: number;
  futureValue: number;
  // Comparison against a normal non-step-up SIP with identical starting installment
  regularSIPTotalInvested: number;
  regularSIPFutureValue: number;
  regularSIPWealthGained: number;
  differenceFutureValue: number;
  differenceInvested: number;
  yearlyBreakdown: StepUpSIPYearlyBreakdown[];
}

export function calculateStepUpSIP(input: StepUpSIPInput): StepUpSIPResult {
  const initialP = Math.max(0, isNaN(input.monthlyInvestment) || !isFinite(input.monthlyInvestment) ? 0 : input.monthlyInvestment);
  const annualRate = Math.max(0, isNaN(input.annualReturnRate) || !isFinite(input.annualReturnRate) ? 0 : input.annualReturnRate);
  const years = Math.max(0, isNaN(input.tenureYears) || !isFinite(input.tenureYears) ? 0 : Math.floor(input.tenureYears));
  const stepUpPct = Math.max(0, isNaN(input.annualStepUpPercentage ?? 0) || !isFinite(input.annualStepUpPercentage ?? 0) ? 0 : input.annualStepUpPercentage ?? 0);
  const stepUpAmount = Math.max(0, isNaN(input.annualStepUpAmount ?? 0) || !isFinite(input.annualStepUpAmount ?? 0) ? 0 : input.annualStepUpAmount ?? 0);

  const totalMonths = years * 12;

  if (initialP === 0 || totalMonths === 0) {
    return {
      initialMonthlyInvestment: initialP,
      finalMonthlyInvestment: initialP,
      annualReturnRate: annualRate,
      tenureYears: years,
      stepUpPercentage: stepUpPct,
      totalInvested: 0,
      wealthGained: 0,
      futureValue: 0,
      regularSIPTotalInvested: 0,
      regularSIPFutureValue: 0,
      regularSIPWealthGained: 0,
      differenceFutureValue: 0,
      differenceInvested: 0,
      yearlyBreakdown: [],
    };
  }

  const r = annualRate / 12 / 100;
  let runningFV = 0;
  let runningInvested = 0;
  let currentMonthlyP = initialP;
  const yearlyBreakdown: StepUpSIPYearlyBreakdown[] = [];

  for (let y = 1; y <= years; y++) {
    let investedThisYear = 0;

    for (let m = 1; m <= 12; m++) {
      runningInvested += currentMonthlyP;
      investedThisYear += currentMonthlyP;
      runningFV = (runningFV + currentMonthlyP) * (1 + r);
    }

    const currentYearEndFV = Math.round(runningFV);
    const totalGained = Math.max(0, currentYearEndFV - runningInvested);

    yearlyBreakdown.push({
      year: y,
      monthlyContribution: Math.round(currentMonthlyP),
      investedThisYear: Math.round(investedThisYear),
      cumulativeInvested: Math.round(runningInvested),
      wealthGained: Math.round(totalGained),
      futureValue: currentYearEndFV,
    });

    // Step up for next year
    if (y < years) {
      if (stepUpPct > 0) {
        currentMonthlyP = currentMonthlyP * (1 + stepUpPct / 100);
      } else if (stepUpAmount > 0) {
        currentMonthlyP += stepUpAmount;
      }
    }
  }

  const finalMonthlyP = Math.round(currentMonthlyP);
  const totalInvested = Math.round(runningInvested);
  const futureValue = Math.round(runningFV);
  const wealthGained = Math.max(0, futureValue - totalInvested);

  // Calculate regular constant SIP for direct comparison
  let regFV = 0;
  if (r === 0) {
    regFV = initialP * totalMonths;
  } else {
    regFV = initialP * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
  }
  const regularSIPTotalInvested = Math.round(initialP * totalMonths);
  const regularSIPFutureValue = Math.round(regFV);
  const regularSIPWealthGained = Math.max(0, regularSIPFutureValue - regularSIPTotalInvested);

  return {
    initialMonthlyInvestment: initialP,
    finalMonthlyInvestment: finalMonthlyP,
    annualReturnRate: annualRate,
    tenureYears: years,
    stepUpPercentage: stepUpPct,
    totalInvested,
    wealthGained,
    futureValue,
    regularSIPTotalInvested,
    regularSIPFutureValue,
    regularSIPWealthGained,
    differenceFutureValue: futureValue - regularSIPFutureValue,
    differenceInvested: totalInvested - regularSIPTotalInvested,
    yearlyBreakdown,
  };
}
