"use client";

import React, { useMemo, useState } from "react";
import {
  squareRootEngine,
  SquareRootInput,
  RootExponentMode,
  calculateSquareRoot,
  defaultSquareRootInput,
  squareRootInputSchema,
} from "@/lib/calculators/square-root";
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

export interface SquareRootCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const MODES: { id: RootExponentMode; label: string; desc: string }[] = [
  { id: "root", label: "Radical / Root", desc: "Square Root (√x) & n-th root" },
  { id: "exponent", label: "Power / Exponent", desc: "x raised to power y (xʸ)" },
];

export const SquareRootCalculatorView: React.FC<SquareRootCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Square Root Calculator", href: "/square-root-calculator" },
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
        badge: "Math",
      },
      {
        title: "Average Calculator",
        description: "Find mean, median, mode, and standard deviation.",
        href: "/average-calculator",
        badge: "Statistics",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<SquareRootInput>({
      schema: squareRootInputSchema,
      defaultInputs: defaultSquareRootInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateSquareRoot(inputs);
  }, [inputs]);

  const handleModeChange = (newMode: RootExponentMode) => {
    updateInput("mode", newMode);
    trackCalculatorUsed("square-root", `mode_${newMode}`);
    trackCalculatorResultGenerated("square-root");
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

  const meta = squareRootEngine.metadata;
  const isRoot = inputs.mode === "root";

  const secondaryMetrics: MetricItem[] = useMemo(() => {
    if (!isRoot) {
      return [
        {
          label: "Scientific Notation",
          value: 0,
          formattedValue: result.scientificNotation || "",
        },
        {
          label: "Inverse Power (1 / xʸ)",
          value: result.inversePower || 0,
          formattedValue: String(result.inversePower),
        },
        {
          label: "Expression",
          value: 0,
          formattedValue: `${result.base}^${result.exponent}`,
        },
      ];
    }

    return [
      {
        label: "Simplified Radical Form",
        value: 0,
        formattedValue: result.simplifiedRadical || "",
      },
      {
        label: "Perfect Root?",
        value: 0,
        formattedValue: result.isPerfectRoot ? "Yes (Integer Root)" : "No (Irrational Decimal)",
      },
      {
        label: "Root Degree (n)",
        value: result.rootDegree || 2,
        formattedValue: String(result.rootDegree),
      },
    ];
  }, [result, isRoot]);

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
            <div className="grid grid-cols-2 gap-2">
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
                    <div className={`text-[11px] ${isActive ? "text-emerald-100" : "text-slate-500"}`}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Root Mode Inputs */}
          {isRoot && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <NumberInput
                label="Number to Root (Radicand)"
                value={inputs.radicand ?? 144}
                onChange={(val) => {
                  updateInput("radicand", val);
                  trackCalculatorUsed("square-root", "radicand");
                }}
                min={0}
                step={1}
                helperText="Enter positive number to take root of"
                error={validationErrors.radicand}
                presets={[
                  { label: "144", value: 144 },
                  { label: "72", value: 72 },
                  { label: "256", value: 256 },
                  { label: "1000", value: 1000 },
                  { label: "2", value: 2 },
                ]}
              />

              <NumberInput
                label="Root Degree (n)"
                value={inputs.rootDegree ?? 2}
                onChange={(val) => {
                  updateInput("rootDegree", val);
                  trackCalculatorUsed("square-root", "rootDegree");
                }}
                min={2}
                max={20}
                step={1}
                helperText="2 = Square Root (√), 3 = Cube Root (∛)"
                error={validationErrors.rootDegree}
                presets={[
                  { label: "Square Root (n=2)", value: 2 },
                  { label: "Cube Root (n=3)", value: 3 },
                  { label: "4th Root (n=4)", value: 4 },
                ]}
              />
            </div>
          )}

          {/* Exponent Mode Inputs */}
          {!isRoot && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <NumberInput
                label="Base (x)"
                value={inputs.base ?? 2}
                onChange={(val) => {
                  updateInput("base", val);
                  trackCalculatorUsed("square-root", "base");
                }}
                step={1}
                error={validationErrors.base}
                presets={[
                  { label: "2", value: 2 },
                  { label: "5", value: 5 },
                  { label: "10", value: 10 },
                  { label: "e (2.718)", value: 2.71828 },
                ]}
              />

              <NumberInput
                label="Exponent / Power (y)"
                value={inputs.exponent ?? 10}
                onChange={(val) => {
                  updateInput("exponent", val);
                  trackCalculatorUsed("square-root", "exponent");
                }}
                step={1}
                helperText="Supports positive, negative, and decimal powers"
                error={validationErrors.exponent}
                presets={[
                  { label: "Power of 2 (x²)", value: 2 },
                  { label: "Power of 3 (x³)", value: 3 },
                  { label: "Power of 10 (x¹⁰)", value: 10 },
                  { label: "Inverse Power (-1)", value: -1 },
                ]}
              />
            </div>
          )}
        </div>
      }
      resultsSlot={
        <div className="space-y-5">
          <ResultCard
            primaryTitle={
              isRoot
                ? inputs.rootDegree === 2
                  ? `√${result.radicand} Square Root`
                  : `${result.rootDegree}√${result.radicand} Root`
                : `${result.base}^${result.exponent} Power`
            }
            primaryValue={result.primaryValue}
            primaryFormattedValue={String(result.primaryValue)}
            primarySubtitle={
              isRoot
                ? result.isPerfectRoot
                  ? `Perfect Root: ${result.primaryValue}² = ${result.radicand}`
                  : `Simplified: ${result.simplifiedRadical}`
                : `Scientific: ${result.scientificNotation}`
            }
            secondaryMetrics={secondaryMetrics}
            onReset={resetInputs}
          />

          {/* Mathematical Derivation Steps */}
          {result.steps && result.steps.length > 0 && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                Step-by-Step Mathematical Work
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
              title="Copy shareable link with current values"
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
