"use client";

import React, { useState, useMemo } from "react";
import { calculateRD } from "@/lib/calculators/rd";
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

export interface RDCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyDeposit: number;
  initialAnnualRate: number;
  initialTenureMonths: number;
  initialSeniorCitizen?: boolean;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const RDCalculatorView: React.FC<RDCalculatorViewProps> = ({
  title,
  badge = "Recurring Deposit",
  description,
  initialMonthlyDeposit,
  initialAnnualRate,
  initialTenureMonths,
  initialSeniorCitizen = false,
  benchmarkNote = "6.80% Illustrative Rate (Quarterly Compounding)",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(initialMonthlyDeposit);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(Math.floor(initialTenureMonths / 12) || 1);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(initialSeniorCitizen);

  const tenureMonths = tenureYears * 12;

  const result = useMemo(() => {
    return calculateRD({
      monthlyDeposit,
      annualRate,
      tenureMonths,
      isSeniorCitizen,
    });
  }, [monthlyDeposit, annualRate, tenureMonths, isSeniorCitizen]);

  const handleDepositChange = (val: number) => {
    setMonthlyDeposit(val);
    trackCalculatorUsed("rd", "monthlyDeposit");
    trackCalculatorResultGenerated("rd");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("rd", "rate");
    trackCalculatorResultGenerated("rd");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("rd", "tenure");
    trackCalculatorResultGenerated("rd");
  };

  const interestPercentageOfDeposit =
    result.totalDeposit > 0
      ? Number(((result.totalInterest / result.totalDeposit) * 100).toFixed(1))
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
            label="Monthly Deposit Amount"
            value={monthlyDeposit}
            onChange={handleDepositChange}
            min={500}
            max={500000}
            step={500}
            presets={[
              { label: "₹2,000", value: 2000 },
              { label: "₹5,000", value: 5000 },
              { label: "₹10,000", value: 10000 },
              { label: "₹25,000", value: 25000 },
            ]}
            helperText="Monthly installment deposited into your recurring deposit account."
          />

          <PercentageInput
            label="Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={3.0}
            max={12.0}
            step={0.05}
            presets={[
              { label: "6.50%", value: 6.5 },
              { label: "6.80% (Benchmark)", value: 6.8 },
              { label: "7.00%", value: 7.0 },
              { label: "7.50%", value: 7.5 },
            ]}
            helperText="Compounded quarterly per standard Indian banking and Post Office regulations."
          />

          <TenureInput
            label="Tenure"
            years={tenureYears}
            onChangeYears={handleTenureChange}
            minYears={1}
            maxYears={10}
            presets={[
              { label: "1 Year", years: 1 },
              { label: "2 Years", years: 2 },
              { label: "3 Years", years: 3 },
              { label: "5 Years", years: 5 },
            ]}
            helperText="Available in 1 to 10 year maturities across commercial banks."
          />

          {/* Senior Citizen Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <div>
                <span className="text-sm font-semibold text-slate-800">Senior Citizen (+0.50% p.a.)</span>
                <p className="text-xs text-slate-500">Applicable for Indian resident depositors aged 60+</p>
              </div>
              <input
                type="checkbox"
                checked={isSeniorCitizen}
                onChange={(e) => {
                  setIsSeniorCitizen(e.target.checked);
                  trackCalculatorUsed("rd", "seniorCitizenToggle");
                  trackCalculatorResultGenerated("rd");
                }}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-2"
              />
            </label>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Maturity Payout"
              value={formatINR(result.maturityAmount)}
              subtext={`After ${formatTenureYears(result.tenureYears)} of monthly installments`}
              highlight
            />
            <ResultCard
              label="Total Interest Earned"
              value={formatINR(result.totalInterest)}
              subtext={`+${interestPercentageOfDeposit}% over total deposit`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Invested Amount"
              value={formatINR(result.totalDeposit)}
              subtext={`${result.tenureMonths} monthly deposits of ${formatINR(result.monthlyDeposit)}`}
            />
            <ResultCard
              label="Effective Annual Yield"
              value={`${result.effectiveAnnualYield}%`}
              subtext={`Contracted rate: ${formatPercentage(result.effectiveRate)}% p.a.`}
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Principal Deposited", value: result.totalDeposit, color: "#1e3a8a" },
              { label: "Interest Earned", value: result.totalInterest, color: "#059669" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Yearly Growth Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Year-by-Year RD Progression</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cumulative deposits and interest accrual schedule</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3 text-right">Deposited to Date</th>
                    <th className="px-4 py-3 text-right">Interest in Year</th>
                    <th className="px-4 py-3 text-right">Cumulative Interest</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">Year {row.year}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatINR(row.depositedSoFar)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">+{formatINR(row.interestEarnedYear)}</td>
                      <td className="px-4 py-3 text-right text-emerald-800">{formatINR(row.cumulativeInterest)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tenure Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Tenure Sensitivity for {formatINR(monthlyDeposit)}/Month</h3>
              <p className="text-xs text-slate-500 mt-0.5">Maturity values at {formatPercentage(result.effectiveRate)}% across standard deposit terms</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Tenure</th>
                    <th className="px-4 py-3 text-right">Total Deposited</th>
                    <th className="px-4 py-3 text-right">Total Interest</th>
                    <th className="px-4 py-3 text-right">Maturity Amount</th>
                    <th className="px-4 py-3 text-right">Annual Yield (APY)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.tenureComparisonTable.map((item) => (
                    <tr
                      key={item.tenureMonths}
                      className={item.tenureMonths === tenureMonths ? "bg-blue-50/50 font-medium" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-3 text-slate-800">
                        {item.tenureMonths >= 12
                          ? `${item.tenureYears} Years (${item.tenureMonths} mos)`
                          : `${item.tenureMonths} Months`}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatINR(item.totalDeposit)}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">+{formatINR(item.totalInterest)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(item.maturityAmount)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.effectiveAnnualYield}%</td>
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
          calculatorName="Recurring Deposit (RD)"
          formula="M = P * [ (1 + q)^(n/3) - 1 ] / [ 1 - (1 + q)^(-1/3) ]"
          variables={[
            { symbol: "M", description: "Maturity value paid to the depositor" },
            { symbol: "P", description: "Monthly installment amount" },
            { symbol: "q", description: "Quarterly interest rate = Annual Rate / 400" },
            { symbol: "n", description: "Total tenure in months" },
          ]}
          notes={[
            "Compounded quarterly in accordance with Indian Banks' Association (IBA) and Reserve Bank of India (RBI) directives.",
            "Each monthly installment stays invested for a different number of months, earning compound interest until final maturity.",
            "Senior citizens (aged 60 and above) generally receive an additional 0.50% per annum across Indian public and private sector commercial banks.",
            "Under Section 194A, TDS is applicable on cumulative bank interest across branches exceeding ₹40,000 per financial year (₹50,000 for senior citizens).",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
