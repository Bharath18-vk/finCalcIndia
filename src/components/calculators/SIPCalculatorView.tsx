"use client";

import React, { useState, useMemo } from "react";
import { calculateSIP } from "@/lib/calculators/sip";
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

export interface SIPCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyInvestment: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  minMonthly?: number;
  maxMonthly?: number;
  monthlyStep?: number;
  monthlyPresets?: { label: string; value: number }[];
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
  customExplainerText?: string;
}

export const SIPCalculatorView: React.FC<SIPCalculatorViewProps> = ({
  title,
  badge = "Mutual Funds",
  description,
  initialMonthlyInvestment,
  initialAnnualRate,
  initialTenureYears,
  minMonthly = 500,
  maxMonthly = 1000000,
  monthlyStep = 500,
  monthlyPresets = [
    { label: "₹1,000", value: 1000 },
    { label: "₹2,500", value: 2500 },
    { label: "₹5,000", value: 5000 },
    { label: "₹10,000", value: 10000 },
    { label: "₹25,000", value: 25000 },
    { label: "₹50,000", value: 50000 },
  ],
  benchmarkNote = "12% Historical Long-Term Equity CAGR",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
  customExplainerText,
}) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(initialMonthlyInvestment);
  const [annualReturnRate, setAnnualReturnRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  const result = useMemo(() => {
    return calculateSIP({
      monthlyInvestment,
      annualReturnRate,
      tenureYears,
    });
  }, [monthlyInvestment, annualReturnRate, tenureYears]);

  const handleMonthlyChange = (val: number) => {
    setMonthlyInvestment(val);
    trackCalculatorUsed("sip", "monthlyInvestment");
    trackCalculatorResultGenerated("sip");
  };

  const handleRateChange = (val: number) => {
    setAnnualReturnRate(val);
    trackCalculatorUsed("sip", "returnRate");
    trackCalculatorResultGenerated("sip");
  };

  const handleTenureChange = (val: number) => {
    setTenureYears(val);
    trackCalculatorUsed("sip", "tenureYears");
    trackCalculatorResultGenerated("sip");
  };

  const handleReset = () => {
    setMonthlyInvestment(initialMonthlyInvestment);
    setAnnualReturnRate(initialAnnualRate);
    setTenureYears(initialTenureYears);
  };

  const chartData = [
    { name: "Total Invested Capital", value: result.totalInvested, color: "#16a34a" },
    { name: "Estimated Wealth Gained", value: result.wealthGained, color: "#2563eb" },
  ];

  const directAnswer = `Investing ${formatINR(result.monthlyInvestment)} per month for ${formatTenureYears(
    result.tenureYears
  )} at an expected return of ${formatPercentage(
    result.annualReturnRate
  )} p.a. generates an estimated maturity value of ${formatINR(
    result.futureValue
  )}. Over this period, you will invest a total of ${formatINR(
    result.totalInvested
  )} and accumulate ${formatINR(result.wealthGained)} in estimated wealth gains (${result.wealthMultiple}x growth).`;

  const formulaSteps = [
    {
      label: "Step 1: Expected Monthly Rate of Return (r)",
      expression: `r = (${result.annualReturnRate}% / 12) / 100 = ${(
        result.annualReturnRate /
        12 /
        100
      ).toFixed(6)}`,
      explanation:
        "The expected annual compound rate is divided across 12 monthly compounding periods.",
    },
    {
      label: "Step 2: Number of Monthly Installments (n)",
      expression: `n = ${result.tenureYears} Years × 12 = ${result.totalMonths} Installments`,
      explanation: "Total systematic contributions deposited over the complete investment horizon.",
    },
    {
      label: "Step 3: Annuity-Due Future Value Calculation",
      expression: `FV = P × [((1 + r)^n - 1) / r] × (1 + r) = ${formatINR(result.futureValue)}`,
      explanation:
        "Because mutual fund SIPs deduct funds at the beginning of each installment cycle, each monthly payment earns interest for that initial month (Annuity Due factor).",
    },
  ];

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs}
      title={title}
      badge={badge}
      description={description}
      directAnswer={directAnswer}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          <CurrencyInput
            label="Monthly SIP Installment"
            value={monthlyInvestment}
            onChange={handleMonthlyChange}
            min={minMonthly}
            max={maxMonthly}
            step={monthlyStep}
            presets={monthlyPresets}
            helperText="Amount automatically debited from your bank account each month."
          />

          <PercentageInput
            label="Expected Return Rate (% p.a.)"
            value={annualReturnRate}
            onChange={handleRateChange}
            min={1}
            max={30}
            step={0.5}
            benchmarkNote={benchmarkNote}
            helperText="Illustrative annual return (historical Indian equity CAGR: 12-14%)."
          />

          <TenureInput
            label="Investment Time Horizon"
            years={tenureYears}
            onYearsChange={handleTenureChange}
            minYears={1}
            maxYears={40}
            allowMonths={false}
            presets={[
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
              { label: "20 Years", years: 20 },
              { label: "25 Years", years: 25 },
            ]}
            helperText="Longer timeframes dramatically increase compound wealth accumulation."
          />
        </div>
      }
      resultsSlot={
        <ResultCard
          primaryTitle="Estimated Maturity Value"
          primaryValue={result.futureValue}
          primarySubtitle={`Corpus after ${formatTenureYears(result.tenureYears)} at ${result.annualReturnRate}% p.a.`}
          secondaryMetrics={[
            {
              label: "Invested Capital",
              value: result.totalInvested,
              color: "bg-emerald-500",
            },
            {
              label: "Wealth Gained",
              value: result.wealthGained,
              color: "bg-blue-500",
              subtext: `${result.wealthMultiple}x growth multiple`,
            },
          ]}
          ratioNote={`Gains represent ${((result.wealthGained / result.futureValue) * 100).toFixed(
            1
          )}% of your final portfolio value.`}
          onReset={handleReset}
        />
      }
      chartSlot={
        <FinancialBreakdownChart
          data={chartData}
          title="Invested Capital vs Estimated Returns"
        />
      }
      comparisonTablesSlot={
        <div className="space-y-6">
          {/* Sensitivity Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Return Rate Sensitivity (±2% to ±4%)
            </h3>
            <p className="text-xs text-slate-500">
              Mutual funds are market-linked instruments. Review portfolio growth across conservative and optimistic equity scenarios.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">SIP Return Sensitivity Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Return Rate</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Estimated Gains</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Maturity Corpus</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.sensitivityTable.map((sc) => {
                    const isBase = sc.rate === annualReturnRate;
                    return (
                      <tr
                        key={sc.rate}
                        className={isBase ? "bg-emerald-50/70 font-bold text-emerald-950" : "hover:bg-slate-50/60"}
                      >
                        <th scope="row" className="py-2.5 px-3">
                          {sc.rate}% {isBase && "(Current)"}
                        </th>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(sc.totalInvested)}</td>
                        <td className="py-2.5 px-3 text-right text-blue-700">{formatINR(sc.wealthGained)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(sc.futureValue)}</td>
                        <td className="py-2.5 px-3 text-right">
                          {sc.differenceValue === 0
                            ? "-"
                            : sc.differenceValue > 0
                            ? `+${formatINR(sc.differenceValue)}`
                            : `-${formatINR(Math.abs(sc.differenceValue))}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tenure Comparison Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Long-Term Compounding Horizons
            </h3>
            <p className="text-xs text-slate-500">
              Notice how wealth generation accelerates exponentially in years 15 through 30 as returns generate compounding returns.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">SIP Tenure Comparison Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Horizon</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Wealth Gained</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Maturity Corpus</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Growth Multiple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.tenureComparisonTable.map((tc) => {
                    const isCurrent = tc.tenureYears === tenureYears;
                    return (
                      <tr
                        key={tc.tenureYears}
                        className={isCurrent ? "bg-emerald-50/70 font-bold text-emerald-950" : "hover:bg-slate-50/60"}
                      >
                        <th scope="row" className="py-2.5 px-3">
                          {tc.tenureYears} Years {isCurrent && "(Current)"}
                        </th>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(tc.totalInvested)}</td>
                        <td className="py-2.5 px-3 text-right text-blue-700">{formatINR(tc.wealthGained)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(tc.futureValue)}</td>
                        <td className="py-2.5 px-3 text-right">{tc.growthMultiple}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yearly Progression Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Year-by-Year Wealth Progression
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Yearly SIP Progression Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Year</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Cumulative Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Yearly Interest</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Wealth Gained</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Portfolio Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-bold text-slate-900">
                        Year {row.year}
                      </th>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(row.investedCapital)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{formatINR(row.yearlyInterest)}</td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-semibold">{formatINR(row.totalWealthGained)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(row.futureValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      contentSlot={
        customExplainerText ? (
          <div className="prose prose-slate max-w-none">
            <p>{customExplainerText}</p>
          </div>
        ) : null
      }
      formulaExplanationSlot={
        <FormulaExplanation
          title="How SIP Returns Are Calculated (Annuity Due Convention)"
          formula="FV = P × [((1 + r)^n - 1) / r] × (1 + r)"
          variables={[
            {
              symbol: "P",
              name: "Monthly Installment",
              valueDescription: `${formatINR(result.monthlyInvestment)} credited each cycle`,
            },
            {
              symbol: "r",
              name: "Expected Monthly Rate",
              valueDescription: `Annual return (${result.annualReturnRate}%) ÷ 12 ÷ 100`,
            },
            {
              symbol: "n",
              name: "Number of Monthly Deposits",
              valueDescription: `${result.totalMonths} total installments`,
            },
          ]}
          steps={formulaSteps}
          conventions={[
            "Compounded monthly with payments credited at the start of each month (Annuity Due), matching standard mutual fund processing in India.",
            "Equity mutual funds do not offer guaranteed returns; calculations reflect mathematical compound projections based on the constant return rate entered.",
            "Expense ratios and applicable capital gains taxes (LTCG / STCG) are excluded from basic compound projections.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators currentSlug="/sip-calculator" links={relatedLinks} />
      }
    />
  );
};
