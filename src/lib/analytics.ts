/**
 * Privacy-Conscious GA4-Ready Analytics
 *
 * CRITICAL RULE:
 * Never send loan amounts, investment values, salary, or financial inputs.
 * Only track calculator types, action events, and interaction categories.
 */

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "set",
      eventName: string,
      eventParams?: Record<string, unknown>
    ) => void;
  }
}

export type CalculatorId =
  | "emi"
  | "home-loan-emi"
  | "personal-loan-emi"
  | "car-loan-emi"
  | "sip"
  | "step-up-sip"
  | "lumpsum"
  | "fd"
  | "rd"
  | "ppf"
  | "cagr"
  | "compound-interest"
  | "prepayment"
  | "loan-eligibility"
  | "swp"
  | "amortization"
  | "income-tax"
  | "salary"
  | "hra"
  | "gratuity"
  | "nps"
  | "epf";

export function trackCalculatorUsed(calculatorId: CalculatorId, inputField: string): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "calculator_used", {
    calculator_id: calculatorId,
    field_modified: inputField,
    // Note: NEVER include input value or financial amount
  });
}

export function trackCalculatorResultGenerated(calculatorId: CalculatorId): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "calculator_result_generated", {
    calculator_id: calculatorId,
    timestamp: Date.now(),
  });
}

export function trackRelatedCalculatorClicked(
  sourceCalculator: string,
  targetCalculator: string
): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "related_calculator_clicked", {
    from_calculator: sourceCalculator,
    to_calculator: targetCalculator,
  });
}
