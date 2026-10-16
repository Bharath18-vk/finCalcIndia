"use client";

import React, { useMemo, useState } from "react";
import {
  discountEngine,
  DiscountInput,
  DiscountResult,
  defaultDiscountInput,
  discountInputSchema,
} from "@/lib/calculators/discount";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, Tag, Receipt } from "lucide-react";

export interface DiscountCalculatorViewProps {
  initialInputs?: Partial<DiscountInput>;
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const DiscountCalculatorView: React.FC<DiscountCalculatorViewProps> = ({
  initialInputs,
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Math & Everyday", href: "/math" },
      { label: "Discount Calculator", href: "/discount-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and proportions quickly.",
        href: "/percentage-calculator",
        badge: "Math",
      },
      {
        title: "GST Calculator",
        description: "Calculate gross and net invoice prices with CGST, SGST, and IGST rates.",
        href: "/gst-calculator",
        badge: "Tax",
      },
      {
        title: "Simple Interest Calculator",
        description: "Calculate standard simple interest yields and maturity returns.",
        href: "/simple-interest-calculator",
        badge: "Interest",
      },
      {
        title: "Salary Calculator",
        description: "Calculate monthly in-hand take-home salary after deductions.",
        href: "/salary-calculator",
        badge: "Income",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<DiscountInput>({
      schema: discountInputSchema,
      defaultInputs: { ...defaultDiscountInput, ...(initialInputs || {}) },
      syncWithUrl: true,
    });

  const result: DiscountResult = useMemo(() => {
    return discountEngine.calculate(inputs);
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

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Total Money Saved",
        value: result.totalSavings,
        formattedValue: formatINR(result.totalSavings),
        subtext: `${result.discountPercent}% discount from list price`,
      },
      {
        label: "Original Price (MRP)",
        value: result.originalPrice,
        formattedValue: formatINR(result.originalPrice),
        subtext: "Tag price before markdown",
      },
      {
        label: "Effective Savings Rate",
        value: result.effectiveDiscountRate,
        formattedValue: `${result.effectiveDiscountRate}%`,
        subtext: "Net discount relative to original",
      },
      ...(result.taxAmount > 0
        ? [
            {
              label: `Sales Tax / GST (${result.taxPercent}%)`,
              value: result.taxAmount,
              formattedValue: formatINR(result.taxAmount),
              subtext: "Tax added on discounted price",
            },
          ]
        : []),
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-600" />
          Price & Discount Parameters
        </h2>
        <button
          type="button"
          onClick={resetInputs}
          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Original Price */}
        <NumberInput
          id="originalPrice"
          label="Original Price / MRP (₹)"
          value={inputs.originalPrice}
          onChange={(val) => {
            updateInput("originalPrice", val);
            trackCalculatorResultGenerated("discount");
          }}
          min={0}
          max={100000000}
          step={100}
          unit="₹"
          error={validationErrors.originalPrice}
          presets={[
            { label: "₹500", value: 500 },
            { label: "₹1,000", value: 1000 },
            { label: "₹2,000", value: 2000 },
            { label: "₹5,000", value: 5000 },
            { label: "₹10,000", value: 10000 },
          ]}
          helperText="Enter the sticker price or retail MRP before any markdown."
        />

        {/* Discount Percentage */}
        <NumberInput
          id="discountPercent"
          label="Discount Percentage (%)"
          value={inputs.discountPercent}
          onChange={(val) => {
            updateInput("discountPercent", val);
            trackCalculatorResultGenerated("discount");
          }}
          min={0}
          max={100}
          step={1}
          unit="%"
          error={validationErrors.discountPercent}
          presets={[
            { label: "10%", value: 10 },
            { label: "15%", value: 15 },
            { label: "20%", value: 20 },
            { label: "25%", value: 25 },
            { label: "50%", value: 50 },
          ]}
          helperText="Percentage reduction offered by the seller or store."
        />

        {/* Sales Tax / GST */}
        <NumberInput
          id="taxPercent"
          label="Sales Tax / GST (% optional)"
          value={inputs.taxPercent ?? 0}
          onChange={(val) => {
            updateInput("taxPercent", val);
            trackCalculatorResultGenerated("discount");
          }}
          min={0}
          max={28}
          step={1}
          unit="%"
          error={validationErrors.taxPercent}
          presets={[
            { label: "0% (MRP Inclusive)", value: 0 },
            { label: "5% GST", value: 5 },
            { label: "12% GST", value: 12 },
            { label: "18% GST", value: 18 },
          ]}
          helperText="Under Indian MRP laws, tax is already included. Set to 0% if already included."
        />
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this discount calculation
          </div>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      <ResultCard
        primaryTitle="Final Price to Pay"
        primaryValue={result.finalPrice}
        primaryFormattedValue={formatINR(result.finalPrice)}
        primarySubtitle={`You save ${formatINR(result.totalSavings)} (${result.discountPercent}% off ${formatINR(result.originalPrice)})`}
        secondaryMetrics={metrics}
      />

      {/* Visual Breakdown of Savings vs Outflow */}
      {result.originalPrice > 0 && (
        <FinancialBreakdownChart
          title="Price & Savings Composition"
          totalLabel="Original Tag Price"
          slices={[
            {
              label: "Final Price to Pay",
              value: result.finalPrice,
              color: "#10b981",
            },
            {
              label: "Discount Savings",
              value: result.totalSavings,
              color: "#3b82f6",
            },
            ...(result.taxAmount > 0
              ? [
                  {
                    label: `GST / Sales Tax (${result.taxPercent}%)`,
                    value: result.taxAmount,
                    color: "#f59e0b",
                  },
                ]
              : []),
          ]}
        />
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title={discountEngine.metadata.name}
      description={discountEngine.metadata.shortDescription}
      badge={discountEngine.metadata.badge}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={
        discountEngine.metadata.formula ? (
          <FormulaExplanation
            formula={discountEngine.metadata.formula.expression}
            variables={discountEngine.metadata.formula.variables}
            steps={discountEngine.metadata.formula.steps}
            notes={discountEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={
        discountEngine.metadata.faqs ? (
          <FAQSection faqs={discountEngine.metadata.faqs} />
        ) : undefined
      }
      relatedCalculatorsSlot={
        <RelatedCalculators
          calculators={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
