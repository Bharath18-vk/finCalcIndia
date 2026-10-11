"use client";

import React, { useMemo, useState } from "react";
import {
  permutationCombinationEngine,
  PermutationCombinationInput,
  calculatePermutationCombination,
  defaultPermutationCombinationInput,
  permutationCombinationInputSchema,
} from "@/lib/calculators/permutation-combination";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, ArrowRight } from "lucide-react";

export interface PermutationCombinationViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const PermutationCombinationView: React.FC<PermutationCombinationViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Permutation & Combination Calculator", href: "/permutation-combination-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Probability Calculator",
        description: "Calculate odds, independent intersections, and binomial distributions.",
        href: "/probability-calculator",
        badge: "Probability",
      },
      {
        title: "Ratio Calculator",
        description: "Simplify ratios, solve proportions, and partition totals.",
        href: "/ratio-calculator",
        badge: "Ratios",
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
    useCalculatorUrlState<PermutationCombinationInput>({
      schema: permutationCombinationInputSchema,
      defaultInputs: defaultPermutationCombinationInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculatePermutationCombination(inputs);
  }, [inputs]);

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

  const meta = permutationCombinationEngine.metadata;

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    return [
      {
        label: `Permutations (${inputs.n}P${inputs.r} - Order Matters)`,
        value: result.activePermutations,
        formattedValue: result.formattedPermutations,
      },
      {
        label: `Combinations (${inputs.n}C${inputs.r} - Order Doesn't Matter)`,
        value: result.activeCombinations,
        formattedValue: result.formattedCombinations,
      },
      {
        label: "Repetition Allowed?",
        value: 0,
        formattedValue: inputs.allowRepetition ? "Yes (With Replacement)" : "No (Without Replacement)",
      },
    ];
  }, [result, inputs]);

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
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <NumberInput
              label="Total Number of Items (n)"
              value={inputs.n}
              onChange={(val) => {
                updateInput("n", val);
                trackCalculatorUsed("permutation-combination", "n");
              }}
              min={0}
              max={100}
              step={1}
              helperText="Total elements in the set (n ≥ r)"
              error={validationErrors.n}
              presets={[
                { label: "4 items", value: 4 },
                { label: "10 items", value: 10 },
                { label: "20 items", value: 20 },
                { label: "52 (Cards)", value: 52 },
              ]}
            />

            <NumberInput
              label="Items to Choose / Select (r)"
              value={inputs.r}
              onChange={(val) => {
                updateInput("r", val);
                trackCalculatorUsed("permutation-combination", "r");
              }}
              min={0}
              max={100}
              step={1}
              helperText="Number of elements to arrange or group"
              error={validationErrors.r}
              presets={[
                { label: "Choose 2", value: 2 },
                { label: "Choose 3", value: 3 },
                { label: "Choose 5", value: 5 },
                { label: "Choose 10", value: 10 },
              ]}
            />

            {/* Repetition Toggle */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(inputs.allowRepetition)}
                  onChange={(e) => {
                    updateInput("allowRepetition", e.target.checked);
                    trackCalculatorUsed("permutation-combination", "allowRepetition");
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Allow Repetition (Replacement)
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-1 pl-6.5">
                Enable if items can be chosen multiple times (e.g. dice rolls or passcode digits).
              </p>
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle={`Combinations: ${inputs.n}C${inputs.r}`}
            primaryValue={result.activeCombinations}
            primaryFormattedValue={result.formattedCombinations}
            primarySubtitle={`Permutations (${inputs.n}P${inputs.r}): ${result.formattedPermutations}`}
            secondaryMetrics={secondaryMetrics}
            ratioNote={`Choosing ${inputs.r} from ${inputs.n} gives ${result.formattedCombinations} unique groups (order ignored) and ${result.formattedPermutations} ordered sequences.`}
            onReset={resetInputs}
          />

          {/* Mathematical Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Combinatorics Derivation
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
              title="Copy shareable link with current n and r"
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
