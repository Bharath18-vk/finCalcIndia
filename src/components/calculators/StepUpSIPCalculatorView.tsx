"use client";

import React, { useState, useMemo } from "react";
import { calculateStepUpSIP } from "@/lib/calculators/step-up-sip";
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

export interface StepUpSIPCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyInvestment: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  initialStepUpPercentage: number;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
  customExplainerText?: string;
}

export const StepUpSIPCalculatorView: React.FC<StepUpSIPCalculatorViewProps> = ({
  title,
  badge = "Top-Up SIP",
  description,
  initialMonthlyInvestment,
  initialAnnualRate,
  initialTenureYears,
  initialStepUpPercentage,
  breadcrumbs,
  faqs,
  relatedLinks,
  customExplainerText,
}) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(initialMonthlyInvestment);
  const [annualReturnRate, setAnnualReturnRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [annualStepUpPercentage, setAnnualStepUpPercentage] = useState(initialStepUpPercentage);

  const result = useMemo(() => {
    return calculateStepUpSIP({
      monthlyInvestment,
      annualReturnRate,
      tenureYears,
      annualStepUpPercentage,
    });
  }, [monthlyInvestment, annualReturnRate, tenureYears, annualStepUpPercentage]);

  const handleMonthlyChange = (val: number) => {
    setMonthlyInvestment(val);
    trackCalculatorUsed("step-up-sip", "monthlyInvestment");
    trackCalculatorResultGenerated("step-up-sip");
  };

  const handleRateChange = (val: number) => {
    setAnnualReturnRate(val);
    trackCalculatorUsed("step-up-sip", "returnRate");
    trackCalculatorResultGenerated("step-up-sip");
  };

  const handleTenureChange = (val: number) => {
    setTenureYears(val);
    trackCalculatorUsed("step-up-sip", "tenureYears");
    trackCalculatorResultGenerated("step-up-sip");
  };

  const handleStepUpChange = (val: number) => {
    setAnnualStepUpPercentage(val);
    trackCalculatorUsed("step-up-sip", "stepUpPercentage");
    trackCalculatorResultGenerated("step-up-sip");
  };

  const handleReset = () => {
    setMonthlyInvestment(initialMonthlyInvestment);
    setAnnualReturnRate(initialAnnualRate);
    setTenureYears(initialTenureYears);
    setAnnualStepUpPercentage(initialStepUpPercentage);
  };

  const chartData = [
    { name: "Total Invested", value: result.totalInvested, color: "#16a34a" },
    { name: "Estimated Wealth Gained", value: result.wealthGained, color: "#2563eb" },
  ];

  const directAnswer = `Starting with ${formatINR(
    result.initialMonthlyInvestment
  )}/month and increasing it by ${result.stepUpPercentage}% every year for ${formatTenureYears(
    result.tenureYears
  )} at ${formatPercentage(result.annualReturnRate)} p.a. generates an estimated maturity corpus of ${formatINR(
    result.futureValue
  )}. You invest ${formatINR(result.totalInvested)} in total and earn ${formatINR(
    result.wealthGained
  )} in wealth gains. This outperforms a constant flat SIP by an extra ${formatINR(
    result.differenceFutureValue
  )}.`;

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
            label="Initial Monthly SIP Amount"
            value={monthlyInvestment}
            onChange={handleMonthlyChange}
            min={500}
            max={500000}
            step={500}
            presets={[
              { label: "₹2,500", value: 2500 },
              { label: "₹5,000", value: 5000 },
              { label: "₹10,000", value: 10000 },
              { label: "₹25,000", value: 25000 },
            ]}
            helperText="Starting monthly installment for Year 1."
          />

          <PercentageInput
            label="Annual Step-Up (% Increase Every Year)"
            value={annualStepUpPercentage}
            onChange={handleStepUpChange}
            min={1}
            max={30}
            step={1}
            helperText="Typically corresponds to your expected annual salary raise (e.g. 5% to 15%)."
          />

          <PercentageInput
            label="Expected Return Rate (% p.a.)"
            value={annualReturnRate}
            onChange={handleRateChange}
            min={1}
            max={30}
            step={0.5}
            benchmarkNote="12% Historical Equity CAGR"
            helperText="Expected average annualized return on diversified equity funds."
          />

          <TenureInput
            label="Investment Time Horizon"
            years={tenureYears}
            onYearsChange={handleTenureChange}
            minYears={1}
            maxYears={35}
            allowMonths={false}
            presets={[
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
          primaryTitle="Estimated Step-Up Corpus"
          primaryValue={result.futureValue}
          primarySubtitle={`Final monthly installment: ${formatINR(result.finalMonthlyInvestment)}`}
          secondaryMetrics={[
            {
              label: "Total Invested",
              value: result.totalInvested,
              color: "bg-emerald-500",
            },
            {
              label: "Estimated Returns",
              value: result.wealthGained,
              color: "bg-blue-500",
            },
            {
              label: "Extra vs Flat SIP",
              value: result.differenceFutureValue,
              color: "bg-amber-500",
              subtext: `+${formatINR(result.differenceFutureValue)} bonus`,
            },
          ]}
          ratioNote={`Stepping up by ${result.stepUpPercentage}% annually increases your final maturity corpus by ${formatINR(
            result.differenceFutureValue
          )} compared to a static flat SIP.`}
          onReset={handleReset}
        />
      }
      chartSlot={
        <FinancialBreakdownChart
          data={chartData}
          title="Step-Up Invested Capital vs Returns"
        />
      }
      comparisonTablesSlot={
        <div className="space-y-6">
          {/* Comparison Table: Step-Up SIP vs Regular Constant SIP */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Step-Up SIP vs Regular Constant SIP Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Direct comparison of increasing your investments alongside career growth versus leaving your installment fixed.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Step-Up vs Regular SIP Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Strategy</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Initial Monthly</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Final Monthly</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Maturity Corpus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                    <th scope="row" className="py-2.5 px-3">
                      Step-Up SIP (+{result.stepUpPercentage}%/yr)
                    </th>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.initialMonthlyInvestment)}</td>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.finalMonthlyInvestment)}</td>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.totalInvested)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800">{formatINR(result.futureValue)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <th scope="row" className="py-2.5 px-3 text-slate-600">
                      Regular Constant SIP (Flat)
                    </th>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.initialMonthlyInvestment)}</td>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.initialMonthlyInvestment)}</td>
                    <td className="py-2.5 px-3 text-right">{formatINR(result.regularSIPTotalInvested)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-800">{formatINR(result.regularSIPFutureValue)}</td>
                  </tr>
                  <tr className="bg-amber-50/50 font-bold text-amber-900 border-t-2 border-amber-200">
                    <th scope="row" className="py-2.5 px-3">
                      Step-Up Advantage
                    </th>
                    <td className="py-2.5 px-3 text-right">-</td>
                    <td className="py-2.5 px-3 text-right">+{formatINR(result.finalMonthlyInvestment - result.initialMonthlyInvestment)}</td>
                    <td className="py-2.5 px-3 text-right">+{formatINR(result.differenceInvested)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">+{formatINR(result.differenceFutureValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Yearly Progression */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Year-by-Year Step-Up Progression Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Yearly Step-Up Progression Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Year</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Monthly Deposit</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Invested in Year</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Cumulative Invested</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Wealth Gained</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Year-End Corpus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-bold text-slate-900">
                        Year {row.year}
                      </th>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(row.monthlyContribution)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(row.investedThisYear)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(row.cumulativeInvested)}</td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-semibold">{formatINR(row.wealthGained)}</td>
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
          title="How Step-Up SIP Compounding Works"
          formula="FV_m = (FV_{m-1} + P_m) × (1 + r)"
          variables={[
            {
              symbol: "P_m",
              name: "Monthly Installment in Month m",
              valueDescription: "Increases by the step-up percentage every 12 months",
            },
            {
              symbol: "r",
              name: "Monthly Expected Return Rate",
              valueDescription: `Annual rate (${result.annualReturnRate}%) ÷ 12 ÷ 100`,
            },
            {
              symbol: "Step-Up",
              name: "Annual Increment Factor",
              valueDescription: `+${result.stepUpPercentage}% applied annually at months 13, 25, 37...`,
            },
          ]}
          conventions={[
            "Compounded on a month-by-month discrete simulation basis with monthly contributions credited at month start.",
            "Step-up is applied at the beginning of each 12-month interval, mirroring typical Indian corporate annual appraisal cycles.",
            "Illustrative calculations assume consistent annual return performance across the holding period.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators currentSlug="/step-up-sip-calculator" links={relatedLinks} />
      }
    />
  );
};
