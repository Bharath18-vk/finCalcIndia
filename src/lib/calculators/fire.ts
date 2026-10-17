import { z } from "zod";
import { CalculatorEngine, CalculatorMetadata, CalculatorField } from "./types";
import { registerCalculator } from "./registry";

export interface FireInput {
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancyAge: number;
  monthlyExpenses: number; // Current living expenses in ₹
  currentNetWorth: number; // Current liquid/invested assets in ₹
  monthlyInvestment: number; // Monthly SIP / investment into portfolio in ₹
  annualInvestmentStepUpPercent?: number; // e.g. 5% or 10% annual increase in SIP
  expectedPreRetirementReturn?: number; // e.g. 12.0%
  expectedPostRetirementReturn?: number; // e.g. 8.5%
  inflationRate?: number; // e.g. 6.0%
  swrPercent?: number; // Safe Withdrawal Rate % e.g. 3.5%
}

export interface FireScheduleItem {
  age: number;
  year: number;
  annualExpenseAtAge: number;
  fireTargetCorpusAtAge: number;
  portfolioBalance: number;
  isFireAchieved: boolean;
}

export interface FireTiers {
  leanFireCorpus: number; // 75% frugal expenses
  regularFireCorpus: number; // 100% baseline lifestyle
  fatFireCorpus: number; // 135% luxury/travel cushion
  coastFireToday: number; // Capital required today to coast without further investments
  baristaFireCorpus: number; // 50% expenses covered by part-time/consulting
}

export interface FireResult {
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancyAge: number;
  yearsToTargetRetirement: number;
  retirementDurationYears: number;
  futureMonthlyExpensesAtRetirement: number;
  futureAnnualExpensesAtRetirement: number;
  targetFireCorpus: number;
  projectedNetWorthAtRetirement: number;
  fireSurplusOrDeficit: number;
  isFireAchievableByTargetAge: boolean;
  projectedFireAge: number;
  swrPercent: number;
  realReturnPostRetirement: number;
  portfolioLongevityYears: number;
  tiers: FireTiers;
  schedule: FireScheduleItem[];
  recommendationText: string;
}

export const fireInputSchema = z
  .object({
    currentAge: z
      .number({ invalid_type_error: "Current age must be a number" })
      .int("Age must be whole years")
      .min(18, "Current age must be at least 18")
      .max(80, "Current age cannot exceed 80"),
    targetRetirementAge: z
      .number({ invalid_type_error: "Retirement age must be a number" })
      .int("Retirement age must be whole years")
      .min(25, "Target age must be at least 25")
      .max(90, "Target age cannot exceed 90"),
    lifeExpectancyAge: z
      .number({ invalid_type_error: "Life expectancy must be a number" })
      .int("Life expectancy must be whole years")
      .min(60, "Life expectancy must be at least 60")
      .max(105, "Life expectancy cannot exceed 105"),
    monthlyExpenses: z
      .number({ invalid_type_error: "Monthly expenses must be a number" })
      .positive("Monthly expenses must be greater than zero")
      .max(10000000, "Expenses cannot exceed ₹1 Crore/month"),
    currentNetWorth: z
      .number({ invalid_type_error: "Current net worth must be a number" })
      .min(0, "Current net worth cannot be negative")
      .max(1000000000, "Net worth cannot exceed ₹100 Crores"),
    monthlyInvestment: z
      .number({ invalid_type_error: "Monthly investment must be a number" })
      .min(0, "Monthly investment cannot be negative")
      .max(50000000, "Monthly investment cannot exceed ₹5 Crores"),
    annualInvestmentStepUpPercent: z
      .number({ invalid_type_error: "Step-up must be a number" })
      .min(0)
      .max(30, "Step-up cannot exceed 30%")
      .default(5),
    expectedPreRetirementReturn: z
      .number({ invalid_type_error: "Pre-retirement return must be a number" })
      .min(1)
      .max(25, "Return cannot exceed 25%")
      .default(12.0),
    expectedPostRetirementReturn: z
      .number({ invalid_type_error: "Post-retirement return must be a number" })
      .min(1)
      .max(20, "Return cannot exceed 20%")
      .default(8.5),
    inflationRate: z
      .number({ invalid_type_error: "Inflation rate must be a number" })
      .min(1)
      .max(15, "Inflation cannot exceed 15%")
      .default(6.0),
    swrPercent: z
      .number({ invalid_type_error: "SWR must be a number" })
      .min(2.0, "SWR must be at least 2.0%")
      .max(6.0, "SWR cannot exceed 6.0%")
      .default(3.5),
  })
  .refine((data) => data.targetRetirementAge > data.currentAge, {
    message: "Target retirement age must be greater than current age",
    path: ["targetRetirementAge"],
  })
  .refine((data) => data.lifeExpectancyAge > data.targetRetirementAge, {
    message: "Life expectancy must be greater than target retirement age",
    path: ["lifeExpectancyAge"],
  });

export const defaultFireInputs: FireInput = {
  currentAge: 28,
  targetRetirementAge: 45,
  lifeExpectancyAge: 85,
  monthlyExpenses: 60000,
  currentNetWorth: 1500000,
  monthlyInvestment: 50000,
  annualInvestmentStepUpPercent: 5,
  expectedPreRetirementReturn: 12.0,
  expectedPostRetirementReturn: 8.5,
  inflationRate: 6.0,
  swrPercent: 3.5,
};

export function calculateFire(input: FireInput): FireResult {
  const {
    currentAge,
    targetRetirementAge,
    lifeExpectancyAge,
    monthlyExpenses,
    currentNetWorth,
    monthlyInvestment,
    annualInvestmentStepUpPercent = 5,
    expectedPreRetirementReturn = 12.0,
    expectedPostRetirementReturn = 8.5,
    inflationRate = 6.0,
    swrPercent = 3.5,
  } = input;

  const safeCurrentAge = Math.max(18, currentAge || 18);
  const safeTargetRetirementAge = Math.max(safeCurrentAge + 1, targetRetirementAge || safeCurrentAge + 1);
  const safeLifeExpectancyAge = Math.max(safeTargetRetirementAge + 1, lifeExpectancyAge || 85);

  const yearsToRetirement = safeTargetRetirementAge - safeCurrentAge;
  const retirementDurationYears = safeLifeExpectancyAge - safeTargetRetirementAge;

  const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const futureMonthlyExpensesAtRetirement = Math.round(monthlyExpenses * inflationFactor);
  const futureAnnualExpensesAtRetirement = futureMonthlyExpensesAtRetirement * 12;

  // SWR based FIRE target: Corpus = Annual Expense / SWR
  const safeSwr = Math.max(0.5, swrPercent || 3.5);
  const targetFireCorpus = Math.round(
    futureAnnualExpensesAtRetirement / (safeSwr / 100)
  );

  // Month-by-month accumulation schedule up to age 100 or when FIRE is reached
  const monthlyPreReturn = Math.pow(1 + expectedPreRetirementReturn / 100, 1 / 12) - 1;
  let balance = currentNetWorth;
  let currentMonthlySip = monthlyInvestment;
  let achievedAge = -1;

  const maxSimYears = 60;
  const schedule: FireScheduleItem[] = [];

  for (let y = 0; y <= maxSimYears; y++) {
    const age = safeCurrentAge + y;
    if (age > safeLifeExpectancyAge) break;

    const currentYearInflationFactor = Math.pow(1 + inflationRate / 100, y);
    const annualExpenseAtAge = Math.round(monthlyExpenses * 12 * currentYearInflationFactor);
    const fireTargetCorpusAtAge = Math.round(annualExpenseAtAge / (safeSwr / 100));

    const isAchieved = balance >= fireTargetCorpusAtAge;
    if (isAchieved && achievedAge === -1 && age >= safeCurrentAge) {
      achievedAge = age;
    }

    schedule.push({
      age,
      year: y,
      annualExpenseAtAge,
      fireTargetCorpusAtAge,
      portfolioBalance: Math.round(balance),
      isFireAchieved: isAchieved,
    });

    // Compound for next 12 months
    for (let m = 0; m < 12; m++) {
      balance = (balance + currentMonthlySip) * (1 + monthlyPreReturn);
    }
    currentMonthlySip = currentMonthlySip * (1 + annualInvestmentStepUpPercent / 100);
  }

  // Value at target retirement age
  const targetScheduleItem = schedule.find((s) => s.age === safeTargetRetirementAge);
  const projectedNetWorthAtRetirement = targetScheduleItem
    ? targetScheduleItem.portfolioBalance
    : Math.round(balance);

  const fireSurplusOrDeficit = projectedNetWorthAtRetirement - targetFireCorpus;
  const isFireAchievableByTargetAge = projectedNetWorthAtRetirement >= targetFireCorpus;
  const projectedFireAge = achievedAge !== -1 ? achievedAge : 100;

  // Real return post-retirement: (1 + r) / (1 + i) - 1
  const realReturnPostRetirement = Number(
    (
      ((1 + expectedPostRetirementReturn / 100) / (1 + inflationRate / 100) - 1) *
      100
    ).toFixed(2)
  );

  // Post-Retirement Portfolio Longevity Simulation
  let retirementCorpus = projectedNetWorthAtRetirement;
  let withdrawalYearExpense = futureAnnualExpensesAtRetirement;
  let longevityYears = 0;
  const postMonthlyReturn = Math.pow(1 + expectedPostRetirementReturn / 100, 1 / 12) - 1;

  for (let ry = 1; ry <= 70; ry++) {
    const monthlyWithdrawal = withdrawalYearExpense / 12;
    let depleted = false;

    for (let rm = 0; rm < 12; rm++) {
      if (retirementCorpus < monthlyWithdrawal) {
        depleted = true;
        break;
      }
      retirementCorpus = (retirementCorpus - monthlyWithdrawal) * (1 + postMonthlyReturn);
    }

    if (depleted) break;
    longevityYears = ry;
    withdrawalYearExpense *= 1 + inflationRate / 100;
  }

  // Tiers calculation
  const leanFireCorpus = Math.round(targetFireCorpus * 0.75);
  const regularFireCorpus = targetFireCorpus;
  const fatFireCorpus = Math.round(targetFireCorpus * 1.35);
  const baristaFireCorpus = Math.round(targetFireCorpus * 0.5);

  // Coast FIRE: Today's capital compounded at pre-retirement return without further additions
  const coastDiscountFactor = Math.pow(
    1 + expectedPreRetirementReturn / 100,
    yearsToRetirement
  );
  const coastFireToday = Math.round(targetFireCorpus / coastDiscountFactor);

  let recommendationText = "";
  if (isFireAchievableByTargetAge) {
    recommendationText = `Congratulations! Based on your current savings and investment trajectory, you are on track to achieve Financial Independence by age ${projectedFireAge}, ahead of or exactly at your goal of age ${targetRetirementAge}. You will have a projected surplus of ₹${Math.abs(
      Math.round(fireSurplusOrDeficit)
    ).toLocaleString("en-IN")}.`;
  } else {
    recommendationText = `You are currently facing a projected deficit of ₹${Math.abs(
      Math.round(fireSurplusOrDeficit)
    ).toLocaleString(
      "en-IN"
    )} by target retirement age ${targetRetirementAge}. To bridge this gap, consider stepping up your monthly investment, increasing your pre-retirement equity exposure, or planning for a Barista FIRE transition.`;
  }

  return {
    currentAge,
    targetRetirementAge,
    lifeExpectancyAge,
    yearsToTargetRetirement: yearsToRetirement,
    retirementDurationYears,
    futureMonthlyExpensesAtRetirement,
    futureAnnualExpensesAtRetirement,
    targetFireCorpus,
    projectedNetWorthAtRetirement,
    fireSurplusOrDeficit,
    isFireAchievableByTargetAge,
    projectedFireAge,
    swrPercent,
    realReturnPostRetirement,
    portfolioLongevityYears: longevityYears,
    tiers: {
      leanFireCorpus,
      regularFireCorpus,
      fatFireCorpus,
      coastFireToday,
      baristaFireCorpus,
    },
    schedule: schedule.slice(0, 35),
    recommendationText,
  };
}

export const fireFields: CalculatorField<FireInput>[] = [
  {
    name: "currentAge",
    label: "Current Age",
    type: "number",
    defaultValue: 28,
    min: 18,
    max: 75,
    unit: "years",
    step: 1,
  },
  {
    name: "targetRetirementAge",
    label: "Target Retirement Age",
    type: "number",
    defaultValue: 45,
    min: 25,
    max: 85,
    unit: "years",
    step: 1,
    presets: [
      { label: "Age 40 (Aggressive)", value: 40 },
      { label: "Age 45 (Moderate)", value: 45 },
      { label: "Age 50", value: 50 },
      { label: "Age 55", value: 55 },
    ],
  },
  {
    name: "monthlyExpenses",
    label: "Current Monthly Living Expenses",
    type: "currency",
    defaultValue: 60000,
    unit: "₹",
    min: 10000,
    max: 2000000,
    step: 5000,
    presets: [
      { label: "₹40,000", value: 40000 },
      { label: "₹60,000", value: 60000 },
      { label: "₹1,00,000", value: 100000 },
      { label: "₹1,50,000", value: 150000 },
    ],
  },
  {
    name: "currentNetWorth",
    label: "Current Invested Portfolio",
    type: "currency",
    defaultValue: 1500000,
    unit: "₹",
    min: 0,
    max: 100000000,
    step: 50000,
    presets: [
      { label: "₹5 Lakh", value: 500000 },
      { label: "₹15 Lakh", value: 1500000 },
      { label: "₹50 Lakh", value: 5000000 },
      { label: "₹1 Crore", value: 10000000 },
    ],
  },
  {
    name: "monthlyInvestment",
    label: "Monthly Investment (SIP)",
    type: "currency",
    defaultValue: 50000,
    unit: "₹",
    min: 0,
    max: 2000000,
    step: 5000,
    presets: [
      { label: "₹25,000", value: 25000 },
      { label: "₹50,000", value: 50000 },
      { label: "₹75,000", value: 75000 },
      { label: "₹1,00,000", value: 100000 },
    ],
  },
  {
    name: "annualInvestmentStepUpPercent",
    label: "Annual SIP Step-Up (%)",
    type: "percentage",
    defaultValue: 5,
    unit: "%",
    min: 0,
    max: 25,
    step: 1,
  },
  {
    name: "swrPercent",
    label: "Safe Withdrawal Rate (SWR %)",
    type: "percentage",
    defaultValue: 3.5,
    unit: "%",
    min: 2.5,
    max: 5.0,
    step: 0.25,
    presets: [
      { label: "3.0% (Ultra Conservative)", value: 3.0 },
      { label: "3.5% (Recommended for India)", value: 3.5 },
      { label: "4.0% (Trinity Rule)", value: 4.0 },
    ],
  },
];

export const fireMetadata: CalculatorMetadata = {
  id: "fire-calculator",
  name: "FIRE Calculator India (Financial Independence Retire Early)",
  shortDescription:
    "Calculate your exact FIRE corpus, years to financial freedom, and milestone targets across Lean FIRE, Fat FIRE, Coast FIRE, and Barista FIRE with realistic Indian inflation.",
  category: "finance",
  subcategory: "Retirement",
  route: "/fire-calculator",
  badge: "Retirement Independence",
  directAnswer:
    "Your FIRE number in India is calculated by projecting your current monthly expenses to your retirement age using inflation (typically 6% p.a.) and dividing the annual retirement expenses by a Safe Withdrawal Rate (SWR of 3.5% is recommended for India's 35+ year retirements, requiring roughly 28x to 30x your annual expenses).",
  keywords: [
    "fire calculator india",
    "financial independence retire early calculator",
    "coast fire calculator",
    "lean fire calculator india",
    "fat fire number calculator",
    "early retirement corpus calculator",
    "safe withdrawal rate india",
  ],
  formula: {
    expression: "FIRE Corpus = (Current Annual Expenses × (1 + i)^n) / SWR",
    variables: [
      { symbol: "Expenses", label: "Current Expenses", description: "Current annual living expenditure" },
      { symbol: "i", label: "Inflation", description: "Expected annual inflation rate (typically 6%)" },
      { symbol: "n", label: "Years to FIRE", description: "Target Retirement Age minus Current Age" },
      { symbol: "SWR", label: "Safe Withdrawal Rate", description: "3.5% recommended for long Indian retirements" },
    ],
    steps: [
      {
        label: "Future Annual Cost of Living",
        expression: "Future Expenses = Current Annual Expenses × (1 + Inflation)^Years",
        explanation: "Compounding expenses over the accumulation phase to reflect true purchasing power needs.",
      },
      {
        label: "Determine Required FIRE Number",
        expression: "FIRE Corpus = Future Annual Expenses / (SWR / 100)",
        explanation: "At a 3.5% Safe Withdrawal Rate, the corpus equals approximately 28.57 times annual expenses.",
      },
      {
        label: "Simulate Investment Accumulation",
        expression: "Future Net Worth = Initial Corpus × (1+r)^n + SIP Annuity with Annual Step-Up",
        explanation: "Compounding existing investments alongside increasing monthly SIP contributions.",
      },
      {
        label: "Calculate Coast & Alternative Tiers",
        expression: "Lean FIRE = 75% | Fat FIRE = 135% | Coast FIRE = Target / (1+r)^n",
        explanation: "Evaluate multi-tier lifestyle thresholds and milestone independence levels.",
      },
    ],
  },
  faqs: [
    {
      question: "Why is a 3.5% SWR recommended in India instead of the 4% US Trinity Study rule?",
      answer:
        "The original Trinity Study assumed a 30-year retirement in the United States with historical inflation of 3%. Early retirement in India often spans 40 to 50 years with higher structural CPI inflation (6-7%). A 3.25% to 3.5% SWR provides safety margin against sequence-of-returns risk and medical cost spikes.",
    },
    {
      question: "What is Coast FIRE?",
      answer:
        "Coast FIRE means having enough money invested today such that without saving another rupee, your existing corpus will compound on its own to reach your target retirement goal by your desired retirement age. You only need to earn enough to pay current living expenses.",
    },
    {
      question: "What is the difference between Lean FIRE and Fat FIRE?",
      answer:
        "Lean FIRE covers essential bare-bones living expenses (typically 70-75% of current expenses, assuming frugality and paid-off housing). Fat FIRE allows an abundant lifestyle with luxury travel and premium healthcare (typically 125-150% of current expenses).",
    },
    {
      question: "How does SIP step-up affect my time to achieve FIRE?",
      answer:
        "Increasing your monthly investment by 5% to 10% each year as your salary increases can cut down your time to financial independence by 4 to 8 years, significantly accelerating portfolio compounding.",
    },
  ],
  sources: [
    {
      name: "RBI Monetary Policy Inflation Framework",
      url: "https://www.rbi.org.in",
    },
    {
      name: "Trinity Study & Modern Safe Withdrawal Rate Research",
      url: "https://www.bogleheads.org",
    },
  ],
  version: {
    version: "1.0.0",
    effectiveFrom: "2024-01-01",
    lastReviewed: "2026-10-11",
    changelogNotes: "Initial release of the Indian FIRE Calculator with Lean, Fat, Coast, and Barista tiers.",
  },
};

export const fireEngine: CalculatorEngine<FireInput, FireResult> = {
  id: "fire-calculator",
  metadata: fireMetadata,
  schema: fireInputSchema as unknown as z.ZodType<FireInput>,
  defaultInputs: defaultFireInputs,
  fields: fireFields,
  calculate: calculateFire,
};

registerCalculator(fireEngine);
