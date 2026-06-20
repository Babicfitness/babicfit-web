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
    addRecipe({
      name: name.trim(), servings: srv, items,
      total_calories: totals.calories, total_protein_g: totals.protein_g,
      total_carbs_g: totals.carbs_g, total_fat_g: totals.fat_g,
    })
    router.push('/recipes')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#8A9BBF] hover:text-[#1A2540] text-2xl">‹</button>
        <h1 className="text-2xl font-bold text-[#1A2540]">Novi recept</h1>
      </div>

      {/* Naziv + porcije */}
      <div className="bg-white rounded-2xl p-5 mb-4 space-y-4 border border-[#E4EAF4] shadow-sm">
        <div>
          <label className="block text-[#8A9BBF] text-xs font-semibold uppercase tracking-widest mb-2">Naziv recepta</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="npr. Protein ovsene"
            className="w-full bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-4 py-3 text-[#1A2540] placeholder-[#8A9BBF] outline-none focus:border-[#4169E1] text-sm transition-colors" />
        </div>
        <div>
          <label className="block text-[#8A9BBF] text-xs font-semibold uppercase tracking-widest mb-2">Broj porcija</label>
          <input type="number" min={1} value={servings} onChange={e => setServings(e.target.value)}
            className="w-32 bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-4 py-3 text-[#1A2540] outline-none focus:border-[#4169E1] text-sm transition-colors text-center" />
        </div>
      </div>

      {/* Pretraga namirnica */}
      <div className="bg-white rounded-2xl p-5 mb-4 border border-[#E4EAF4] shadow-sm">
        <h3 className="text-[#1A2540] font-bold mb-3">Dodaj namirnice</h3>
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Pretraži..."
          className="w-full bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-4 py-3 text-[#1A2540] placeholder-[#8A9BBF] outline-none focus:border-[#4169E1] text-sm mb-3 transition-colors" />
        {results.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-[#E4EAF4] divide-y divide-[#F0F4FA]">
            {results.map(food => (
              <button key={food.id} onClick={() => addIngredient(food)}
                className="w-full flex justify-between items-center px-3 py-3 hover:bg-[#F0F4FA] bg-white text-left transition-colors">
                <p className="text-[#1A2540] text-sm font-medium truncate">{food.name_sr}</p>
                <p className="text-[#8A9BBF] text-xs ml-2 shrink-0">{food.calories_kcal} kcal/100g</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista sastojaka */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden mb-4 border border-[#E4EAF4] shadow-sm">
          <div className="divide-y divide-[#F0F4FA]">
            {ingredients.map(({food,qty},idx) => {
              const m = calcEntryMacros(food, qty)
              return (
                <div key={food.id} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#1A2540] text-sm font-semibold truncate mr-2">{food.name_sr}</p>
                    <button onClick={() => setIngredients(p => p.filter((_,n) => n!==idx))}
                      className="text-[#CBD5E1] hover:text-red-400 text-xl transition-colors">×</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} value={qty} onChange={e => updateQty(idx, +e.target.value)}
                      className="w-20 bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-lg px-2 py-1.5 text-[#1A2540] text-sm text-center outline-none focus:border-[#4169E1] transition-colors" />
                    <span className="text-[#8A9BBF] text-sm">g</span>
                    <span className="text-[#4169E1] text-xs font-bold ml-1">{Math.round(m.calories)} kcal</span>
                    <span className="text-[#3B82F6] text-xs">P:{m.protein_g.toFixed(1)}g</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ukupno */}
          <div className="border-t border-[#E4EAF4] bg-[#F8FAFF] px-4 py-3 grid grid-cols-4 gap-2 text-center">
            {[
              { l:'Ukupno',    v:`${Math.round(totals.calories)} kcal`, c:'#4169E1' },
              { l:'Proteini',  v:`${Math.round(totals.protein_g)}g`,    c:'#3B82F6' },
              { l:'Ugljeni h.',v:`${Math.round(totals.carbs_g)}g`,      c:'#22C55E' },
              { l:'Masti',     v:`${Math.round(totals.fat_g)}g`,        c:'#F59E0B' },
            ].map(item => (
              <div key={item.l}>
                <p className="text-sm font-bold" style={{ color: item.c }}>{item.v}</p>
                <p className="text-[#8A9BBF] text-xs">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button onClick={handleSave}
        className="w-full py-4 bg-[#4169E1] hover:bg-[#2F56D0] text-white font-bold rounded-xl transition-colors shadow-md">
        Sačuvaj recept
      </button>
    </div>
  )
}
