"use client";

import React, { useState, useMemo } from "react";
import { calculateHRA } from "@/lib/calculators/hra";
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

export interface HRACalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialBasicSalary: number;
  initialHRAReceived: number;
  initialRentPaid: number;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const HRACalculatorView: React.FC<HRACalculatorViewProps> = ({
  title,
  badge = "HRA Exemption Rule 2A",
  description,
  initialBasicSalary,
  initialHRAReceived,
  initialRentPaid,
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [basicSalary, setBasicSalary] = useState(initialBasicSalary);
  const [hraReceived, setHraReceived] = useState(initialHRAReceived);
  const [rentPaid, setRentPaid] = useState(initialRentPaid);
  const [isMetroCity, setIsMetroCity] = useState(true);
  const [taxSlabRate, setTaxSlabRate] = useState(30);

  const result = useMemo(() => {
    return calculateHRA({
      basicSalaryAnnual: basicSalary,
      hraReceivedAnnual: hraReceived,
      rentPaidAnnual: rentPaid,
      isMetroCity,
      taxBracketPercentage: taxSlabRate,
    });
  }, [basicSalary, hraReceived, rentPaid, isMetroCity, taxSlabRate]);

  const handleBasicChange = (val: number) => {
    setBasicSalary(val);
    trackCalculatorUsed("hra", "basicSalary");
    trackCalculatorResultGenerated("hra");
  };

  const handleHRAChange = (val: number) => {
    setHraReceived(val);
    trackCalculatorUsed("hra", "hraReceived");
    trackCalculatorResultGenerated("hra");
  };

  const handleRentChange = (val: number) => {
    setRentPaid(val);
    trackCalculatorUsed("hra", "rentPaid");
    trackCalculatorResultGenerated("hra");
  };

  const directAnswer = `On a basic salary of ${formatINR(basicSalary)} and annual rent paid of ${formatINR(
    rentPaid
  )} in a ${isMetroCity ? "metro" : "non-metro"} city, your tax-exempt HRA is ${formatINR(
    result.exemptHRA
  )} under Section 10(13A) (Rule 2A). The remaining ${formatINR(
    result.taxableHRA
  )} is taxable as salary income, saving you an estimated ${formatINR(
    result.estimatedTaxSaved
  )} in income tax per year.`;

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
          {/* Statutory Rule 2A Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>Section 10(13A) / Rule 2A Exemption Estimate</span>
              <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-semibold">
                Old Regime Only
              </span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Calculation is an estimate based on user-entered assumptions. Under Rule 2A, eligible salary is strictly defined as Basic Salary plus Dearness Allowance (if forming part of retirement benefits). Special and other allowances are excluded.
            </p>
          </div>

          <CurrencyInput
            label="Annual Basic Salary (+ DA)"
            value={basicSalary}
            onChange={handleBasicChange}
            min={50000}
            max={50000000}
            step={25000}
            presets={[
              { label: "₹3 Lakh", value: 300000 },
              { label: "₹6 Lakh", value: 600000 },
              { label: "₹10 Lakh", value: 1000000 },
              { label: "₹15 Lakh", value: 1500000 },
            ]}
            helperText="Basic salary component only (do not include special allowances or bonus)."
          />

          <CurrencyInput
            label="Actual HRA Received from Employer (Annual)"
            value={hraReceived}
            onChange={handleHRAChange}
            min={10000}
            max={25000000}
            step={10000}
            presets={[
              { label: "₹1.5 Lakh", value: 150000 },
              { label: "₹2.4 Lakh", value: 240000 },
              { label: "₹4 Lakh", value: 400000 },
              { label: "₹6 Lakh", value: 600000 },
            ]}
            helperText="Total HRA amount received across all 12 months."
          />

          <CurrencyInput
            label="Total Rent Paid to Landlord (Annual)"
            value={rentPaid}
            onChange={handleRentChange}
            min={10000}
            max={25000000}
            step={10000}
            presets={[
              { label: "₹1.8 Lakh (₹15k/mo)", value: 180000 },
              { label: "₹3.0 Lakh (₹25k/mo)", value: 300000 },
              { label: "₹4.8 Lakh (₹40k/mo)", value: 480000 },
              { label: "₹6.0 Lakh (₹50k/mo)", value: 600000 },
            ]}
            helperText="Cumulative rent paid with rent receipts / lease agreement."
          />

          {/* Metro vs Non-Metro Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">City of Residence</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMetroCity(true);
                  trackCalculatorUsed("hra", "metroCity");
                }}
                className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                  isMetroCity
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Metro (50% of Basic)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMetroCity(false);
                  trackCalculatorUsed("hra", "nonMetroCity");
                }}
                className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                  !isMetroCity
                    ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Non-Metro (40% of Basic)
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Metros per Income Tax Act: Mumbai, Delhi, Kolkata, Chennai. All other cities qualify for 40%.
            </p>
          </div>

          {/* Tax Slab for Savings Estimation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Your Income Tax Slab Rate
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 30].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxSlabRate(rate)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                    taxSlabRate === rate
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {rate}% Slab
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Tax-Exempt HRA (Rule 2A)"
              value={formatINR(result.exemptHRA)}
              subtext="100% deduction from taxable salary"
              highlight
            />
            <ResultCard
              label="Estimated Annual Tax Saved"
              value={formatINR(result.estimatedTaxSaved)}
              subtext={`Based on ${taxSlabRate}% slab + 4% cess`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Taxable HRA Component"
              value={formatINR(result.taxableHRA)}
              subtext="Added to gross salary for tax"
            />
            <ResultCard
              label="Monthly HRA Exemption"
              value={formatINR(result.monthlyBreakdown.exemptHRAMonthly)}
              subtext={`${formatINR(result.monthlyBreakdown.taxSavedMonthly)}/mo tax saved`}
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Tax-Exempt HRA", value: result.exemptHRA, color: "#059669" },
              { label: "Taxable HRA Portion", value: result.taxableHRA, color: "#dc2626" },
            ]}
            title="HRA Tax Exemption Breakdown"
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Statutory 3-Condition Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Rule 2A Statutory 3-Condition Comparison</h3>
              <p className="text-xs text-slate-500 mt-0.5">Under Section 10(13A), your tax-exempt HRA is the MINIMUM of the following 3 amounts:</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Statutory Condition</th>
                    <th className="px-4 py-3">Legal Basis</th>
                    <th className="px-4 py-3 text-right">Computed Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className={result.limitingFactor === "actual_hra" ? "bg-emerald-50/60 font-medium" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3 text-slate-900">1. Actual HRA Received</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">Employer HRA component</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(result.actualHRAReceived)}</td>
                    <td className="px-4 py-3 text-center">
                      {result.limitingFactor === "actual_hra" ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Exempt Amount (Lowest)</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                  <tr className={result.limitingFactor === "salary_percentage" ? "bg-emerald-50/60 font-medium" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3 text-slate-900">2. {isMetroCity ? "50%" : "40%"} of Basic Salary</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{isMetroCity ? "Metro limit" : "Non-metro limit"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(result.percentageOfSalaryLimit)}</td>
                    <td className="px-4 py-3 text-center">
                      {result.limitingFactor === "salary_percentage" ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Exempt Amount (Lowest)</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                  <tr className={result.limitingFactor === "rent_paid_minus_ten_percent" ? "bg-emerald-50/60 font-medium" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3 text-slate-900">3. Rent Paid minus 10% of Basic</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatINR(rentPaid)} - {formatINR(basicSalary * 0.1)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(result.rentMinusTenPercentSalary)}</td>
                    <td className="px-4 py-3 text-center">
                      {result.limitingFactor === "rent_paid_minus_ten_percent" ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Exempt Amount (Lowest)</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName="House Rent Allowance (HRA) Exemption"
          formula="Exempt HRA = MIN(Actual HRA, 50% or 40% of Basic, Rent Paid - 10% of Basic)"
          variables={[
            { symbol: "Basic Salary", description: "Basic salary + DA (if forming part of retirement benefits)" },
            { symbol: "Metro City", description: "Delhi, Mumbai, Kolkata, Chennai (qualifies for 50% basic limit; all others 40%)" },
            { symbol: "Rent Paid", description: "Actual rent transferred to landlord for accommodation" },
          ]}
          notes={[
            "HRA exemption is ONLY available under the Old Tax Regime. The default New Tax Regime (Section 115BAC) does not allow HRA exemption.",
            "If annual rent paid exceeds ₹1,00,000, quoting the landlord's Permanent Account Number (PAN) is mandatory on Form 12BB.",
            "Paying rent to parents is legally permissible provided the parents own the property and declare the rental income in their tax returns.",
            "Both HRA and Home Loan Tax Benefits (Section 24(b) and 80C) can be claimed simultaneously if you work in one city while owning a home in another.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
