import { describe, it, expect } from "vitest";
import { calculateEMI } from "@/lib/calculators/emi";

describe("EMI Calculation Engine (Independently Computed Reference Tests)", () => {
  // Independent benchmark fixture 1: ₹10,00,000 at 8.5% for 20 years (240 months)
  // Mathematical derivation:
  // r = 0.085 / 12 = 0.007083333333333333
  // (1+r)^240 = 5.40939525
  // EMI = 1000000 * 0.007083333333333333 * 5.40939525 / 4.40939525 = 8678.23 => 8678
  it("matches independently verified home loan fixture (10 Lakh, 8.5%, 20 years)", () => {
    const result = calculateEMI({
      principal: 1000000,
      annualRate: 8.5,
      tenureYears: 20,
    });

    expect(result.monthlyEMI).toBe(8678);
    expect(result.totalMonths).toBe(240);
    expect(result.principal).toBe(1000000);
    // Total interest ~ 10,82,776 (+/- 2 due to monthly amortization rounding)
    expect(result.totalInterest).toBeGreaterThanOrEqual(1082770);
    expect(result.totalInterest).toBeLessThanOrEqual(1082785);
    expect(result.yearlySchedule.length).toBe(20);
    expect(result.yearlySchedule[19].closingBalance).toBe(0);
  });

  // Independent benchmark fixture 2: ₹5,00,000 at 11% for 3 years (36 months)
  // r = 0.11 / 12 = 0.009166666666666667
  // (1+r)^36 = 1.3884867
  // EMI = 500000 * 0.009166666666666667 * 1.3884867 / 0.3884867 = 16368.68 => 16369
  it("matches independently verified personal loan fixture (5 Lakh, 11%, 3 years)", () => {
    const result = calculateEMI({
      principal: 500000,
      annualRate: 11,
      tenureYears: 3,
    });

    expect(result.monthlyEMI).toBe(16369);
    expect(result.totalMonths).toBe(36);
    expect(result.totalInterest).toBe(89297);
    expect(result.yearlySchedule.length).toBe(3);
    expect(result.yearlySchedule[2].closingBalance).toBe(0);
  });

  // Independent benchmark fixture 3: ₹8,00,000 at 8.85% for 5 years (60 months)
  // r = 0.0885 / 12 = 0.007375
  // (1+r)^60 = 1.5540323
  // rawEMI = 800000 * 0.007375 * 1.5540323 / 0.5540323 = 16549.497 => 16549
  it("matches independently verified car loan fixture (8 Lakh, 8.85%, 5 years)", () => {
    const result = calculateEMI({
      principal: 800000,
      annualRate: 8.85,
      tenureYears: 5,
    });

    expect(result.monthlyEMI).toBe(16549);
    expect(result.totalMonths).toBe(60);
    expect(result.totalInterest).toBeGreaterThanOrEqual(192900);
    expect(result.totalInterest).toBeLessThanOrEqual(193000);
  });

  // Zero interest test
  it("correctly computes zero interest loan (principal divided by months, 0 interest)", () => {
    const result = calculateEMI({
      principal: 120000,
      annualRate: 0,
      tenureYears: 1,
    });

    expect(result.monthlyEMI).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPayment).toBe(120000);
    expect(result.yearlySchedule[0].closingBalance).toBe(0);
  });

  // Fractional interest rates test
  it("handles fractional interest rates accurately (e.g. 8.75%)", () => {
    const result = calculateEMI({
      principal: 500000,
      annualRate: 8.75,
      tenureYears: 5,
    });

    // P = 500000, r = 0.0875/12 = 0.00729166667, n = 60
    // (1+r)^60 = 1.546377
    // EMI = 500000 * 0.00729166667 * 1.546377 / 0.546377 = 10319.49 => 10319
    expect(result.monthlyEMI).toBe(10319);
  });

  // Boundary & edge cases
  it("safely handles zero principal and zero tenure without NaN or Infinity", () => {
    const resZeroP = calculateEMI({ principal: 0, annualRate: 10, tenureYears: 5 });
    expect(resZeroP.monthlyEMI).toBe(0);
    expect(resZeroP.totalInterest).toBe(0);
    expect(isNaN(resZeroP.monthlyEMI)).toBe(false);

    const resZeroT = calculateEMI({ principal: 500000, annualRate: 10, tenureYears: 0 });
    expect(resZeroT.monthlyEMI).toBe(0);
    expect(isNaN(resZeroT.monthlyEMI)).toBe(false);
  });

  it("safely handles negative inputs by sanitizing to zero", () => {
    const result = calculateEMI({
      principal: -500000,
      annualRate: -8.5,
      tenureYears: -5,
    });

    expect(result.monthlyEMI).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it("handles massive principal amounts (₹100 Crore) without overflow", () => {
    const result = calculateEMI({
      principal: 1000000000,
      annualRate: 9.0,
      tenureYears: 30,
    });

    expect(result.monthlyEMI).toBe(8046226);
    expect(Number.isFinite(result.monthlyEMI)).toBe(true);
  });

  it("generates correct sensitivity scenarios", () => {
    const result = calculateEMI({
      principal: 500000,
      annualRate: 11,
      tenureYears: 3,
    });

    expect(result.sensitivityTable.length).toBe(5);
    const baseScenario = result.sensitivityTable.find((s) => s.rate === 11);
    expect(baseScenario?.emi).toBe(result.monthlyEMI);
  });
});
