"use client";

import React, { useMemo, useState } from "react";
import {
  PercentageInput,
  PercentageMode,
  calculatePercentage,
  percentageEngine,
  defaultPercentageInput,
  percentageInputSchema,
} from "@/lib/calculators/percentage";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, ArrowRight } from "lucide-react";

export interface PercentageCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const MODES: { id: PercentageMode; label: string; shortLabel: string; labelX: string; labelY: string }[] = [
  {
    id: "what-is-x-percent-of-y",
    label: "What is X% of Y?",
    shortLabel: "% of Value",
    labelX: "Percentage (%)",
    labelY: "Total Amount (Y)",
  },
  {
    id: "x-is-what-percent-of-y",
    label: "X is what % of Y?",
    shortLabel: "Find % Rate",
    labelX: "Part Value (X)",
    labelY: "Whole Amount (Y)",
  },
  {
    id: "percentage-increase",
    label: "Percentage Increase",
    shortLabel: "% Increase",
    labelX: "Initial Value (X)",
    labelY: "Final Value (Y)",
  },
  {
    id: "percentage-decrease",
    label: "Percentage Decrease",
    shortLabel: "% Decrease",
    labelX: "Initial Value (X)",
    labelY: "Final Value (Y)",
  },
  {
    id: "percentage-difference",
    label: "Percentage Difference",
    shortLabel: "% Difference",
    labelX: "First Number (X)",
    labelY: "Second Number (Y)",
  },
];

export const PercentageCalculatorView: React.FC<PercentageCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Percentage Calculator", href: "/percentage-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "CAGR Calculator",
        description: "Calculate compounded annual growth rates over multi-year periods.",
        href: "/cagr-calculator",
        badge: "Growth Rate",
      },
      {
        title: "Compound Interest Calculator",
        description: "Explore quarterly and monthly compounding growth.",
        href: "/compound-interest-calculator",
        badge: "Interest",
      },
      {
        title: "SIP Calculator",
        description: "Calculate mutual fund systematic investment returns.",
        href: "/sip-calculator",
        badge: "Wealth",
      },
    ],
    []
  );

  // Synchronized URL state + Zod schema validation
  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<PercentageInput>({
      schema: percentageInputSchema,
      defaultInputs: defaultPercentageInput,
      syncWithUrl: true,
    });

  // Calculate pure result
  const result = useMemo(() => {
    return calculatePercentage(inputs);
  }, [inputs]);

  // Active mode details
  const activeModeConfig = useMemo(() => {
    return MODES.find((m) => m.id === inputs.mode) || MODES[0];
  }, [inputs.mode]);

  const handleModeChange = (mode: PercentageMode) => {
    updateInput("mode", mode);
    trackCalculatorUsed("percentage", `mode_${mode}`);
    trackCalculatorResultGenerated("percentage");
  };

  const handleValXChange = (val: number) => {
    updateInput("valX", val);
    trackCalculatorUsed("percentage", "valX");
    trackCalculatorResultGenerated("percentage");
  };

  const handleValYChange = (val: number) => {
    updateInput("valY", val);
    trackCalculatorUsed("percentage", "valY");
    trackCalculatorResultGenerated("percentage");
  };

  const handleCopyShareLink = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // safe fallback
    }
  };

  const meta = percentageEngine.metadata;

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={meta.name}
      badge={meta.badge}
      description={meta.shortDescription}
      directAnswer={meta.directAnswer}
      asOfDate={meta.version?.lastReviewed}
      inputsSlot={
        <div className="space-y-6">
          {/* Mode Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Calculation Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODES.map((m) => {
                const isActive = inputs.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {m.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual Active Mode Header */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="font-bold text-emerald-800">Formula Mode:</span>
            <span>{activeModeConfig.label}</span>
          </div>

          {/* Dynamic Numeric Inputs */}
          <div className="space-y-4">
            <NumberInput
              label={activeModeConfig.labelX}
              value={inputs.valX}
              onChange={handleValXChange}
              step={1}
              unit={inputs.mode === "what-is-x-percent-of-y" ? "%" : undefined}
              error={validationErrors.valX}
              presets={
                inputs.mode === "what-is-x-percent-of-y"
                  ? [
                      { label: "5%", value: 5 },
                      { label: "10%", value: 10 },
                      { label: "15%", value: 15 },
                      { label: "20%", value: 20 },
                      { label: "25%", value: 25 },
                      { label: "50%", value: 50 },
                    ]
                  : [
                      { label: "50", value: 50 },
                      { label: "100", value: 100 },
                      { label: "250", value: 250 },
                      { label: "500", value: 500 },
                    ]
              }
            />

            <NumberInput
              label={activeModeConfig.labelY}
              value={inputs.valY}
              onChange={handleValYChange}
              step={10}
              error={validationErrors.valY}
              presets={[
                { label: "100", value: 100 },
                { label: "500", value: 500 },
                { label: "1,000", value: 1000 },
                { label: "5,000", value: 5000 },
                { label: "10,000", value: 10000 },
              ]}
            />
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle="Calculated Answer"
            primaryValue={result.resultValue}
            primaryFormattedValue={result.formattedResult}
            primarySubtitle={result.explanation}
            secondaryMetrics={result.secondaryMetrics.map((m) => ({
              label: m.label,
              value: typeof m.value === "number" ? m.value : 0,
              formattedValue: m.formattedValue || String(m.value),
              subtext: m.subtext,
            }))}
            ratioNote={result.isDivisionByZero ? "Mathematical Warning: Division by zero is undefined." : undefined}
            onReset={resetInputs}
          />

          {/* Detailed Calculation Steps */}
          {result.detailedSteps && result.detailedSteps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Mathematical Work
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-mono">
                {result.detailedSteps.map((step, idx) => (
                  <li key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Link Action */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
              title="Copy shareable link with current inputs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share This Calculation</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName={meta.name}
          formula={meta.formula.expression}
          variables={meta.formula.variables.map((v) => ({
            symbol: v.symbol,
            name: v.label,
            description: v.description,
            valueDescription: v.valueDescription,
          }))}
          steps={meta.formula.steps}
          notes={meta.formula.notes}
        />
      }
      faqSlot={<FAQSection faqs={meta.faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks || defaultRelatedLinks} />}
    />
  );
};
