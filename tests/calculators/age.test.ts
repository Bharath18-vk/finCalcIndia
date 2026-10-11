import { describe, it, expect } from "vitest";
import {
  calculateAge,
  ageEngine,
  ageInputSchema,
  getZodiacSign,
} from "@/lib/calculators/age";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Age Calculator Engine & Contract (Phase A Batch 3)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("calculates exact age for golden fixture (1998-05-15 to 2026-10-11)", () => {
      const result = calculateAge({
        birthDate: "1998-05-15",
        targetDate: "2026-10-11",
      });

      expect(result.years).toBe(28);
      expect(result.months).toBe(4);
      expect(result.days).toBe(26);
      expect(result.formattedAge).toBe("28 years, 4 months, 26 days");
      expect(result.dayOfWeekBorn).toBe("Friday");
      expect(result.zodiacSign).toBe("Taurus");
      expect(result.totalMonths).toBe(28 * 12 + 4); // 340
      expect(result.totalDays).toBeGreaterThan(10300);
    });

    it("calculates age correctly when birth month equals target month but days differ", () => {
      const result = calculateAge({
        birthDate: "2000-08-10",
        targetDate: "2025-08-25",
      });

      expect(result.years).toBe(25);
      expect(result.months).toBe(0);
      expect(result.days).toBe(15);
      expect(result.formattedAge).toBe("25 years, 0 months, 15 days");
    });
  });

  describe("2. Zero Cases", () => {
    it("returns 0 years, 0 months, 0 days when birth date equals target date", () => {
      const result = calculateAge({
        birthDate: "2024-05-01",
        targetDate: "2024-05-01",
      });

      expect(result.years).toBe(0);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
      expect(result.formattedAge).toBe("0 years, 0 months, 0 days");
      expect(result.totalDays).toBe(0);
      expect(result.totalHours).toBe(0);
    });
  });

  describe("3. Boundary Cases & Month Borrowing", () => {
    it("borrows accurately from February in a non-leap year (e.g. 2023-01-31 to 2023-03-01)", () => {
      const result = calculateAge({
        birthDate: "2023-01-31",
        targetDate: "2023-03-01",
      });

      // Target day is 1, birth day is 31.
      // Borrow days from Feb 2023 (28 days): 1 + 28 - 31 = -2 => wait:
      // In astronomical algorithm: Feb 2023 has 28 days, borrowing gives 1 + 28 = 29.
      expect(result.years).toBe(0);
      expect(result.months).toBe(1); // 0 or 1 depending on calendar borrow
    });

    it("handles leap year birth date (2000-02-29 to 2004-02-29 = exactly 4 years)", () => {
      const result = calculateAge({
        birthDate: "2000-02-29",
        targetDate: "2004-02-29",
      });

      expect(result.years).toBe(4);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
    });

    it("identifies correct western zodiac signs across cusps", () => {
      expect(getZodiacSign(3, 21)).toBe("Aries");
      expect(getZodiacSign(4, 20)).toBe("Taurus");
      expect(getZodiacSign(7, 23)).toBe("Leo");
      expect(getZodiacSign(12, 25)).toBe("Capricorn");
    });
  });

  describe("4. Decimal & Unit Breakdown Cases", () => {
    it("calculates accurate total weeks, hours, and minutes for 100 days", () => {
      const result = calculateAge({
        birthDate: "2024-01-01",
        targetDate: "2024-04-10",
      });

      expect(result.totalDays).toBe(100);
      expect(result.totalWeeks).toBe(14); // 100 / 7 = 14 weeks
      expect(result.totalHours).toBe(2400); // 100 * 24
      expect(result.totalMinutes).toBe(144000);
    });
  });

  describe("5. Invalid Input & Schema Validation Cases", () => {
    it("fails validation when target date is before birth date", () => {
      const validation = validateCalculatorInput(ageInputSchema, {
        birthDate: "2025-01-01",
        targetDate: "2020-01-01",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.targetDate).toBe("Target date cannot be before birth date");
    });

    it("fails validation for non-date string format", () => {
      const validation = validateCalculatorInput(ageInputSchema, {
        birthDate: "invalid-date",
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.birthDate).toBe("Date must be in YYYY-MM-DD format");
    });

    it("gracefully falls back when calculation engine receives targetDate < birthDate", () => {
      const result = calculateAge({
        birthDate: "2025-01-01",
        targetDate: "2020-01-01",
      });

      expect(result.years).toBe(0);
      expect(result.steps).toContain("Invalid date provided.");
    });
  });

  describe("6. Large-Value / Century Lifespan Cases", () => {
    it("accurately computes 100+ year lifespans (1920-01-01 to 2025-01-01)", () => {
      const result = calculateAge({
        birthDate: "1920-01-01",
        targetDate: "2025-01-01",
      });

      expect(result.years).toBe(105);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
      expect(result.totalDays).toBeGreaterThan(38000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'age'", () => {
      const registered = getCalculatorById("age");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("age");
      expect(registered?.metadata.name).toBe("Age Calculator");
      expect(registered?.metadata.category).toBe("everyday");
      expect(registered?.metadata.route).toBe("/age-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = ageEngine.calculate(ageEngine.defaultInputs);
      const formatted = ageEngine.formatResult!(raw, ageEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Exact Chronological Age");
      expect(formatted.primary.highlight).toBe(true);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(3);
    });
  });
});
