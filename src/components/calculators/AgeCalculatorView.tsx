"use client";

import React, { useMemo, useState } from "react";
import {
  ageEngine,
  AgeInput,
  calculateAge,
  defaultAgeInput,
  ageInputSchema,
} from "@/lib/calculators/age";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, Calendar, Cake, Clock, Compass, Sparkles } from "lucide-react";

export interface AgeCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const AgeCalculatorView: React.FC<AgeCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Everyday Calculators", href: "/everyday" },
      { label: "Age Calculator", href: "/age-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "BMI Calculator",
        description: "Assess healthy body mass index with Asian-Indian and WHO standards.",
        href: "/bmi-calculator",
        badge: "Health",
      },
      {
        title: "Tip Calculator",
        description: "Calculate gratuity and bill split per person with tax.",
        href: "/tip-calculator",
        badge: "Everyday",
      },
      {
        title: "Sukanya Samriddhi Yojana (SSY)",
        description: "Calculate maturity amount and interest for girl child scheme.",
        href: "/ssy-calculator",
        badge: "Government",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<AgeInput>({
      schema: ageInputSchema,
      defaultInputs: defaultAgeInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateAge(inputs);
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

  const handleDateChange = (field: keyof AgeInput, value: string) => {
    updateInput(field, value);
    trackCalculatorUsed("age", `change_${field}`);
    trackCalculatorResultGenerated("age");
  };

  const setTodayAsTarget = () => {
    const today = new Date().toISOString().split("T")[0];
    handleDateChange("targetDate", today);
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Total Days Lived",
        value: result.totalDays,
        formattedValue: `${result.totalDays.toLocaleString("en-IN")} days`,
        subtext: `${result.totalWeeks.toLocaleString("en-IN")} full weeks`,
      },
      {
        label: "Total Hours Elapsed",
        value: result.totalHours,
        formattedValue: `${result.totalHours.toLocaleString("en-IN")} hrs`,
        subtext: `${result.totalMinutes.toLocaleString("en-IN")} minutes`,
      },
      {
        label: "Next Birthday In",
        value: result.nextBirthday.daysRemaining,
        formattedValue: `${result.nextBirthday.daysRemaining} days`,
        subtext: `${result.nextBirthday.dayOfWeek}, ${result.nextBirthday.date}`,
      },
      {
        label: "Born On",
        value: 0,
        formattedValue: result.dayOfWeekBorn,
        subtext: `Zodiac: ${result.zodiacSign}`,
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Date Details
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Date of Birth Input */}
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-semibold text-slate-900 mb-1.5"
          >
            Date of Birth (DOB) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="birthDate"
              type="date"
              value={inputs.birthDate}
              onChange={(e) => handleDateChange("birthDate", e.target.value)}
              max={inputs.targetDate || new Date().toISOString().split("T")[0]}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium text-slate-900 bg-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                validationErrors.birthDate
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            />
          </div>
          {validationErrors.birthDate ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.birthDate}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Enter your date of birth.</p>
          )}
        </div>

        {/* Target Comparison Date */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="targetDate"
              className="block text-sm font-semibold text-slate-900"
            >
              Age at Date of (Comparison Date)
            </label>
            <button
              type="button"
              onClick={setTodayAsTarget}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
            >
              Set to Today
            </button>
          </div>
          <div className="relative">
            <input
              id="targetDate"
              type="date"
              value={inputs.targetDate || ""}
              onChange={(e) => handleDateChange("targetDate", e.target.value)}
              min={inputs.birthDate}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium text-slate-900 bg-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                validationErrors.targetDate
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            />
          </div>
          {validationErrors.targetDate ? (
            <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.targetDate}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Calculate historical age or future age (defaults to current date).
            </p>
          )}
        </div>
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this age record
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
        primaryTitle="Exact Chronological Age"
        primaryValue={result.years}
        primaryFormattedValue={result.formattedAge}
        primarySubtitle={`${result.years} Years, ${result.months} Months, ${result.days} Days (as of ${result.targetDate})`}
        secondaryMetrics={metrics}
      />

      {/* Milestone Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Birthday Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Cake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Next Birthday Countdown
              </h3>
              <p className="text-xs text-amber-900/70">{result.nextBirthday.date}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-950">
            {result.nextBirthday.daysRemaining}{" "}
            <span className="text-sm font-semibold text-amber-800">days left</span>
          </p>
          <p className="text-xs text-amber-900/80 mt-1">
            Falling on a <span className="font-semibold">{result.nextBirthday.dayOfWeek}</span> (~
            {result.nextBirthday.monthsRemaining} months away).
          </p>
        </div>

        {/* Life Statistics Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                Astrological & Day Sign
              </h3>
              <p className="text-xs text-indigo-900/70">Born on a {result.dayOfWeekBorn}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-950">{result.zodiacSign}</p>
          <p className="text-xs text-indigo-900/80 mt-1">
            Western Zodiac Sign based on solar calendar day {result.birthDate.slice(5)}.
          </p>
        </div>
      </div>

      {/* Chronological Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          Time Elapsed Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Months</div>
            <div className="text-base font-bold text-slate-900">{result.totalMonths}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Weeks</div>
            <div className="text-base font-bold text-slate-900">
              {result.totalWeeks.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Days</div>
            <div className="text-base font-bold text-slate-900">
              {result.totalDays.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Hours</div>
            <div className="text-base font-bold text-slate-900">
              {result.totalHours.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          How Exact Chronological Age Is Calculated
        </h2>
        <p>
          Determining chronological age appears simple at first glance, but standard arithmetic
          subtraction fails because calendar months have differing lengths (28, 29, 30, or 31 days)
          and leap years contain 366 days instead of 365.
        </p>
        <p>
          Our precision age engine applies the{" "}
          <strong>astronomical calendar borrowing algorithm</strong>:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Day Difference:</strong> Subtract the birth day from the comparison day. If the
            comparison day is smaller, we borrow the exact number of days from the previous calendar
            month (taking into account leap years for February).
          </li>
          <li>
            <strong>Month Difference:</strong> Subtract the birth month from the comparison month. If
            the comparison month is smaller (or has been decreased due to day borrowing), borrow 12
            months from the year.
          </li>
          <li>
            <strong>Year Difference:</strong> Subtract the birth year from the adjusted comparison
            year.
          </li>
        </ol>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Common Applications of Chronological Age in India
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Government Job & Civil Exam Eligibility:</strong> Exams such as UPSC, SSC CGL,
            and State PSCs specify exact age cut-offs (e.g., &ldquo;Must be between 21 and 32 years as
            of 1st August&rdquo;).
          </li>
          <li>
            <strong>Financial & Retirement Planning:</strong> Schemes like PPF (15 years), Sukanya
            Samriddhi Yojana (under 10 years at entry), and Senior Citizen Savings Scheme (SCSS, 60+
            years) require exact chronological verification.
          </li>
          <li>
            <strong>Insurance Underwriting:</strong> Life and health insurance premiums are priced
            based on &ldquo;age nearest birthday&rdquo; or completed chronological age.
          </li>
          <li>
            <strong>School Admissions:</strong> CBSE, ICSE, and state boards mandate minimum ages for
            kindergarten and standard 1 admissions as of 31st March or 1st June.
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={ageEngine.metadata.name}
      badge={ageEngine.metadata.badge}
      description={ageEngine.metadata.shortDescription}
      directAnswer={ageEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        ageEngine.metadata.formula ? (
          <FormulaExplanation
            formula={ageEngine.metadata.formula.expression}
            variables={ageEngine.metadata.formula.variables}
            steps={ageEngine.metadata.formula.steps}
            notes={ageEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={ageEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators
          links={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
