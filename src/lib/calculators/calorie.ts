import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export type GenderType = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";
export type CalorieGoal = "maintain" | "mild-loss" | "moderate-loss" | "extreme-loss" | "mild-gain" | "moderate-gain";

export interface CalorieInput {
  gender: GenderType;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: CalorieGoal;
}

export interface MacroSplit {
  proteinGrams: number;
  proteinCalories: number;
  proteinPercent: number;
  carbGrams: number;
  carbCalories: number;
  carbPercent: number;
  fatGrams: number;
  fatCalories: number;
  fatPercent: number;
}

export interface CalorieResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Maintenance calories
  targetCalories: number; // Daily calorie goal
  dailyCalorieDelta: number; // +/- calories from maintenance
  weeklyWeightChangeKg: number; // estimated kg change per week
  goal: CalorieGoal;
  activityLevel: ActivityLevel;
  balancedMacros: MacroSplit; // 30P / 40C / 30F
  highProteinMacros: MacroSplit; // 35P / 35C / 30F
  recommendedWaterLiters: number;
}

export const calorieInputSchema = z.object({
  gender: z.enum(["male", "female"], {
    invalid_type_error: "Gender must be male or female",
  }),
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(15, "Age must be at least 15")
    .max(100, "Age cannot exceed 100"),
  weightKg: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight cannot exceed 300 kg"),
  heightCm: z
    .number({ invalid_type_error: "Height must be a number" })
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height cannot exceed 250 cm"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very-active"]),
  goal: z.enum(["maintain", "mild-loss", "moderate-loss", "extreme-loss", "mild-gain", "moderate-gain"]),
});

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Desk job, little/no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Hard exercise 6-7 days/week
  "very-active": 1.9, // Intense training / physical labor
};

const GOAL_DELTAS: Record<CalorieGoal, { calorieDelta: number; weeklyKg: number }> = {
  maintain: { calorieDelta: 0, weeklyKg: 0 },
  "mild-loss": { calorieDelta: -250, weeklyKg: -0.25 },
  "moderate-loss": { calorieDelta: -500, weeklyKg: -0.5 },
  "extreme-loss": { calorieDelta: -1000, weeklyKg: -1.0 },
  "mild-gain": { calorieDelta: 300, weeklyKg: 0.3 },
  "moderate-gain": { calorieDelta: 500, weeklyKg: 0.5 },
};

function calculateMacros(totalCalories: number, pPct: number, cPct: number, fPct: number): MacroSplit {
  const pCal = Math.round(totalCalories * (pPct / 100));
  const cCal = Math.round(totalCalories * (cPct / 100));
  const fCal = Math.round(totalCalories * (fPct / 100));

  return {
    proteinGrams: Math.round(pCal / 4),
    proteinCalories: pCal,
    proteinPercent: pPct,
    carbGrams: Math.round(cCal / 4),
    carbCalories: cCal,
    carbPercent: cPct,
    fatGrams: Math.round(fCal / 9),
    fatCalories: fCal,
    fatPercent: fPct,
  };
}

export function calculateCalories(input: CalorieInput): CalorieResult {
  const gender = input.gender === "female" ? "female" : "male";
  const age = Math.min(100, Math.max(15, Math.floor(isFinite(input.age) ? input.age : 28)));
  const weight = Math.min(300, Math.max(30, isFinite(input.weightKg) ? input.weightKg : 70));
  const height = Math.min(250, Math.max(100, isFinite(input.heightCm) ? input.heightCm : 172));
  const activityLevel = input.activityLevel || "sedentary";
  const goal = input.goal || "maintain";

  // Mifflin-St Jeor Equation
  let bmrRaw = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmrRaw += 5;
  } else {
    bmrRaw -= 161;
  }
  const bmr = Math.round(bmrRaw);

  const actMult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const tdee = Math.round(bmr * actMult);

  const { calorieDelta, weeklyKg } = GOAL_DELTAS[goal] || GOAL_DELTAS["maintain"];
  // Floor target calories at minimum safe threshold (1200 for women, 1500 for men)
  const safeFloor = gender === "female" ? 1200 : 1500;
  const targetCalories = Math.max(safeFloor, Math.round(tdee + calorieDelta));

  const balancedMacros = calculateMacros(targetCalories, 30, 40, 30);
  const highProteinMacros = calculateMacros(targetCalories, 35, 35, 30);

  // Recommended daily water: ~33ml per kg body weight
  const recommendedWaterLiters = Math.round((weight * 0.033) * 10) / 10;

  return {
    bmr,
    tdee,
    targetCalories,
    dailyCalorieDelta: calorieDelta,
    weeklyWeightChangeKg: weeklyKg,
    goal,
    activityLevel,
    balancedMacros,
    highProteinMacros,
    recommendedWaterLiters,
  };
}

export const defaultCalorieInputs: CalorieInput = {
  gender: "male",
  age: 28,
  weightKg: 70,
  heightCm: 172,
  activityLevel: "moderate",
  goal: "maintain",
};

const calorieFields: CalculatorField<CalorieInput>[] = [
  {
    name: "gender",
    label: "Biological Sex",
    type: "select",
    defaultValue: "male",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  {
    name: "age",
    label: "Age (Years)",
    type: "number",
    defaultValue: 28,
    min: 15,
    max: 100,
    step: 1,
  },
  {
    name: "weightKg",
    label: "Current Weight (kg)",
    type: "number",
    defaultValue: 70,
    min: 30,
    max: 300,
    step: 0.5,
    unit: "kg",
  },
  {
    name: "heightCm",
    label: "Height (cm)",
    type: "number",
    defaultValue: 172,
    min: 100,
    max: 250,
    step: 1,
    unit: "cm",
  },
  {
    name: "activityLevel",
    label: "Activity Level",
    type: "select",
    defaultValue: "moderate",
    options: [
      { label: "Sedentary (Little or no exercise, desk job)", value: "sedentary" },
      { label: "Light Exercise (1-3 days per week)", value: "light" },
      { label: "Moderate Exercise (3-5 days per week)", value: "moderate" },
      { label: "Active (Hard exercise 6-7 days per week)", value: "active" },
      { label: "Very Active (Physical job or intense athletic training)", value: "very-active" },
    ],
  },
  {
    name: "goal",
    label: "Fitness Goal",
    type: "select",
    defaultValue: "maintain",
    options: [
      { label: "Maintain Current Weight", value: "maintain" },
      { label: "Mild Weight Loss (-0.25 kg / week)", value: "mild-loss" },
      { label: "Moderate Weight Loss (-0.50 kg / week)", value: "moderate-loss" },
      { label: "Extreme Weight Loss (-1.00 kg / week)", value: "extreme-loss" },
      { label: "Mild Muscle Gain (+0.30 kg / week)", value: "mild-gain" },
      { label: "Moderate Muscle Gain (+0.50 kg / week)", value: "moderate-gain" },
    ],
  },
];

const calorieMetadata: CalculatorMetadata = {
  id: "calorie",
  name: "Calorie & Macro Calculator",
  route: "/calorie-calculator",
  category: "health",
  shortDescription:
    "Calculate Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and daily macro targets (protein, carbs, fats).",
  badge: "Mifflin-St Jeor Formula",
  directAnswer:
    "Your Basal Metabolic Rate (BMR) represents the calories burned at complete rest, while Total Daily Energy Expenditure (TDEE) accounts for daily physical activity. To lose 0.5 kg of fat per week, maintain a consistent 500 kcal daily deficit below your TDEE.",
  formula: {
    expression: "BMR (Mifflin-St Jeor) = (10 × Weight in kg) + (6.25 × Height in cm) - (5 × Age) + s  |  TDEE = BMR × Activity Factor",
    variables: [
      { symbol: "W", label: "Weight", description: "Body weight in kilograms (kg)" },
      { symbol: "H", label: "Height", description: "Height in centimeters (cm)" },
      { symbol: "A", label: "Age", description: "Age in completed years" },
      { symbol: "s", label: "Sex Constant", description: "Sex constant (+5 for biological men, -161 for biological women)" },
      { symbol: "F", label: "Activity Factor", description: "Multiplier from 1.2 (sedentary) to 1.9 (very active)" },
    ],
    steps: [
      { label: "Calculate BMR", expression: "(10 × W) + (6.25 × H) - (5 × A) + s", explanation: "Clinical Mifflin-St Jeor resting energy expenditure." },
      { label: "Multiply by Activity", expression: "TDEE = BMR × Activity Factor", explanation: "Total daily maintenance calories." },
      { label: "Apply Goal Delta", expression: "Target Calories = TDEE + Goal Delta", explanation: "Adjust for fat loss deficit or muscle surplus." },
    ],
    notes: [
      "1 kg of body fat contains approximately 7,700 kcal. A daily deficit of 500 kcal equals roughly 3,500 kcal per week (~0.45 to 0.5 kg fat loss).",
      "To prevent metabolic slowdown and loss of lean muscle mass, daily calorie intake should not fall below 1,200 kcal for women or 1,500 kcal for men.",
    ],
  },
  faqs: [
    {
      question: "What is the difference between BMR and TDEE?",
      answer:
        "BMR (Basal Metabolic Rate) is the minimum energy your body burns strictly to stay alive in a coma (breathing, cellular repair, heartbeat). TDEE (Total Daily Energy Expenditure) is your actual total calorie burn factoring in walking, exercise, work, and digestion.",
    },
    {
      question: "How many calories are in 1 gram of protein, carbs, and fat?",
      answer:
        "Protein provides 4 calories per gram, Carbohydrates provide 4 calories per gram, and Dietary Fat provides 9 calories per gram. Alcohol provides 7 calories per gram.",
    },
    {
      question: "How much protein should I eat per day in India?",
      answer:
        "For sedentary individuals, ICMR recommends at least 0.8g to 1.0g of protein per kg of body weight. For active individuals, fitness enthusiasts, or those in a calorie deficit, 1.4g to 2.0g of protein per kg of body weight helps preserve lean muscle mass.",
    },
    {
      question: "Why does weight loss plateau after a few months?",
      answer:
        "As your body weight drops, your BMR decreases (a 65kg body requires fewer calories to move than a 80kg body). Additionally, non-exercise activity thermogenesis (NEAT) unconsciously declines. Recalculating your TDEE every 4–6 kg of weight loss helps prevent plateaus.",
    },
  ],
  keywords: [
    "calorie calculator",
    "bmr calculator india",
    "tdee calculator",
    "macro calculator",
    "weight loss calorie calculator",
    "protein intake calculator",
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Clinical Mifflin-St Jeor BMR and macro calculations.",
  },
};

export const calorieEngine: CalculatorEngine<CalorieInput, CalorieResult> = {
  id: "calorie",
  metadata: calorieMetadata,
  schema: calorieInputSchema,
  defaultInputs: defaultCalorieInputs,
  fields: calorieFields,
  calculate: calculateCalories,
};

registerCalculator(calorieEngine);
