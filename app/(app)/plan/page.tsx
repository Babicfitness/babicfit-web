'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, getEntries, addEntry, removeEntry } from '@/lib/localStore'
import { calcEntryMacros } from '@/lib/calculations'
import { searchFoods } from '@/lib/foodData'
import type { MealEntry, MealSlot, Profile } from '@/lib/localStore'
import type { FoodItem } from '@/lib/foodData'

const MEALS: { id: MealSlot; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Doručak',  icon: '🌅' },
  { id: 'lunch',     label: 'Ručak',    icon: '☀️' },
  { id: 'dinner',    label: 'Večera',   icon: '🌙' },
  { id: 'snack1',    label: 'Užina',    icon: '🍎' },
]

const QUICK = [50, 100, 150, 200, 250]
const today = new Date().toISOString().split('T')[0]

export default function PlanPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [qty, setQty] = useState(100)
  const [customQty, setCustomQty] = useState('')

  useEffect(() => {
    const p = getProfile()
    if (!p?.onboarding_done) { router.replace('/onboarding'); return }
    setProfile(p)
    setEntries(getEntries(today))
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setResults(searchFoods(query))
  }, [query])

  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein_g: acc.protein_g + e.protein_g, carbs_g: acc.carbs_g + e.carbs_g, fat_g: acc.fat_g + e.fat_g }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const goals = profile
    ? { calories: profile.goal_calories, protein_g: profile.goal_protein_g, carbs_g: profile.goal_carbs_g, fat_g: profile.goal_fat_g }
    : { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 }

  const remaining = Math.max(0, Math.round(goals.calories - totals.calories))
  const calPct = Math.min(100, goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0)
  const activeQty = customQty ? +customQty : qty
  const preview = selected ? calcEntryMacros(selected, activeQty) : null

  function openPicker(slot: MealSlot) {
    setPickerSlot(slot)
    setSelected(null)
    setQuery('')
    setResults([])
    setQty(100)
    setCustomQty('')
  }

  function handleAdd() {
    if (!selected || !pickerSlot || activeQty <= 0) return
    const macros = calcEntryMacros(selected, activeQty)
    const entry = addEntry({ date: today, meal_slot: pickerSlot, food_id: selected.id, food_name: selected.name_sr, quantity_g: activeQty, ...macros })
    setEntries(p => [...p, entry])
    setPickerSlot(null)
  }

  function handleRemove(id: string) {
    removeEntry(id)
    setEntries(p => p.filter(e => e.id !== id))
  }

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })

  if (!profile) return <div className="min-h-screen bg-bg" />

  return (
    <div className="px-4 py-5 space-y-4">

      {/* Date */}
      <div>
        <h1 className="text-white font-bold text-xl capitalize">{dateLabel}</h1>
        <p className="text-muted text-sm">Zdravo, {profile.first_name}!</p>
      </div>

      {/* Calorie card */}
      <div className="bg-surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-muted text-xs uppercase tracking-wide font-medium mb-1">Preostalo</p>
            <p className="text-4xl font-black text-white">{remaining}</p>
            <p className="text-muted text-xs mt-0.5">kcal</p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <p className="text-muted text-xs mb-0.5">Cilj</p>
              <p className="text-white font-bold text-lg">{Math.round(goals.calories)}</p>
              <p className="text-muted text-xs">kcal</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Uneto</p>
              <p className="text-primary font-bold text-lg">{Math.round(totals.calories)}</p>
              <p className="text-muted text-xs">kcal</p>
            </div>
          </div>
        </div>

        {/* Calorie bar */}
        <div className="h-3 bg-line rounded-full overflow-hidden mb-5">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${totals.calories > goals.calories ? 'bg-danger' : 'bg-primary'}`}
            style={{ width: `${calPct}%` }}
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          <MacroCard label="Proteini" value={totals.protein_g} max={goals.protein_g} color="#4ADE80" bgColor="bg-green-500/10" />
          <MacroCard label="Ugljeni h." value={totals.carbs_g} max={goals.carbs_g} color="#FACC15" bgColor="bg-yellow-400/10" />
          <MacroCard label="Masti" value={totals.fat_g} max={goals.fat_g} color="#FB923C" bgColor="bg-orange-400/10" />
        </div>
      </div>

      {/* Meal cards */}
      {MEALS.map(meal => {
        const slotEntries = entries.filter(e => e.meal_slot === meal.id)
        const slotCal = Math.round(slotEntries.reduce((s, e) => s + e.calories, 0))
        return (
          <div key={meal.id} className="bg-surface rounded-2xl overflow-hidden">
            {/* Meal header */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{meal.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{meal.label}</p>
                  {slotCal > 0 && <p className="text-muted text-xs">{slotCal} kcal</p>}
                </div>
              </div>
              <button
                onClick={() => openPicker(meal.id)}
                className="flex items-center gap-1.5 bg-primary/15 hover:bg-primary/25 text-primary px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="text-base leading-none">+</span>
                <span>Dodaj</span>
              </button>
            </div>

            {/* Food entries */}
            {slotEntries.length > 0 && (
              <div className="border-t border-line divide-y divide-line">
                {slotEntries.map(e => (
                  <div key={e.id} className="flex items-center px-4 py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{e.food_name}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {e.quantity_g}g · <span className="text-primary font-medium">{Math.round(e.calories)} kcal</span>
                        {' '}· B{Math.round(e.protein_g)} U{Math.round(e.carbs_g)} M{Math.round(e.fat_g)}
                      </p>
                    </div>
                    <button onClick={() => handleRemove(e.id)} className="text-muted hover:text-danger text-xl px-1 flex-shrink-0 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Food picker modal */}
      {pickerSlot && (
        <div className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm flex items-end" onClick={() => setPickerSlot(null)}>
          <div className="w-full bg-surface rounded-t-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-line rounded-full" />
            </div>

            {selected ? (
              /* Quantity picker */
              <div className="px-5 pb-8 flex flex-col gap-4 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <button onClick={() => setSelected(null)} className="text-muted hover:text-white text-2xl">‹</button>
                  <div>
                    <p className="text-white font-bold">{selected.name_sr}</p>
                    <p className="text-muted text-xs">Na 100g: {selected.calories_kcal} kcal · B{selected.protein_g} U{selected.carbs_g} M{selected.fat_g}</p>
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {QUICK.map(a => (
                    <button key={a} onClick={() => { setQty(a); setCustomQty('') }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeQty === a && !customQty ? 'bg-primary border-primary text-white' : 'border-line text-secondary hover:border-primary/40'}`}>
                      {a}g
                    </button>
                  ))}
                </div>

                {/* Custom */}
                <div className="flex items-center gap-2">
                  <input type="number" value={customQty} onChange={e => setCustomQty(e.target.value)} placeholder="Druga količina..."
                    className="flex-1 bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm" />
                  <span className="text-muted">g</span>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="bg-bg rounded-xl p-4 grid grid-cols-4 gap-3 text-center">
                    {[
                      { l: 'Kalorije', v: Math.round(preview.calories), u: 'kcal', accent: true },
                      { l: 'Proteini', v: Math.round(preview.protein_g), u: 'g' },
                      { l: 'Ugljeni h.', v: Math.round(preview.carbs_g), u: 'g' },
                      { l: 'Masti', v: Math.round(preview.fat_g), u: 'g' },
                    ].map(item => (
                      <div key={item.l}>
                        <p className={`text-base font-bold ${item.accent ? 'text-primary' : 'text-white'}`}>{item.v}</p>
                        <p className="text-muted text-xs">{item.u}</p>
                        <p className="text-muted text-xs">{item.l}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleAdd} disabled={activeQty <= 0}
                  className="w-full py-4 bg-primary hover:bg-primary-h text-white font-bold rounded-xl transition-colors disabled:opacity-30 text-base">
                  Dodaj {activeQty}g
                </button>
              </div>
            ) : (
              /* Search */
              <div className="flex flex-col px-5 pb-4 min-h-0">
                <div className="flex items-center justify-between py-2 mb-2">
                  <p className="text-white font-bold text-base">
                    Dodaj u {MEALS.find(m => m.id === pickerSlot)?.label}
                  </p>
                  <button onClick={() => setPickerSlot(null)} className="text-muted hover:text-white text-2xl">×</button>
                </div>
                <input
                  autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Pretraži namirnice..."
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3.5 text-white placeholder-muted outline-none focus:border-primary mb-3"
                />
                <div className="overflow-y-auto flex-1 max-h-60">
                  {results.length > 0 ? (
                    <div className="divide-y divide-line">
                      {results.map(food => (
                        <button key={food.id} onClick={() => setSelected(food)}
                          className="w-full flex items-center justify-between px-2 py-3 hover:bg-surface-alt transition-colors text-left">
                          <div>
                            <p className="text-white text-sm font-medium">{food.name_sr}</p>
                            <p className="text-muted text-xs">{food.calories_kcal} kcal · B{food.protein_g} U{food.carbs_g} M{food.fat_g} <span className="text-muted">(na 100g)</span></p>
                          </div>
                          <span className="text-primary text-xl">›</span>
                        </button>
                      ))}
                    </div>
                  ) : query.trim() ? (
                    <p className="text-muted text-sm text-center py-8">Nema rezultata za &quot;{query}&quot;</p>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-2xl mb-2">🔍</p>
                      <p className="text-muted text-sm">Počni da kucaš naziv namirnice</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MacroCard({ label, value, max, color, bgColor }: { label: string; value: number; max: number; color: string; bgColor: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = value > max
  return (
    <div className={`${bgColor} rounded-xl p-3`}>
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-bold text-white text-base">{Math.round(value)}<span className="text-muted font-normal text-xs">g</span></p>
      <p className="text-muted text-xs mb-2">/ {Math.round(max)}g</p>
      <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all ${over ? 'bg-danger' : ''}`}
          style={{ width: `${pct}%`, backgroundColor: over ? undefined : color }} />
      </div>
    </div>
  )
}
