import { describe, it, expect } from "vitest";
import {
  calculateDiscount,
  discountEngine,
  discountInputSchema,
} from "@/lib/calculators/discount";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Discount Calculator Engine & Contract (Phase A)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes 20% discount on ₹2,000 without tax (Golden Fixture)", () => {
      const result = calculateDiscount({
        originalPrice: 2000,
        discountPercent: 20,
        taxPercent: 0,
      });

      expect(result.originalPrice).toBe(2000);
      expect(result.discountPercent).toBe(20);
      expect(result.discountAmount).toBe(400);
      expect(result.discountedPrice).toBe(1600);
      expect(result.taxAmount).toBe(0);
      expect(result.finalPrice).toBe(1600);
      expect(result.totalSavings).toBe(400);
      expect(result.effectiveDiscountRate).toBe(20);
    });

    it("computes 25% discount on ₹4,000 with 18% GST on net amount", () => {
      const result = calculateDiscount({
        originalPrice: 4000,
        discountPercent: 25,
        taxPercent: 18,
      });

      // 4000 * 0.25 = 1000 discount => net 3000
      expect(result.discountAmount).toBe(1000);
      expect(result.discountedPrice).toBe(3000);
      // 3000 * 0.18 = 540 GST => final 3540
      expect(result.taxAmount).toBe(540);
      expect(result.finalPrice).toBe(3540);
      expect(result.totalSavings).toBe(1000);
    });
  });

  describe("2. Zero Cases", () => {
    it("handles zero price correctly", () => {
      const result = calculateDiscount({
        originalPrice: 0,
        discountPercent: 20,
        taxPercent: 18,
      });

      expect(result.originalPrice).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.discountedPrice).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.finalPrice).toBe(0);
      expect(result.totalSavings).toBe(0);
      expect(result.effectiveDiscountRate).toBe(0);
    });

    it("handles zero discount correctly (full price retained)", () => {
      const result = calculateDiscount({
        originalPrice: 1500,
        discountPercent: 0,
        taxPercent: 0,
      });

      expect(result.discountAmount).toBe(0);
      expect(result.discountedPrice).toBe(1500);
      expect(result.finalPrice).toBe(1500);
      expect(result.totalSavings).toBe(0);
    });
  });

  describe("3. Boundary Cases", () => {
    it("handles 100% discount (free item)", () => {
      const result = calculateDiscount({
        originalPrice: 5000,
        discountPercent: 100,
        taxPercent: 18,
      });

      expect(result.discountAmount).toBe(5000);
      expect(result.discountedPrice).toBe(0);
      expect(result.taxAmount).toBe(0); // 0 tax on 0 net price
      expect(result.finalPrice).toBe(0);
      expect(result.totalSavings).toBe(5000);
      expect(result.effectiveDiscountRate).toBe(100);
    });

    it("handles 0.01% minimal discount", () => {
      const result = calculateDiscount({
        originalPrice: 100000,
        discountPercent: 0.01,
        taxPercent: 0,
      });

      // 100000 * 0.0001 = 10
      expect(result.discountAmount).toBe(10);
      expect(result.finalPrice).toBe(99990);
    });
  });

  describe("4. Decimal Rates & Fractional Prices", () => {
    it("computes fractional discount rates (12.5% off ₹1,499)", () => {
      const result = calculateDiscount({
        originalPrice: 1499,
        discountPercent: 12.5,
        taxPercent: 5,
      });

      // 1499 * 0.125 = 187.375 => round to 187
      expect(result.discountAmount).toBe(187);
      expect(result.discountedPrice).toBe(1312);
      // 1312 * 0.05 = 65.6 => round to 66
      expect(result.taxAmount).toBe(66);
      expect(result.finalPrice).toBe(1378);
    });
  });

  describe("5. Invalid Input & Schema Validation", () => {
    it("rejects negative original price", () => {
      const validation = validateCalculatorInput(discountInputSchema, {
        originalPrice: -100,
        discountPercent: 10,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.originalPrice).toContain("cannot be negative");
    });

    it("rejects discount exceeding 100%", () => {
      const validation = validateCalculatorInput(discountInputSchema, {
        originalPrice: 500,
        discountPercent: 150,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.discountPercent).toContain("cannot exceed 100%");
    });

    it("rejects negative tax rate", () => {
      const validation = validateCalculatorInput(discountInputSchema, {
        originalPrice: 500,
        discountPercent: 10,
        taxPercent: -5,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.taxPercent).toContain("cannot be negative");
    });
  });

  describe("6. Large-Value Cases", () => {
    it("computes discount on ₹10 Crore without numeric overflow", () => {
      const result = calculateDiscount({
        originalPrice: 100000000,
        discountPercent: 15,
        taxPercent: 12,
      });

      // 10 Cr * 15% = 1.5 Cr discount => net 8.5 Cr
      expect(result.discountAmount).toBe(15000000);
      expect(result.discountedPrice).toBe(85000000);
      // 8.5 Cr * 12% = 1.02 Cr tax => final 9.52 Cr
      expect(result.taxAmount).toBe(10200000);
      expect(result.finalPrice).toBe(95200000);
      expect(result.totalSavings).toBe(15000000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'discount'", () => {
      const registered = getCalculatorById("discount");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("discount");
      expect(registered?.metadata.name).toBe("Discount Calculator");
      expect(registered?.metadata.category).toBe("math");
      expect(registered?.metadata.route).toBe("/discount-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = discountEngine.calculate(discountEngine.defaultInputs);
      const formatted = discountEngine.formatResult!(raw, discountEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Final Price to Pay");
      expect(formatted.primary.formattedValue).toBe("₹1,600");
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
