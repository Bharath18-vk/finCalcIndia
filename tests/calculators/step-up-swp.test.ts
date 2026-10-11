import { describe, it, expect } from "vitest";
import {
  calculateStepUpSwp,
  stepUpSwpSchema,
  stepUpSwpEngine,
  defaultStepUpSwpInputs,
} from "@/lib/calculators/step-up-swp";

describe("Step-Up SWP Calculator Engine", () => {
  it("registers in the central calculator registry", () => {
    expect(stepUpSwpEngine.id).toBe("step-up-swp-calculator");
    expect(stepUpSwpEngine.metadata.route).toBe("/step-up-swp-calculator");
    expect(stepUpSwpEngine.metadata.category).toBe("finance");
  });

  it("calculates realistic 25-year Step-Up SWP scenario without premature depletion", () => {
    // ₹1 Crore starting corpus, ₹45,000/mo, 6% step up, 8.5% return, 25 years
    const res = calculateStepUpSwp(defaultStepUpSwpInputs);

    expect(res.isDepletedBeforeTenure).toBe(false);
    expect(res.exhaustionYear).toBeNull();
    expect(res.totalAmountWithdrawn).toBeGreaterThan(10000000);
    expect(res.finalPortfolioBalance).toBeGreaterThan(0);
    expect(res.annualSchedule.length).toBe(25);
    expect(res.maxSustainableInitialMonthlyWithdrawal).toBeGreaterThan(40000);
  });

  it("detects premature corpus exhaustion when withdrawal rate is excessive", () => {
    // ₹50 Lakhs corpus, but withdrawing ₹80,000/month stepping up at 8%
    const res = calculateStepUpSwp({
      initialCorpus: 5000000,
      initialMonthlyWithdrawal: 80000,
      annualStepUpPercent: 8.0,
      expectedAnnualReturnPercent: 8.0,
      tenureYears: 30,
    });

    expect(res.isDepletedBeforeTenure).toBe(true);
    expect(res.exhaustionYear).toBeDefined();
    expect(res.exhaustionYear).toBeLessThan(30);
    expect(res.verdictNote).toContain("Corpus depletion alert");
  });

  it("computes flat SWP when step-up is 0%", () => {
    const res = calculateStepUpSwp({
      initialCorpus: 10000000,
      initialMonthlyWithdrawal: 50000,
      annualStepUpPercent: 0,
      expectedAnnualReturnPercent: 8.0,
      tenureYears: 10,
    });

    expect(res.annualSchedule[0].monthlyPayoutInYear).toBe(50000);
    expect(res.annualSchedule[9].monthlyPayoutInYear).toBe(50000);
    expect(res.totalAmountWithdrawn).toBe(50000 * 12 * 10);
  });

  it("validates inputs with Zod schema", () => {
    const valid = stepUpSwpSchema.safeParse(defaultStepUpSwpInputs);
    expect(valid.success).toBe(true);

    const invalid = stepUpSwpSchema.safeParse({
      ...defaultStepUpSwpInputs,
      initialCorpus: -100,
    });
    expect(invalid.success).toBe(false);
  });
});
