import { z } from "zod";
import {
  CalculatorEngine,
  CalculatorField,
  CalculatorMetadata,
} from "./types";
import { registerCalculator } from "./registry";

export type BmiUnit = "metric" | "imperial";
export type Gender = "unspecified" | "male" | "female";

export interface BmiInput {
  unit: BmiUnit;
  heightCm: number;
  weightKg: number;
  heightFt: number;
  heightIn: number;
  weightLbs: number;
  age?: number;
  gender?: Gender;
}

export interface WeightRange {
  minKg: number;
  maxKg: number;
  minLbs: number;
  maxLbs: number;
  formattedKg: string;
  formattedLbs: string;
}

export interface BmiCategoryInfo {
  category: string;
  description: string;
  color: string; // Tailwind color token
  isHealthy: boolean;
}

export interface BmiResult {
  bmi: number;
  bmiPrime: number;
  ponderalIndex: number;
  effectiveHeightCm: number;
  effectiveWeightKg: number;
  whoCategory: BmiCategoryInfo;
  asianIndianCategory: BmiCategoryInfo;
  whoHealthyRange: WeightRange;
  indianHealthyRange: WeightRange;
  weightDiffToWhoNormalKg: number; // 0 if in normal, negative if below, positive if above
  weightDiffToIndianNormalKg: number;
  steps: string[];
}

export const bmiInputSchema = z.object({
  unit: z.enum(["metric", "imperial"], {
    invalid_type_error: "Unit must be metric or imperial",
  }),
  heightCm: z
    .number({ invalid_type_error: "Height (cm) must be a number" })
    .min(50, "Height must be at least 50 cm")
    .max(280, "Height cannot exceed 280 cm"),
  weightKg: z
    .number({ invalid_type_error: "Weight (kg) must be a number" })
    .min(10, "Weight must be at least 10 kg")
    .max(500, "Weight cannot exceed 500 kg"),
  heightFt: z
    .number({ invalid_type_error: "Height (feet) must be a number" })
    .min(1, "Height must be at least 1 foot")
    .max(8, "Height cannot exceed 8 feet"),
  heightIn: z
    .number({ invalid_type_error: "Height (inches) must be a number" })
    .min(0, "Inches cannot be negative")
    .max(11.99, "Inches must be less than 12"),
  weightLbs: z
    .number({ invalid_type_error: "Weight (lbs) must be a number" })
    .min(20, "Weight must be at least 20 lbs")
    .max(1100, "Weight cannot exceed 1100 lbs"),
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .min(2, "Age must be at least 2 years")
    .max(120, "Age cannot exceed 120 years")
    .optional(),
  gender: z.enum(["unspecified", "male", "female"]).optional(),
});

export const defaultBmiInput: BmiInput = {
  unit: "metric",
  heightCm: 175,
  weightKg: 70,
  heightFt: 5,
  heightIn: 9,
  weightLbs: 154,
  age: 28,
  gender: "unspecified",
};

export function getWhoCategory(bmi: number): BmiCategoryInfo {
  if (bmi < 16.0) {
    return {
      category: "Severe Thinness",
      description: "Significantly below international healthy threshold.",
      color: "rose",
      isHealthy: false,
    };
  }
  if (bmi < 17.0) {
    return {
      category: "Moderate Thinness",
      description: "Moderately below international healthy threshold.",
      color: "amber",
      isHealthy: false,
    };
  }
  if (bmi < 18.5) {
    return {
      category: "Mild Thinness (Underweight)",
      description: "Slightly below international healthy range.",
      color: "amber",
      isHealthy: false,
    };
  }
  if (bmi < 25.0) {
    return {
      category: "Normal Weight",
      description: "Within optimal international healthy BMI range.",
      color: "emerald",
      isHealthy: true,
    };
  }
  if (bmi < 30.0) {
    return {
      category: "Overweight (Pre-obese)",
      description: "Elevated risk of cardio-metabolic conditions.",
      color: "amber",
      isHealthy: false,
    };
  }
  if (bmi < 35.0) {
    return {
      category: "Obese Class I",
      description: "Moderate obesity requiring lifestyle modification.",
      color: "rose",
      isHealthy: false,
    };
  }
  if (bmi < 40.0) {
    return {
      category: "Obese Class II",
      description: "Severe obesity with high health risk.",
      color: "rose",
      isHealthy: false,
    };
  }
  return {
    category: "Obese Class III",
    description: "Very severe (morbid) obesity.",
    color: "rose",
    isHealthy: false,
  };
}

export function getAsianIndianCategory(bmi: number): BmiCategoryInfo {
  if (bmi < 18.0) {
    return {
      category: "Underweight",
      description: "Below the Indian consensus healthy threshold (< 18.0).",
      color: "amber",
      isHealthy: false,
    };
  }
  if (bmi < 23.0) {
    return {
      category: "Normal Weight",
      description: "Optimal healthy range for Asian Indians (18.0 – 22.9).",
      color: "emerald",
      isHealthy: true,
    };
  }
  if (bmi < 25.0) {
    return {
      category: "Overweight",
      description: "Pre-obese cutoff for South Asians (23.0 – 24.9).",
      color: "amber",
      isHealthy: false,
    };
  }
  return {
    category: "Obese",
    description: "Obesity cutoff for South Asians (≥ 25.0 per ICMR guidelines).",
    color: "rose",
    isHealthy: false,
  };
}

/**
 * Pure calculation engine for BMI, Ponderal Index, WHO & Asian-Indian Cutoffs
 */
export function calculateBmi(input: BmiInput): BmiResult {
  let heightMeters = 0;
  let weightKg = 0;

  if (input.unit === "imperial") {
    const totalInches = (input.heightFt || 0) * 12 + (input.heightIn || 0);
    heightMeters = totalInches * 0.0254;
    weightKg = (input.weightLbs || 0) * 0.45359237;
  } else {
    heightMeters = (input.heightCm || 0) / 100;
    weightKg = input.weightKg || 0;
  }

  if (heightMeters <= 0 || weightKg <= 0) {
    const emptyRange: WeightRange = {
      minKg: 0,
      maxKg: 0,
      minLbs: 0,
      maxLbs: 0,
      formattedKg: "0 kg",
      formattedLbs: "0 lbs",
    };
    const emptyCategory: BmiCategoryInfo = {
      category: "Invalid Input",
      description: "Height and weight must be positive.",
      color: "slate",
      isHealthy: false,
    };
    return {
      bmi: 0,
      bmiPrime: 0,
      ponderalIndex: 0,
      effectiveHeightCm: 0,
      effectiveWeightKg: 0,
      whoCategory: emptyCategory,
      asianIndianCategory: emptyCategory,
      whoHealthyRange: emptyRange,
      indianHealthyRange: emptyRange,
      weightDiffToWhoNormalKg: 0,
      weightDiffToIndianNormalKg: 0,
      steps: ["Invalid zero or negative height/weight."],
    };
  }

  const rawBmi = weightKg / (heightMeters * heightMeters);
  const bmi = Math.round(rawBmi * 10) / 10;
  const bmiPrime = Math.round((bmi / 25.0) * 100) / 100;
  const ponderalIndex = Math.round((weightKg / Math.pow(heightMeters, 3)) * 10) / 10;

  const whoCategory = getWhoCategory(bmi);
  const asianIndianCategory = getAsianIndianCategory(bmi);

  // WHO Healthy Weight Range (BMI 18.5 – 24.9)
  const whoMinKg = Math.round(18.5 * heightMeters * heightMeters * 10) / 10;
  const whoMaxKg = Math.round(24.9 * heightMeters * heightMeters * 10) / 10;
  const whoHealthyRange: WeightRange = {
    minKg: whoMinKg,
    maxKg: whoMaxKg,
    minLbs: Math.round(whoMinKg * 2.20462 * 10) / 10,
    maxLbs: Math.round(whoMaxKg * 2.20462 * 10) / 10,
    formattedKg: `${whoMinKg} – ${whoMaxKg} kg`,
    formattedLbs: `${Math.round(whoMinKg * 2.20462)} – ${Math.round(whoMaxKg * 2.20462)} lbs`,
  };

  // Indian Healthy Weight Range (BMI 18.0 – 22.9)
  const indMinKg = Math.round(18.0 * heightMeters * heightMeters * 10) / 10;
  const indMaxKg = Math.round(22.9 * heightMeters * heightMeters * 10) / 10;
  const indianHealthyRange: WeightRange = {
    minKg: indMinKg,
    maxKg: indMaxKg,
    minLbs: Math.round(indMinKg * 2.20462 * 10) / 10,
    maxLbs: Math.round(indMaxKg * 2.20462 * 10) / 10,
    formattedKg: `${indMinKg} – ${indMaxKg} kg`,
    formattedLbs: `${Math.round(indMinKg * 2.20462)} – ${Math.round(indMaxKg * 2.20462)} lbs`,
  };

  // Weight Difference
  let weightDiffToWhoNormalKg = 0;
  if (weightKg < whoMinKg) {
    weightDiffToWhoNormalKg = Math.round((weightKg - whoMinKg) * 10) / 10;
  } else if (weightKg > whoMaxKg) {
    weightDiffToWhoNormalKg = Math.round((weightKg - whoMaxKg) * 10) / 10;
  }

  let weightDiffToIndianNormalKg = 0;
  if (weightKg < indMinKg) {
    weightDiffToIndianNormalKg = Math.round((weightKg - indMinKg) * 10) / 10;
  } else if (weightKg > indMaxKg) {
    weightDiffToIndianNormalKg = Math.round((weightKg - indMaxKg) * 10) / 10;
  }

  const effectiveHeightCm = Math.round(heightMeters * 100 * 10) / 10;
  const effectiveWeightKg = Math.round(weightKg * 10) / 10;

  const steps = [
    `Height: ${effectiveHeightCm} cm (${heightMeters.toFixed(2)} m), Weight: ${effectiveWeightKg} kg`,
    `BMI Formula: Weight (kg) / [Height (m)]² = ${effectiveWeightKg} / (${heightMeters.toFixed(2)})² = ${bmi} kg/m²`,
    `WHO Standard Category: ${whoCategory.category} (Healthy: ${whoHealthyRange.formattedKg})`,
    `Asian-Indian (ICMR) Category: ${asianIndianCategory.category} (Healthy: ${indianHealthyRange.formattedKg})`,
    `BMI Prime: ${bmiPrime} (Ratio to upper normal limit of 25)`,
    `Ponderal Index: ${ponderalIndex} kg/m³`,
  ];

  return {
    bmi,
    bmiPrime,
    ponderalIndex,
    effectiveHeightCm,
    effectiveWeightKg,
    whoCategory,
    asianIndianCategory,
    whoHealthyRange,
    indianHealthyRange,
    weightDiffToWhoNormalKg,
    weightDiffToIndianNormalKg,
    steps,
  };
}

export const bmiFields: CalculatorField<BmiInput>[] = [
  {
    name: "unit",
    label: "Measurement System",
    type: "select",
    defaultValue: "metric",
    options: [
      { label: "Metric (cm, kg)", value: "metric" },
      { label: "Imperial (ft/in, lbs)", value: "imperial" },
    ],
  },
  {
    name: "heightCm",
    label: "Height (cm)",
    type: "number",
    defaultValue: 175,
    min: 50,
    max: 280,
    step: 1,
  },
  {
    name: "weightKg",
    label: "Weight (kg)",
    type: "number",
    defaultValue: 70,
    min: 10,
    max: 500,
    step: 0.5,
  },
  {
    name: "heightFt",
    label: "Height (Feet)",
    type: "number",
    defaultValue: 5,
    min: 1,
    max: 8,
    step: 1,
  },
  {
    name: "heightIn",
    label: "Height (Inches)",
    type: "number",
    defaultValue: 9,
    min: 0,
    max: 11,
    step: 1,
  },
  {
    name: "weightLbs",
    label: "Weight (lbs)",
    type: "number",
    defaultValue: 154,
    min: 20,
    max: 1100,
    step: 1,
  },
];

export const bmiMetadata: CalculatorMetadata = {
  id: "bmi",
  name: "BMI Calculator",
  shortDescription:
    "Calculate Body Mass Index (BMI) online with both WHO International and Asian-Indian (ICMR) consensus standards, healthy weight range, and BMI Prime.",
  category: "health",
  subcategory: "wellness",
  route: "/bmi-calculator",
  badge: "Health & Wellness",
  directAnswer:
    "Body Mass Index (BMI) is calculated as Weight (in kg) divided by Height squared (in meters). For instance, a person weighing 70 kg and measuring 175 cm (1.75 m) has a BMI of 22.9 kg/m², which falls into the Normal Weight category under both WHO and Asian-Indian guidelines.",
  keywords: [
    "bmi calculator",
    "body mass index calculator",
    "bmi calculator india",
    "icmr bmi calculator",
    "bmi prime calculator",
    "healthy weight calculator",
    "ideal weight calculator",
  ],
  formula: {
    expression: "\\text{BMI} = \\frac{\\text{Weight (kg)}}{[\\text{Height (m)}]^2}",
    variables: [
      { symbol: "\\text{BMI}", label: "Body Mass Index", description: "Body mass divided by square of height (kg/m²)" },
      { symbol: "\\text{Weight}", label: "Weight", description: "Body weight in kilograms" },
      { symbol: "\\text{Height}", label: "Height", description: "Stature in meters" },
      { symbol: "\\text{BMI Prime}", label: "BMI Prime", description: "Ratio of individual BMI to the upper normal threshold of 25" },
    ],
    steps: [
      { label: "Convert Height to Meters", expression: "h_m = \\frac{\\text{Height (cm)}}{100}", explanation: "Convert stature from cm or feet/inches to meters." },
      { label: "Square Height", expression: "(h_m)^2", explanation: "Compute height squared." },
      { label: "Compute BMI", expression: "\\frac{w_{kg}}{(h_m)^2}", explanation: "Divide body weight in kg by height squared." },
    ],
    notes: [
      "Asian Indians have higher body fat and metabolic risk at lower BMIs; ICMR guidelines classify BMI ≥ 23.0 as Overweight and ≥ 25.0 as Obese.",
      "BMI is a screening tool, not a diagnostic measure of body fat percentage or muscularity.",
    ],
  },
  faqs: [
    {
      question: "Why does FinCalc India show two different BMI categories (WHO vs Asian-Indian)?",
      answer:
        "Clinical research documented by the Indian Council of Medical Research (ICMR) and the Association of Physicians of India reveals that South Asians carry higher abdominal visceral fat and face increased risk of type 2 diabetes and cardiovascular disease at lower BMIs. Therefore, the Indian cutoff for normal weight is 18.0–22.9 kg/m², compared to 18.5–24.9 kg/m² internationally.",
    },
    {
      question: "What is BMI Prime?",
      answer:
        "BMI Prime is the ratio of your calculated BMI to the upper limit of normal BMI (25.0). A BMI Prime under 0.74 indicates underweight, between 0.74 and 0.99 is normal, between 1.0 and 1.19 is overweight, and 1.20 or greater indicates obesity.",
    },
    {
      question: "What is my ideal healthy weight range?",
      answer:
        "For your specific height, your healthy weight range under Indian guidelines corresponds to a BMI between 18.0 and 22.9 kg/m², and under WHO standards between 18.5 and 24.9 kg/m².",
    },
    {
      question: "Does BMI apply equally to athletes and bodybuilders?",
      answer:
        "No. BMI does not differentiate between lean muscle mass and adipose fat tissue. Muscular athletes often register as 'Overweight' or 'Obese' despite possessing low body fat percentages.",
    },
  ],
  version: {
    version: "1.0.0",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release under CalculatorEngine contract with Asian-Indian cutoffs.",
  },
};

export const bmiEngine: CalculatorEngine<BmiInput, BmiResult> = {
  id: "bmi",
  metadata: bmiMetadata,
  schema: bmiInputSchema,
  defaultInputs: defaultBmiInput,
  fields: bmiFields,
  calculate: calculateBmi,
  formatResult: (result: BmiResult) => {
    return {
      raw: result,
      primary: {
        key: "bmi",
        label: "Your Body Mass Index (BMI)",
        value: result.bmi,
        formattedValue: `${result.bmi} kg/m²`,
        subtext: `Indian (ICMR): ${result.asianIndianCategory.category} | WHO: ${result.whoCategory.category}`,
        highlight: true,
      },
      secondary: [
        {
          key: "indianRange",
          label: "Healthy Range (Indian ICMR)",
          value: result.indianHealthyRange.maxKg,
          formattedValue: result.indianHealthyRange.formattedKg,
        },
        {
          key: "whoRange",
          label: "Healthy Range (WHO Global)",
          value: result.whoHealthyRange.maxKg,
          formattedValue: result.whoHealthyRange.formattedKg,
        },
        {
          key: "bmiPrime",
          label: "BMI Prime",
          value: result.bmiPrime,
          formattedValue: `${result.bmiPrime}`,
        },
        {
          key: "ponderalIndex",
          label: "Ponderal Index",
          value: result.ponderalIndex,
          formattedValue: `${result.ponderalIndex} kg/m³`,
        },
      ],
      summaryText: `Your BMI is ${result.bmi} kg/m². According to Asian-Indian consensus guidelines, this is classified as ${result.asianIndianCategory.category}. Your ideal healthy weight range is ${result.indianHealthyRange.formattedKg}.`,
    };
  },
};

registerCalculator(bmiEngine);
