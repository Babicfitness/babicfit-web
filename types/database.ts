export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  gender: 'male' | 'female' | null
  birth_year: number | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | null
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | null
  goal_calories: number | null
  goal_protein_g: number | null
  goal_carbs_g: number | null
  goal_fat_g: number | null
  onboarding_done: boolean
}

export type FoodCategory = {
  id: string
  slug: string
  name_sr: string
  sort_order: number
  icon: string | null
}

export type SystemFood = {
  id: string
  category_id: string
  name_sr: string
  search_name: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  unit_type: 'gram' | 'ml' | 'piece'
  unit_weight_g: number | null
}

export type UserFood = {
  id: string
  user_id: string
  category_id: string
  name_sr: string
  search_name: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  unit_type: 'gram' | 'ml' | 'piece'
  unit_weight_g: number | null
  created_at: string
  deleted_at: string | null
}

export type DailyLog = {
  id: string
  user_id: string
  log_date: string
  goal_calories: number
  goal_protein_g: number
  goal_carbs_g: number
  goal_fat_g: number
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
}

export type MealEntry = {
  id: string
  daily_log_id: string
  meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2'
  system_food_id: string | null
  user_food_id: string | null
  recipe_id: string | null
  quantity_value: number
  quantity_unit: string
  entry_calories: number
  entry_protein_g: number
  entry_carbs_g: number
  entry_fat_g: number
  food_name_snapshot: string
  sort_order: number
  created_at: string
  deleted_at: string | null
}

export type Recipe = {
  id: string
  user_id: string
  name: string
  servings: number
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  notes: string | null
  created_at: string
  deleted_at: string | null
}

export type RecipeItem = {
  id: string
  recipe_id: string
  system_food_id: string | null
  user_food_id: string | null
  quantity_value: number
  quantity_unit: string
  snapshot_kcal_per100: number
  snapshot_protein_per100: number
  snapshot_carbs_per100: number
  snapshot_fat_per100: number
  food_name_snapshot: string
  sort_order: number
}

// Unified food for UI use (system + user combined)
export type FoodItem = {
  id: string
  type: 'system' | 'user'
  name_sr: string
  search_name: string
  category_id: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  unit_type: 'gram' | 'ml' | 'piece'
  unit_weight_g: number | null
}
