"use client";

import React, { useMemo, useState } from "react";
import {
  stepUpSwpEngine,
  StepUpSwpInput,
  defaultStepUpSwpInputs,
  StepUpSwpYearSchedule,
} from "@/lib/calculators/step-up-swp";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import {
  TrendingUp,
  Share2,
  Check,
  Table,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface StepUpSwpCalculatorViewProps {
  initialInputs?: Partial<StepUpSwpInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

export const StepUpSwpCalculatorView: React.FC<StepUpSwpCalculatorViewProps> = ({
  initialInputs,
  breadcrumbs,
  relatedLinks,
}) => {
  const {
    inputs,
    updateInput,
    resetInputs,
    validationErrors,
    shareableUrl,
  } = useCalculatorUrlState<StepUpSwpInput>({
    schema: stepUpSwpEngine.schema,
    defaultInputs: { ...defaultStepUpSwpInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return stepUpSwpEngine.calculate(inputs);
  }, [inputs]);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

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

  const defaultBreadcrumbs = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Investments", href: "/investments" },
      { label: "Step-Up SWP Calculator", href: "/step-up-swp-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "Standard SWP Calculator",
        href: "/swp-calculator",
        description: "Calculate static monthly cashflows from mutual funds without inflation indexation.",
        category: "Investments",
      },
      {
        title: "FIRE Calculator",
        href: "/fire-calculator",
        description: "Determine your early retirement corpus and sustainable withdrawal rate.",
        category: "Retirement",
      },
      {
        title: "Inflation Calculator (CII)",
        href: "/inflation-calculator",
        description: "Calculate future purchasing power erosion using historical and projected CPI rates.",
        category: "Economics",
      },
    ],
    []
  );

  const inputsSlot = (
    <div className="space-y-6">
      {/* Initial Corpus */}
      <NumberInput
        id="initialCorpus"
        label="Total Retirement Corpus"
        value={inputs.initialCorpus}
        onChange={(val) => updateInput("initialCorpus", val)}
        unit="₹"
        min={100000}
        max={1000000000}
        step={100000}
        presets={[
          { label: "₹50 Lakh", value: 5000000 },
          { label: "₹1 Crore", value: 10000000 },
          { label: "₹2 Crore", value: 20000000 },
          { label: "₹5 Crore", value: 50000000 },
        ]}
        helperText="Total starting lump-sum invested in your SWP portfolio."
        error={validationErrors?.initialCorpus}
      />

      {/* Initial Monthly Withdrawal */}
      <NumberInput
        id="initialMonthlyWithdrawal"
        label="Initial Monthly Payout (Year 1)"
        value={inputs.initialMonthlyWithdrawal}
        onChange={(val) => updateInput("initialMonthlyWithdrawal", val)}
        unit="₹"
        min={5000}
        max={5000000}
        step={2500}
        presets={[
          { label: "₹30,000", value: 30000 },
          { label: "₹45,000", value: 45000 },
          { label: "₹60,000", value: 60000 },
          { label: "₹1,00,000", value: 100000 },
        ]}
        helperText="Monthly cash transfer needed during your first year of retirement."
        error={validationErrors?.initialMonthlyWithdrawal}
      />

      {/* Annual Step-Up % */}
      <div>
        <NumberInput
          id="annualStepUpPercent"
          label="Annual Withdrawal Step-Up (%)"
          value={inputs.annualStepUpPercent}
          onChange={(val) => updateInput("annualStepUpPercent", val)}
          unit="%"
          min={0}
          max={15}
          step={0.5}
          helperText="Increase monthly payout each year to preserve purchasing power against inflation."
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { label: "0% (Fixed SWP)", val: 0 },
            { label: "5.0% p.a.", val: 5.0 },
            { label: "6.0% (Indian CPI)", val: 6.0 },
            { label: "8.0% p.a.", val: 8.0 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => updateInput("annualStepUpPercent", item.val)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                inputs.annualStepUpPercent === item.val
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expected Return & Tenure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          id="expectedAnnualReturnPercent"
          label="Expected Annual Return (%)"
          value={inputs.expectedAnnualReturnPercent}
          onChange={(val) => updateInput("expectedAnnualReturnPercent", val)}
          unit="%"
          min={4.0}
          max={18.0}
          step={0.25}
          helperText="Conservative hybrid funds typically yield 8.5%–9.5% p.a."
        />
        <NumberInput
          id="tenureYears"
          label="Retirement Horizon (Years)"
          value={inputs.tenureYears}
          onChange={(val) => updateInput("tenureYears", val)}
          unit="years"
          min={5}
          max={45}
          step={1}
          helperText="Planned duration of systematic withdrawals."
        />
      </div>

      {/* Share / Copy */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Share this calculation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      <ResultCard
        title="Step-Up Cashflow Summary"
        primaryTitle="Total Cashflow Withdrawn"
        primaryValue={result.totalAmountWithdrawn}
        primaryFormattedValue={formatINR(result.totalAmountWithdrawn)}
        primarySubtitle={`Final Balance Remaining: ${formatINR(
          result.finalPortfolioBalance
        )} (${result.isDepletedBeforeTenure ? "Exhausted" : "Solvent"})`}
        secondaryMetrics={[
          {
            label: "Starting Monthly Payout",
            value: formatINR(result.initialMonthlyWithdrawal),
            subtext: `Year 1 (${formatINR(result.initialMonthlyWithdrawal * 12)}/yr)`,
          },
          {
            label: `Year ${result.longevityYears} Monthly Payout`,
            value: formatINR(result.finalMonthlyWithdrawalAtEnd),
            subtext: `Stepped up by ${inputs.annualStepUpPercent}% annually`,
          },
          {
            label: "Corpus Longevity",
            value: result.isDepletedBeforeTenure
              ? `Year ${result.exhaustionYear}`
              : `${inputs.tenureYears} Full Years`,
            subtext: result.isDepletedBeforeTenure ? "Corpus depleted" : "100% Sustainable",
          },
          {
            label: "Max Safe Starting Payout",
            value: formatINR(result.maxSustainableInitialMonthlyWithdrawal),
            subtext: `Lasts all ${inputs.tenureYears} years with ${inputs.annualStepUpPercent}% step-up`,
          },
        ]}
      />

      {/* Longevity Verdict Alert */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          result.isDepletedBeforeTenure
            ? "border-rose-200 bg-rose-50/70 text-rose-950"
            : "border-emerald-200 bg-emerald-50/70 text-emerald-950"
        }`}
      >
        {result.isDepletedBeforeTenure ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <p className="text-xs leading-relaxed font-medium">{result.verdictNote}</p>
      </div>

      {/* Year-by-Year Schedule */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-600" />
            Year-by-Year Cashflow Schedule
          </h4>
          <button
            type="button"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {showFullSchedule ? "Show Less" : "View All Years"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2 pr-2">Year</th>
                <th className="py-2 px-2 text-right">Opening Balance</th>
                <th className="py-2 px-2 text-right">Monthly Payout</th>
                <th className="py-2 px-2 text-right">Annual Payout</th>
                <th className="py-2 pl-2 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(showFullSchedule
                ? result.annualSchedule
                : result.annualSchedule.slice(0, 8)
              ).map((row) => (
                <tr key={row.year}>
                  <td className="py-2 pr-2 font-medium text-slate-900">Year {row.year}</td>
                  <td className="py-2 px-2 text-right text-slate-700">
                    {formatINR(row.openingBalance)}
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-emerald-700">
                    {formatINR(row.monthlyPayoutInYear)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-800">
                    {formatINR(row.totalAnnualWithdrawal)}
                  </td>
                  <td className="py-2 pl-2 text-right font-medium text-slate-900">
                    {formatINR(row.closingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const formulaExplanationSlot = (
    <FormulaExplanation
      title="Step-Up SWP & Compounding Depletion Formulas"
      formula={stepUpSwpEngine.metadata.formula.expression}
      variables={stepUpSwpEngine.metadata.formula.variables}
      steps={stepUpSwpEngine.metadata.formula.steps}
    />
  );

  const faqSlot = <FAQSection faqs={stepUpSwpEngine.metadata.faqs} />;

  const relatedCalculatorsSlot = (
    <RelatedCalculators
      calculators={relatedLinks || defaultRelatedLinks}
      title="Related Retirement & Wealth Calculators"
    />
  );

  return (
    <CalculatorLayout
      title={stepUpSwpEngine.metadata.name}
      description={stepUpSwpEngine.metadata.shortDescription}
      badge="Inflation-Adjusted Cashflow"
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={formulaExplanationSlot}
      faqSlot={faqSlot}
      relatedCalculatorsSlot={relatedCalculatorsSlot}
    />
  );
};
