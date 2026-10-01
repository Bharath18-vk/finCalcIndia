"use client";

import React, { useState, useMemo } from "react";
import { calculateSalary, ProfessionalTaxState, STATE_PT_CONFIGS } from "@/lib/calculators/salary";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface SalaryCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialAnnualCTC: number;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const SalaryCalculatorView: React.FC<SalaryCalculatorViewProps> = ({
  title,
  badge = "CTC to In-Hand (AY 2026-27)",
  description,
  initialAnnualCTC,
  asOfDate = "FY 2025-26 & AY 2026-27",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [annualCTC, setAnnualCTC] = useState(initialAnnualCTC);
  const [basicPercentage, setBasicPercentage] = useState(40);
  const [isMetroHRA, setIsMetroHRA] = useState(true);
  const [statePT, setStatePT] = useState<ProfessionalTaxState>("maharashtra");
  const [customPTMonthly, setCustomPTMonthly] = useState(200);
  const [epfCapWageCeiling, setEpfCapWageCeiling] = useState(false);
  const [taxRegime, setTaxRegime] = useState<"new" | "old">("new");
  const [assessmentYear, setAssessmentYear] = useState<"2026-27" | "2025-26">("2026-27");

  const result = useMemo(() => {
    return calculateSalary({
      annualCTC,
      basicPercentage,
      hraPercentage: isMetroHRA ? 50 : 40,
      includeEmployerPFInCTC: true,
      statePT,
      customProfessionalTaxMonthly: customPTMonthly,
      epfCapWageCeiling,
      taxRegime,
      assessmentYear,
    });
  }, [annualCTC, basicPercentage, isMetroHRA, statePT, customPTMonthly, epfCapWageCeiling, taxRegime, assessmentYear]);

  const handleCTCChange = (val: number) => {
    setAnnualCTC(val);
    trackCalculatorUsed("salary", "annualCTC");
    trackCalculatorResultGenerated("salary");
  };

  const directAnswer = `For an annual Cost to Company (CTC) of ${formatINR(
    annualCTC
  )}, your estimated net in-hand take-home salary is ${formatINR(
    result.netTakeHomeMonthly
  )} per month (${formatINR(
    result.netTakeHomeAnnual
  )} annually) under the ${taxRegime === "new" ? "New" : "Old"} Tax Regime for AY ${assessmentYear}, after deducting Employee EPF (${formatINR(
    result.employeePFMonthly
  )}/mo), Professional Tax in ${result.professionalTaxStateLabel} (${formatINR(result.professionalTaxMonthly)}/mo), and TDS (${formatINR(
    result.taxMonthly
  )}/mo).`;

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
          <CurrencyInput
            label="Annual Cost to Company (CTC)"
            value={annualCTC}
            onChange={handleCTCChange}
            min={100000}
            max={100000000}
            step={25000}
            presets={[
              { label: "₹8 Lakh", value: 800000 },
              { label: "₹12.75 Lakh (Tax-Free)", value: 1275000 },
              { label: "₹15 Lakh", value: 1500000 },
              { label: "₹25 Lakh", value: 2500000 },
            ]}
            helperText="Total annual gross package offered by your employer."
          />

          {/* Basic Salary % of CTC */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Basic Salary Proportion of CTC
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "40% (Standard)", value: 40 },
                { label: "50% (High Basic)", value: 50 },
                { label: "30% (Low Basic)", value: 30 },
              ].map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => {
                    setBasicPercentage(b.value);
                    trackCalculatorUsed("salary", "basicPct");
                  }}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                    basicPercentage === b.value
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Indian companies typically allocate 40% to 50% of CTC to Basic Salary.
            </p>
          </div>

          {/* State-Specific Professional Tax Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Work State (Professional Tax Rules)
            </label>
            <select
              value={statePT}
              onChange={(e) => setStatePT(e.target.value as ProfessionalTaxState)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="maharashtra">Maharashtra (₹200/mo, ₹300 Feb = ₹2,500/yr)</option>
              <option value="karnataka">Karnataka (₹200/mo for gross &gt; ₹15,000)</option>
              <option value="telangana_ap">Telangana & Andhra Pradesh (₹200/mo)</option>
              <option value="tamilnadu">Tamil Nadu (₹1,250 half-yearly = ₹2,500/yr)</option>
              <option value="westbengal">West Bengal (₹200/mo)</option>
              <option value="gujarat">Gujarat (₹200/mo)</option>
              <option value="nil_pt_state">Delhi / Haryana / UP / Rajasthan (No PT)</option>
              <option value="custom">Custom Monthly Amount</option>
            </select>
            {statePT === "custom" && (
              <div className="mt-2">
                <CurrencyInput
                  label="Custom Monthly Professional Tax"
                  value={customPTMonthly}
                  onChange={setCustomPTMonthly}
                  min={0}
                  max={2500}
                  step={50}
                  helperText="Capped constitutionally at ₹2,500 per year."
                />
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">{result.professionalTaxNotes}</p>
          </div>

          {/* Tax Regime & Assessment Year Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tax Regime & Slabs for Monthly TDS
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAssessmentYear("2026-27")}
                className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  assessmentYear === "2026-27"
                    ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                AY 2026-27 (Current)
              </button>
              <button
                type="button"
                onClick={() => setAssessmentYear("2025-26")}
                className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  assessmentYear === "2025-26"
                    ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                AY 2025-26
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTaxRegime("new");
                  trackCalculatorUsed("salary", "taxRegimeNew");
                }}
                className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                  taxRegime === "new"
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                New Regime (Default)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaxRegime("old");
                  trackCalculatorUsed("salary", "taxRegimeOld");
                }}
                className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                  taxRegime === "old"
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Old Tax Regime
              </button>
            </div>
          </div>

          {/* Options: Metro City and EPF Cap */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">Metro City (50% HRA)</span>
                <p className="text-xs text-slate-500">Delhi, Mumbai, Kolkata, Chennai (40% for other cities)</p>
              </div>
              <input
                type="checkbox"
                checked={isMetroHRA}
                onChange={(e) => setIsMetroHRA(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">Cap EPF at Statutory ₹15,000 Wage Ceiling</span>
                <p className="text-xs text-slate-500">Limits monthly PF deduction to ₹1,800/mo (higher monthly take-home)</p>
              </div>
              <input
                type="checkbox"
                checked={epfCapWageCeiling}
                onChange={(e) => setEpfCapWageCeiling(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Net Monthly In-Hand Salary"
              value={formatINR(result.netTakeHomeMonthly)}
              subtext={`${result.takeHomePercentage}% of total CTC credited to bank`}
              highlight
            />
            <ResultCard
              label="Annual Take-Home Pay"
              value={formatINR(result.netTakeHomeAnnual)}
              subtext={`Gross Salary: ${formatINR(result.grossAnnualSalary)}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Gross Monthly</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.grossMonthlySalary)}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Employee PF</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.employeePFMonthly)}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly PT</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.professionalTaxMonthly)}</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly TDS</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{formatINR(result.taxMonthly)}</div>
            </div>
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Net Take-Home Pay", value: result.netTakeHomeAnnual, color: "#059669" },
              { label: "Employee PF (Retirement)", value: result.employeePFAnnual, color: "#2563eb" },
              { label: "Income Tax (TDS)", value: result.taxAnnual, color: "#dc2626" },
              { label: "Employer PF Contribution", value: result.employerPFAnnual, color: "#d97706" },
              { label: "Professional Tax", value: result.professionalTaxAnnual, color: "#7c3aed" },
            ]}
            title="Total CTC Decomposition & Outflows"
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Detailed Itemized Salary Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Comprehensive CTC to In-Hand Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Itemized components of Gross Salary, Statutory Deductions, and Employer Contributions
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Component</th>
                    <th className="px-4 py-3 text-right">Monthly</th>
                    <th className="px-4 py-3 text-right">Annual</th>
                    <th className="px-4 py-3 text-right">% of CTC</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/70 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <td colSpan={5} className="px-4 py-2">Part A: Gross Salary Earnings</td>
                  </tr>
                  {result.earningsBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{item.component}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(item.monthly)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(item.annual)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{item.percentageOfCTC}%</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{item.description}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/40 font-bold text-slate-900 border-t border-emerald-200">
                    <td className="px-4 py-2.5">Total Gross Salary (A)</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800">{formatINR(result.grossMonthlySalary)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800">{formatINR(result.grossAnnualSalary)}</td>
                    <td className="px-4 py-2.5 text-right">{((result.grossAnnualSalary / result.annualCTC) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">Pre-deduction earnings paid by company</td>
                  </tr>

                  <tr className="bg-slate-50/70 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <td colSpan={5} className="px-4 py-2">Part B: Employee Deductions (Subtracted from Gross)</td>
                  </tr>
                  {result.deductionsBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{item.component}</td>
                      <td className="px-4 py-2.5 text-right text-red-600 font-semibold">-{formatINR(item.monthly)}</td>
                      <td className="px-4 py-2.5 text-right text-red-600 font-semibold">-{formatINR(item.annual)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{item.percentageOfCTC}%</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{item.description}</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50/40 font-bold text-red-950 border-t border-red-200">
                    <td className="px-4 py-2.5">Total Employee Deductions (B)</td>
                    <td className="px-4 py-2.5 text-right text-red-700">-{formatINR(result.totalEmployeeDeductionsMonthly)}</td>
                    <td className="px-4 py-2.5 text-right text-red-700">-{formatINR(result.totalEmployeeDeductionsAnnual)}</td>
                    <td className="px-4 py-2.5 text-right">{((result.totalEmployeeDeductionsAnnual / result.annualCTC) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">Withheld from paycheck for PF, PT & TDS</td>
                  </tr>

                  <tr className="bg-slate-50/70 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <td colSpan={5} className="px-4 py-2">Part C: Employer Contributions (Included in CTC, Not in Cash Salary)</td>
                  </tr>
                  {result.employerContributionsBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{item.component}</td>
                      <td className="px-4 py-2.5 text-right text-amber-700 font-semibold">{formatINR(item.monthly)}</td>
                      <td className="px-4 py-2.5 text-right text-amber-700 font-semibold">{formatINR(item.annual)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{item.percentageOfCTC}%</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{item.description}</td>
                    </tr>
                  ))}

                  <tr className="bg-emerald-100 font-black text-slate-900 border-t-2 border-emerald-500 text-sm">
                    <td className="px-4 py-3">Net Take-Home Pay (A - B)</td>
                    <td className="px-4 py-3 text-right text-emerald-800">{formatINR(result.netTakeHomeMonthly)}</td>
                    <td className="px-4 py-3 text-right text-emerald-800">{formatINR(result.netTakeHomeAnnual)}</td>
                    <td className="px-4 py-3 text-right">{result.takeHomePercentage}%</td>
                    <td className="px-4 py-3 text-xs text-emerald-950 font-bold">Exact estimated amount credited to bank account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName="Salary Structure & Deductions Formula"
          formula="Take-Home Pay = Gross Salary - (Employee EPF + Professional Tax + Monthly TDS)"
          variables={[
            { symbol: "Cost to Company (CTC)", description: "Total annual spend by employer = Gross Salary + Employer Statutory PF" },
            { symbol: "Gross Salary", description: "Direct earnings before employee withholdings = Basic + HRA + Special Allowance" },
            { symbol: "Employee EPF", description: "Statutory 12% of Basic Salary deducted from paycheck and credited to EPFO" },
            { symbol: "Professional Tax", description: "State government tax under Article 276(2), typically ₹200/mo (capped at ₹2,500/yr)" },
            { symbol: "TDS (Section 192)", description: "Tax Deducted at Source by employer based on chosen regime (AY 2026-27 rules)" },
          ]}
          notes={[
            "Gross Salary is NOT equal to CTC: CTC includes the employer's 12% statutory PF contribution, whereas Gross Salary is the pre-tax salary on which employee deductions are applied.",
            "Professional Tax varies across states: States like Maharashtra (₹2,500/yr), Karnataka, Telangana, and Gujarat levy PT, while Delhi, Haryana, and UP levy zero PT.",
            "Under the AY 2026-27 New Tax Regime, taxable income up to ₹12 Lakhs (salaried ₹12.75 Lakhs gross) attracts zero tax after Section 87A rebate.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
