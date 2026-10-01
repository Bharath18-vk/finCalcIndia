/**
 * Recurring Deposit (RD) Calculation Engine
 *
 * In Indian commercial banking and India Post, Recurring Deposit interest is
 * compounded QUARTERLY in accordance with Indian Banks' Association (IBA)
 * and Reserve Bank of India (RBI) directives.
 *
 * Installments are deposited monthly. For an installment deposited in month i (1 <= i <= n),
 * it earns compound interest for the remaining (n - i + 1) months.
 *
 * Formula:
 *   Let P = monthly installment amount
 *   R = annual interest rate (e.g., 6.80 for 6.80%)
 *   q = R / 400 (quarterly interest rate)
 *   n = tenure in months
 *
 *   Maturity Value:
 *   M = P * [ (1 + q)^(n/3) - 1 ] / [ 1 - (1 + q)^(-1/3) ]
 *
 * When R == 0:
 *   M = P * n
 *
 * Senior Citizen Benefit:
 *   Indian banks offer an additional 0.50% p.a. interest rate for senior citizens.
 */

export interface RDInput {
  monthlyDeposit: number;
  annualRate: number;
  tenureMonths: number; // or tenureYears * 12
  isSeniorCitizen?: boolean;
}

export interface RDYearlyBreakdown {
  year: number;
  depositedSoFar: number;
  interestEarnedYear: number;
  cumulativeInterest: number;
  closingBalance: number;
}

export interface RDTenureComparisonScenario {
  tenureMonths: number;
  tenureYears: number;
  totalDeposit: number;
  totalInterest: number;
  maturityAmount: number;
  effectiveAnnualYield: number;
}

export interface RDResult {
  monthlyDeposit: number;
  nominalRate: number;
  effectiveRate: number;
  isSeniorCitizen: boolean;
  tenureMonths: number;
  tenureYears: number;
  totalDeposit: number;
  totalInterest: number;
  maturityAmount: number;
  effectiveAnnualYield: number;
  yearlyBreakdown: RDYearlyBreakdown[];
  tenureComparisonTable: RDTenureComparisonScenario[];
}

export function calculateRD(input: RDInput): RDResult {
  const monthlyDeposit = Math.max(0, input.monthlyDeposit || 0);
  const nominalRate = Math.max(0, input.annualRate || 0);
  const isSeniorCitizen = Boolean(input.isSeniorCitizen);
  const effectiveRate = isSeniorCitizen ? nominalRate + 0.5 : nominalRate;
  const tenureMonths = Math.max(1, Math.round(input.tenureMonths || 12));
  const tenureYears = Number((tenureMonths / 12).toFixed(2));

  const totalDeposit = monthlyDeposit * tenureMonths;

  let maturityAmount = totalDeposit;
  let totalInterest = 0;

  if (effectiveRate > 0 && monthlyDeposit > 0) {
    const q = effectiveRate / 400; // quarterly rate
    const numerator = Math.pow(1 + q, tenureMonths / 3) - 1;
    const denominator = 1 - Math.pow(1 + q, -1 / 3);
    maturityAmount = Math.round(monthlyDeposit * (numerator / denominator));
    totalInterest = Math.max(0, maturityAmount - totalDeposit);
  }

  // Calculate Effective Annual Yield (APY): APY = (1 + r/4)^4 - 1
  const effectiveAnnualYield =
    effectiveRate > 0
      ? Number(((Math.pow(1 + effectiveRate / 400, 4) - 1) * 100).toFixed(2))
      : 0;

  // Yearly Breakdown
  const yearlyBreakdown: RDYearlyBreakdown[] = [];
  const totalFullYears = Math.ceil(tenureMonths / 12);
  let prevBalance = 0;
  let prevDeposit = 0;

  for (let y = 1; y <= totalFullYears; y++) {
    const monthsAtYear = Math.min(y * 12, tenureMonths);
    const depositAtYear = monthlyDeposit * monthsAtYear;

    let balanceAtYear = depositAtYear;
    if (effectiveRate > 0 && monthlyDeposit > 0) {
      const q = effectiveRate / 400;
      const num = Math.pow(1 + q, monthsAtYear / 3) - 1;
      const den = 1 - Math.pow(1 + q, -1 / 3);
      balanceAtYear = Math.round(monthlyDeposit * (num / den));
    }

    const cumulativeInterest = Math.max(0, balanceAtYear - depositAtYear);
    const depositThisYear = depositAtYear - prevDeposit;
    const interestEarnedYear = Math.max(0, balanceAtYear - prevBalance - depositThisYear);

    yearlyBreakdown.push({
      year: y,
      depositedSoFar: depositAtYear,
      interestEarnedYear,
      cumulativeInterest,
      closingBalance: balanceAtYear,
    });

    prevBalance = balanceAtYear;
    prevDeposit = depositAtYear;
  }

  // Tenure Comparison Table (standard tenures: 6m, 1y, 2y, 3y, 5y, 10y)
  const comparisonTenures = [6, 12, 24, 36, 60, 120];
  const tenureComparisonTable: RDTenureComparisonScenario[] = comparisonTenures.map((m) => {
    const deposit = monthlyDeposit * m;
    let maturity = deposit;
    if (effectiveRate > 0 && monthlyDeposit > 0) {
      const q = effectiveRate / 400;
      const num = Math.pow(1 + q, m / 3) - 1;
      const den = 1 - Math.pow(1 + q, -1 / 3);
      maturity = Math.round(monthlyDeposit * (num / den));
    }
    const interest = Math.max(0, maturity - deposit);
    return {
      tenureMonths: m,
      tenureYears: Number((m / 12).toFixed(1)),
      totalDeposit: deposit,
      totalInterest: interest,
      maturityAmount: maturity,
      effectiveAnnualYield,
    };
  });

  return {
    monthlyDeposit,
    nominalRate,
    effectiveRate,
    isSeniorCitizen,
    tenureMonths,
    tenureYears,
    totalDeposit,
    totalInterest,
    maturityAmount,
    effectiveAnnualYield,
    yearlyBreakdown,
    tenureComparisonTable,
  };
}
