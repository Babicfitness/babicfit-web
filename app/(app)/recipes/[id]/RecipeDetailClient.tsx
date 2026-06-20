'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Recipe, RecipeItem } from '@/types/database'

type Props = {
  recipe: Recipe
  items: RecipeItem[]
}

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack1'

const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Doručak', lunch: 'Ručak', dinner: 'Večera', snack1: 'Užina',
}

export default function RecipeDetailClient({ recipe, items }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('breakfast')

  const perServing = {
    calories:  Math.round(recipe.total_calories  / recipe.servings),
    protein_g: Math.round(recipe.total_protein_g / recipe.servings),
    carbs_g:   Math.round(recipe.total_carbs_g   / recipe.servings),
    fat_g:     Math.round(recipe.total_fat_g     / recipe.servings),
  }

  async function handleDelete() {
    if (!confirm('Obrisati recept?')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('recipes').update({ deleted_at: new Date().toISOString() }).eq('id', recipe.id)
    router.push('/recipes')
  }

  async function addToToday() {
    setAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAdding(false); return }

    const today = new Date().toISOString().split('T')[0]
    let { data: log } = await supabase.from('daily_logs').select('id').eq('user_id', user.id).eq('log_date', today).single()

    if (!log) {
      const { data: profile } = await supabase.from('profiles').select('goal_calories,goal_protein_g,goal_carbs_g,goal_fat_g').eq('id', user.id).single()
      const { data: newLog } = await supabase.from('daily_logs').insert({
        user_id: user.id, log_date: today,
        goal_calories: profile?.goal_calories ?? 0, goal_protein_g: profile?.goal_protein_g ?? 0,
        goal_carbs_g: profile?.goal_carbs_g ?? 0, goal_fat_g: profile?.goal_fat_g ?? 0,
      }).select('id').single()
      log = newLog
    }

    if (!log) { setAdding(false); return }

    await supabase.from('meal_entries').insert({
      daily_log_id:       log.id,
      meal_slot:          selectedSlot,
      recipe_id:          recipe.id,
      system_food_id:     null,
      user_food_id:       null,
      quantity_value:     1,
      quantity_unit:      'porcija',
      entry_calories:     perServing.calories,
      entry_protein_g:    perServing.protein_g,
      entry_carbs_g:      perServing.carbs_g,
      entry_fat_g:        perServing.fat_g,
      food_name_snapshot: recipe.name,
      sort_order:         0,
    })

    // Update log totals
    const { data: allEntries } = await supabase.from('meal_entries').select('entry_calories,entry_protein_g,entry_carbs_g,entry_fat_g').eq('daily_log_id', log.id).is('deleted_at', null)
    if (allEntries) {
      const t = allEntries.reduce((acc, e) => ({
        calories: acc.calories + e.entry_calories, protein_g: acc.protein_g + e.entry_protein_g,
        carbs_g: acc.carbs_g + e.entry_carbs_g, fat_g: acc.fat_g + e.entry_fat_g,
      }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
      await supabase.from('daily_logs').update({ total_calories: t.calories, total_protein_g: t.protein_g, total_carbs_g: t.carbs_g, total_fat_g: t.fat_g }).eq('id', log.id)
    }

    router.push('/plan')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-white text-2xl">‹</button>
        <h1 className="text-2xl font-bold text-white flex-1">{recipe.name}</h1>
        <button onClick={handleDelete} disabled={deleting} className="text-muted hover:text-danger transition-colors text-sm">
          {deleting ? '...' : 'Obriši'}
        </button>
      </div>

      {/* Macros per serving */}
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <p className="text-muted text-xs mb-3">{recipe.servings} porcija · po porciji:</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Kalorije', value: `${perServing.calories}`, unit: 'kcal', accent: true },
            { label: 'Proteini', value: `${perServing.protein_g}`, unit: 'g' },
            { label: 'Ugljeni h.', value: `${perServing.carbs_g}`, unit: 'g' },
            { label: 'Masti', value: `${perServing.fat_g}`, unit: 'g' },
          ].map(item => (
            <div key={item.label}>
              <p className={`text-lg font-bold ${item.accent ? 'text-primary' : 'text-white'}`}>{item.value}</p>
              <p className="text-muted text-xs">{item.unit}</p>
              <p className="text-muted text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-surface rounded-2xl overflow-hidden mb-4">
        <p className="text-secondary font-semibold px-4 py-3 border-b border-line">Namirnice</p>
        <div className="divide-y divide-line">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center px-4 py-2.5">
              <p className="text-white text-sm">{item.food_name_snapshot}</p>
              <p className="text-muted text-sm">{item.quantity_value}g</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add to plan */}
      <div className="bg-surface rounded-2xl p-5">
        <p className="text-secondary font-semibold mb-3">Dodaj u plan</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {(Object.entries(MEAL_SLOT_LABELS) as [MealSlot, string][]).map(([slot, label]) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                selectedSlot === slot
                  ? 'bg-primary border-primary text-white'
                  : 'border-line text-muted hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={addToToday}
          disabled={adding}
          className="w-full py-3.5 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
        >
          {adding ? 'Dodajem...' : `Dodaj u ${MEAL_SLOT_LABELS[selectedSlot]}`}
        </button>
      </div>
    </div>
  )
}
