"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/formatters";
import { AmortizationPeriod } from "@/lib/calculators/emi";
import { exportAmortizationToCsv } from "@/lib/export";
import { ExportActions } from "@/components/ui/ExportActions";

export interface AmortizationTableProps {
  yearlySchedule: AmortizationPeriod[];
  monthlySchedule?: AmortizationPeriod[];
  title?: string;
  type?: "loan" | "investment";
  filename?: string;
  metadata?: { label: string; value: string | number }[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  yearlySchedule,
  monthlySchedule,
  title = "Amortization & Repayment Schedule",
  type = "loan",
  filename,
  metadata,
}) => {
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const [showAllYears, setShowAllYears] = useState(false);

  const isLoan = type === "loan";
  const displayedYearly = showAllYears ? yearlySchedule : yearlySchedule.slice(0, 10);

  const handleExportCsv = () => {
    const activeSchedule =
      viewMode === "monthly" && monthlySchedule && monthlySchedule.length > 0
        ? monthlySchedule
        : yearlySchedule;

    exportAmortizationToCsv({
      filename: filename || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`,
      title,
      type,
      viewMode,
      schedule: activeSchedule,
      metadata,
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoan
              ? "Year-by-year distribution of principal repayment and total interest paid."
              : "Year-by-year progression of accumulated savings and wealth generation."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {monthlySchedule && monthlySchedule.length > 0 && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("yearly")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "yearly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yearly Summary
              </button>
              <button
                type="button"
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Details
              </button>
            </div>
          )}

          <ExportActions
            onExportCsv={handleExportCsv}
            csvLabel={`Export ${viewMode === "monthly" ? "Monthly" : "Yearly"} CSV`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <caption className="sr-only">{title} Table</caption>
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
              <th scope="col" className="py-3 px-3 sm:px-4">
                {viewMode === "yearly" ? "Year" : "Month"}
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                Opening Balance
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                {isLoan ? "Principal Paid" : "Invested"}
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                {isLoan ? "Interest Paid" : "Interest Earned"}
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                Total Payment
              </th>
              <th scope="col" className="py-3 px-3 sm:px-4 text-right">
                Closing Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800 tabular-nums">
            {viewMode === "yearly"
              ? displayedYearly.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50/80 transition-colors">
                    <th scope="row" className="py-3 px-3 sm:px-4 font-bold text-slate-900">
                      Year {row.period}
                    </th>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-600">
                      {formatINR(row.openingBalance)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-emerald-700 font-semibold">
                      {formatINR(row.principalPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-700 font-medium">
                      {formatINR(row.interestPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-slate-900">
                      {formatINR(row.totalPayment)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-600">
                      {formatINR(row.closingBalance)}
                    </td>
                  </tr>
                ))
              : (monthlySchedule || []).slice(0, 36).map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50/80 transition-colors">
                    <th scope="row" className="py-3 px-3 sm:px-4 font-bold text-slate-900">
                      Month {row.period}
                    </th>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-600">
                      {formatINR(row.openingBalance)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-emerald-700 font-semibold">
                      {formatINR(row.principalPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-700 font-medium">
                      {formatINR(row.interestPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-slate-900">
                      {formatINR(row.totalPayment)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-600">
                      {formatINR(row.closingBalance)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {viewMode === "yearly" && yearlySchedule.length > 10 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => setShowAllYears(!showAllYears)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
          >
            {showAllYears ? "Show First 10 Years" : `Show All ${yearlySchedule.length} Years`}
          </button>
        </div>
      )}
      {viewMode === "monthly" && (monthlySchedule?.length ?? 0) > 36 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Showing first 36 monthly installments on screen. Full {monthlySchedule?.length}-month schedule available via the Export CSV button above.
        </div>
      )}
    </div>
  );
};
