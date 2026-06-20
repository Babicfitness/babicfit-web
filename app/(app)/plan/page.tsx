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

// SVG calorie ring
function CalRing({ eaten, goal }: { eaten: number; goal: number }) {
  const R = 80
  const C = 2 * Math.PI * R
  const pct = goal > 0 ? Math.min(eaten / goal, 1) : 0
  const over = goal > 0 && eaten > goal
  const dash = pct * C
  const remaining = Math.max(0, Math.round(goal - eaten))

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {/* Track */}
      <circle cx="100" cy="100" r={R} fill="none" stroke="#1E3052" strokeWidth="14" />
      {/* Progress */}
      <circle
        cx="100" cy="100" r={R} fill="none"
        stroke={over ? '#EF4444' : '#4169E1'}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        strokeDashoffset={C / 4}
        transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Center text */}
      <text x="100" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="800" fontFamily="system-ui">{remaining}</text>
      <text x="100" y="108" textAnchor="middle" fill="#8EA3BA" fontSize="13" fontFamily="system-ui">kcal preostalo</text>
      <text x="100" y="126" textAnchor="middle" fill="#4169E1" fontSize="12" fontFamily="system-ui">{Math.round(eaten)} / {Math.round(goal)}</text>
    </svg>
  )
}

function MacroCircle({ label, eaten, goal, color }: { label: string; eaten: number; goal: number; color: string }) {
  const R = 22
  const C = 2 * Math.PI * R
  const pct = goal > 0 ? Math.min(eaten / goal, 1) : 0
  const over = eaten > goal

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="none" stroke="#1E3052" strokeWidth="5" />
        <circle cx="30" cy="30" r={R} fill="none" stroke={over ? '#EF4444' : color}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${pct * C} ${C}`}
          strokeDashoffset={C / 4}
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="30" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="system-ui">
          {Math.round(eaten)}
        </text>
      </svg>
      <p className="text-muted text-xs text-center leading-tight">
        {label}<br />
        <span className="text-secondary">/ {Math.round(goal)}g</span>
      </p>
    </div>
  )
}

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
  const [openMeal, setOpenMeal] = useState<MealSlot | null>('breakfast')

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
    (a, e) => ({ calories: a.calories + e.calories, protein_g: a.protein_g + e.protein_g, carbs_g: a.carbs_g + e.carbs_g, fat_g: a.fat_g + e.fat_g }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const goals = profile
    ? { calories: profile.goal_calories, protein_g: profile.goal_protein_g, carbs_g: profile.goal_carbs_g, fat_g: profile.goal_fat_g }
    : { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 }

  const activeQty = customQty ? +customQty : qty
  const preview = selected ? calcEntryMacros(selected, activeQty) : null

  function openPicker(slot: MealSlot) {
    setPickerSlot(slot); setSelected(null); setQuery(''); setResults([]); setQty(100); setCustomQty('')
  }

  function handleAdd() {
    if (!selected || !pickerSlot || activeQty <= 0) return
    const macros = calcEntryMacros(selected, activeQty)
    const entry = addEntry({ date: today, meal_slot: pickerSlot, food_id: selected.id, food_name: selected.name_sr, quantity_g: activeQty, ...macros })
    setEntries(p => [...p, entry])
    setPickerSlot(null)
  }

  function handleRemove(id: string) {
    removeEntry(id); setEntries(p => p.filter(e => e.id !== id))
  }

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })

  if (!profile) return <div className="min-h-screen bg-bg" />

  return (
    <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">

      {/* Date */}
      <p className="text-muted text-sm capitalize">{dateLabel}</p>

      {/* Calorie ring card */}
      <div className="bg-surface rounded-2xl pt-5 pb-6 px-4">
        <CalRing eaten={totals.calories} goal={goals.calories} />

        {/* Macro rings */}
        <div className="flex justify-around mt-4">
          <MacroCircle label="Proteini" eaten={totals.protein_g} goal={goals.protein_g} color="#4ADE80" />
          <MacroCircle label="Ugljeni h." eaten={totals.carbs_g} goal={goals.carbs_g} color="#FACC15" />
          <MacroCircle label="Masti" eaten={totals.fat_g} goal={goals.fat_g} color="#FB923C" />
        </div>
      </div>

      {/* Meals */}
      {MEALS.map(meal => {
        const slotEntries = entries.filter(e => e.meal_slot === meal.id)
        const slotCal = Math.round(slotEntries.reduce((s, e) => s + e.calories, 0))
        const isOpen = openMeal === meal.id

        return (
          <div key={meal.id} className="bg-surface rounded-2xl overflow-hidden">
            {/* Header */}
            <button
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              onClick={() => setOpenMeal(isOpen ? null : meal.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{meal.icon}</span>
                <div>
                  <p className="text-white font-semibold">{meal.label}</p>
                  <p className="text-muted text-xs">
                    {slotCal > 0 ? `${slotCal} kcal · ${slotEntries.length} namirnic${slotEntries.length === 1 ? 'a' : 'e'}` : 'Nije uneto'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {slotCal > 0 && (
                  <span className="text-primary text-sm font-bold">{slotCal}</span>
                )}
                <span className="text-muted text-lg">{isOpen ? '▾' : '▸'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-line">
                {slotEntries.map(e => (
                  <div key={e.id} className="flex items-center px-4 py-3 border-b border-line last:border-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{e.food_name}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {e.quantity_g}g ·{' '}
                        <span className="text-primary">{Math.round(e.calories)} kcal</span>
                        {' '}· P{Math.round(e.protein_g)} UH{Math.round(e.carbs_g)} M{Math.round(e.fat_g)}
                      </p>
                    </div>
                    <button onClick={() => handleRemove(e.id)} className="text-muted hover:text-danger text-xl transition-colors shrink-0">×</button>
                  </div>
                ))}

                <div className="px-4 py-3">
                  <button
                    onClick={() => openPicker(meal.id)}
                    className="w-full py-2.5 border-2 border-dashed border-line hover:border-primary/50 text-muted hover:text-primary rounded-xl text-sm font-medium transition-all"
                  >
                    + Dodaj namirnicu
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Food picker */}
      {pickerSlot && (
        <div className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm flex items-end" onClick={() => setPickerSlot(null)}>
          <div className="w-full bg-surface rounded-t-2xl max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-line rounded-full" /></div>

            {selected ? (
              <div className="px-5 pb-8 flex flex-col gap-4 overflow-y-auto">
                <div className="flex items-center gap-3 py-2">
                  <button onClick={() => setSelected(null)} className="text-muted text-2xl">‹</button>
                  <div>
                    <p className="text-white font-bold">{selected.name_sr}</p>
                    <p className="text-muted text-xs">Na 100g: {selected.calories_kcal} kcal · P{selected.protein_g} UH{selected.carbs_g} M{selected.fat_g}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {QUICK.map(a => (
                    <button key={a} onClick={() => { setQty(a); setCustomQty('') }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeQty === a && !customQty ? 'bg-primary border-primary text-white' : 'border-line text-secondary'}`}>
                      {a}g
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input type="number" value={customQty} onChange={e => setCustomQty(e.target.value)} placeholder="Unesi količinu..."
                    className="flex-1 bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm" />
                  <span className="text-muted">g</span>
                </div>

                {preview && (
                  <div className="bg-bg rounded-xl p-4 grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: 'Kalorije', v: Math.round(preview.calories), u: 'kcal', c: 'text-primary' },
                      { l: 'Proteini', v: Math.round(preview.protein_g), u: 'g', c: 'text-green-400' },
                      { l: 'Ugljeni h.', v: Math.round(preview.carbs_g), u: 'g', c: 'text-yellow-400' },
                      { l: 'Masti', v: Math.round(preview.fat_g), u: 'g', c: 'text-orange-400' },
                    ].map(item => (
                      <div key={item.l}>
                        <p className={`text-lg font-black ${item.c}`}>{item.v}</p>
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
              <div className="flex flex-col px-5 pb-4 min-h-0">
                <div className="flex items-center justify-between py-3 mb-1">
                  <p className="text-white font-bold">Dodaj u {MEALS.find(m => m.id === pickerSlot)?.label}</p>
                  <button onClick={() => setPickerSlot(null)} className="text-muted text-2xl">×</button>
                </div>
                <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Pretraži namirnice..."
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary mb-3"
                />
                <div className="overflow-y-auto flex-1 max-h-64">
                  {results.length > 0 ? (
                    <div className="divide-y divide-line">
                      {results.map(food => (
                        <button key={food.id} onClick={() => setSelected(food)}
                          className="w-full flex items-center justify-between px-2 py-3 hover:bg-surface-alt transition-colors text-left">
                          <div>
                            <p className="text-white text-sm font-medium">{food.name_sr}</p>
                            <p className="text-muted text-xs">{food.calories_kcal} kcal · P{food.protein_g} UH{food.carbs_g} M{food.fat_g} <span className="opacity-60">/100g</span></p>
                          </div>
                          <span className="text-primary text-xl ml-2">›</span>
                        </button>
                      ))}
                    </div>
                  ) : query.trim() ? (
                    <p className="text-muted text-sm text-center py-10">Nema rezultata</p>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-4xl mb-3">🔍</p>
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
