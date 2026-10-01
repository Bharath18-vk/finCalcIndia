import { describe, it, expect } from "vitest";
import { calculateNPS, NPS_MODEL_CONFIGS } from "@/lib/calculators/nps";

describe("National Pension System (NPS) Calculator - PFRDA Statutory Rules & Models", () => {
  describe("All Citizen Model (Individual / Citizen of India)", () => {
    it("computes normal exit (age 60) with 40% annuity and 60% lump sum accurately over 30 years", () => {
      const result = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 60,
        npsModel: "all_citizen",
        exitType: "normal",
        expectedAnnualReturn: 10,
        annuityPercentage: 40,
        expectedAnnuityRate: 6,
      });

      expect(result.npsModel).toBe("all_citizen");
      expect(result.modelConfig.id).toBe("all_citizen");
      expect(result.exitType).toBe("normal");
      expect(result.investmentYears).toBe(30);
      expect(result.totalInvested).toBe(3600000); // 36 Lakhs
      expect(result.totalCorpusAtRetirement).toBeGreaterThan(22000000);

      // 40% mandatory annuity split
      expect(result.annuityPercentage).toBe(40);
      expect(result.lumpSumPercentage).toBe(60);
      expect(result.annuityAmount + result.lumpSumAmount).toBe(result.totalCorpusAtRetirement);

      // Pension check
      const expectedMonthly = Math.round((result.annuityAmount * 0.06) / 12);
      expect(result.expectedMonthlyPension).toBe(expectedMonthly);

      // Taxation verification
      expect(result.taxationSummary.lumpSumTaxStatus).toContain("10(12A)");
      expect(result.taxationSummary.annuityPurchaseTaxStatus).toContain("80CCD(5)");
      expect(result.taxationSummary.annuityIncomeTaxStatus).toContain("taxable");
      expect(result.taxationSummary.modelTaxNotes).toContain("80CCD(1)");
      expect(result.taxationSummary.modelTaxNotes).toContain("80CCD(1B)");
    });

    it("enforces premature exit rules: minimum 80% mandatory annuity and maximum 20% lump sum", () => {
      const result = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 45, // Premature exit before age 60
        npsModel: "all_citizen",
        exitType: "premature",
        expectedAnnualReturn: 10,
        annuityPercentage: 40, // Should be overridden to statutory minimum 80%
      });

      expect(result.exitType).toBe("premature");
      expect(result.minMandatoryAnnuityPercentage).toBe(80);
      expect(result.maxLumpSumPercentage).toBe(20);
      expect(result.annuityPercentage).toBe(80);
      expect(result.lumpSumPercentage).toBe(20);
      expect(result.annuityAmount).toBe(Math.round(result.totalCorpusAtRetirement * 0.8));
    });

    it("allows 100% lump sum option when corpus is below PFRDA small corpus threshold (<= ₹5 Lakhs for normal exit)", () => {
      const result = calculateNPS({
        monthlyContribution: 500,
        currentAge: 55,
        retirementAge: 60,
        npsModel: "all_citizen",
        exitType: "normal",
        expectedAnnualReturn: 10,
      });

      // Total invested = 500 * 60 = 30,000, total corpus << 5 Lakhs
      expect(result.totalCorpusAtRetirement).toBeLessThan(500000);
      expect(result.isSmallCorpusExemptFromAnnuity).toBe(true);
      expect(result.minMandatoryAnnuityPercentage).toBe(0);
      expect(result.maxLumpSumPercentage).toBe(100);
    });

    it("allows 100% lump sum option when premature exit corpus is <= ₹2.5 Lakhs", () => {
      const result = calculateNPS({
        monthlyContribution: 1000,
        currentAge: 30,
        retirementAge: 35, // 5 years tenure
        npsModel: "all_citizen",
        exitType: "premature",
        expectedAnnualReturn: 10,
      });

      expect(result.totalCorpusAtRetirement).toBeLessThanOrEqual(250000);
      expect(result.isSmallCorpusExemptFromAnnuity).toBe(true);
      expect(result.minMandatoryAnnuityPercentage).toBe(0);
      expect(result.maxLumpSumPercentage).toBe(100);
    });
  });

  describe("Corporate Sector Model (Employer-Employee Group)", () => {
    it("distinguishes Corporate Model rules with default superannuation age 58 and Section 80CCD(2) tax notes", () => {
      const result = calculateNPS({
        monthlyContribution: 15000,
        currentAge: 28,
        retirementAge: 58, // Standard corporate retirement age
        npsModel: "corporate",
        exitType: "normal",
        expectedAnnualReturn: 10,
      });

      expect(result.npsModel).toBe("corporate");
      expect(result.modelConfig.defaultSuperannuationAge).toBe(58);
      expect(result.taxationSummary.modelTaxNotes).toContain("80CCD(2)");
      expect(result.minMandatoryAnnuityPercentage).toBe(40);
      expect(result.maxLumpSumPercentage).toBe(60);
    });

    it("enforces premature exit under Corporate Model (resignation before superannuation)", () => {
      const result = calculateNPS({
        monthlyContribution: 12000,
        currentAge: 30,
        retirementAge: 50,
        npsModel: "corporate",
        exitType: "premature",
      });

      expect(result.exitType).toBe("premature");
      expect(result.minMandatoryAnnuityPercentage).toBe(80);
      expect(result.maxLumpSumPercentage).toBe(20);
    });
  });

  describe("Death Exit Scenario (Nominee Payout)", () => {
    it("pays 100% of accumulated corpus to nominee as tax-free lump sum with 0% mandatory annuity", () => {
      const result = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 40, // 10 years accumulated before death
        npsModel: "all_citizen",
        exitType: "death",
        expectedAnnualReturn: 10,
      });

      expect(result.exitType).toBe("death");
      expect(result.minMandatoryAnnuityPercentage).toBe(0);
      expect(result.maxLumpSumPercentage).toBe(100);
      expect(result.annuityPercentage).toBe(0);
      expect(result.annuityAmount).toBe(0);
      expect(result.lumpSumAmount).toBe(result.totalCorpusAtRetirement);
      expect(result.expectedMonthlyPension).toBe(0);
      expect(result.taxationSummary.lumpSumTaxStatus).toContain("nominee");
      expect(result.taxationSummary.lumpSumTaxStatus).toContain("10(12A)");
    });
  });

  describe("Regulatory Compliance & Rate Disclosures", () => {
    it("explicitly confirms that the 10% rate is an illustrative annual return assumption", () => {
      const result = calculateNPS({
        monthlyContribution: 5000,
        currentAge: 30,
      });

      expect(result.rateMetadata.returnRateClassification).toBe("illustrative-assumption");
      expect(result.rateMetadata.notes.toLowerCase()).toContain("illustrative");
      expect(result.rateMetadata.notes.toLowerCase()).toContain("not guaranteed");
    });

    it("verifies both models are present in NPS_MODEL_CONFIGS with distinct parameters", () => {
      expect(NPS_MODEL_CONFIGS.all_citizen).toBeDefined();
      expect(NPS_MODEL_CONFIGS.corporate).toBeDefined();
      expect(NPS_MODEL_CONFIGS.all_citizen.defaultSuperannuationAge).toBe(60);
      expect(NPS_MODEL_CONFIGS.corporate.defaultSuperannuationAge).toBe(58);
      expect(NPS_MODEL_CONFIGS.all_citizen.applicableTaxSections).not.toEqual(
        NPS_MODEL_CONFIGS.corporate.applicableTaxSections
      );
    });
  });
});
