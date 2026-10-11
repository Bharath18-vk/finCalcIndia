import { describe, it, expect } from "vitest";
import {
  calculateCalories,
  calorieInputSchema,
  calorieEngine,
  defaultCalorieInputs,
} from "@/lib/calculators/calorie";
import { getCalculatorById } from "@/lib/calculators/registry";

describe("Calorie & Macro Calculator Engine (Batch 4)", () => {
  // Case 1: Golden Fixture — Standard Adult Male (Maintenance)
  it("calculates exact BMR, TDEE, and maintenance macros for standard male (28y, 70kg, 172cm)", () => {
    const result = calculateCalories({
      gender: "male",
      age: 28,
      weightKg: 70,
      heightCm: 172,
      activityLevel: "moderate",
      goal: "maintain",
    });

    // BMR = 10 * 70 + 6.25 * 172 - 5 * 28 + 5 = 700 + 1075 - 140 + 5 = 1640
    expect(result.bmr).toBe(1640);
    // TDEE = 1640 * 1.55 = 2542
    expect(result.tdee).toBe(2542);
    expect(result.targetCalories).toBe(2542);
    expect(result.dailyCalorieDelta).toBe(0);
    expect(result.weeklyWeightChangeKg).toBe(0);

    // Balanced macros: 30% P, 40% C, 30% F
    // P: 2542 * 0.3 = 763 cal / 4 = 191 g
    // C: 2542 * 0.4 = 1017 cal / 4 = 254 g
    // F: 2542 * 0.3 = 763 cal / 9 = 85 g
    expect(result.balancedMacros.proteinGrams).toBe(191);
    expect(result.balancedMacros.carbGrams).toBe(254);
    expect(result.balancedMacros.fatGrams).toBe(85);

    // Water intake: 70 * 0.033 = 2.31 -> 2.3 L
    expect(result.recommendedWaterLiters).toBe(2.3);
  });

  // Case 2: Golden Fixture — Female Fat Loss Goal
  it("calculates female BMR and deficit targets accurately (25y, 55kg, 160cm, moderate-loss)", () => {
    const result = calculateCalories({
      gender: "female",
      age: 25,
      weightKg: 55,
      heightCm: 160,
      activityLevel: "light",
      goal: "moderate-loss",
    });

    // BMR = 10 * 55 + 6.25 * 160 - 5 * 25 - 161 = 550 + 1000 - 125 - 161 = 1264
    expect(result.bmr).toBe(1264);
    // TDEE = 1264 * 1.375 = 1738
    expect(result.tdee).toBe(1738);
    // Deficit: 1738 - 500 = 1238
    expect(result.targetCalories).toBe(1238);
    expect(result.dailyCalorieDelta).toBe(-500);
    expect(result.weeklyWeightChangeKg).toBe(-0.5);
    expect(result.recommendedWaterLiters).toBe(1.8);
  });

  // Case 3: Minimum Safe Calorie Floor Constraint
  it("enforces safe calorie intake floor (1200 kcal female, 1500 kcal male)", () => {
    // Sedentary petite female with extreme deficit: 1200 kcal floor
    const femaleLow = calculateCalories({
      gender: "female",
      age: 40,
      weightKg: 45,
      heightCm: 150,
      activityLevel: "sedentary",
      goal: "extreme-loss", // -1000 kcal
    });
    // BMR = 450 + 937.5 - 200 - 161 = 1026.5 -> 1027
    // TDEE = 1027 * 1.2 = 1232
    // Raw target = 1232 - 1000 = 232 kcal -> Floor enforced at 1200
    expect(femaleLow.targetCalories).toBe(1200);

    // Sedentary male with extreme deficit: 1500 kcal floor
    const maleLow = calculateCalories({
      gender: "male",
      age: 50,
      weightKg: 60,
      heightCm: 160,
      activityLevel: "sedentary",
      goal: "extreme-loss", // -1000 kcal
    });
    // Raw target would be below 1500 -> Floor enforced at 1500
    expect(maleLow.targetCalories).toBe(1500);
  });

  // Case 4: Muscle Building Surplus & Activity Variations
  it("calculates calorie surplus for muscle gain and very active training", () => {
    const athlete = calculateCalories({
      gender: "male",
      age: 22,
      weightKg: 75,
      heightCm: 180,
      activityLevel: "very-active", // 1.9 multiplier
      goal: "moderate-gain", // +500 kcal
    });

    // BMR = 750 + 1125 - 110 + 5 = 1770
    expect(athlete.bmr).toBe(1770);
    // TDEE = 1770 * 1.9 = 3363
    expect(athlete.tdee).toBe(3363);
    // Target = 3363 + 500 = 3863
    expect(athlete.targetCalories).toBe(3863);
    expect(athlete.dailyCalorieDelta).toBe(500);
    expect(athlete.weeklyWeightChangeKg).toBe(0.5);

    // High protein macros check (35% P, 35% C, 30% F)
    // 3863 * 0.35 = 1352 cal / 4 = 338 g protein
    expect(athlete.highProteinMacros.proteinGrams).toBe(338);
    expect(athlete.highProteinMacros.carbGrams).toBe(338);
    expect(athlete.highProteinMacros.fatGrams).toBe(129);
  });

  // Case 5: Input Validation & Boundary Errors
  it("validates boundary inputs via Zod schema", () => {
    const valid = calorieInputSchema.safeParse({
      gender: "male",
      age: 25,
      weightKg: 65,
      heightCm: 170,
      activityLevel: "moderate",
      goal: "maintain",
    });
    expect(valid.success).toBe(true);

    const invalidAge = calorieInputSchema.safeParse({
      ...defaultCalorieInputs,
      age: 12, // Min is 15
    });
    expect(invalidAge.success).toBe(false);

    const invalidWeight = calorieInputSchema.safeParse({
      ...defaultCalorieInputs,
      weightKg: 20, // Min is 30
    });
    expect(invalidWeight.success).toBe(false);

    const invalidHeight = calorieInputSchema.safeParse({
      ...defaultCalorieInputs,
      heightCm: 80, // Min is 100
    });
    expect(invalidHeight.success).toBe(false);
  });

  // Case 6: Edge Handling with Non-finite Inputs
  it("safely handles non-finite fallback inputs without throwing NaN", () => {
    const result = calculateCalories({
      gender: "female",
      age: NaN,
      weightKg: Infinity,
      heightCm: -100,
      activityLevel: "sedentary",
      goal: "maintain",
    });

    expect(Number.isFinite(result.bmr)).toBe(true);
    expect(Number.isFinite(result.tdee)).toBe(true);
    expect(Number.isFinite(result.targetCalories)).toBe(true);
    expect(result.targetCalories).toBeGreaterThanOrEqual(1200);
  });

  // Case 7: Registry & Engine Contract Compliance
  it("is registered in central calculator registry under ID 'calorie'", () => {
    const registered = getCalculatorById("calorie");
    expect(registered).toBeDefined();
    expect(registered?.id).toBe("calorie");
    expect(registered?.metadata.name).toBe("Calorie & Macro Calculator");
    expect(registered?.metadata.category).toBe("health");
    expect(registered?.metadata.route).toBe("/calorie-calculator");
  });
});
