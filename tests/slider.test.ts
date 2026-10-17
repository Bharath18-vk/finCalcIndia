import { describe, it, expect } from "vitest";
import {
  calculateSliderPercentage,
  getSliderBackgroundStyle,
} from "@/lib/formatters";

describe("Slider Progress & Gradient Utilities", () => {
  describe("calculateSliderPercentage", () => {
    it("returns 0% when value equals min", () => {
      expect(calculateSliderPercentage(18, 18, 75)).toBe(0);
      expect(calculateSliderPercentage(0, 0, 100)).toBe(0);
    });

    it("returns 100% when value equals max", () => {
      expect(calculateSliderPercentage(75, 18, 75)).toBe(100);
      expect(calculateSliderPercentage(100, 0, 100)).toBe(100);
    });

    it("calculates exact midpoint percentage", () => {
      expect(calculateSliderPercentage(50, 0, 100)).toBe(50);
      // Range 18 to 75 has delta 57. Midpoint = 18 + 28.5 = 46.5
      expect(calculateSliderPercentage(46.5, 18, 75)).toBeCloseTo(50, 5);
    });

    it("clamps values below min to 0%", () => {
      expect(calculateSliderPercentage(10, 18, 75)).toBe(0);
      expect(calculateSliderPercentage(-50, 0, 100)).toBe(0);
    });

    it("clamps values above max to 100%", () => {
      expect(calculateSliderPercentage(85, 18, 75)).toBe(100);
      expect(calculateSliderPercentage(150, 0, 100)).toBe(100);
    });

    it("safely handles edge case when max <= min (prevents divide-by-zero/NaN)", () => {
      expect(calculateSliderPercentage(50, 50, 50)).toBe(0);
      expect(calculateSliderPercentage(60, 100, 50)).toBe(0);
    });

    it("safely handles NaN, Infinity or non-numeric inputs", () => {
      expect(calculateSliderPercentage(NaN, 18, 75)).toBe(0);
      expect(calculateSliderPercentage(Infinity, 18, 75)).toBe(0);
      expect(calculateSliderPercentage(-Infinity, 18, 75)).toBe(0);
    });
  });

  describe("getSliderBackgroundStyle", () => {
    it("produces a valid linear gradient with emerald fill and slate track", () => {
      const style = getSliderBackgroundStyle(50, 0, 100);
      expect(style.background).toBe(
        "linear-gradient(to right, #059669 0%, #059669 50%, #e2e8f0 50%, #e2e8f0 100%)"
      );
    });

    it("produces full slate track when slider is at minimum", () => {
      const style = getSliderBackgroundStyle(18, 18, 75);
      expect(style.background).toBe(
        "linear-gradient(to right, #059669 0%, #059669 0%, #e2e8f0 0%, #e2e8f0 100%)"
      );
    });

    it("produces full emerald track when slider is at maximum", () => {
      const style = getSliderBackgroundStyle(75, 18, 75);
      expect(style.background).toBe(
        "linear-gradient(to right, #059669 0%, #059669 100%, #e2e8f0 100%, #e2e8f0 100%)"
      );
    });

    it("supports custom theme colors", () => {
      const style = getSliderBackgroundStyle(25, 0, 100, "#2563eb", "#f1f5f9");
      expect(style.background).toBe(
        "linear-gradient(to right, #2563eb 0%, #2563eb 25%, #f1f5f9 25%, #f1f5f9 100%)"
      );
    });
  });
});
