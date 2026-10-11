import { describe, it, expect } from "vitest";
import {
  calculateSsy,
  ssyEngine,
  ssyInputSchema,
} from "@/lib/calculators/ssy";
import { getCalculatorById } from "@/lib/calculators/registry";
import { validateCalculatorInput } from "@/lib/validation/validator";

describe("Sukanya Samriddhi Yojana (SSY) Calculator Engine & Contract (Phase A Batch 3)", () => {
  describe("1. Normal Cases & Golden Fixtures", () => {
    it("computes 21-year maturity corpus for golden fixture (₹1,50,000/yr @ 8.2% p.a.)", () => {
      const result = calculateSsy({
        yearlyDeposit: 150000,
        interestRate: 8.2,
        startYear: 2026,
        girlChildAge: 1,
      });

      expect(result.yearlyDeposit).toBe(150000);
      expect(result.depositTenureYears).toBe(15);
      expect(result.maturityTenureYears).toBe(21);
      expect(result.totalDeposit).toBe(2250000); // 15 * 150000
      expect(result.maturityYear).toBe(2047);

      // Verify maturity corpus is within expected mathematical compound range (~ ₹71.8 Lakhs)
      expect(result.maturityAmount).toBe(7182119);
      expect(result.totalInterest).toBe(result.maturityAmount - result.totalDeposit);

      // Verify schedule properties
      expect(result.schedule).toHaveLength(21);
      expect(result.schedule[0].deposit).toBe(150000);
      expect(result.schedule[14].deposit).toBe(150000); // Year 15
      expect(result.schedule[15].deposit).toBe(0); // Year 16 has zero deposit
      expect(result.schedule[20].deposit).toBe(0); // Year 21 has zero deposit
    });
  });

  describe("2. Minimum Statutory Deposit Cases", () => {
    it("computes accurately for minimum permitted deposit of ₹250/year", () => {
      const result = calculateSsy({
        yearlyDeposit: 250,
        interestRate: 8.2,
        startYear: 2026,
        girlChildAge: 0,
      });

      expect(result.totalDeposit).toBe(3750); // 250 * 15
      expect(result.maturityAmount).toBeGreaterThan(11000);
      expect(result.maturityAmount).toBeLessThan(12500);
    });
  });

  describe("3. Boundary Cases & Deposit Rules", () => {
    it("strictly verifies deposit ceases after year 15 in schedule", () => {
      const result = calculateSsy({
        yearlyDeposit: 50000,
        interestRate: 8.2,
        startYear: 2026,
      });

      for (let i = 0; i < 21; i++) {
        if (i < 15) {
          expect(result.schedule[i].deposit).toBe(50000);
        } else {
          expect(result.schedule[i].deposit).toBe(0);
          // Balance in non-deposit years still grows due to interest
          expect(result.schedule[i].closingBalance).toBeGreaterThan(
            result.schedule[i].openingBalance
          );
        }
      }
    });

    it("tracks girl child age from maximum entry age of 10 years to 31 years", () => {
      const result = calculateSsy({
        yearlyDeposit: 10000,
        girlChildAge: 10,
        startYear: 2026,
      });

      expect(result.schedule[0].girlAge).toBe(10);
      expect(result.schedule[20].girlAge).toBe(30);
    });
  });

  describe("4. Decimal Interest Rate Sensitivity Cases", () => {
    it("handles varied notified government rates (e.g. 8.0% vs 8.4%)", () => {
      const result80 = calculateSsy({ yearlyDeposit: 100000, interestRate: 8.0 });
      const result84 = calculateSsy({ yearlyDeposit: 100000, interestRate: 8.4 });

      expect(result84.maturityAmount).toBeGreaterThan(result80.maturityAmount);
    });
  });

  describe("5. Invalid Input & Schema Validation Cases", () => {
    it("fails validation when deposit is below statutory minimum of ₹250", () => {
      const validation = validateCalculatorInput(ssyInputSchema, {
        yearlyDeposit: 200,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.yearlyDeposit).toBe("Minimum yearly deposit in SSY is ₹250");
    });

    it("fails validation when deposit exceeds Section 80C cap of ₹1,50,000", () => {
      const validation = validateCalculatorInput(ssyInputSchema, {
        yearlyDeposit: 200000,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.yearlyDeposit).toBe(
        "Maximum yearly deposit in SSY is ₹1,50,000 per financial year"
      );
    });

    it("fails validation when girl child age exceeds 10 years", () => {
      const validation = validateCalculatorInput(ssyInputSchema, {
        yearlyDeposit: 50000,
        girlChildAge: 11,
      });

      expect(validation.success).toBe(false);
      expect(validation.errors?.girlChildAge).toBe(
        "Girl child must be 10 years or younger to open an SSY account"
      );
    });
  });

  describe("6. Large-Value / Maximum Contribution Cases", () => {
    it("processes maximum ₹1,50,000 contribution flawlessly across full 21 years", () => {
      const result = calculateSsy({
        yearlyDeposit: 150000,
        interestRate: 8.2,
      });

      expect(result.totalDeposit).toBe(2250000);
      expect(result.schedule[20].cumulativeDeposit).toBe(2250000);
      expect(result.totalInterest).toBeGreaterThan(4500000);
    });
  });

  describe("7. Registry & Engine Contract Compliance", () => {
    it("is registered in the central registry under ID 'ssy'", () => {
      const registered = getCalculatorById("ssy");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("ssy");
      expect(registered?.metadata.name).toBe("Sukanya Samriddhi Yojana (SSY) Calculator");
      expect(registered?.metadata.category).toBe("finance");
      expect(registered?.metadata.route).toBe("/ssy-calculator");
    });

    it("conforms to formatResult output model", () => {
      const raw = ssyEngine.calculate(ssyEngine.defaultInputs);
      const formatted = ssyEngine.formatResult!(raw, ssyEngine.defaultInputs);

      expect(formatted.primary.label).toBe("Maturity Corpus (After 21 Years)");
      expect(formatted.primary.value).toBe(raw.maturityAmount);
      expect(formatted.secondary?.length).toBeGreaterThanOrEqual(4);
    });
  });
});
