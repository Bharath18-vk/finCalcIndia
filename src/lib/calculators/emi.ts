/**
 * Equated Monthly Installment (EMI) Calculation Engine
 *
 * Formula:
 *   EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1]
 * where:
 *   P = Principal loan amount
 *   r = Monthly interest rate = (Annual Interest Rate / 12) / 100
 *   n = Loan tenure in number of months
 *
 * Special case:
 *   When r = 0, EMI = P / n. Total Interest = 0.
 */

export interface EMIInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
  tenureMonths?: number;
}

export interface AmortizationPeriod {
  period: number; // Month number (1 to n) or Year number (1 to tenureYears)
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  closingBalance: number;
}

export interface SensitivityScenario {
  rate: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  differenceEmi: number;
}

export interface TenureComparisonScenario {
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  interestToPrincipalRatio: number;
}

export interface EMIResult {
  monthlyEMI: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
  totalMonths: number;
  annualRate: number;
  interestPrincipalRatio: number; // Total Interest / Principal * 100
  interestPaymentRatio: number; // Total Interest / Total Payment * 100
  monthlySchedule: AmortizationPeriod[];
  yearlySchedule: AmortizationPeriod[];
  sensitivityTable: SensitivityScenario[];
  tenureComparisonTable: TenureComparisonScenario[];
}

export function calculateEMI(input: EMIInput): EMIResult {
  const principal = Math.max(0, isNaN(input.principal) || !isFinite(input.principal) ? 0 : input.principal);
  const annualRate = Math.max(0, isNaN(input.annualRate) || !isFinite(input.annualRate) ? 0 : input.annualRate);
  const years = Math.max(0, isNaN(input.tenureYears) || !isFinite(input.tenureYears) ? 0 : Math.floor(input.tenureYears));
  const months = Math.max(0, isNaN(input.tenureMonths ?? 0) || !isFinite(input.tenureMonths ?? 0) ? 0 : Math.floor(input.tenureMonths ?? 0));

  const totalMonths = years * 12 + months;

  if (principal === 0 || totalMonths === 0) {
    return {
      monthlyEMI: 0,
      principal,
      totalInterest: 0,
      totalPayment: principal,
      totalMonths,
      annualRate,
      interestPrincipalRatio: 0,
      interestPaymentRatio: 0,
      monthlySchedule: [],
      yearlySchedule: [],
      sensitivityTable: [],
      tenureComparisonTable: [],
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  let rawEMI = 0;

  if (monthlyRate === 0) {
    rawEMI = principal / totalMonths;
  } else {
    const rateFactor = Math.pow(1 + monthlyRate, totalMonths);
    rawEMI = (principal * monthlyRate * rateFactor) / (rateFactor - 1);
  }

  const monthlyEMI = Math.round(rawEMI);

  // Generate monthly amortization schedule
  let currentBalance = principal;
  const monthlySchedule: AmortizationPeriod[] = [];
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const opening = currentBalance;
    const interestForMonth = monthlyRate === 0 ? 0 : opening * monthlyRate;
    let principalForMonth = rawEMI - interestForMonth;

    // Handle last month balance adjustment
    if (m === totalMonths || principalForMonth > currentBalance) {
      principalForMonth = currentBalance;
    }

    const actualMonthlyPayment = principalForMonth + interestForMonth;
    currentBalance = Math.max(0, opening - principalForMonth);
    cumInterest += interestForMonth;
    cumPrincipal += principalForMonth;

    monthlySchedule.push({
      period: m,
      openingBalance: Math.round(opening),
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      totalPayment: Math.round(actualMonthlyPayment),
      closingBalance: Math.round(currentBalance),
    });
  }

  const totalInterest = Math.round(cumInterest);
  const totalPayment = Math.round(cumPrincipal + cumInterest);

  const interestPrincipalRatio = principal > 0 ? (totalInterest / principal) * 100 : 0;
  const interestPaymentRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  // Generate yearly schedule
  const yearlySchedule: AmortizationPeriod[] = [];
  const totalYears = Math.ceil(totalMonths / 12);

  for (let y = 1; y <= totalYears; y++) {
    const startIdx = (y - 1) * 12;
    const endIdx = Math.min(y * 12, totalMonths);
    const monthsInYear = monthlySchedule.slice(startIdx, endIdx);

    if (monthsInYear.length === 0) continue;

    const openingBalance = monthsInYear[0].openingBalance;
    const closingBalance = monthsInYear[monthsInYear.length - 1].closingBalance;
    const yearPrincipal = monthsInYear.reduce((acc, curr) => acc + curr.principalPaid, 0);
    const yearInterest = monthsInYear.reduce((acc, curr) => acc + curr.interestPaid, 0);
    const yearTotal = monthsInYear.reduce((acc, curr) => acc + curr.totalPayment, 0);

    yearlySchedule.push({
      period: y,
      openingBalance,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      totalPayment: yearTotal,
      closingBalance,
    });
  }

  // Rate sensitivity table: ±1% and ±2%
  const rateDeltas = [-2, -1, 0, 1, 2];
  const sensitivityTable: SensitivityScenario[] = [];

  for (const delta of rateDeltas) {
    const testRate = Math.max(0, +(annualRate + delta).toFixed(2));
    const testMonthlyRate = testRate / 12 / 100;
    let testEMI = 0;
    if (testMonthlyRate === 0) {
      testEMI = Math.round(principal / totalMonths);
    } else {
      const rf = Math.pow(1 + testMonthlyRate, totalMonths);
      testEMI = Math.round((principal * testMonthlyRate * rf) / (rf - 1));
    }
    const testTotalPayment = testEMI * totalMonths;
    const testTotalInterest = Math.max(0, testTotalPayment - principal);

    sensitivityTable.push({
      rate: testRate,
      emi: testEMI,
      totalInterest: testTotalInterest,
      totalPayment: testTotalPayment,
      differenceEmi: testEMI - monthlyEMI,
    });
  }

  // Tenure comparison table: context-aware intervals (e.g. 1 to 7 years or 5, 10, 15, 20, 25, 30 years)
  const compareYears = years <= 7 ? [1, 2, 3, 4, 5, 6, 7] : [5, 10, 15, 20, 25, 30];
  const tenureComparisonTable: TenureComparisonScenario[] = [];

  for (const tYears of compareYears) {
    const tMonths = tYears * 12;
    let tEMI = 0;
    if (monthlyRate === 0) {
      tEMI = Math.round(principal / tMonths);
    } else {
      const rf = Math.pow(1 + monthlyRate, tMonths);
      tEMI = Math.round((principal * monthlyRate * rf) / (rf - 1));
    }
    const tTotalPayment = tEMI * tMonths;
    const tTotalInterest = Math.max(0, tTotalPayment - principal);

    tenureComparisonTable.push({
      tenureYears: tYears,
      emi: tEMI,
      totalInterest: tTotalInterest,
      totalPayment: tTotalPayment,
      interestToPrincipalRatio: principal > 0 ? (tTotalInterest / principal) * 100 : 0,
    });
  }

  return {
    monthlyEMI,
    principal,
    totalInterest,
    totalPayment,
    totalMonths,
    annualRate,
    interestPrincipalRatio: +interestPrincipalRatio.toFixed(2),
    interestPaymentRatio: +interestPaymentRatio.toFixed(2),
    monthlySchedule,
    yearlySchedule,
    sensitivityTable,
    tenureComparisonTable,
  };
}
