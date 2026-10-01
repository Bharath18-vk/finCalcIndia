/**
 * Loan Eligibility Calculation Engine
 *
 * In Indian retail banking (Home Loans, Personal Loans, Car Loans), lenders determine
 * maximum borrowing power using the FOIR (Fixed Obligation to Income Ratio) method.
 *
 * Key Formulas:
 *   Max Allowable Total EMI = Net Monthly Income * (FOIR / 100)
 *   Available New Loan EMI = Max(0, Max Allowable Total EMI - Existing Monthly EMIs)
 *
 *   Loan Amount (PV of Annuity):
 *   P = [ Available EMI * ((1 + r)^n - 1) ] / [ r * (1 + r)^n ]
 *   where:
 *     r = monthly interest rate (annualRate / 1200)
 *     n = tenure in months
 */

export interface LoanEligibilityInput {
  netMonthlyIncome: number; // Take-home salary
  existingMonthlyEMIs: number;
  annualRate: number; // Benchmark interest rate (e.g. 8.5% for Home Loan)
  tenureYears: number; // e.g. 20
  foirPercentage?: number; // Default 50% (ranges from 40% to 65% based on income)
}

export interface TenureEligibilityScenario {
  tenureYears: number;
  eligibleLoanAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface LoanEligibilityResult {
  netMonthlyIncome: number;
  existingMonthlyEMIs: number;
  foirPercentage: number;
  annualRate: number;
  tenureYears: number;

  maxAllowableTotalEMI: number;
  availableNewEMI: number;
  eligibleLoanAmount: number;
  totalInterestPayable: number;
  totalRepaymentAmount: number;
  tenureComparisonTable: TenureEligibilityScenario[];
}

export function calculateLoanEligibility(input: LoanEligibilityInput): LoanEligibilityResult {
  const netMonthlyIncome = Math.max(0, input.netMonthlyIncome || 0);
  const existingMonthlyEMIs = Math.max(0, input.existingMonthlyEMIs || 0);
  const annualRate = Math.max(0, input.annualRate || 8.5);
  const tenureYears = Math.max(1, Math.min(30, Math.round(input.tenureYears || 20)));
  const foirPercentage = Math.max(10, Math.min(80, input.foirPercentage || 50));

  const maxAllowableTotalEMI = Math.round(netMonthlyIncome * (foirPercentage / 100));
  const availableNewEMI = Math.max(0, maxAllowableTotalEMI - existingMonthlyEMIs);

  const months = tenureYears * 12;
  const monthlyRate = annualRate / 1200;

  let eligibleLoanAmount = 0;
  let totalInterestPayable = 0;
  let totalRepaymentAmount = 0;

  if (availableNewEMI > 0) {
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, months);
      eligibleLoanAmount = Math.round((availableNewEMI * (factor - 1)) / (monthlyRate * factor));
    } else {
      eligibleLoanAmount = availableNewEMI * months;
    }
    totalRepaymentAmount = availableNewEMI * months;
    totalInterestPayable = Math.max(0, totalRepaymentAmount - eligibleLoanAmount);
  }

  // Comparison across standard tenures (5, 10, 15, 20, 25, 30 years)
  const comparisonTenures = [5, 10, 15, 20, 25, 30];
  const tenureComparisonTable: TenureEligibilityScenario[] = comparisonTenures.map((tYears) => {
    const n = tYears * 12;
    let loanAmt = 0;
    if (availableNewEMI > 0) {
      if (monthlyRate > 0) {
        const factor = Math.pow(1 + monthlyRate, n);
        loanAmt = Math.round((availableNewEMI * (factor - 1)) / (monthlyRate * factor));
      } else {
        loanAmt = availableNewEMI * n;
      }
    }
    const totalRepay = availableNewEMI * n;
    return {
      tenureYears: tYears,
      eligibleLoanAmount: loanAmt,
      monthlyEMI: availableNewEMI,
      totalInterest: Math.max(0, totalRepay - loanAmt),
      totalRepayment: totalRepay,
    };
  });

  return {
    netMonthlyIncome,
    existingMonthlyEMIs,
    foirPercentage,
    annualRate,
    tenureYears,
    maxAllowableTotalEMI,
    availableNewEMI,
    eligibleLoanAmount,
    totalInterestPayable,
    totalRepaymentAmount,
    tenureComparisonTable,
  };
}
