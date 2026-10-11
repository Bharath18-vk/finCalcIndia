import { describe, it, expect } from "vitest";
import {
  calculateDualExemption,
  dualExemptionSchema,
  dualExemptionEngine,
  defaultDualExemptionInputs,
} from "@/lib/calculators/dual-exemption";

describe("Dual Tax Exemption Optimizer Engine (HRA + Home Loan)", () => {
  it("registers in the central calculator registry", () => {
    expect(dualExemptionEngine.id).toBe("dual-exemption-calculator");
    expect(dualExemptionEngine.metadata.route).toBe("/dual-exemption-calculator");
    expect(dualExemptionEngine.metadata.category).toBe("finance");
  });

  it("calculates simultaneous HRA and Section 24(b) for different cities", () => {
    // Basic ₹80k/mo, HRA ₹35k/mo, Rent ₹30k/mo in Metro (50% rule)
    // Interest ₹2.4L (capped at ₹2L for self-occupied Sec 24b)
    // 80C principal ₹1.2L (within remaining 80C after ₹50k existing = ₹1L allowed)
    const res = calculateDualExemption(defaultDualExemptionInputs);

    // HRA Rule 2A:
    // 1) Actual = ₹35,000 * 12 = ₹4,20,000
    // 2) 50% Basic = 0.5 * ₹9,60,000 = ₹4,80,000
    // 3) Rent - 10% Basic = ₹3,60,000 - ₹96,000 = ₹2,64,000
    // Least is ₹2,64,000
    expect(res.hraExemptionAnnual).toBe(264000);
    expect(res.allowableInterestSec24b).toBe(200000);
    expect(res.allowablePrincipalSec80C).toBe(100000); // 1.5L - 50k
    expect(res.totalTaxDeductionsClaimed).toBe(264000 + 200000 + 100000);
    expect(res.taxSavedOldRegime).toBeGreaterThan(150000);
    expect(res.scenarioNote).toContain("Legally Fully Allowed");
  });

  it("handles let-out property scenario with 30% standard deduction and ₹2L loss cap", () => {
    const res = calculateDualExemption({
      ...defaultDualExemptionInputs,
      scenario: "let_out_owned",
      rentalIncomeReceivedAnnual: 300000, // ₹3 Lakh rent received
      annualHomeLoanInterest: 400000, // ₹4 Lakh interest
    });

    // Net rental income = ₹3L - 30% (₹90k) = ₹2,10,000
    // Loss = ₹2,10,000 - ₹4,00,000 = -₹1,90,000
    // Allowable set off against salary is capped at ₹2L -> ₹1,90,000 is fully allowed!
    expect(res.allowableInterestSec24b).toBe(190000);
    expect(res.hraExemptionAnnual).toBe(264000);
    expect(res.scenarioNote).toContain("Rental Declaration");
  });

  it("handles under-construction scenario by disallowing current Sec 24b deduction", () => {
    const res = calculateDualExemption({
      ...defaultDualExemptionInputs,
      scenario: "under_construction",
    });

    expect(res.hraExemptionAnnual).toBe(264000);
    expect(res.allowableInterestSec24b).toBe(0);
    expect(res.allowablePrincipalSec80C).toBe(0);
    expect(res.scenarioNote).toContain("Under-Construction Restriction");
  });

  it("validates inputs with Zod schema", () => {
    const valid = dualExemptionSchema.safeParse(defaultDualExemptionInputs);
    expect(valid.success).toBe(true);

    const invalid = dualExemptionSchema.safeParse({
      ...defaultDualExemptionInputs,
      basicSalaryMonthly: -5000,
    });
    expect(invalid.success).toBe(false);
  });
});
