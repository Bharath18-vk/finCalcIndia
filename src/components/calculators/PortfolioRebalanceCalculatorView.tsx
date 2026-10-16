"use client";

import React, { useMemo, useState } from "react";
import {
  portfolioRebalanceEngine,
  PortfolioRebalanceInput,
  defaultPortfolioRebalanceInputs,
  RebalanceAssetRow,
  RebalanceStrategy,
} from "@/lib/calculators/portfolio-rebalance";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { ComparisonBarChart } from "@/components/ui/ComparisonBarChart";
import { formatINR } from "@/lib/formatters";
import {
  PieChart,
  Share2,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Table,
  Zap,
} from "lucide-react";

interface PortfolioRebalanceCalculatorViewProps {
  initialInputs?: Partial<PortfolioRebalanceInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

export const PortfolioRebalanceCalculatorView: React.FC<PortfolioRebalanceCalculatorViewProps> = ({
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
  } = useCalculatorUrlState<PortfolioRebalanceInput>({
    schema: portfolioRebalanceEngine.schema,
    defaultInputs: { ...defaultPortfolioRebalanceInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return portfolioRebalanceEngine.calculate(inputs);
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
      { label: "Investments", href: "/investments" },
      { label: "Portfolio Rebalancing", href: "/portfolio-rebalance-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "Capital Gains Tax Calculator",
        href: "/capital-gains-tax-calculator",
        description: "Calculate tax liabilities before selling equity or mutual funds.",
        category: "Tax",
      },
      {
        title: "Step-Up SIP Calculator",
        href: "/step-up-sip-calculator",
        description: "Calculate wealth compounding by stepping up monthly investments.",
        category: "Investments",
      },
      {
        title: "FIRE Calculator",
        href: "/fire-calculator",
        description: "Track your financial independence corpus and retirement milestone.",
        category: "Retirement",
      },
    ],
    []
  );

  const targetSum =
    inputs.equityTargetPercent +
    inputs.debtTargetPercent +
    inputs.goldTargetPercent +
    inputs.cashTargetPercent;

  const isTargetSumValid = Math.abs(targetSum - 100) < 0.01;

  const inputsSlot = (
    <div className="space-y-6">
      {/* Strategy Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Rebalancing Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: "cash_flow_first" as const,
              title: "Tax-Smart (Cash Flow First)",
              badge: "Zero Tax Friction",
              desc: "Deploys fresh capital into underweight assets without selling.",
            },
            {
              id: "full_rebalance" as const,
              title: "Full Rebalance (Buy & Sell)",
              badge: "Exact Target",
              desc: "Trims overweight assets and buys underweight to reach exact %.",
            },
          ].map((strat) => (
            <button
              key={strat.id}
              type="button"
              onClick={() => updateInput("strategy", strat.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                inputs.strategy === strat.id
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{strat.title}</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  {strat.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{strat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fresh Capital Input */}
      <NumberInput
        id="freshCapital"
        label="Fresh Capital Available to Invest (Monthly or Lump Sum)"
        value={inputs.freshCapital || 0}
        onChange={(val) => updateInput("freshCapital", val)}
        unit="₹"
        min={0}
        max={100000000}
        step={10000}
        presets={[
          { label: "₹0", value: 0 },
          { label: "₹50,000", value: 50000 },
          { label: "₹1 Lakh", value: 100000 },
          { label: "₹5 Lakh", value: 500000 },
        ]}
        helperText="New cash you can direct towards underweight asset classes."
      />

      {/* Target Sum Warning */}
      {!isTargetSumValid && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Target percentages must total exactly 100% (Current sum: {targetSum}%).
          </span>
        </div>
      )}

      {/* Asset 1: Equity */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          1. Equity (Mutual Funds & Stocks)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            id="equityCurrent"
            label="Current Holding"
            value={inputs.equityCurrent}
            onChange={(val) => updateInput("equityCurrent", val)}
            unit="₹"
            min={0}
            max={100000000}
            step={25000}
          />
          <NumberInput
            id="equityTargetPercent"
            label="Target Allocation"
            value={inputs.equityTargetPercent}
            onChange={(val) => updateInput("equityTargetPercent", val)}
            unit="%"
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Asset 2: Debt */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          2. Debt (FDs, Debt MFs, EPF/PPF)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            id="debtCurrent"
            label="Current Holding"
            value={inputs.debtCurrent}
            onChange={(val) => updateInput("debtCurrent", val)}
            unit="₹"
            min={0}
            max={100000000}
            step={25000}
          />
          <NumberInput
            id="debtTargetPercent"
            label="Target Allocation"
            value={inputs.debtTargetPercent}
            onChange={(val) => updateInput("debtTargetPercent", val)}
            unit="%"
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Asset 3: Gold */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          3. Gold (SGB, Gold ETFs, Physical)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            id="goldCurrent"
            label="Current Holding"
            value={inputs.goldCurrent}
            onChange={(val) => updateInput("goldCurrent", val)}
            unit="₹"
            min={0}
            max={100000000}
            step={10000}
          />
          <NumberInput
            id="goldTargetPercent"
            label="Target Allocation"
            value={inputs.goldTargetPercent}
            onChange={(val) => updateInput("goldTargetPercent", val)}
            unit="%"
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Asset 4: Cash */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          4. Cash & Liquid Reserves
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            id="cashCurrent"
            label="Current Holding"
            value={inputs.cashCurrent}
            onChange={(val) => updateInput("cashCurrent", val)}
            unit="₹"
            min={0}
            max={100000000}
            step={10000}
          />
          <NumberInput
            id="cashTargetPercent"
            label="Target Allocation"
            value={inputs.cashTargetPercent}
            onChange={(val) => updateInput("cashTargetPercent", val)}
            unit="%"
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Share / Copy */}
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
        title="Allocation Health & Drift Status"
        primaryTitle="Maximum Asset Drift"
        primaryValue={result.maxDriftPercent}
        primaryFormattedValue={`${result.maxDriftPercent}%`}
        primarySubtitle={
          result.isRebalanceRecommended
            ? `Rebalancing Recommended (Exceeds ${inputs.driftTolerancePercent || 5}% tolerance)`
            : "Portfolio within safe tolerance limits (Balanced)"
        }
        secondaryMetrics={[
          {
            label: "Current Portfolio Value",
            value: formatINR(result.totalCurrentPortfolio),
            subtext: "Across 4 asset classes",
          },
          {
            label: "Total Fresh Capital Deployed",
            value: formatINR(result.totalToBuy),
            subtext: `Target: ${formatINR(result.totalPostPortfolio)}`,
          },
          {
            label: "Holdings to Sell",
            value: formatINR(result.totalToSell),
            subtext:
              inputs.strategy === "cash_flow_first"
                ? "₹0 (Zero tax friction)"
                : "Trimming overweight assets",
          },
          {
            label: "Rebalance Strategy",
            value:
              inputs.strategy === "cash_flow_first"
                ? "Tax-Smart Cash Flow"
                : "Full Rebalance",
            subtext: "Selected mode",
          },
        ]}
      />

      {/* Tax Efficiency Advice Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          inputs.strategy === "cash_flow_first"
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
            : "border-amber-200 bg-amber-50/70 text-amber-950"
        }`}
      >
        <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed font-medium">{result.taxEfficiencyAdvice}</p>
      </div>

      {/* Allocation Drift Bar Chart */}
      <ComparisonBarChart
        title="Current vs. Target Asset Allocation"
        subtitle="Visualizing actual portfolio weights against your desired targets"
        data={result.assets.map((asset) => ({
          category: asset.name,
          current: asset.currentPercent,
          target: asset.targetPercent,
        }))}
        bars={[
          { key: "current", label: "Current %", color: "#64748b" },
          { key: "target", label: "Target %", color: "#10b981" },
        ]}
        xAxisKey="category"
        isCurrency={false}
        yAxisFormatter={(v) => `${v}%`}
      />

      {/* Asset Class Breakdown Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Table className="w-4 h-4 text-emerald-600" />
          Asset Class Allocation & Action Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2 pr-2">Asset Class</th>
                <th className="py-2 px-2 text-right">Current</th>
                <th className="py-2 px-2 text-right">Target</th>
                <th className="py-2 px-2 text-right">Drift</th>
                <th className="py-2 pl-2 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.assets.map((row) => (
                <tr key={row.id}>
                  <td className="py-2.5 pr-2 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-2.5 px-2 text-right text-slate-800">
                    <div>{formatINR(row.currentAmount)}</div>
                    <div className="text-[11px] text-slate-500">{row.currentPercent}%</div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                    {row.targetPercent}%
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold">
                    <span
                      className={
                        row.driftStatus === "overweight"
                          ? "text-rose-600"
                          : row.driftStatus === "underweight"
                          ? "text-blue-600"
                          : "text-emerald-600"
                      }
                    >
                      {row.driftPercent > 0 ? `+${row.driftPercent}%` : `${row.driftPercent}%`}
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    {row.action === "BUY" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-emerald-800 bg-emerald-100 text-[11px]">
                        BUY {formatINR(row.transactAmount)}
                      </span>
                    ) : row.action === "SELL" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-rose-800 bg-rose-100 text-[11px]">
                        SELL {formatINR(row.transactAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">HOLD</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Plan */}
      {result.actionPlan.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Execution Action Steps
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {result.actionPlan.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const formulaExplanationSlot = (
    <FormulaExplanation
      title="Asset Allocation Drift & Rebalancing Formulas"
      formula={portfolioRebalanceEngine.metadata.formula.expression}
      variables={portfolioRebalanceEngine.metadata.formula.variables}
      steps={portfolioRebalanceEngine.metadata.formula.steps}
    />
  );

  const faqSlot = <FAQSection faqs={portfolioRebalanceEngine.metadata.faqs} />;

  const relatedCalculatorsSlot = (
    <RelatedCalculators
      calculators={relatedLinks || defaultRelatedLinks}
      title="Related Investment & Portfolio Calculators"
    />
  );

  return (
    <CalculatorLayout
      title={portfolioRebalanceEngine.metadata.name}
      description={portfolioRebalanceEngine.metadata.shortDescription}
      badge="Tax-Smart Asset Allocation"
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={formulaExplanationSlot}
      faqSlot={faqSlot}
      relatedCalculatorsSlot={relatedCalculatorsSlot}
    />
  );
};
