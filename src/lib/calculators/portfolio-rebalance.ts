import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export type RebalanceStrategy = "cash_flow_first" | "full_rebalance";

export interface AssetClassHolding {
  id: "equity" | "debt" | "gold" | "cash";
  name: string;
  currentAmount: number;
  targetPercent: number;
}

export interface PortfolioRebalanceInput {
  equityCurrent: number;
  equityTargetPercent: number;
  debtCurrent: number;
  debtTargetPercent: number;
  goldCurrent: number;
  goldTargetPercent: number;
  cashCurrent: number;
  cashTargetPercent: number;
  freshCapital?: number; // New funds available to invest
  strategy?: RebalanceStrategy; // "cash_flow_first" (tax-smart) or "full_rebalance"
  driftTolerancePercent?: number; // Default 5%
}

export interface RebalanceAssetRow {
  id: string;
  name: string;
  currentAmount: number;
  currentPercent: number;
  targetPercent: number;
  driftPercent: number; // currentPercent - targetPercent
  driftStatus: "overweight" | "underweight" | "balanced";
  action: "BUY" | "SELL" | "HOLD";
  transactAmount: number; // ₹ to buy (+) or sell (-)
  postAmount: number;
  postPercent: number;
}

export interface PortfolioRebalanceResult {
  totalCurrentPortfolio: number;
  freshCapital: number;
  totalPostPortfolio: number;
  strategy: RebalanceStrategy;
  maxDriftPercent: number;
  isRebalanceRecommended: boolean;
  driftTolerancePercent: number;
  assets: RebalanceAssetRow[];
  totalToSell: number;
  totalToBuy: number;
  unallocatedFreshCapital: number;
  taxEfficiencyAdvice: string;
  actionPlan: string[];
}

export const portfolioRebalanceSchema = z
  .object({
    equityCurrent: z
      .number({ invalid_type_error: "Equity amount must be a number" })
      .min(0, "Equity cannot be negative")
      .max(1000000000, "Amount cannot exceed ₹100 Crores"),
    equityTargetPercent: z
      .number({ invalid_type_error: "Equity target must be a number" })
      .min(0)
      .max(100),
    debtCurrent: z
      .number({ invalid_type_error: "Debt amount must be a number" })
      .min(0, "Debt cannot be negative")
      .max(1000000000, "Amount cannot exceed ₹100 Crores"),
    debtTargetPercent: z
      .number({ invalid_type_error: "Debt target must be a number" })
      .min(0)
      .max(100),
    goldCurrent: z
      .number({ invalid_type_error: "Gold amount must be a number" })
      .min(0, "Gold cannot be negative")
      .max(1000000000, "Amount cannot exceed ₹100 Crores"),
    goldTargetPercent: z
      .number({ invalid_type_error: "Gold target must be a number" })
      .min(0)
      .max(100),
    cashCurrent: z
      .number({ invalid_type_error: "Cash amount must be a number" })
      .min(0, "Cash cannot be negative")
      .max(1000000000, "Amount cannot exceed ₹100 Crores"),
    cashTargetPercent: z
      .number({ invalid_type_error: "Cash target must be a number" })
      .min(0)
      .max(100),
    freshCapital: z
      .number({ invalid_type_error: "Fresh capital must be a number" })
      .min(0)
      .max(1000000000)
      .default(0),
    strategy: z.enum(["cash_flow_first", "full_rebalance"]).default("cash_flow_first"),
    driftTolerancePercent: z
      .number({ invalid_type_error: "Tolerance must be a number" })
      .min(1)
      .max(20)
      .default(5),
  })
  .refine(
    (data) => {
      const sum =
        data.equityTargetPercent +
        data.debtTargetPercent +
        data.goldTargetPercent +
        data.cashTargetPercent;
      return Math.abs(sum - 100) < 0.01;
    },
    {
      message: "Target asset allocation percentages must sum exactly to 100%",
      path: ["equityTargetPercent"],
    }
  );

export const defaultPortfolioRebalanceInputs: PortfolioRebalanceInput = {
  equityCurrent: 1400000, // 70%
  equityTargetPercent: 60,
  debtCurrent: 400000, // 20%
  debtTargetPercent: 25,
  goldCurrent: 100000, // 5%
  goldTargetPercent: 10,
  cashCurrent: 100000, // 5%
  cashTargetPercent: 5,
  freshCapital: 100000,
  strategy: "cash_flow_first",
  driftTolerancePercent: 5,
};

export function calculatePortfolioRebalance(
  input: PortfolioRebalanceInput
): PortfolioRebalanceResult {
  const {
    equityCurrent,
    equityTargetPercent,
    debtCurrent,
    debtTargetPercent,
    goldCurrent,
    goldTargetPercent,
    cashCurrent,
    cashTargetPercent,
    freshCapital = 0,
    strategy = "cash_flow_first",
    driftTolerancePercent = 5,
  } = input;

  const totalCurrentPortfolio =
    equityCurrent + debtCurrent + goldCurrent + cashCurrent;

  if (totalCurrentPortfolio <= 0) {
    return {
      totalCurrentPortfolio: 0,
      freshCapital,
      totalPostPortfolio: freshCapital,
      strategy,
      maxDriftPercent: 0,
      isRebalanceRecommended: false,
      driftTolerancePercent,
      assets: [],
      totalToSell: 0,
      totalToBuy: 0,
      unallocatedFreshCapital: freshCapital,
      taxEfficiencyAdvice: "Enter your current investments to view rebalancing recommendations.",
      actionPlan: [],
    };
  }

  const rawAssets: AssetClassHolding[] = [
    { id: "equity", name: "Equity (Mutual Funds & Stocks)", currentAmount: equityCurrent, targetPercent: equityTargetPercent },
    { id: "debt", name: "Debt (FDs, Debt MFs, EPF/PPF)", currentAmount: debtCurrent, targetPercent: debtTargetPercent },
    { id: "gold", name: "Gold (SGB, Gold ETFs)", currentAmount: goldCurrent, targetPercent: goldTargetPercent },
    { id: "cash", name: "Cash & Liquid Funds", currentAmount: cashCurrent, targetPercent: cashTargetPercent },
  ];

  let maxDrift = 0;
  const initialAssetRows = rawAssets.map((asset) => {
    const currentPercent = (asset.currentAmount / totalCurrentPortfolio) * 100;
    const driftPercent = Number((currentPercent - asset.targetPercent).toFixed(2));
    const absDrift = Math.abs(driftPercent);
    if (absDrift > maxDrift) maxDrift = absDrift;

    let driftStatus: "overweight" | "underweight" | "balanced" = "balanced";
    if (driftPercent > driftTolerancePercent) driftStatus = "overweight";
    else if (driftPercent < -driftTolerancePercent) driftStatus = "underweight";

    return {
      id: asset.id,
      name: asset.name,
      currentAmount: asset.currentAmount,
      currentPercent: Number(currentPercent.toFixed(2)),
      targetPercent: asset.targetPercent,
      driftPercent,
      driftStatus,
      action: "HOLD" as const,
      transactAmount: 0,
      postAmount: asset.currentAmount,
      postPercent: Number(currentPercent.toFixed(2)),
    };
  });

  const isRebalanceRecommended = maxDrift >= driftTolerancePercent;

  let totalToSell = 0;
  let totalToBuy = 0;
  let unallocatedFreshCapital = freshCapital;
  const postAssets: RebalanceAssetRow[] = [];
  const actionPlan: string[] = [];

  if (strategy === "full_rebalance") {
    // Mode A: Classic Full Rebalance (Sells overweight to exact targets)
    const newTotal = totalCurrentPortfolio + freshCapital;

    initialAssetRows.forEach((row) => {
      const idealTargetAmount = Math.round(newTotal * (row.targetPercent / 100));
      const delta = idealTargetAmount - row.currentAmount;

      let action: "BUY" | "SELL" | "HOLD" = "HOLD";
      let transactAmount = 0;

      if (delta > 100) {
        action = "BUY";
        transactAmount = delta;
        totalToBuy += delta;
      } else if (delta < -100) {
        action = "SELL";
        transactAmount = Math.abs(delta);
        totalToSell += Math.abs(delta);
      }

      const postAmount = idealTargetAmount;
      const postPercent = Number(((postAmount / newTotal) * 100).toFixed(2));

      postAssets.push({
        ...row,
        action,
        transactAmount,
        postAmount,
        postPercent,
      });

      if (action === "SELL") {
        actionPlan.push(
          `Sell ₹${transactAmount.toLocaleString("en-IN")} of ${row.name} to trim overweight allocation.`
        );
      } else if (action === "BUY") {
        actionPlan.push(
          `Buy ₹${transactAmount.toLocaleString("en-IN")} of ${row.name} to restore target weight.`
        );
      }
    });

    unallocatedFreshCapital = 0;
  } else {
    // Mode B: Cash-Flow First / Tax-Smart Rebalancing
    // Deploy fresh capital strictly into underweight assets to minimize selling & tax
    const newTotal = totalCurrentPortfolio + freshCapital;
    let remainingFresh = freshCapital;

    // Calculate how much each underweight asset needs to reach ideal target
    const underweightNeeds = initialAssetRows.map((row) => {
      const idealTargetAmount = newTotal * (row.targetPercent / 100);
      const shortfall = Math.max(0, idealTargetAmount - row.currentAmount);
      return { id: row.id, shortfall };
    });

    const totalShortfall = underweightNeeds.reduce((acc, curr) => acc + curr.shortfall, 0);

    initialAssetRows.forEach((row) => {
      const need = underweightNeeds.find((n) => n.id === row.id)?.shortfall || 0;
      let buyFromFresh = 0;

      if (remainingFresh > 0 && totalShortfall > 0 && need > 0) {
        // Allocate fresh capital proportionally to each underweight asset's shortfall
        const proportion = need / totalShortfall;
        buyFromFresh = Math.min(need, Math.round(freshCapital * proportion));
      }

      let action: "BUY" | "SELL" | "HOLD" = "HOLD";
      let transactAmount = 0;
      if (buyFromFresh > 100) {
        action = "BUY";
        transactAmount = buyFromFresh;
        totalToBuy += buyFromFresh;
      }

      const postAmount = row.currentAmount + buyFromFresh;
      const postPercent = Number(((postAmount / newTotal) * 100).toFixed(2));

      postAssets.push({
        ...row,
        action,
        transactAmount,
        postAmount,
        postPercent,
      });

      if (action === "BUY") {
        actionPlan.push(
          `Direct ₹${transactAmount.toLocaleString("en-IN")} of fresh capital into ${row.name} without triggering sales.`
        );
      }
    });

    unallocatedFreshCapital = Math.max(0, freshCapital - totalToBuy);
    if (unallocatedFreshCapital > 100) {
      actionPlan.push(
        `Surplus fresh capital of ₹${unallocatedFreshCapital.toLocaleString(
          "en-IN"
        )} can be allocated pro-rata across your target allocations.`
      );
    }

    if (totalToBuy === 0 && isRebalanceRecommended) {
      actionPlan.push(
        "Fresh capital alone is insufficient to close the drift. If the drift exceeds your risk tolerance, switch to 'Full Rebalance' mode to trim overweight positions."
      );
    }
  }

  const taxEfficiencyAdvice =
    strategy === "cash_flow_first"
      ? "Tax-Smart Advantage: By deploying fresh capital instead of selling existing holdings, you incur ₹0 capital gains tax, 0 exit loads, and no transaction friction."
      : "Tax Warning: Selling ₹" +
        totalToSell.toLocaleString("en-IN") +
        " of holdings may trigger LTCG (12.5% under Section 112A) or STCG (20% under Section 111A). Check for grandfathered or tax-free limits (₹1.25L/year) before executing.";

  return {
    totalCurrentPortfolio,
    freshCapital,
    totalPostPortfolio: totalCurrentPortfolio + freshCapital,
    strategy,
    maxDriftPercent: Number(maxDrift.toFixed(2)),
    isRebalanceRecommended,
    driftTolerancePercent,
    assets: postAssets,
    totalToSell,
    totalToBuy,
    unallocatedFreshCapital,
    taxEfficiencyAdvice,
    actionPlan,
  };
}

export const portfolioRebalanceFields: CalculatorField<PortfolioRebalanceInput>[] = [
  {
    name: "strategy",
    label: "Rebalancing Strategy",
    type: "select",
    defaultValue: "cash_flow_first",
    options: [
      {
        label: "Tax-Smart (Cash Flow First - No Selling)",
        value: "cash_flow_first",
        description: "Direct fresh capital into underweight assets to avoid capital gains tax",
      },
      {
        label: "Full Rebalance (Buy & Sell to Exact Target)",
        value: "full_rebalance",
        description: "Trim overweight assets and buy underweight assets to hit exact percentages",
      },
    ],
  },
  {
    name: "freshCapital",
    label: "Fresh Capital Available to Invest",
    type: "currency",
    defaultValue: 100000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 10000,
    presets: [
      { label: "₹0 (No fresh funds)", value: 0 },
      { label: "₹50,000", value: 50000 },
      { label: "₹1 Lakh", value: 100000 },
      { label: "₹5 Lakh", value: 500000 },
    ],
  },
  {
    name: "equityCurrent",
    label: "Current Equity Holding (₹)",
    type: "currency",
    defaultValue: 1400000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 25000,
  },
  {
    name: "equityTargetPercent",
    label: "Target Equity Allocation (%)",
    type: "percentage",
    defaultValue: 60,
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
  },
  {
    name: "debtCurrent",
    label: "Current Debt Holding (₹)",
    type: "currency",
    defaultValue: 400000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 25000,
  },
  {
    name: "debtTargetPercent",
    label: "Target Debt Allocation (%)",
    type: "percentage",
    defaultValue: 25,
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
  },
  {
    name: "goldCurrent",
    label: "Current Gold Holding (₹)",
    type: "currency",
    defaultValue: 100000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 10000,
  },
  {
    name: "goldTargetPercent",
    label: "Target Gold Allocation (%)",
    type: "percentage",
    defaultValue: 10,
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
  },
  {
    name: "cashCurrent",
    label: "Current Cash / Liquid (₹)",
    type: "currency",
    defaultValue: 100000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 10000,
  },
  {
    name: "cashTargetPercent",
    label: "Target Cash Allocation (%)",
    type: "percentage",
    defaultValue: 5,
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
  },
];

export const portfolioRebalanceMetadata: CalculatorMetadata = {
  id: "portfolio-rebalance-calculator",
  name: "Portfolio Rebalancing Calculator (Tax-Smart Asset Allocation)",
  shortDescription:
    "Calculate portfolio asset drift and execute tax-smart rebalancing across Equity, Debt, Gold, and Cash with fresh capital allocation to minimize capital gains tax.",
  category: "finance",
  subcategory: "Investments",
  route: "/portfolio-rebalance-calculator",
  badge: "Tax-Smart Allocation",
  directAnswer:
    "Portfolio rebalancing restores your target asset allocation (e.g., 60% Equity, 30% Debt, 10% Gold) after market movements cause allocation drift. Using 'Cash Flow First' rebalancing directs new investments purely into underweight assets, restoring your target weights without selling assets and triggering capital gains tax.",
  keywords: [
    "portfolio rebalancing calculator",
    "asset allocation drift calculator",
    "tax efficient rebalancing india",
    "mutual fund portfolio rebalance",
    "equity debt rebalance calculator",
  ],
  formula: {
    expression: "Asset Drift % = Current Allocation % - Target Allocation %",
    variables: [
      { symbol: "Current%", label: "Current Weight", description: "(Asset Amount / Total Portfolio) × 100" },
      { symbol: "Target%", label: "Target Weight", description: "Desired strategic asset allocation percentage" },
      { symbol: "Drift%", label: "Allocation Drift", description: "Deviation triggering rebalancing if > tolerance (e.g. 5%)" },
    ],
    steps: [
      {
        label: "Calculate Portfolio Total & Asset Weights",
        expression: "Current% = (Holding / Total Portfolio) × 100",
        explanation: "Determine the exact percentage of your current wealth in each asset class.",
      },
      {
        label: "Measure Asset Drift against Target",
        expression: "Drift = Current% - Target%",
        explanation: "Flag asset classes that have drifted beyond your tolerance threshold (e.g. ±5%).",
      },
      {
        label: "Calculate Rebalancing Transactions",
        expression: "Cash Flow Mode: Shortfall = Target Amount - Current Holding",
        explanation: "Allocate fresh incoming funds preferentially to underweight classes to avoid selling.",
      },
    ],
  },
  faqs: [
    {
      question: "Why is portfolio rebalancing important?",
      answer:
        "During equity bull markets, your stock allocation may balloon from 60% to 75%, exposing you to far more downside risk than your financial plan intended. Rebalancing locks in gains and enforces the discipline of buying low and selling high.",
    },
    {
      question: "What is Cash Flow / Tax-Smart Rebalancing?",
      answer:
        "Instead of selling equity to buy debt (which triggers 12.5% LTCG or 20% STCG tax under Budget 2024), you direct your monthly SIPs, annual bonuses, or dividend cash flows into the underweight asset class. This realigns your portfolio without incurring a single rupee in taxes.",
    },
    {
      question: "How often should I rebalance my portfolio in India?",
      answer:
        "Financial planners recommend rebalancing either annually (calendar-based) or whenever an asset class drifts by more than 5% from its target allocation (threshold-based), whichever occurs first.",
    },
  ],
  sources: [
    {
      name: "SEBI Investor Education - Asset Allocation Principles",
      url: "https://investor.sebi.gov.in",
    },
  ],
  version: {
    version: "1.0.0",
    effectiveFrom: "2024-01-01",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release of Portfolio Rebalancing engine with Cash-Flow-First tax efficiency.",
  },
};

export const portfolioRebalanceEngine: CalculatorEngine<
  PortfolioRebalanceInput,
  PortfolioRebalanceResult
> = {
  id: "portfolio-rebalance-calculator",
  metadata: portfolioRebalanceMetadata,
  schema: portfolioRebalanceSchema as unknown as z.ZodType<PortfolioRebalanceInput>,
  defaultInputs: defaultPortfolioRebalanceInputs,
  fields: portfolioRebalanceFields,
  calculate: calculatePortfolioRebalance,
};

registerCalculator(portfolioRebalanceEngine);
