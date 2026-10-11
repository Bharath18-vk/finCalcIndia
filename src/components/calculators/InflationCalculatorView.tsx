"use client";

import React, { useMemo, useState } from "react";
import {
  inflationEngine,
  InflationInput,
  defaultInflationInputs,
  InflationMilestone,
  InflationYearSchedule,
} from "@/lib/calculators/inflation";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorResultGenerated } from "@/lib/analytics";
import {
  TrendingDown,
  Share2,
  Check,
  Flame,
  Table,
  Target,
  Sparkles,
} from "lucide-react";

interface InflationCalculatorViewProps {
  initialInputs?: Partial<InflationInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

const INFLATION_PRESETS = [
  { label: "4.0% (RBI Target)", value: 4.0 },
  { label: "6.0% (Indian CPI Average)", value: 6.0 },
  { label: "8.0% (Lifestyle / Urban)", value: 8.0 },
  { label: "10.0% (Education / Medical)", value: 10.0 },
];

const TENURE_PRESETS = [5, 10, 15, 20, 25, 30];

export const InflationCalculatorView: React.FC<InflationCalculatorViewProps> = ({
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
  } = useCalculatorUrlState<InflationInput>({
    schema: inflationEngine.schema,
    defaultInputs: { ...defaultInflationInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return inflationEngine.calculate(inputs);
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
      { label: "Inflation Calculator", href: "/inflation-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "SIP Calculator",
        href: "/sip-calculator",
        description: "Calculate mutual fund wealth growth to beat inflation.",
        category: "Investment",
      },
      {
        title: "Step-Up SIP Calculator",
        href: "/step-up-sip-calculator",
        description: "Increase annual investments by 10% to protect against lifestyle inflation.",
        category: "Investment",
      },
      {
        title: "Fixed Deposit (FD)",
        href: "/fd-calculator",
        description: "Check if bank fixed deposit interest outpaces retail inflation.",
        category: "Savings",
      },
    ],
    []
  );

  const metrics = useMemo(
    () => [
      {
        label: `Purchasing Power of ${formatINR(result.currentAmount)}`,
        value: result.purchasingPower,
        formattedValue: formatINR(result.purchasingPower),
        subtext: `Down by ${result.purchasingPowerLossPercent}% in real value`,
      },
      {
        label: "Price Inflation Multiplier",
        value: result.effectiveMultiplier,
        formattedValue: `${result.effectiveMultiplier}x`,
        subtext: `Expenses multiply by ${result.effectiveMultiplier} times`,
      },
      {
        label: "Annual Inflation Compounding",
        value: result.inflationRate,
        formattedValue: `${result.inflationRate}% p.a.`,
        subtext: "Effective compound growth rate",
      },
      {
        label: "Years into the Future",
        value: result.timeHorizonYears,
        formattedValue: `${result.timeHorizonYears} Years`,
        subtext: `Projection year: ${new Date().getFullYear() + result.timeHorizonYears}`,
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            Inflation Parameters
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Amount Input */}
        <NumberInput
          id="currentAmount"
          label="Today's Cost / Value (₹)"
          value={inputs.currentAmount}
          onChange={(val) => {
            updateInput("currentAmount", val);
            trackCalculatorResultGenerated("inflation");
          }}
          min={1000}
          max={1000000000}
          step={10000}
          unit="₹"
          error={validationErrors.currentAmount}
          helperText="Enter the cost of your current expense or savings in today's rupees."
        />

        {/* Inflation Rate */}
        <div>
          <NumberInput
            id="inflationRate"
            label="Annual Inflation Rate (%)"
            value={inputs.inflationRate}
            onChange={(val) => {
              updateInput("inflationRate", val);
              trackCalculatorResultGenerated("inflation");
            }}
            min={0}
            max={30}
            step={0.1}
            unit="%"
            error={validationErrors.inflationRate}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {INFLATION_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  updateInput("inflationRate", p.value);
                  trackCalculatorResultGenerated("inflation");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.inflationRate === p.value
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Horizon */}
        <div>
          <NumberInput
            id="timeHorizonYears"
            label="Time Horizon (Years)"
            value={inputs.timeHorizonYears}
            onChange={(val) => {
              updateInput("timeHorizonYears", Math.max(1, Math.floor(val)));
              trackCalculatorResultGenerated("inflation");
            }}
            min={1}
            max={50}
            step={1}
            unit="years"
            error={validationErrors.timeHorizonYears}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {TENURE_PRESETS.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  updateInput("timeHorizonYears", yr);
                  trackCalculatorResultGenerated("inflation");
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.timeHorizonYears === yr
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {yr} Yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this inflation calculation
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
      <ResultCard
        primaryTitle={`Required Future Cost in ${result.timeHorizonYears} Years`}
        primaryValue={result.futureCost}
        primaryFormattedValue={formatINR(result.futureCost)}
        primarySubtitle={`At ${result.inflationRate}% annual inflation, prices multiply by ${result.effectiveMultiplier}x`}
        secondaryMetrics={metrics}
      />

      {/* Common Indian Goals Inflation Escalation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-600" />
          Common Indian Goals at {result.timeHorizonYears} Years
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Financial Milestone</th>
                <th className="p-2.5 text-right">Cost Today</th>
                <th className="p-2.5 text-right">Cost in {result.timeHorizonYears} Yrs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.milestones.map((m: InflationMilestone) => (
                <tr key={m.category} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-medium text-slate-900">{m.category}</td>
                  <td className="p-2.5 text-right text-slate-600">{formatINR(m.todayCost)}</td>
                  <td className="p-2.5 text-right font-bold text-amber-700">
                    {formatINR(m.futureCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Year-by-Year Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            Compounding Progression Schedule
          </h3>
          <button
            type="button"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            {showFullSchedule ? "Show First 5 Years" : `View All ${result.timeHorizonYears} Years`}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Year</th>
                <th className="p-2.5">Calendar Yr</th>
                <th className="p-2.5 text-right">Required Cost</th>
                <th className="p-2.5 text-right">Purchasing Power</th>
                <th className="p-2.5 text-right">Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(showFullSchedule ? result.annualSchedule : result.annualSchedule.slice(0, 5)).map(
                (row: InflationYearSchedule) => (
                  <tr key={row.year} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-900">Year {row.year}</td>
                    <td className="p-2.5 text-slate-600">{row.calendarYear}</td>
                    <td className="p-2.5 text-right font-bold text-amber-700">
                      {formatINR(row.futureCost)}
                    </td>
                    <td className="p-2.5 text-right text-slate-700">
                      {formatINR(row.purchasingPowerEquivalent)}
                    </td>
                    <td className="p-2.5 text-right text-slate-500 font-mono">
                      {row.cumulativeInflationMultiplier}x
                    </td>
                  </tr>
                )
              )}
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
          How Inflation Silently Erodes Wealth in India
        </h2>
        <p>
          Inflation represents the persistent rate at which the general level of prices for goods and
          services rises over time, subsequently eroding the purchasing power of each rupee:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>The Purchasing Power Illusion:</strong> If you keep ₹10 Lakhs in cash or a zero-interest savings
            account for 15 years at 6% inflation, the nominal amount remains ₹10 Lakhs, but its real purchasing
            value shrinks to less than ₹4.17 Lakhs.
          </li>
          <li>
            <strong>Sectoral Inflation Differences:</strong> While headline CPI (Consumer Price Index) measures general
            household consumption, education and medical treatments in India routinely inflate at 10%–12% per year.
          </li>
          <li>
            <strong>Beating Inflation with Growth Assets:</strong> Because conservative bank fixed deposits offer
            post-tax yields that barely track inflation, equities, mutual fund SIPs, and sovereign gold bonds are
            crucial to achieving a positive real rate of return.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={inflationEngine.metadata.name}
      badge={inflationEngine.metadata.badge}
      description={inflationEngine.metadata.shortDescription}
      directAnswer={inflationEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        inflationEngine.metadata.formula ? (
          <FormulaExplanation
            formula={inflationEngine.metadata.formula.expression}
            variables={inflationEngine.metadata.formula.variables}
            steps={inflationEngine.metadata.formula.steps}
            notes={inflationEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={inflationEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators links={relatedLinks || defaultRelatedLinks} />
      }
    />
  );
};
