"use client";

import React, { useState, useMemo } from "react";
import {
  calculatePrepayment,
  PrepaymentStrategy,
} from "@/lib/calculators/prepayment";
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

export interface LoanPrepaymentViewProps {
  title: string;
  badge?: string;
  description: string;
  initialPrincipal: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const LoanPrepaymentView: React.FC<LoanPrepaymentViewProps> = ({
  title,
  badge = "Loan Prepayment",
  description,
  initialPrincipal,
  initialAnnualRate,
  initialTenureYears,
  benchmarkNote = "8.50% Floating Home Loan Benchmark (SBI EBLR)",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [strategy, setStrategy] = useState<PrepaymentStrategy>("reduce-tenure");

  // Prepayment methods
  const [prepayType, setPrepayType] = useState<"extra-monthly" | "one-time" | "annual">("extra-monthly");
  const [monthlyExtraEMI, setMonthlyExtraEMI] = useState(5000);
  const [oneTimeAmount, setOneTimeAmount] = useState(300000);
  const [oneTimeMonth, setOneTimeMonth] = useState(12);
  const [annualAmount, setAnnualAmount] = useState(100000);

  const result = useMemo(() => {
    return calculatePrepayment({
      principal,
      annualRate,
      tenureYears,
      strategy,
      monthlyExtraEMI: prepayType === "extra-monthly" ? monthlyExtraEMI : 0,
      oneTimePrepayment:
        prepayType === "one-time"
          ? { amount: oneTimeAmount, atMonth: oneTimeMonth }
          : undefined,
      annualPrepayment:
        prepayType === "annual" ? { amount: annualAmount, startYear: 1 } : undefined,
    });
  }, [
    principal,
    annualRate,
    tenureYears,
    strategy,
    prepayType,
    monthlyExtraEMI,
    oneTimeAmount,
    oneTimeMonth,
    annualAmount,
  ]);

  const handlePrincipalChange = (val: number) => {
    setPrincipal(val);
    trackCalculatorUsed("prepayment", "principal");
    trackCalculatorResultGenerated("prepayment");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("prepayment", "rate");
    trackCalculatorResultGenerated("prepayment");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("prepayment", "tenure");
    trackCalculatorResultGenerated("prepayment");
  };

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 1: Original Loan Terms</h3>
            <CurrencyInput
              label="Original Loan Amount"
              value={principal}
              onChange={handlePrincipalChange}
              min={100000}
              max={100000000}
              step={50000}
              presets={[
                { label: "₹20 Lakh", value: 2000000 },
                { label: "₹30 Lakh", value: 3000000 },
                { label: "₹50 Lakh", value: 5000000 },
                { label: "₹75 Lakh", value: 7500000 },
              ]}
              helperText="Current outstanding or original sanction amount."
            />

            <PercentageInput
              label="Interest Rate (% p.a.)"
              value={annualRate}
              onChange={handleRateChange}
              min={6.0}
              max={20.0}
              step={0.05}
              presets={[
                { label: "8.50% (Benchmark)", value: 8.5 },
                { label: "9.00%", value: 9.0 },
                { label: "9.50%", value: 9.5 },
              ]}
              helperText="Current interest rate on your loan."
            />

            <TenureInput
              label="Remaining Tenure"
              years={tenureYears}
              onChangeYears={handleTenureChange}
              minYears={1}
              maxYears={30}
              presets={[
                { label: "10 Years", years: 10 },
                { label: "15 Years", years: 15 },
                { label: "20 Years", years: 20 },
                { label: "25 Years", years: 25 },
              ]}
              helperText="Remaining duration in years."
            />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Step 2: Prepayment Method</h3>

            {/* Prepayment Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "extra-monthly", label: "Extra Monthly EMI" },
                { id: "one-time", label: "One-Time Lump Sum" },
                { id: "annual", label: "Annual Bonus Prepayment" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPrepayType(item.id as any);
                    trackCalculatorUsed("prepayment", `type_${item.id}`);
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                    prepayType === item.id
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {prepayType === "extra-monthly" && (
              <CurrencyInput
                label="Extra Monthly Prepayment"
                value={monthlyExtraEMI}
                onChange={(val) => {
                  setMonthlyExtraEMI(val);
                  trackCalculatorUsed("prepayment", "extraMonthly");
                }}
                min={500}
                max={200000}
                step={500}
                presets={[
                  { label: "₹2,000", value: 2000 },
                  { label: "₹5,000", value: 5000 },
                  { label: "₹10,000", value: 10000 },
                  { label: "₹20,000", value: 20000 },
                ]}
                helperText="Extra cash added to your EMI payment every month."
              />
            )}

            {prepayType === "one-time" && (
              <div className="space-y-4">
                <CurrencyInput
                  label="Lump Sum Prepayment Amount"
                  value={oneTimeAmount}
                  onChange={(val) => {
                    setOneTimeAmount(val);
                    trackCalculatorUsed("prepayment", "oneTimeAmount");
                  }}
                  min={10000}
                  max={50000000}
                  step={10000}
                  presets={[
                    { label: "₹1 Lakh", value: 100000 },
                    { label: "₹2 Lakh", value: 200000 },
                    { label: "₹5 Lakh", value: 500000 },
                    { label: "₹10 Lakh", value: 1000000 },
                  ]}
                  helperText="Single part-payment amount paid towards loan principal."
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prepayment Timing (After Month #{oneTimeMonth})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={Math.min(120, tenureYears * 12)}
                    value={oneTimeMonth}
                    onChange={(e) => setOneTimeMonth(Number(e.target.value))}
                    className="w-full accent-blue-800"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Month 1</span>
                    <span className="font-semibold text-blue-800">
                      Paid after {oneTimeMonth} months ({Number((oneTimeMonth / 12).toFixed(1))} yrs)
                    </span>
                    <span>Month {Math.min(120, tenureYears * 12)}</span>
                  </div>
                </div>
              </div>
            )}

            {prepayType === "annual" && (
              <CurrencyInput
                label="Annual Lump Sum Prepayment"
                value={annualAmount}
                onChange={(val) => {
                  setAnnualAmount(val);
                  trackCalculatorUsed("prepayment", "annualAmount");
                }}
                min={10000}
                max={5000000}
                step={10000}
                presets={[
                  { label: "₹50,000", value: 50000 },
                  { label: "₹1 Lakh", value: 100000 },
                  { label: "₹2 Lakh", value: 200000 },
                  { label: "₹5 Lakh", value: 500000 },
                ]}
                helperText="Extra part-payment contributed once every 12 months (e.g. from bonus/tax refund)."
              />
            )}

            {/* Strategy Choice */}
            <div className="pt-2 border-t border-blue-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Prepayment Strategy
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStrategy("reduce-tenure");
                    trackCalculatorUsed("prepayment", "strat_reduce_tenure");
                  }}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    strategy === "reduce-tenure"
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs font-bold">Reduce Tenure (Recommended)</span>
                  <span className={`block text-[11px] mt-0.5 ${strategy === "reduce-tenure" ? "text-blue-100" : "text-slate-500"}`}>
                    Keeps EMI same, closes loan years earlier, saves maximum interest.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStrategy("reduce-emi");
                    trackCalculatorUsed("prepayment", "strat_reduce_emi");
                  }}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    strategy === "reduce-emi"
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs font-bold">Reduce Monthly EMI</span>
                  <span className={`block text-[11px] mt-0.5 ${strategy === "reduce-emi" ? "text-blue-100" : "text-slate-500"}`}>
                    Maintains full term, lowers monthly obligation to improve cash flow.
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total Interest Saved"
              value={formatINR(result.totalInterestSaved)}
              subtext={`Saves ${result.percentageInterestSaved}% of total loan interest`}
              highlight
            />
            {result.strategy === "reduce-tenure" ? (
              <ResultCard
                label="Tenure Reduction"
                value={`${result.tenureYearsSaved} Years`}
                subtext={`Loan ends in ${Number((result.revisedTenureMonths / 12).toFixed(1))} yrs instead of ${tenureYears} yrs`}
              />
            ) : (
              <ResultCard
                label="Revised Monthly EMI"
                value={formatINR(result.revisedEMI)}
                subtext={`Original EMI was ${formatINR(result.originalEMI)}/mo`}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Prepayments Done"
              value={formatINR(result.totalPrepaymentAmount)}
              subtext="Capital paid directly towards principal"
            />
            <ResultCard
              label="Net Financial Benefit"
              value={formatINR(result.totalInterestSaved)}
              subtext="Pure interest money kept in your pocket"
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Principal Repaid", value: principal, color: "#1e3a8a" },
              { label: "Revised Interest Paid", value: result.revisedTotalInterest, color: "#059669" },
              { label: "Interest Saved", value: result.totalInterestSaved, color: "#f59e0b" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Yearly Balance & Interest Comparison</h3>
                <p className="text-xs text-slate-500 mt-0.5">Original Loan vs Accelerated Prepayment Schedule</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-3 py-3">Year</th>
                    <th className="px-3 py-3 text-right">Orig. Balance</th>
                    <th className="px-3 py-3 text-right">Prepaid in Year</th>
                    <th className="px-3 py-3 text-right">Revised Balance</th>
                    <th className="px-3 py-3 text-right">Orig. Cum. Interest</th>
                    <th className="px-3 py-3 text-right">Rev. Cum. Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearlyComparison.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">Yr {row.year}</td>
                      <td className="px-3 py-2.5 text-right text-slate-500">{formatINR(row.originalClosingBalance)}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-amber-700">
                        {row.prepaymentInYear > 0 ? formatINR(row.prepaymentInYear) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatINR(row.revisedClosingBalance)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-500">{formatINR(row.originalCumulativeInterest)}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-emerald-700">{formatINR(row.revisedCumulativeInterest)}</td>
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
          calculatorName="Loan Prepayment"
          formula="Interest Saved = Original Total Interest - Revised Total Interest"
          variables={[
            { symbol: "Principal", description: "Outstanding loan amount receiving part-prepayment" },
            { symbol: "Prepayment", description: "Direct capital reduction that bypasses future interest compounding" },
            { symbol: "Tenure Reduction", description: "Number of future EMI cycles eliminated completely" },
          ]}
          notes={[
            "Under Reserve Bank of India (RBI) guidelines, banks and NBFCs cannot charge foreclosure or prepayment penalties on individual floating-rate home loans.",
            "Prepayments made in the early years of a long tenure (years 1 to 7) yield the highest interest savings because the principal base is largest.",
            "Choosing 'Reduce Tenure' is almost always financially superior to 'Reduce EMI' because it stops interest compounding many years earlier.",
            "Always instruct your lender in writing to adjust prepayments directly towards principal reduction rather than advance EMI holding.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
