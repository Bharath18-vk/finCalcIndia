"use client";

import React, { useMemo, useState } from "react";
import {
  lcmGcdEngine,
  LcmGcdInput,
  calculateLcmGcd,
  defaultLcmGcdInput,
  lcmGcdInputSchema,
} from "@/lib/calculators/lcm-gcd";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, RefreshCw, ArrowRight } from "lucide-react";

export interface LcmGcdCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const LcmGcdCalculatorView: React.FC<LcmGcdCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "LCM and GCD Calculator", href: "/lcm-gcd-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Fraction Calculator",
        description: "Add, subtract, multiply, and divide fractions with reduction.",
        href: "/fraction-calculator",
        badge: "Fractions",
      },
      {
        title: "Ratio Calculator",
        description: "Simplify ratios, solve proportions, and partition totals.",
        href: "/ratio-calculator",
        badge: "Ratios",
      },
      {
        title: "Square Root Calculator",
        description: "Calculate square roots, cube roots, and powers.",
        href: "/square-root-calculator",
        badge: "Roots",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<LcmGcdInput>({
      schema: lcmGcdInputSchema,
      defaultInputs: defaultLcmGcdInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateLcmGcd(inputs);
  }, [inputs]);

  const handleInputChange = (val: string) => {
    updateInput("numbers", val);
    trackCalculatorUsed("lcm-gcd", "numbers");
    trackCalculatorResultGenerated("lcm-gcd");
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

  const meta = lcmGcdEngine.metadata;

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    return [
      {
        label: "Greatest Common Divisor (HCF)",
        value: result.gcd,
        formattedValue: String(result.gcd),
      },
      {
        label: "Least Common Multiple (LCM)",
        value: result.lcm,
        formattedValue: String(result.lcm),
      },
      {
        label: "All Common Divisors",
        value: 0,
        formattedValue: result.commonFactors.join(", "),
      },
      {
        label: "First 5 Common Multiples",
        value: 0,
        formattedValue: result.firstMultiples.join(", "),
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
              <label htmlFor="lcm-numbers" className="text-sm font-semibold text-slate-800 tracking-tight">
                Enter Positive Integers
              </label>
              <button
                type="button"
                onClick={() => updateInput("numbers", "")}
                className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>

            <input
              id="lcm-numbers"
              type="text"
              value={inputs.numbers}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. 24, 36 or 12, 18, 30"
              className="w-full h-12 px-3.5 text-slate-900 font-mono text-base bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 shadow-xs"
            />

            {validationErrors.numbers ? (
              <p className="text-xs font-medium text-red-600">{validationErrors.numbers}</p>
            ) : (
              <p className="text-xs text-slate-500">
                Separate whole numbers with commas, spaces, or semicolons (e.g. 24, 36).
              </p>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Quick Number Sets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "24, 36", val: "24, 36" },
                { label: "12, 18, 30", val: "12, 18, 30" },
                { label: "15, 25, 45", val: "15, 25, 45" },
                { label: "8, 12, 16, 24", val: "8, 12, 16, 24" },
                { label: "Coprime (7, 11)", val: "7, 11" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleInputChange(p.val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prime Factorizations Visualization */}
          {result.factorizations.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Prime Factorizations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.factorizations.map((f) => (
                  <div key={f.num} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono">
                    <span className="font-bold text-emerald-800">{f.num}</span> = {f.formatted}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle={`GCD (HCF) = ${result.gcd} | LCM = ${result.lcm}`}
            primaryValue={result.gcd}
            primaryFormattedValue={`GCD: ${result.gcd} | LCM: ${result.lcm}`}
            primarySubtitle={`Numbers: {${result.numbers.join(", ")}} | Divisors: ${result.commonFactors.join(", ")}`}
            secondaryMetrics={secondaryMetrics}
            ratioNote={`The Greatest Common Divisor is ${result.gcd} and the Least Common Multiple is ${result.lcm}.`}
            onReset={resetInputs}
          />

          {/* Mathematical Derivation Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Solution Breakdown
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
