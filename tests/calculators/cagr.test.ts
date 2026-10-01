import { describe, it, expect } from "vitest";
import { calculateCAGR } from "@/lib/calculators/cagr";

describe("Compound Annual Growth Rate (CAGR) Calculation Engine", () => {
  it("calculates CAGR accurately for doubling money in 5 years", () => {
    // ₹1 Lakh to ₹2 Lakh in 5 years => 2^(1/5) - 1 ≈ 14.87%
    const result = calculateCAGR({
      initialValue: 100000,
      finalValue: 200000,
      tenureYears: 5,
    });

    expect(result.cagrPercentage).toBe(14.87);
    expect(result.absoluteReturnPercentage).toBe(100.0);
    expect(result.totalGain).toBe(100000);
    expect(result.multiple).toBe(2);
    expect(result.isGain).toBe(true);
    expect(result.yearlyTrajectory.length).toBe(5);
    expect(result.yearlyTrajectory[4].projectedValue).toBe(200000);
  });

  it("calculates CAGR accurately for 10-year growth", () => {
    // ₹50,000 to ₹1,50,000 in 10 years => 3^(1/10) - 1 ≈ 11.61%
    const result = calculateCAGR({
      initialValue: 50000,
      finalValue: 150000,
      tenureYears: 10,
    });

    expect(result.cagrPercentage).toBe(11.61);
    expect(result.multiple).toBe(3);
    expect(result.totalGain).toBe(100000);
  });

  it("handles negative returns (loss) correctly", () => {
    // ₹1 Lakh dropping to ₹80,000 in 2 years => (0.8)^0.5 - 1 ≈ -10.56%
    const result = calculateCAGR({
      initialValue: 100000,
      finalValue: 80000,
      tenureYears: 2,
    });

    expect(result.cagrPercentage).toBe(-10.56);
    expect(result.absoluteReturnPercentage).toBe(-20.0);
    expect(result.totalGain).toBe(-20000);
    expect(result.isGain).toBe(false);
  });

  it("handles boundary values safely without NaN", () => {
    const zeroInitial = calculateCAGR({
      initialValue: 0,
      finalValue: 100000,
      tenureYears: 5,
    });
    expect(zeroInitial.cagrPercentage).toBe(0);
    expect(Number.isNaN(zeroInitial.cagrPercentage)).toBe(false);

    const zeroFinal = calculateCAGR({
      initialValue: 100000,
      finalValue: 0,
      tenureYears: 3,
    });
    expect(zeroFinal.cagrPercentage).toBe(-100);
  });
});
