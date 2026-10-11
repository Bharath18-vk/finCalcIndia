"use client";

import React, { useMemo, useState } from "react";
import {
  averageEngine,
  AverageInput,
  calculateAverage,
  defaultAverageInput,
  averageInputSchema,
} from "@/lib/calculators/average";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, RefreshCw } from "lucide-react";

export interface AverageCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const AverageCalculatorView: React.FC<AverageCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Average Calculator", href: "/average-calculator" },
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
        title: "CAGR Calculator",
        description: "Calculate compound annual growth rate over multi-year periods.",
        href: "/cagr-calculator",
        badge: "Finance",
      },
      {
        title: "Ratio Calculator",
        description: "Simplify ratios and solve proportional equations.",
        href: "/ratio-calculator",
        badge: "Math",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<AverageInput>({
      schema: averageInputSchema,
      defaultInputs: defaultAverageInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateAverage(inputs);
  }, [inputs]);

  const handleInputChange = (val: string) => {
    updateInput("numbers", val);
    trackCalculatorUsed("average", "numbers");
    trackCalculatorResultGenerated("average");
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

  const meta = averageEngine.metadata;

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    return [
      {
        label: "Median (Middle Value)",
        value: result.median,
        formattedValue: result.median.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
      },
      {
        label: "Mode (Most Frequent)",
        value: 0,
        formattedValue: result.modeString,
      },
      {
        label: "Sum (Total Added)",
        value: result.sum,
        formattedValue: result.sum.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
      },
      {
        label: "Count of Numbers (N)",
        value: result.count,
        formattedValue: String(result.count),
      },
      {
        label: `Range (${result.min} to ${result.max})`,
        value: result.range,
        formattedValue: String(result.range),
      },
      ...(result.geometricMean !== null
        ? [
            {
              label: "Geometric Mean",
              value: result.geometricMean,
              formattedValue: result.geometricMean.toLocaleString("en-IN", {
                maximumFractionDigits: 4,
              }),
            },
          ]
        : []),
      {
        label: "Sample Std Dev (s)",
        value: result.sampleStandardDeviation,
        formattedValue: result.sampleStandardDeviation.toLocaleString("en-IN", {
          maximumFractionDigits: 4,
        }),
      },
      {
        label: "Population Std Dev (σ)",
        value: result.populationStandardDeviation,
        formattedValue: result.populationStandardDeviation.toLocaleString("en-IN", {
          maximumFractionDigits: 4,
        }),
      },
    ];
  }, [result]);

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={meta.name}
      badge={meta.badge}
      description={meta.shortDescription}
      directAnswer={meta.directAnswer}
      asOfDate={meta.version?.lastReviewed}
      inputsSlot={
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="numbers-input"
                className="text-sm font-semibold text-slate-800 tracking-tight"
              >
                Enter Numbers
              </label>
              <button
                type="button"
                onClick={() => updateInput("numbers", "")}
                className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>

            <textarea
              id="numbers-input"
              rows={4}
              value={inputs.numbers}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. 10, 25, 30, 45, 90 or paste numbers separated by spaces"
              className="w-full px-3.5 py-3 text-slate-900 font-mono text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 shadow-xs"
            />

            {validationErrors.numbers ? (
              <p className="text-xs font-medium text-red-600">{validationErrors.numbers}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Separate numbers using commas, spaces, tabs, semicolons, or newlines.
              </p>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Quick Datasets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "10, 25, 30, 45, 90", val: "10, 25, 30, 45, 90" },
                { label: "Exam Scores (65, 78, 82, 90, 95)", val: "65, 78, 82, 90, 95" },
                { label: "Decimals (2.5, 3.8, 4.1, 7.9)", val: "2.5, 3.8, 4.1, 7.9" },
                { label: "Heights (160, 165, 170, 175, 180)", val: "160, 165, 170, 175, 180" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleInputChange(preset.val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorted Data Stream View */}
          {result.sortedNumbers.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                Ordered Dataset ({result.count} values)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {result.sortedNumbers.map((num, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded text-slate-800"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle="Average (Arithmetic Mean)"
            primaryValue={result.mean}
            primaryFormattedValue={result.mean.toLocaleString("en-IN", {
              maximumFractionDigits: 4,
            })}
            primarySubtitle={`Based on ${result.count} data points (Sum = ${result.sum.toLocaleString("en-IN")})`}
            secondaryMetrics={secondaryMetrics}
            ratioNote={`The average is calculated as ${result.sum} ÷ ${result.count} = ${result.mean}.`}
            onReset={resetInputs}
          />

          {/* Share Action */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
              title="Copy shareable link with current numbers"
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
