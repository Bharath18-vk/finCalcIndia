/**
 * Loan Prepayment & Foreclosure Calculation Engine
 *
 * Models the dramatic interest-saving and tenure-reduction power of:
 * 1. One-time lump sum prepayment
 * 2. Regular monthly extra EMI contribution
 * 3. Annual lump-sum prepayment (e.g. annual performance bonus)
 *
 * Strategies:
 * - "reduce-tenure": Keeps EMI fixed, extinguishing the debt months/years earlier.
 * - "reduce-emi": Retains the original loan term, lowering the monthly installment.
 */

import { calculateEMI } from "./emi";

export type PrepaymentStrategy = "reduce-tenure" | "reduce-emi";

export interface PrepaymentInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
  strategy?: PrepaymentStrategy; // default: "reduce-tenure"
  oneTimePrepayment?: {
    amount: number;
    atMonth: number;
  };
  monthlyExtraEMI?: number;
  annualPrepayment?: {
    amount: number;
    startYear?: number;
  };
}

export interface PrepaymentYearlyComparison {
  year: number;
  originalClosingBalance: number;
  revisedClosingBalance: number;
  originalCumulativeInterest: number;
  revisedCumulativeInterest: number;
  prepaymentInYear: number;
}

export interface PrepaymentResult {
  originalEMI: number;
  originalTenureMonths: number;
  originalTotalInterest: number;
  originalTotalPayment: number;

  revisedEMI: number;
  revisedTenureMonths: number;
  revisedTotalInterest: number;
  revisedTotalPayment: number;
  totalPrepaymentAmount: number;

  tenureMonthsSaved: number;
  tenureYearsSaved: number;
  totalInterestSaved: number;
  percentageInterestSaved: number;
  strategy: PrepaymentStrategy;

  yearlyComparison: PrepaymentYearlyComparison[];
}

export function calculatePrepayment(input: PrepaymentInput): PrepaymentResult {
  const principal = Math.max(0, input.principal || 0);
  const annualRate = Math.max(0, input.annualRate || 0);
  const tenureYears = Math.max(0.5, input.tenureYears || 1);
  const totalMonths = Math.round(tenureYears * 12);
  const strategy: PrepaymentStrategy = input.strategy || "reduce-tenure";

  const monthlyExtra = Math.max(0, input.monthlyExtraEMI || 0);
  const oneTimeAmount = Math.max(0, input.oneTimePrepayment?.amount || 0);
  const oneTimeMonth = Math.max(1, input.oneTimePrepayment?.atMonth || 12);
  const annualPrepayAmount = Math.max(0, input.annualPrepayment?.amount || 0);
  const annualStartYear = Math.max(1, input.annualPrepayment?.startYear || 1);

  // Baseline loan details without prepayment
  const baseline = calculateEMI({
    principal,
    annualRate,
    tenureYears,
  });

  const baseEMI = baseline.monthlyEMI;
  const originalTotalInterest = baseline.totalInterest;
  const originalTotalPayment = baseline.totalPayment;

  if (
    principal <= 0 ||
    annualRate <= 0 ||
    (monthlyExtra === 0 && oneTimeAmount === 0 && annualPrepayAmount === 0)
  ) {
    let cumInt = 0;
    return {
      originalEMI: baseEMI,
      originalTenureMonths: totalMonths,
      originalTotalInterest,
      originalTotalPayment,
      revisedEMI: baseEMI,
      revisedTenureMonths: totalMonths,
      revisedTotalInterest: originalTotalInterest,
      revisedTotalPayment: originalTotalPayment,
      totalPrepaymentAmount: 0,
      tenureMonthsSaved: 0,
      tenureYearsSaved: 0,
      totalInterestSaved: 0,
      percentageInterestSaved: 0,
      strategy,
      yearlyComparison: baseline.yearlySchedule.map((item) => {
        cumInt += item.interestPaid;
        return {
          year: item.period,
          originalClosingBalance: item.closingBalance,
          revisedClosingBalance: item.closingBalance,
          originalCumulativeInterest: cumInt,
          revisedCumulativeInterest: cumInt,
          prepaymentInYear: 0,
        };
      }),
    };
  }

  const monthlyRate = annualRate / 1200;

  let balance = principal;
  let currentEMI = baseEMI;
  let revisedTotalInterest = 0;
  let totalPrepaymentDone = 0;
  let actualTenureMonths = 0;

  // Track yearly progress
  const yearlyData: Record<
    number,
    {
      revisedBalance: number;
      revisedInterest: number;
      prepaymentYear: number;
    }
  > = {};

  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0) break;

    actualTenureMonths = m;
    const currentYear = Math.ceil(m / 12);

    if (!yearlyData[currentYear]) {
      yearlyData[currentYear] = {
        revisedBalance: 0,
        revisedInterest: 0,
        prepaymentYear: 0,
      };
    }

    // Monthly interest
    const interestMonth = balance * monthlyRate;
    revisedTotalInterest += interestMonth;
    yearlyData[currentYear].revisedInterest += interestMonth;

    // Normal monthly principal repayment
    let regularPrincipal = currentEMI - interestMonth;
    if (balance <= currentEMI) {
      // Final month payoff
      regularPrincipal = balance;
      balance = 0;
      yearlyData[currentYear].revisedBalance = 0;
      break;
    } else {
      balance -= regularPrincipal;
    }

    // Apply prepayments for this month
    let prepayThisMonth = 0;

    // 1. Extra monthly EMI
    if (monthlyExtra > 0) {
      prepayThisMonth += monthlyExtra;
    }

    // 2. One-time prepayment
    if (oneTimeAmount > 0 && m === oneTimeMonth) {
      prepayThisMonth += oneTimeAmount;
    }

    // 3. Annual prepayment (applied on month 12, 24, 36...)
    if (annualPrepayAmount > 0 && m % 12 === 0 && currentYear >= annualStartYear) {
      prepayThisMonth += annualPrepayAmount;
    }

    if (prepayThisMonth > 0) {
      const actualPrepay = Math.min(balance, prepayThisMonth);
      balance -= actualPrepay;
      totalPrepaymentDone += actualPrepay;
      yearlyData[currentYear].prepaymentYear += actualPrepay;

      if (strategy === "reduce-emi" && balance > 0) {
        // Recalculate lower EMI for remaining tenure
        const remainingMonths = totalMonths - m;
        if (remainingMonths > 0) {
          const factor = Math.pow(1 + monthlyRate, remainingMonths);
          currentEMI = Math.round((balance * monthlyRate * factor) / (factor - 1));
        }
      }
    }

    yearlyData[currentYear].revisedBalance = Math.round(balance);
  }

  const roundedRevisedInterest = Math.round(revisedTotalInterest);
  const totalInterestSaved = Math.max(0, originalTotalInterest - roundedRevisedInterest);
  const percentageInterestSaved =
    originalTotalInterest > 0
      ? Number(((totalInterestSaved / originalTotalInterest) * 100).toFixed(1))
      : 0;

  const tenureMonthsSaved = Math.max(0, totalMonths - actualTenureMonths);
  const tenureYearsSaved = Number((tenureMonthsSaved / 12).toFixed(1));

  // Construct yearly comparison
  const yearlyComparison: PrepaymentYearlyComparison[] = [];
  let cumOrigInterest = 0;
  let cumRevInterest = 0;

  for (let y = 1; y <= Math.ceil(totalMonths / 12); y++) {
    const origYear = baseline.yearlySchedule.find((item) => item.period === y);
    const origClosing = origYear ? origYear.closingBalance : 0;
    cumOrigInterest += origYear ? origYear.interestPaid : 0;

    const revInfo = yearlyData[y] || {
      revisedBalance: 0,
      revisedInterest: 0,
      prepaymentYear: 0,
    };
    cumRevInterest += revInfo.revisedInterest;

    yearlyComparison.push({
      year: y,
      originalClosingBalance: origClosing,
      revisedClosingBalance: revInfo.revisedBalance,
      originalCumulativeInterest: Math.round(cumOrigInterest),
      revisedCumulativeInterest: Math.round(cumRevInterest),
      prepaymentInYear: revInfo.prepaymentYear,
    });
  }

  return {
    originalEMI: baseEMI,
    originalTenureMonths: totalMonths,
    originalTotalInterest,
    originalTotalPayment,

    revisedEMI: strategy === "reduce-emi" ? currentEMI : baseEMI,
    revisedTenureMonths: actualTenureMonths,
    revisedTotalInterest: roundedRevisedInterest,
    revisedTotalPayment: Math.round(principal + roundedRevisedInterest),
    totalPrepaymentAmount: totalPrepaymentDone,

    tenureMonthsSaved,
    tenureYearsSaved,
    totalInterestSaved,
    percentageInterestSaved,
    strategy,

    yearlyComparison,
  };
}
