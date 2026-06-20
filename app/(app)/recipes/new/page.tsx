'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toLikePattern, toSearchName } from '@/lib/search'
import { calcEntryMacros } from '@/lib/calculations'
import type { FoodItem } from '@/types/database'

type Ingredient = {
  food: FoodItem
  quantity: number
}

export default function NewRecipePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  async function search(q: string) {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    const supabase = createClient()
    const pattern = toLikePattern(q)
    const [{ data: sf }, { data: uf }] = await Promise.all([
      supabase.from('system_foods').select('id,category_id,name_sr,search_name,calories_kcal,protein_g,carbs_g,fat_g,unit_type,unit_weight_g').ilike('search_name', pattern).eq('is_active', true).limit(10),
      supabase.from('user_foods').select('id,category_id,name_sr,search_name,calories_kcal,protein_g,carbs_g,fat_g,unit_type,unit_weight_g').ilike('search_name', pattern).is('deleted_at', null).limit(5),
    ])
    setResults([
      ...(uf ?? []).map(f => ({ ...f, type: 'user' as const })),
      ...(sf ?? []).map(f => ({ ...f, type: 'system' as const })),
    ])
    setSearching(false)
  }

  function addIngredient(food: FoodItem) {
    setIngredients(prev => {
      const exists = prev.find(i => i.food.id === food.id)
      if (exists) return prev
      return [...prev, { food, quantity: 100 }]
    })
    setQuery('')
    setResults([])
  }

  function updateQty(idx: number, qty: number) {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, quantity: qty } : ing))
  }

  function removeIngredient(idx: number) {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  const totals = ingredients.reduce(
    (acc, { food, quantity }) => {
      const m = calcEntryMacros(food, quantity)
      return { calories: acc.calories + m.calories, protein_g: acc.protein_g + m.protein_g, carbs_g: acc.carbs_g + m.carbs_g, fat_g: acc.fat_g + m.fat_g }
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  )

  async function handleSave() {
    if (!name.trim()) { setError('Unesite naziv recepta.'); return }
    if (ingredients.length === 0) { setError('Dodajte barem jednu namirnicu.'); return }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const srv = Math.max(1, +servings || 1)

    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({
        name: name.trim(),
        servings: srv,
        total_calories:  totals.calories,
        total_protein_g: totals.protein_g,
        total_carbs_g:   totals.carbs_g,
        total_fat_g:     totals.fat_g,
      })
      .select()
      .single()

    if (recipeErr || !recipe) { setError('Greška pri čuvanju recepta.'); setSaving(false); return }

    const items = ingredients.map((ing, idx) => ({
      recipe_id:               recipe.id,
      system_food_id:          ing.food.type === 'system' ? ing.food.id : null,
      user_food_id:            ing.food.type === 'user'   ? ing.food.id : null,
      quantity_value:          ing.quantity,
      quantity_unit:           'g',
      snapshot_kcal_per100:    ing.food.calories_kcal,
      snapshot_protein_per100: ing.food.protein_g,
      snapshot_carbs_per100:   ing.food.carbs_g,
      snapshot_fat_per100:     ing.food.fat_g,
      food_name_snapshot:      ing.food.name_sr,
      sort_order:              idx,
    }))

    await supabase.from('recipe_items').insert(items)
    router.push('/recipes')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-white text-2xl">‹</button>
        <h1 className="text-2xl font-bold text-white">Novi recept</h1>
      </div>

      {/* Name + servings */}
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-muted text-xs mb-1">Naziv recepta</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="npr. Protein ovsene"
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs mb-1">Broj porcija</label>
            <input
              type="number" min={1} value={servings} onChange={e => setServings(e.target.value)}
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white outline-none focus:border-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Search to add ingredients */}
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-3">Dodaj namirnice</h3>
        <div className="relative mb-3">
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value) }}
            placeholder="Pretraži..."
            className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm"
          />
          {searching && <span className="absolute right-4 top-3.5 text-muted text-xs">...</span>}
        </div>
        {results.length > 0 && (
          <div className="divide-y divide-line rounded-xl overflow-hidden border border-line">
            {results.map(food => (
              <button
                key={`${food.type}-${food.id}`}
                onClick={() => addIngredient(food)}
                className="w-full flex justify-between items-center px-3 py-2.5 hover:bg-surface-alt transition-colors text-left bg-bg"
              >
                <p className="text-white text-sm truncate">{food.name_sr}</p>
                <p className="text-muted text-xs ml-2 shrink-0">{food.calories_kcal} kcal/100g</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients list */}
      {ingredients.length > 0 && (
        <div className="bg-surface rounded-2xl overflow-hidden mb-4">
          <div className="divide-y divide-line">
            {ingredients.map((ing, idx) => {
              const m = calcEntryMacros(ing.food, ing.quantity)
              return (
                <div key={idx} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium truncate mr-2">{ing.food.name_sr}</p>
                    <button onClick={() => removeIngredient(idx)} className="text-muted hover:text-danger text-lg">×</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} value={ing.quantity}
                      onChange={e => updateQty(idx, +e.target.value)}
                      className="w-20 bg-bg border border-line rounded-lg px-2 py-1 text-white text-sm text-center outline-none focus:border-primary"
                    />
                    <span className="text-muted text-sm">g</span>
                    <span className="text-muted text-xs ml-1">{Math.round(m.calories)} kcal</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Totals */}
          <div className="border-t border-line bg-bg px-4 py-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Ukupno', value: `${Math.round(totals.calories)} kcal`, accent: true },
              { label: 'Proteini', value: `${Math.round(totals.protein_g)}g` },
              { label: 'Ugljeni h.', value: `${Math.round(totals.carbs_g)}g` },
              { label: 'Masti', value: `${Math.round(totals.fat_g)}g` },
            ].map(item => (
              <div key={item.label}>
                <p className={`text-sm font-bold ${item.accent ? 'text-primary' : 'text-white'}`}>{item.value}</p>
                <p className="text-muted text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
      >
        {saving ? 'Čuvam...' : 'Sačuvaj recept'}
      </button>
    </div>
  )
}
