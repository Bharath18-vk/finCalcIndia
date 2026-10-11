"use client";

import React, { useMemo, useState } from "react";
import {
  scssEngine,
  ScssInput,
  calculateScss,
  defaultScssInput,
  scssInputSchema,
} from "@/lib/calculators/scss";
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
import { Share2, Check, ShieldAlert, Award, Table, Landmark } from "lucide-react";

export interface ScssCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const DEPOSIT_PRESETS = [500000, 1000000, 1500000, 3000000];

export const ScssCalculatorView: React.FC<ScssCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Retirement & Savings", href: "/retirement" },
      { label: "SCSS Calculator", href: "/scss-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "FD Calculator",
        description: "Calculate senior citizen fixed deposit interest with bank rates.",
        href: "/fd-calculator",
        badge: "Savings",
      },
      {
        title: "SWP Calculator",
        description: "Systematic withdrawal plan for monthly retirement pension.",
        href: "/swp-calculator",
        badge: "Investments",
      },
      {
        title: "Sukanya Samriddhi Yojana (SSY)",
        description: "Calculate maturity returns on 8.2% sovereign savings scheme.",
        href: "/ssy-calculator",
        badge: "Government",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<ScssInput>({
      schema: scssInputSchema,
      defaultInputs: defaultScssInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateScss(inputs);
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

  const handlePresetDeposit = (amount: number) => {
    updateInput("depositAmount", amount);
    trackCalculatorUsed("scss", `preset_deposit_${amount}`);
    trackCalculatorResultGenerated("scss");
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Annual Regular Income",
        value: result.annualPayout,
        formattedValue: formatINR(result.annualPayout),
        subtext: "4 quarterly payouts per year",
      },
      {
        label: `Total Interest (${result.tenureYears} Yrs)`,
        value: result.totalInterest,
        formattedValue: formatINR(result.totalInterest),
        subtext: "Guaranteed sovereign interest",
      },
      {
        label: "Sec 80TTB Tax-Free Payout",
        value: result.section80TtbDeduction,
        formattedValue: formatINR(result.section80TtbDeduction),
        subtext: "Per financial year exemption",
      },
      {
        label: "Principal at Maturity",
        value: result.depositAmount,
        formattedValue: formatINR(result.depositAmount),
        subtext: "100% principal returned",
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            Deposit Parameters
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Deposit Amount with Presets */}
        <div>
          <CurrencyInput
            id="depositAmount"
            label="Total Deposit Amount (₹)"
            value={inputs.depositAmount}
            onChange={(val) => {
              updateInput("depositAmount", val);
              trackCalculatorResultGenerated("scss");
            }}
            min={1000}
            max={3000000}
            step={10000}
            error={validationErrors.depositAmount}
            helperText="Minimum ₹1,000, Maximum ₹30,00,000 per senior citizen."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {DEPOSIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetDeposit(preset)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.depositAmount === preset
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {formatINR(preset)} {preset === 3000000 ? "(Max Limit)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Tenure Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Investment Tenure
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateInput("tenureYears", 5)}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                (inputs.tenureYears ?? 5) === 5
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              5 Years (Standard)
            </button>
            <button
              type="button"
              onClick={() => updateInput("tenureYears", 8)}
              className={`py-2 text-xs font-semibold rounded-md border transition cursor-pointer ${
                (inputs.tenureYears ?? 5) === 8
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              8 Years (Extended Block)
            </button>
          </div>
        </div>

        {/* Interest Rate */}
        <NumberInput
          id="interestRate"
          label="Annual Interest Rate (%)"
          value={inputs.interestRate ?? 8.2}
          onChange={(val) => {
            updateInput("interestRate", val);
            trackCalculatorResultGenerated("scss");
          }}
          min={4}
          max={15}
          step={0.1}
          unit="%"
          error={validationErrors.interestRate}
          helperText="Current statutory rate is 8.2% p.a."
        />

        {/* Investor Age */}
        <NumberInput
          id="investorAge"
          label="Senior Citizen Age (Years)"
          value={inputs.investorAge ?? 60}
          onChange={(val) => {
            updateInput("investorAge", Math.max(50, Math.floor(val)));
            trackCalculatorResultGenerated("scss");
          }}
          min={50}
          max={100}
          step={1}
          unit="years"
          error={validationErrors.investorAge}
          helperText="Age 60+ (or 55+ for VRS retirees) to qualify for SCSS."
        />
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this SCSS calculation
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
        primaryTitle="Quarterly Regular Income"
        primaryValue={result.quarterlyPayout}
        primaryFormattedValue={formatINR(result.quarterlyPayout)}
        primarySubtitle={`Credited Every 3 Months (8.2% p.a.) | ~${formatINR(result.monthlyEquivalent)}/month`}
        secondaryMetrics={metrics}
      />

      {/* Senior Citizen Tax Benefits Callout */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-700" />
          <h3 className="text-sm font-bold text-amber-900">
            Section 80TTB Tax Exemption for Senior Citizens
          </h3>
        </div>
        <p className="text-xs text-amber-950/80 leading-relaxed">
          Under Section 80TTB of the Income Tax Act, senior citizens can deduct up to{" "}
          <strong>₹50,000 of interest income</strong> each financial year from their taxable income.
          <br />
          • Annual Interest Income: <strong>{formatINR(result.annualPayout)}</strong>
          <br />
          • Sec 80TTB Exempt Portion: <strong>{formatINR(result.section80TtbDeduction)}</strong>
          <br />
          • Taxable Balance: <strong>{formatINR(result.taxableAnnualInterest)}</strong> (taxed at slab rate; submit Form 15H if total income is below basic exemption).
        </p>
      </div>

      {/* Cash Flow Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-600" />
          {result.tenureYears}-Year Regular Income Schedule
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Year</th>
                <th className="p-2.5">Invested Principal</th>
                <th className="p-2.5">Quarterly Payout</th>
                <th className="p-2.5">Annual Payout</th>
                <th className="p-2.5">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.schedule.map((row) => (
                <tr key={row.yearNumber} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-medium text-slate-900">Year {row.yearNumber}</td>
                  <td className="p-2.5 text-slate-700">{formatINR(row.openingPrincipal)}</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">
                    {formatINR(row.quarterlyInterest)}
                  </td>
                  <td className="p-2.5 text-slate-900 font-medium">
                    {formatINR(row.annualInterest)}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">
                    {formatINR(row.cumulativeInterest)}
                  </td>
                </tr>
              ))}
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
          Senior Citizen Savings Scheme (SCSS) Key Rules & Benefits
        </h2>
        <p>
          The Senior Citizen Savings Scheme is a premier government-guaranteed retirement investment
          option offering security, high yields, and quarterly cash flow:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Enhanced ₹30 Lakh Investment Limit:</strong> In the Union Budget 2023, the
            central government doubled the individual deposit ceiling from ₹15 Lakhs to ₹30 Lakhs.
            A senior citizen couple can jointly/individually invest up to ₹60 Lakhs, yielding ₹1,23,000
            in guaranteed quarterly income.
          </li>
          <li>
            <strong>Strict Quarterly Payouts:</strong> Interest is credited automatically on the 1st
            day of April, July, October, and January into the senior citizen&apos;s bank or post office
            savings account.
          </li>
          <li>
            <strong>Sovereign Security:</strong> Backed directly by the Government of India, SCSS
            carries zero credit risk, making it substantially safer than corporate fixed deposits or
            cooperative bank schemes.
          </li>
          <li>
            <strong>Premature Withdrawal:</strong> Funds can be withdrawn before maturity after 1 year
            subject to minor statutory deductions (1.5% deduction between 1-2 years, 1% deduction after
            2 years).
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={scssEngine.metadata.name}
      badge={scssEngine.metadata.badge}
      description={scssEngine.metadata.shortDescription}
      directAnswer={scssEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        scssEngine.metadata.formula ? (
          <FormulaExplanation
            formula={scssEngine.metadata.formula.expression}
            variables={scssEngine.metadata.formula.variables}
            steps={scssEngine.metadata.formula.steps}
            notes={scssEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={scssEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators
          links={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
