import { describe, it, expect } from "vitest";
import { calculateEPF, EPF_CURRENT_STATUTORY_METADATA } from "@/lib/calculators/epf";

describe("Employees' Provident Fund (EPF) Calculator - EPFO Statutory Rules", () => {
  it("computes cumulative EPF maturity with monthly compounding and verifies financial year metadata", () => {
    const result = calculateEPF({
      currentMonthlyBasicSalary: 30000,
      currentAge: 25,
      retirementAge: 58,
      annualSalaryIncrementPercentage: 5,
      annualInterestRate: 8.25,
      currentEPFBalance: 0,
      wageCeilingOption: "eps_capped_15k",
    });

    expect(result.applicableFinancialYear).toBe(EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear);
    expect(result.statutoryRate).toBe(8.25);
    expect(result.tenureYears).toBe(33);
    expect(result.totalEmployeeContribution).toBeGreaterThan(0);
    expect(result.totalEmployerContribution).toBeGreaterThan(0);
    expect(result.totalEPSContribution).toBeGreaterThan(0);
    expect(result.totalInterestEarned).toBeGreaterThan(result.totalDeposited);

    // Total maturity with compounding and 5% annual hike over 33 years exceeds 1.5 Crores
    expect(result.maturityCorpus).toBeGreaterThan(15000000);
    expect(result.maturityCorpus).toBe(result.totalDeposited + result.totalInterestEarned);
    expect(result.yearlyBreakdown.length).toBe(33);
  });

  it("verifies EPS cap at ₹15,000 statutory wage ceiling (₹1,250/mo)", () => {
    // For ₹50,000 basic:
    // Employee: 12% = ₹6,000/mo (₹72,000/yr)
    // EPS: 8.33% capped at ₹1,250/mo (₹15,000/yr)
    // Employer EPF: ₹6,000 - ₹1,250 = ₹4,750/mo (₹57,000/yr)
    const result = calculateEPF({
      currentMonthlyBasicSalary: 50000,
      currentAge: 57,
      retirementAge: 58, // 1 year tenure
      annualSalaryIncrementPercentage: 0,
      annualInterestRate: 8.25,
      wageCeilingOption: "eps_capped_15k",
    });

    expect(result.totalEmployeeContribution).toBe(72000);
    expect(result.totalEPSContribution).toBe(15000);
    expect(result.totalEmployerContribution).toBe(57000);
  });

  it("accurately handles existing opening EPF balances", () => {
    const initialBalance = 500000;
    const result = calculateEPF({
      currentMonthlyBasicSalary: 40000,
      currentAge: 35,
      retirementAge: 58,
      currentEPFBalance: initialBalance,
      annualInterestRate: 8.25,
    });

    expect(result.totalDeposited).toBeGreaterThan(initialBalance);
    expect(result.maturityCorpus).toBeGreaterThan(initialBalance);
  });

  it("handles zero basic salary safely without NaN or negative values", () => {
    const result = calculateEPF({
      currentMonthlyBasicSalary: 0,
      currentAge: 25,
      retirementAge: 58,
    });

    expect(result.maturityCorpus).toBe(0);
    expect(result.totalDeposited).toBe(0);
    expect(result.totalInterestEarned).toBe(0);
    expect(Number.isNaN(result.maturityCorpus)).toBe(false);
  });
});
