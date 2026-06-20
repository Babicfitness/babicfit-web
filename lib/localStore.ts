'use client'

// ── Types ──────────────────────────────────────────────────────
export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack1'

export type Profile = {
  first_name: string
  last_name: string
  gender: Gender
  birth_year: number
  height_cm: number
  weight_kg: number
  activity_level: ActivityLevel
  goal: Goal
  goal_calories: number
  goal_protein_g: number
  goal_carbs_g: number
  goal_fat_g: number
  onboarding_done: boolean
}

export type MealEntry = {
  id: string
  date: string
  meal_slot: MealSlot
  food_id: string
  food_name: string
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  created_at: string
}

export type UserFood = {
  id: string
  name: string
  category_id: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  created_at: string
}

export type RecipeItem = {
  food_id: string
  food_name: string
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export type Recipe = {
  id: string
  name: string
  servings: number
  items: RecipeItem[]
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  created_at: string
}

// ── Keys ───────────────────────────────────────────────────────
const KEYS = {
  profile:    'bf_profile',
  entries:    'bf_entries',
  userFoods:  'bf_user_foods',
  recipes:    'bf_recipes',
}

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') } catch { return null }
}

function set(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Profile ────────────────────────────────────────────────────
export function getProfile(): Profile | null {
  return get<Profile>(KEYS.profile)
}

export function saveProfile(profile: Profile) {
  set(KEYS.profile, profile)
}

// ── Meal entries ───────────────────────────────────────────────
export function getEntries(date: string): MealEntry[] {
  const all = get<MealEntry[]>(KEYS.entries) ?? []
  return all.filter(e => e.date === date)
}

export function addEntry(entry: Omit<MealEntry, 'id' | 'created_at'>): MealEntry {
  const all = get<MealEntry[]>(KEYS.entries) ?? []
  const newEntry: MealEntry = { ...entry, id: uid(), created_at: new Date().toISOString() }
  set(KEYS.entries, [...all, newEntry])
  return newEntry
}

export function removeEntry(id: string) {
  const all = get<MealEntry[]>(KEYS.entries) ?? []
  set(KEYS.entries, all.filter(e => e.id !== id))
}

// ── User foods ─────────────────────────────────────────────────
export function getUserFoods(): UserFood[] {
  return get<UserFood[]>(KEYS.userFoods) ?? []
}

export function addUserFood(food: Omit<UserFood, 'id' | 'created_at'>): UserFood {
  const all = getUserFoods()
  const newFood: UserFood = { ...food, id: uid(), created_at: new Date().toISOString() }
  set(KEYS.userFoods, [...all, newFood])
  return newFood
}

export function deleteUserFood(id: string) {
  set(KEYS.userFoods, getUserFoods().filter(f => f.id !== id))
}

// ── Recipes ────────────────────────────────────────────────────
export function getRecipes(): Recipe[] {
  return get<Recipe[]>(KEYS.recipes) ?? []
}

export function addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Recipe {
  const all = getRecipes()
  const newRecipe: Recipe = { ...recipe, id: uid(), created_at: new Date().toISOString() }
  set(KEYS.recipes, [...all, newRecipe])
  return newRecipe
}

export function deleteRecipe(id: string) {
  set(KEYS.recipes, getRecipes().filter(r => r.id !== id))
}

export function getRecipe(id: string): Recipe | null {
  return getRecipes().find(r => r.id === id) ?? null
}
