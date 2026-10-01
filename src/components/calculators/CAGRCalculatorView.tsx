"use client";

import React, { useState, useMemo } from "react";
import { calculateCAGR } from "@/lib/calculators/cagr";
import { formatINR, formatPercentage, formatTenureYears } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { TenureInput } from "@/components/ui/TenureInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface CAGRCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialValue: number;
  finalValue: number;
  initialTenureYears: number;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const CAGRCalculatorView: React.FC<CAGRCalculatorViewProps> = ({
  title,
  badge = "Investment Metrics",
  description,
  initialValue: defaultInitial,
  finalValue: defaultFinal,
  initialTenureYears,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [initialValue, setInitialValue] = useState(defaultInitial);
  const [finalValue, setFinalValue] = useState(defaultFinal);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  const result = useMemo(() => {
    return calculateCAGR({
      initialValue,
      finalValue,
      tenureYears,
    });
  }, [initialValue, finalValue, tenureYears]);

  const handleInitialChange = (val: number) => {
    setInitialValue(val);
    trackCalculatorUsed("cagr", "initialValue");
    trackCalculatorResultGenerated("cagr");
  };

  const handleFinalChange = (val: number) => {
    setFinalValue(val);
    trackCalculatorUsed("cagr", "finalValue");
    trackCalculatorResultGenerated("cagr");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("cagr", "tenure");
    trackCalculatorResultGenerated("cagr");
  };

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      breadcrumbs={breadcrumbs}
      inputsSlot={
        <div className="space-y-6">
          <CurrencyInput
            label="Beginning Investment Value (V₀)"
            value={initialValue}
            onChange={handleInitialChange}
            min={1000}
            max={100000000}
            step={5000}
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹5 Lakh", value: 500000 },
              { label: "₹10 Lakh", value: 1000000 },
            ]}
            helperText="The purchase price or original capital invested."
          />

          <CurrencyInput
            label="Ending Value / Current Valuation (Vₙ)"
            value={finalValue}
            onChange={handleFinalChange}
            min={1000}
            max={500000000}
            step={10000}
            presets={[
              { label: "₹1.5 Lakh", value: 150000 },
              { label: "₹2 Lakh", value: 200000 },
              { label: "₹10 Lakh", value: 1000000 },
              { label: "₹25 Lakh", value: 2500000 },
            ]}
            helperText="Current portfolio value or maturity redemption payout."
          />

          <TenureInput
            label="Holding Period"
            years={tenureYears}
            onChangeYears={handleTenureChange}
            minYears={1}
            maxYears={30}
            presets={[
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
              { label: "7 Years", years: 7 },
              { label: "10 Years", years: 10 },
            ]}
            helperText="Number of full years between beginning and ending value."
          />
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="CAGR (Compounded Annual Growth Rate)"
              value={`${formatPercentage(result.cagrPercentage)}%`}
              subtext={`Smoothed annual rate over ${formatTenureYears(result.tenureYears)}`}
              highlight
            />
            <ResultCard
              label="Total Absolute Return"
              value={`${formatPercentage(result.absoluteReturnPercentage)}%`}
              subtext={`${result.multiple}x original capital invested`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Capital Gain / Profit"
              value={formatINR(Math.abs(result.totalGain))}
              subtext={result.isGain ? "Net wealth creation" : "Net capital loss"}
            />
            <ResultCard
              label="Multiple on Invested Capital"
              value={`${result.multiple}x`}
              subtext={`Initial ${formatINR(result.initialValue)} → ${formatINR(result.finalValue)}`}
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Initial Capital", value: result.initialValue, color: "#1e3a8a" },
              {
                label: result.isGain ? "Total Wealth Gain" : "Capital Reduction",
                value: Math.max(0, result.totalGain),
                color: result.isGain ? "#059669" : "#dc2626",
              },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Annual Compounding Trajectory ({formatPercentage(result.cagrPercentage)}% CAGR)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Yearly progression required to grow from {formatINR(result.initialValue)} to {formatINR(result.finalValue)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Milestone</th>
                    <th className="px-4 py-3 text-right">Projected Value</th>
                    <th className="px-4 py-3 text-right">Cumulative Gain</th>
                    <th className="px-4 py-3 text-right">Gain as % of Initial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-600">Start (Year 0)</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(result.initialValue)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">₹0</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">0.0%</td>
                  </tr>
                  {result.yearlyTrajectory.map((pt) => (
                    <tr key={pt.year} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">End of Year {pt.year}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(pt.projectedValue)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-700">
                        {pt.cumulativeGain >= 0 ? `+${formatINR(pt.cumulativeGain)}` : `-${formatINR(Math.abs(pt.cumulativeGain))}`}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        {result.initialValue > 0 ? `${formatPercentage((pt.cumulativeGain / result.initialValue) * 100)}%` : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName="Compound Annual Growth Rate (CAGR)"
          formula="CAGR = (Ending Value / Beginning Value)^(1 / Tenure in Years) - 1"
          variables={[
            { symbol: "Ending Value", description: "Final portfolio valuation or sale proceeds" },
            { symbol: "Beginning Value", description: "Initial invested capital" },
            { symbol: "Tenure", description: "Total duration in years" },
          ]}
          notes={[
            "CAGR is the single constant rate of return at which an investment would have grown if it had compounded steadily each year.",
            "CAGR is the most accurate benchmark for comparing investments with volatile year-to-year returns (e.g. mutual funds, stocks, real estate).",
            "Unlike simple average returns, CAGR accounts for compounding and avoids the mathematical distortions created by volatile market swings.",
            "For multiple cash inflows/outflows across different dates (like ongoing SIPs), XIRR (Extended Internal Rate of Return) must be used instead of CAGR.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
