"use client";

import React, { useMemo, useState } from "react";
import {
  calorieEngine,
  calculateCalories,
  calorieInputSchema,
  defaultCalorieInputs,
  CalorieInput,
  CalorieResult,
  GenderType,
  ActivityLevel,
  CalorieGoal,
} from "@/lib/calculators/calorie";
import { useCalculatorUrlState } from "@/hooks/useCalculatorUrlState";
import { CalculatorLayout } from "@/components/layout/CalculatorLayout";
import { NumberInput } from "@/components/ui/NumberInput";
import { ResultCard, MetricItem } from "@/components/ui/ResultCard";
import { FormulaExplanation } from "@/components/ui/FormulaExplanation";
import { FAQSection } from "@/components/ui/FAQSection";
import { RelatedCalculators, RelatedLink } from "@/components/ui/RelatedCalculators";
import { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { FinancialBreakdownChart } from "@/components/ui/Chart";
import { trackCalculatorUsed, trackCalculatorResultGenerated } from "@/lib/analytics";
import {
  Share2,
  Check,
  Flame,
  Utensils,
  Dumbbell,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";

export interface CalorieCalculatorViewProps {
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

export const CalorieCalculatorView: React.FC<CalorieCalculatorViewProps> = ({
  breadcrumbs,
  relatedLinks,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Health & Fitness", href: "/health" },
      { label: "Calorie Calculator", href: "/calorie-calculator" },
    ],
    []
  );

  const defaultRelatedLinks: RelatedLink[] = useMemo(
    () => [
      {
        title: "BMI Calculator",
        description: "Calculate Body Mass Index with ICMR Asian-Indian cutoff standards.",
        href: "/bmi-calculator",
        badge: "Health",
      },
      {
        title: "Age Calculator",
        description: "Calculate exact chronological age, months, and days lived.",
        href: "/age-calculator",
        badge: "Everyday",
      },
      {
        title: "Health & Everyday Hub",
        description: "Explore all health, lifestyle, and fitness calculation tools.",
        href: "/health",
        badge: "Hub",
      },
    ],
    []
  );

  const { inputs, updateInput, resetInputs, validationErrors, shareableUrl } =
    useCalculatorUrlState<CalorieInput>({
      schema: calorieInputSchema,
      defaultInputs: defaultCalorieInputs,
      syncWithUrl: true,
    });

  const result: CalorieResult = useMemo(() => {
    return calculateCalories(inputs);
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

  const handleGenderChange = (gender: GenderType) => {
    updateInput("gender", gender);
    trackCalculatorUsed("calorie", `gender_${gender}`);
    trackCalculatorResultGenerated("calorie");
  };

  const handleActivityChange = (activity: ActivityLevel) => {
    updateInput("activityLevel", activity);
    trackCalculatorUsed("calorie", `activity_${activity}`);
    trackCalculatorResultGenerated("calorie");
  };

  const handleGoalChange = (goal: CalorieGoal) => {
    updateInput("goal", goal);
    trackCalculatorUsed("calorie", `goal_${goal}`);
    trackCalculatorResultGenerated("calorie");
  };

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: "Basal Metabolic Rate (BMR)",
        value: result.bmr,
        formattedValue: `${result.bmr.toLocaleString("en-IN")} kcal/day`,
        subtext: "Calories at complete rest",
      },
      {
        label: "Maintenance (TDEE)",
        value: result.tdee,
        formattedValue: `${result.tdee.toLocaleString("en-IN")} kcal/day`,
        subtext: "With current physical activity",
      },
      {
        label: "Weekly Projected Change",
        value: result.weeklyWeightChangeKg,
        formattedValue:
          result.weeklyWeightChangeKg === 0
            ? "Maintain 0.0 kg"
            : `${result.weeklyWeightChangeKg > 0 ? "+" : ""}${result.weeklyWeightChangeKg} kg / week`,
        subtext: "Estimated body mass trajectory",
      },
      {
        label: "Daily Water Intake",
        value: result.recommendedWaterLiters,
        formattedValue: `${result.recommendedWaterLiters} Liters`,
        subtext: "33ml per kg body mass",
      },
    ],
    [result]
  );

  const goalDescriptions: Record<CalorieGoal, { title: string; color: string; icon: React.ReactNode }> = {
    maintain: { title: "Maintain Current Weight", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Minus className="w-4 h-4 text-blue-600" /> },
    "mild-loss": { title: "Mild Fat Loss (-0.25 kg/wk)", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <TrendingDown className="w-4 h-4 text-emerald-600" /> },
    "moderate-loss": { title: "Moderate Fat Loss (-0.50 kg/wk)", color: "text-green-600 bg-green-50 border-green-200", icon: <TrendingDown className="w-4 h-4 text-green-600" /> },
    "extreme-loss": { title: "Aggressive Fat Loss (-1.00 kg/wk)", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <TrendingDown className="w-4 h-4 text-amber-600" /> },
    "mild-gain": { title: "Clean Lean Bulk (+0.30 kg/wk)", color: "text-purple-600 bg-purple-50 border-purple-200", icon: <TrendingUp className="w-4 h-4 text-purple-600" /> },
    "moderate-gain": { title: "Muscle Mass Gain (+0.50 kg/wk)", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <TrendingUp className="w-4 h-4 text-indigo-600" /> },
  };

  const inputsSlot = (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Body Profile & Lifestyle
        </h2>
        <button
          onClick={resetInputs}
          className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Biological Sex
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleGenderChange("male")}
            className={`py-2.5 px-4 rounded-xl font-medium text-sm border transition-all cursor-pointer ${
              inputs.gender === "male"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange("female")}
            className={`py-2.5 px-4 rounded-xl font-medium text-sm border transition-all cursor-pointer ${
              inputs.gender === "female"
                ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Female
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Required for Mifflin-St Jeor formula (+5 for male, -161 for female).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberInput
          label="Age (Years)"
          value={inputs.age}
          onChange={(v) => updateInput("age", v)}
          min={15}
          max={100}
          step={1}
          error={validationErrors.age}
          unit="yrs"
        />
        <NumberInput
          label="Weight (kg)"
          value={inputs.weightKg}
          onChange={(v) => updateInput("weightKg", v)}
          min={30}
          max={300}
          step={0.5}
          error={validationErrors.weightKg}
          unit="kg"
        />
        <NumberInput
          label="Height (cm)"
          value={inputs.heightCm}
          onChange={(v) => updateInput("heightCm", v)}
          min={100}
          max={250}
          step={1}
          error={validationErrors.heightCm}
          unit="cm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Daily Physical Activity Level
        </label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { key: "sedentary", label: "Sedentary", desc: "Desk job, little to no exercise (1.2×)" },
            { key: "light", label: "Light Activity", desc: "Light workouts 1–3 days/week (1.375×)" },
            { key: "moderate", label: "Moderate Activity", desc: "Moderate gym workouts 3–5 days/week (1.55×)" },
            { key: "active", label: "Very Active", desc: "Hard training 6–7 days/week (1.725×)" },
            { key: "very-active", label: "Extremely Active", desc: "Heavy physical job or intense conditioning (1.9×)" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleActivityChange(item.key as ActivityLevel)}
              className={`text-left p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                inputs.activityLevel === item.key
                  ? "border-emerald-500 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-500"
                  : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="font-semibold text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Weight & Fitness Goal
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: "maintain", label: "Maintain Weight", desc: "0 kcal deficit" },
            { key: "mild-loss", label: "Mild Fat Loss", desc: "-250 kcal/day (~0.25 kg/wk)" },
            { key: "moderate-loss", label: "Moderate Fat Loss", desc: "-500 kcal/day (~0.50 kg/wk)" },
            { key: "extreme-loss", label: "Aggressive Fat Loss", desc: "-1000 kcal/day (~1.0 kg/wk)" },
            { key: "mild-gain", label: "Clean Muscle Gain", desc: "+300 kcal/day (~0.30 kg/wk)" },
            { key: "moderate-gain", label: "Weight Gain", desc: "+500 kcal/day (~0.50 kg/wk)" },
          ].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => handleGoalChange(g.key as CalorieGoal)}
              className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                inputs.goal === g.key
                  ? "border-blue-500 bg-blue-50/50 text-slate-900 ring-1 ring-blue-500"
                  : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="font-semibold text-slate-800">{g.label}</div>
              <div className="text-xs text-slate-500">{g.desc}</div>
            </button>
          ))}
        </div>
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
              Share Your Calorie Breakdown
            </>
          )}
        </button>
      )}
    </div>
  );

  const resultsSlot = (
    <div className="space-y-6">
      <ResultCard
        primaryTitle="Daily Calorie Target"
        primaryValue={result.targetCalories}
        primaryFormattedValue={`${result.targetCalories.toLocaleString("en-IN")} kcal`}
        primarySubtitle={`${goalDescriptions[result.goal].title} (${result.dailyCalorieDelta > 0 ? "+" : ""}${result.dailyCalorieDelta} kcal)`}
        secondaryMetrics={metrics}
      />

      {result.targetCalories <= 1500 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Safe Calorie Floor Enforced:</strong> Your intake has been floored at the clinical minimum ({inputs.gender === "female" ? "1,200" : "1,500"} kcal/day) to prevent nutrient deficiencies, hormonal slowdown, and muscle wasting.
          </div>
        </div>
      )}

      {/* Macronutrient Distribution Chart */}
      <FinancialBreakdownChart
        title="Macronutrient Calorie Distribution"
        totalLabel="Daily Target"
        isCurrency={false}
        valueFormatter={(v) => `${Math.round(v)} kcal`}
        slices={[
          {
            label: `Carbohydrates (${result.balancedMacros.carbGrams}g)`,
            value: result.balancedMacros.carbCalories,
            color: "#f59e0b",
          },
          {
            label: `Protein (${result.balancedMacros.proteinGrams}g)`,
            value: result.balancedMacros.proteinCalories,
            color: "#3b82f6",
          },
          {
            label: `Fats (${result.balancedMacros.fatGrams}g)`,
            value: result.balancedMacros.fatCalories,
            color: "#10b981",
          },
        ]}
      />

      {/* Macro Breakdown Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
          <Utensils className="w-4 h-4 text-emerald-500" />
          Macronutrient Partitioning
        </h3>

        {/* Balanced Split */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Balanced Diet (30P / 40C / 30F)</span>
            <span>{result.targetCalories} kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-blue-600 font-medium">Protein (30%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.balancedMacros.proteinGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.balancedMacros.proteinCalories} kcal</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-amber-600 font-medium">Carbs (40%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.balancedMacros.carbGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.balancedMacros.carbCalories} kcal</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-emerald-600 font-medium">Fats (30%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.balancedMacros.fatGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.balancedMacros.fatCalories} kcal</div>
            </div>
          </div>
        </div>

        {/* High Protein Split */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-purple-500" />
              Fitness & Muscle Sparing (35P / 35C / 30F)
            </span>
            <span>{result.targetCalories} kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-purple-600 font-medium">Protein (35%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.highProteinMacros.proteinGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.highProteinMacros.proteinCalories} kcal</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-amber-600 font-medium">Carbs (35%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.highProteinMacros.carbGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.highProteinMacros.carbCalories} kcal</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
              <div className="text-xs text-emerald-600 font-medium">Fats (30%)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.highProteinMacros.fatGrams}g
              </div>
              <div className="text-[10px] text-slate-400">{result.highProteinMacros.fatCalories} kcal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      title={calorieEngine.metadata.name}
      badge={calorieEngine.metadata.badge}
      description={calorieEngine.metadata.shortDescription}
      directAnswer={calorieEngine.metadata.directAnswer}
      inputsSlot={inputsSlot}
      resultsSlot={resultsSlot}
      formulaExplanationSlot={
        calorieEngine.metadata.formula ? (
          <FormulaExplanation
            formula={calorieEngine.metadata.formula.expression}
            variables={calorieEngine.metadata.formula.variables}
            steps={calorieEngine.metadata.formula.steps}
            notes={calorieEngine.metadata.formula.notes}
          />
        ) : undefined
      }
      faqSlot={<FAQSection faqs={calorieEngine.metadata.faqs} />}
      relatedCalculatorsSlot={
        <RelatedCalculators links={relatedLinks || defaultRelatedLinks} />
      }
    />
  );
};
