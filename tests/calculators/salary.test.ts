import { describe, it, expect } from "vitest";
import { calculateSalary } from "@/lib/calculators/salary";

describe("Salary In-Hand (CTC to Take-Home) Calculator", () => {
  it("computes monthly take-home salary and distinguishes CTC, Gross, Deductions, and In-hand for Maharashtra", () => {
    const result = calculateSalary({
      annualCTC: 1200000,
      basicPercentage: 40,
      includeEmployerPFInCTC: true,
      statePT: "maharashtra",
      taxRegime: "new",
      assessmentYear: "2026-27",
    });

    expect(result.annualCTC).toBe(1200000);
    expect(result.monthlyCTC).toBe(100000);

    // Basic 40% = ₹4,80,000 (₹40,000/mo)
    // Employer PF = 12% of 40k = ₹4,800/mo (₹57,600/yr)
    // Gross = 12,00,000 - 57,600 = 11,42,400
    expect(result.grossAnnualSalary).toBe(1142400);
    expect(result.grossMonthlySalary).toBe(95200);

    // Deductions
    expect(result.employeePFMonthly).toBe(4800);
    expect(result.professionalTaxAnnual).toBe(2500); // Maharashtra PT
    expect(result.professionalTaxMonthly).toBe(200);

    // Tax under AY 2026-27: Gross 11,42,400 - 75k std = 10,67,400 taxable.
    // Under AY 2026-27, taxable income <= 12L has full 87A rebate -> Zero Tax!
    expect(result.taxAnnual).toBe(0);
    expect(result.taxMonthly).toBe(0);

    // In-Hand = Gross (11,42,400) - Employee PF (57,600) - PT (2,500) = 10,82,300
    expect(result.netTakeHomeAnnual).toBe(1082300);
    expect(result.netTakeHomeMonthly).toBe(Math.round(1082300 / 12));
    expect(result.takeHomePercentage).toBeGreaterThan(85);
  });

  it("accurately applies zero professional tax for states without PT (Delhi, Haryana, UP)", () => {
    const result = calculateSalary({
      annualCTC: 1000000,
      statePT: "nil_pt_state",
      taxRegime: "new",
    });

    expect(result.professionalTaxAnnual).toBe(0);
    expect(result.professionalTaxMonthly).toBe(0);
  });

  it("respects the statutory ₹15,000 wage ceiling for EPF when enabled", () => {
    // Basic is 50,000/mo, but with cap enabled, EPF basis is 15,000 -> EPF is 1,800/mo
    const result = calculateSalary({
      annualCTC: 1500000,
      basicPercentage: 40,
      epfCapWageCeiling: true,
    });

    expect(result.employeePFMonthly).toBe(1800);
    expect(result.employerPFMonthly).toBe(1800);
  });

  it("handles zero CTC input safely with zeroed figures and no NaN", () => {
    const result = calculateSalary({
      annualCTC: 0,
    });

    expect(result.annualCTC).toBe(0);
    expect(result.netTakeHomeMonthly).toBe(0);
    expect(result.netTakeHomeAnnual).toBe(0);
    expect(Number.isNaN(result.takeHomePercentage)).toBe(false);
  });
});
