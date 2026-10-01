"use client";

import React, { useState, useMemo } from "react";
import { calculateIncomeTax } from "@/lib/calculators/income-tax";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface IncomeTaxCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialGrossIncome: number;
  initialIsSalaried?: boolean;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const IncomeTaxCalculatorView: React.FC<IncomeTaxCalculatorViewProps> = ({
  title,
  badge = "Income Tax AY 2026-27 (FY 2025-26)",
  description,
  initialGrossIncome,
  initialIsSalaried = true,
  asOfDate = "Finance Act 2025 / Budget 2025",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [assessmentYear, setAssessmentYear] = useState<"2026-27" | "2025-26">("2026-27");
  const [grossAnnualIncome, setGrossAnnualIncome] = useState(initialGrossIncome);
  const [isSalaried, setIsSalaried] = useState(initialIsSalaried);
  const [ageGroup, setAgeGroup] = useState<"general" | "senior" | "superSenior">("general");

  // Old Regime Deductions
  const [deduction80C, setDeduction80C] = useState(150000);
  const [deduction80D, setDeduction80D] = useState(25000);
  const [homeLoanInterest24b, setHomeLoanInterest24b] = useState(0);
  const [nps80CCD1B, setNps80CCD1B] = useState(50000);
  const [hraExemption, setHraExemption] = useState(0);
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState(false);

  const result = useMemo(() => {
    return calculateIncomeTax({
      grossAnnualIncome,
      isSalaried,
      ageGroup,
      assessmentYear,
      deduction80C,
      deduction80D,
      homeLoanInterest24b,
      nps80CCD1B,
      hraExemption,
    });
  }, [
    grossAnnualIncome,
    isSalaried,
    ageGroup,
    assessmentYear,
    deduction80C,
    deduction80D,
    homeLoanInterest24b,
    nps80CCD1B,
    hraExemption,
  ]);

  const handleIncomeChange = (val: number) => {
    setGrossAnnualIncome(val);
    trackCalculatorUsed("income-tax", "grossIncome");
    trackCalculatorResultGenerated("income-tax");
  };

  const directAnswer = `For AY ${assessmentYear} (FY ${result.financialYear}) on a gross annual income of ${formatINR(
    grossAnnualIncome
  )}, the ${result.recommendedRegime === "new" ? "New Tax Regime (Section 115BAC)" : "Old Tax Regime"} is more tax-efficient, resulting in a total annual tax liability of ${formatINR(
    result.recommendedRegime === "new" ? result.newRegime.totalTax : result.oldRegime.totalTax
  )} compared to ${formatINR(
    result.recommendedRegime === "new" ? result.oldRegime.totalTax : result.newRegime.totalTax
  )} in the alternative regime, saving you ${formatINR(result.taxSaved)} annually.`;

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
          {/* Assessment Year Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Assessment Year (AY) / Tax Rule Version
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAssessmentYear("2026-27")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  assessmentYear === "2026-27"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                AY 2026-27 (Current FY 2025-26)
              </button>
              <button
                type="button"
                onClick={() => setAssessmentYear("2025-26")}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  assessmentYear === "2025-26"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                AY 2025-26 (FY 2024-25)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {assessmentYear === "2026-27"
                ? "Statutory AY 2026-27 slabs: ₹0-4L (0%), ₹4-8L (5%), ₹8-12L (10%), ₹12-16L (15%), ₹16-20L (20%), ₹20-24L (25%), >₹24L (30%) with Section 87A rebate up to ₹60,000."
                : "AY 2025-26 slabs: ₹0-3L (0%), ₹3-7L (5%), ₹7-10L (10%), ₹10-12L (15%), ₹12-15L (20%), >₹15L (30%) with Section 87A rebate up to ₹25,000."}
            </p>
          </div>

          <CurrencyInput
            label="Gross Annual Income (CTC / Total Salary)"
            value={grossAnnualIncome}
            onChange={handleIncomeChange}
            min={100000}
            max={100000000}
            step={25000}
            presets={[
              { label: "₹10 Lakh", value: 1000000 },
              { label: "₹12.75 Lakh (Zero Tax)", value: 1275000 },
              { label: "₹15 Lakh", value: 1500000 },
              { label: "₹25 Lakh", value: 2500000 },
            ]}
            helperText="Total income before standard deduction or Chapter VI-A investments."
          />

          {/* Salaried / Business Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-sm font-semibold text-slate-800">Salaried Individual</span>
              <p className="text-xs text-slate-500">Qualifies for ₹75,000 Standard Deduction (New Regime)</p>
            </div>
            <input
              type="checkbox"
              checked={isSalaried}
              onChange={(e) => setIsSalaried(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>

          {/* Age Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Age Category (Applicable for Old Tax Regime Slabs)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "general", label: "< 60 Years (General)" },
                { id: "senior", label: "60-80 Years (Senior)" },
                { id: "superSenior", label: "80+ (Super Senior)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAgeGroup(cat.id as any)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    ageGroup === cat.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Old Regime Deductions Collapsible */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvancedDeductions(!showAdvancedDeductions)}
              className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800"
            >
              <span>Old Regime Deductions & Exemptions</span>
              <span className="text-xs text-emerald-700 underline">
                {showAdvancedDeductions ? "Hide Deductions" : "Customize Deductions (80C, 80D, HRA)"}
              </span>
            </button>

            {showAdvancedDeductions && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <CurrencyInput
                  label="Section 80C Deductions (EPF, PPF, ELSS, Life Insurance)"
                  value={deduction80C}
                  onChange={setDeduction80C}
                  min={0}
                  max={150000}
                  step={10000}
                  helperText="Statutory maximum limit is ₹1,50,000 per financial year."
                />

                <CurrencyInput
                  label="Section 80D Health Insurance Premium"
                  value={deduction80D}
                  onChange={setDeduction80D}
                  min={0}
                  max={100000}
                  step={5000}
                  helperText="Self, family, and senior citizen parents."
                />

                <CurrencyInput
                  label="Section 24(b) Home Loan Interest"
                  value={homeLoanInterest24b}
                  onChange={setHomeLoanInterest24b}
                  min={0}
                  max={200000}
                  step={10000}
                  helperText="Capped at ₹2,00,000 for self-occupied residential property."
                />

                <CurrencyInput
                  label="Section 80CCD(1B) NPS Additional Contribution"
                  value={nps80CCD1B}
                  onChange={setNps80CCD1B}
                  min={0}
                  max={50000}
                  step={5000}
                  helperText="Exclusive Tier-1 NPS deduction up to ₹50,000 beyond Section 80C."
                />

                <CurrencyInput
                  label="HRA Exemption Claimed (Section 10(13A))"
                  value={hraExemption}
                  onChange={setHraExemption}
                  min={0}
                  max={1000000}
                  step={10000}
                  helperText="Estimated exempt HRA under Rule 2A."
                />
              </div>
            )}
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          {/* Recommendation Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${
              result.recommendedRegime === "new"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : result.recommendedRegime === "old"
                ? "bg-blue-50 border-blue-300 text-blue-950"
                : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Recommended Choice: {result.recommendedRegime === "new" ? "New Tax Regime" : "Old Tax Regime"}
              </span>
              {result.taxSaved > 0 && (
                <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                  Save {formatINR(result.taxSaved)}/yr
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">
              {result.summaryText}
            </p>
          </div>

          {/* Direct Side-by-Side Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 sm:p-5 rounded-xl border ${result.recommendedRegime === "new" ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20" : "border-slate-200 bg-white"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-slate-500">New Regime (Default - AY {assessmentYear})</span>
                {result.recommendedRegime === "new" && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">RECOMMENDED</span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatINR(result.newRegime.totalTax)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Effective Tax: {result.newRegime.effectiveTaxRate}% | Monthly: {formatINR(result.newRegime.monthlyTax)}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Std Deduction:</span>
                  <span className="font-semibold">{formatINR(result.newRegime.standardDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Income:</span>
                  <span className="font-semibold">{formatINR(result.newRegime.taxableIncome)}</span>
                </div>
                {result.newRegime.rebate87A > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Section 87A Rebate:</span>
                    <span>-{formatINR(result.newRegime.rebate87A)}</span>
                  </div>
                )}
                {result.newRegime.marginalRelief87A > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Marginal Relief:</span>
                    <span>Relief Applied</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Annual In-Hand:</span>
                  <span className="font-semibold text-emerald-700">{formatINR(result.newRegime.inHandAnnual)}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border ${result.recommendedRegime === "old" ? "border-blue-600 bg-white ring-2 ring-blue-600/20" : "border-slate-200 bg-white"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-slate-500">Old Regime</span>
                {result.recommendedRegime === "old" && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">RECOMMENDED</span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatINR(result.oldRegime.totalTax)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Effective Tax: {result.oldRegime.effectiveTaxRate}% | Monthly: {formatINR(result.oldRegime.monthlyTax)}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Deductions Claimed:</span>
                  <span className="font-semibold">{formatINR(result.oldRegime.standardDeduction + result.oldRegime.otherDeductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Income:</span>
                  <span className="font-semibold">{formatINR(result.oldRegime.taxableIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual In-Hand:</span>
                  <span className="font-semibold text-blue-700">{formatINR(result.oldRegime.inHandAnnual)}</span>
                </div>
              </div>
            </div>
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Net Take-Home Pay", value: result.newRegime.inHandAnnual, color: "#059669" },
              { label: "Income Tax Outflow", value: result.newRegime.totalTax, color: "#dc2626" },
            ]}
            title={`Gross Salary Allocation (New Regime, AY ${assessmentYear})`}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* New Regime Slab Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                New Tax Regime Slabs & Calculation (AY {assessmentYear} / FY {result.financialYear})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Section 115BAC statutory slabs with Section 87A rebate and marginal relief</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Income Slab</th>
                    <th className="px-4 py-3 text-right">Tax Rate</th>
                    <th className="px-4 py-3 text-right">Taxable in Slab</th>
                    <th className="px-4 py-3 text-right">Tax Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.newRegime.breakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{row.slab}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{Math.round(row.rate * 100)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(row.taxableAmountInSlab)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(row.taxForSlab)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold text-slate-900">
                    <td className="px-4 py-3" colSpan={3}>Gross Slab Tax</td>
                    <td className="px-4 py-3 text-right">{formatINR(result.newRegime.slabTax)}</td>
                  </tr>
                  {result.newRegime.rebate87A > 0 && (
                    <tr className="text-emerald-700 bg-emerald-50/50 font-medium">
                      <td className="px-4 py-2.5" colSpan={3}>
                        Less: Section 87A Rebate {result.newRegime.marginalRelief87A > 0 ? "(Marginal Relief)" : ""}
                      </td>
                      <td className="px-4 py-2.5 text-right">-{formatINR(result.newRegime.rebate87A)}</td>
                    </tr>
                  )}
                  {result.newRegime.surcharge > 0 && (
                    <tr className="text-amber-700">
                      <td className="px-4 py-2.5" colSpan={3}>Add: Surcharge</td>
                      <td className="px-4 py-2.5 text-right">+{formatINR(result.newRegime.surcharge)}</td>
                    </tr>
                  )}
                  <tr className="text-slate-600">
                    <td className="px-4 py-2.5" colSpan={3}>Add: Health & Education Cess (4%)</td>
                    <td className="px-4 py-2.5 text-right">+{formatINR(result.newRegime.cess)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="px-4 py-3" colSpan={3}>Total New Regime Tax Payable</td>
                    <td className="px-4 py-3 text-right text-emerald-800">{formatINR(result.newRegime.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName={`Income Tax Calculator (AY ${assessmentYear} / FY ${result.financialYear})`}
          formula="Total Tax = (Slab Tax - Section 87A Rebate + Surcharge) × 1.04 (Health & Education Cess)"
          variables={[
            { symbol: "AY 2026-27 Slabs", description: "₹0-4L: 0% | ₹4-8L: 5% | ₹8-12L: 10% | ₹12-16L: 15% | ₹16-20L: 20% | ₹20-24L: 25% | Above ₹24L: 30%" },
            { symbol: "Standard Deduction", description: "₹75,000 for salaried individuals under New Regime (₹50,000 under Old Regime)" },
            { symbol: "Section 87A Rebate", description: "Full rebate up to ₹60,000 for taxable income up to ₹12,00,000 (salaried zero tax up to ₹12,75,000 gross)" },
            { symbol: "Marginal Relief", description: "Where taxable income exceeds ₹12,00,000, tax payable shall not exceed the excess of income over ₹12,00,000" },
            { symbol: "Health & Education Cess", description: "Mandatory 4% cess applied to total tax liability plus surcharge" },
          ]}
          notes={[
            "AY 2026-27 (FY 2025-26) new regime slabs under Section 115BAC: ₹0-4L (Nil), ₹4-8L (5%), ₹8-12L (10%), ₹12-16L (15%), ₹16-20L (20%), ₹20-24L (25%), above ₹24L (30%).",
            "Salaried individuals earning gross income up to ₹12,75,000 pay zero tax under the New Regime after ₹75,000 standard deduction and Section 87A rebate.",
            "Marginal relief protects taxpayers whose income slightly exceeds ₹12,00,000 by ensuring tax payable does not exceed the excess income above ₹12 Lakhs.",
            "New Tax Regime is the statutory default; taxpayers must affirmatively elect Old Regime if itemized deductions (80C, 80D, 24(b), HRA) produce higher savings.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
