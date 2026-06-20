'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRecipe, addEntry, getProfile } from '@/lib/localStore'
import type { Recipe, MealSlot } from '@/lib/localStore'

const SLOTS: {id:MealSlot;label:string}[] = [
  {id:'breakfast',label:'Doručak'},{id:'lunch',label:'Ručak'},
  {id:'dinner',label:'Večera'},{id:'snack1',label:'Užina'},
]

export default function RecipeDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [slot, setSlot] = useState<MealSlot>('breakfast')

  useEffect(() => {
    const r = getRecipe(id)
    if (!r) router.replace('/recipes')
    else setRecipe(r)
  }, [id])

  function addToToday() {
    if (!recipe) return
    const today = new Date().toISOString().split('T')[0]
    const srv = recipe.servings
    addEntry({
      date: today, meal_slot: slot,
      food_id: recipe.id, food_name: recipe.name,
      quantity_g: srv,
      calories:   recipe.total_calories / srv,
      protein_g:  recipe.total_protein_g / srv,
      carbs_g:    recipe.total_carbs_g / srv,
      fat_g:      recipe.total_fat_g / srv,
    })
    router.push('/plan')
  }

  if (!recipe) return null
  const per = {
    cal: Math.round(recipe.total_calories  / recipe.servings),
    pro: Math.round(recipe.total_protein_g / recipe.servings),
    car: Math.round(recipe.total_carbs_g   / recipe.servings),
    fat: Math.round(recipe.total_fat_g     / recipe.servings),
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-white text-2xl">‹</button>
        <h1 className="text-2xl font-bold text-white flex-1">{recipe.name}</h1>
      </div>
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <p className="text-muted text-xs mb-3">{recipe.servings} porcija · po porciji:</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[{l:'Kalorije',v:`${per.cal}`,u:'kcal',a:true},{l:'Proteini',v:`${per.pro}`,u:'g'},{l:'Ugljeni h.',v:`${per.car}`,u:'g'},{l:'Masti',v:`${per.fat}`,u:'g'}].map(item => (
            <div key={item.l}><p className={`text-lg font-bold ${item.a?'text-primary':'text-white'}`}>{item.v}</p><p className="text-muted text-xs">{item.u}</p><p className="text-muted text-xs">{item.l}</p></div>
          ))}
        </div>
      </div>
      <div className="bg-surface rounded-2xl overflow-hidden mb-4">
        <p className="text-secondary font-semibold px-4 py-3 border-b border-line">Namirnice</p>
        <div className="divide-y divide-line">
          {recipe.items.map((item,i) => (
            <div key={i} className="flex justify-between items-center px-4 py-2.5">
              <p className="text-white text-sm">{item.food_name}</p>
              <p className="text-muted text-sm">{item.quantity_g}g</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface rounded-2xl p-5">
        <p className="text-secondary font-semibold mb-3">Dodaj u plan</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {SLOTS.map(s => (
            <button key={s.id} onClick={() => setSlot(s.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${slot===s.id ? 'bg-primary border-primary text-white' : 'border-line text-muted hover:border-primary/50'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={addToToday} className="w-full py-3.5 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors">
          Dodaj u {SLOTS.find(s=>s.id===slot)?.label}
        </button>
      </div>
    </div>
  )
}
