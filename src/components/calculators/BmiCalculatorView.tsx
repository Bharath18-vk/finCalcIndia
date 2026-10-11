"use client";

import React, { useMemo, useState } from "react";
import {
  bmiEngine,
  BmiInput,
  BmiUnit,
  calculateBmi,
  defaultBmiInput,
  bmiInputSchema,
} from "@/lib/calculators/bmi";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import { Share2, Check, Activity, Heart, ShieldCheck, AlertCircle } from "lucide-react";

export interface BmiCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const BmiCalculatorView: React.FC<BmiCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Health & Fitness", href: "/health" },
      { label: "BMI Calculator", href: "/bmi-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "Age Calculator",
        description: "Calculate exact chronological age, days lived, and next birthday.",
        href: "/age-calculator",
        badge: "Everyday",
      },
      {
        title: "Tip Calculator",
        description: "Split restaurant bills and calculate gratuity with tax.",
        href: "/tip-calculator",
        badge: "Everyday",
      },
      {
        title: "Calorie & Health Planning",
        description: "Explore fitness and lifestyle health tools.",
        href: "/health",
        badge: "Health",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<BmiInput>({
      schema: bmiInputSchema,
      defaultInputs: defaultBmiInput,
      syncWithUrl: true,
    });

  const result = useMemo(() => {
    return calculateBmi(inputs);
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

  const handleUnitToggle = (newUnit: BmiUnit) => {
    updateInput("unit", newUnit);
    trackCalculatorUsed("bmi", `unit_${newUnit}`);
    trackCalculatorResultGenerated("bmi");
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Asian-Indian (ICMR)",
        value: 0,
        formattedValue: result.asianIndianCategory.category,
        subtext: result.asianIndianCategory.description,
      },
      {
        label: "WHO International",
        value: 0,
        formattedValue: result.whoCategory.category,
        subtext: "Normal: 18.5 – 24.9",
      },
      {
        label: "Ideal Weight (Indian)",
        value: result.indianHealthyRange.maxKg,
        formattedValue: result.indianHealthyRange.formattedKg,
        subtext: "BMI 18.0 – 22.9",
      },
      {
        label: "BMI Prime",
        value: result.bmiPrime,
        formattedValue: `${result.bmiPrime}`,
        subtext: "Target: 0.74 – 0.99",
      },
    ],
    [result]
  );

  const inputsSlot = (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Body Measurements
          </h2>
          <button
            type="button"
            onClick={resetInputs}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Unit Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Unit System
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleUnitToggle("metric")}
              className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
                inputs.unit === "metric"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Metric (cm / kg)
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle("imperial")}
              className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
                inputs.unit === "imperial"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Imperial (ft+in / lbs)
            </button>
          </div>
        </div>

        {/* Dynamic Inputs based on Unit */}
        {inputs.unit === "metric" ? (
          <>
            <NumberInput
              id="heightCm"
              label="Height (Centimeters)"
              value={inputs.heightCm}
              onChange={(val) => {
                updateInput("heightCm", val);
                trackCalculatorResultGenerated("bmi");
              }}
              min={50}
              max={280}
              step={1}
              unit="cm"
              error={validationErrors.heightCm}
              helperText="E.g., 170 cm is approximately 5 feet 7 inches."
            />

            <NumberInput
              id="weightKg"
              label="Weight (Kilograms)"
              value={inputs.weightKg}
              onChange={(val) => {
                updateInput("weightKg", val);
                trackCalculatorResultGenerated("bmi");
              }}
              min={10}
              max={500}
              step={0.5}
              unit="kg"
              error={validationErrors.weightKg}
              helperText="Standard weight measured without heavy footwear."
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                id="heightFt"
                label="Height (Feet)"
                value={inputs.heightFt}
                onChange={(val) => {
                  updateInput("heightFt", val);
                  trackCalculatorResultGenerated("bmi");
                }}
                min={1}
                max={8}
                step={1}
                unit="ft"
                error={validationErrors.heightFt}
              />
              <NumberInput
                id="heightIn"
                label="Height (Inches)"
                value={inputs.heightIn}
                onChange={(val) => {
                  updateInput("heightIn", val);
                  trackCalculatorResultGenerated("bmi");
                }}
                min={0}
                max={11.9}
                step={1}
                unit="in"
                error={validationErrors.heightIn}
              />
            </div>

            <NumberInput
              id="weightLbs"
              label="Weight (Pounds)"
              value={inputs.weightLbs}
              onChange={(val) => {
                updateInput("weightLbs", val);
                trackCalculatorResultGenerated("bmi");
              }}
              min={20}
              max={1100}
              step={1}
              unit="lbs"
              error={validationErrors.weightLbs}
            />
          </>
        )}
      </div>

      {/* Share / Save calculation */}
      {shareableUrl && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Share or bookmark</span> this BMI calculation
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
        primaryTitle="Body Mass Index (BMI)"
        primaryValue={result.bmi}
        primaryFormattedValue={`${result.bmi} kg/m²`}
        primarySubtitle={`Height: ${result.effectiveHeightCm} cm | Weight: ${result.effectiveWeightKg} kg`}
        secondaryMetrics={metrics}
      />

      {/* Asian-Indian vs WHO Guidelines Visual Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Clinical Classification Comparison
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            ICMR & WHO
          </span>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Indian ICMR Card */}
          <div
            className={`p-4 rounded-xl border ${
              result.asianIndianCategory.isHealthy
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-amber-50/50 border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Asian-Indian (ICMR)
              </span>
              {result.asianIndianCategory.isHealthy ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <p className="text-lg font-bold text-slate-900">
              {result.asianIndianCategory.category}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Normal range: <strong>18.0 – 22.9 kg/m²</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ideal weight: <strong>{result.indianHealthyRange.formattedKg}</strong>
            </p>
          </div>

          {/* WHO Card */}
          <div
            className={`p-4 rounded-xl border ${
              result.whoCategory.isHealthy
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                WHO Global
              </span>
              {result.whoCategory.isHealthy ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <p className="text-lg font-bold text-slate-900">
              {result.whoCategory.category}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Normal range: <strong>18.5 – 24.9 kg/m²</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ideal weight: <strong>{result.whoHealthyRange.formattedKg}</strong>
            </p>
          </div>
        </div>

        {/* Weight Target Message */}
        <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed border border-slate-100">
          {result.weightDiffToIndianNormalKg === 0 ? (
            <p className="text-emerald-800 font-medium">
              🎉 Congratulations! Your current weight is within the healthy range for Asian Indians.
            </p>
          ) : result.weightDiffToIndianNormalKg > 0 ? (
            <p className="text-slate-800">
              To reach the upper boundary of the healthy Asian-Indian range (22.9 kg/m²), you would
              need to lose approximately{" "}
              <strong className="text-rose-700 font-semibold">
                {result.weightDiffToIndianNormalKg} kg
              </strong>
              .
            </p>
          ) : (
            <p className="text-slate-800">
              To reach the healthy threshold (18.0 kg/m²), you would need to gain approximately{" "}
              <strong className="text-amber-700 font-semibold">
                {Math.abs(result.weightDiffToIndianNormalKg)} kg
              </strong>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const contentSlot = (
    <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Why Asian Indians Have Lower BMI Cut-Offs
        </h2>
        <p>
          For decades, international health guidelines used the World Health Organization (WHO) BMI
          standards developed primarily from Caucasian population data. However, extensive clinical
          studies conducted by the Indian Council of Medical Research (ICMR) and the Association of
          Physicians of India (API) revealed that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Higher Body Fat Percentage:</strong> At any given BMI level, South Asians have a
            significantly higher percentage of body fat and lower muscle mass compared to Western
            counterparts.
          </li>
          <li>
            <strong>Abdominal & Visceral Adiposity:</strong> Indians are genetically predisposed to
            accumulating visceral fat around vital organs (the &ldquo;thin-fat&rdquo; Indian phenotype),
            which directly drives insulin resistance, Type 2 diabetes, fatty liver disease, and
            premature coronary artery disease.
          </li>
          <li>
            <strong>Lower Threshold for Metabolic Risk:</strong> Cardiometabolic risk escalates sharply
            at a BMI of 23.0 kg/m² in Indians, whereas Western risk curves escalate at 25.0 kg/m².
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Official BMI Cut-Off Table (Comparison)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">WHO Global (kg/m²)</th>
                <th className="p-3">Asian-Indian / ICMR (kg/m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium text-slate-900">Underweight</td>
                <td className="p-3">&lt; 18.5</td>
                <td className="p-3 font-semibold text-amber-700">&lt; 18.0</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-900">Normal Weight</td>
                <td className="p-3">18.5 – 24.9</td>
                <td className="p-3 font-semibold text-emerald-700">18.0 – 22.9</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-900">Overweight</td>
                <td className="p-3">25.0 – 29.9</td>
                <td className="p-3 font-semibold text-amber-700">23.0 – 24.9</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-900">Obese</td>
                <td className="p-3">≥ 30.0</td>
                <td className="p-3 font-semibold text-rose-700">≥ 25.0</td>
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
      title={bmiEngine.metadata.name}
      badge={bmiEngine.metadata.badge}
      description={bmiEngine.metadata.shortDescription}
      directAnswer={bmiEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      contentSlot={contentSlot}
      formulaExplanationSlot={
        bmiEngine.metadata.formula ? (
          <FormulaExplanation
            formula={bmiEngine.metadata.formula.expression}
            variables={bmiEngine.metadata.formula.variables}
            steps={bmiEngine.metadata.formula.steps}
            notes={bmiEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={bmiEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators
          links={relatedLinks || defaultRelatedLinks}
        />
      }
    />
  );
};
