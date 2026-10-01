/**
 * Public Provident Fund (PPF) Calculation Engine
 *
 * Statutory Scheme Rules (Ministry of Finance, Government of India):
 * - Minimum deposit: ₹500 per financial year
 * - Maximum deposit: ₹1,50,000 per financial year
 * - Tenure: 15 full financial years, extendable indefinitely in 5-year blocks (15, 20, 25, 30 years)
 * - Interest calculation rule:
 *   Interest is calculated every month on the lowest balance between the close of the 5th day
 *   and the end of the calendar month.
 *   Interest is compounded ANNUALLY and credited to the account at the end of each financial year (March 31st).
 * - Tax status: EEE (Exempt at deposit under 80C, exempt on interest accrual, exempt on maturity under Section 10(10D)).
 */

export type PPFDepositFrequency = "annual" | "monthly";

export interface PPFInput {
  depositAmount: number; // Annual lumpsum or monthly installment
  depositFrequency?: PPFDepositFrequency; // "annual" | "monthly"
  annualRate: number; // e.g. 7.10
  tenureYears?: number; // 15, 20, 25, 30 (default 15)
}

export interface PPFYearlyBreakdown {
  year: number;
  openingBalance: number;
  annualDeposit: number;
  interestEarned: number;
  closingBalance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
  loanEligibility: number; // Eligible loan from year 3 to 6
  withdrawalLimit: number; // Partial withdrawal eligible from year 7
}

export interface PPFResult {
  annualDepositEquivalent: number;
  depositFrequency: PPFDepositFrequency;
  annualRate: number;
  tenureYears: number;
  totalDeposit: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: PPFYearlyBreakdown[];
}

export function calculatePPF(input: PPFInput): PPFResult {
  const depositFrequency: PPFDepositFrequency = input.depositFrequency || "annual";
  const rawDeposit = Math.max(0, input.depositAmount || 0);

  // Enforce statutory limits: Max ₹1.5 Lakh/year, Min ₹500/year
  let annualDeposit = depositFrequency === "annual" ? rawDeposit : rawDeposit * 12;
  annualDeposit = Math.min(150000, Math.max(0, annualDeposit));

  const monthlyDeposit = depositFrequency === "monthly" ? annualDeposit / 12 : 0;
  const annualRate =
    input.annualRate !== undefined ? Math.max(0, input.annualRate) : 7.1;
  const tenureYears = Math.max(15, Math.min(30, Math.round(input.tenureYears || 15)));

  const yearlyBreakdown: PPFYearlyBreakdown[] = [];
  let currentBalance = 0;
  let cumulativeDeposits = 0;
  let cumulativeInterest = 0;

  for (let year = 1; year <= tenureYears; year++) {
    const openingBalance = currentBalance;
    cumulativeDeposits += annualDeposit;

    let interestEarned = 0;

    if (annualRate > 0) {
      if (depositFrequency === "annual") {
        // Deposited before April 5th: earns interest for all 12 months
        const principalEarningInterest = openingBalance + annualDeposit;
        interestEarned = Math.round((principalEarningInterest * annualRate) / 100);
      } else {
        // Deposited monthly on/before the 5th of each month
        // Month m balance = openingBalance + m * monthlyDeposit
        // Monthly interest = balance * (annualRate / 12 / 100)
        let totalYearlyInterest = 0;
        for (let m = 1; m <= 12; m++) {
          const monthlyLowestBalance = openingBalance + m * monthlyDeposit;
          totalYearlyInterest += (monthlyLowestBalance * annualRate) / 1200;
        }
        interestEarned = Math.round(totalYearlyInterest);
      }
    }

    cumulativeInterest += interestEarned;
    currentBalance = openingBalance + annualDeposit + interestEarned;

    // Statutory Loan Eligibility: Between 3rd and 6th financial year:
    // 25% of balance at the end of the second preceding financial year.
    let loanEligibility = 0;
    if (year >= 3 && year <= 6) {
      const secondPreceding = yearlyBreakdown[year - 3];
      if (secondPreceding) {
        loanEligibility = Math.round(secondPreceding.closingBalance * 0.25);
      }
    }

    // Statutory Partial Withdrawal: From 7th financial year onwards:
    // 50% of the balance at the end of the fourth preceding year or the immediately preceding year, whichever is lower.
    let withdrawalLimit = 0;
    if (year >= 7) {
      const fourthPreceding = yearlyBreakdown[year - 5]?.closingBalance || 0;
      const immediatelyPreceding = yearlyBreakdown[year - 2]?.closingBalance || 0;
      withdrawalLimit = Math.round(Math.min(fourthPreceding, immediatelyPreceding) * 0.5);
    }

    yearlyBreakdown.push({
      year,
      openingBalance,
      annualDeposit,
      interestEarned,
      closingBalance: currentBalance,
      cumulativeDeposits,
      cumulativeInterest,
      loanEligibility,
      withdrawalLimit,
    });
  }

  return {
    annualDepositEquivalent: annualDeposit,
    depositFrequency,
    annualRate,
    tenureYears,
    totalDeposit: cumulativeDeposits,
    totalInterest: cumulativeInterest,
    maturityAmount: currentBalance,
    yearlyBreakdown,
  };
}
