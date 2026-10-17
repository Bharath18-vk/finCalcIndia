/**
 * Client-Side Export Utilities for FinCalc India
 * Supports CSV/Excel data generation and print-optimized PDF triggers.
 */

import { AmortizationPeriod } from "./calculators/emi";

export interface MetadataField {
  label: string;
  value: string | number;
}

export interface ExportCsvOptions {
  filename: string;
  title: string;
  metadata?: MetadataField[];
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Escapes CSV field value according to RFC 4180
 */
export function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM for perfect Excel compatibility.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  if (typeof window === "undefined") return;

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 symbols (₹, %, etc.) properly
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Builds and downloads a standardized CSV file with metadata header banner.
 */
export function exportToCsv({
  filename,
  title,
  metadata = [],
  headers,
  rows,
}: ExportCsvOptions): void {
  const lines: string[] = [];

  // Header Title
  lines.push(escapeCsvValue(`FinCalc India - ${title}`));
  lines.push(escapeCsvValue(`Report Generated on: ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`));
  lines.push("");

  // Metadata block
  if (metadata.length > 0) {
    lines.push(escapeCsvValue("CALCULATION PARAMETERS"));
    metadata.forEach((m) => {
      lines.push(`${escapeCsvValue(m.label)},${escapeCsvValue(m.value)}`);
    });
    lines.push("");
  }

  // Column Headers
  lines.push(headers.map(escapeCsvValue).join(","));

  // Rows
  rows.forEach((row) => {
    lines.push(row.map(escapeCsvValue).join(","));
  });

  const csvContent = lines.join("\r\n");
  downloadCsv(filename, csvContent);
}

/**
 * Exports loan or investment amortization schedule to CSV.
 */
export interface AmortizationCsvOptions {
  filename?: string;
  title?: string;
  type?: "loan" | "investment";
  viewMode?: "yearly" | "monthly";
  schedule: AmortizationPeriod[];
  metadata?: MetadataField[];
}

export function exportAmortizationToCsv({
  filename = "amortization-schedule.csv",
  title = "Amortization & Repayment Schedule",
  type = "loan",
  viewMode = "yearly",
  schedule,
  metadata = [],
}: AmortizationCsvOptions): void {
  const isLoan = type === "loan";
  const periodLabel = viewMode === "yearly" ? "Year" : "Month";

  const headers = [
    periodLabel,
    "Opening Balance (INR)",
    isLoan ? "Principal Paid (INR)" : "Amount Invested (INR)",
    isLoan ? "Interest Paid (INR)" : "Interest Earned (INR)",
    isLoan ? "Total EMI Payment (INR)" : "Total Outflow (INR)",
    "Closing Balance (INR)",
  ];

  const rows = schedule.map((row) => [
    `${periodLabel} ${row.period}`,
    row.openingBalance,
    row.principalPaid,
    row.interestPaid,
    row.totalPayment,
    row.closingBalance,
  ]);

  exportToCsv({
    filename,
    title: `${title} (${viewMode.toUpperCase()})`,
    metadata,
    headers,
    rows,
  });
}

/**
 * Triggers browser print dialog for Save as PDF / Print report.
 */
export function triggerPrintReport(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
