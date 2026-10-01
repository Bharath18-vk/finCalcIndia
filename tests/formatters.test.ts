import { describe, it, expect } from "vitest";
import {
  formatINR,
  formatCompactINR,
  formatIndianWords,
  formatPercentage,
  formatTenureYears,
  parseCleanNumber,
} from "@/lib/formatters";

describe("Indian Currency & Financial Formatters", () => {
  describe("formatINR", () => {
    it("formats 1 Lakh with Indian comma grouping (₹1,00,000)", () => {
      // Reference check: Indian system groups first 3 digits, then sets of 2
      expect(formatINR(100000)).toBe("₹1,00,000");
    });

    it("formats 1 Crore with Indian comma grouping (₹1,00,00,000)", () => {
      expect(formatINR(10000000)).toBe("₹1,00,00,000");
    });

    it("formats 50 Lakh (₹50,00,000)", () => {
      expect(formatINR(5000000)).toBe("₹50,00,000");
    });

    it("supports suppressing the currency symbol when requested", () => {
      expect(formatINR(500000, { includeSymbol: false })).toBe("5,00,000");
    });

    it("handles zero gracefully", () => {
      expect(formatINR(0)).toBe("₹0");
      expect(formatINR(0, { includeSymbol: false })).toBe("0");
    });

    it("handles negative numbers safely with prefix", () => {
      expect(formatINR(-50000)).toBe("-₹50,000");
    });

    it("handles invalid, null, undefined and NaN inputs safely without throwing", () => {
      expect(formatINR(NaN)).toBe("₹0");
      expect(formatINR(null)).toBe("₹0");
      expect(formatINR(undefined)).toBe("₹0");
      expect(formatINR(Infinity)).toBe("₹0");
      expect(formatINR("not-a-number")).toBe("₹0");
    });
  });

  describe("formatCompactINR", () => {
    it("formats amounts in Crores shorthand", () => {
      expect(formatCompactINR(10000000)).toBe("₹1 Cr");
      expect(formatCompactINR(15000000)).toBe("₹1.5 Cr");
      expect(formatCompactINR(25000000)).toBe("₹2.5 Cr");
    });

    it("formats amounts in Lakhs shorthand", () => {
      expect(formatCompactINR(100000)).toBe("₹1 L");
      expect(formatCompactINR(5000000)).toBe("₹50 L");
      expect(formatCompactINR(750000)).toBe("₹7.5 L");
    });

    it("formats amounts in Thousands shorthand", () => {
      expect(formatCompactINR(75000)).toBe("₹75 K");
      expect(formatCompactINR(5000)).toBe("₹5 K");
    });

    it("formats smaller amounts directly", () => {
      expect(formatCompactINR(500)).toBe("₹500");
    });

    it("handles zero and invalid inputs safely", () => {
      expect(formatCompactINR(0)).toBe("₹0");
      expect(formatCompactINR(NaN)).toBe("₹0");
    });
  });

  describe("formatIndianWords", () => {
    it("converts Lakhs and Crores to descriptive words", () => {
      expect(formatIndianWords(5000000)).toBe("50 Lakhs");
      expect(formatIndianWords(10000000)).toBe("1 Crore");
      expect(formatIndianWords(12500000)).toBe("1.25 Crores");
      expect(formatIndianWords(50000)).toBe("50 Thousand");
      expect(formatIndianWords(0)).toBe("Zero");
      expect(formatIndianWords(NaN)).toBe("Zero");
    });
  });

  describe("formatPercentage", () => {
    it("formats decimals and whole numbers cleanly", () => {
      expect(formatPercentage(8.5)).toBe("8.5%");
      expect(formatPercentage(12)).toBe("12%");
      expect(formatPercentage(8.75)).toBe("8.75%");
      expect(formatPercentage(0)).toBe("0%");
      expect(formatPercentage(NaN)).toBe("0%");
    });
  });

  describe("formatTenureYears", () => {
    it("formats years and months nicely", () => {
      expect(formatTenureYears(20, 0)).toBe("20 Years (240 Months)");
      expect(formatTenureYears(1, 0)).toBe("1 Year (12 Months)");
      expect(formatTenureYears(2, 6)).toBe("2 Years 6 Months");
      expect(formatTenureYears(0, 8)).toBe("8 Months");
    });
  });

  describe("parseCleanNumber", () => {
    it("cleans currency symbols, commas, and whitespace", () => {
      expect(parseCleanNumber("₹1,00,000")).toBe(100000);
      expect(parseCleanNumber(" 50,00,000 ")).toBe(5000000);
      expect(parseCleanNumber(12500)).toBe(12500);
      expect(parseCleanNumber("")).toBe(0);
      expect(parseCleanNumber("abc")).toBe(0);
      expect(parseCleanNumber(null)).toBe(0);
      expect(parseCleanNumber(undefined)).toBe(0);
    });
  });
});
