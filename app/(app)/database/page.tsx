'use client'

import { useState, useMemo } from 'react'
import { SYSTEM_FOODS, CATEGORIES } from '@/lib/foodData'
import type { FoodItem } from '@/lib/foodData'
import { addEntry } from '@/lib/localStore'
import type { MealSlot } from '@/lib/localStore'
import { calcEntryMacros } from '@/lib/calculations'

const MEALS: { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'Doručak' },
  { id: 'lunch',     label: 'Ručak' },
  { id: 'dinner',    label: 'Večera' },
  { id: 'snack1',    label: 'Užina' },
]

function normalize(s: string) {
  return s.toLowerCase().replace(/[čć]/g,'c').replace(/š/g,'s').replace(/ž/g,'z').replace(/đ/g,'dj')
}

export default function DatabasePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [addFood, setAddFood] = useState<FoodItem | null>(null)
  const [slot, setSlot] = useState<MealSlot>('breakfast')
  const [qty, setQty] = useState('100')
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = SYSTEM_FOODS
    if (activeCategory) list = list.filter(f => f.category_id === activeCategory)
    if (query.trim()) {
      const q = normalize(query)
      list = list.filter(f => f.search_name.includes(q) || normalize(f.name_sr).includes(q))
    }
    return list
  }, [activeCategory, query])

  function handleAdd() {
    if (!addFood || +qty <= 0) return
    const today = new Date().toISOString().split('T')[0]
    const macros = calcEntryMacros(addFood, +qty)
    addEntry({ date: today, meal_slot: slot, food_id: addFood.id, food_name: addFood.name_sr, quantity_g: +qty, ...macros })
    setToast(addFood.name_sr)
    setAddFood(null)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-16">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg text-white bg-green-500">
          ✓ {toast} dodato
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9BBF] text-base">🔍</span>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Pretraži namirnice..."
          className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-[#1A2540] text-sm outline-none bg-white border border-[#E4EAF4] focus:border-[#4169E1] shadow-sm"
        />
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-5 gap-1.5 mb-5">
        <button onClick={() => setActiveCategory(null)}
          className="flex flex-col items-center justify-center rounded-xl py-2.5 px-1 border-2 transition-all"
          style={!activeCategory ? { background: '#4169E1', borderColor: '#4169E1' } : { background: '#fff', borderColor: '#E4EAF4' }}>
          <span className="text-base mb-0.5">🍽️</span>
          <span className={`font-bold text-center leading-tight ${!activeCategory ? 'text-white' : 'text-[#8A9BBF]'}`} style={{ fontSize: '9px' }}>Sve</span>
        </button>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.id
          return (
            <button key={cat.id} onClick={() => setActiveCategory(active ? null : cat.id)}
              className="flex flex-col items-center justify-center rounded-xl py-2.5 px-1 border-2 transition-all"
              style={active ? { background: '#4169E1', borderColor: '#4169E1' } : { background: '#fff', borderColor: '#E4EAF4' }}>
              <span className="text-base mb-0.5">{cat.icon}</span>
              <span className={`font-bold text-center leading-tight line-clamp-2 ${active ? 'text-white' : 'text-[#8A9BBF]'}`}
                style={{ fontSize: '9px' }}>
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-[#8A9BBF] text-xs mb-3">{filtered.length} namirnica · vrednosti na 100g</p>

      {/* Food list */}
      {filtered.length === 0 ? (
        <p className="text-[#8A9BBF] text-sm text-center py-12">Nema rezultata</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(food => (
            <div key={food.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-[#E4EAF4] shadow-sm">
              <span className="text-xl shrink-0">{CATEGORIES.find(c => c.id === food.category_id)?.icon ?? '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A2540] text-sm font-semibold truncate mb-1">{food.name_sr}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[#4169E1] text-xs font-bold">{food.calories_kcal} kcal</span>
                  <span className="text-[#3B82F6] text-xs font-semibold">P {food.protein_g}g</span>
                  <span className="text-green-600 text-xs">UH {food.carbs_g}g</span>
                  <span className="text-amber-600 text-xs">M {food.fat_g}g</span>
                </div>
              </div>
              <button onClick={() => { setAddFood(food); setQty('100'); setSlot('breakfast') }}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-[#4169E1] hover:bg-[#2F56D0] transition-colors shadow-sm">
                +
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add to meal modal */}
      {addFood && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm" onClick={() => setAddFood(null)}>
          <div className="w-full bg-white rounded-t-3xl p-5 pb-10 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-[#E4EAF4] rounded-full" /></div>

            <p className="text-[#1A2540] font-black text-xl mb-0.5">Dodaj u obrok</p>
            <p className="text-[#3B82F6] font-bold text-sm mb-1">{addFood.name_sr}</p>
            <p className="text-[#8A9BBF] text-xs mb-5">
              {addFood.calories_kcal} kcal · P:{addFood.protein_g}g · UH:{addFood.carbs_g}g · M:{addFood.fat_g}g (na 100g)
            </p>

            <p className="text-[#8A9BBF] text-xs font-bold uppercase tracking-widest mb-2">Obrok</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {MEALS.map(m => (
                <button key={m.id} onClick={() => setSlot(m.id)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                  style={slot === m.id
                    ? { background: '#4169E1', borderColor: '#4169E1', color: '#fff' }
                    : { background: '#F0F4FA', borderColor: '#E4EAF4', color: '#8A9BBF' }}>
                  {m.label}
                </button>
              ))}
            </div>

            <p className="text-[#8A9BBF] text-xs font-bold uppercase tracking-widest mb-2">Količina</p>
            <div className="flex gap-2 mb-2">
              {[50, 100, 150, 200].map(a => (
                <button key={a} onClick={() => setQty(String(a))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                  style={qty === String(a)
                    ? { background: '#4169E1', borderColor: '#4169E1', color: '#fff' }
                    : { background: '#F0F4FA', borderColor: '#E4EAF4', color: '#8A9BBF' }}>
                  {a}g
                </button>
              ))}
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="g"
                className="flex-1 rounded-xl px-3 py-2 text-[#1A2540] text-sm text-center outline-none border-2 border-[#E4EAF4] focus:border-[#4169E1] bg-[#F8FAFF]" />
            </div>

            {+qty > 0 && (
              <div className="rounded-xl p-3.5 mb-5 grid grid-cols-4 gap-1 text-center bg-[#F8FAFF] border border-[#E4EAF4]">
                {[
                  { l: 'kcal',   v: Math.round(addFood.calories_kcal * +qty / 100), c: '#4169E1' },
                  { l: 'P (g)',  v: +(addFood.protein_g * +qty / 100).toFixed(1),   c: '#3B82F6' },
                  { l: 'UH (g)', v: +(addFood.carbs_g   * +qty / 100).toFixed(1),   c: '#22C55E' },
                  { l: 'M (g)',  v: +(addFood.fat_g     * +qty / 100).toFixed(1),   c: '#F59E0B' },
                ].map(item => (
                  <div key={item.l}>
                    <p className="text-lg font-black" style={{ color: item.c }}>{item.v}</p>
                    <p className="text-xs text-[#8A9BBF]">{item.l}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleAdd}
              className="w-full py-4 rounded-xl text-white font-bold text-base bg-[#4169E1] hover:bg-[#2F56D0] transition-colors shadow-md">
              Dodaj {qty}g u {MEALS.find(m => m.id === slot)?.label}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
