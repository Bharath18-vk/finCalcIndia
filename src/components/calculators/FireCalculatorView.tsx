"use client";

import React, { useMemo, useState } from "react";
import {
  fireEngine,
  FireInput,
  defaultFireInputs,
  FireScheduleItem,
} from "@/lib/calculators/fire";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import { GrowthAreaChart } from "@/components/ui/GrowthChart";
import {
  Flame,
  Share2,
  Check,
  Target,
  Sparkles,
  TrendingUp,
  Table,
  Coffee,
  Shield,
  Compass,
} from "lucide-react";

interface FireCalculatorViewProps {
  initialInputs?: Partial<FireInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

export const FireCalculatorView: React.FC<FireCalculatorViewProps> = ({
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
  } = useCalculatorUrlState<FireInput>({
    schema: fireEngine.schema,
    defaultInputs: { ...defaultFireInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return fireEngine.calculate(inputs);
  }, [inputs]);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const growthChartData = useMemo(() => {
    return result.schedule.map((s) => ({
      age: `Age ${s.age}`,
      portfolio: s.portfolioBalance,
      target: s.fireTargetCorpusAtAge,
    }));
  }, [result.schedule]);

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
      { label: "FIRE Calculator", href: "/fire-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "Step-Up SIP Calculator",
        href: "/step-up-sip-calculator",
        description: "Simulate compounding growth by increasing your mutual fund SIP annually.",
        category: "Investments",
      },
      {
        title: "Step-Up SWP Calculator",
        href: "/step-up-swp-calculator",
        description: "Model inflation-adjusted monthly pension withdrawals and corpus longevity.",
        category: "Retirement",
      },
      {
        title: "NPS vs EPF Calculator",
        href: "/nps-vs-epf-calculator",
        description: "Compare sovereign retirement schemes, returns, and tax benefits.",
        category: "Retirement",
      },
    ],
    []
  );

  const inputsSlot = (
    <div className="space-y-6">
      {/* Ages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          id="currentAge"
          label="Current Age"
          value={inputs.currentAge}
          onChange={(val) => updateInput("currentAge", val)}
          unit="years"
          min={18}
          max={75}
          step={1}
          error={validationErrors?.currentAge}
        />
        <NumberInput
          id="targetRetirementAge"
          label="Target Early Retirement Age"
          value={inputs.targetRetirementAge}
          onChange={(val) => updateInput("targetRetirementAge", val)}
          unit="years"
          min={25}
          max={85}
          step={1}
          helperText={`${inputs.targetRetirementAge - inputs.currentAge} years of accumulation`}
          error={validationErrors?.targetRetirementAge}
        />
      </div>

      {/* Monthly Expenses */}
      <NumberInput
        id="monthlyExpenses"
        label="Current Monthly Living Expenses"
        value={inputs.monthlyExpenses}
        onChange={(val) => updateInput("monthlyExpenses", val)}
        unit="₹"
        min={10000}
        max={2000000}
        step={5000}
        helperText="Current monthly household expenditure (excluding loan EMIs)."
        error={validationErrors?.monthlyExpenses}
      />

      {/* Current Net Worth */}
      <NumberInput
        id="currentNetWorth"
        label="Current Invested Net Worth (Equity/Debt/Gold)"
        value={inputs.currentNetWorth}
        onChange={(val) => updateInput("currentNetWorth", val)}
        unit="₹"
        min={0}
        max={100000000}
        step={50000}
        helperText="Current value of all liquid investments earmarked for retirement."
        error={validationErrors?.currentNetWorth}
      />

      {/* Monthly Investment */}
      <NumberInput
        id="monthlyInvestment"
        label="Monthly Investment (SIP)"
        value={inputs.monthlyInvestment}
        onChange={(val) => updateInput("monthlyInvestment", val)}
        unit="₹"
        min={0}
        max={2000000}
        step={5000}
        helperText="Amount invested each month towards your early retirement corpus."
        error={validationErrors?.monthlyInvestment}
      />

      {/* Step-Up % */}
      <div>
        <NumberInput
          id="annualInvestmentStepUpPercent"
          label="Annual SIP Step-Up (%)"
          value={inputs.annualInvestmentStepUpPercent ?? 5}
          onChange={(val) => updateInput("annualInvestmentStepUpPercent", val)}
          unit="%"
          min={0}
          max={25}
          step={1}
          helperText="Increasing your savings each year accelerates your FIRE milestone."
        />
        <div className="flex gap-2 mt-2">
          {[0, 5, 10, 15].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => updateInput("annualInvestmentStepUpPercent", pct)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                (inputs.annualInvestmentStepUpPercent ?? 5) === pct
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {pct}% Step-Up
            </button>
          ))}
        </div>
      </div>

      {/* Assumptions: Inflation & SWR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <NumberInput
          id="inflationRate"
          label="Expected Inflation (p.a.)"
          value={inputs.inflationRate ?? 6.0}
          onChange={(val) => updateInput("inflationRate", val)}
          unit="%"
          min={3}
          max={12}
          step={0.5}
          helperText="Indian long-term CPI benchmark is 6.0%."
        />
        <NumberInput
          id="swrPercent"
          label="Safe Withdrawal Rate (SWR)"
          value={inputs.swrPercent ?? 3.5}
          onChange={(val) => updateInput("swrPercent", val)}
          unit="%"
          min={2.5}
          max={5.0}
          step={0.25}
          helperText="3.5% recommended for 40+ year Indian retirements."
        />
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
        title="FIRE Financial Independence Milestone"
        primaryTitle="Target FIRE Corpus Required"
        primaryValue={result.targetFireCorpus}
        primaryFormattedValue={formatINR(result.targetFireCorpus)}
        primarySubtitle={`Projected Net Worth at Age ${inputs.targetRetirementAge}: ${formatINR(
          result.projectedNetWorthAtRetirement
        )}`}
        secondaryMetrics={[
          {
            label: "FIRE Status",
            value: result.isFireAchievableByTargetAge
              ? `Achieved by Age ${result.projectedFireAge}`
              : `Deficit of ${formatINR(Math.abs(result.fireSurplusOrDeficit))}`,
            subtext: result.isFireAchievableByTargetAge ? "On track!" : "Action needed",
          },
          {
            label: "Future Monthly Expenses",
            value: formatINR(result.futureMonthlyExpensesAtRetirement),
            subtext: `At retirement age ${inputs.targetRetirementAge} (${inputs.inflationRate}% inflation)`,
          },
          {
            label: "Safe Withdrawal Rate",
            value: `${result.swrPercent}% p.a.`,
            subtext: `Corpus multiplier: ${(100 / result.swrPercent).toFixed(1)}x expenses`,
          },
          {
            label: "Retirement Longevity",
            value: `${result.portfolioLongevityYears}+ Years`,
            subtext: `Post-retirement real return: ${result.realReturnPostRetirement}%`,
          },
        ]}
      />

      {/* Advice Card */}
      <div
        className={`p-4 rounded-xl border ${
          result.isFireAchievableByTargetAge
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
            : "border-amber-200 bg-amber-50/70 text-amber-950"
        }`}
      >
        <p className="text-xs leading-relaxed font-medium">{result.recommendationText}</p>
      </div>

      {/* FIRE Tiers Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          FIRE Variations & Lifestyle Tiers
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Lean FIRE (75%)
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatINR(result.tiers.leanFireCorpus)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Frugal, bare-necessities retirement</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Fat FIRE (135%)
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatINR(result.tiers.fatFireCorpus)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Abundant lifestyle, travel & cushion</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              Coast FIRE Today
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatINR(result.tiers.coastFireToday)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Corpus needed today to coast without saving</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              Barista FIRE (50%)
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {formatINR(result.tiers.baristaFireCorpus)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Semi-retirement with part-time work</p>
          </div>
        </div>
      </div>

      {/* Compounding Visualizer Chart */}
      <GrowthAreaChart
        title="Net Worth Compounding vs FIRE Target Trajectory"
        subtitle={`Visualizing wealth accumulation from Age ${inputs.currentAge} to target early retirement`}
        data={growthChartData}
        xAxisKey="age"
        series={[
          { key: "portfolio", label: "Projected Net Worth", color: "#10b981", fillColor: "#10b981" },
          { key: "target", label: "Required FIRE Target", color: "#6366f1", fillColor: "#6366f1" },
        ]}
      />

      {/* Yearly Accumulation Schedule Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-600" />
            FIRE Accumulation Roadmap
          </h4>
          <button
            type="button"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {showFullSchedule ? "Show Less" : "View Full Roadmap"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2 pr-2">Age</th>
                <th className="py-2 px-2 text-right">Portfolio Balance</th>
                <th className="py-2 px-2 text-right">FIRE Target</th>
                <th className="py-2 pl-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(showFullSchedule ? result.schedule : result.schedule.slice(0, 8)).map((row) => (
                <tr key={row.age} className={row.age === inputs.targetRetirementAge ? "bg-emerald-50/60 font-semibold" : ""}>
                  <td className="py-2 pr-2 font-medium text-slate-900">
                    Age {row.age} {row.age === inputs.targetRetirementAge ? "🎯" : ""}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-800">
                    {formatINR(row.portfolioBalance)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {formatINR(row.fireTargetCorpusAtAge)}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    {row.isFireAchieved ? (
                      <span className="text-emerald-600 font-bold">FIRE Achieved</span>
                    ) : (
                      <span className="text-slate-400">Accumulating</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const formulaExplanationSlot = (
    <FormulaExplanation
      title="FIRE Number & Safe Withdrawal Rate Formulas"
      formula={fireEngine.metadata.formula.expression}
      variables={fireEngine.metadata.formula.variables}
      steps={fireEngine.metadata.formula.steps}
    />
  );

  const faqSlot = <FAQSection faqs={fireEngine.metadata.faqs} />;

  const relatedCalculatorsSlot = (
    <RelatedCalculators
      calculators={relatedLinks || defaultRelatedLinks}
      title="Related Retirement & Investment Calculators"
    />
  );

  return (
    <CalculatorLayout
      title={fireEngine.metadata.name}
      description={fireEngine.metadata.shortDescription}
      badge="Financial Independence"
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={formulaExplanationSlot}
      faqSlot={faqSlot}
      relatedCalculatorsSlot={relatedCalculatorsSlot}
    />
  );
};
