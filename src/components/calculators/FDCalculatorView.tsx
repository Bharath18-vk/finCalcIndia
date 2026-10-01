"use client";

import React, { useState, useMemo } from "react";
import { calculateFD, CompoundingFrequency } from "@/lib/calculators/fd";
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

export interface FDCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialPrincipal: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  initialSeniorCitizen?: boolean;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
  customExplainerText?: string;
}

export const FDCalculatorView: React.FC<FDCalculatorViewProps> = ({
  title,
  badge = "Bank Deposits",
  description,
  initialPrincipal,
  initialAnnualRate,
  initialTenureYears,
  initialSeniorCitizen = false,
  benchmarkNote = "6.80% Illustrative Rate (Quarterly Compounding)",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
  customExplainerText,
}) => {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>("quarterly");
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(initialSeniorCitizen);

  const result = useMemo(() => {
    return calculateFD({
      principal,
      annualRate,
      tenureYears,
      tenureMonths,
      compoundingFrequency,
      isSeniorCitizen,
    });
  }, [principal, annualRate, tenureYears, tenureMonths, compoundingFrequency, isSeniorCitizen]);

  const handlePrincipalChange = (val: number) => {
    setPrincipal(val);
    trackCalculatorUsed("fd", "principal");
    trackCalculatorResultGenerated("fd");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("fd", "rate");
    trackCalculatorResultGenerated("fd");
  };

  const handleTenureYearsChange = (val: number) => {
    setTenureYears(val);
    trackCalculatorUsed("fd", "tenureYears");
    trackCalculatorResultGenerated("fd");
  };

  const handleTenureMonthsChange = (val: number) => {
    setTenureMonths(val);
    trackCalculatorUsed("fd", "tenureMonths");
    trackCalculatorResultGenerated("fd");
  };

  const handleReset = () => {
    setPrincipal(initialPrincipal);
    setAnnualRate(initialAnnualRate);
    setTenureYears(initialTenureYears);
    setTenureMonths(0);
    setCompoundingFrequency("quarterly");
    setIsSeniorCitizen(initialSeniorCitizen);
  };

  const chartData = [
    { name: "Deposited Principal", value: result.principal, color: "#16a34a" },
    { name: "Total Interest Earned", value: result.totalInterest, color: "#d97706" },
  ];

  const directAnswer = `A Fixed Deposit of ${formatINR(result.principal)} for ${formatTenureYears(
    tenureYears,
    tenureMonths
  )} at ${formatPercentage(result.effectiveRate)} (${compoundingFrequency} compounding${
    isSeniorCitizen ? ", including +0.50% senior citizen bonus" : ""
  }) yields a total maturity value of ${formatINR(
    result.maturityAmount
  )}. Total interest earned is ${formatINR(result.totalInterest)} with an effective annual yield of ${
    result.effectiveAnnualYield
  }%.`;

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
            label="Deposit Amount (Principal)"
            value={principal}
            onChange={handlePrincipalChange}
            min={10000}
            max={50000000}
            step={25000}
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹2 Lakh", value: 200000 },
              { label: "₹5 Lakh", value: 500000 },
              { label: "₹10 Lakh", value: 1000000 },
            ]}
          />

          <PercentageInput
            label="Annual Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={3}
            max={12}
            step={0.05}
            benchmarkNote={benchmarkNote}
            helperText="Nominal rate quoted by your bank."
          />

          <TenureInput
            label="Deposit Tenure"
            years={tenureYears}
            months={tenureMonths}
            onYearsChange={handleTenureYearsChange}
            onMonthsChange={handleTenureMonthsChange}
            minYears={1}
            maxYears={10}
            presets={[
              { label: "1 Year", years: 1 },
              { label: "2 Years", years: 2 },
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
            ]}
          />

          {/* Senior Citizen & Compounding Frequency Controls */}
          <div className="pt-2 space-y-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">Senior Citizen Rates (+0.50% p.a.)</span>
                <p className="text-[11px] text-slate-500">Applicable for Indian residents aged 60 and above.</p>
              </div>
              <input
                type="checkbox"
                id="senior-citizen-toggle"
                checked={isSeniorCitizen}
                onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="compounding-freq-select" className="text-xs font-semibold text-slate-700">Compounding Frequency</label>
              <select
                id="compounding-freq-select"
                value={compoundingFrequency}
                onChange={(e) => setCompoundingFrequency(e.target.value as CompoundingFrequency)}
                className="block w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="quarterly">Quarterly (RBI & Bank Standard)</option>
                <option value="monthly">Monthly Compounding</option>
                <option value="half-yearly">Half-Yearly Compounding</option>
                <option value="annual">Annual Compounding</option>
                <option value="simple">Simple Interest (Payout basis)</option>
              </select>
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <ResultCard
          primaryTitle="Maturity Deposit Amount"
          primaryValue={result.maturityAmount}
          primarySubtitle={`Includes ${formatINR(result.totalInterest)} accumulated interest`}
          secondaryMetrics={[
            {
              label: "Principal Deposit",
              value: result.principal,
              color: "bg-emerald-500",
            },
            {
              label: "Total Interest Earned",
              value: result.totalInterest,
              color: "bg-amber-500",
            },
            {
              label: "Effective Annual Yield (APY)",
              value: result.effectiveAnnualYield,
              formattedValue: `${result.effectiveAnnualYield}%`,
              color: "bg-slate-400",
            },
          ]}
          ratioNote={`Effective Annual Yield is ${result.effectiveAnnualYield}% due to ${compoundingFrequency} compounding.`}
          onReset={handleReset}
        />
      }
      chartSlot={
        <FinancialBreakdownChart
          data={chartData}
          title="Principal vs Interest Breakdown"
        />
      }
      comparisonTablesSlot={
        <div className="space-y-6">
          {/* Tenure Horizon Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              FD Maturity Schedule Across Tenures
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">FD Tenure Comparison Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Tenure</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Principal</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Interest</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Maturity Value</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Effective Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.tenureComparisonTable.map((tc) => {
                    const isCurrent = tc.tenureYears === tenureYears && tenureMonths === 0;
                    return (
                      <tr
                        key={tc.tenureYears}
                        className={isCurrent ? "bg-emerald-50/70 font-bold text-emerald-950" : "hover:bg-slate-50/60"}
                      >
                        <th scope="row" className="py-2.5 px-3">
                          {tc.tenureYears} Year{tc.tenureYears > 1 ? "s" : ""} {isCurrent && "(Current)"}
                        </th>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(tc.principal)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">{formatINR(tc.totalInterest)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(tc.maturityAmount)}</td>
                        <td className="py-2.5 px-3 text-right">{tc.effectiveAnnualYield}%</td>
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
          title="How Bank Fixed Deposit Interest Is Calculated"
          formula="A = P × (1 + r / n)^(n × t)"
          variables={[
            {
              symbol: "P",
              name: "Principal Deposit Amount",
              valueDescription: formatINR(result.principal),
            },
            {
              symbol: "r",
              name: "Effective Interest Rate (decimal)",
              valueDescription: `${result.effectiveRate}% p.a. (${result.effectiveRate / 100})`,
            },
            {
              symbol: "n",
              name: "Compounding Periods Per Year",
              valueDescription: "n = 4 for standard quarterly compounding",
            },
            {
              symbol: "t",
              name: "Tenure in Years",
              valueDescription: `${result.tenureInYears} years`,
            },
          ]}
          conventions={[
            "In accordance with RBI directives, Indian commercial banks compute cumulative term deposit interest with quarterly compounding.",
            "Senior citizens (aged 60+) receive an additional 0.50% p.a. standard interest premium across all tenure slabs.",
            "TDS (Tax Deducted at Source) under Section 194A is deducted by banks if annual interest exceeds ₹40,000 (₹50,000 for senior citizens), unless Form 15G/15H is submitted.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators currentSlug="/fd-calculator" links={relatedLinks} />
      }
    />
  );
};
