"use client";

import React, { useState, useMemo } from "react";
import { calculateEPF, EPF_CURRENT_STATUTORY_METADATA } from "@/lib/calculators/epf";
import { formatINR, formatPercentage } from "@/lib/formatters";
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

export interface EPFCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyBasic: number;
  initialCurrentAge?: number;
  initialRetirementAge?: number;
  initialIncrementRate?: number;
  initialInterestRate?: number;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const EPFCalculatorView: React.FC<EPFCalculatorViewProps> = ({
  title,
  badge = "EPFO Statutory Rate 8.25% (FY 2023-24 & 2024-25)",
  description,
  initialMonthlyBasic,
  initialCurrentAge = 25,
  initialRetirementAge = 58,
  initialIncrementRate = 5.0,
  initialInterestRate = 8.25,
  benchmarkNote = "8.25% EPFO Official Rate (FY 2023-24 & FY 2024-25)",
  asOfDate = "FY 2023-24 & FY 2024-25 (EPFO Notification)",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [currentMonthlyBasicSalary, setCurrentMonthlyBasicSalary] = useState(initialMonthlyBasic);
  const [currentAge, setCurrentAge] = useState(initialCurrentAge);
  const [retirementAge, setRetirementAge] = useState(initialRetirementAge);
  const [annualSalaryIncrementPercentage, setAnnualSalaryIncrementPercentage] = useState(initialIncrementRate);
  const [annualInterestRate, setAnnualInterestRate] = useState(initialInterestRate);
  const [currentEPFBalance, setCurrentEPFBalance] = useState(0);
  const [wageCeilingOption, setWageCeilingOption] = useState<"eps_capped_15k" | "both_capped_15k" | "uncapped">("eps_capped_15k");

  const result = useMemo(() => {
    return calculateEPF({
      currentMonthlyBasicSalary,
      currentAge,
      retirementAge,
      annualSalaryIncrementPercentage,
      annualInterestRate,
      currentEPFBalance,
      wageCeilingOption,
    });
  }, [
    currentMonthlyBasicSalary,
    currentAge,
    retirementAge,
    annualSalaryIncrementPercentage,
    annualInterestRate,
    currentEPFBalance,
    wageCeilingOption,
  ]);

  const handleBasicChange = (val: number) => {
    setCurrentMonthlyBasicSalary(val);
    trackCalculatorUsed("epf", "basicSalary");
    trackCalculatorResultGenerated("epf");
  };

  const directAnswer = `Starting with a monthly basic salary of ${formatINR(
    currentMonthlyBasicSalary
  )} at age ${currentAge} with an assumed ${annualSalaryIncrementPercentage}% annual salary increment and the current official ${formatPercentage(
    annualInterestRate
  )}% EPFO statutory interest rate (${EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear}), your accumulated EPF retirement corpus at age ${retirementAge} is estimated at ${formatINR(
    result.maturityCorpus
  )}. This comprises ${formatINR(
    result.totalEmployeeContribution
  )} in employee contributions, ${formatINR(
    result.totalEmployerContribution
  )} in employer EPF contributions, and ${formatINR(result.totalInterestEarned)} in cumulative compound interest.`;

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      directAnswer={directAnswer}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          {/* Statutory Rate Header Banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>EPFO Statutory Interest Rate: {annualInterestRate}% p.a.</span>
              <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-semibold">
                {EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear}
              </span>
            </div>
            <p className="text-amber-800 text-[11px]">
              Notified by Central Board of Trustees (CBT), EPFO. Interest is credited annually on March 31 based on monthly running balances. Note that EPFO rates are determined and notified annually.
            </p>
          </div>

          <CurrencyInput
            label="Current Monthly Basic Salary + DA"
            value={currentMonthlyBasicSalary}
            onChange={handleBasicChange}
            min={5000}
            max={2000000}
            step={1000}
            presets={[
              { label: "₹25,000", value: 25000 },
              { label: "₹40,000", value: 40000 },
              { label: "₹60,000", value: 60000 },
              { label: "₹1,00,000", value: 100000 },
            ]}
            helperText="The statutory salary component on which 12% EPF is computed."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Age (Years)
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.min(57, Math.max(18, Number(e.target.value))))}
                min={18}
                max={57}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Retirement Age (Years)
              </label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Math.min(65, Math.max(currentAge + 1, Number(e.target.value))))}
                min={currentAge + 1}
                max={65}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500">Standard EPFO superannuation age is 58.</span>
            </div>
          </div>

          <PercentageInput
            label="Annual Expected Salary Increment"
            value={annualSalaryIncrementPercentage}
            onChange={setAnnualSalaryIncrementPercentage}
            min={0}
            max={30}
            step={0.5}
            presets={[
              { label: "0%", value: 0 },
              { label: "5%", value: 5 },
              { label: "8%", value: 8 },
              { label: "10%", value: 10 },
            ]}
            helperText="Assumed percentage hike in basic salary every year."
          />

          <PercentageInput
            label="EPF Interest Rate (% p.a.)"
            value={annualInterestRate}
            onChange={setAnnualInterestRate}
            min={5.0}
            max={15.0}
            step={0.05}
            presets={[
              { label: "8.25% (Official)", value: 8.25 },
              { label: "8.15% (FY 22-23)", value: 8.15 },
              { label: "8.10% (FY 21-22)", value: 8.10 },
              { label: "8.50% (Historical)", value: 8.50 },
            ]}
            helperText={`Current statutory rate is 8.25% p.a. for ${EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear}.`}
          />

          <CurrencyInput
            label="Existing Accumulated EPF Balance (Optional)"
            value={currentEPFBalance}
            onChange={setCurrentEPFBalance}
            min={0}
            max={50000000}
            step={25000}
            helperText="Enter 0 if this is your first job or starting afresh."
          />

          {/* Statutory Wage Ceiling Option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Statutory Wage Ceiling / EPS Allocation
            </label>
            <select
              value={wageCeilingOption}
              onChange={(e) => setWageCeilingOption(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="eps_capped_15k">
                EPS Capped at ₹15,000 (Standard: 8.33% capped at ₹1,250/mo, excess to EPF)
              </option>
              <option value="both_capped_15k">
                Both EPF & EPS Capped at ₹15,000 (Deduction restricted to ₹1,800/mo)
              </option>
              <option value="uncapped">
                Uncapped EPS (8.33% of full basic to EPS, 3.67% to EPF)
              </option>
            </select>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Accumulated Retirement Corpus (at Age 58)"
              value={formatINR(result.maturityCorpus)}
              subtext={`After ${result.tenureYears} years of monthly compounding interest`}
              highlight
            />
            <ResultCard
              label="Total Compound Interest Earned"
              value={formatINR(result.totalInterestEarned)}
              subtext={`${((result.totalInterestEarned / result.maturityCorpus) * 100).toFixed(1)}% of final retirement wealth`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Employee Share</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.totalEmployeeContribution)}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Employer EPF</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.totalEmployerContribution)}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Employer EPS</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.totalEPSContribution)}</div>
            </div>
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Interest Earned", value: result.totalInterestEarned, color: "#059669" },
              { label: "Employee Contribution", value: result.totalEmployeeContribution, color: "#2563eb" },
              { label: "Employer EPF Share", value: result.totalEmployerContribution, color: "#d97706" },
            ]}
            title="EPF Corpus Composition at Retirement"
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Yearly Amortization Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Year-by-Year EPF Accumulation Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Projections with monthly compounding and annual interest credit at {annualInterestRate}% p.a.
              </p>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5">Year</th>
                    <th className="px-3 py-2.5">Age</th>
                    <th className="px-3 py-2.5 text-right">Basic/mo</th>
                    <th className="px-3 py-2.5 text-right">Employee Share</th>
                    <th className="px-3 py-2.5 text-right">Employer EPF</th>
                    <th className="px-3 py-2.5 text-right">Interest Accrued</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-700 font-medium">Year {row.year}</td>
                      <td className="px-3 py-2 text-slate-600">{row.age}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatINR(row.monthlyBasicSalary)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatINR(row.employeeContributionAnnual)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatINR(row.employerEPFContributionAnnual)}</td>
                      <td className="px-3 py-2 text-right text-emerald-700 font-medium">+{formatINR(row.interestEarnedInYear)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{formatINR(row.closingBalance)}</td>
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
          calculatorName="Employees' Provident Fund (EPF) Rules"
          formula="Closing Balance = Opening Balance + Monthly Deposits (12% Employee + 3.67% Employer) + Annual Compound Interest"
          variables={[
            { symbol: "Employee Share", description: "12% of Basic + DA deducted from employee pay" },
            { symbol: "Employer Share", description: "Total 12%: 8.33% to EPS (capped at ₹1,250 on ₹15,000 ceiling), remaining 3.67% to EPF" },
            { symbol: "EPFO Interest Rate", description: `Statutory 8.25% p.a. for ${EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear} (notified annually)` },
            { symbol: "Superannuation", description: "Standard EPFO retirement age is 58 years" },
          ]}
          notes={[
            `The statutory EPF rate of 8.25% applies to ${EPF_CURRENT_STATUTORY_METADATA.applicableFinancialYear}. Rates are evaluated and notified annually by the Central Board of Trustees (CBT), EPFO.`,
            "Interest is calculated monthly on the running month-end balance and credited to the member's account annually on March 31.",
            "EPF deposits qualify for Section 80C tax deduction under the Old Tax Regime (up to ₹1,50,000) and interest is completely tax-free if employee contribution is under ₹2,50,000 per financial year.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
