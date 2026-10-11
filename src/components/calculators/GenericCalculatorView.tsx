"use client";

import React, { useMemo, useState } from "react";
import { CalculatorEngine, CalculatorResultModel } from "@/lib/calculators/types";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check } from "lucide-react";

export interface GenericCalculatorViewProps<TInput extends Record<string, any>, TResult> {
  engine: CalculatorEngine<TInput, TResult>;
  initialInputs?: Partial<TInput>;
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
  customInputsSlot?: React.ReactNode;
  customResultsSlot?: React.ReactNode;
}

export function GenericCalculatorView<TInput extends Record<string, any>, TResult>({
  engine,
  initialInputs,
  breadcrumbs,
  relatedLinks,
  customInputsSlot,
  customResultsSlot,
}: GenericCalculatorViewProps<TInput, TResult>) {
  const [copiedShare, setCopiedShare] = useState(false);

  // Default breadcrumbs if not provided
  const resolvedBreadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    const categoryLabels: Record<string, string> = {
      finance: "Finance",
      math: "Math",
      statistics: "Statistics",
      health: "Health",
      fitness: "Fitness",
      everyday: "Everyday",
      engineering: "Engineering",
      conversion: "Conversion",
      education: "Education",
    };
    return [
      { label: "Home", href: "/" },
      {
        label: `${categoryLabels[engine.metadata.category] || "Calculators"}`,
        href: `/${engine.metadata.category}`,
      },
      { label: engine.metadata.name, href: engine.metadata.route },
    ];
  }, [breadcrumbs, engine.metadata]);

  // Combined default inputs
  const effectiveDefaultInputs = useMemo(() => {
    return {
      ...engine.defaultInputs,
      ...(initialInputs || {}),
    } as TInput;
  }, [engine.defaultInputs, initialInputs]);

  // Synchronized URL State & Zod Validation
  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<TInput>({
      schema: engine.schema,
      defaultInputs: effectiveDefaultInputs,
      syncWithUrl: true,
    });

  // Calculate pure result
  const rawResult = useMemo(() => {
    return engine.calculate(inputs);
  }, [engine, inputs]);

  // Format result through model
  const resultModel: CalculatorResultModel<TResult> = useMemo(() => {
    if (engine.formatResult) {
      return engine.formatResult(rawResult, inputs);
    }
    // Default fallback result model
    return {
      raw: rawResult,
      primary: {
        key: "primary",
        label: "Result",
        value: typeof rawResult === "number" ? rawResult : String(rawResult),
      },
    };
  }, [engine, rawResult, inputs]);

  const handleFieldChange = (key: keyof TInput & string, value: any) => {
    updateInput(key, value);
    trackCalculatorUsed(engine.id, key);
    trackCalculatorResultGenerated(engine.id);
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

  // Convert secondary results to ResultCard MetricItems
  const secondaryMetrics: MetricItem[] = useMemo(() => {
    if (!resultModel.secondary) return [];
    return resultModel.secondary.map((sec) => ({
      label: sec.label,
      value: typeof sec.value === "number" ? sec.value : 0,
      formattedValue: sec.formattedValue || String(sec.value),
      color: sec.color,
      subtext: sec.subtext,
    }));
  }, [resultModel.secondary]);

  return (
    <CalculatorLayout
      breadcrumbs={resolvedBreadcrumbs}
      title={engine.metadata.name}
      badge={engine.metadata.badge}
      description={engine.metadata.shortDescription}
      directAnswer={engine.metadata.directAnswer}
      asOfDate={engine.metadata.version?.lastReviewed}
      inputsSlot={
        customInputsSlot || (
          <div className="space-y-5">
            {engine.fields.map((field) => {
              const error = validationErrors[field.name];
              const value = inputs[field.name];

              if (field.type === "currency") {
                return (
                  <CurrencyInput
                    key={field.name}
                    label={field.label}
                    value={Number(value) || 0}
                    onChange={(val) => handleFieldChange(field.name, val)}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    presets={field.presets as any}
                    helperText={field.helperText}
                    error={error}
                  />
                );
              }

              if (field.type === "percentage") {
                return (
                  <PercentageInput
                    key={field.name}
                    label={field.label}
                    value={Number(value) || 0}
                    onChange={(val) => handleFieldChange(field.name, val)}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    presets={field.presets as any}
                    helperText={field.helperText}
                    error={error}
                  />
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <div key={field.name} className="w-full space-y-2">
                    <label className="text-sm font-semibold text-slate-800 tracking-tight">
                      {field.label}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full h-11 px-3 text-slate-900 font-semibold bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                    >
                      {field.options.map((opt) => (
                        <option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {error ? (
                      <p className="text-xs font-medium text-red-600">{error}</p>
                    ) : field.helperText ? (
                      <p className="text-xs text-slate-500">{field.helperText}</p>
                    ) : null}
                  </div>
                );
              }

              return (
                <NumberInput
                  key={field.name}
                  label={field.label}
                  value={Number(value) || 0}
                  onChange={(val) => handleFieldChange(field.name, val)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  unit={field.unit}
                  presets={field.presets as any}
                  helperText={field.helperText}
                  error={error}
                />
              );
            })}
          </div>
        )
      }
      resultsSlot={
        customResultsSlot || (
          <div className="space-y-4">
            <ResultCard
              primaryTitle={resultModel.primary.label}
              primaryValue={
                typeof resultModel.primary.value === "number" ? resultModel.primary.value : 0
              }
              primaryFormattedValue={
                resultModel.primary.formattedValue || String(resultModel.primary.value)
              }
              primarySubtitle={resultModel.primary.subtext}
              secondaryMetrics={secondaryMetrics}
              ratioNote={resultModel.summaryText}
              onReset={resetInputs}
            />

            {/* Share link button */}
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
        )
      }
      formulaExplanationSlot={
        engine.metadata.formula && (
          <FormulaExplanation
            calculatorName={engine.metadata.name}
            formula={engine.metadata.formula.expression}
            variables={engine.metadata.formula.variables.map((v) => ({
              symbol: v.symbol,
              name: v.label,
              description: v.description,
              valueDescription: v.valueDescription,
            }))}
            steps={engine.metadata.formula.steps}
            notes={engine.metadata.formula.notes}
          />
        )
      }
      faqSlot={
        engine.metadata.faqs &&
        engine.metadata.faqs.length > 0 && <FAQSection faqs={engine.metadata.faqs} />
      }
      relatedCalculatorsSlot={
        relatedLinks && relatedLinks.length > 0 && <RelatedCalculators links={relatedLinks} />
      }
    />
  );
}
