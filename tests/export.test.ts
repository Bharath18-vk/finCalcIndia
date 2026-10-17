import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  escapeCsvValue,
  exportToCsv,
  exportAmortizationToCsv,
  downloadCsv,
  triggerPrintReport,
} from "@/lib/export";
import { AmortizationPeriod } from "@/lib/calculators/emi";

describe("Export Utilities", () => {
  describe("escapeCsvValue", () => {
    it("handles null and undefined", () => {
      expect(escapeCsvValue(null)).toBe('""');
      expect(escapeCsvValue(undefined)).toBe('""');
    });

    it("leaves standard text and numbers untouched", () => {
      expect(escapeCsvValue("Loan")).toBe("Loan");
      expect(escapeCsvValue(12345)).toBe("12345");
      expect(escapeCsvValue(0)).toBe("0");
    });

    it("escapes strings with commas, quotes, and newlines", () => {
      expect(escapeCsvValue("Loan, Auto")).toBe('"Loan, Auto"');
      expect(escapeCsvValue('Option "A"')).toBe('"Option ""A"""');
      expect(escapeCsvValue("Line1\nLine2")).toBe('"Line1\nLine2"');
    });
  });

  describe("CSV Generation and Download", () => {
    let createdBlob: Blob | null = null;
    let clickedAnchor = false;
    const originalDocument = (globalThis as any).document;
    const originalWindow = (globalThis as any).window;

    beforeEach(() => {
      createdBlob = null;
      clickedAnchor = false;

      // Mock URL.createObjectURL and revokeObjectURL
      globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
        createdBlob = blob;
        return "blob:mock-url";
      });
      globalThis.URL.revokeObjectURL = vi.fn();

      // Mock window and document on globalThis
      (globalThis as any).window = {
        print: vi.fn(),
      };

      (globalThis as any).document = {
        createElement: vi.fn((tag: string) => {
          if (tag === "a") {
            return {
              href: "",
              download: "",
              click: () => {
                clickedAnchor = true;
              },
            };
          }
          return {};
        }),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };
    });

    afterEach(() => {
      (globalThis as any).document = originalDocument;
      (globalThis as any).window = originalWindow;
    });

    it("triggers CSV download with UTF-8 BOM", () => {
      downloadCsv("test.csv", "Col1,Col2\r\nVal1,Val2");
      expect(clickedAnchor).toBe(true);
      expect(createdBlob).not.toBeNull();
      expect(createdBlob?.type).toBe("text/csv;charset=utf-8;");
    });

    it("exports generic schedule with metadata block", () => {
      exportToCsv({
        filename: "report.csv",
        title: "Test Report",
        metadata: [{ label: "Principal", value: "₹50,000" }],
        headers: ["Year", "Amount"],
        rows: [["Year 1", 50000]],
      });

      expect(clickedAnchor).toBe(true);
      expect(createdBlob).not.toBeNull();
    });

    it("exports amortization schedule correctly", () => {
      const mockSchedule: AmortizationPeriod[] = [
        {
          period: 1,
          openingBalance: 100000,
          principalPaid: 10000,
          interestPaid: 5000,
          totalPayment: 15000,
          closingBalance: 90000,
        },
      ];

      exportAmortizationToCsv({
        schedule: mockSchedule,
        viewMode: "yearly",
        metadata: [{ label: "Rate", value: "8.5%" }],
      });

      expect(clickedAnchor).toBe(true);
    });

    it("triggers window.print cleanly", () => {
      triggerPrintReport();
      expect((globalThis as any).window.print).toHaveBeenCalled();
    });
  });
});
