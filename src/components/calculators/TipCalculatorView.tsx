"use client";

import React, { useMemo, useState } from "react";
import {
  tipEngine,
  TipInput,
  RoundingMode,
  calculateTip,
  defaultTipInput,
  tipInputSchema,
} from "@/lib/calculators/tip";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { formatINR } from "@/lib/formatters";
import { Share2, Check, Users, Utensils, Receipt, DollarSign } from "lucide-react";

export interface TipCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const TIP_PRESETS = [0, 5, 10, 12, 15, 20];
const TAX_PRESETS = [0, 5, 18];

export const TipCalculatorView: React.FC<TipCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Everyday Calculators", href: "/everyday" },
      { label: "Tip Calculator", href: "/tip-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Discount Calculator",
        description: "Calculate sales discounts, markdowns, and final prices.",
        href: "/discount-calculator",
        badge: "Shopping",
      },
      {
        title: "Percentage Calculator",
        description: "Calculate percentage changes, increases, and ratios.",
        href: "/percentage-calculator",
        badge: "Math",
      },
      {
        title: "Age Calculator",
        description: "Calculate exact chronological age, days lived, and next birthday.",
        href: "/age-calculator",
        badge: "Everyday",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<TipInput>({
      schema: tipInputSchema,
      defaultInputs: defaultTipInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateTip(inputs);
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

  const handlePresetTip = (tip: number) => {
    updateInput("tipPercentage", tip);
    trackCalculatorUsed("tip", `preset_tip_${tip}`);
    trackCalculatorResultGenerated("tip");
  };

  const handlePresetTax = (tax: number) => {
    updateInput("taxPercentage", tax);
    trackCalculatorUsed("tip", `preset_tax_${tax}`);
    trackCalculatorResultGenerated("tip");
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Total Payable Bill",
        value: result.totalAmount,
        formattedValue: formatINR(result.totalAmount),
        subtext: "Includes food, GST, & tip",
      },
      {
        label: "Tip / Service Gratuity",
        value: result.tipAmount,
        formattedValue: formatINR(result.tipAmount),
        subtext: `${result.tipPercentage}% of base bill`,
      },
      {
        label: "Taxes (GST/VAT)",
        value: result.taxAmount,
        formattedValue: formatINR(result.taxAmount),
        subtext: `${result.taxPercentage}% tax`,
      },
      {
        label: "Food Subtotal Per Person",
        value: result.billPerPerson,
        formattedValue: formatINR(result.billPerPerson),
        subtext: `Across ${result.splitCount} diners`,
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Bill & Diners Details
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Base Bill Amount */}
        <CurrencyInput
          id="billAmount"
          label="Food Bill Amount"
          value={inputs.billAmount}
          onChange={(val) => {
            updateInput("billAmount", val);
            trackCalculatorResultGenerated("tip");
          }}
          min={0}
          max={10000000}
          step={50}
          error={validationErrors.billAmount}
          helperText="Subtotal before taxes or service gratuity."
        />

        {/* Tip Percentage with Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-900">
              Tip / Service Gratuity (%)
            </label>
            <span className="text-xs font-semibold text-emerald-600">
              {inputs.tipPercentage}%
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetTip(preset)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.tipPercentage === preset
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
          <NumberInput
            id="tipPercentage"
            label="Custom Tip (%)"
            value={inputs.tipPercentage}
            onChange={(val) => {
              updateInput("tipPercentage", val);
              trackCalculatorResultGenerated("tip");
            }}
            min={0}
            max={100}
            step={1}
            unit="%"
            error={validationErrors.tipPercentage}
          />
        </div>

        {/* Number of People to Split */}
        <div>
          <NumberInput
            id="splitCount"
            label="Split Between (Number of People)"
            value={inputs.splitCount}
            onChange={(val) => {
              updateInput("splitCount", Math.max(1, Math.floor(val)));
              trackCalculatorResultGenerated("tip");
            }}
            min={1}
            max={100}
            step={1}
            unit="people"
            error={validationErrors.splitCount}
            helperText="Divide the total bill equally."
          />
        </div>

        {/* Restaurant GST / Tax with Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-900">
              GST / Taxes (%)
            </label>
            <span className="text-xs font-semibold text-slate-600">
              {inputs.taxPercentage || 0}%
            </span>
          </div>
          <div className="flex gap-2 mb-2">
            {TAX_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetTax(preset)}
                className={`flex-1 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.taxPercentage === preset
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset === 0 ? "0% (No Tax)" : `${preset}% GST`}
              </button>
            ))}
          </div>
        </div>

        {/* Rounding Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Rounding Options
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "none" as RoundingMode, label: "Exact" },
              { id: "total" as RoundingMode, label: "Round Total" },
              { id: "perPerson" as RoundingMode, label: "Round Person" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => updateInput("roundUp", option.id)}
                className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  (inputs.roundUp || "none") === option.id
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this split
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
        primaryTitle="Each Person Pays"
        primaryValue={result.roundedPerPerson}
        primaryFormattedValue={formatINR(result.roundedPerPerson)}
        primarySubtitle={`for ${result.splitCount} ${result.splitCount === 1 ? "Person" : "People"} (includes ${formatINR(result.tipPerPerson)} tip each)`}
        secondaryMetrics={metrics}
      />

      {/* Detailed Bill Split Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          Itemized Check Breakdown
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-600">Food Subtotal</span>
            <span className="font-semibold text-slate-900">{formatINR(result.billAmount)}</span>
          </div>
          {result.taxPercentage > 0 && (
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">GST / Taxes ({result.taxPercentage}%)</span>
              <span className="font-semibold text-slate-900">{formatINR(result.taxAmount)}</span>
            </div>
          )}
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-600">Tip / Service Gratuity ({result.tipPercentage}%)</span>
            <span className="font-semibold text-emerald-700">+{formatINR(result.tipAmount)}</span>
          </div>
          <div className="py-2.5 flex justify-between font-bold text-sm text-slate-900 bg-slate-50/50 px-2 rounded">
            <span>Total Bill Payable</span>
            <span>{formatINR(result.totalAmount)}</span>
          </div>
          <div className="py-2.5 flex justify-between text-slate-700">
            <span>Split per person ({result.splitCount} {result.splitCount === 1 ? "diner" : "diners"})</span>
            <span className="font-bold text-slate-900 text-sm">{formatINR(result.roundedPerPerson)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Restaurant Tipping & Service Charges in India
        </h2>
        <p>
          Dining customs in India have evolved significantly in recent years. Understanding the
          distinction between taxes, statutory service charges, and discretionary tips ensures fair
          settlements:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Voluntary Nature of Tips:</strong> Tipping is completely voluntary. The Central
            Consumer Protection Authority (CCPA) issued directives establishing that hotels and
            restaurants cannot automatically add a mandatory service charge to food bills.
          </li>
          <li>
            <strong>GST on Restaurant Dining:</strong> Standalone restaurants charge 5% GST (without
            Input Tax Credit), while restaurants in 5-star hotels with room tariffs exceeding ₹7,500
            charge 18% GST.
          </li>
          <li>
            <strong>Pre-Tax vs Post-Tax Tipping:</strong> It is standard etiquette to calculate tip
            percentages on the base food subtotal before GST is applied, preventing you from paying
            gratuity on government tax levies.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={tipEngine.metadata.name}
      badge={tipEngine.metadata.badge}
      description={tipEngine.metadata.shortDescription}
      directAnswer={tipEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        tipEngine.metadata.formula ? (
          <FormulaExplanation
            formula={tipEngine.metadata.formula.expression}
            variables={tipEngine.metadata.formula.variables}
            steps={tipEngine.metadata.formula.steps}
            notes={tipEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={tipEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators
          links={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
