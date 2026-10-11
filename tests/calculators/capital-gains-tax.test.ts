import { describe, it, expect } from "vitest";
import {
  calculateCapitalGainsTax,
  capitalGainsTaxSchema,
  capitalGainsTaxEngine,
  defaultCapitalGainsTaxInputs,
} from "@/lib/calculators/capital-gains-tax";

describe("Capital Gains Tax Calculator Engine (Budget 2024)", () => {
  it("registers in the central calculator engine contract", () => {
    expect(capitalGainsTaxEngine.id).toBe("capital-gains-tax-calculator");
    expect(capitalGainsTaxEngine.metadata.route).toBe("/capital-gains-tax-calculator");
    expect(capitalGainsTaxEngine.metadata.category).toBe("finance");
  });

  it("calculates Listed Equity LTCG with 12.5% rate and ₹1.25 Lakh exemption", () => {
    // Buy ₹10L, Sell ₹15L after 24 months (LTCG)
    // Transfer expenses ₹2,500
    // Net gain = ₹15L - ₹2,500 - ₹10L = ₹4,97,500
    // Exemption under Sec 112A = ₹1,25,000
    // Taxable gain = ₹4,97,500 - ₹1,25,000 = ₹3,72,500
    // Base tax @ 12.5% = ₹46,563
    // Cess @ 4% = ₹1,863
    // Total = ₹48,426
    const res = calculateCapitalGainsTax(defaultCapitalGainsTaxInputs);

    expect(res.gainType).toBe("LTCG");
    expect(res.exemptionSec112A).toBe(125000);
    expect(res.applicableTaxRatePercent).toBe(12.5);
    expect(res.taxableGain).toBe(372500);
    expect(res.baseTax).toBe(46563);
    expect(res.cess).toBe(1863);
    expect(res.totalTaxLiability).toBe(48426);
  });

  it("calculates Listed Equity STCG with 20% statutory rate", () => {
    // Buy ₹5L, Sell ₹7L after 6 months (STCG)
    // Gain = ₹2L
    // Tax rate @ 20% (Budget 2024)
    // Base tax = ₹40,000
    // Cess = ₹1,600
    // Total = ₹41,600
    const res = calculateCapitalGainsTax({
      assetType: "listed_equity",
      purchasePrice: 500000,
      salePrice: 700000,
      holdingPeriodMonths: 6,
      transferExpenses: 0,
    });

    expect(res.gainType).toBe("STCG");
    expect(res.applicableTaxRatePercent).toBe(20.0);
    expect(res.taxableGain).toBe(200000);
    expect(res.baseTax).toBe(40000);
    expect(res.cess).toBe(1600);
    expect(res.totalTaxLiability).toBe(41600);
  });

  it("enforces Section 50AA for Debt Mutual Funds as STCG at slab rate", () => {
    // Buy ₹10L, Sell ₹13L after 36 months
    // Even though 3 years, Sec 50AA treats as STCG at slab rate (e.g. 30%)
    const res = calculateCapitalGainsTax({
      assetType: "debt_mf",
      purchasePrice: 1000000,
      salePrice: 1300000,
      holdingPeriodMonths: 36,
      investorSlabRate: 30,
    });

    expect(res.gainType).toBe("STCG");
    expect(res.applicableTaxRatePercent).toBe(30);
    expect(res.taxableGain).toBe(300000);
    expect(res.baseTax).toBe(90000);
    expect(res.totalTaxLiability).toBe(93600);
  });

  it("evaluates Real Estate grandfathering comparing 12.5% unindexed vs 20% indexed", () => {
    // Bought in 2015-16 (CII: 254) for ₹50L, Sold in 2024-25 (CII: 363) for ₹90L (holding 9 years)
    const res = calculateCapitalGainsTax({
      assetType: "real_estate",
      purchasePrice: 5000000,
      salePrice: 9000000,
      holdingPeriodMonths: 108,
      acquiredBeforeBudget2024: true,
      purchaseFinancialYear: "2015-16",
      saleFinancialYear: "2024-25",
    });

    expect(res.gainType).toBe("LTCG");
    expect(res.isGrandfatheredRealEstate).toBe(true);
    expect(res.grandfathering).toBeDefined();
    expect(res.grandfathering?.applicable).toBe(true);
    // Unindexed gain: ₹40L, Tax @ 12.5% + 4% cess = ₹5,20,000
    // Indexed cost = ₹50L * (363/254) = ₹71,45,669. Gain = ₹18,54,331. Tax @ 20% + 4% cess = ₹3,85,701
    // Optimal choice should be 20% with indexation!
    expect(res.grandfathering?.optimalChoice).toBe("20% with indexation");
    expect(res.applicableTaxRatePercent).toBe(20.0);
  });

  it("handles Capital Loss correctly with carry-forward advisory", () => {
    const res = calculateCapitalGainsTax({
      assetType: "listed_equity",
      purchasePrice: 1000000,
      salePrice: 800000,
      holdingPeriodMonths: 18,
    });

    expect(res.gainType).toBe("LOSS");
    expect(res.taxableGain).toBe(0);
    expect(res.totalTaxLiability).toBe(0);
    expect(res.explanationNotes[0]).toContain("Capital loss of ₹2,00,000 incurred");
  });

  it("validates inputs with Zod schema", () => {
    const valid = capitalGainsTaxSchema.safeParse(defaultCapitalGainsTaxInputs);
    expect(valid.success).toBe(true);

    const invalid = capitalGainsTaxSchema.safeParse({
      ...defaultCapitalGainsTaxInputs,
      salePrice: -500,
    });
    expect(invalid.success).toBe(false);
  });
});
