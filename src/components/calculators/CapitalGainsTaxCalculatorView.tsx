"use client";

import React, { useMemo, useState } from "react";
import {
  capitalGainsTaxEngine,
  CapitalGainsTaxInput,
  defaultCapitalGainsTaxInputs,
  CapitalGainsAssetType,
} from "@/lib/calculators/capital-gains-tax";
import { CII_TABLE } from "@/lib/calculators/inflation";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import {
  Scale,
  Share2,
  Check,
  ShieldCheck,
  Sparkles,
  Building,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface CapitalGainsTaxCalculatorViewProps {
  initialInputs?: Partial<CapitalGainsTaxInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

const ASSET_OPTIONS: { id: CapitalGainsAssetType; label: string; badge: string }[] = [
  { id: "listed_equity", label: "Listed Stocks & Equity MFs", badge: "12.5% LTCG / 20% STCG" },
  { id: "real_estate", label: "Real Estate (Property)", badge: "Grandfathering Rules" },
  { id: "debt_mf", label: "Debt Mutual Funds", badge: "Sec 50AA Slab" },
  { id: "gold", label: "Gold & SGBs", badge: "12.5% LTCG" },
  { id: "unlisted_equity", label: "Unlisted Shares", badge: "12.5% LTCG" },
];

export const CapitalGainsTaxCalculatorView: React.FC<CapitalGainsTaxCalculatorViewProps> = ({
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
  } = useCalculatorUrlState<CapitalGainsTaxInput>({
    schema: capitalGainsTaxEngine.schema,
    defaultInputs: { ...defaultCapitalGainsTaxInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return capitalGainsTaxEngine.calculate(inputs);
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
      { label: "Capital Gains Tax", href: "/capital-gains-tax-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "Inflation & CII Calculator",
        href: "/inflation-calculator",
        description: "Verify CBDT Cost Inflation Index table and evaluate long-term purchasing power.",
        category: "Tax & Investment",
      },
      {
        title: "Income Tax Calculator",
        href: "/income-tax-calculator",
        description: "Compare Old vs New Tax Regime with comprehensive deductions and slab rates.",
        category: "Tax",
      },
      {
        title: "Mutual Fund SIP Calculator",
        href: "/sip-calculator",
        description: "Plan future portfolio wealth with disciplined monthly compounding.",
        category: "Investment",
      },
    ],
    []
  );

  const ciiYears = useMemo(() => Object.keys(CII_TABLE).reverse(), []);

  // UI Slots
  const inputsSlot = (
    <div className="space-y-6">
      {/* Asset Category Tabs */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Select Asset Class
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ASSET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                updateInput("assetType", opt.id);
                // Adjust default holding months for quick convenience
                if (opt.id === "listed_equity" && inputs.holdingPeriodMonths <= 12) {
                  updateInput("holdingPeriodMonths", 24);
                } else if (opt.id === "real_estate" && inputs.holdingPeriodMonths <= 24) {
                  updateInput("holdingPeriodMonths", 36);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                inputs.assetType === opt.id
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="text-sm font-medium">{opt.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sale Price */}
      <NumberInput
        id="salePrice"
        label="Full Sale Value (Gross Consideration)"
        value={inputs.salePrice}
        onChange={(val) => updateInput("salePrice", val)}
        unit="₹"
        min={1000}
        max={1000000000}
        step={10000}
        helperText="Total redemption proceeds or property sale value."
        error={validationErrors?.salePrice}
      />

      {/* Purchase Price */}
      <NumberInput
        id="purchasePrice"
        label="Original Cost of Acquisition"
        value={inputs.purchasePrice}
        onChange={(val) => updateInput("purchasePrice", val)}
        unit="₹"
        min={0}
        max={1000000000}
        step={10000}
        helperText="Original purchase amount or mutual fund investment cost."
        error={validationErrors?.purchasePrice}
      />

      {/* Holding Period Months */}
      <div>
        <NumberInput
          id="holdingPeriodMonths"
          label="Holding Duration"
          value={inputs.holdingPeriodMonths}
          onChange={(val) => updateInput("holdingPeriodMonths", val)}
          unit="months"
          min={1}
          max={600}
          step={1}
          helperText={`Qualifies as ${
            result.gainType === "LTCG"
              ? "Long-Term Capital Gain (LTCG)"
              : result.gainType === "STCG"
              ? "Short-Term Capital Gain (STCG)"
              : "Capital Loss"
          }`}
          error={validationErrors?.holdingPeriodMonths}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { label: "6 Months", val: 6 },
            { label: "1 Year", val: 12 },
            { label: "2 Years", val: 24 },
            { label: "3 Years", val: 36 },
            { label: "5 Years", val: 60 },
            { label: "10 Years", val: 120 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => updateInput("holdingPeriodMonths", preset.val)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                inputs.holdingPeriodMonths === preset.val
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Estate Specific Controls */}
      {inputs.assetType === "real_estate" && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-4">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Budget 2024 Real Estate Grandfathering
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Properties bought before July 23, 2024 can compare 12.5% unindexed vs 20% indexed to pay the lower tax.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800">
            <input
              type="checkbox"
              checked={inputs.acquiredBeforeBudget2024}
              onChange={(e) => updateInput("acquiredBeforeBudget2024", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span>Acquired before July 23, 2024 (Eligible for Grandfathering)</span>
          </label>

          {inputs.acquiredBeforeBudget2024 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Financial Year (CII)
                </label>
                <select
                  value={inputs.purchaseFinancialYear}
                  onChange={(e) => updateInput("purchaseFinancialYear", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {ciiYears.map((yr) => (
                    <option key={yr} value={yr}>
                      FY {yr} (CII: {CII_TABLE[yr]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sale Financial Year (CII)
                </label>
                <select
                  value={inputs.saleFinancialYear}
                  onChange={(e) => updateInput("saleFinancialYear", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {ciiYears.map((yr) => (
                    <option key={yr} value={yr}>
                      FY {yr} (CII: {CII_TABLE[yr]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Expenses */}
      <NumberInput
        id="transferExpenses"
        label="Transfer / Brokerage Expenses"
        value={inputs.transferExpenses || 0}
        onChange={(val) => updateInput("transferExpenses", val)}
        unit="₹"
        min={0}
        max={10000000}
        step={1000}
        helperText="Brokerage, legal fees, or advertising costs directly related to transfer."
      />

      {/* Statutory Exemptions Claimed (Sec 54 / 54EC / 54F) */}
      <NumberInput
        id="exemptionsClaimed"
        label="Deductions Claimed (Sec 54 / 54EC / 54F)"
        value={inputs.exemptionsClaimed || 0}
        onChange={(val) => updateInput("exemptionsClaimed", val)}
        unit="₹"
        min={0}
        max={100000000}
        step={50000}
        helperText="Reinvestment in residential house (Sec 54) or capital gains bonds (Sec 54EC up to ₹50L)."
      />

      {/* Share / Copy Calculation */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Share this calculation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      <ResultCard
        title="Tax Liability Breakdown"
        primaryTitle="Total Tax Payable"
        primaryValue={result.totalTaxLiability}
        primaryFormattedValue={formatINR(result.totalTaxLiability)}
        primarySubtitle={`Effective Tax Rate: ${result.effectiveTaxRatePercent}% (Includes 4% Health & Education Cess)`}
        secondaryMetrics={[
          {
            label: "Gain Category",
            value: result.gainType,
            subtext:
              result.gainType === "LTCG"
                ? `Statutory Rate: ${result.applicableTaxRatePercent}%`
                : result.gainType === "STCG"
                ? `Short-Term Rate: ${result.applicableTaxRatePercent}%`
                : "No tax payable",
          },
          {
            label: "Net Capital Gain",
            value: formatINR(Math.max(0, result.grossGain)),
            subtext: `Sale: ${formatINR(result.netSaleValue)} | Cost: ${formatINR(result.costDeducted)}`,
          },
          {
            label: "Exemptions Applied",
            value: formatINR(result.exemptionSec112A + result.otherExemptions),
            subtext:
              result.exemptionSec112A > 0
                ? `Sec 112A: ${formatINR(result.exemptionSec112A)}`
                : "Sec 54 / 54EC",
          },
          {
            label: "Net Taxable Gain",
            value: formatINR(result.taxableGain),
            subtext: `Base Tax: ${formatINR(result.baseTax)} + Cess: ${formatINR(result.cess)}`,
          },
        ]}
      />

      {/* Real Estate Grandfathering Comparison Box */}
      {result.grandfathering && result.grandfathering.applicable && (
        <div className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-700" />
              <h4 className="text-sm font-bold text-indigo-950">
                Grandfathering Comparison Verdict
              </h4>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Optimal: {result.grandfathering.optimalChoice}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/90 border border-indigo-100">
              <div className="text-xs text-slate-500 font-medium">Option A: 12.5% Unindexed</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {formatINR(result.grandfathering.taxWithoutIndexation)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Gain: {formatINR(result.grandfathering.gainWithoutIndexation)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/90 border border-indigo-100">
              <div className="text-xs text-slate-500 font-medium">Option B: 20% Indexed (CII)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {formatINR(result.grandfathering.taxWithIndexation)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Indexed Cost: {formatINR(result.grandfathering.indexedCost)}
              </div>
            </div>
          </div>

          <p className="text-xs text-indigo-900 font-medium leading-relaxed">
            By choosing <strong>{result.grandfathering.optimalChoice}</strong>, you save{" "}
            <strong>{formatINR(result.grandfathering.taxDifference)}</strong> in taxes.
          </p>
        </div>
      )}

      {/* Statutory Explanation Notes */}
      {result.explanationNotes.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Statutory Assessment Notes
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
            {result.explanationNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const formulaExplanationSlot = (
    <FormulaExplanation
      title="Capital Gains Tax Law & Formulas (Union Budget 2024)"
      formula={capitalGainsTaxEngine.metadata.formula.expression}
      variables={capitalGainsTaxEngine.metadata.formula.variables}
      steps={capitalGainsTaxEngine.metadata.formula.steps}
    />
  );

  const faqSlot = <FAQSection faqs={capitalGainsTaxEngine.metadata.faqs} />;

  const relatedCalculatorsSlot = (
    <RelatedCalculators
      calculators={relatedLinks || defaultRelatedLinks}
      title="Related Tax & Investment Calculators"
    />
  );

  return (
    <CalculatorLayout
      title={capitalGainsTaxEngine.metadata.name}
      description={capitalGainsTaxEngine.metadata.shortDescription}
      badge="Budget 2024 Statutory Rules"
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={formulaExplanationSlot}
      faqSlot={faqSlot}
      relatedCalculatorsSlot={relatedCalculatorsSlot}
    />
  );
};
