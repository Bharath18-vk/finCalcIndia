"use client";

import React, { useMemo, useState } from "react";
import {
  gstEngine,
  GstInput,
  defaultGstInputs,
  GST_SLABS,
} from "@/lib/calculators/gst";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { formatINR } from "@/lib/formatters";
import { trackCalculatorResultGenerated } from "@/lib/analytics";
import {
  Receipt,
  Share2,
  Check,
  Building2,
  Table,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

interface GstCalculatorViewProps {
  initialInputs?: Partial<GstInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

export const GstCalculatorView: React.FC<GstCalculatorViewProps> = ({
  initialInputs,
  breadcrumbs,
  relatedLinks,
}) => {
  const {
    inputs,
    updateInput,
    resetInputs,
    validationErrors,
    shareableUrl,
  } = useCalculatorUrlState<GstInput>({
    schema: gstEngine.schema,
    defaultInputs: { ...defaultGstInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return gstEngine.calculate(inputs);
  }, [inputs]);

  const [copiedShare, setCopiedShare] = useState(false);

  const handleCopyShareLink = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // ignore
    }
  };

  const defaultBreadcrumbs = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Tax & Salary", href: "/income-tax-calculator" },
      { label: "GST Calculator", href: "/gst-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "Income Tax Calculator",
        href: "/income-tax-calculator",
        description: "Compare Old vs New Tax Regime with 87A rebate and marginal relief.",
        category: "Tax",
      },
      {
        title: "Salary Calculator (In-Hand)",
        href: "/salary-calculator",
        description: "Calculate take-home pay from CTC with EPF, Professional Tax, and TDS.",
        category: "Salary",
      },
      {
        title: "Discount Calculator",
        href: "/discount-calculator",
        description: "Calculate single/double discounts and post-discount invoice prices with GST.",
        category: "Commercial Math",
      },
    ],
    []
  );

  const metrics = useMemo(
    () => [
      {
        label: "Pre-Tax Base (Net)",
        value: result.netAmount,
        formattedValue: formatINR(result.netAmount),
        subtext: "Value before taxes",
      },
      {
        label: `Total GST (${result.gstRate}%)`,
        value: result.gstAmount,
        formattedValue: formatINR(result.gstAmount),
        subtext: result.supplyType === "intra-state" ? "CGST + SGST" : "IGST (Inter-state)",
      },
      ...(result.supplyType === "intra-state"
        ? [
            {
              label: `CGST (${result.gstRate / 2}%)`,
              value: result.cgstAmount,
              formattedValue: formatINR(result.cgstAmount),
              subtext: "Central Government portion",
            },
            {
              label: `SGST (${result.gstRate / 2}%)`,
              value: result.sgstAmount,
              formattedValue: formatINR(result.sgstAmount),
              subtext: "State Government portion",
            },
          ]
        : [
            {
              label: `IGST (${result.gstRate}%)`,
              value: result.igstAmount,
              formattedValue: formatINR(result.igstAmount),
              subtext: "Integrated interstate tax",
            },
          ]),
      ...(result.quantity > 1
        ? [
            {
              label: "Per Unit Price (Gross)",
              value: result.perUnitGross,
              formattedValue: formatINR(result.perUnitGross),
              subtext: `For 1 of ${result.quantity} units`,
            },
          ]
        : []),
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Transaction Details
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Exclusive vs Inclusive Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Calculation Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                updateInput("taxType", "exclusive");
                trackCalculatorResultGenerated("gst");
              }}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                inputs.taxType === "exclusive"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              GST Exclusive (Add GST)
            </button>
            <button
              type="button"
              onClick={() => {
                updateInput("taxType", "inclusive");
                trackCalculatorResultGenerated("gst");
              }}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                inputs.taxType === "inclusive"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              GST Inclusive (Remove GST)
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {inputs.taxType === "exclusive"
              ? "Entered amount will be treated as the net price before tax."
              : "Entered amount will be treated as the final MRP including tax."}
          </p>
        </div>

        {/* Amount Input */}
        <NumberInput
          id="amount"
          label={inputs.taxType === "exclusive" ? "Base Amount (₹)" : "MRP / Total Amount (₹)"}
          value={inputs.amount}
          onChange={(val) => {
            updateInput("amount", val);
            trackCalculatorResultGenerated("gst");
          }}
          min={1}
          max={1000000000}
          step={100}
          unit="₹"
          error={validationErrors.amount}
          helperText="Enter transaction value in Indian Rupees."
        />

        {/* GST Slab Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-900">
              Statutory GST Rate (%)
            </label>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {inputs.gstRate}%
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {GST_SLABS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  updateInput("gstRate", rate);
                  trackCalculatorResultGenerated("gst");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  inputs.gstRate === rate
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
          <NumberInput
            id="gstRateCustom"
            label="Custom GST Rate (%)"
            value={inputs.gstRate}
            onChange={(val) => {
              updateInput("gstRate", val);
              trackCalculatorResultGenerated("gst");
            }}
            min={0}
            max={100}
            step={0.1}
            unit="%"
            error={validationErrors.gstRate}
          />
        </div>

        {/* Supply Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Supply Location (Destination)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                updateInput("supplyType", "intra-state");
                trackCalculatorResultGenerated("gst");
              }}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                (inputs.supplyType ?? "intra-state") === "intra-state"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Intra-State (CGST + SGST)
            </button>
            <button
              type="button"
              onClick={() => {
                updateInput("supplyType", "inter-state");
                trackCalculatorResultGenerated("gst");
              }}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                inputs.supplyType === "inter-state"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Inter-State (IGST)
            </button>
          </div>
        </div>

        {/* Quantity */}
        <NumberInput
          id="quantity"
          label="Quantity / Units"
          value={inputs.quantity ?? 1}
          onChange={(val) => {
            updateInput("quantity", Math.max(1, Math.floor(val)));
            trackCalculatorResultGenerated("gst");
          }}
          min={1}
          max={100000}
          step={1}
          error={validationErrors.quantity}
          helperText="Number of billing units."
        />
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this GST calculation
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
        primaryTitle={result.taxType === "exclusive" ? "Total Invoice Price (Gross)" : "Pre-Tax Base Amount (Net)"}
        primaryValue={result.taxType === "exclusive" ? result.grossAmount : result.netAmount}
        primaryFormattedValue={formatINR(result.taxType === "exclusive" ? result.grossAmount : result.netAmount)}
        primarySubtitle={`Total GST: ${formatINR(result.gstAmount)} (${result.gstRate}% ${
          result.supplyType === "intra-state" ? "CGST + SGST" : "IGST"
        })`}
        secondaryMetrics={metrics}
      />

      {/* Visual Invoice Tax Breakdown Chart */}
      <FinancialBreakdownChart
        title="Invoice Amount Composition"
        totalLabel="Gross Invoice Value"
        slices={
          result.supplyType === "intra-state"
            ? [
                { label: "Net Taxable Value", value: result.netAmount, color: "#3b82f6" },
                { label: `CGST (${result.gstRate / 2}%)`, value: result.cgstAmount, color: "#10b981" },
                { label: `SGST (${result.gstRate / 2}%)`, value: result.sgstAmount, color: "#06b6d4" },
              ]
            : [
                { label: "Net Taxable Value", value: result.netAmount, color: "#3b82f6" },
                { label: `IGST (${result.gstRate}%)`, value: result.igstAmount, color: "#10b981" },
              ]
        }
      />

      {/* Itemized Invoice Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-600" />
          Itemized Invoice Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Component</th>
                <th className="p-2.5">Rate</th>
                <th className="p-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-medium text-slate-900">Taxable Net Amount</td>
                <td className="p-2.5 text-slate-500">—</td>
                <td className="p-2.5 text-right font-semibold text-slate-900">
                  {formatINR(result.netAmount)}
                </td>
              </tr>
              {result.supplyType === "intra-state" ? (
                <>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-slate-700">Central GST (CGST)</td>
                    <td className="p-2.5 text-slate-500">{result.gstRate / 2}%</td>
                    <td className="p-2.5 text-right text-emerald-700 font-medium">
                      +{formatINR(result.cgstAmount)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-slate-700">State / UT GST (SGST)</td>
                    <td className="p-2.5 text-slate-500">{result.gstRate / 2}%</td>
                    <td className="p-2.5 text-right text-emerald-700 font-medium">
                      +{formatINR(result.sgstAmount)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr className="hover:bg-slate-50/50">
                  <td className="p-2.5 text-slate-700">Integrated GST (IGST)</td>
                  <td className="p-2.5 text-slate-500">{result.gstRate}%</td>
                  <td className="p-2.5 text-right text-emerald-700 font-medium">
                    +{formatINR(result.igstAmount)}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="p-2.5 text-slate-900">Gross Total (MRP)</td>
                <td className="p-2.5 text-slate-700">{result.gstRate}% Total</td>
                <td className="p-2.5 text-right text-emerald-700 text-sm">
                  {formatINR(result.grossAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Understanding Goods and Services Tax (GST) in India
        </h2>
        <p>
          Enacted on July 1, 2017, the Goods and Services Tax (GST) is a comprehensive, multi-stage, destination-based
          indirect tax levied on the manufacture, sale, and consumption of goods as well as services throughout India:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Destination-Based Consumption:</strong> GST is collected by the state where the goods or services
            are consumed, rather than where they are produced.
          </li>
          <li>
            <strong>Dual Structure:</strong> India operates a dual GST structure. For transactions within the same state
            (Intra-State), tax is shared equally between the Centre (CGST) and State (SGST). For interstate commerce,
            IGST is levied.
          </li>
          <li>
            <strong>Input Tax Credit (ITC):</strong> Registered businesses can offset the GST paid on purchases against the
            GST collected on outgoing sales, eliminating the cascading &ldquo;tax-on-tax&rdquo; effect.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={gstEngine.metadata.name}
      badge={gstEngine.metadata.badge}
      description={gstEngine.metadata.shortDescription}
      directAnswer={gstEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        gstEngine.metadata.formula ? (
          <FormulaExplanation
            formula={gstEngine.metadata.formula.expression}
            variables={gstEngine.metadata.formula.variables}
            steps={gstEngine.metadata.formula.steps}
            notes={gstEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={gstEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators links={relatedLinks || defaultRelatedLinks} />
      }
    />
  );
};
