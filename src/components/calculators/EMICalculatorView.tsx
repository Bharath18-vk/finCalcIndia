"use client";

import React, { useState, useMemo } from "react";
import { calculateEMI, EMIInput } from "@/lib/calculators/emi";
import { formatINR, formatPercentage, formatTenureYears } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { TenureInput } from "@/components/ui/TenureInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { AmortizationTable } from "@/components/ui/AmortizationTable";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface EMICalculatorViewProps {
  calculatorType: "emi" | "home-loan-emi" | "personal-loan-emi" | "car-loan-emi";
  title: string;
  badge?: string;
  description: string;
  initialPrincipal: number;
  initialAnnualRate: number;
  initialTenureYears: number;
  minPrincipal?: number;
  maxPrincipal?: number;
  principalStep?: number;
  principalPresets?: { label: string; value: number }[];
  minRate?: number;
  maxRate?: number;
  rateStep?: number;
  benchmarkNote?: string;
  asOfDate?: string;
  minTenureYears?: number;
  maxTenureYears?: number;
  tenurePresets?: { label: string; years: number }[];
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
  customExplainerText?: string;
}

export const EMICalculatorView: React.FC<EMICalculatorViewProps> = ({
  calculatorType,
  title,
  badge,
  description,
  initialPrincipal,
  initialAnnualRate,
  initialTenureYears,
  minPrincipal = 10000,
  maxPrincipal = 100000000,
  principalStep = 50000,
  principalPresets,
  minRate = 5,
  maxRate = 25,
  rateStep = 0.05,
  benchmarkNote,
  asOfDate,
  minTenureYears = 1,
  maxTenureYears = 30,
  tenurePresets,
  breadcrumbs,
  faqs,
  relatedLinks,
  customExplainerText,
}) => {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [tenureMonths, setTenureMonths] = useState(0);

  const result = useMemo(() => {
    return calculateEMI({
      principal,
      annualRate,
      tenureYears,
      tenureMonths,
    });
  }, [principal, annualRate, tenureYears, tenureMonths]);

  const handlePrincipalChange = (val: number) => {
    setPrincipal(val);
    trackCalculatorUsed(calculatorType, "principal");
    trackCalculatorResultGenerated(calculatorType);
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed(calculatorType, "rate");
    trackCalculatorResultGenerated(calculatorType);
  };

  const handleTenureYearsChange = (val: number) => {
    setTenureYears(val);
    trackCalculatorUsed(calculatorType, "tenureYears");
    trackCalculatorResultGenerated(calculatorType);
  };

  const handleTenureMonthsChange = (val: number) => {
    setTenureMonths(val);
    trackCalculatorUsed(calculatorType, "tenureMonths");
    trackCalculatorResultGenerated(calculatorType);
  };

  const handleReset = () => {
    setPrincipal(initialPrincipal);
    setAnnualRate(initialAnnualRate);
    setTenureYears(initialTenureYears);
    setTenureMonths(0);
  };

  const chartData = [
    { name: "Principal Loan Amount", value: result.principal, color: "#16a34a" },
    { name: "Total Interest Payable", value: result.totalInterest, color: "#d97706" },
  ];

  const directAnswer = `The monthly EMI on a ${formatINR(result.principal)} loan at ${formatPercentage(
    result.annualRate
  )} interest for ${formatTenureYears(
    result.totalMonths / 12
  )} is ${formatINR(result.monthlyEMI)}. Total interest payable over the tenure is ${formatINR(
    result.totalInterest
  )}, bringing the total repayment amount to ${formatINR(result.totalPayment)}.`;

  const formulaSteps = [
    {
      label: "Step 1: Monthly Interest Rate (r)",
      expression: `r = (${result.annualRate}% / 12) / 100 = ${(
        result.annualRate /
        12 /
        100
      ).toFixed(6)}`,
      explanation:
        "The annual interest rate is divided by 12 months and normalized as a decimal fraction.",
    },
    {
      label: "Step 2: Total Repayment Months (n)",
      expression: `n = ${tenureYears} Years × 12 + ${tenureMonths} Months = ${result.totalMonths} Months`,
      explanation: "Loan tenure is converted to the total number of monthly installment cycles.",
    },
    {
      label: "Step 3: Equated Monthly Installment (EMI)",
      expression: `EMI = [${formatINR(result.principal)} × r × (1 + r)^${result.totalMonths}] / [(1 + r)^${result.totalMonths} - 1] = ${formatINR(result.monthlyEMI)}`,
      explanation:
        "Applying the standard reducing-balance amortization formula ensures equal payments each month while interest gradually declines as principal is paid down.",
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
            label="Loan Amount (Principal)"
            value={principal}
            onChange={handlePrincipalChange}
            min={minPrincipal}
            max={maxPrincipal}
            step={principalStep}
            presets={principalPresets}
            helperText="Enter the total loan amount sanctioned or needed."
          />

          <PercentageInput
            label="Annual Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={minRate}
            max={maxRate}
            step={rateStep}
            benchmarkNote={benchmarkNote}
            helperText="Floating or fixed annual interest rate quoted by your bank."
          />

          <TenureInput
            label="Loan Tenure"
            years={tenureYears}
            months={tenureMonths}
            onYearsChange={handleTenureYearsChange}
            onMonthsChange={handleTenureMonthsChange}
            minYears={minTenureYears}
            maxYears={maxTenureYears}
            presets={tenurePresets}
            helperText="Total duration over which you intend to repay the loan."
          />
        </div>
      }
      resultsSlot={
        <ResultCard
          primaryTitle="Monthly Loan EMI"
          primaryValue={result.monthlyEMI}
          primarySubtitle={`Monthly payment for ${formatTenureYears(tenureYears, tenureMonths)}`}
          secondaryMetrics={[
            {
              label: "Principal Amount",
              value: result.principal,
              color: "bg-emerald-500",
            },
            {
              label: "Total Interest",
              value: result.totalInterest,
              color: "bg-amber-500",
              subtext: `${result.interestPrincipalRatio}% of loan`,
            },
            {
              label: "Total Amount Payable",
              value: result.totalPayment,
              color: "bg-slate-400",
            },
          ]}
          ratioNote={`Interest constitutes ${result.interestPaymentRatio}% of your total repayment obligation.`}
          onReset={handleReset}
        />
      }
      chartSlot={
        <FinancialBreakdownChart
          data={chartData}
          title="Principal vs Total Interest Breakdown"
        />
      }
      comparisonTablesSlot={
        <div className="space-y-6">
          {/* Rate Sensitivity Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Interest Rate Sensitivity (±1% to ±2%)
            </h3>
            <p className="text-xs text-slate-500">
              See how floating rate fluctuations by the RBI or your lender affect your monthly EMI and overall interest cost.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Interest Rate Sensitivity Analysis Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Interest Rate</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Monthly EMI</th>
                    <th scope="col" className="py-2.5 px-3 text-right">EMI Difference</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Interest</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.sensitivityTable.map((sc) => {
                    const isBase = sc.rate === annualRate;
                    return (
                      <tr
                        key={sc.rate}
                        className={isBase ? "bg-emerald-50/70 font-bold text-emerald-950" : "hover:bg-slate-50/60"}
                      >
                        <th scope="row" className="py-2.5 px-3">
                          {sc.rate}% {isBase && "(Current)"}
                        </th>
                        <td className="py-2.5 px-3 text-right">{formatINR(sc.emi)}</td>
                        <td className="py-2.5 px-3 text-right">
                          {sc.differenceEmi === 0
                            ? "-"
                            : sc.differenceEmi > 0
                            ? `+${formatINR(sc.differenceEmi)}`
                            : `-${formatINR(Math.abs(sc.differenceEmi))}`}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-700">{formatINR(sc.totalInterest)}</td>
                        <td className="py-2.5 px-3 text-right">{formatINR(sc.totalPayment)}</td>
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
              Tenure Comparison Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Longer tenures reduce your monthly EMI burden but significantly increase total interest paid to the lender.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <caption className="sr-only">Tenure Comparison Analysis Table</caption>
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th scope="col" className="py-2.5 px-3">Tenure</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Monthly EMI</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Interest</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Total Repayment</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Interest / Loan %</th>
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
                          {tc.tenureYears} Years {isCurrent && "(Current)"}
                        </th>
                        <td className="py-2.5 px-3 text-right">{formatINR(tc.emi)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700">{formatINR(tc.totalInterest)}</td>
                        <td className="py-2.5 px-3 text-right">{formatINR(tc.totalPayment)}</td>
                        <td className="py-2.5 px-3 text-right">{tc.interestToPrincipalRatio.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Amortization Schedule */}
          <AmortizationTable
            yearlySchedule={result.yearlySchedule}
            monthlySchedule={result.monthlySchedule}
            title="Loan Amortization & Repayment Schedule"
            type="loan"
          />
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
          title="How EMI Is Calculated (Reducing Balance Method)"
          formula="EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]"
          variables={[
            {
              symbol: "P",
              name: "Principal Loan Amount",
              valueDescription: `${formatINR(result.principal)} entered above`,
            },
            {
              symbol: "r",
              name: "Monthly Interest Rate",
              valueDescription: `Annual rate (${result.annualRate}%) ÷ 12 ÷ 100`,
            },
            {
              symbol: "n",
              name: "Tenure in Months",
              valueDescription: `${result.totalMonths} total installments`,
            },
          ]}
          steps={formulaSteps}
          conventions={[
            "Compounded monthly using the reducing balance method standard across Indian commercial banks.",
            "Monthly EMI is rounded to the nearest integer rupee for practical payment execution.",
            "The final installment automatically adjusts for fractional paise differences to settle principal to exactly zero.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators currentSlug={`/${calculatorType}`} links={relatedLinks} />
      }
    />
  );
};
