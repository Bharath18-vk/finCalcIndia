"use client";

import React, { useMemo, useState } from "react";
import {
  standardDeviationEngine,
  StandardDeviationInput,
  calculateStandardDeviation,
  defaultStandardDeviationInput,
  standardDeviationInputSchema,
} from "@/lib/calculators/standard-deviation";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, RefreshCw, ArrowRight, Table } from "lucide-react";

export interface StandardDeviationCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const StandardDeviationCalculatorView: React.FC<StandardDeviationCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Standard Deviation Calculator", href: "/standard-deviation-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Average Calculator",
        description: "Calculate arithmetic mean, median, mode, and range.",
        href: "/average-calculator",
        badge: "Statistics",
      },
      {
        title: "Probability Calculator",
        description: "Calculate single event odds, independent intersections, and binomial distributions.",
        href: "/probability-calculator",
        badge: "Probability",
      },
      {
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and differences.",
        href: "/percentage-calculator",
        badge: "Math",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<StandardDeviationInput>({
      schema: standardDeviationInputSchema,
      defaultInputs: defaultStandardDeviationInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateStandardDeviation(inputs);
  }, [inputs]);

  const handleDatasetChange = (val: string) => {
    updateInput("dataset", val);
    trackCalculatorUsed("standard-deviation", "dataset");
    trackCalculatorResultGenerated("standard-deviation");
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

  const meta = standardDeviationEngine.metadata;
  const isSample = inputs.calculationType === "sample";

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    return [
      {
        label: isSample ? "Sample Variance (s²)" : "Population Variance (σ²)",
        value: result.activeVariance,
        formattedValue: String(result.activeVariance),
      },
      {
        label: "Mean (x̄)",
        value: result.mean,
        formattedValue: String(result.mean),
      },
      {
        label: "Sum of Squares (SS)",
        value: result.sumOfSquares,
        formattedValue: String(result.sumOfSquares),
      },
      {
        label: "Standard Error (SEM)",
        value: result.standardErrorOfMean,
        formattedValue: String(result.standardErrorOfMean),
      },
      {
        label: "Coefficient of Variation",
        value: result.coefficientOfVariation,
        formattedValue: `${result.coefficientOfVariation}%`,
      },
      {
        label: isSample ? "Population Std Dev (σ)" : "Sample Std Dev (s)",
        value: isSample ? result.populationStdDev : result.sampleStdDev,
        formattedValue: String(isSample ? result.populationStdDev : result.sampleStdDev),
      },
    ];
  }, [result, isSample]);

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
          {/* Formula Type Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Formula Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "sample", label: "Sample (s, N − 1)", desc: "Standard subset of data" },
                { id: "population", label: "Population (σ, N)", desc: "Complete entire dataset" },
              ].map((opt) => {
                const isActive = inputs.calculationType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateInput("calculationType", opt.id as "sample" | "population")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                    <div className={`text-[11px] ${isActive ? "text-emerald-100" : "text-slate-500"}`}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dataset Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="sd-dataset" className="text-sm font-semibold text-slate-800 tracking-tight">
                Enter Data Points
              </label>
              <button
                type="button"
                onClick={() => updateInput("dataset", "")}
                className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>

            <textarea
              id="sd-dataset"
              rows={4}
              value={inputs.dataset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              placeholder="e.g. 10, 12, 23, 23, 16, 23, 21, 16"
              className="w-full px-3.5 py-3 text-slate-900 font-mono text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 shadow-xs"
            />

            {validationErrors.dataset ? (
              <p className="text-xs font-medium text-red-600">{validationErrors.dataset}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Separate numbers using commas, spaces, tabs, or newlines. At least 2 numbers required.
              </p>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Quick Datasets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Sample Data (10, 12, 23, 23, 16...)", val: "10, 12, 23, 23, 16, 23, 21, 16" },
                { label: "Exam Scores (60, 72, 85, 90, 68, 78, 92)", val: "60, 72, 85, 90, 68, 78, 92" },
                { label: "Heights (160, 165, 170, 172, 168, 175)", val: "160, 165, 170, 172, 168, 175" },
                { label: "Low Variance (10, 11, 10, 11, 10, 12)", val: "10, 11, 10, 11, 10, 12" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleDatasetChange(p.val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle={
              isSample ? "Sample Standard Deviation (s)" : "Population Standard Deviation (σ)"
            }
            primaryValue={result.activeStdDev}
            primaryFormattedValue={String(result.activeStdDev)}
            primarySubtitle={`Variance: ${result.activeVariance} | Mean: ${result.mean} (N = ${result.count})`}
            secondaryMetrics={secondaryMetrics}
            ratioNote={`The ${inputs.calculationType} standard deviation is ${result.activeStdDev}, indicating the average spread of values from the mean of ${result.mean}.`}
            onReset={resetInputs}
          />

          {/* Empirical Rule (68-95-99.7) Confidence Ranges */}
          {result.count >= 2 && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide block">
                Empirical Rule Spread (Assuming Normal Distribution)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="font-bold text-emerald-800">68% of Data (±1s)</div>
                  <div className="text-slate-700 font-mono mt-0.5">
                    {result.confidence68[0]} to {result.confidence68[1]}
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="font-bold text-emerald-800">95% of Data (±2s)</div>
                  <div className="text-slate-700 font-mono mt-0.5">
                    {result.confidence95[0]} to {result.confidence95[1]}
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <div className="font-bold text-emerald-800">99.7% of Data (±3s)</div>
                  <div className="text-slate-700 font-mono mt-0.5">
                    {result.confidence99[0]} to {result.confidence99[1]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle Deviations Table */}
          {result.tableRows.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowTable(!showTable)}
                className="w-full py-2 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                {showTable ? "Hide Step-by-Step Deviations Table" : `Show Step-by-Step Deviations Table (${result.count} rows)`}
              </button>

              {showTable && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                  <table className="w-full text-xs text-left text-slate-700 font-mono">
                    <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Data Point (x)</th>
                        <th className="py-2 px-3">Deviation (x − x̄)</th>
                        <th className="py-2 px-3">Squared (x − x̄)²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {result.tableRows.map((row) => (
                        <tr key={row.index} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-slate-400">{row.index}</td>
                          <td className="py-1.5 px-3 font-semibold">{row.value}</td>
                          <td className="py-1.5 px-3 text-slate-600">{row.deviation}</td>
                          <td className="py-1.5 px-3 text-emerald-700 font-semibold">{row.squaredDeviation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Mathematical Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Calculation Breakdown
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
              title="Copy shareable link with current dataset"
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
