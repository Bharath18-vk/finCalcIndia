"use client";

import React, { useMemo, useState } from "react";
import {
  ssyEngine,
  SsyInput,
  calculateSsy,
  defaultSsyInput,
  ssyInputSchema,
} from "@/lib/calculators/ssy";
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
import { Share2, Check, ShieldCheck, HeartHandshake, Table, Info } from "lucide-react";

export interface SsyCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const DEPOSIT_PRESETS = [25000, 50000, 100000, 150000];

export const SsyCalculatorView: React.FC<SsyCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Savings & Government", href: "/savings" },
      { label: "SSY Calculator", href: "/ssy-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "PPF Calculator",
        description: "Calculate Public Provident Fund 15-year tax-free returns.",
        href: "/ppf-calculator",
        badge: "Government",
      },
      {
        title: "Senior Citizen Savings Scheme (SCSS)",
        description: "Calculate quarterly payouts and 8.2% guaranteed returns.",
        href: "/scss-calculator",
        badge: "Government",
      },
      {
        title: "SIP Calculator",
        description: "Project wealth generation through mutual fund systematic plans.",
        href: "/sip-calculator",
        badge: "Investments",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<SsyInput>({
      schema: ssyInputSchema,
      defaultInputs: defaultSsyInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateSsy(inputs);
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
    updateInput("yearlyDeposit", amount);
    trackCalculatorUsed("ssy", `preset_deposit_${amount}`);
    trackCalculatorResultGenerated("ssy");
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Total Amount Deposited",
        value: result.totalDeposit,
        formattedValue: formatINR(result.totalDeposit),
        subtext: "15 years of contributions",
      },
      {
        label: "Total Interest Earned",
        value: result.totalInterest,
        formattedValue: formatINR(result.totalInterest),
        subtext: "Compounded annually at 8.2%",
      },
      {
        label: "Government Interest Rate",
        value: result.interestRate,
        formattedValue: `${result.interestRate}% p.a.`,
        subtext: "Q3/Q4 FY 2025-26 notified rate",
      },
      {
        label: "Year of Account Maturity",
        value: result.maturityYear,
        formattedValue: `${result.maturityYear}`,
        subtext: "21 years from account opening",
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            Investment Details
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Yearly Deposit with Presets */}
        <div>
          <CurrencyInput
            id="yearlyDeposit"
            label="Yearly Deposit Amount (₹)"
            value={inputs.yearlyDeposit}
            onChange={(val) => {
              updateInput("yearlyDeposit", val);
              trackCalculatorResultGenerated("ssy");
            }}
            min={250}
            max={150000}
            step={1000}
            error={validationErrors.yearlyDeposit}
            helperText="Minimum ₹250, Maximum ₹1,50,000 per financial year."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {DEPOSIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetDeposit(preset)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer ${
                  inputs.yearlyDeposit === preset
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {formatINR(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Girl Child Age */}
        <NumberInput
          id="girlChildAge"
          label="Girl Child's Current Age (Years)"
          value={inputs.girlChildAge ?? 1}
          onChange={(val) => {
            updateInput("girlChildAge", Math.max(0, Math.floor(val)));
            trackCalculatorResultGenerated("ssy");
          }}
          min={0}
          max={10}
          step={1}
          unit="years"
          error={validationErrors.girlChildAge}
          helperText="Account must be opened before the girl child turns 10."
        />

        {/* Interest Rate */}
        <NumberInput
          id="interestRate"
          label="Annual Interest Rate (%)"
          value={inputs.interestRate ?? 8.2}
          onChange={(val) => {
            updateInput("interestRate", val);
            trackCalculatorResultGenerated("ssy");
          }}
          min={4}
          max={15}
          step={0.1}
          unit="%"
          error={validationErrors.interestRate}
          helperText="Current statutory rate is 8.2% p.a."
        />

        {/* Account Opening Year */}
        <NumberInput
          id="startYear"
          label="Account Opening Year"
          value={inputs.startYear ?? 2026}
          onChange={(val) => {
            updateInput("startYear", Math.floor(val));
            trackCalculatorResultGenerated("ssy");
          }}
          min={2015}
          max={2050}
          step={1}
          error={validationErrors.startYear}
          helperText="Calendar year when the first installment is deposited."
        />
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this SSY plan
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
        primaryTitle="Maturity Corpus (After 21 Years)"
        primaryValue={result.maturityAmount}
        primaryFormattedValue={formatINR(result.maturityAmount)}
        primarySubtitle={`Matures in ${result.maturityYear} | 100% Tax-Free under Section 10(11A)`}
        secondaryMetrics={metrics}
      />

      {/* EEE Tax Benefit Callout */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-emerald-900">
            Triple Tax Exemption (EEE Status)
          </h3>
        </div>
        <p className="text-xs text-emerald-950/80 leading-relaxed">
          Sukanya Samriddhi Yojana offers maximum sovereign tax protection:
          <br />
          • <strong>Investment:</strong> Tax deduction up to ₹1.5 Lakh under Section 80C.
          <br />
          • <strong>Accrual:</strong> Annual interest of 8.2% is completely exempt from income tax.
          <br />
          • <strong>Maturity:</strong> The entire ₹{result.maturityAmount.toLocaleString("en-IN")}{" "}
          corpus is 100% tax-free under Section 10(11A).
        </p>
      </div>

      {/* 21-Year Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            21-Year Growth Schedule
          </h3>
          <button
            type="button"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            {showFullSchedule ? "Show First 5 Years" : "View All 21 Years"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Year</th>
                <th className="p-2.5">Age</th>
                <th className="p-2.5">Deposit</th>
                <th className="p-2.5">Interest Earned</th>
                <th className="p-2.5">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(showFullSchedule ? result.schedule : result.schedule.slice(0, 5)).map((row) => (
                <tr key={row.yearNumber} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-medium text-slate-900">
                    Yr {row.yearNumber} ({row.calendarYear})
                  </td>
                  <td className="p-2.5 text-slate-600">{row.girlAge} yrs</td>
                  <td className="p-2.5 font-medium text-slate-900">
                    {row.deposit > 0 ? formatINR(row.deposit) : "— (No Deposit)"}
                  </td>
                  <td className="p-2.5 text-emerald-700 font-medium">
                    +{formatINR(row.interestEarned)}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">
                    {formatINR(row.closingBalance)}
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
          Sukanya Samriddhi Yojana (SSY) Rules & Guidelines
        </h2>
        <p>
          Launched as part of the &ldquo;Beti Bachao, Beti Padhao&rdquo; campaign, Sukanya Samriddhi
          Yojana is a sovereign-backed small savings scheme designed specifically for parents of
          girl children in India:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account Opening Eligibility:</strong> The account can be opened by a parent or
            legal guardian for a girl child from her birth up to the age of 10 years. A family can
            open accounts for a maximum of two girls (with exceptions for twins/triplets).
          </li>
          <li>
            <strong>Deposit Window (15 Years):</strong> Deposits must be made for 15 years from the
            date of opening. The minimum annual deposit is ₹250 and the maximum is ₹1,50,000.
          </li>
          <li>
            <strong>Lock-In & Maturity (21 Years):</strong> The account matures strictly after 21
            years from opening. From years 16 to 21, no fresh deposits are required, but compound
            interest continues to accrue.
          </li>
          <li>
            <strong>Partial Withdrawal for Education:</strong> Once the girl child turns 18 or passes
            the 10th standard, up to 50% of the balance as of the preceding financial year can be
            withdrawn for certified higher education expenses.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={ssyEngine.metadata.name}
      badge={ssyEngine.metadata.badge}
      description={ssyEngine.metadata.shortDescription}
      directAnswer={ssyEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        ssyEngine.metadata.formula ? (
          <FormulaExplanation
            formula={ssyEngine.metadata.formula.expression}
            variables={ssyEngine.metadata.formula.variables}
            steps={ssyEngine.metadata.formula.steps}
            notes={ssyEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={ssyEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators
          links={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
