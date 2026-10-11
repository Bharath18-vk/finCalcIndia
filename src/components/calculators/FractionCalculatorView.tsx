"use client";

import React, { useMemo, useState } from "react";
import {
  FractionInput,
  FractionOperator,
  calculateFraction,
  fractionEngine,
  defaultFractionInput,
  fractionInputSchema,
} from "@/lib/calculators/fraction";
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

export interface FractionCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const OPERATORS: { id: FractionOperator; label: string; symbol: string }[] = [
  { id: "+", label: "Add", symbol: "+" },
  { id: "-", label: "Subtract", symbol: "−" },
  { id: "*", label: "Multiply", symbol: "×" },
  { id: "/", label: "Divide", symbol: "÷" },
];

export const FractionCalculatorView: React.FC<FractionCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Fraction Calculator", href: "/fraction-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Percentage Calculator",
        description: "Convert fractions and parts into percentages with step-by-step math.",
        href: "/percentage-calculator",
        badge: "Percentages",
      },
      {
        title: "Ratio Calculator",
        description: "Simplify and solve proportions between quantities.",
        href: "/ratio-calculator",
        badge: "Ratios",
      },
      {
        title: "CAGR Calculator",
        description: "Calculate multi-year compound annual growth rates.",
        href: "/cagr-calculator",
        badge: "Finance",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<FractionInput>({
      schema: fractionInputSchema,
      defaultInputs: defaultFractionInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateFraction(inputs);
  }, [inputs]);

  const handleOperatorChange = (op: FractionOperator) => {
    updateInput("operator", op);
    trackCalculatorUsed("fraction", `op_${op}`);
    trackCalculatorResultGenerated("fraction");
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

  const meta = fractionEngine.metadata;

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
          {/* Operation Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Arithmetic Operation
            </label>
            <div className="grid grid-cols-4 gap-2">
              {OPERATORS.map((op) => {
                const isActive = inputs.operator === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleOperatorChange(op.id)}
                    className={`py-2 px-3 text-sm font-bold rounded-xl border text-center transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {op.symbol} <span className="text-xs font-normal hidden sm:inline ml-1">({op.label})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fraction 1 & 2 Visual Arrangement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            {/* Fraction 1 */}
            <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block border-b border-slate-100 pb-1">
                First Fraction
              </span>
              <NumberInput
                label="Numerator 1 (Top)"
                value={inputs.num1}
                onChange={(val) => updateInput("num1", val)}
                step={1}
                error={validationErrors.num1}
              />
              <div className="border-t-2 border-slate-300 my-1" />
              <NumberInput
                label="Denominator 1 (Bottom)"
                value={inputs.den1}
                onChange={(val) => updateInput("den1", val)}
                step={1}
                error={validationErrors.den1}
                helperText="Must not be 0"
              />
            </div>

            {/* Fraction 2 */}
            <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block border-b border-slate-100 pb-1">
                Second Fraction
              </span>
              <NumberInput
                label="Numerator 2 (Top)"
                value={inputs.num2}
                onChange={(val) => updateInput("num2", val)}
                step={1}
                error={validationErrors.num2}
              />
              <div className="border-t-2 border-slate-300 my-1" />
              <NumberInput
                label="Denominator 2 (Bottom)"
                value={inputs.den2}
                onChange={(val) => updateInput("den2", val)}
                step={1}
                error={validationErrors.den2}
                helperText="Must not be 0"
              />
            </div>
          </div>
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle="Reduced Result Fraction"
            primaryValue={result.decimalValue}
            primaryFormattedValue={result.formattedResult}
            primarySubtitle={
              result.mixedNumber
                ? `Mixed Number: ${result.mixedNumber}`
                : `Decimal Equivalent: ${result.formattedDecimal}`
            }
            secondaryMetrics={[
              {
                label: "Decimal Value",
                value: result.decimalValue,
                formattedValue: result.formattedDecimal,
              },
              ...(result.mixedNumber
                ? [
                    {
                      label: "Mixed Number",
                      value: 0,
                      formattedValue: result.mixedNumber,
                    },
                  ]
                : []),
              {
                label: "Original Operation",
                value: 0,
                formattedValue: `${inputs.num1}/${inputs.den1} ${inputs.operator} ${inputs.num2}/${inputs.den2}`,
              },
            ]}
            ratioNote={result.isError ? result.errorMessage : undefined}
            onReset={resetInputs}
          />

          {/* Step-by-Step Mathematical Work */}
          {result.detailedSteps && result.detailedSteps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Solution
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
              title="Copy shareable link with current fractions"
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
