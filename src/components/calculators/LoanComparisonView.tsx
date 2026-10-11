"use client";

import React, { useMemo, useState } from "react";
import {
  loanComparisonEngine,
  LoanComparisonInput,
  defaultLoanComparisonInputs,
} from "@/lib/calculators/loan-comparison";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorResultGenerated } from "@/lib/analytics";
import {
  ArrowRightLeft,
  Share2,
  Check,
  Award,
  Building,
  CheckCircle2,
  TrendingDown,
  Table,
} from "lucide-react";

interface LoanComparisonViewProps {
  initialInputs?: Partial<LoanComparisonInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

export const LoanComparisonView: React.FC<LoanComparisonViewProps> = ({
  initialInputs,
  breadcrumbs,
  relatedLinks,
}) => {
  const {
    inputs,
    updateInput,
    resetInputs,
    shareableUrl,
  } = useCalculatorUrlState<LoanComparisonInput>({
    schema: loanComparisonEngine.schema,
    defaultInputs: { ...defaultLoanComparisonInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return loanComparisonEngine.calculate(inputs);
  }, [inputs]);

  const [copiedShare, setCopiedShare] = useState(false);

  const handleCopyShareLink = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // ignore
    }
  };

  const updateLoanA = (field: keyof typeof inputs.loanA, val: number) => {
    updateInput("loanA", { ...inputs.loanA, [field]: val });
    trackCalculatorResultGenerated("loan-comparison");
  };

  const updateLoanB = (field: keyof typeof inputs.loanB, val: number) => {
    updateInput("loanB", { ...inputs.loanB, [field]: val });
    trackCalculatorResultGenerated("loan-comparison");
  };

  const defaultBreadcrumbs = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Loans", href: "/loans" },
      { label: "Loan Comparison Calculator", href: "/loan-comparison-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "EMI Calculator",
        href: "/emi-calculator",
        description: "Calculate standard monthly installments and interest schedules.",
        category: "Loans",
      },
      {
        title: "Home Loan EMI Calculator",
        href: "/home-loan-emi-calculator",
        description: "Housing loan interest schedules with benchmark EBLR rates.",
        category: "Loans",
      },
      {
        title: "Home Loan Prepayment",
        href: "/loan-prepayment-calculator",
        description: "See how part payments eliminate tenure and save interest.",
        category: "Loans",
      },
    ],
    []
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
          Compare Loan Parameters
        </h2>
        <button
          type="button"
          onClick={resetInputs}
          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
        >
          Reset Both
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Loan Option A Box */}
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              Loan Option A
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Offer 1
            </span>
          </div>

          <NumberInput
            id="principalA"
            label="Loan Amount (₹)"
            value={inputs.loanA.principal}
            onChange={(val) => updateLoanA("principal", val)}
            min={10000}
            max={100000000}
            step={50000}
            unit="₹"
          />

          <NumberInput
            id="interestRateA"
            label="Interest Rate (%)"
            value={inputs.loanA.interestRate}
            onChange={(val) => updateLoanA("interestRate", val)}
            min={0.1}
            max={30}
            step={0.05}
            unit="%"
          />

          <NumberInput
            id="tenureYearsA"
            label="Tenure (Years)"
            value={inputs.loanA.tenureYears}
            onChange={(val) => updateLoanA("tenureYears", val)}
            min={1}
            max={40}
            step={1}
            unit="years"
          />

          <NumberInput
            id="feePercentA"
            label="Processing Fee (%)"
            value={inputs.loanA.processingFeePercent ?? 0.5}
            onChange={(val) => updateLoanA("processingFeePercent", val)}
            min={0}
            max={5}
            step={0.1}
            unit="%"
          />
        </div>

        {/* Loan Option B Box */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              Loan Option B
            </h3>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              Offer 2
            </span>
          </div>

          <NumberInput
            id="principalB"
            label="Loan Amount (₹)"
            value={inputs.loanB.principal}
            onChange={(val) => updateLoanB("principal", val)}
            min={10000}
            max={100000000}
            step={50000}
            unit="₹"
          />

          <NumberInput
            id="interestRateB"
            label="Interest Rate (%)"
            value={inputs.loanB.interestRate}
            onChange={(val) => updateLoanB("interestRate", val)}
            min={0.1}
            max={30}
            step={0.05}
            unit="%"
          />

          <NumberInput
            id="tenureYearsB"
            label="Tenure (Years)"
            value={inputs.loanB.tenureYears}
            onChange={(val) => updateLoanB("tenureYears", val)}
            min={1}
            max={40}
            step={1}
            unit="years"
          />

          <NumberInput
            id="feePercentB"
            label="Processing Fee (%)"
            value={inputs.loanB.processingFeePercent ?? 0.25}
            onChange={(val) => updateLoanB("processingFeePercent", val)}
            min={0}
            max={5}
            step={0.1}
            unit="%"
          />
        </div>
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this comparison
          </div>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      {/* Primary Winner Banner */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Verdict & Total Savings
            </span>
          </div>
          <span className="text-xs font-medium text-slate-300">
            {result.cheaperOption === "Equal"
              ? "Both Offers Cost Exactly the Same"
              : `Option ${result.cheaperOption} is Overall Cheaper`}
          </span>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {result.cheaperOption === "Equal"
              ? "₹0 Difference"
              : `Save ${formatINR(result.totalSavings)}`}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {result.cheaperOption === "Equal"
              ? "Both loans carry identical total lifetime costs including bank processing fees."
              : `Choosing Option ${result.cheaperOption} saves ${formatINR(
                  result.totalSavings
                )} over the entire loan repayment period.`}
          </p>
        </div>

        {/* Monthly EMI note */}
        {result.monthlySavings > 0 && (
          <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-300">Monthly Cash Flow Advantage:</span>
            <span className="font-bold text-emerald-400">
              Option {result.lowerEmiOption} has {formatINR(result.monthlySavings)}/mo lower EMI
            </span>
          </div>
        )}
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-600" />
          Side-by-Side Financial Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Parameter</th>
                <th className="p-2.5 text-right text-emerald-900">Option A</th>
                <th className="p-2.5 text-right text-blue-900">Option B</th>
                <th className="p-2.5 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-medium text-slate-900">Monthly EMI</td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  {formatINR(result.optionA.emi)}
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  {formatINR(result.optionB.emi)}
                </td>
                <td className="p-2.5 text-right font-semibold text-slate-700">
                  {result.emiDifference === 0
                    ? "₹0"
                    : `${formatINR(Math.abs(result.emiDifference))} (Option ${
                        result.lowerEmiOption
                      } lower)`}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-medium text-slate-900">Total Interest Payable</td>
                <td className="p-2.5 text-right text-slate-700">
                  {formatINR(result.optionA.totalInterest)}
                </td>
                <td className="p-2.5 text-right text-slate-700">
                  {formatINR(result.optionB.totalInterest)}
                </td>
                <td className="p-2.5 text-right font-semibold text-slate-700">
                  {formatINR(Math.abs(result.interestDifference))}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 text-slate-700">Bank Processing Fee</td>
                <td className="p-2.5 text-right text-slate-600">
                  {formatINR(result.optionA.processingFee)}
                </td>
                <td className="p-2.5 text-right text-slate-600">
                  {formatINR(result.optionB.processingFee)}
                </td>
                <td className="p-2.5 text-right text-slate-600">
                  {formatINR(Math.abs(result.optionA.processingFee - result.optionB.processingFee))}
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="p-2.5 text-slate-900">Total Cost (Principal + Int + Fee)</td>
                <td className="p-2.5 text-right text-emerald-800 text-sm">
                  {formatINR(result.optionA.totalCost)}
                </td>
                <td className="p-2.5 text-right text-blue-800 text-sm">
                  {formatINR(result.optionB.totalCost)}
                </td>
                <td className="p-2.5 text-right font-black text-emerald-700 text-sm">
                  {formatINR(result.totalSavings)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          How to Compare Two Loan Offers Intelligently
        </h2>
        <p>
          Banks often structure loans with deceptive trade-offs—such as a slightly lower interest rate paired
          with high processing fees, or a longer tenure that appears cheaper per month but doubles your total interest:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Interest Rate vs. Tenure:</strong> Never choose a loan solely based on its monthly EMI. A 30-year
            home loan will have a lower EMI than a 20-year loan, but you will pay nearly 60% more in total interest.
          </li>
          <li>
            <strong>Hidden Upfront Charges:</strong> Administrative charges, login fees, and processing fees
            (plus 18% GST) can cost ₹25,000 to ₹75,000 upfront. A bank offering a 0.10% lower rate with high fees
            may take several years just to break even.
          </li>
          <li>
            <strong>Prepayment Freedom:</strong> Under RBI regulations, floating-rate home loans carry zero prepayment
            penalties. Verify that the bank offers instant online part-prepayments without minimum amount restrictions.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={loanComparisonEngine.metadata.name}
      badge={loanComparisonEngine.metadata.badge}
      description={loanComparisonEngine.metadata.shortDescription}
      directAnswer={loanComparisonEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        loanComparisonEngine.metadata.formula ? (
          <FormulaExplanation
            formula={loanComparisonEngine.metadata.formula.expression}
            variables={loanComparisonEngine.metadata.formula.variables}
            steps={loanComparisonEngine.metadata.formula.steps}
            notes={loanComparisonEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={loanComparisonEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators links={relatedLinks || defaultRelatedLinks} />
      }
    />
  );
};
