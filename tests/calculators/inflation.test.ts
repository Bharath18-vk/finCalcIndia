import { describe, it, expect } from "vitest";
import {
  calculateInflation,
  inflationInputSchema,
  inflationEngine,
  CII_TABLE,
} from "@/lib/calculators/inflation";
import { getCalculatorById } from "@/lib/calculators/registry";

describe("Inflation Calculator Engine (Batch 4)", () => {
  // Case 1: Golden Fixture (₹1,00,000 at 6% for 15 years)
  it("calculates standard 6% inflation over 15 years accurately", () => {
    const result = calculateInflation({
      currentAmount: 100000,
      inflationRate: 6.0,
      timeHorizonYears: 15,
    });

    // 100,000 * (1.06)^15 = 239,655.8 -> 239656
    expect(result.futureCost).toBe(239656);
    // Purchasing power = 100,000 / (1.06)^15 = 41,726.5 -> 41727
    expect(result.purchasingPower).toBe(41727);
    expect(result.effectiveMultiplier).toBe(2.4);
    expect(result.annualSchedule.length).toBe(15);
    expect(result.milestones.length).toBeGreaterThan(0);
  });

  // Case 2: Zero Inflation Case (0% rate)
  it("handles 0% inflation rate without value degradation", () => {
    const result = calculateInflation({
      currentAmount: 50000,
      inflationRate: 0,
      timeHorizonYears: 10,
    });

    expect(result.futureCost).toBe(50000);
    expect(result.purchasingPower).toBe(50000);
    expect(result.purchasingPowerLossPercent).toBe(0);
    expect(result.effectiveMultiplier).toBe(1);
  });

  // Case 3: Boundary Case (1 year minimum and 50 years maximum)
  it("handles 1 year minimum and 50 years long-term projection boundaries", () => {
    const minResult = calculateInflation({
      currentAmount: 10000,
      inflationRate: 5.0,
      timeHorizonYears: 1,
    });
    expect(minResult.futureCost).toBe(10500);
    expect(minResult.annualSchedule.length).toBe(1);

    const maxResult = calculateInflation({
      currentAmount: 10000,
      inflationRate: 5.0,
      timeHorizonYears: 50,
    });
    expect(maxResult.futureCost).toBeGreaterThan(100000);
    expect(maxResult.annualSchedule.length).toBe(50);
  });

  // Case 4: Decimal Inflation Case (e.g. 7.25% retail inflation)
  it("handles fractional/decimal inflation rates with mathematical precision", () => {
    const result = calculateInflation({
      currentAmount: 200000,
      inflationRate: 7.25,
      timeHorizonYears: 5,
    });

    // 200,000 * (1.0725)^5 = 283,802.7 -> 283803
    expect(result.futureCost).toBe(283803);
    expect(result.purchasingPowerLossPercent).toBeGreaterThan(25);
  });

  // Case 5: Cost Inflation Index (CII) Capital Gains Mode
  it("calculates statutory CBDT Cost Inflation Index (CII) indexation accurately", () => {
    const result = calculateInflation({
      currentAmount: 5000000, // ₹50 Lakhs property bought in 2001-02
      inflationRate: 6.0,
      timeHorizonYears: 23,
      purchaseYear: "2001-02",
      saleYear: "2024-25",
    });

    expect(result.ciiResult).toBeDefined();
    expect(result.ciiResult?.purchaseCii).toBe(100);
    expect(result.ciiResult?.saleCii).toBe(363);
    // Indexed cost = 5,000,000 * 363 / 100 = 18,150,000
    expect(result.ciiResult?.indexedCost).toBe(18150000);
    expect(result.ciiResult?.taxExemptInflationGains).toBe(13150000);
  });

  // Case 6: Invalid Input Schema Validation
  it("rejects negative numbers and extreme inputs via Zod schema", () => {
    const negativeCost = inflationInputSchema.safeParse({
      currentAmount: -1000,
      inflationRate: 6.0,
      timeHorizonYears: 10,
    });
    expect(negativeCost.success).toBe(false);

    const excessiveRate = inflationInputSchema.safeParse({
      currentAmount: 10000,
      inflationRate: 45, // exceeds 30% max
      timeHorizonYears: 10,
    });
    expect(excessiveRate.success).toBe(false);

    const excessiveYears = inflationInputSchema.safeParse({
      currentAmount: 10000,
      inflationRate: 6.0,
      timeHorizonYears: 65, // exceeds 50 max
    });
    expect(excessiveYears.success).toBe(false);
  });

  // Case 7: Central Registry Contract Compliance
  it("is registered with valid metadata in the central calculator registry", () => {
    const registered = getCalculatorById("inflation");
    expect(registered).toBeDefined();
    expect(registered?.metadata.name).toBe("Inflation Calculator India");
    expect(registered?.metadata.route).toBe("/inflation-calculator");
    expect(registered?.metadata.category).toBe("finance");
    expect(registered?.metadata.badge).toBe("CPI & CII Indexation");
    expect(registered?.metadata.directAnswer).toContain("inflation");
    expect(registered?.metadata.formula?.steps?.length).toBeGreaterThan(0);
    expect(registered?.metadata.faqs.length).toBeGreaterThan(0);
  });
});
