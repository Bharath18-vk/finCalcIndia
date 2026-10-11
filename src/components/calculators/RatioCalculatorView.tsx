"use client";

import React, { useMemo, useState } from "react";
import {
  ratioEngine,
  RatioInput,
  RatioMode,
  calculateRatio,
  defaultRatioInput,
  ratioInputSchema,
} from "@/lib/calculators/ratio";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { formatINR } from "@/lib/formatters";
import { Share2, Check, ArrowRight } from "lucide-react";

export interface RatioCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const MODES: { id: RatioMode; label: string; description: string }[] = [
  { id: "simplify", label: "Simplify Ratio", description: "Reduce A : B to lowest terms" },
  { id: "proportion", label: "Solve Proportion", description: "Solve A : B = C : X" },
  { id: "divide", label: "Divide Total", description: "Partition total into A : B" },
];

export const RatioCalculatorView: React.FC<RatioCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Ratio Calculator", href: "/ratio-calculator" },
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
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and differences.",
        href: "/percentage-calculator",
        badge: "Percentages",
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
    useCalculatorUrlState<RatioInput>({
      schema: ratioInputSchema,
      defaultInputs: defaultRatioInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateRatio(inputs);
  }, [inputs]);

  const handleModeChange = (newMode: RatioMode) => {
    updateInput("mode", newMode);
    trackCalculatorUsed("ratio", `mode_${newMode}`);
    trackCalculatorResultGenerated("ratio");
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

  const meta = ratioEngine.metadata;

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    if (inputs.mode === "proportion") {
      return [
        {
          label: "Completed Proportion",
          value: 0,
          formattedValue: result.solvedProportion || "",
        },
        {
          label: "Scale Factor (C ÷ A)",
          value: result.scaleFactor || 0,
          formattedValue: String(result.scaleFactor),
        },
        {
          label: "Base Ratio in Simplest Form",
          value: 0,
          formattedValue: result.simplifiedRatio,
        },
      ];
    }

    if (inputs.mode === "divide") {
      return [
        {
          label: `Share B (${result.percentB}%)`,
          value: result.shareB || 0,
          formattedValue: formatINR(result.shareB || 0),
        },
        {
          label: "Total Divided",
          value: result.total || 0,
          formattedValue: formatINR(result.total || 0),
        },
        {
          label: "Applied Ratio",
          value: 0,
          formattedValue: `${result.simplifiedRatio} (${result.a}:${result.b})`,
        },
      ];
    }

    return [
      {
        label: "Decimal Value (A ÷ B)",
        value: result.decimalValue,
        formattedValue: String(result.decimalValue),
      },
      {
        label: "Unit Ratio (1 : N)",
        value: 0,
        formattedValue: result.unitRatio1,
      },
      {
        label: "Percentage Breakdown",
        value: 0,
        formattedValue: `${result.percentA}% : ${result.percentB}%`,
      },
      {
        label: "Greatest Common Divisor (GCD)",
        value: result.gcdValue,
        formattedValue: String(result.gcdValue),
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
                      {m.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode: Divide Total - Input for Total Amount */}
          {inputs.mode === "divide" && (
            <CurrencyInput
              label="Total Amount to Divide"
              value={inputs.total || 0}
              onChange={(val) => {
                updateInput("total", val);
                trackCalculatorUsed("ratio", "total");
                trackCalculatorResultGenerated("ratio");
              }}
              min={0}
              max={1000000000}
              step={1000}
              presets={[
                { label: "₹10,000", value: 10000 },
                { label: "₹50,000", value: 50000 },
                { label: "₹1,00,000", value: 100000 },
                { label: "₹10,00,000", value: 1000000 },
              ]}
              helperText="The lump sum amount or total quantity to be divided"
              error={validationErrors.total}
            />
          )}

          {/* Ratio Inputs A & B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <NumberInput
              label="First Term (A)"
              value={inputs.a}
              onChange={(val) => {
                updateInput("a", val);
                trackCalculatorUsed("ratio", "a");
                trackCalculatorResultGenerated("ratio");
              }}
              min={0.01}
              step={1}
              error={validationErrors.a}
            />
            <NumberInput
              label="Second Term (B)"
              value={inputs.b}
              onChange={(val) => {
                updateInput("b", val);
                trackCalculatorUsed("ratio", "b");
                trackCalculatorResultGenerated("ratio");
              }}
              min={0.01}
              step={1}
              error={validationErrors.b}
            />
          </div>

          {/* Mode: Proportion - Known Term C */}
          {inputs.mode === "proportion" && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                Proportion Equation: {inputs.a} : {inputs.b} = Term C : X
              </span>
              <NumberInput
                label="Third Known Term (C)"
                value={inputs.c || 0}
                onChange={(val) => {
                  updateInput("c", val);
                  trackCalculatorUsed("ratio", "c");
                  trackCalculatorResultGenerated("ratio");
                }}
                min={0.01}
                step={1}
                helperText="Find missing term X such that A/B = C/X"
                error={validationErrors.c}
              />
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Common Ratios:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "16 : 9 (Widescreen)", a: 16, b: 9 },
                { label: "4 : 3 (Standard)", a: 4, b: 3 },
                { label: "3 : 2 (Classic)", a: 3, b: 2 },
                { label: "1 : 1 (Square)", a: 1, b: 1 },
                { label: "12 : 18 (Simplify)", a: 12, b: 18 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    updateInput("a", p.a);
                    updateInput("b", p.b);
                  }}
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
              inputs.mode === "proportion"
                ? "Solved Unknown (X)"
                : inputs.mode === "divide"
                ? `Share A (${result.percentA}%)`
                : "Simplified Ratio"
            }
            primaryValue={
              inputs.mode === "proportion"
                ? result.solvedX || 0
                : inputs.mode === "divide"
                ? result.shareA || 0
                : result.decimalValue
            }
            primaryFormattedValue={
              inputs.mode === "proportion"
                ? String(result.solvedX)
                : inputs.mode === "divide"
                ? formatINR(result.shareA || 0)
                : result.simplifiedRatio
            }
            primarySubtitle={
              inputs.mode === "proportion"
                ? `Proportion: ${result.solvedProportion}`
                : inputs.mode === "divide"
                ? `Share B: ${formatINR(result.shareB || 0)} (${result.percentB}%)`
                : `GCD: ${result.gcdValue} | Decimal: ${result.decimalValue}`
            }
            secondaryMetrics={secondaryMetrics}
            onReset={resetInputs}
          />

          {/* Mathematical Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Solution
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
              title="Copy shareable link with current ratio inputs"
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
