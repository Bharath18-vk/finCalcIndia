"use client";

import React, { useState, useMemo } from "react";
import { calculateSWP } from "@/lib/calculators/swp";
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

export interface SWPCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialInvestment: number;
  initialMonthlyWithdrawal: number;
  initialAnnualReturn: number;
  initialTenureYears: number;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const SWPCalculatorView: React.FC<SWPCalculatorViewProps> = ({
  title,
  badge = "Regular Income",
  description,
  initialInvestment: defaultInvestment,
  initialMonthlyWithdrawal: defaultWithdrawal,
  initialAnnualReturn,
  initialTenureYears,
  benchmarkNote = "8.50% Conservative Hybrid Mutual Fund Illustrative Return",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [initialInvestment, setInitialInvestment] = useState(defaultInvestment);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(defaultWithdrawal);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState(initialAnnualReturn);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  const result = useMemo(() => {
    return calculateSWP({
      initialInvestment,
      monthlyWithdrawal,
      expectedAnnualReturn,
      tenureYears,
    });
  }, [initialInvestment, monthlyWithdrawal, expectedAnnualReturn, tenureYears]);

  const handleInvestmentChange = (val: number) => {
    setInitialInvestment(val);
    trackCalculatorUsed("swp", "initialInvestment");
    trackCalculatorResultGenerated("swp");
  };

  const handleWithdrawalChange = (val: number) => {
    setMonthlyWithdrawal(val);
    trackCalculatorUsed("swp", "monthlyWithdrawal");
    trackCalculatorResultGenerated("swp");
  };

  const handleReturnChange = (val: number) => {
    setExpectedAnnualReturn(val);
    trackCalculatorUsed("swp", "return");
    trackCalculatorResultGenerated("swp");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("swp", "tenure");
    trackCalculatorResultGenerated("swp");
  };

  // Safe withdrawal rate metric
  const annualWithdrawal = monthlyWithdrawal * 12;
  const withdrawalRate =
    initialInvestment > 0
      ? Number(((annualWithdrawal / initialInvestment) * 100).toFixed(2))
      : 0;

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          <CurrencyInput
            label="Total Mutual Fund Corpus"
            value={initialInvestment}
            onChange={handleInvestmentChange}
            min={100000}
            max={100000000}
            step={50000}
            presets={[
              { label: "₹25 Lakh", value: 2500000 },
              { label: "₹50 Lakh", value: 5000000 },
              { label: "₹1 Crore", value: 10000000 },
              { label: "₹2 Crore", value: 20000000 },
            ]}
            helperText="Lump sum corpus invested to generate regular monthly pension or cash flow."
          />

          <CurrencyInput
            label="Monthly Withdrawal Amount"
            value={monthlyWithdrawal}
            onChange={handleWithdrawalChange}
            min={1000}
            max={1000000}
            step={1000}
            presets={[
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹35,000", value: 35000 },
              { label: "₹50,000", value: 50000 },
            ]}
            helperText={`Annualized withdrawal rate: ${withdrawalRate}% of initial capital.`}
          />

          <PercentageInput
            label="Expected Annual Return (% p.a.)"
            value={expectedAnnualReturn}
            onChange={handleReturnChange}
            min={3.0}
            max={20.0}
            step={0.1}
            presets={[
              { label: "7.0% (Debt Fund)", value: 7.0 },
              { label: "8.5% (Hybrid Benchmark)", value: 8.5 },
              { label: "10.0% (Balanced)", value: 10.0 },
              { label: "12.0% (Equity)", value: 12.0 },
            ]}
            helperText="Illustrative annual return assumption. Returns are market-linked and non-linear."
          />

          <TenureInput
            label="Withdrawal Period"
            years={tenureYears}
            onChangeYears={handleTenureChange}
            minYears={1}
            maxYears={30}
            presets={[
              { label: "5 Years", years: 5 },
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
              { label: "20 Years", years: 20 },
            ]}
            helperText="Number of years you plan to withdraw monthly payments."
          />
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          {result.isDepleted && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm space-y-1">
              <span className="font-bold block">⚠️ Capital Depletion Warning</span>
              <p>
                At a monthly withdrawal of {formatINR(monthlyWithdrawal)} ({withdrawalRate}%/yr), your corpus runs out in{" "}
                <strong>Month {result.depletionMonth} (Year {result.depletionYear})</strong>. Consider reducing your monthly withdrawal or selecting a higher-yielding asset allocation.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total Cash Withdrawn"
              value={formatINR(result.totalWithdrawn)}
              subtext={`${result.tenureYears * 12} monthly payouts`}
              highlight
            />
            <ResultCard
              label="Final Remaining Corpus"
              value={formatINR(result.finalValue)}
              subtext={result.isDepleted ? "Corpus depleted" : "Remaining portfolio value"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Initial Capital Invested"
              value={formatINR(result.initialInvestment)}
              subtext="Starting principal balance"
            />
            <ResultCard
              label="Total Wealth Generated"
              value={formatINR(result.totalProfitGenerated)}
              subtext="Gains generated while withdrawing"
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Total Cash Withdrawn", value: result.totalWithdrawn, color: "#1e3a8a" },
              { label: "Remaining Corpus", value: result.finalValue, color: "#059669" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Year-by-Year SWP Cash Flow Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Annual withdrawals, return accrual, and year-end portfolio balance</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Withdrawn in Year</th>
                    <th className="px-4 py-3 text-right">Growth Generated</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">Year {row.year}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(row.openingBalance)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-blue-800">-{formatINR(row.totalWithdrawn)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-700">+{formatINR(row.interestEarned)}</td>
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
          calculatorName="Systematic Withdrawal Plan (SWP)"
          formula="Ending Balance = (Opening Balance * (1 + Monthly Return)) - Monthly Withdrawal"
          variables={[
            { symbol: "Corpus", description: "Lump sum capital remaining in the mutual fund" },
            { symbol: "Monthly Withdrawal", description: "Automated monthly cash transfer to your bank account" },
            { symbol: "Return Rate", description: "Illustrative portfolio compounding rate on the remaining balance" },
          ]}
          notes={[
            "SWP enables tax-efficient monthly income because only the capital gains component of each redeemed unit is subject to tax, while the principal portion is returned tax-free.",
            "If your annual withdrawal rate is lower than the portfolio return (e.g. 6% withdrawal vs 8.5% return), your capital can grow indefinitely while providing monthly income.",
            "For equity funds, LTCG above ₹1.25 Lakh per financial year is taxed at 12.5% (Budget 2024). Short-term redemptions (under 12 months) are taxed at 20%.",
            "SWP allows full flexibility: you can pause, stop, increase, or decrease your withdrawal amount at any time without lock-in penalties.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
