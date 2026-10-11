"use client";

import React, { useMemo, useState } from "react";
import {
  probabilityEngine,
  ProbabilityInput,
  ProbabilityMode,
  calculateProbability,
  defaultProbabilityInput,
  probabilityInputSchema,
} from "@/lib/calculators/probability";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, ArrowRight } from "lucide-react";

export interface ProbabilityCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const MODES: { id: ProbabilityMode; label: string; desc: string }[] = [
  { id: "single", label: "Single Event", desc: "P(A) = favorable / total" },
  { id: "two_events", label: "Two Events", desc: "Independent & Mutually Exclusive" },
  { id: "binomial", label: "Binomial Series", desc: "n trials with success probability p" },
];

export const ProbabilityCalculatorView: React.FC<ProbabilityCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Probability Calculator", href: "/probability-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and differences.",
        href: "/percentage-calculator",
        badge: "Math",
      },
      {
        title: "Fraction Calculator",
        description: "Reduce and perform operations on fractional probabilities.",
        href: "/fraction-calculator",
        badge: "Math",
      },
      {
        title: "Average Calculator",
        description: "Find mean, median, mode, and standard deviation for datasets.",
        href: "/average-calculator",
        badge: "Statistics",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<ProbabilityInput>({
      schema: probabilityInputSchema,
      defaultInputs: defaultProbabilityInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateProbability(inputs);
  }, [inputs]);

  const handleModeChange = (newMode: ProbabilityMode) => {
    updateInput("mode", newMode);
    trackCalculatorUsed("probability", `mode_${newMode}`);
    trackCalculatorResultGenerated("probability");
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

  const meta = probabilityEngine.metadata;

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    if (inputs.mode === "two_events") {
      return [
        {
          label: "P(A and B) Intersection",
          value: result.probAAndB || 0,
          formattedValue: `${((result.probAAndB || 0) * 100).toFixed(2)}% (${result.probAAndB})`,
        },
        {
          label: "P(Neither A nor B)",
          value: result.probNeither || 0,
          formattedValue: `${((result.probNeither || 0) * 100).toFixed(2)}% (${result.probNeither})`,
        },
        {
          label: "P(A only, not B)",
          value: result.probANotB || 0,
          formattedValue: `${((result.probANotB || 0) * 100).toFixed(2)}% (${result.probANotB})`,
        },
      ];
    }

    if (inputs.mode === "binomial") {
      return [
        {
          label: `P(At Least ${result.targetSuccesses} Successes)`,
          value: result.probAtLeastK || 0,
          formattedValue: `${((result.probAtLeastK || 0) * 100).toFixed(2)}%`,
        },
        {
          label: `P(At Most ${result.targetSuccesses} Successes)`,
          value: result.probAtMostK || 0,
          formattedValue: `${((result.probAtMostK || 0) * 100).toFixed(2)}%`,
        },
        {
          label: "Expected Mean (μ)",
          value: result.expectedValue || 0,
          formattedValue: String(result.expectedValue),
        },
        {
          label: "Variance (σ²)",
          value: result.variance || 0,
          formattedValue: String(result.variance),
        },
      ];
    }

    return [
      {
        label: "Simplified Fraction",
        value: 0,
        formattedValue: result.ratioFraction,
      },
      {
        label: "Odds in Favor",
        value: 0,
        formattedValue: result.oddsInFavor,
      },
      {
        label: "Odds Against",
        value: 0,
        formattedValue: result.oddsAgainst,
      },
      {
        label: "Probability of Event NOT Occurring",
        value: result.complementaryProb || 0,
        formattedValue: `${((result.complementaryProb || 0) * 100).toFixed(2)}% (${result.complementaryProb})`,
      },
    ];
  }, [result, inputs.mode]);

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODES.map((m) => {
                const isActive = inputs.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{m.label}</div>
                    <div
                      className={`text-[11px] ${
                        isActive ? "text-emerald-100" : "text-slate-500"
                      }`}
                    >
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode 1: Single Event Inputs */}
          {inputs.mode === "single" && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <NumberInput
                label="Favorable Outcomes n(A)"
                value={inputs.favorableOutcomes ?? 1}
                onChange={(val) => {
                  updateInput("favorableOutcomes", val);
                  trackCalculatorUsed("probability", "favorableOutcomes");
                }}
                min={0}
                step={1}
                helperText="Number of desired or winning outcomes"
                error={validationErrors.favorableOutcomes}
                presets={[
                  { label: "Rolling a 6 (1)", value: 1 },
                  { label: "Even Die Roll (3)", value: 3 },
                  { label: "Coin Heads (1)", value: 1 },
                  { label: "Deck Ace (4)", value: 4 },
                  { label: "Deck Heart (13)", value: 13 },
                ]}
              />

              <NumberInput
                label="Total Possible Outcomes n(S)"
                value={inputs.totalOutcomes ?? 6}
                onChange={(val) => {
                  updateInput("totalOutcomes", val);
                  trackCalculatorUsed("probability", "totalOutcomes");
                }}
                min={1}
                step={1}
                helperText="Total size of sample space"
                error={validationErrors.totalOutcomes}
                presets={[
                  { label: "Coin (2)", value: 2 },
                  { label: "Die (6)", value: 6 },
                  { label: "Two Dice (36)", value: 36 },
                  { label: "Cards (52)", value: 52 },
                ]}
              />
            </div>
          )}

          {/* Mode 2: Two Events Inputs */}
          {inputs.mode === "two_events" && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Relationship Between Events
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "independent", label: "Independent", sub: "P(A & B) = P(A) × P(B)" },
                    { id: "mutually_exclusive", label: "Mutually Exclusive", sub: "P(A & B) = 0" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        updateInput(
                          "twoEventRelationship",
                          r.id as "independent" | "mutually_exclusive"
                        )
                      }
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        inputs.twoEventRelationship === r.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div>{r.label}</div>
                      <div className="text-[10px] opacity-80">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PercentageInput
                  label="Probability of Event A (%): P(A)"
                  value={Number(((inputs.probA ?? 0.5) * 100).toFixed(2))}
                  onChange={(val) => {
                    updateInput("probA", val / 100);
                    trackCalculatorUsed("probability", "probA");
                  }}
                  min={0}
                  max={100}
                  step={1}
                  presets={[
                    { label: "25%", value: 25 },
                    { label: "50%", value: 50 },
                    { label: "75%", value: 75 },
                  ]}
                />

                <PercentageInput
                  label="Probability of Event B (%): P(B)"
                  value={Number(((inputs.probB ?? 0.5) * 100).toFixed(2))}
                  onChange={(val) => {
                    updateInput("probB", val / 100);
                    trackCalculatorUsed("probability", "probB");
                  }}
                  min={0}
                  max={100}
                  step={1}
                  presets={[
                    { label: "25%", value: 25 },
                    { label: "50%", value: 50 },
                    { label: "75%", value: 75 },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Mode 3: Binomial Inputs */}
          {inputs.mode === "binomial" && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <NumberInput
                label="Number of Trials (n)"
                value={inputs.trials ?? 10}
                onChange={(val) => {
                  updateInput("trials", val);
                  trackCalculatorUsed("probability", "trials");
                }}
                min={1}
                max={170}
                step={1}
                presets={[
                  { label: "5 Trials", value: 5 },
                  { label: "10 Trials", value: 10 },
                  { label: "20 Trials", value: 20 },
                  { label: "50 Trials", value: 50 },
                ]}
              />

              <PercentageInput
                label="Probability of Success on Each Trial (p %)"
                value={Number(((inputs.successProb ?? 0.5) * 100).toFixed(2))}
                onChange={(val) => {
                  updateInput("successProb", val / 100);
                  trackCalculatorUsed("probability", "successProb");
                }}
                min={0}
                max={100}
                step={1}
                presets={[
                  { label: "16.7% (Die)", value: 16.67 },
                  { label: "50% (Coin)", value: 50 },
                  { label: "80% (Accurate)", value: 80 },
                ]}
              />

              <NumberInput
                label="Target Number of Successes (k)"
                value={inputs.targetSuccesses ?? 5}
                onChange={(val) => {
                  updateInput("targetSuccesses", val);
                  trackCalculatorUsed("probability", "targetSuccesses");
                }}
                min={0}
                max={inputs.trials ?? 10}
                step={1}
                helperText={`Must be between 0 and ${inputs.trials ?? 10}`}
              />
            </div>
          )}
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle={
              inputs.mode === "two_events"
                ? "P(A or B) Probability"
                : inputs.mode === "binomial"
                ? `P(Exactly ${result.targetSuccesses} Successes)`
                : "Probability of Event P(A)"
            }
            primaryValue={result.primaryPercentage}
            primaryFormattedValue={result.primaryFormatted}
            primarySubtitle={
              inputs.mode === "two_events"
                ? `P(A and B) = ${((result.probAAndB || 0) * 100).toFixed(2)}% | Neither = ${((result.probNeither || 0) * 100).toFixed(2)}%`
                : inputs.mode === "binomial"
                ? `Expected Value (Mean): ${result.expectedValue} | Variance: ${result.variance}`
                : `Decimal: ${result.primaryProbability} | Odds: ${result.oddsInFavor}`
            }
            secondaryMetrics={secondaryMetrics}
            onReset={resetInputs}
          />

          {/* Mathematical Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Probability Derivation
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-mono">
                {result.steps.map((st, idx) => (
                  <li key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {st}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Action */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
              title="Copy shareable link with current probability inputs"
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
