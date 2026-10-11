import { describe, it, expect } from "vitest";
import { calculateGST, gstInputSchema, gstEngine } from "@/lib/calculators/gst";
import { getCalculatorById } from "@/lib/calculators/registry";

describe("GST Calculator Engine (Batch 4)", () => {
  // Case 1: Golden Fixture (Exclusive ₹10,000 at 18% intra-state)
  it("calculates standard 18% exclusive intra-state GST accurately", () => {
    const result = calculateGST({
      amount: 10000,
      taxType: "exclusive",
      gstRate: 18,
      supplyType: "intra-state",
      quantity: 1,
    });

    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.grossAmount).toBe(11800);
    expect(result.cgstAmount).toBe(900);
    expect(result.sgstAmount).toBe(900);
    expect(result.igstAmount).toBe(0);
    expect(result.perUnitNet).toBe(10000);
    expect(result.perUnitGross).toBe(11800);
  });

  // Case 1b: Golden Fixture (Inclusive ₹11,800 at 18% inter-state)
  it("reverse calculates 18% inclusive inter-state IGST accurately", () => {
    const result = calculateGST({
      amount: 11800,
      taxType: "inclusive",
      gstRate: 18,
      supplyType: "inter-state",
      quantity: 1,
    });

    expect(result.grossAmount).toBe(11800);
    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.igstAmount).toBe(1800);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
  });

  // Case 2: Zero Tax Case (0% GST slab)
  it("handles 0% exempt GST slab without error", () => {
    const result = calculateGST({
      amount: 5000,
      taxType: "exclusive",
      gstRate: 0,
      supplyType: "intra-state",
      quantity: 1,
    });

    expect(result.netAmount).toBe(5000);
    expect(result.gstAmount).toBe(0);
    expect(result.grossAmount).toBe(5000);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
  });

  // Case 3: Boundary Case (Special 0.25% diamond slab and 3% jewellery slab)
  it("calculates statutory 3% gold/jewellery and 0.25% diamond slabs", () => {
    const goldResult = calculateGST({
      amount: 100000,
      taxType: "exclusive",
      gstRate: 3,
      supplyType: "intra-state",
    });
    expect(goldResult.gstAmount).toBe(3000);
    expect(goldResult.grossAmount).toBe(103000);
    expect(goldResult.cgstAmount).toBe(1500);
    expect(goldResult.sgstAmount).toBe(1500);

    const diamondResult = calculateGST({
      amount: 100000,
      taxType: "exclusive",
      gstRate: 0.25,
      supplyType: "inter-state",
    });
    expect(diamondResult.gstAmount).toBe(250);
    expect(diamondResult.grossAmount).toBe(100250);
    expect(diamondResult.igstAmount).toBe(250);
  });

  // Case 4: Decimal and Quantity Case
  it("handles decimal prices and multi-unit quantities with precision", () => {
    const result = calculateGST({
      amount: 199.99,
      taxType: "exclusive",
      gstRate: 5,
      supplyType: "intra-state",
      quantity: 3,
    });

    // 199.99 * 3 = 599.97
    // GST = 599.97 * 0.05 = 29.9985 -> 30.00
    // Gross = 629.97
    expect(result.netAmount).toBe(599.97);
    expect(result.gstAmount).toBe(30);
    expect(result.grossAmount).toBe(629.97);
    expect(result.quantity).toBe(3);
    expect(result.perUnitNet).toBe(199.99);
  });

  // Case 5: Invalid Input Schema Validation
  it("validates inputs strictly via Zod schema", () => {
    const negativeAmount = gstInputSchema.safeParse({
      amount: -500,
      taxType: "exclusive",
      gstRate: 18,
    });
    expect(negativeAmount.success).toBe(false);

    const invalidTaxType = gstInputSchema.safeParse({
      amount: 1000,
      taxType: "invalid-type",
      gstRate: 18,
    });
    expect(invalidTaxType.success).toBe(false);

    const excessiveRate = gstInputSchema.safeParse({
      amount: 1000,
      taxType: "exclusive",
      gstRate: 150,
    });
    expect(excessiveRate.success).toBe(false);
  });

  // Case 6: Large Value Stress Case (₹50 Crores infrastructure invoice)
  it("handles large corporate invoice amounts up to ₹50 Crores without overflow", () => {
    const result = calculateGST({
      amount: 500000000,
      taxType: "exclusive",
      gstRate: 28,
      supplyType: "intra-state",
      quantity: 1,
    });

    expect(result.netAmount).toBe(500000000);
    expect(result.gstAmount).toBe(140000000);
    expect(result.grossAmount).toBe(640000000);
    expect(result.cgstAmount).toBe(70000000);
    expect(result.sgstAmount).toBe(70000000);
  });

  // Case 7: Central Registry Contract Compliance
  it("is registered with valid metadata in the central calculator registry", () => {
    const registered = getCalculatorById("gst");
    expect(registered).toBeDefined();
    expect(registered?.metadata.name).toBe("GST Calculator India");
    expect(registered?.metadata.route).toBe("/gst-calculator");
    expect(registered?.metadata.category).toBe("finance");
    expect(registered?.metadata.badge).toBe("CBIC Statutory Rates");
    expect(registered?.metadata.directAnswer).toContain("GST");
    expect(registered?.metadata.formula?.steps?.length).toBeGreaterThan(0);
    expect(registered?.metadata.faqs.length).toBeGreaterThan(0);
  });
});
