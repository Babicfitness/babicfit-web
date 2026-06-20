// Copied verbatim from Expo src/lib/calculations.ts — pure TypeScript, no dependencies.

export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle'

export interface MacroTargets {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
}

const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  lose_weight: -400,
  maintain: 0,
  gain_muscle: +300,
}

const MACRO_SPLIT: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain:    { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
}

export function calcBMR(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return gender === 'male' ? base + 5 : base - 161
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activityLevel]
}

export function calcDailyCalories(tdee: number, goal: Goal): number {
  return Math.round(tdee + GOAL_ADJUSTMENT_KCAL[goal])
}

export function calcMacros(dailyCalories: number, goal: Goal): MacroTargets {
  const split = MACRO_SPLIT[goal]
  return {
    calories:  dailyCalories,
    protein_g: Math.round((dailyCalories * split.protein) / 4),
    carbs_g:   Math.round((dailyCalories * split.carbs) / 4),
    fat_g:     Math.round((dailyCalories * split.fat) / 9),
  }
}

export function calcUserTargets(params: {
  weightKg: number
  heightCm: number
  birthYear: number
  gender: Gender
  activityLevel: ActivityLevel
  goal: Goal
}): MacroTargets {
  const ageYears = new Date().getFullYear() - params.birthYear
  const bmr      = calcBMR(params.weightKg, params.heightCm, ageYears, params.gender)
  const tdee     = calcTDEE(bmr, params.activityLevel)
  const calories = calcDailyCalories(tdee, params.goal)
  return calcMacros(calories, params.goal)
}

export function calcEntryMacros(
  food: { calories_kcal: number; protein_g: number; carbs_g: number; fat_g: number },
  quantityGrams: number,
) {
  const factor = quantityGrams / 100
  return {
    calories:  Math.round(food.calories_kcal * factor * 10) / 10,
    protein_g: Math.round(food.protein_g * factor * 10) / 10,
    carbs_g:   Math.round(food.carbs_g * factor * 10) / 10,
    fat_g:     Math.round(food.fat_g * factor * 10) / 10,
  }
}

export function birthYearFromAge(age: number): number {
  return new Date().getFullYear() - age
}
