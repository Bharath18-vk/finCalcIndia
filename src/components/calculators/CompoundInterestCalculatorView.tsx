"use client";

import React, { useState, useMemo } from "react";
import {
  calculateCompoundInterest,
  CompoundFrequency,
} from "@/lib/calculators/compound-interest";
import { formatINR, formatPercentage, formatTenureYears } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { TenureInput } from "@/components/ui/TenureInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface CompoundInterestCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialPrincipal: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  initialFrequency?: CompoundFrequency;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const CompoundInterestCalculatorView: React.FC<CompoundInterestCalculatorViewProps> = ({
  title,
  badge = "Compounding Power",
  description,
  initialPrincipal,
  initialAnnualRate,
  initialTenureYears,
  initialFrequency = "annual",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [frequency, setFrequency] = useState<CompoundFrequency>(initialFrequency);

  const result = useMemo(() => {
    return calculateCompoundInterest({
      principal,
      annualRate,
      tenureYears,
      frequency,
    });
  }, [principal, annualRate, tenureYears, frequency]);

  const handlePrincipalChange = (val: number) => {
    setPrincipal(val);
    trackCalculatorUsed("compound-interest", "principal");
    trackCalculatorResultGenerated("compound-interest");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("compound-interest", "rate");
    trackCalculatorResultGenerated("compound-interest");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("compound-interest", "tenure");
    trackCalculatorResultGenerated("compound-interest");
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
            label="Principal Investment Amount"
            value={principal}
            onChange={handlePrincipalChange}
            min={1000}
            max={100000000}
            step={5000}
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹5 Lakh", value: 500000 },
              { label: "₹10 Lakh", value: 1000000 },
            ]}
            helperText="Starting capital that earns interest."
          />

          <PercentageInput
            label="Annual Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={1.0}
            max={30.0}
            step={0.1}
            presets={[
              { label: "6.80% (Bank FD)", value: 6.8 },
              { label: "7.10% (PPF)", value: 7.1 },
              { label: "10.0%", value: 10.0 },
              { label: "12.0% (Equity)", value: 12.0 },
            ]}
            helperText="Nominal annual interest rate before compounding adjustments."
          />

          <TenureInput
            label="Investment Tenure"
            years={tenureYears}
            onChangeYears={handleTenureChange}
            minYears={1}
            maxYears={30}
            presets={[
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
            ]}
            helperText="Total period your funds remain invested."
          />

          {/* Compounding Frequency Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Compounding Frequency</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "annual", label: "Annually (1x/yr)" },
                { id: "half-yearly", label: "Semi-Annual (2x/yr)" },
                { id: "quarterly", label: "Quarterly (4x/yr)" },
                { id: "monthly", label: "Monthly (12x/yr)" },
                { id: "daily", label: "Daily (365x/yr)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFrequency(item.id as CompoundFrequency);
                    trackCalculatorUsed("compound-interest", `frequency_${item.id}`);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    frequency === item.id
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total Maturity Amount"
              value={formatINR(result.maturityAmount)}
              subtext={`After ${formatTenureYears(result.tenureYears)} of compounding`}
              highlight
            />
            <ResultCard
              label="Total Compound Interest"
              value={formatINR(result.totalInterest)}
              subtext={`Effective APY: ${result.effectiveAnnualRate}% p.a.`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Simple Interest Equivalent"
              value={formatINR(result.simpleInterestAmount)}
              subtext="Interest without reinvestment"
            />
            <ResultCard
              label="Extra Gain from Compounding"
              value={formatINR(result.compoundingBonus)}
              subtext="CI minus Simple Interest"
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Principal Invested", value: result.principal, color: "#1e3a8a" },
              { label: "Compound Interest", value: result.totalInterest, color: "#059669" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Frequency Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Compounding Frequency Impact</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing {formatINR(principal)} at {formatPercentage(annualRate)}% over {formatTenureYears(tenureYears)} across intervals
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Compounding Interval</th>
                    <th className="px-4 py-3 text-right">Periods/Year</th>
                    <th className="px-4 py-3 text-right">Effective Yield (APY)</th>
                    <th className="px-4 py-3 text-right">Total Interest</th>
                    <th className="px-4 py-3 text-right">Maturity Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.frequencyComparison.map((row) => (
                    <tr
                      key={row.frequency}
                      className={row.frequency === frequency ? "bg-blue-50/50 font-medium" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-2.5 text-slate-800">{row.label}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{row.periodsPerYear}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{row.effectiveAnnualRate}%</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-700">+{formatINR(row.totalInterest)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(row.maturityAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yearly Amortization / Progression Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Year-by-Year Growth Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Annual compounding trajectory</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Interest in Year</th>
                    <th className="px-4 py-3 text-right">Cumulative Interest</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">Year {row.year}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(row.openingPrincipal)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-700">+{formatINR(row.interestEarned)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-800">{formatINR(row.cumulativeInterest)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(row.closingBalance)}</td>
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
          calculatorName="Compound Interest"
          formula="A = P * (1 + r / n)^(n * t)"
          variables={[
            { symbol: "A", description: "Maturity amount after compound interest" },
            { symbol: "P", description: "Initial principal sum invested" },
            { symbol: "r", description: "Nominal annual interest rate (Rate / 100)" },
            { symbol: "n", description: "Compounding frequency per year (1 for annual, 4 for quarterly, 12 for monthly)" },
            { symbol: "t", description: "Tenure in years" },
          ]}
          notes={[
            "In compound interest, interest earned in each cycle is reinvested and added to the principal, earning interest on interest in subsequent cycles.",
            "More frequent compounding (e.g. quarterly vs annual) leads to a higher effective annual yield (APY).",
            "In Indian banking, cumulative Fixed Deposits (FD) and Recurring Deposits (RD) are compounded quarterly by standard convention.",
            "Long-term mutual fund equity investments compound continuously through internal capital appreciation and portfolio earnings growth.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
