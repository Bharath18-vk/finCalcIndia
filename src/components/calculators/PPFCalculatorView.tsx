"use client";

import React, { useState, useMemo } from "react";
import { calculatePPF, PPFDepositFrequency } from "@/lib/calculators/ppf";
import { formatINR, formatPercentage, formatTenureYears } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface PPFCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialDeposit: number;
  initialFrequency?: PPFDepositFrequency;
  initialRate: number;
  initialTenureYears?: number;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const PPFCalculatorView: React.FC<PPFCalculatorViewProps> = ({
  title,
  badge = "Small Savings Scheme",
  description,
  initialDeposit,
  initialFrequency = "annual",
  initialRate,
  initialTenureYears = 15,
  benchmarkNote = "7.10% p.a. (Govt Notified Small Savings Rate)",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [depositAmount, setDepositAmount] = useState(initialDeposit);
  const [depositFrequency, setDepositFrequency] = useState<PPFDepositFrequency>(initialFrequency);
  const [annualRate, setAnnualRate] = useState(initialRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  const result = useMemo(() => {
    return calculatePPF({
      depositAmount,
      depositFrequency,
      annualRate,
      tenureYears,
    });
  }, [depositAmount, depositFrequency, annualRate, tenureYears]);

  const handleDepositChange = (val: number) => {
    setDepositAmount(val);
    trackCalculatorUsed("ppf", "depositAmount");
    trackCalculatorResultGenerated("ppf");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("ppf", "rate");
    trackCalculatorResultGenerated("ppf");
  };

  const wealthMultiple =
    result.totalDeposit > 0
      ? Number((result.maturityAmount / result.totalDeposit).toFixed(2))
      : 1;

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          {/* Deposit Frequency Toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Deposit Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDepositFrequency("annual");
                  if (depositAmount < 10000) setDepositAmount(150000);
                  trackCalculatorUsed("ppf", "frequencyAnnual");
                }}
                className={`py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                  depositFrequency === "annual"
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Annual Lumpsum (Before Apr 5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepositFrequency("monthly");
                  if (depositAmount > 12500) setDepositAmount(12500);
                  trackCalculatorUsed("ppf", "frequencyMonthly");
                }}
                className={`py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                  depositFrequency === "monthly"
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Monthly (Before 5th)
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Depositing before the 5th of the month maximizes interest earned for that entire month.
            </p>
          </div>

          <CurrencyInput
            label={depositFrequency === "annual" ? "Annual Deposit Amount" : "Monthly Installment"}
            value={depositAmount}
            onChange={handleDepositChange}
            min={depositFrequency === "annual" ? 500 : 500}
            max={depositFrequency === "annual" ? 150000 : 12500}
            step={depositFrequency === "annual" ? 1000 : 500}
            presets={
              depositFrequency === "annual"
                ? [
                    { label: "₹25,000", value: 25000 },
                    { label: "₹50,000", value: 50000 },
                    { label: "₹1 Lakh", value: 100000 },
                    { label: "₹1.5 Lakh (Max)", value: 150000 },
                  ]
                : [
                    { label: "₹2,000", value: 2000 },
                    { label: "₹5,000", value: 5000 },
                    { label: "₹10,000", value: 10000 },
                    { label: "₹12,500 (Max)", value: 12500 },
                  ]
            }
            helperText={`Statutory annual limit: Minimum ₹500, Maximum ₹1,50,000 per financial year.`}
          />

          <PercentageInput
            label="Govt Notified Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={5.0}
            max={12.0}
            step={0.05}
            presets={[
              { label: "7.10% (Current Rate)", value: 7.1 },
              { label: "7.50%", value: 7.5 },
              { label: "8.00%", value: 8.0 },
            ]}
            helperText="Set quarterly by Ministry of Finance. Current official rate is 7.10%."
          />

          {/* Tenure Blocks */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Tenure (15-Year Base + 5-Yr Blocks)</label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 20, 25, 30].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => {
                    setTenureYears(years);
                    trackCalculatorUsed("ppf", "tenureBlock");
                  }}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    tenureYears === years
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {years} Years {years === 15 ? "(Statutory)" : ""}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              PPF accounts mature in 15 full financial years and can be extended in 5-year blocks.
            </p>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Tax-Free Maturity Corpus"
              value={formatINR(result.maturityAmount)}
              subtext={`100% Tax-Exempt under EEE (Sec 10(10D))`}
              highlight
            />
            <ResultCard
              label="Total Interest Earned"
              value={formatINR(result.totalInterest)}
              subtext={`${wealthMultiple}x growth on deposited capital`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Invested Amount"
              value={formatINR(result.totalDeposit)}
              subtext={`${result.tenureYears} annual deposits of ${formatINR(result.annualDepositEquivalent)}`}
            />
            <ResultCard
              label="Annual Section 80C Tax Deduction"
              value={formatINR(result.annualDepositEquivalent)}
              subtext="Under Old Tax Regime (up to ₹1.5L/yr)"
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Total Deposits", value: result.totalDeposit, color: "#1e3a8a" },
              { label: "Tax-Free Interest", value: result.totalInterest, color: "#059669" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Yearly PPF Growth, Loan & Withdrawal Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statutory loan eligibility (Years 3-6) and partial withdrawal limits (Years 7+)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-3 py-3">Year</th>
                    <th className="px-3 py-3 text-right">Opening Balance</th>
                    <th className="px-3 py-3 text-right">Deposit</th>
                    <th className="px-3 py-3 text-right">Interest</th>
                    <th className="px-3 py-3 text-right">Closing Balance</th>
                    <th className="px-3 py-3 text-right">Loan Eligible</th>
                    <th className="px-3 py-3 text-right">Max Withdrawal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">Yr {row.year}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{formatINR(row.openingBalance)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700">{formatINR(row.annualDeposit)}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-emerald-700">+{formatINR(row.interestEarned)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatINR(row.closingBalance)}</td>
                      <td className="px-3 py-2.5 text-right text-amber-700">
                        {row.loanEligibility > 0 ? formatINR(row.loanEligibility) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right text-blue-700">
                        {row.withdrawalLimit > 0 ? formatINR(row.withdrawalLimit) : "—"}
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
          calculatorName="Public Provident Fund (PPF)"
          formula="Interest = Lowest Balance between 5th & end of month * (Annual Rate / 12)"
          variables={[
            { symbol: "A", description: "Maturity corpus at the end of the 15-year period" },
            { symbol: "Rate", description: "Government notified interest rate (compounded annually on March 31)" },
            { symbol: "Limit", description: "Minimum ₹500, Maximum ₹1,50,000 per financial year" },
          ]}
          notes={[
            "PPF carries sovereign guarantee and EEE (Exempt-Exempt-Exempt) tax status: investment is deductible under Section 80C, interest earned is tax-free, and maturity proceeds are fully tax-exempt under Section 10(10D).",
            "Interest is calculated monthly on the lowest balance between the close of the 5th day and the end of the month, but credited annually on March 31st.",
            "Loan facility is available from the 3rd financial year up to the 6th financial year (capped at 25% of balance at end of 2nd preceding year).",
            "Partial withdrawal is permitted from the 7th financial year onward (capped at 50% of the balance at end of 4th preceding year or previous year, whichever is lower).",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
