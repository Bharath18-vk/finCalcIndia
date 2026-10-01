import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackCalculatorUsed,
  trackCalculatorResultGenerated,
  trackRelatedCalculatorClicked,
} from "@/lib/analytics";

describe("Analytics Module Verification", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("safely handles tracking calls when window.gtag is not defined", () => {
    // Should not throw
    expect(() => trackCalculatorUsed("emi", "loanAmount")).not.toThrow();
    expect(() => trackCalculatorResultGenerated("emi")).not.toThrow();
    expect(() => trackRelatedCalculatorClicked("emi", "sip")).not.toThrow();
  });

  it("correctly calls window.gtag with calculator_used and no financial amounts", () => {
    const gtagMock = vi.fn();
    (global as unknown as { window: { gtag: typeof gtagMock } }).window = { gtag: gtagMock };

    trackCalculatorUsed("home-loan-emi", "interestRate");

    expect(gtagMock).toHaveBeenCalledWith("event", "calculator_used", {
      calculator_id: "home-loan-emi",
      field_modified: "interestRate",
    });

    // Ensure no monetary values are passed
    const callArgs = gtagMock.mock.calls[0][2];
    expect(callArgs).not.toHaveProperty("amount");
    expect(callArgs).not.toHaveProperty("value");
    expect(callArgs).not.toHaveProperty("roi");
  });

  it("correctly calls window.gtag with calculator_result_generated", () => {
    const gtagMock = vi.fn();
    (global as unknown as { window: { gtag: typeof gtagMock } }).window = { gtag: gtagMock };

    trackCalculatorResultGenerated("sip");

    expect(gtagMock).toHaveBeenCalledWith("event", "calculator_result_generated", {
      calculator_id: "sip",
      timestamp: expect.any(Number),
    });
  });

  it("correctly calls window.gtag with related_calculator_clicked", () => {
    const gtagMock = vi.fn();
    (global as unknown as { window: { gtag: typeof gtagMock } }).window = { gtag: gtagMock };

    trackRelatedCalculatorClicked("sip", "step-up-sip");

    expect(gtagMock).toHaveBeenCalledWith("event", "related_calculator_clicked", {
      from_calculator: "sip",
      to_calculator: "step-up-sip",
    });
  });

  it("verifies NEXT_PUBLIC_GA_MEASUREMENT_ID format when provided", () => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId) {
      expect(gaId).toMatch(/^G-[A-Z0-9]+$/);
    }
  });

  it("verifies that layout.tsx includes the GA4 tag implementation", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const layoutContent = fs.readFileSync(
      path.resolve(__dirname, "../src/app/layout.tsx"),
      "utf-8"
    );

    expect(layoutContent).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");
    expect(layoutContent).toContain("googletagmanager.com/gtag/js?id=");
    expect(layoutContent).toContain("window.dataLayer = window.dataLayer || [];");
    expect(layoutContent).toContain("gtag('config'");
  });
});
