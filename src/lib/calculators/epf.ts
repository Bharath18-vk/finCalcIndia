/**
 * Employees' Provident Fund (EPF) Engine
 * Statutory Authority: Employees' Provident Funds and Miscellaneous Provisions Act, 1952.
 * Administering Body: Employees' Provident Fund Organisation (EPFO), Ministry of Labour and Employment, Govt of India.
 *
 * Statutory Rate Architecture:
 * - Rate: 8.25% p.a.
 * - Applicable Financial Year: FY 2023-24 & FY 2024-25 (notified by CBT & ratified by MoF).
 * - Not a permanent rate; determined and notified annually by EPFO.
 *
 * Contributions:
 * - Employee Contribution: Statutory default 12% of (Basic + DA). Can be 10% for specified establishments, or higher for Voluntary PF (VPF).
 * - Employer Contribution: Total 12% of (Basic + DA). Split into:
 *   * 8.33% to Employees' Pension Scheme (EPS), capped at ₹1,250/mo on the statutory wage ceiling of ₹15,000/mo.
 *   * 3.67% + excess over EPS cap to Employees' Provident Fund (EPF).
 * - Interest Crediting: Compounded monthly on running balances and officially credited on March 31 annually.
 */

export interface EPFStatutoryMetadata {
  statutoryRate: number;
  applicableFinancialYear: string;
  effectivePeriod: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  notes: string;
}

export const EPF_CURRENT_STATUTORY_METADATA: EPFStatutoryMetadata = {
  statutoryRate: 8.25,
  applicableFinancialYear: "FY 2023-24 & FY 2024-25",
  effectivePeriod: "01-04-2023 to 31-03-2025",
  sourceName: "Employees' Provident Fund Organisation (EPFO) / Ministry of Labour & Employment",
  sourceUrl: "https://www.epfindia.gov.in",
  verifiedAt: "2024-10-01",
  notes:
    "Statutory interest rate of 8.25% p.a. declared by the Central Board of Trustees (CBT), EPFO for FY 2023-24 and continued for FY 2024-25. Interest is credited annually on monthly running balances. Rates are not permanent and are notified annually.",
};

export interface EPFYearlyProgress {
  year: number;
  age: number;
  monthlyBasicSalary: number;
  employeeContributionAnnual: number;
  employerEPFContributionAnnual: number;
  employerEPSContributionAnnual: number;
  totalDepositInYear: number;
  interestEarnedInYear: number;
  closingBalance: number;
}

export interface EPFInputs {
  currentMonthlyBasicSalary: number; // Basic + DA
  currentAge: number; // Current age (e.g. 25)
  retirementAge?: number; // Default 58 (EPFO superannuation)
  annualSalaryIncrementPercentage?: number; // Annual salary hike (default 5%)
  annualInterestRate?: number; // Default 8.25%
  currentEPFBalance?: number; // Existing accumulated EPF balance
  employeeContributionRatePercent?: number; // Default 12% (support 10% statutory or custom VPF)
  wageCeilingOption?: "eps_capped_15k" | "both_capped_15k" | "uncapped"; // Default 'eps_capped_15k'
}

export interface EPFResult {
  monthlyBasicSalaryInitial: number;
  currentAge: number;
  retirementAge: number;
  tenureYears: number;

  totalEmployeeContribution: number;
  totalEmployerContribution: number; // Total EPF portion
  totalEPSContribution: number; // Pension fund portion
  totalDeposited: number;
  totalInterestEarned: number;
  maturityCorpus: number;

  statutoryRate: number;
  applicableFinancialYear: string;
  rateMetadata: EPFStatutoryMetadata;
  yearlyBreakdown: EPFYearlyProgress[];
}

export function calculateEPF(inputs: EPFInputs): EPFResult {
  let basicMonthly = Math.max(0, Math.round(Number(inputs.currentMonthlyBasicSalary) || 0));
  const currentAge = Math.min(57, Math.max(18, Math.floor(Number(inputs.currentAge) || 25)));
  const retirementAge = Math.min(65, Math.max(currentAge + 1, Math.floor(Number(inputs.retirementAge) || 58)));
  const tenureYears = retirementAge - currentAge;

  const incrementRate = Math.min(50, Math.max(0, Number(inputs.annualSalaryIncrementPercentage ?? 5))) / 100;
  const annualInterestRate = Math.min(15, Math.max(0, Number(inputs.annualInterestRate ?? EPF_CURRENT_STATUTORY_METADATA.statutoryRate)));
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  let balance = Math.max(0, Math.round(Number(inputs.currentEPFBalance) || 0));
  const initialBalance = balance;
  const employeeContribRate = Math.min(100, Math.max(10, Number(inputs.employeeContributionRatePercent ?? 12))) / 100;
  const wageCeiling = inputs.wageCeilingOption || "eps_capped_15k";

  if (basicMonthly === 0 || tenureYears <= 0) {
    return {
      monthlyBasicSalaryInitial: basicMonthly,
      currentAge,
      retirementAge,
      tenureYears: Math.max(0, tenureYears),
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalEPSContribution: 0,
      totalDeposited: initialBalance,
      totalInterestEarned: 0,
      maturityCorpus: initialBalance,
      statutoryRate: annualInterestRate,
      applicableFinancialYear: EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear,
      rateMetadata: EPF_CURRENT_STATUTORY_METADATA,
      yearlyBreakdown: [],
    };
  }

  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;
  let totalEPSContrib = 0;
  let totalInterest = 0;
  const yearlyBreakdown: EPFYearlyProgress[] = [];

  for (let y = 1; y <= tenureYears; y++) {
    let yearEmployeeContrib = 0;
    let yearEmployerEPFContrib = 0;
    let yearEmployerEPSContrib = 0;
    let interestAccruedInYear = 0;

    // Monthly EPF calculation
    let wageForEmployee = basicMonthly;
    let wageForEmployer = basicMonthly;

    if (wageCeiling === "both_capped_15k") {
      wageForEmployee = Math.min(15000, basicMonthly);
      wageForEmployer = Math.min(15000, basicMonthly);
    }

    const employeeMonthlyContrib = Math.round(wageForEmployee * employeeContribRate);

    // Employer split: 8.33% to EPS, 3.67% (+ excess) to EPF
    let epsMonthly = 0;
    let employerEPFMonthly = 0;

    if (wageCeiling === "both_capped_15k") {
      epsMonthly = Math.round(Math.min(15000, basicMonthly) * 0.0833);
      employerEPFMonthly = Math.round(Math.min(15000, basicMonthly) * 0.0367);
    } else if (wageCeiling === "eps_capped_15k") {
      // EPS capped at 8.33% of ₹15,000 = ₹1,250
      epsMonthly = Math.min(1250, Math.round(basicMonthly * 0.0833));
      const totalEmployer12Pct = Math.round(basicMonthly * 0.12);
      employerEPFMonthly = Math.max(0, totalEmployer12Pct - epsMonthly);
    } else {
      // Uncapped EPS
      epsMonthly = Math.round(basicMonthly * 0.0833);
      employerEPFMonthly = Math.round(basicMonthly * 0.0367);
    }

    const totalMonthlyDepositToEPF = employeeMonthlyContrib + employerEPFMonthly;

    for (let m = 1; m <= 12; m++) {
      balance += totalMonthlyDepositToEPF;
      yearEmployeeContrib += employeeMonthlyContrib;
      yearEmployerEPFContrib += employerEPFMonthly;
      yearEmployerEPSContrib += epsMonthly;

      // EPFO convention: monthly interest accrued on month-end balance
      interestAccruedInYear += balance * monthlyInterestRate;
    }

    // Interest is credited annually to EPF balance on March 31
    const roundedYearInterest = Math.round(interestAccruedInYear);
    balance += roundedYearInterest;
    totalInterest += roundedYearInterest;

    totalEmployeeContrib += yearEmployeeContrib;
    totalEmployerContrib += yearEmployerEPFContrib;
    totalEPSContrib += yearEmployerEPSContrib;

    yearlyBreakdown.push({
      year: y,
      age: currentAge + y,
      monthlyBasicSalary: basicMonthly,
      employeeContributionAnnual: yearEmployeeContrib,
      employerEPFContributionAnnual: yearEmployerEPFContrib,
      employerEPSContributionAnnual: yearEmployerEPSContrib,
      totalDepositInYear: yearEmployeeContrib + yearEmployerEPFContrib,
      interestEarnedInYear: roundedYearInterest,
      closingBalance: balance,
    });

    // Annual salary hike applied after each year
    basicMonthly = Math.round(basicMonthly * (1 + incrementRate));
  }

  return {
    monthlyBasicSalaryInitial: Math.round(Number(inputs.currentMonthlyBasicSalary) || 0),
    currentAge,
    retirementAge,
    tenureYears,
    totalEmployeeContribution: totalEmployeeContrib,
    totalEmployerContribution: totalEmployerContrib,
    totalEPSContribution: totalEPSContrib,
    totalDeposited: totalEmployeeContrib + totalEmployerContrib,
    totalInterestEarned: totalInterest,
    maturityCorpus: balance,
    statutoryRate: annualInterestRate,
    applicableFinancialYear: EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear,
    rateMetadata: EPF_CURRENT_STATUTORY_METADATA,
    yearlyBreakdown,
  };
}
