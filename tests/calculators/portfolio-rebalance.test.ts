import { describe, it, expect } from "vitest";
import {
  calculatePortfolioRebalance,
  portfolioRebalanceSchema,
  portfolioRebalanceEngine,
  defaultPortfolioRebalanceInputs,
} from "@/lib/calculators/portfolio-rebalance";

describe("Portfolio Rebalancing Calculator Engine", () => {
  it("registers in the central calculator registry", () => {
    expect(portfolioRebalanceEngine.id).toBe("portfolio-rebalance-calculator");
    expect(portfolioRebalanceEngine.metadata.route).toBe("/portfolio-rebalance-calculator");
    expect(portfolioRebalanceEngine.metadata.category).toBe("finance");
  });

  it("calculates allocation drift and recommends tax-smart cash flow rebalancing", () => {
    // Current: Equity ₹14L (70%), Debt ₹4L (20%), Gold ₹1L (5%), Cash ₹1L (5%) = Total ₹20L
    // Targets: Equity 60%, Debt 25%, Gold 10%, Cash 5%
    // Drift: Equity +10%, Debt -5%, Gold -5%, Cash 0% -> Max drift 10% (>5% tolerance)
    const res = calculatePortfolioRebalance(defaultPortfolioRebalanceInputs);

    expect(res.totalCurrentPortfolio).toBe(2000000);
    expect(res.isRebalanceRecommended).toBe(true);
    expect(res.maxDriftPercent).toBe(10);
    expect(res.strategy).toBe("cash_flow_first");
    // Under cash_flow_first, sells should be 0 to avoid tax friction!
    expect(res.totalToSell).toBe(0);
    expect(res.totalToBuy).toBeGreaterThan(0);
    expect(res.taxEfficiencyAdvice).toContain("Tax-Smart Advantage");
  });

  it("calculates classic full rebalance with buy & sell actions to exact targets", () => {
    const res = calculatePortfolioRebalance({
      ...defaultPortfolioRebalanceInputs,
      strategy: "full_rebalance",
      freshCapital: 0,
    });

    expect(res.totalToSell).toBeGreaterThan(0);
    expect(res.totalToBuy).toBeGreaterThan(0);
    // Total sold should match total bought when fresh capital is 0
    expect(Math.abs(res.totalToSell - res.totalToBuy)).toBeLessThanOrEqual(5);

    const equityRow = res.assets.find((a) => a.id === "equity");
    expect(equityRow?.action).toBe("SELL");
    expect(equityRow?.postPercent).toBe(60);

    const debtRow = res.assets.find((a) => a.id === "debt");
    expect(debtRow?.action).toBe("BUY");
    expect(debtRow?.postPercent).toBe(25);
  });

  it("identifies a balanced portfolio when drift is within tolerance", () => {
    const res = calculatePortfolioRebalance({
      equityCurrent: 600000,
      equityTargetPercent: 60,
      debtCurrent: 250000,
      debtTargetPercent: 25,
      goldCurrent: 100000,
      goldTargetPercent: 10,
      cashCurrent: 50000,
      cashTargetPercent: 5,
      driftTolerancePercent: 5,
      freshCapital: 0,
    });

    expect(res.maxDriftPercent).toBe(0);
    expect(res.isRebalanceRecommended).toBe(false);
  });

  it("validates that target percentages must sum to 100% with Zod", () => {
    const valid = portfolioRebalanceSchema.safeParse(defaultPortfolioRebalanceInputs);
    expect(valid.success).toBe(true);

    const invalid = portfolioRebalanceSchema.safeParse({
      ...defaultPortfolioRebalanceInputs,
      equityTargetPercent: 50, // 50 + 25 + 10 + 5 = 90% (not 100%)
    });
    expect(invalid.success).toBe(false);
  });
});
