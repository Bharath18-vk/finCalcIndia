"use client";

import React, { useState, useMemo } from "react";
import { calculateLoanEligibility } from "@/lib/calculators/loan-eligibility";
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

export interface LoanEligibilityViewProps {
  title: string;
  badge?: string;
  description: string;
  initialIncome: number;
  initialExistingEMIs?: number;
  initialAnnualRate: number;
  initialTenureYears?: number;
  initialFOIR?: number;
  benchmarkNote?: string;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const LoanEligibilityView: React.FC<LoanEligibilityViewProps> = ({
  title,
  badge = "Borrowing Power",
  description,
  initialIncome,
  initialExistingEMIs = 0,
  initialAnnualRate,
  initialTenureYears = 20,
  initialFOIR = 50,
  benchmarkNote = "8.50% Floating Home Loan Benchmark (SBI EBLR)",
  asOfDate,
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(initialIncome);
  const [existingMonthlyEMIs, setExistingMonthlyEMIs] = useState(initialExistingEMIs);
  const [annualRate, setAnnualRate] = useState(initialAnnualRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);
  const [foirPercentage, setFoirPercentage] = useState(initialFOIR);

  const result = useMemo(() => {
    return calculateLoanEligibility({
      netMonthlyIncome,
      existingMonthlyEMIs,
      annualRate,
      tenureYears,
      foirPercentage,
    });
  }, [netMonthlyIncome, existingMonthlyEMIs, annualRate, tenureYears, foirPercentage]);

  const handleIncomeChange = (val: number) => {
    setNetMonthlyIncome(val);
    trackCalculatorUsed("loan-eligibility", "income");
    trackCalculatorResultGenerated("loan-eligibility");
  };

  const handleExistingEMIsChange = (val: number) => {
    setExistingMonthlyEMIs(val);
    trackCalculatorUsed("loan-eligibility", "existingEMIs");
    trackCalculatorResultGenerated("loan-eligibility");
  };

  const handleRateChange = (val: number) => {
    setAnnualRate(val);
    trackCalculatorUsed("loan-eligibility", "rate");
    trackCalculatorResultGenerated("loan-eligibility");
  };

  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    trackCalculatorUsed("loan-eligibility", "tenure");
    trackCalculatorResultGenerated("loan-eligibility");
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
            label="Net Monthly Income (Take-Home Salary)"
            value={netMonthlyIncome}
            onChange={handleIncomeChange}
            min={15000}
            max={5000000}
            step={5000}
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹75,000", value: 75000 },
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹2 Lakh", value: 200000 },
            ]}
            helperText="Monthly credited in-hand salary after PF, TDS, and deductions."
          />

          <CurrencyInput
            label="Existing Monthly Loan EMIs & Credit Card Dues"
            value={existingMonthlyEMIs}
            onChange={handleExistingEMIsChange}
            min={0}
            max={2000000}
            step={1000}
            presets={[
              { label: "₹0 (No Debt)", value: 0 },
              { label: "₹5,000", value: 5000 },
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
            ]}
            helperText="Total existing monthly installment obligations."
          />

          <PercentageInput
            label="Expected Loan Interest Rate (% p.a.)"
            value={annualRate}
            onChange={handleRateChange}
            min={6.0}
            max={18.0}
            step={0.05}
            presets={[
              { label: "8.50% (Home Loan)", value: 8.5 },
              { label: "9.00%", value: 9.0 },
              { label: "11.0% (Personal Loan)", value: 11.0 },
            ]}
            helperText="Current benchmark lending rate for the loan type."
          />

          <TenureInput
            label="Desired Loan Tenure"
            years={tenureYears}
            onChangeYears={handleTenureChange}
            minYears={1}
            maxYears={30}
            presets={[
              { label: "10 Years", years: 10 },
              { label: "15 Years", years: 15 },
              { label: "20 Years", years: 20 },
              { label: "30 Years", years: 30 },
            ]}
            helperText="Longer tenure increases loan eligibility but increases total interest."
          />

          {/* FOIR Slider */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Bank FOIR Limit (Fixed Obligation to Income)</label>
              <span className="text-xs font-bold text-blue-800">{foirPercentage}% of Salary</span>
            </div>
            <input
              type="range"
              min={35}
              max={65}
              step={5}
              value={foirPercentage}
              onChange={(e) => {
                setFoirPercentage(Number(e.target.value));
                trackCalculatorUsed("loan-eligibility", "foir");
              }}
              className="w-full accent-blue-800"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>35% (Conservative)</span>
              <span>50% (Standard Indian Bank Norm)</span>
              <span>65% (High Income Slabs)</span>
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Maximum Eligible Loan"
              value={formatINR(result.eligibleLoanAmount)}
              subtext={`Based on ${foirPercentage}% FOIR & ${formatTenureYears(result.tenureYears)} term`}
              highlight
            />
            <ResultCard
              label="Max New Monthly EMI"
              value={formatINR(result.availableNewEMI)}
              subtext={`After ₹${existingMonthlyEMIs.toLocaleString("en-IN")} existing EMIs`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Total Allowable Debt EMI"
              value={formatINR(result.maxAllowableTotalEMI)}
              subtext={`${foirPercentage}% of ₹${netMonthlyIncome.toLocaleString("en-IN")}`}
            />
            <ResultCard
              label="Total Repayment (P + I)"
              value={formatINR(result.totalRepaymentAmount)}
              subtext={`Includes ₹${result.totalInterestPayable.toLocaleString("en-IN")} interest`}
            />
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Eligible Loan Principal", value: result.eligibleLoanAmount, color: "#1e3a8a" },
              { label: "Total Interest Outlay", value: result.totalInterestPayable, color: "#f59e0b" },
            ]}
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Borrowing Power Across Loan Tenures</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Maximum loan amount at {formatPercentage(annualRate)}% for available EMI capacity of {formatINR(result.availableNewEMI)}/month
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                  <tr>
                    <th className="px-4 py-3">Tenure</th>
                    <th className="px-4 py-3 text-right">Eligible Loan Amount</th>
                    <th className="px-4 py-3 text-right">Monthly Installment</th>
                    <th className="px-4 py-3 text-right">Total Interest Payable</th>
                    <th className="px-4 py-3 text-right">Total Repayment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.tenureComparisonTable.map((item) => (
                    <tr
                      key={item.tenureYears}
                      className={item.tenureYears === tenureYears ? "bg-blue-50/50 font-medium" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-2.5 text-slate-800">{item.tenureYears} Years</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatINR(item.eligibleLoanAmount)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(item.monthlyEMI)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-amber-700">{formatINR(item.totalInterest)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(item.totalRepayment)}</td>
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
          calculatorName="Loan Eligibility (FOIR Method)"
          formula="Available EMI = Net Monthly Salary * FOIR% - Existing EMIs"
          variables={[
            { symbol: "Loan Amount (PV)", description: "Present value of maximum monthly EMI discounted at loan interest rate" },
            { symbol: "FOIR", description: "Fixed Obligation to Income Ratio (typically 40% to 55% across Indian banks)" },
            { symbol: "Existing EMIs", description: "Current active loan installments that reduce your borrowing buffer" },
          ]}
          notes={[
            "Indian banks (SBI, HDFC, ICICI, etc.) limit total monthly debt repayment obligations to between 40% and 55% of take-home income.",
            "Higher salary brackets (e.g. above ₹1.5 Lakh/month) often qualify for higher FOIR allowances (up to 60% or 65%).",
            "Co-applying with a working spouse or adding documented co-borrower income substantially increases your eligible loan sanction.",
            "Maintaining a high CIBIL score (750+) ensures you qualify for the lowest benchmark interest rates, which directly raises borrowing power.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
