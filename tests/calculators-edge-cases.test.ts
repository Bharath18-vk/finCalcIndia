import { describe, it, expect } from "vitest";
import { calculateEMI } from "@/lib/calculators/emi";
import { calculateSIP } from "@/lib/calculators/sip";
import { calculateStepUpSIP } from "@/lib/calculators/step-up-sip";
import { calculateFD } from "@/lib/calculators/fd";
import { calculateFire } from "@/lib/calculators/fire";
import { calculateIncomeTax } from "@/lib/calculators/income-tax";
import { calculatePercentage } from "@/lib/calculators/percentage";
import { calculateDiscount } from "@/lib/calculators/discount";

describe("Edge Cases and Extreme Inputs Suite", () => {
  describe("EMI Calculator Edge Cases", () => {
    it("handles 0% interest rate without dividing by zero", () => {
      const result = calculateEMI({
        principal: 1200000,
        annualRate: 0,
        tenureYears: 10,
      });

      expect(result.monthlyEMI).toBe(10000);
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayment).toBe(1200000);
      expect(isFinite(result.monthlyEMI)).toBe(true);
      expect(!isNaN(result.monthlyEMI)).toBe(true);
    });

    it("handles extreme principal values (e.g., ₹100 Crore) gracefully", () => {
      const result = calculateEMI({
        principal: 1000000000,
        annualRate: 9,
        tenureYears: 30,
      });

      expect(result.monthlyEMI).toBeGreaterThan(0);
      expect(isFinite(result.monthlyEMI)).toBe(true);
      expect(!isNaN(result.monthlyEMI)).toBe(true);
    });
  });

  describe("SIP Calculator Edge Cases", () => {
    it("handles 0% annual return rate without crashing", () => {
      const result = calculateSIP({
        monthlyInvestment: 5000,
        annualReturnRate: 0,
        tenureYears: 5,
      });

      // 5000 * 60 = 300,000
      expect(result.totalInvested).toBe(300000);
      expect(result.futureValue).toBe(300000);
      expect(result.wealthGained).toBe(0);
      expect(isFinite(result.futureValue)).toBe(true);
    });

    it("handles high returns (30%) over 40 years without overflow", () => {
      const result = calculateSIP({
        monthlyInvestment: 10000,
        annualReturnRate: 30,
        tenureYears: 40,
      });

      expect(result.futureValue).toBeGreaterThan(result.totalInvested);
      expect(isFinite(result.futureValue)).toBe(true);
    });
  });

  describe("Step-Up SIP Edge Cases", () => {
    it("handles 0% step-up as an equivalent to standard flat SIP", () => {
      const stepUp = calculateStepUpSIP({
        monthlyInvestment: 10000,
        annualReturnRate: 12,
        tenureYears: 10,
        annualStepUpPercentage: 0,
      });

      const regular = calculateSIP({
        monthlyInvestment: 10000,
        annualReturnRate: 12,
        tenureYears: 10,
      });

      expect(stepUp.totalInvested).toBe(regular.totalInvested);
      expect(Math.round(stepUp.futureValue)).toBe(Math.round(regular.futureValue));
      expect(stepUp.differenceFutureValue).toBe(0);
    });
  });

  describe("FIRE Calculator Edge Cases", () => {
    it("handles current age matching retirement age (already retired)", () => {
      const result = calculateFire({
        currentAge: 50,
        targetRetirementAge: 50,
        monthlyExpenses: 50000,
        currentNetWorth: 20000000,
        monthlyInvestment: 0,
        expectedPreRetirementReturn: 10,
        expectedPostRetirementReturn: 7,
        inflationRate: 6,
        lifeExpectancyAge: 85,
        swrPercent: 3.5,
      });

      // Defensive fallback ensures retirement age is at least current age + 1
      expect(result.yearsToTargetRetirement).toBe(1);
      expect(result.isFireAchievableByTargetAge).toBe(true);
      expect(isFinite(result.targetFireCorpus)).toBe(true);
    });

    it("handles current savings already exceeding FIRE corpus requirement", () => {
      const result = calculateFire({
        currentAge: 35,
        targetRetirementAge: 45,
        monthlyExpenses: 40000,
        currentNetWorth: 100000000, // 10 Crore
        monthlyInvestment: 50000,
        expectedPreRetirementReturn: 11,
        expectedPostRetirementReturn: 8,
        inflationRate: 6,
        lifeExpectancyAge: 85,
        swrPercent: 4,
      });

      expect(result.isFireAchievableByTargetAge).toBe(true);
      expect(result.fireSurplusOrDeficit).toBeGreaterThan(0);
      expect(result.projectedNetWorthAtRetirement).toBeGreaterThan(result.targetFireCorpus);
    });
  });

  describe("Fixed Deposit Edge Cases", () => {
    it("handles short tenures and simple vs compound frequencies correctly", () => {
      const simpleFd = calculateFD({
        principal: 100000,
        annualRate: 7,
        tenureYears: 1,
        compoundingFrequency: "simple",
      });

      expect(simpleFd.totalInterest).toBe(7000);
      expect(simpleFd.maturityAmount).toBe(107000);

      const quarterlyFd = calculateFD({
        principal: 100000,
        annualRate: 7,
        tenureYears: 1,
        compoundingFrequency: "quarterly",
      });

      // Quarterly compounding earns slightly more than simple interest
      expect(quarterlyFd.totalInterest).toBeGreaterThan(7000);
      expect(quarterlyFd.effectiveAnnualYield).toBeGreaterThan(7);
    });
  });

  describe("Percentage & Math Calculator Edge Cases", () => {
    it("handles 0 divisor in percentage calculations safely with isDivisionByZero flag", () => {
      const res = calculatePercentage({
        mode: "x-is-what-percent-of-y",
        valX: 50,
        valY: 0,
      });

      expect(res.isDivisionByZero).toBe(true);
      expect(res.explanation).toContain("Division by zero");
      expect(res.resultValue).toBe(0);
    });

    it("handles percentage increase with 0 base value safely with isDivisionByZero flag", () => {
      const res = calculatePercentage({
        mode: "percentage-increase",
        valX: 0,
        valY: 100,
      });

      expect(res.isDivisionByZero).toBe(true);
      expect(res.explanation).toContain("cannot be zero");
      expect(res.resultValue).toBe(0);
    });

    it("handles 100% discount properly (free item)", () => {
      const res = calculateDiscount({
        originalPrice: 2500,
        discountPercent: 100,
      });

      expect(res.finalPrice).toBe(0);
      expect(res.totalSavings).toBe(2500);
      expect(res.discountAmount).toBe(2500);
    });
  });

  describe("Tax Calculator Edge Cases", () => {
    it("handles 0 gross income without errors", () => {
      const res = calculateIncomeTax({
        grossAnnualIncome: 0,
        isSalaried: true,
      });

      expect(res.newRegime.taxableIncome).toBe(0);
      expect(res.newRegime.totalTax).toBe(0);
      expect(res.oldRegime.taxableIncome).toBe(0);
      expect(res.oldRegime.totalTax).toBe(0);
    });
  });
});
