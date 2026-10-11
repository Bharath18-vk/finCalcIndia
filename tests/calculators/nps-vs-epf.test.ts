import { describe, it, expect } from "vitest";
import {
  calculateNpsVsEpf,
  npsVsEpfInputSchema,
  npsVsEpfEngine,
  defaultNpsVsEpfInputs,
} from "@/lib/calculators/nps-vs-epf";
import { getCalculatorById } from "@/lib/calculators/registry";

describe("NPS vs EPF Calculator Engine (Batch 4)", () => {
  // Case 1: Golden Fixture — 30-Year Career (Age 30 to 60, ₹10,000/mo)
  it("computes accurate EPF vs NPS compounding and annuity for 30-year golden fixture", () => {
    const result = calculateNpsVsEpf({
      monthlyContribution: 10000,
      currentAge: 30,
      retirementAge: 60,
      epfInterestRate: 8.25,
      npsExpectedReturn: 10.5,
      npsAnnuityPercent: 40,
      expectedAnnuityRate: 6.0,
      taxBracketPercent: 30,
    });

    expect(result.tenureYears).toBe(30);
    expect(result.totalInvested).toBe(3600000); // ₹36 Lakhs

    // EPF corpus around ~1.54 Crore at 8.25%
    expect(result.epfTotalCorpus).toBeGreaterThan(14000000);
    expect(result.epfInterestEarned).toBe(result.epfTotalCorpus - result.totalInvested);
    expect(result.epfLumpSum).toBe(result.epfTotalCorpus);
    expect(result.epfMonthlyPension).toBe(0);
    expect(result.epfTaxExemptPercent).toBe(100);

    // NPS corpus around ~2.5 Crore at 10.5% (substantial equity outperformance)
    expect(result.npsTotalCorpus).toBeGreaterThan(result.epfTotalCorpus);
    expect(result.corpusDifference).toBeGreaterThan(0);
    expect(result.corpusOutperformancePercent).toBeGreaterThan(40);

    // 40% annuity and 60% lump sum split
    expect(result.npsAnnuityCorpus).toBe(Math.round(result.npsTotalCorpus * 0.4));
    expect(result.npsLumpSum).toBe(result.npsTotalCorpus - result.npsAnnuityCorpus);
    expect(result.npsTaxFreeLumpSumPercent).toBe(60);

    // Monthly pension from annuity
    const expectedMonthlyPension = Math.round((result.npsAnnuityCorpus * 0.06) / 12);
    expect(result.npsMonthlyPension).toBe(expectedMonthlyPension);

    // Additional 80CCD(1B) tax savings: ₹50,000 * 30% * 1.04 * 30 years = ₹4,68,000
    expect(result.additionalTaxSavings80CCD).toBe(468000);

    // Schedule verification
    expect(result.schedule.length).toBe(30);
    expect(result.schedule[0].year).toBe(1);
    expect(result.schedule[0].age).toBe(31);
    expect(result.schedule[29].year).toBe(30);
    expect(result.schedule[29].age).toBe(60);
  });

  // Case 2: Short Tenure Career (5 Years, Age 55 to 60, ₹25,000/mo)
  it("handles short-term 5-year comparison correctly", () => {
    const result = calculateNpsVsEpf({
      monthlyContribution: 25000,
      currentAge: 55,
      retirementAge: 60,
      epfInterestRate: 8.25,
      npsExpectedReturn: 10.0,
      npsAnnuityPercent: 40,
      expectedAnnuityRate: 6.0,
      taxBracketPercent: 20,
    });

    expect(result.tenureYears).toBe(5);
    expect(result.totalInvested).toBe(1500000); // 25k * 12 * 5 = ₹15 Lakhs
    expect(result.epfTotalCorpus).toBeGreaterThan(1500000);
    expect(result.npsTotalCorpus).toBeGreaterThan(result.epfTotalCorpus);
    expect(result.schedule.length).toBe(5);

    // 80CCD(1B) savings: 50,000 * 0.20 * 1.04 * 5 = 52,000
    expect(result.additionalTaxSavings80CCD).toBe(52000);
  });

  // Case 3: 100% Annuity Allocation Boundary
  it("calculates 100% full annuity allocation with zero lump sum", () => {
    const result = calculateNpsVsEpf({
      monthlyContribution: 10000,
      currentAge: 35,
      retirementAge: 60,
      epfInterestRate: 8.25,
      npsExpectedReturn: 10.0,
      npsAnnuityPercent: 100, // 100% to annuity
      expectedAnnuityRate: 6.0,
      taxBracketPercent: 30,
    });

    expect(result.npsLumpSum).toBe(0);
    expect(result.npsAnnuityCorpus).toBe(result.npsTotalCorpus);
    expect(result.npsTaxFreeLumpSumPercent).toBe(0);
    expect(result.npsMonthlyPension).toBe(Math.round((result.npsTotalCorpus * 0.06) / 12));
  });

  // Case 4: Zero Tax Bracket Case (0% Tax)
  it("evaluates 0% tax bracket with zero Section 80CCD tax savings", () => {
    const result = calculateNpsVsEpf({
      monthlyContribution: 5000,
      currentAge: 25,
      retirementAge: 55,
      epfInterestRate: 8.25,
      npsExpectedReturn: 11.0,
      npsAnnuityPercent: 40,
      expectedAnnuityRate: 6.0,
      taxBracketPercent: 0,
    });

    expect(result.additionalTaxSavings80CCD).toBe(0);
  });

  // Case 5: Schema Validation & Boundary Rules
  it("validates boundary inputs and enforces retirementAge > currentAge", () => {
    // Valid standard input
    const valid = npsVsEpfInputSchema.safeParse(defaultNpsVsEpfInputs);
    expect(valid.success).toBe(true);

    // Retirement age less than or equal to current age
    const invalidAges = npsVsEpfInputSchema.safeParse({
      ...defaultNpsVsEpfInputs,
      currentAge: 50,
      retirementAge: 45,
    });
    expect(invalidAges.success).toBe(false);

    // Annuity less than PFRDA statutory minimum 40%
    const invalidAnnuity = npsVsEpfInputSchema.safeParse({
      ...defaultNpsVsEpfInputs,
      npsAnnuityPercent: 30, // below 40
    });
    expect(invalidAnnuity.success).toBe(false);

    // Monthly contribution below ₹500
    const invalidAmount = npsVsEpfInputSchema.safeParse({
      ...defaultNpsVsEpfInputs,
      monthlyContribution: 100,
    });
    expect(invalidAmount.success).toBe(false);
  });

  // Case 6: Non-finite fallback safety
  it("safely handles non-finite fallback inputs without throwing NaN", () => {
    const result = calculateNpsVsEpf({
      monthlyContribution: NaN,
      currentAge: -20,
      retirementAge: Infinity,
      epfInterestRate: 0,
      npsExpectedReturn: 0,
      npsAnnuityPercent: 200,
      expectedAnnuityRate: NaN,
      taxBracketPercent: -10,
    });

    expect(Number.isFinite(result.epfTotalCorpus)).toBe(true);
    expect(Number.isFinite(result.npsTotalCorpus)).toBe(true);
    expect(Number.isFinite(result.npsMonthlyPension)).toBe(true);
  });

  // Case 7: Registry & Engine Contract Compliance
  it("is registered in central calculator registry under ID 'nps-vs-epf'", () => {
    const registered = getCalculatorById("nps-vs-epf");
    expect(registered).toBeDefined();
    expect(registered?.id).toBe("nps-vs-epf");
    expect(registered?.metadata.name).toBe("NPS vs EPF Calculator");
    expect(registered?.metadata.category).toBe("finance");
    expect(registered?.metadata.route).toBe("/nps-vs-epf-calculator");
  });
});
