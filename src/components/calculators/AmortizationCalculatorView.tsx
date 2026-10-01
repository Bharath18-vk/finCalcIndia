"use client";

import React, { useState, useMemo } from "react";
import { calculateEMI } from "@/lib/calculators/emi";
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

export interface AmortizationCalculatorViewProps {
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

export const AmortizationCalculatorView: React.FC<AmortizationCalculatorViewProps> = ({
  title,
  badge = "Repayment Schedule",
  description,
  initialPrincipal,
  initialAnnualRate,
  initialTenureYears,
  benchmarkNote = "8.50% Floating Home Loan Benchmark",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [scheduleView, setScheduleView] = useState<"yearly" | "monthly">("yearly");

  const result = useMemo(() => {
    return calculateEMI({
      principal,
      annualRate,
      tenureYears,
    });
  }, [principal, annualRate, tenureYears]);

  const handlePrincipalChange = (val: number) => {
    setPrincipal(val);
    trackCalculatorUsed("amortization", "principal");
    trackCalculatorResultGenerated("amortization");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("amortization", "rate");
    trackCalculatorResultGenerated("amortization");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("amortization", "tenure");
    trackCalculatorResultGenerated("amortization");
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
          <CurrencyInput
            label="Total Loan Principal"
            value={principal}
            onChange={handlePrincipalChange}
            min={50000}
            max={100000000}
            step={50000}
            presets={[
              { label: "₹20 Lakh", value: 2000000 },
              { label: "₹30 Lakh", value: 3000000 },
              { label: "₹50 Lakh", value: 5000000 },
              { label: "₹75 Lakh", value: 7500000 },
            ]}
            helperText="Sanctioned loan amount to be amortized."
          />

          <PercentageInput
            label="Annual Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={4.0}
            max={24.0}
            step={0.05}
            presets={[
              { label: "8.50% (Home Loan)", value: 8.5 },
              { label: "9.00%", value: 9.0 },
              { label: "11.0% (Personal)", value: 11.0 },
            ]}
            helperText="Compounded monthly on reducing balance basis."
          />

          <TenureInput
            label="Repayment Tenure"
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
            helperText="Duration of the amortized repayment term."
          />
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Monthly EMI"
              value={formatINR(result.monthlyEMI)}
              subtext={`For ${result.totalMonths} months (${formatTenureYears(result.totalMonths / 12)})`}
              highlight
            />
            <ResultCard
              label="Total Interest Payable"
              value={formatINR(result.totalInterest)}
              subtext={`${result.interestPrincipalRatio}% of total loan amount`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Payment (P + I)"
              value={formatINR(result.totalPayment)}
              subtext="Total cash outflow over loan life"
            />
            <ResultCard
              label="Interest to Principal Ratio"
              value={`${result.interestPrincipalRatio}%`}
              subtext="Total interest divided by principal"
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Principal Repayment", value: result.principal, color: "#1e3a8a" },
              { label: "Total Interest Cost", value: result.totalInterest, color: "#f59e0b" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Complete Loan Amortization Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Reducing balance breakdown of principal and interest per period</p>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setScheduleView("yearly")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    scheduleView === "yearly"
                      ? "bg-white text-blue-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Yearly View
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView("monthly")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    scheduleView === "monthly"
                      ? "bg-white text-blue-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly View ({result.totalMonths} Mos)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-3">{scheduleView === "yearly" ? "Year" : "Month"}</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Principal Repaid</th>
                    <th className="px-4 py-3 text-right">Interest Charged</th>
                    <th className="px-4 py-3 text-right">Total Installment</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(scheduleView === "yearly" ? result.yearlySchedule : result.monthlySchedule).map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {scheduleView === "yearly" ? `Year ${row.period}` : `Month ${row.period}`}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(row.openingBalance)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-blue-800">{formatINR(row.principalPaid)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-amber-700">{formatINR(row.interestPaid)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{formatINR(row.totalPayment)}</td>
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
          calculatorName="Loan Amortization Schedule"
          formula="EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)"
          variables={[
            { symbol: "P", description: "Principal loan amount borrowed" },
            { symbol: "r", description: "Monthly interest rate = Annual Rate / 12 / 100" },
            { symbol: "n", description: "Loan tenure in number of months" },
          ]}
          notes={[
            "During the initial years of a loan, a major portion of each monthly EMI goes towards interest charges, with only a small portion reducing principal.",
            "As the principal balance reduces over time, the interest component decreases and the principal repayment component accelerates.",
            "Prepayments made in the first 30% to 50% of the loan tenure have the most dramatic impact on reducing total interest liability.",
            "Amortization tables allow you to track your exact outstanding balance for tax deduction calculations under Section 24(b) and Section 80C.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
