import { describe, it, expect } from "vitest";
import {
  calculateFire,
  fireInputSchema,
  fireEngine,
  defaultFireInputs,
} from "@/lib/calculators/fire";

describe("FIRE Calculator Engine (Financial Independence Retire Early)", () => {
  it("registers in the central calculator registry", () => {
    expect(fireEngine.id).toBe("fire-calculator");
    expect(fireEngine.metadata.route).toBe("/fire-calculator");
    expect(fireEngine.metadata.category).toBe("finance");
  });

  it("calculates default FIRE targets, duration, and milestones accurately", () => {
    const res = calculateFire(defaultFireInputs);

    expect(res.yearsToTargetRetirement).toBe(17); // 45 - 28
    expect(res.retirementDurationYears).toBe(40); // 85 - 45
    expect(res.futureMonthlyExpensesAtRetirement).toBeGreaterThan(defaultFireInputs.monthlyExpenses);
    expect(res.targetFireCorpus).toBeGreaterThan(0);
    expect(res.tiers.leanFireCorpus).toBeLessThan(res.targetFireCorpus);
    expect(res.tiers.fatFireCorpus).toBeGreaterThan(res.targetFireCorpus);
    expect(res.tiers.coastFireToday).toBeLessThan(res.targetFireCorpus);
    expect(res.schedule.length).toBeGreaterThan(15);
  });

  it("identifies achievable FIRE with surplus when investments are high", () => {
    const res = calculateFire({
      currentAge: 30,
      targetRetirementAge: 45,
      lifeExpectancyAge: 85,
      monthlyExpenses: 50000,
      currentNetWorth: 5000000, // ₹50 Lakhs
      monthlyInvestment: 100000, // ₹1 Lakh / month
      annualInvestmentStepUpPercent: 10,
      expectedPreRetirementReturn: 12.0,
      expectedPostRetirementReturn: 8.5,
      inflationRate: 6.0,
      swrPercent: 3.5,
    });

    expect(res.isFireAchievableByTargetAge).toBe(true);
    expect(res.fireSurplusOrDeficit).toBeGreaterThan(0);
    expect(res.projectedFireAge).toBeLessThanOrEqual(45);
    expect(res.portfolioLongevityYears).toBeGreaterThan(30);
  });

  it("flags deficit when current savings are insufficient", () => {
    const res = calculateFire({
      currentAge: 30,
      targetRetirementAge: 40, // 10 years only
      lifeExpectancyAge: 85,
      monthlyExpenses: 100000,
      currentNetWorth: 500000,
      monthlyInvestment: 10000, // Only ₹10k
      annualInvestmentStepUpPercent: 0,
      expectedPreRetirementReturn: 10.0,
      expectedPostRetirementReturn: 7.0,
      inflationRate: 6.0,
      swrPercent: 3.5,
    });

    expect(res.isFireAchievableByTargetAge).toBe(false);
    expect(res.fireSurplusOrDeficit).toBeLessThan(0);
    expect(res.recommendationText).toContain("projected deficit");
  });

  it("validates age ordering constraints with Zod", () => {
    const valid = fireInputSchema.safeParse(defaultFireInputs);
    expect(valid.success).toBe(true);

    // Target age <= current age should fail
    const invalidAge = fireInputSchema.safeParse({
      ...defaultFireInputs,
      currentAge: 45,
      targetRetirementAge: 40,
    });
    expect(invalidAge.success).toBe(false);

    // Life expectancy <= target age should fail
    const invalidLife = fireInputSchema.safeParse({
      ...defaultFireInputs,
      targetRetirementAge: 70,
      lifeExpectancyAge: 65,
    });
    expect(invalidLife.success).toBe(false);
  });
});
