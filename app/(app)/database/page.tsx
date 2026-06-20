'use client'

import { useState, useMemo } from 'react'
import { SYSTEM_FOODS, CATEGORIES } from '@/lib/foodData'
import { normalizeQuery } from '@/lib/search'
import type { FoodItem } from '@/lib/foodData'
import { addEntry, getProfile } from '@/lib/localStore'
import type { MealSlot } from '@/lib/localStore'
import { calcEntryMacros } from '@/lib/calculations'

const MEALS: { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'Doručak' },
  { id: 'lunch',     label: 'Ručak' },
  { id: 'dinner',    label: 'Večera' },
  { id: 'snack1',    label: 'Užina' },
]

const CAT_COLORS: Record<string, string> = {
  'cat-meso':     'text-red-400    bg-red-400/10',
  'cat-riba':     'text-blue-300   bg-blue-300/10',
  'cat-jaja':     'text-yellow-300 bg-yellow-300/10',
  'cat-mlecni':   'text-blue-200   bg-blue-200/10',
  'cat-supp':     'text-purple-400 bg-purple-400/10',
  'cat-zitarice': 'text-yellow-400 bg-yellow-400/10',
  'cat-hleb':     'text-amber-400  bg-amber-400/10',
  'cat-krompir':  'text-orange-300 bg-orange-300/10',
  'cat-voce':     'text-pink-400   bg-pink-400/10',
  'cat-povrce':   'text-green-400  bg-green-400/10',
  'cat-ulja':     'text-orange-400 bg-orange-400/10',
  'cat-orasasti': 'text-amber-600  bg-amber-600/10',
  'cat-semenke':  'text-lime-400   bg-lime-400/10',
  'cat-ostalo':   'text-muted      bg-line',
}

export default function DatabasePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [addFood, setAddFood] = useState<FoodItem | null>(null)
  const [slot, setSlot] = useState<MealSlot>('breakfast')
  const [qty, setQty] = useState('100')
  const [added, setAdded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = SYSTEM_FOODS
    if (activeCategory) list = list.filter(f => f.category_id === activeCategory)
    if (query.trim()) {
      const q = normalizeQuery(query)
      list = list.filter(f => f.search_name.includes(q))
    }
    return list
  }, [activeCategory, query])

  function handleAdd() {
    if (!addFood || +qty <= 0) return
    const today = new Date().toISOString().split('T')[0]
    const macros = calcEntryMacros(addFood, +qty)
    addEntry({ date: today, meal_slot: slot, food_id: addFood.id, food_name: addFood.name_sr, quantity_g: +qty, ...macros })
    setAdded(addFood.name_sr)
    setAddFood(null)
    setTimeout(() => setAdded(null), 2500)
  }

  const catName = (id: string) => CATEGORIES.find(c => c.id === id)?.name ?? id

  return (
    <div className="px-4 py-5">

      {/* Title + search */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-3">Baza namirnica</h1>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="🔍  Pretraži namirnice..."
          className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        <Chip label="Sve" active={!activeCategory} onClick={() => setActiveCategory(null)} />
        {CATEGORIES.map(cat => (
          <Chip key={cat.id} label={`${cat.icon} ${cat.name}`}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      {/* Toast */}
      {added && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
          ✓ {added} dodato
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0
        ? <p className="text-muted text-sm text-center py-12">Nema rezultata</p>
        : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(food => {
              const colorClass = CAT_COLORS[food.category_id] ?? 'text-muted bg-line'
              return (
                <div key={food.id} className="bg-surface rounded-2xl p-4 flex flex-col">
                  {/* Category */}
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full self-start mb-2 ${colorClass}`}>
                    {catName(food.category_id)}
                  </span>

                  {/* Name */}
                  <p className="text-white font-semibold text-sm leading-snug mb-3 flex-1">{food.name_sr}</p>

                  {/* Macros */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    <MacroPill label="kcal" value={food.calories_kcal} color="text-primary bg-primary/10" />
                    <MacroPill label="P" value={`${food.protein_g}g`} color="text-green-400 bg-green-400/10" />
                    <MacroPill label="ugljeni" value={`${food.carbs_g}g`} color="text-yellow-400 bg-yellow-400/10" />
                    <MacroPill label="masti" value={`${food.fat_g}g`} color="text-orange-400 bg-orange-400/10" />
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => { setAddFood(food); setQty('100'); setSlot('breakfast') }}
                    className="w-full py-2 bg-primary/15 hover:bg-primary/25 text-primary font-semibold text-xs rounded-xl transition-colors"
                  >
                    + Dodaj u obrok
                  </button>
                </div>
              )
            })}
          </div>
        )
      }

      <p className="text-muted text-xs text-center mt-4">{filtered.length} namirnica · vrednosti na 100g</p>

      {/* Add to meal modal */}
      {addFood && (
        <div className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm flex items-end" onClick={() => setAddFood(null)}>
          <div className="w-full bg-surface rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-line rounded-full" /></div>
            <p className="text-white font-bold text-base mb-1">{addFood.name_sr}</p>
            <p className="text-muted text-xs mb-4">{addFood.calories_kcal} kcal · P{addFood.protein_g} UH{addFood.carbs_g} M{addFood.fat_g} (na 100g)</p>

            <p className="text-secondary text-xs font-semibold uppercase tracking-wide mb-2">Obrok</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {MEALS.map(m => (
                <button key={m.id} onClick={() => setSlot(m.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${slot === m.id ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted'}`}>
                  {m.label}
                </button>
              ))}
            </div>

            <p className="text-secondary text-xs font-semibold uppercase tracking-wide mb-2">Količina (g)</p>
            <div className="flex gap-2 mb-5">
              {[50, 100, 150, 200].map(a => (
                <button key={a} onClick={() => setQty(String(a))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${qty === String(a) ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted'}`}>
                  {a}g
                </button>
              ))}
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="g"
                className="flex-1 bg-bg border-2 border-line rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-primary" />
            </div>

            <button onClick={handleAdd}
              className="w-full py-4 bg-primary hover:bg-primary-h text-white font-bold rounded-xl transition-colors text-base">
              Dodaj {qty}g u {MEALS.find(m => m.id === slot)?.label}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap ${
        active ? 'bg-primary border-primary text-white' : 'border-line text-muted hover:border-primary/40 hover:text-secondary'
      }`}>
      {label}
    </button>
  )
}

function MacroPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`${color} rounded-lg px-2 py-1 text-center`}>
      <p className="text-xs font-bold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  )
}
