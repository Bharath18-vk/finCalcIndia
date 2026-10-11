import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";
import { CII_TABLE } from "./inflation";

export type CapitalGainsAssetType =
  | "listed_equity"
  | "real_estate"
  | "debt_mf"
  | "gold"
  | "unlisted_equity";

export interface CapitalGainsTaxInput {
  assetType: CapitalGainsAssetType;
  salePrice: number;
  purchasePrice: number;
  transferExpenses?: number; // Brokerage, legal fees, stamp duty
  improvementCost?: number; // Renovation / home improvement cost
  holdingPeriodMonths: number; // Duration held in months
  acquiredBeforeBudget2024?: boolean; // For real estate acquired before 23 July 2024
  purchaseFinancialYear?: string; // e.g. "2015-16" for indexation
  saleFinancialYear?: string; // e.g. "2024-25"
  investorSlabRate?: number; // Slab rate % (5, 10, 15, 20, 30) for slab-taxed assets
  exemptionsClaimed?: number; // Section 54, 54EC, 54F, etc.
}

export interface GrandfatheringComparison {
  applicable: boolean;
  gainWithoutIndexation: number;
  taxWithoutIndexation: number;
  indexedCost: number;
  gainWithIndexation: number;
  taxWithIndexation: number;
  optimalChoice: "12.5% without indexation" | "20% with indexation";
  taxDifference: number;
}

export interface CapitalGainsTaxResult {
  assetType: CapitalGainsAssetType;
  holdingPeriodMonths: number;
  gainType: "LTCG" | "STCG" | "LOSS";
  grossGain: number;
  netSaleValue: number;
  costDeducted: number;
  exemptionSec112A: number; // Up to ₹1,25,000 for listed equity LTCG
  otherExemptions: number; // Section 54, 54EC, 54F
  taxableGain: number;
  applicableTaxRatePercent: number;
  baseTax: number;
  cess: number; // 4% Health & Education Cess
  totalTaxLiability: number;
  effectiveTaxRatePercent: number;
  isGrandfatheredRealEstate: boolean;
  grandfathering?: GrandfatheringComparison;
  explanationNotes: string[];
}

export const capitalGainsTaxSchema = z.object({
  assetType: z.enum([
    "listed_equity",
    "real_estate",
    "debt_mf",
    "gold",
    "unlisted_equity",
  ]),
  salePrice: z
    .number({ invalid_type_error: "Sale price must be a number" })
    .positive("Sale price must be greater than zero")
    .max(10000000000, "Amount cannot exceed ₹1,000 Crores"),
  purchasePrice: z
    .number({ invalid_type_error: "Purchase price must be a number" })
    .min(0, "Purchase price cannot be negative")
    .max(10000000000, "Amount cannot exceed ₹1,000 Crores"),
  transferExpenses: z
    .number({ invalid_type_error: "Transfer expenses must be a number" })
    .min(0, "Transfer expenses cannot be negative")
    .default(0),
  improvementCost: z
    .number({ invalid_type_error: "Improvement cost must be a number" })
    .min(0, "Improvement cost cannot be negative")
    .default(0),
  holdingPeriodMonths: z
    .number({ invalid_type_error: "Holding period must be a number" })
    .int("Holding period must be whole months")
    .min(1, "Holding period must be at least 1 month")
    .max(1200, "Holding period cannot exceed 100 years"),
  acquiredBeforeBudget2024: z.boolean().default(true),
  purchaseFinancialYear: z.string().default("2015-16"),
  saleFinancialYear: z.string().default("2024-25"),
  investorSlabRate: z
    .number({ invalid_type_error: "Slab rate must be a number" })
    .min(0)
    .max(39, "Slab rate cannot exceed 39%")
    .default(30),
  exemptionsClaimed: z
    .number({ invalid_type_error: "Exemptions must be a number" })
    .min(0)
    .default(0),
});

export const defaultCapitalGainsTaxInputs: CapitalGainsTaxInput = {
  assetType: "listed_equity",
  salePrice: 1500000,
  purchasePrice: 1000000,
  transferExpenses: 2500,
  improvementCost: 0,
  holdingPeriodMonths: 24, // 2 years -> LTCG
  acquiredBeforeBudget2024: true,
  purchaseFinancialYear: "2018-19",
  saleFinancialYear: "2024-25",
  investorSlabRate: 30,
  exemptionsClaimed: 0,
};

export function calculateCapitalGainsTax(
  input: CapitalGainsTaxInput
): CapitalGainsTaxResult {
  const {
    assetType,
    salePrice,
    purchasePrice,
    transferExpenses = 0,
    improvementCost = 0,
    holdingPeriodMonths,
    acquiredBeforeBudget2024 = true,
    purchaseFinancialYear = "2015-16",
    saleFinancialYear = "2024-25",
    investorSlabRate = 30,
    exemptionsClaimed = 0,
  } = input;

  const notes: string[] = [];
  const netSaleValue = Math.max(0, salePrice - transferExpenses);
  const totalCost = purchasePrice + improvementCost;
  const rawGain = netSaleValue - totalCost;

  if (rawGain <= 0) {
    return {
      assetType,
      holdingPeriodMonths,
      gainType: "LOSS",
      grossGain: salePrice - purchasePrice,
      netSaleValue,
      costDeducted: totalCost,
      exemptionSec112A: 0,
      otherExemptions: 0,
      taxableGain: 0,
      applicableTaxRatePercent: 0,
      baseTax: 0,
      cess: 0,
      totalTaxLiability: 0,
      effectiveTaxRatePercent: 0,
      isGrandfatheredRealEstate: false,
      explanationNotes: [
        "Capital loss of ₹" +
          Math.abs(Math.round(rawGain)).toLocaleString("en-IN") +
          " incurred. Capital losses can be carried forward for up to 8 assessment years to set off against future capital gains under Section 70/74.",
      ],
    };
  }

  // Statutory Holding Period Thresholds (Post-Budget July 2024)
  // Listed Equity: 12 months
  // Real Estate: 24 months
  // Gold / Unlisted Equity: 24 months
  // Debt MF (acquired >= 1 Apr 2023): Always STCG (Sec 50AA)
  let isLTCG = false;
  if (assetType === "debt_mf") {
    isLTCG = false; // Always STCG under Section 50AA
    notes.push(
      "Under Finance Act Section 50AA (effective April 1, 2023), gains from Debt Mutual Funds are deemed Short-Term Capital Gains and taxed at your income slab rate regardless of holding period."
    );
  } else if (assetType === "listed_equity") {
    isLTCG = holdingPeriodMonths > 12;
  } else {
    // real_estate, gold, unlisted_equity
    isLTCG = holdingPeriodMonths > 24;
  }

  let applicableTaxRate = 0;
  let exemptionSec112A = 0;
  let taxableGain = 0;
  let isGrandfatheredRealEstate = false;
  let grandfathering: GrandfatheringComparison | undefined = undefined;

  if (!isLTCG) {
    // SHORT-TERM CAPITAL GAINS
    if (assetType === "listed_equity") {
      // Budget 2024 revised STCG on listed equity under Section 111A from 15% to 20%
      applicableTaxRate = 20.0;
      taxableGain = Math.max(0, rawGain - exemptionsClaimed);
      notes.push(
        "Under Section 111A (revised in Union Budget 2024 effective July 23, 2024), STCG on listed equity and equity mutual funds is taxed at 20% (plus 4% cess)."
      );
    } else {
      // Slab rate for real estate, gold, unlisted, debt MF
      applicableTaxRate = investorSlabRate;
      taxableGain = Math.max(0, rawGain - exemptionsClaimed);
      notes.push(
        `Short-Term Capital Gain taxed at your applicable income tax slab rate of ${investorSlabRate}% (plus 4% cess).`
      );
    }
  } else {
    // LONG-TERM CAPITAL GAINS
    if (assetType === "listed_equity") {
      // Section 112A: 12.5% rate with ₹1,25,000 exemption limit per FY
      applicableTaxRate = 12.5;
      const sec112aLimit = 125000;
      exemptionSec112A = Math.min(rawGain, sec112aLimit);
      taxableGain = Math.max(0, rawGain - exemptionSec112A - exemptionsClaimed);
      notes.push(
        "Under Section 112A (revised in Union Budget 2024), LTCG on listed equities is taxed at 12.5% (plus 4% cess) on gains exceeding the enhanced statutory exemption of ₹1,25,000."
      );
    } else if (assetType === "real_estate") {
      // Real Estate Post-Budget 2024
      // New default: 12.5% without indexation
      // Grandfathering: For properties acquired before July 23, 2024, individuals/HUFs can compare 12.5% unindexed vs 20% indexed
      const purchaseCii = CII_TABLE[purchaseFinancialYear] || 100;
      const saleCii = CII_TABLE[saleFinancialYear] || 363;
      const ciiMultiplier = saleCii / purchaseCii;

      const indexedCost = purchasePrice * ciiMultiplier + improvementCost * ciiMultiplier;
      const gainWithIndexation = Math.max(0, netSaleValue - indexedCost);

      const taxWithoutIndexation = (rawGain - exemptionsClaimed) * 0.125 * 1.04;
      const taxWithIndexation = (gainWithIndexation - exemptionsClaimed) * 0.20 * 1.04;

      if (acquiredBeforeBudget2024) {
        isGrandfatheredRealEstate = true;
        const optimalChoice =
          taxWithoutIndexation <= taxWithIndexation
            ? ("12.5% without indexation" as const)
            : ("20% with indexation" as const);
        const taxDifference = Math.abs(taxWithoutIndexation - taxWithIndexation);

        grandfathering = {
          applicable: true,
          gainWithoutIndexation: rawGain,
          taxWithoutIndexation: Math.max(0, Math.round(taxWithoutIndexation)),
          indexedCost: Math.round(indexedCost),
          gainWithIndexation: Math.round(gainWithIndexation),
          taxWithIndexation: Math.max(0, Math.round(taxWithIndexation)),
          optimalChoice,
          taxDifference: Math.round(taxDifference),
        };

        if (optimalChoice === "20% with indexation") {
          applicableTaxRate = 20.0;
          taxableGain = Math.max(0, gainWithIndexation - exemptionsClaimed);
          notes.push(
            `Grandfathering Benefit: Taking 20% with CII indexation saves ₹${Math.round(
              taxDifference
            ).toLocaleString("en-IN")} compared to the 12.5% unindexed rate.`
          );
        } else {
          applicableTaxRate = 12.5;
          taxableGain = Math.max(0, rawGain - exemptionsClaimed);
          notes.push(
            `Grandfathering Benefit: The 12.5% unindexed rate is more tax-efficient, saving ₹${Math.round(
              taxDifference
            ).toLocaleString("en-IN")} compared to 20% indexed.`
          );
        }
      } else {
        applicableTaxRate = 12.5;
        taxableGain = Math.max(0, rawGain - exemptionsClaimed);
        notes.push(
          "For real estate acquired on or after July 23, 2024, LTCG is uniformly taxed at 12.5% without indexation benefit."
        );
      }
    } else {
      // gold, unlisted_equity
      // Budget 2024 unified LTCG rate on non-financial / unlisted assets to 12.5% without indexation
      applicableTaxRate = 12.5;
      taxableGain = Math.max(0, rawGain - exemptionsClaimed);
      notes.push(
        "Under Budget 2024, LTCG on physical gold, silver, and unlisted shares held >24 months is taxed at 12.5% without indexation."
      );
    }
  }

  const baseTax = Math.round(taxableGain * (applicableTaxRate / 100));
  const cess = Math.round(baseTax * 0.04);
  const totalTaxLiability = baseTax + cess;
  const effectiveTaxRatePercent =
    rawGain > 0 ? Number(((totalTaxLiability / rawGain) * 100).toFixed(2)) : 0;

  return {
    assetType,
    holdingPeriodMonths,
    gainType: isLTCG ? "LTCG" : "STCG",
    grossGain: salePrice - purchasePrice,
    netSaleValue,
    costDeducted: totalCost,
    exemptionSec112A,
    otherExemptions: exemptionsClaimed,
    taxableGain,
    applicableTaxRatePercent: applicableTaxRate,
    baseTax,
    cess,
    totalTaxLiability,
    effectiveTaxRatePercent,
    isGrandfatheredRealEstate,
    grandfathering,
    explanationNotes: notes,
  };
}

export const capitalGainsTaxFields: CalculatorField<CapitalGainsTaxInput>[] = [
  {
    name: "assetType",
    label: "Asset Category",
    type: "select",
    defaultValue: "listed_equity",
    options: [
      {
        label: "Listed Equity & Equity Mutual Funds",
        value: "listed_equity",
        description: "STCG (≤12m): 20% | LTCG (>12m): 12.5% after ₹1.25L exemption",
      },
      {
        label: "Real Estate (House / Land / Flat)",
        value: "real_estate",
        description: "STCG (≤24m): Slab | LTCG (>24m): 12.5% unindexed or 20% indexed",
      },
      {
        label: "Debt Mutual Funds (Post Apr 2023)",
        value: "debt_mf",
        description: "Deemed STCG taxed at income slab rate (Sec 50AA)",
      },
      {
        label: "Physical Gold & Sovereign Gold Bonds",
        value: "gold",
        description: "STCG (≤24m): Slab | LTCG (>24m): 12.5% without indexation",
      },
      {
        label: "Unlisted Shares & Pre-IPO Equities",
        value: "unlisted_equity",
        description: "STCG (≤24m): Slab | LTCG (>24m): 12.5% without indexation",
      },
    ],
  },
  {
    name: "salePrice",
    label: "Full Sale Value (Consideration)",
    type: "currency",
    defaultValue: 1500000,
    unit: "₹",
    min: 1000,
    max: 1000000000,
    step: 10000,
    presets: [
      { label: "₹5 Lakh", value: 500000 },
      { label: "₹15 Lakh", value: 1500000 },
      { label: "₹50 Lakh", value: 5000000 },
      { label: "₹1 Crore", value: 10000000 },
    ],
  },
  {
    name: "purchasePrice",
    label: "Original Cost of Acquisition",
    type: "currency",
    defaultValue: 1000000,
    unit: "₹",
    min: 0,
    max: 1000000000,
    step: 10000,
    presets: [
      { label: "₹3 Lakh", value: 300000 },
      { label: "₹10 Lakh", value: 1000000 },
      { label: "₹30 Lakh", value: 3000000 },
      { label: "₹75 Lakh", value: 7500000 },
    ],
  },
  {
    name: "holdingPeriodMonths",
    label: "Holding Duration (Months)",
    type: "number",
    defaultValue: 24,
    min: 1,
    max: 600,
    step: 1,
    unit: "months",
    presets: [
      { label: "6 Months (STCG)", value: 6 },
      { label: "18 Months", value: 18 },
      { label: "3 Years", value: 36 },
      { label: "5 Years", value: 60 },
      { label: "10 Years", value: 120 },
    ],
  },
  {
    name: "transferExpenses",
    label: "Transfer / Brokerage Expenses",
    type: "currency",
    defaultValue: 2500,
    unit: "₹",
    min: 0,
    max: 5000000,
    step: 500,
  },
  {
    name: "exemptionsClaimed",
    label: "Capital Gains Exemptions (Sec 54 / 54EC / 54F)",
    type: "currency",
    defaultValue: 0,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 10000,
  },
];

export const capitalGainsTaxMetadata: CalculatorMetadata = {
  id: "capital-gains-tax-calculator",
  name: "Capital Gains Tax Calculator India (Budget 2024 Revised)",
  shortDescription:
    "Calculate Short-Term (STCG) and Long-Term (LTCG) Capital Gains Tax across Equity, Real Estate, Gold, and Debt Funds post-Budget 2024 revisions with real estate grandfathering comparisons.",
  category: "finance",
  subcategory: "Taxation",
  route: "/capital-gains-tax-calculator",
  badge: "Budget 2024 Rules",
  directAnswer:
    "Following Union Budget 2024 (effective July 23, 2024), LTCG on listed equities is taxed at 12.5% on annual gains exceeding ₹1.25 Lakh (up from ₹1 Lakh). STCG on listed equities is taxed at 20% (up from 15%). Real estate LTCG held >24 months is taxed at 12.5% without indexation, though individuals who bought before July 23, 2024 retain the grandfathered option to pay 20% with indexation if lower.",
  keywords: [
    "capital gains tax calculator",
    "ltcg calculator india",
    "stcg calculator budget 2024",
    "property capital gains tax calculator",
    "mutual fund capital gains tax",
    "section 112a exemption calculator",
    "real estate grandfathering capital gains",
  ],
  formula: {
    expression: "Taxable Gain = Net Sale Value - Cost of Acquisition - Statutory Exemptions",
    variables: [
      { symbol: "NSV", label: "Net Sale Value", description: "Gross Sale Consideration minus Transfer Expenses" },
      { symbol: "Cost", label: "Acquisition Cost", description: "Purchase price + capital improvement costs" },
      { symbol: "Sec112A", label: "LTCG Exemption", description: "₹1,25,000 threshold for listed equities" },
      { symbol: "Rate", label: "Statutory Rate", description: "12.5% LTCG / 20% STCG / Slab rate + 4% cess" },
    ],
    steps: [
      {
        label: "Net Sale Consideration",
        expression: "Net Sale = Full Sale Consideration - Transfer Costs",
        explanation: "Deduct brokerage, stamp fees, or sales commission from the total sale price.",
      },
      {
        label: "Determine Holding Period",
        expression: "Listed Equity: 12 Months | Real Estate & Gold: 24 Months",
        explanation: "Determine whether the asset qualifies as Short-Term or Long-Term Capital Gain.",
      },
      {
        label: "Apply Statutory Exemption",
        expression: "Section 112A = min(Gain, ₹1,25,000) for Listed Equities",
        explanation: "Section 112A provides ₹1,25,000 tax-free LTCG per financial year.",
      },
      {
        label: "Compute Tax & 4% Health Cess",
        expression: "Total Tax = (Taxable Gain × Statutory Rate) × 1.04",
        explanation: "Apply the statutory tax rate and add mandatory 4% Health and Education Cess.",
      },
    ],
  },
  faqs: [
    {
      question: "What are the new Capital Gains tax rates after Budget 2024?",
      answer:
        "From July 23, 2024 onwards: (1) Listed Equity LTCG is 12.5% with ₹1.25 Lakh exemption, (2) Listed Equity STCG is 20%, (3) Real estate LTCG is 12.5% without indexation (or 20% with indexation for pre-July 23, 2024 buys), (4) Physical gold and unlisted shares LTCG is 12.5% without indexation.",
    },
    {
      question: "What is the real estate grandfathering clause under Budget 2024?",
      answer:
        "The Lok Sabha amendment allows Indian resident individuals and HUFs who acquired immovable property before July 23, 2024 to choose between: (A) 12.5% tax without indexation, or (B) 20% tax with CBDT CII indexation, whichever results in lower tax liability.",
    },
    {
      question: "How are Debt Mutual Funds taxed in India?",
      answer:
        "Under Section 50AA introduced in Finance Act 2023, investments in specified mutual funds having less than 35% equity (debt funds) made on or after April 1, 2023 are always treated as short-term capital gains and taxed at your applicable income tax slab rate, regardless of how long you hold them.",
    },
    {
      question: "Can capital losses be set off against capital gains?",
      answer:
        "Yes. Short-term capital losses can be set off against both STCG and LTCG. However, long-term capital losses can only be set off against long-term capital gains. Unadjusted capital losses can be carried forward for up to 8 assessment years.",
    },
  ],
  sources: [
    {
      name: "Income Tax Department of India - Capital Gains",
      url: "https://incometaxindia.gov.in",
    },
    {
      name: "Union Budget 2024-25 Memorandum Explaining Provisions",
      url: "https://www.indiabudget.gov.in",
    },
  ],
  version: {
    version: "2.0.0",
    effectiveFrom: "2024-07-23",
    lastReviewed: "2026-10-11",
    changelogNotes: "Refactored to incorporate Union Budget 2024 statutory tax amendments (12.5% LTCG, 20% STCG, ₹1.25L Sec 112A limit, and real estate grandfathering).",
  },
};

export const capitalGainsTaxEngine: CalculatorEngine<
  CapitalGainsTaxInput,
  CapitalGainsTaxResult
> = {
  id: "capital-gains-tax-calculator",
  metadata: capitalGainsTaxMetadata,
  schema: capitalGainsTaxSchema,
  defaultInputs: defaultCapitalGainsTaxInputs,
  fields: capitalGainsTaxFields,
  calculate: calculateCapitalGainsTax,
};

registerCalculator(capitalGainsTaxEngine);
