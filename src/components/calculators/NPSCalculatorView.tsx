"use client";

import React, { useState, useMemo } from "react";
import {
  calculateNPS,
  NPS_MODEL_CONFIGS,
  NPSModel,
  NPSExitType,
} from "@/lib/calculators/nps";
import { formatINR, formatPercentage } from "@/lib/formatters";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection, FAQItem } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

export interface NPSCalculatorViewProps {
  title: string;
  badge?: string;
  description: string;
  initialMonthlyContribution: number;
  initialCurrentAge?: number;
  initialRetirementAge?: number;
  initialReturnRate?: number;
  initialModel?: NPSModel;
  asOfDate?: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FAQItem[];
  relatedLinks: RelatedLink[];
}

export const NPSCalculatorView: React.FC<NPSCalculatorViewProps> = ({
  title,
  badge = "PFRDA NPS Regulatory Models",
  description,
  initialMonthlyContribution,
  initialCurrentAge = 30,
  initialRetirementAge = 60,
  initialReturnRate = 10.0,
  initialModel = "all_citizen",
  asOfDate = "PFRDA Exit Regulations",
  breadcrumbs,
  faqs,
  relatedLinks,
}) => {
  const [npsModel, setNpsModel] = useState<NPSModel>(initialModel);
  const [monthlyContribution, setMonthlyContribution] = useState(initialMonthlyContribution);
  const [currentAge, setCurrentAge] = useState(initialCurrentAge);
  const [retirementAge, setRetirementAge] = useState(initialRetirementAge);
  const [exitType, setExitType] = useState<NPSExitType>("normal");
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState(initialReturnRate);
  const [annuityPercentage, setAnnuityPercentage] = useState(40);
  const [expectedAnnuityRate, setExpectedAnnuityRate] = useState(6.0);

  const selectedModelConfig = NPS_MODEL_CONFIGS[npsModel];

  const result = useMemo(() => {
    return calculateNPS({
      monthlyContribution,
      currentAge,
      retirementAge,
      npsModel,
      exitType,
      expectedAnnualReturn,
      annuityPercentage,
      expectedAnnuityRate,
    });
  }, [
    monthlyContribution,
    currentAge,
    retirementAge,
    npsModel,
    exitType,
    expectedAnnualReturn,
    annuityPercentage,
    expectedAnnuityRate,
  ]);

  const handleMonthlyChange = (val: number) => {
    setMonthlyContribution(val);
    trackCalculatorUsed("nps", "monthlyContribution");
    trackCalculatorResultGenerated("nps");
  };

  const handleModelChange = (model: NPSModel) => {
    setNpsModel(model);
    const config = NPS_MODEL_CONFIGS[model];
    if (exitType === "normal") {
      setRetirementAge(config.defaultSuperannuationAge);
    }
    trackCalculatorUsed("nps", "modelChange");
  };

  const exitDescription =
    exitType === "death"
      ? "Death Exit: 100% of accumulated corpus is paid to nominee/legal heirs as tax-free lump sum under Section 10(12A)."
      : exitType === "normal"
      ? `${selectedModelConfig.normalExitRule.description}`
      : `${selectedModelConfig.prematureExitRule.description}`;

  const directAnswer = `Contributing ${formatINR(
    monthlyContribution
  )} per month under the NPS ${selectedModelConfig.label} from age ${currentAge} to ${retirementAge} (${
    result.investmentYears
  } years) at an illustrative annual return assumption of ${formatPercentage(
    expectedAnnualReturn
  )}% is projected to build a total retirement corpus of ${formatINR(
    result.totalCorpusAtRetirement
  )}. Under ${exitType === "normal" ? "Normal Superannuation" : exitType === "premature" ? "Premature Exit" : "Death Exit"} rules, purchasing a ${result.annuityPercentage}% annuity yields an estimated monthly pension of ${formatINR(
    result.expectedMonthlyPension
  )} (taxable as income), alongside a tax-free lump sum payout of ${formatINR(result.lumpSumAmount)} (exempt under Section 10(12A)).`;

  return (
    <CalculatorLayout
      title={title}
      badge={badge}
      description={description}
      directAnswer={directAnswer}
      breadcrumbs={breadcrumbs}
      asOfDate={asOfDate}
      inputsSlot={
        <div className="space-y-6">
          {/* NPS Model Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select NPS Model
              </label>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                PFRDA Architecture
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModelChange("all_citizen")}
                className={`py-2.5 px-3 text-left rounded-lg border transition-all ${
                  npsModel === "all_citizen"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-bold">All Citizen Model</div>
                <div className="text-[11px] opacity-80 mt-0.5">Individual / All Indian Citizens (18–70)</div>
              </button>
              <button
                type="button"
                onClick={() => handleModelChange("corporate")}
                className={`py-2.5 px-3 text-left rounded-lg border transition-all ${
                  npsModel === "corporate"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-bold">Corporate Sector Model</div>
                <div className="text-[11px] opacity-80 mt-0.5">Employer-Employee Group (Sec 80CCD(2))</div>
              </button>
            </div>
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">
                Active Model: {selectedModelConfig.label}
              </div>
              <p>{selectedModelConfig.subTitle}</p>
              <div className="text-blue-700 font-medium">
                Tax Deductions: {selectedModelConfig.applicableTaxSections.join(" • ")}
              </div>
            </div>
          </div>

          {/* Return Assumption Banner */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>NPS Return Assumption: {expectedAnnualReturn}% p.a.</span>
              <span className="text-[11px] bg-blue-200/80 px-2 py-0.5 rounded text-blue-900 font-semibold">
                Illustrative Assumption
              </span>
            </div>
            <p className="text-blue-800 text-[11px]">
              NPS investments are market-linked across Asset Classes E (Equity), C (Corporate Debt), and G (Govt Securities). Returns are non-guaranteed and subject to market volatility.
            </p>
          </div>

          <CurrencyInput
            label="Monthly NPS Tier-1 Contribution"
            value={monthlyContribution}
            onChange={handleMonthlyChange}
            min={500}
            max={500000}
            step={500}
            presets={[
              { label: "₹3,000", value: 3000 },
              { label: "₹5,000", value: 5000 },
              { label: "₹10,000", value: 10000 },
              { label: "₹25,000", value: 25000 },
            ]}
            helperText="Section 80CCD(1B) provides exclusive tax deduction up to ₹50,000 per financial year."
          />

          {/* Exit Type Scenario Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Exit Scenario ({selectedModelConfig.label})
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setExitType("normal");
                  setRetirementAge(selectedModelConfig.defaultSuperannuationAge);
                  setAnnuityPercentage(40);
                }}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg border transition-all ${
                  exitType === "normal"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Normal Exit
                <span className="block text-[10px] font-normal opacity-80">
                  Age {selectedModelConfig.defaultSuperannuationAge}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitType("premature");
                  setRetirementAge(Math.min(selectedModelConfig.defaultSuperannuationAge - 1, currentAge + 5));
                  setAnnuityPercentage(80);
                }}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg border transition-all ${
                  exitType === "premature"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Premature Exit
                <span className="block text-[10px] font-normal opacity-80">
                  Before Superannuation
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitType("death");
                  setAnnuityPercentage(0);
                }}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg border transition-all ${
                  exitType === "death"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                Death Exit
                <span className="block text-[10px] font-normal opacity-80">
                  Nominee Payout
                </span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 bg-amber-50/70 p-2 rounded border border-amber-200/80">
              {exitDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Age (Years)
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.min(65, Math.max(18, Number(e.target.value))))}
                min={18}
                max={65}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Exit / Retirement Age
              </label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Math.min(75, Math.max(currentAge + 1, Number(e.target.value))))}
                min={currentAge + 1}
                max={75}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <PercentageInput
            label="Illustrative Annual Return Assumption (% p.a.)"
            value={expectedAnnualReturn}
            onChange={setExpectedAnnualReturn}
            min={4.0}
            max={18.0}
            step={0.5}
            presets={[
              { label: "8% (Conservative)", value: 8 },
              { label: "10% (Moderate)", value: 10 },
              { label: "12% (Aggressive)", value: 12 },
            ]}
            helperText="10% is a representative multi-year assumption for active/moderate lifecycle asset mix."
          />

          {exitType !== "death" && (
            <PercentageInput
              label={`Annuity Purchase Percentage (Min ${result.minMandatoryAnnuityPercentage}%)`}
              value={annuityPercentage}
              onChange={(val) => setAnnuityPercentage(Math.max(result.minMandatoryAnnuityPercentage, val))}
              min={result.minMandatoryAnnuityPercentage}
              max={100}
              step={5}
              presets={[
                {
                  label: `${result.minMandatoryAnnuityPercentage}% (Mandatory Min)`,
                  value: result.minMandatoryAnnuityPercentage,
                },
                { label: "50%", value: 50 },
                { label: "75%", value: 75 },
                { label: "100% (Full Pension)", value: 100 },
              ]}
              helperText={`Remaining ${100 - annuityPercentage}% will be paid as tax-free lump sum.`}
            />
          )}

          {exitType !== "death" && annuityPercentage > 0 && (
            <PercentageInput
              label="Expected Life Annuity Rate (% p.a.)"
              value={expectedAnnuityRate}
              onChange={setExpectedAnnuityRate}
              min={3.0}
              max={12.0}
              step={0.25}
              presets={[
                { label: "5.5%", value: 5.5 },
                { label: "6.0% (Current)", value: 6.0 },
                { label: "6.5%", value: 6.5 },
              ]}
              helperText="Annuity interest rate offered by Life Insurance companies at retirement."
            />
          )}
        </div>
      }
      resultsSlot={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="Total Corpus at Retirement"
              value={formatINR(result.totalCorpusAtRetirement)}
              subtext={`Model: ${selectedModelConfig.label} | Total Invested: ${formatINR(result.totalInvested)}`}
              highlight
            />
            <ResultCard
              label="Estimated Monthly Pension"
              value={formatINR(result.expectedMonthlyPension)}
              subtext={
                result.annuityPercentage > 0
                  ? `From ${result.annuityPercentage}% annuity corpus of ${formatINR(result.annuityAmount)}`
                  : "No annuity (100% lump sum payout)"
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Tax-Free Lump Sum ({result.lumpSumPercentage}%)
              </span>
              <div className="text-2xl font-black text-emerald-950">{formatINR(result.lumpSumAmount)}</div>
              <p className="text-xs text-emerald-800">
                {result.taxationSummary.lumpSumTaxStatus}
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Annuity Corpus ({result.annuityPercentage}%)
              </span>
              <div className="text-2xl font-black text-blue-950">{formatINR(result.annuityAmount)}</div>
              <p className="text-xs text-blue-800">
                {result.taxationSummary.annuityPurchaseTaxStatus}. {result.taxationSummary.annuityIncomeTaxStatus}.
              </p>
            </div>
          </div>

          <FinancialBreakdownChart
            slices={[
              { label: "Tax-Free Lump Sum", value: result.lumpSumAmount, color: "#059669" },
              { label: "Annuity Purchase", value: result.annuityAmount, color: "#2563eb" },
            ]}
            title="Retirement Corpus Utilization"
          />
        </div>
      }
      comparisonTablesSlot={
        <div className="space-y-8">
          {/* Statutory PFRDA Taxation Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                PFRDA Statutory Exit & Taxation Framework ({selectedModelConfig.label})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of withdrawal limits, model scope, and Income Tax Act provisions
              </p>
            </div>
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">1. Normal Superannuation Exit</div>
                  <p className="text-xs text-slate-600">
                    Min 40% annuity, max 60% lump sum. 100% lump sum is permitted if total corpus is ≤ ₹5,00,000. Lump sum is 100% tax-free under Section 10(12A).
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">2. Premature Exit</div>
                  <p className="text-xs text-slate-600">
                    Min 80% annuity, max 20% lump sum (min 5 years subscription). 100% lump sum permitted if corpus ≤ ₹2,50,000.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">3. Death Exit</div>
                  <p className="text-xs text-slate-600">
                    100% of accumulated pension wealth is paid to nominee or legal heirs as tax-free lump sum under Section 10(12A). Nominee may also opt for annuity.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <span className="font-bold">Model Tax Scope: </span>
                {selectedModelConfig.applicableTaxSections.join(" | ")}
              </div>
            </div>
          </div>
        </div>
      }
      formulaExplanationSlot={
        <FormulaExplanation
          calculatorName="National Pension System (PFRDA Model Framework)"
          formula="Total Corpus = Monthly Deposit Compounded at Return Rate | Annuity vs Lump Sum Split by Model & Exit Type"
          variables={[
            {
              symbol: "All Citizen Model",
              description: "Open to individual citizens (18-70). Superannuation at age 60. Deductions under 80CCD(1) & (1B).",
            },
            {
              symbol: "Corporate Sector Model",
              description:
                "For corporate groups. Superannuation as per employer rules (e.g. 58/60). Employer contribution deductible under Section 80CCD(2).",
            },
            {
              symbol: "Normal Exit (Corpus > ₹5L)",
              description: "Minimum 40% mandatory annuity; up to 60% tax-free lump sum under Section 10(12A).",
            },
            {
              symbol: "Premature Exit (Corpus > ₹2.5L)",
              description: "Minimum 80% mandatory annuity; maximum 20% lump sum.",
            },
            {
              symbol: "Small Corpus Exemption",
              description: "Corpus ≤ ₹5 Lakhs (Normal) or ≤ ₹2.5 Lakhs (Premature) permits 100% lump sum withdrawal without annuity.",
            },
            {
              symbol: "Death Exit",
              description: "100% lump sum paid to nominee as tax-free payout.",
            },
          ]}
          notes={[
            "10.00% annual return is an illustrative planning assumption based on historical multi-asset trends; returns are market-linked and non-guaranteed.",
            "Subscribers can make partial withdrawals up to 25% of self-contributions after 3 years for specified purposes (critical illness, children's higher education, marriage, house purchase).",
            "Annuity purchase is exempt from tax under Section 80CCD(5). The monthly annuity pension payout is taxable as income in the year received as per applicable slab rate.",
          ]}
        />
      }
      faqSlot={<FAQSection faqs={faqs} />}
      relatedCalculatorsSlot={<RelatedCalculators links={relatedLinks} />}
    />
  );
};
