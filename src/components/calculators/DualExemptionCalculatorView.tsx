"use client";

import React, { useMemo, useState } from "react";
import {
  dualExemptionEngine,
  DualExemptionInput,
  defaultDualExemptionInputs,
  LivingArrangementScenario,
} from "@/lib/calculators/dual-exemption";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { formatINR } from "@/lib/formatters";
import {
  Home,
  Share2,
  Check,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Building2,
  ArrowRightLeft,
} from "lucide-react";

interface DualExemptionCalculatorViewProps {
  initialInputs?: Partial<DualExemptionInput>;
  breadcrumbs?: { label: string; href: string }[];
  relatedLinks?: { title: string; href: string; description: string; category?: string }[];
}

const SCENARIO_OPTIONS: { id: LivingArrangementScenario; label: string; description: string }[] = [
  {
    id: "different_city",
    label: "Hometown Owned House + Workplace Rented House",
    description: "100% legal & routine due to employment in different city.",
  },
  {
    id: "same_city_workplace_distance",
    label: "Both Houses in Same City (Commute / Parents)",
    description: "Allowed if owned home is too far from office or parents occupy it.",
  },
  {
    id: "let_out_owned",
    label: "Owned House is Rented Out, You Live on Rent",
    description: "Declare rental income, deduct interest, and claim 100% HRA.",
  },
  {
    id: "under_construction",
    label: "Owned Property is Under Construction",
    description: "Claim HRA now; loan interest claimed in 5 post-possession years.",
  },
];

export const DualExemptionCalculatorView: React.FC<DualExemptionCalculatorViewProps> = ({
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
  } = useCalculatorUrlState<DualExemptionInput>({
    schema: dualExemptionEngine.schema,
    defaultInputs: { ...defaultDualExemptionInputs, ...initialInputs },
    syncWithUrl: true,
  });

  const result = useMemo(() => {
    return dualExemptionEngine.calculate(inputs);
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
      { label: "Dual Tax Exemption", href: "/dual-exemption-calculator" },
    ],
    []
  );

  const defaultRelatedLinks = useMemo(
    () => [
      {
        title: "HRA Exemption Calculator",
        href: "/hra-calculator",
        description: "Official Section 10(13A) Rule 2A House Rent Allowance tax deduction engine.",
        category: "Tax",
      },
      {
        title: "Home Loan EMI Calculator",
        href: "/home-loan-emi-calculator",
        description: "Calculate monthly installments, interest burden, and amortization.",
        category: "Loans",
      },
      {
        title: "Income Tax Calculator",
        href: "/income-tax-calculator",
        description: "Compare overall tax liabilities under New vs Old Tax Regimes.",
        category: "Tax",
      },
    ],
    []
  );

  const inputsSlot = (
    <div className="space-y-6">
      {/* Living Scenario Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Living & Housing Arrangement
        </label>
        <div className="space-y-2">
          {SCENARIO_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateInput("scenario", opt.id)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                inputs.scenario === opt.id
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Salary & Rent Details */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Rented Residence & HRA Inputs
        </h4>

        <NumberInput
          id="basicSalaryMonthly"
          label="Basic Salary + DA (Monthly)"
          value={inputs.basicSalaryMonthly}
          onChange={(val) => updateInput("basicSalaryMonthly", val)}
          unit="₹"
          min={10000}
          max={1000000}
          step={5000}
          helperText={`Annual Basic: ₹${(inputs.basicSalaryMonthly * 12).toLocaleString("en-IN")}`}
          error={validationErrors?.basicSalaryMonthly}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            id="hraReceivedMonthly"
            label="HRA Received (Monthly)"
            value={inputs.hraReceivedMonthly}
            onChange={(val) => updateInput("hraReceivedMonthly", val)}
            unit="₹"
            min={0}
            max={500000}
            step={2500}
            error={validationErrors?.hraReceivedMonthly}
          />
          <NumberInput
            id="rentPaidMonthly"
            label="Rent Paid (Monthly)"
            value={inputs.rentPaidMonthly}
            onChange={(val) => updateInput("rentPaidMonthly", val)}
            unit="₹"
            min={0}
            max={500000}
            step={2500}
            error={validationErrors?.rentPaidMonthly}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rented City Accommodation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "metro" as const, label: "Metro (Delhi, Mumbai, Kolkata, Chennai - 50%)" },
              { id: "non_metro" as const, label: "Non-Metro (Bengaluru, Hyderabad, Pune, etc. - 40%)" },
            ].map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => updateInput("cityType", city.id)}
                className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                  inputs.cityType === city.id
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Home Loan Details */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Owned Property & Home Loan Deductions
        </h4>

        <NumberInput
          id="annualHomeLoanInterest"
          label="Annual Home Loan Interest Paid"
          value={inputs.annualHomeLoanInterest}
          onChange={(val) => updateInput("annualHomeLoanInterest", val)}
          unit="₹"
          min={0}
          max={5000000}
          step={10000}
          helperText="Eligible for deduction under Section 24(b) (Capped at ₹2 Lakh for self-occupied)."
          error={validationErrors?.annualHomeLoanInterest}
        />

        <NumberInput
          id="annualHomeLoanPrincipal"
          label="Annual Principal Repaid (Sec 80C)"
          value={inputs.annualHomeLoanPrincipal}
          onChange={(val) => updateInput("annualHomeLoanPrincipal", val)}
          unit="₹"
          min={0}
          max={1000000}
          step={10000}
          helperText="Principal repayment eligible within overall ₹1.5L Section 80C limit."
          error={validationErrors?.annualHomeLoanPrincipal}
        />

        {inputs.scenario === "let_out_owned" && (
          <NumberInput
            id="rentalIncomeReceivedAnnual"
            label="Annual Rental Income Received from Owned House"
            value={inputs.rentalIncomeReceivedAnnual || 0}
            onChange={(val) => updateInput("rentalIncomeReceivedAnnual", val)}
            unit="₹"
            min={0}
            max={5000000}
            step={25000}
            helperText="30% standard deduction is applied automatically before setting off interest."
          />
        )}
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
        title="Dual Exemption Benefit"
        primaryTitle="Annual Tax Saved (Old Regime)"
        primaryValue={result.taxSavedOldRegime}
        primaryFormattedValue={formatINR(result.taxSavedOldRegime)}
        primarySubtitle={`Total Tax Deductions Claimed: ${formatINR(
          result.totalTaxDeductionsClaimed
        )} (Saves ${formatINR(result.effectiveMonthlySavings)}/month)`}
        secondaryMetrics={[
          {
            label: "HRA Exemption (Sec 10(13A))",
            value: formatINR(result.hraExemptionAnnual),
            subtext: `Rule 2A allowable deduction`,
          },
          {
            label: "Home Loan Interest (Sec 24b)",
            value: formatINR(result.allowableInterestSec24b),
            subtext:
              inputs.scenario === "under_construction"
                ? "Deferred to post-possession"
                : "Deduction from House Property",
          },
          {
            label: "Principal Repayment (Sec 80C)",
            value: formatINR(result.allowablePrincipalSec80C),
            subtext: "Eligible principal deduction",
          },
          {
            label: "Taxable HRA",
            value: formatINR(result.taxableHraAnnual),
            subtext: "Remaining HRA added to salary",
          },
        ]}
      />

      {/* Scenario Compliance Note */}
      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-950 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-700" />
          Statutory Compliance Verdict
        </div>
        <p className="text-xs leading-relaxed font-medium">{result.scenarioNote}</p>
      </div>

      {/* Tax Regime Comparison Advisory */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-900">
          <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
          Old vs New Tax Regime Verdict
        </div>
        <p className="text-xs leading-relaxed font-medium">{result.regimeComparisonAdvice}</p>
      </div>

      {/* Audit Checklist Box */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          Income Tax Scrutiny Checklist (Keep Ready)
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {result.auditChecklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const formulaExplanationSlot = (
    <FormulaExplanation
      title="Dual Tax Exemption Statutory Rules & Computation"
      formula={dualExemptionEngine.metadata.formula.expression}
      variables={dualExemptionEngine.metadata.formula.variables}
      steps={dualExemptionEngine.metadata.formula.steps}
    />
  );

  const faqSlot = <FAQSection faqs={dualExemptionEngine.metadata.faqs} />;

  const relatedCalculatorsSlot = (
    <RelatedCalculators
      calculators={relatedLinks || defaultRelatedLinks}
      title="Related Tax & Housing Calculators"
    />
  );

  return (
    <CalculatorLayout
      title={dualExemptionEngine.metadata.name}
      description={dualExemptionEngine.metadata.shortDescription}
      badge="HRA + Home Loan Rules"
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={formulaExplanationSlot}
      faqSlot={faqSlot}
      relatedCalculatorsSlot={relatedCalculatorsSlot}
    />
  );
};
