import { describe, it, expect } from "vitest";
import { SITE_ROUTES, getRouteByPath } from "@/data/site-map";
import { KEYWORD_MAP } from "@/data/keyword-map";
import { BENCHMARK_RATES } from "@/data/rates/benchmarks";
import { calculateIncomeTax } from "@/lib/calculators/income-tax";
import { TAX_RULES_AY_2026_27, TAX_RULES_AY_2025_26 } from "@/data/rates/taxRules";
import { calculateSalary, STATE_PT_CONFIGS } from "@/lib/calculators/salary";
import { calculateHRA } from "@/lib/calculators/hra";
import { calculateGratuity, STATUTORY_GRATUITY_EXEMPTION_LIMIT } from "@/lib/calculators/gratuity";
import { calculateNPS } from "@/lib/calculators/nps";
import { calculateEPF, EPF_CURRENT_STATUTORY_METADATA } from "@/lib/calculators/epf";

describe("Phase 3 Comprehensive Statutory & Regulatory Audit", () => {
  const phase3Routes = [
    "/income-tax-calculator",
    "/salary-calculator",
    "/hra-calculator",
    "/gratuity-calculator",
    "/nps-calculator",
    "/epf-calculator",
  ];

  describe("Site Map and Routes Registry", () => {
    it("should have all 6 Phase 3 routes live in site-map.ts", () => {
      for (const routePath of phase3Routes) {
        const route = getRouteByPath(routePath);
        expect(route).toBeDefined();
        expect(route?.status).toBe("live");
        expect(route?.priority).toBeGreaterThanOrEqual(0.9);
        expect(route?.category).toBe("core-calculator");
      }
    });

    it("should ensure no duplicate routes in SITE_ROUTES", () => {
      const paths = SITE_ROUTES.map((r) => r.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });
  });

  describe("Keyword Map and SEO Taxonomy", () => {
    it("should have all Phase 3 keywords registered with strict quality-approved status and unvalidated search demand", () => {
      for (const routePath of phase3Routes) {
        const entry = Object.values(KEYWORD_MAP).find((k) => k.targetUrl === routePath);
        expect(entry, `Entry for ${routePath} should exist in KEYWORD_MAP`).toBeDefined();
        expect(entry?.status).toBe("quality-approved");
        expect(entry?.searchDemandStatus).toBe("unvalidated");
        expect(entry?.qualityReviewStatus).toBe("quality-approved");
        expect(entry?.keyword.length).toBeGreaterThan(0);
      }
    });

    it("should ensure no duplicate primary keywords exist in KEYWORD_MAP", () => {
      const keywords = Object.values(KEYWORD_MAP).map((k) => k.keyword.toLowerCase().trim());
      const uniqueKeywords = new Set(keywords);
      expect(uniqueKeywords.size).toBe(keywords.length);
    });
  });

  describe("Regulatory Benchmarks & Source Architecture", () => {
    it("should have official 8.25% EPFO rate with explicit FY 2023-24 & FY 2024-25 validity and non-permanent disclosure", () => {
      expect(BENCHMARK_RATES.epf).toBeDefined();
      expect(BENCHMARK_RATES.epf.defaultRate).toBe(8.25);
      expect(BENCHMARK_RATES.epf.rateClassification).toBe("externally-sourced");
      expect(BENCHMARK_RATES.epf.financialYear).toBe("FY 2023-24 & FY 2024-25");
      expect(BENCHMARK_RATES.epf.effectiveTo).toBe("2025-03-31");
      expect(BENCHMARK_RATES.epf.sourceName).toContain("EPFO");
      expect(BENCHMARK_RATES.epf.notes.toLowerCase()).toContain("not permanent");

      expect(EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear).toBe("FY 2023-24 & FY 2024-25");
      expect(EPF_CURRENT_STATUTORY_METADATA.statutoryRate).toBe(8.25);
    });

    it("should have illustrative 10.00% NPS multi-asset return strictly labeled illustrative-assumption", () => {
      expect(BENCHMARK_RATES.nps).toBeDefined();
      expect(BENCHMARK_RATES.nps.defaultRate).toBe(10.0);
      expect(BENCHMARK_RATES.nps.rateClassification).toBe("illustrative-assumption");
      expect(BENCHMARK_RATES.nps.notes.toLowerCase()).toContain("illustrative");
      expect(BENCHMARK_RATES.nps.notes.toLowerCase()).toContain("non-guaranteed");
    });
  });

  describe("Income Tax Engine (AY 2026-27 vs AY 2025-26 Versioning)", () => {
    it("should verify versioned tax rules exist with correct slabs and Section 87A rebate", () => {
      expect(TAX_RULES_AY_2026_27.assessmentYear).toBe("2026-27");
      expect(TAX_RULES_AY_2026_27.newRegime.rebate87A.thresholdIncome).toBe(1200000);
      expect(TAX_RULES_AY_2026_27.newRegime.rebate87A.maxRebate).toBe(60000);
      expect(TAX_RULES_AY_2026_27.newRegime.standardDeductionSalaried).toBe(75000);

      // Verify AY 2026-27 new regime slab rates
      expect(TAX_RULES_AY_2026_27.newRegime.slabs.map((s) => ({ min: s.min, max: s.max, rate: s.rate }))).toEqual([
        { min: 0, max: 400000, rate: 0 },
        { min: 400000, max: 800000, rate: 0.05 },
        { min: 800000, max: 1200000, rate: 0.1 },
        { min: 1200000, max: 1600000, rate: 0.15 },
        { min: 1600000, max: 2000000, rate: 0.2 },
        { min: 2000000, max: 2400000, rate: 0.25 },
        { min: 2400000, max: Infinity, rate: 0.3 },
      ]);

      // Verify AY 2025-26 rules are preserved for comparison
      expect(TAX_RULES_AY_2025_26.assessmentYear).toBe("2025-26");
      expect(TAX_RULES_AY_2025_26.newRegime.rebate87A.thresholdIncome).toBe(700000);
      expect(TAX_RULES_AY_2025_26.newRegime.rebate87A.maxRebate).toBe(25000);
    });

    it("AY 2026-27: should give zero tax under New Regime for gross salary up to ₹12,75,000", () => {
      const res = calculateIncomeTax({
        grossAnnualIncome: 1275000,
        isSalaried: true,
        assessmentYear: "2026-27",
      });

      expect(res.newRegime.standardDeduction).toBe(75000);
      expect(res.newRegime.taxableIncome).toBe(1200000);
      // Tax: 0-4L=0, 4-8L=20k, 8-12L=40k -> Total = 60,000
      expect(res.newRegime.slabTax).toBe(60000);
      expect(res.newRegime.rebate87A).toBe(60000);
      expect(res.newRegime.taxAfterRebate).toBe(0);
      expect(res.newRegime.cess).toBe(0);
      expect(res.newRegime.totalTax).toBe(0);
    });

    it("AY 2026-27: should correctly calculate Section 87A marginal relief above ₹12,00,000 taxable income", () => {
      // Taxable income ₹12,10,000 (Non-salaried)
      const res = calculateIncomeTax({
        grossAnnualIncome: 1210000,
        isSalaried: false,
        assessmentYear: "2026-27",
      });

      expect(res.newRegime.taxableIncome).toBe(1210000);
      // Slabs: 0-4L: 0, 4-8L: 20k, 8-12L: 40k, 12-12.10L: 15% of 10k = 1.5k -> Total = 61,500
      expect(res.newRegime.slabTax).toBe(61500);
      expect(res.newRegime.rebate87A).toBe(51500);
      expect(res.newRegime.marginalRelief87A).toBe(51500);
      expect(res.newRegime.taxAfterRebate).toBe(10000);
      // Cess: 4% of 10,000 = 400
      expect(res.newRegime.cess).toBe(400);
      expect(res.newRegime.totalTax).toBe(10400);
    });

    it("AY 2026-27: should compute surcharge with marginal relief for high income earners (>₹50L)", () => {
      const res = calculateIncomeTax({
        grossAnnualIncome: 6000000, // 60 Lakhs
        isSalaried: true,
        assessmentYear: "2026-27",
      });

      expect(res.newRegime.taxableIncome).toBe(5925000);
      expect(res.newRegime.surcharge).toBeGreaterThan(0);
      expect(res.newRegime.cess).toBeGreaterThan(0);
      expect(res.newRegime.totalTax).toBeGreaterThan(0);
    });
  });

  describe("Salary & In-Hand Engine", () => {
    it("should accurately decompose CTC vs Gross vs Employee Deductions vs Net In-Hand", () => {
      const res = calculateSalary({
        annualCTC: 1200000,
        basicPercentage: 50,
        taxRegime: "new",
        statePT: "maharashtra",
      });

      expect(res.annualCTC).toBe(1200000);
      expect(res.monthlyCTC).toBe(100000);
      expect(res.employeePFMonthly).toBe(6000); // 12% of 50k
      expect(res.employerPFMonthly).toBe(6000); // 12% of 50k
      expect(res.professionalTaxAnnual).toBe(2500);
      expect(res.netTakeHomeMonthly).toBeGreaterThan(0);
      expect(res.netTakeHomeMonthly).toBeLessThan(res.grossMonthlySalary);
    });

    it("should honor State-specific Professional Tax configurations", () => {
      expect(STATE_PT_CONFIGS["nil_pt_state"].annualPT).toBe(0);
      expect(STATE_PT_CONFIGS["maharashtra"].annualPT).toBe(2500);
      expect(STATE_PT_CONFIGS["karnataka"].annualPT).toBe(2400);
      expect(STATE_PT_CONFIGS["telangana_ap"].annualPT).toBe(2400);
      expect(STATE_PT_CONFIGS["tamilnadu"].annualPT).toBe(2500);

      const delhiRes = calculateSalary({
        annualCTC: 1200000,
        statePT: "nil_pt_state",
      });
      expect(delhiRes.professionalTaxAnnual).toBe(0);
    });
  });

  describe("HRA Exemption Engine (Section 10(13A) & Rule 2A)", () => {
    it("should compute exact 3-way minimum and provide statutory disclaimer", () => {
      const res = calculateHRA({
        basicSalaryAnnual: 600000,
        hraReceivedAnnual: 240000,
        rentPaidAnnual: 240000,
        isMetroCity: true,
      });

      // 1. Actual HRA = 2,40,000
      // 2. Rent - 10% basic = 2,40,000 - 60,000 = 1,80,000
      // 3. 50% basic = 3,00,000
      // Minimum is 1,80,000
      expect(res.exemptHRA).toBe(180000);
      expect(res.taxableHRA).toBe(60000);
      expect(res.limitingFactor).toBe("rent_paid_minus_ten_percent");
      expect(res.statutoryMetadata.disclaimer.toLowerCase()).toContain("estimate");
    });
  });

  describe("Gratuity Engine (Section 4 & Section 10(10))", () => {
    it("Covered Establishment: should use 15/26 formula and honor ₹20 Lakh statutory cap", () => {
      const res = calculateGratuity({
        monthlyBasicSalary: 100000,
        tenureYears: 20,
        tenureMonths: 7, // > 6 months rounds up to 21 years
        isCoveredUnderAct: true,
      });

      // (15 * 100000 * 21) / 26 = 12,11,538.46 -> rounded 12,11,538
      expect(res.formulaDisplay).toContain("15/26");
      expect(res.effectiveServiceYears).toBe(21);
      expect(res.totalGratuityCalculated).toBe(1211538);
      expect(res.isEligible).toBe(true);
      expect(res.taxExemptGratuity).toBe(1211538);
      expect(res.taxableGratuity).toBe(0);

      const highSalary = calculateGratuity({
        monthlyBasicSalary: 300000,
        tenureYears: 30,
        isCoveredUnderAct: true,
      });
      // (15 * 300000 * 30) / 26 = 51,92,308
      expect(highSalary.totalGratuityCalculated).toBe(5192308);
      expect(highSalary.taxExemptGratuity).toBe(STATUTORY_GRATUITY_EXEMPTION_LIMIT); // ₹20 Lakhs max
      expect(highSalary.taxableGratuity).toBe(3192308);
    });

    it("Non-Covered Establishment: should use 15/30 formula with completed full years only", () => {
      const res = calculateGratuity({
        monthlyBasicSalary: 60000,
        tenureYears: 10,
        tenureMonths: 9, // No rounding for non-covered establishment
        isCoveredUnderAct: false,
      });

      // (15 * 60000 * 10) / 30 = 3,00,000
      expect(res.formulaDisplay).toContain("15/30");
      expect(res.effectiveServiceYears).toBe(10);
      expect(res.totalGratuityCalculated).toBe(300000);
    });

    it("Section 4(1) Proviso: should waive 5-year tenure condition on death or permanent disablement", () => {
      const ineligibleRes = calculateGratuity({
        monthlyBasicSalary: 50000,
        tenureYears: 3,
        waiveFiveYearRuleForDeathOrDisablement: false,
      });
      expect(ineligibleRes.isEligible).toBe(false);
      expect(ineligibleRes.totalGratuityCalculated).toBe(0);

      const waiverRes = calculateGratuity({
        monthlyBasicSalary: 50000,
        tenureYears: 3,
        waiveFiveYearRuleForDeathOrDisablement: true,
      });
      expect(waiverRes.isEligible).toBe(true);
      // (15 * 50000 * 3) / 26 = 86,538
      expect(waiverRes.totalGratuityCalculated).toBe(86538);
    });
  });

  describe("NPS Engine (PFRDA Exit Regulations)", () => {
    it("Normal Exit (Age 60): should require min 40% annuity and allow max 60% tax-free lump sum", () => {
      const res = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 60,
        expectedAnnualReturn: 10,
        exitType: "normal",
        annuityPercentage: 40,
        expectedAnnuityRate: 6,
      });

      expect(res.exitType).toBe("normal");
      expect(res.minMandatoryAnnuityPercentage).toBe(40);
      expect(res.maxLumpSumPercentage).toBe(60);
      expect(res.isSmallCorpusExemptFromAnnuity).toBe(false);
      expect(res.taxationSummary.lumpSumTaxStatus).toContain("10(12A)");
      expect(res.taxationSummary.annuityPurchaseTaxStatus).toContain("80CCD(5)");
      expect(res.taxationSummary.annuityIncomeTaxStatus).toContain("taxable");
    });

    it("Normal Exit with corpus <= ₹5,00,000: should permit 100% lump sum withdrawal", () => {
      const res = calculateNPS({
        monthlyContribution: 500,
        currentAge: 58,
        retirementAge: 60,
        expectedAnnualReturn: 10,
        exitType: "normal",
        annuityPercentage: 0,
      });

      expect(res.totalCorpusAtRetirement).toBeLessThanOrEqual(500000);
      expect(res.isSmallCorpusExemptFromAnnuity).toBe(true);
    });

    it("Premature Exit (< Age 60): should require min 80% annuity unless corpus <= ₹2,50,000", () => {
      const res = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 45,
        exitType: "premature",
        annuityPercentage: 40,
      });

      expect(res.exitType).toBe("premature");
      expect(res.minMandatoryAnnuityPercentage).toBe(80);
      expect(res.maxLumpSumPercentage).toBe(20);
      expect(res.annuityPercentage).toBe(80);
      expect(res.lumpSumPercentage).toBe(20);
    });

    it("Corporate Sector Model: supports employer superannuation age and Section 80CCD(2) tax notes", () => {
      const res = calculateNPS({
        monthlyContribution: 15000,
        currentAge: 30,
        retirementAge: 58,
        npsModel: "corporate",
        exitType: "normal",
      });

      expect(res.npsModel).toBe("corporate");
      expect(res.modelConfig.defaultSuperannuationAge).toBe(58);
      expect(res.taxationSummary.modelTaxNotes).toContain("80CCD(2)");
    });

    it("Death Exit: 100% corpus is paid as tax-free lump sum to nominee with 0% mandatory annuity", () => {
      const res = calculateNPS({
        monthlyContribution: 10000,
        currentAge: 30,
        retirementAge: 45,
        exitType: "death",
      });

      expect(res.exitType).toBe("death");
      expect(res.minMandatoryAnnuityPercentage).toBe(0);
      expect(res.maxLumpSumPercentage).toBe(100);
      expect(res.annuityAmount).toBe(0);
      expect(res.lumpSumAmount).toBe(res.totalCorpusAtRetirement);
    });
  });

  describe("EPF Engine (EPFO Rules & Wage Ceiling Allocations)", () => {
    it("should compute compound corpus with 8.25% interest and EPS allocation", () => {
      const res = calculateEPF({
        currentMonthlyBasicSalary: 50000,
        currentAge: 25,
        retirementAge: 58,
        annualInterestRate: 8.25,
        annualSalaryIncrementPercentage: 5,
        currentEPFBalance: 0,
        wageCeilingOption: "eps_capped_15k",
      });

      expect(res.totalEmployeeContribution).toBeGreaterThan(0);
      expect(res.totalEmployerContribution).toBeGreaterThan(0);
      expect(res.totalEPSContribution).toBeGreaterThan(0);
      expect(res.totalInterestEarned).toBeGreaterThan(0);
      expect(res.maturityCorpus).toBeGreaterThan(
        res.totalEmployeeContribution + res.totalEmployerContribution
      );
      expect(res.applicableFinancialYear).toBe("FY 2023-24 & FY 2024-25");
      expect(res.yearlyBreakdown.length).toBe(33); // 58 - 25 = 33 years
    });
  });
});
