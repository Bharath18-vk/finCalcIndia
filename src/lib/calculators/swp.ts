/**
 * Systematic Withdrawal Plan (SWP) Calculation Engine
 *
 * Simulates a regular monthly payout from an invested mutual fund corpus.
 *
 * Each month:
 *   Monthly Return = Opening Balance * (Annual Return / 12 / 100)
 *   New Balance = Opening Balance + Monthly Return - Monthly Withdrawal
 *
 * Handles capital depletion when withdrawal exceeds return generation.
 */

export interface SWPInput {
  initialInvestment: number;
  monthlyWithdrawal: number;
  expectedAnnualReturn: number;
  tenureYears: number;
}

export interface SWPYearlyBreakdown {
  year: number;
  openingBalance: number;
  totalWithdrawn: number;
  interestEarned: number;
  closingBalance: number;
}

export interface SWPResult {
  initialInvestment: number;
  monthlyWithdrawal: number;
  expectedAnnualReturn: number;
  tenureYears: number;
  totalWithdrawn: number;
  finalValue: number;
  totalProfitGenerated: number;
  isDepleted: boolean;
  depletionMonth?: number;
  depletionYear?: number;
  yearlyBreakdown: SWPYearlyBreakdown[];
}

export function calculateSWP(input: SWPInput): SWPResult {
  const initialInvestment = Math.max(0, input.initialInvestment || 0);
  const monthlyWithdrawal = Math.max(0, input.monthlyWithdrawal || 0);
  const annualReturn = Math.max(0, input.expectedAnnualReturn || 0);
  const tenureYears = Math.max(1, Math.round(input.tenureYears || 1));
  const totalMonths = tenureYears * 12;

  const monthlyRate = annualReturn / 1200;

  let currentBalance = initialInvestment;
  let totalWithdrawn = 0;
  let totalInterestEarned = 0;
  let isDepleted = false;
  let depletionMonth: number | undefined;

  const yearlyBreakdown: SWPYearlyBreakdown[] = [];

  let currentYearOpening = initialInvestment;
  let currentYearWithdrawn = 0;
  let currentYearInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    if (isDepleted) {
      // Record zeros for remaining months of the year
      if (m % 12 === 0 || m === totalMonths) {
        yearlyBreakdown.push({
          year: Math.ceil(m / 12),
          openingBalance: 0,
          totalWithdrawn: 0,
          interestEarned: 0,
          closingBalance: 0,
        });
      }
      continue;
    }

    const monthInterest = currentBalance * monthlyRate;
    totalInterestEarned += monthInterest;
    currentYearInterest += monthInterest;

    const balanceBeforeWithdrawal = currentBalance + monthInterest;

    let actualWithdrawal = monthlyWithdrawal;
    if (balanceBeforeWithdrawal <= monthlyWithdrawal) {
      actualWithdrawal = balanceBeforeWithdrawal;
      currentBalance = 0;
      isDepleted = true;
      depletionMonth = m;
    } else {
      currentBalance = balanceBeforeWithdrawal - monthlyWithdrawal;
    }

    totalWithdrawn += actualWithdrawal;
    currentYearWithdrawn += actualWithdrawal;

    if (m % 12 === 0 || m === totalMonths) {
      const yearIndex = Math.ceil(m / 12);
      yearlyBreakdown.push({
        year: yearIndex,
        openingBalance: Math.round(currentYearOpening),
        totalWithdrawn: Math.round(currentYearWithdrawn),
        interestEarned: Math.round(currentYearInterest),
        closingBalance: Math.round(currentBalance),
      });

      currentYearOpening = currentBalance;
      currentYearWithdrawn = 0;
      currentYearInterest = 0;
    }
  }

  const finalValue = Math.round(currentBalance);
  const totalProfitGenerated = Math.round(
    Math.max(0, finalValue + totalWithdrawn - initialInvestment)
  );

  return {
    initialInvestment,
    monthlyWithdrawal,
    expectedAnnualReturn: annualReturn,
    tenureYears,
    totalWithdrawn: Math.round(totalWithdrawn),
    finalValue,
    totalProfitGenerated,
    isDepleted,
    depletionMonth,
    depletionYear: depletionMonth ? Math.ceil(depletionMonth / 12) : undefined,
    yearlyBreakdown,
  };
}
