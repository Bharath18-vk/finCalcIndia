"use client";

import React, { useState, useMemo } from "react";
import { calculateLumpsum } from "@/lib/calculators/lumpsum";
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

export interface LumpsumCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialInvestment: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
  customExplainerText?: string;
}

export const LumpsumCalculatorView: React.FC<LumpsumCalculatorViewProps> = ({
  title,
  badge = "One-Time Investment",
  description,
  initialInvestment,
  initialAnnualRate,
  initialTenureYears,
  breadcrumbs,
  faqs,
  relatedLinks,
  customExplainerText,
}) => {
  const [totalInvestment, setTotalInvestment] = useState(initialInvestment);
  const [annualReturnRate, setAnnualReturnRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  const result = useMemo(() => {
    return calculateLumpsum({
      totalInvestment,
      annualReturnRate,
      tenureYears,
    });
  }, [totalInvestment, annualReturnRate, tenureYears]);

  const handleInvestmentChange = (val: number) => {
    setTotalInvestment(val);
    trackCalculatorUsed("lumpsum", "totalInvestment");
    trackCalculatorResultGenerated("lumpsum");
  };

  const handleRateChange = (val: number) => {
    setAnnualReturnRate(val);
    trackCalculatorUsed("lumpsum", "returnRate");
    trackCalculatorResultGenerated("lumpsum");
  };

  const handleTenureChange = (val: number) => {
    setTenureYears(val);
    trackCalculatorUsed("lumpsum", "tenureYears");
    trackCalculatorResultGenerated("lumpsum");
  };

  const handleReset = () => {
    setTotalInvestment(initialInvestment);
    setAnnualReturnRate(initialAnnualRate);
    setTenureYears(initialTenureYears);
  };

  const chartData = [
    { name: "Initial Investment", value: result.totalInvestment, color: "#16a34a" },
    { name: "Total Wealth Gained", value: result.wealthGained, color: "#2563eb" },
  ];

  const directAnswer = `A one-time lumpsum investment of ${formatINR(
    result.totalInvestment
  )} invested for ${formatTenureYears(result.tenureYears)} at an expected return of ${formatPercentage(
    result.annualReturnRate
  )} p.a. grows to an estimated maturity value of ${formatINR(
    result.futureValue
  )}. Total capital appreciation equals ${formatINR(result.wealthGained)} (${result.growthMultiple}x your original deposit).`;

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs}
      title={title}
      badge={badge}
      description={description}
      directAnswer={directAnswer}
      inputsSlot={
        <div className="space-y-6">
          <CurrencyInput
            label="Total One-Time Investment"
            value={totalInvestment}
            onChange={handleInvestmentChange}
            min={5000}
            max={50000000}
            step={25000}
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹5 Lakh", value: 500000 },
              { label: "₹10 Lakh", value: 1000000 },
              { label: "₹25 Lakh", value: 2500000 },
            ]}
            helperText="Single upfront lump sum deposited into mutual funds or equity."
          />

          <PercentageInput
            label="Expected Return Rate (% p.a.)"
            value={annualReturnRate}
            onChange={handleRateChange}
            min={1}
            max={30}
            step={0.5}
            benchmarkNote="12% Historical Long-Term CAGR"
            helperText="Average compound annual growth rate (CAGR) expected."
          />

          <TenureInput
            label="Investment Time Horizon"
            years={tenureYears}
            onYearsChange={handleTenureChange}
            minYears={1}
            maxYears={35}
            allowMonths={false}
            presets={[
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
              { label: "20 Years", years: 20 },
            ]}
          />
        </div>
      }
      resultsSlot={
        <ResultCard
          primaryTitle="Estimated Maturity Value"
          primaryValue={result.futureValue}
          primarySubtitle={`Corpus after ${formatTenureYears(result.tenureYears)} at ${result.annualReturnRate}%`}
          secondaryMetrics={[
            {
              label: "Invested Capital",
              value: result.totalInvestment,
              color: "bg-emerald-500",
            },
            {
              label: "Wealth Gained",
              value: result.wealthGained,
              color: "bg-blue-500",
              subtext: `${result.growthMultiple}x initial capital`,
            },
          ]}
          ratioNote={`Your capital compounds ${result.growthMultiple} times over the ${result.tenureYears}-year holding period.`}
          onReset={handleReset}
        />
      }
      chartSlot={
        <FinancialBreakdownChart
          data={chartData}
          title="Principal vs Wealth Growth"
        />
      }
      comparisonTablesSlot={
        <div className="space-y-6">
          {/* Rate Sensitivity */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Return Rate Sensitivity Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Lumpsum Rate Sensitivity Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Return Rate</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Wealth Gained</th>
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

          {/* Tenure Horizon Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Holding Period Growth Horizons
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Lumpsum Tenure Comparison Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Horizon</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Wealth Gained</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Maturity Value</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Multiple</th>
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
                          {tc.tenureYears} Year{tc.tenureYears > 1 ? "s" : ""} {isCurrent && "(Current)"}
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
          title="How Lumpsum Compounding Is Calculated"
          formula="A = P × (1 + r)^t"
          variables={[
            {
              symbol: "P",
              name: "Initial Principal Investment",
              valueDescription: `${formatINR(result.totalInvestment)} one-time deposit`,
            },
            {
              symbol: "r",
              name: "Annual Rate of Return",
              valueDescription: `${result.annualReturnRate}% annual CAGR (as decimal: ${result.annualReturnRate / 100})`,
            },
            {
              symbol: "t",
              name: "Tenure in Years",
              valueDescription: `${result.tenureYears} full calendar years`,
            },
          ]}
          conventions={[
            "Annual compound growth model standard for mutual fund and equity historical analysis.",
            "Assumes continuous reinvestment of all capital gains and dividends throughout the tenure.",
            "Taxes on equity LTCG (above ₹1.25 Lakh per financial year) are not deducted in gross mathematical models.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators currentSlug="/lumpsum-calculator" links={relatedLinks} />
      }
    />
  );
};
