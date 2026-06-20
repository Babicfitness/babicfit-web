'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addRecipe, getUserFoods } from '@/lib/localStore'
import { searchFoods } from '@/lib/foodData'
import { calcEntryMacros } from '@/lib/calculations'
import type { FoodItem } from '@/lib/foodData'
import type { RecipeItem } from '@/lib/localStore'

export default function NewRecipePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState<{food:FoodItem; qty:number}[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [error, setError] = useState<string|null>(null)

  function handleSearch(q: string) {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const userFoods = getUserFoods().map(f => ({
      id: f.id, type: 'user' as const, name_sr: f.name, search_name: f.name.toLowerCase(),
      category_id: f.category_id, calories_kcal: f.calories_kcal,
      protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g,
    }))
    setResults(searchFoods(q, userFoods))
  }

  function addIngredient(food: FoodItem) {
    if (ingredients.find(i => i.food.id === food.id)) return
    setIngredients(prev => [...prev, { food, qty: 100 }])
    setQuery(''); setResults([])
  }

  function updateQty(idx: number, qty: number) {
    setIngredients(prev => prev.map((i,n) => n===idx ? {...i,qty} : i))
  }

  const totals = ingredients.reduce((acc, {food, qty}) => {
    const m = calcEntryMacros(food, qty)
    return { calories: acc.calories+m.calories, protein_g: acc.protein_g+m.protein_g, carbs_g: acc.carbs_g+m.carbs_g, fat_g: acc.fat_g+m.fat_g }
  }, { calories:0, protein_g:0, carbs_g:0, fat_g:0 })

  function handleSave() {
    if (!name.trim()) { setError('Unesite naziv.'); return }
    if (ingredients.length === 0) { setError('Dodajte barem jednu namirnicu.'); return }
    const srv = Math.max(1, +servings||1)
    const items: RecipeItem[] = ingredients.map(({food,qty}) => {
      const m = calcEntryMacros(food, qty)
      return { food_id:food.id, food_name:food.name_sr, quantity_g:qty, ...m }
    })
    addRecipe({ name:name.trim(), servings:srv, items, ...totals })
    router.push('/recipes')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-white text-2xl">‹</button>
        <h1 className="text-2xl font-bold text-white">Novi recept</h1>
      </div>
      <div className="bg-surface rounded-2xl p-5 mb-4 flex flex-col gap-3">
        <div><label className="block text-muted text-xs mb-1">Naziv</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="npr. Protein ovsene"
            className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm" /></div>
        <div><label className="block text-muted text-xs mb-1">Broj porcija</label>
          <input type="number" min={1} value={servings} onChange={e => setServings(e.target.value)}
            className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white outline-none focus:border-primary text-sm" /></div>
      </div>
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-3">Dodaj namirnice</h3>
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Pretraži..."
          className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm mb-3" />
        {results.length > 0 && (
          <div className="divide-y divide-line rounded-xl overflow-hidden border border-line">
            {results.map(food => (
              <button key={food.id} onClick={() => addIngredient(food)}
                className="w-full flex justify-between items-center px-3 py-2.5 hover:bg-surface-alt bg-bg text-left">
                <p className="text-white text-sm truncate">{food.name_sr}</p>
                <p className="text-muted text-xs ml-2 shrink-0">{food.calories_kcal} kcal/100g</p>
              </button>
            ))}
          </div>
        )}
      </div>
      {ingredients.length > 0 && (
        <div className="bg-surface rounded-2xl overflow-hidden mb-4">
          <div className="divide-y divide-line">
            {ingredients.map(({food,qty},idx) => {
              const m = calcEntryMacros(food, qty)
              return (
                <div key={food.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium truncate mr-2">{food.name_sr}</p>
                    <button onClick={() => setIngredients(p => p.filter((_,n) => n!==idx))} className="text-muted hover:text-danger text-lg">×</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={qty} onChange={e => updateQty(idx, +e.target.value)}
                      className="w-20 bg-bg border border-line rounded-lg px-2 py-1 text-white text-sm text-center outline-none focus:border-primary" />
                    <span className="text-muted text-sm">g</span>
                    <span className="text-muted text-xs ml-1">{Math.round(m.calories)} kcal</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-line bg-bg px-4 py-3 grid grid-cols-4 gap-2 text-center">
            {[{l:'Ukupno',v:`${Math.round(totals.calories)} kcal`,a:true},{l:'Proteini',v:`${Math.round(totals.protein_g)}g`},{l:'Ugljeni h.',v:`${Math.round(totals.carbs_g)}g`},{l:'Masti',v:`${Math.round(totals.fat_g)}g`}].map(item => (
              <div key={item.l}><p className={`text-sm font-bold ${item.a?'text-primary':'text-white'}`}>{item.v}</p><p className="text-muted text-xs">{item.l}</p></div>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      <button onClick={handleSave} className="w-full py-4 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors">Sačuvaj recept</button>
    </div>
  )
}
