"use client";

import React, { useMemo, useState } from "react";
import {
  npsVsEpfEngine,
  calculateNpsVsEpf,
  defaultNpsVsEpfInputs,
  npsVsEpfInputSchema,
  NpsVsEpfInput,
  NpsVsEpfResult,
} from "@/lib/calculators/nps-vs-epf";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { formatINR } from "@/lib/formatters";
import {
  Share2,
  Check,
  TrendingUp,
  Landmark,
  ArrowRightLeft,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export interface NpsVsEpfViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const NpsVsEpfView: React.FC<NpsVsEpfViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState<"milestones" | "all">("milestones");

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Investments & Retirement", href: "/investments" },
      { label: "NPS vs EPF Calculator", href: "/nps-vs-epf-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "EPF Calculator",
        description: "Official EPFO interest crediting with EPS pension caps and VPF.",
        href: "/epf-calculator",
        badge: "Retirement",
      },
      {
        title: "NPS Calculator",
        description: "All Citizen and Corporate Sector models with Tier-1 tax deductions.",
        href: "/nps-calculator",
        badge: "Retirement",
      },
      {
        title: "PPF Calculator",
        description: "Public Provident Fund sovereign 7.1% tax-free compounding.",
        href: "/ppf-calculator",
        badge: "Tax-Free",
      },
      {
        title: "Retirement Corpus Calculator",
        description: "Calculate your comprehensive FIRE retirement target number.",
        href: "/retirement-calculator",
        badge: "Planning",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<NpsVsEpfInput>({
      schema: npsVsEpfInputSchema,
      defaultInputs: defaultNpsVsEpfInputs,
      syncWithUrl: true,
    });

  const result: NpsVsEpfResult = useMemo(() => {
    return calculateNpsVsEpf(inputs);
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
        label: "Total Principal Invested",
        value: result.totalInvested,
        formattedValue: formatINR(result.totalInvested),
        subtext: `${result.tenureYears} yrs contribution`,
      },
      {
        label: "EPF Total Corpus (8.25%)",
        value: result.epfTotalCorpus,
        formattedValue: formatINR(result.epfTotalCorpus),
        subtext: "100% Tax-Free Lump Sum",
      },
      {
        label: "NPS Extra Wealth Gap",
        value: result.corpusDifference,
        formattedValue: `+${formatINR(result.corpusDifference)}`,
        subtext: `+${result.corpusOutperformancePercent}% growth alpha`,
      },
      {
        label: "NPS Monthly Pension",
        value: result.npsMonthlyPension,
        formattedValue: `${formatINR(result.npsMonthlyPension)} / mo`,
        subtext: "From 40% mandatory annuity",
      },
      {
        label: "Career 80CCD(1B) Tax Saved",
        value: result.additionalTaxSavings80CCD,
        formattedValue: formatINR(result.additionalTaxSavings80CCD),
        subtext: "Extra ₹50k/yr deduction",
      },
    ],
    [result]
  );

  const displayedSchedule = useMemo(() => {
    if (scheduleFilter === "all") return result.schedule;
    return result.schedule.filter(
      (item) => item.year === 1 || item.year % 5 === 0 || item.year === result.tenureYears
    );
  }, [result.schedule, scheduleFilter, result.tenureYears]);

  const inputsSlot = (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
          Retirement Contribution Parameters
        </h2>
        <button
          onClick={resetInputs}
          className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>

      <NumberInput
        label="Monthly Contribution (₹)"
        value={inputs.monthlyContribution}
        onChange={(v) => updateInput("monthlyContribution", v)}
        min={500}
        max={500000}
        step={500}
        error={validationErrors.monthlyContribution}
        unit="₹"
        helperText="Equal monthly investment applied to both EPF and NPS for a fair comparison."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Current Age (Years)"
          value={inputs.currentAge}
          onChange={(v) => updateInput("currentAge", v)}
          min={18}
          max={65}
          step={1}
          error={validationErrors.currentAge}
          unit="yrs"
        />
        <NumberInput
          label="Retirement Age (Years)"
          value={inputs.retirementAge}
          onChange={(v) => updateInput("retirementAge", v)}
          min={45}
          max={75}
          step={1}
          error={validationErrors.retirementAge}
          unit="yrs"
          helperText={`Investment horizon: ${result.tenureYears} years`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="EPF Interest Rate (% p.a.)"
          value={inputs.epfInterestRate}
          onChange={(v) => updateInput("epfInterestRate", v)}
          min={4}
          max={15}
          step={0.05}
          error={validationErrors.epfInterestRate}
          unit="%"
          helperText="Current EPFO statutory rate for FY 23-24 & 24-25 is 8.25%."
        />
        <NumberInput
          label="NPS Expected Return (CAGR %)"
          value={inputs.npsExpectedReturn}
          onChange={(v) => updateInput("npsExpectedReturn", v)}
          min={5}
          max={20}
          step={0.25}
          error={validationErrors.npsExpectedReturn}
          unit="%"
          helperText="Historical multi-asset CAGR with equity allocation averages 10%–12%."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="NPS Annuity Allocation (%)"
          value={inputs.npsAnnuityPercent}
          onChange={(v) => updateInput("npsAnnuityPercent", v)}
          min={40}
          max={100}
          step={5}
          error={validationErrors.npsAnnuityPercent}
          unit="%"
          helperText="PFRDA mandates min 40% annuity. Remaining (60%) is tax-free lump sum."
        />
        <NumberInput
          label="Expected Annuity Yield (% p.a.)"
          value={inputs.expectedAnnuityRate}
          onChange={(v) => updateInput("expectedAnnuityRate", v)}
          min={3}
          max={12}
          step={0.25}
          error={validationErrors.expectedAnnuityRate}
          unit="%"
          helperText="Annual rate paid out by annuity provider as monthly pension."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Your Income Tax Bracket
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: "30%", val: 30 },
            { label: "20%", val: 20 },
            { label: "15%", val: 15 },
            { label: "10%", val: 10 },
            { label: "5%", val: 5 },
            { label: "0%", val: 0 },
          ].map((bracket) => (
            <button
              key={bracket.val}
              type="button"
              onClick={() => updateInput("taxBracketPercent", bracket.val)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                inputs.taxBracketPercent === bracket.val
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {bracket.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          Used to calculate additional career tax savings from Section 80CCD(1B) (₹50,000/yr).
        </p>
      </div>

      {shareableUrl && (
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Copied Shareable URL!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              Share NPS vs EPF Comparison
            </>
          )}
        </button>
      )}
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      <ResultCard
        primaryTitle="NPS Total Retirement Corpus"
        primaryValue={result.npsTotalCorpus}
        primaryFormattedValue={formatINR(result.npsTotalCorpus)}
        primarySubtitle={`NPS yields +${result.corpusOutperformancePercent}% more than EPF (${formatINR(result.epfTotalCorpus)})`}
        secondaryMetrics={metrics}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* EPF Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Landmark className="w-4 h-4 text-emerald-600" />
              EPF (Provident Fund)
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Guaranteed
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Total Accumulated Corpus</div>
            <div className="text-xl font-extrabold text-slate-900">
              {formatINR(result.epfTotalCorpus)}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Interest Earned:</span>
              <span className="font-semibold text-slate-800">{formatINR(result.epfInterestEarned)}</span>
            </div>
            <div className="flex justify-between">
              <span>100% Tax-Free Lump Sum:</span>
              <span className="font-bold text-emerald-600">{formatINR(result.epfLumpSum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mandatory Annuity:</span>
              <span className="font-semibold text-slate-500">None (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Status:</span>
              <span className="font-bold text-emerald-600">EEE (100% Exempt)</span>
            </div>
          </div>
        </div>

        {/* NPS Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              NPS (Tier-1 Pension)
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Market CAGR
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Total Accumulated Corpus</div>
            <div className="text-xl font-extrabold text-slate-900">
              {formatINR(result.npsTotalCorpus)}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Market Gains Earned:</span>
              <span className="font-semibold text-slate-800">{formatINR(result.npsGainsEarned)}</span>
            </div>
            <div className="flex justify-between">
              <span>{result.npsTaxFreeLumpSumPercent}% Tax-Free Lump Sum:</span>
              <span className="font-bold text-indigo-600">{formatINR(result.npsLumpSum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Pension:</span>
              <span className="font-bold text-emerald-600">{formatINR(result.npsMonthlyPension)} / mo</span>
            </div>
            <div className="flex justify-between">
              <span>Extra 80CCD(1B) Tax Saved:</span>
              <span className="font-bold text-indigo-600">{formatINR(result.additionalTaxSavings80CCD)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-8">
      {/* Trajectory Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Retirement Wealth Accumulation Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare year-by-year compounding balance between EPF and NPS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScheduleFilter("milestones")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                scheduleFilter === "milestones"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              5-Year Milestones
            </button>
            <button
              onClick={() => setScheduleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                scheduleFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All {result.tenureYears} Years
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3">Total Invested</th>
                <th className="py-2.5 px-3 text-emerald-600">EPF Balance (8.25%)</th>
                <th className="py-2.5 px-3 text-indigo-600">NPS Balance ({inputs.npsExpectedReturn}%)</th>
                <th className="py-2.5 px-3 text-right">Wealth Gap (NPS - EPF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs text-slate-700">
              {displayedSchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Yr {row.year}</td>
                  <td className="py-2.5 px-3">{row.age} yrs</td>
                  <td className="py-2.5 px-3">{formatINR(row.totalInvested)}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600">
                    {formatINR(row.epfBalance)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-600">
                    {formatINR(row.npsBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    +{formatINR(row.gapAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          Feature & Regulatory Comparison Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3 text-emerald-600">EPF (Employees&apos; Provident Fund)</th>
                <th className="py-2.5 px-3 text-indigo-600">NPS (National Pension System)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Regulator & Scheme Nature</td>
                <td className="py-2.5 px-3">EPFO (Statutory, sovereign guaranteed)</td>
                <td className="py-2.5 px-3">PFRDA (Market-linked defined contribution)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Asset Class Exposure</td>
                <td className="py-2.5 px-3">Predominantly Government debt, limited ETF equity</td>
                <td className="py-2.5 px-3">Active choice: Equity (&apos;E&apos; up to 75%), Corp Debt (&apos;C&apos;), Govt Bonds (&apos;G&apos;)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Tax Deduction at Entry</td>
                <td className="py-2.5 px-3">Section 80C (shared within ₹1.5 Lakh limit)</td>
                <td className="py-2.5 px-3">Section 80CCD(1) + Exclusive Section 80CCD(1B) up to ₹50,000</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Maturity Withdrawal Liquidity</td>
                <td className="py-2.5 px-3 font-bold text-emerald-600">100% Lump sum withdrawal permitted</td>
                <td className="py-2.5 px-3 font-bold text-indigo-600">Max 60% lump sum; Min 40% mandatory annuity</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Tax on Maturity Lump Sum</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600">100% Tax-Free (EEE)</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-600">60% Lump Sum is 100% Tax-Free under Sec 10(12A)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Monthly Pension Payout</td>
                <td className="py-2.5 px-3">None from EPF corpus (separate EPS formula)</td>
                <td className="py-2.5 px-3">Lifelong monthly annuity pension (taxable as slab income)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={npsVsEpfEngine.metadata.name}
      badge={npsVsEpfEngine.metadata.badge}
      description={npsVsEpfEngine.metadata.shortDescription}
      directAnswer={npsVsEpfEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        npsVsEpfEngine.metadata.formula ? (
          <FormulaExplanation
            formula={npsVsEpfEngine.metadata.formula.expression}
            variables={npsVsEpfEngine.metadata.formula.variables}
            steps={npsVsEpfEngine.metadata.formula.steps}
            notes={npsVsEpfEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={npsVsEpfEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators links={relatedLinks || defaultRelatedLinks} />
      }
    />
  );
};
