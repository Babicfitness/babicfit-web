'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, getEntries, addEntry, removeEntry } from '@/lib/localStore'
import { calcEntryMacros } from '@/lib/calculations'
import { searchFoods, SYSTEM_FOODS } from '@/lib/foodData'
import type { MealEntry, MealSlot, Profile } from '@/lib/localStore'
import type { FoodItem } from '@/lib/foodData'

const MEAL_SLOTS: { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'Doručak' },
  { id: 'lunch',     label: 'Ručak' },
  { id: 'dinner',    label: 'Večera' },
  { id: 'snack1',    label: 'Užina' },
]

const QUICK_AMOUNTS = [50, 100, 150, 200, 250]
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

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories, protein_g: acc.protein_g + e.protein_g,
    carbs_g: acc.carbs_g + e.carbs_g, fat_g: acc.fat_g + e.fat_g,
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })

  const goals = profile ? {
    calories: profile.goal_calories, protein_g: profile.goal_protein_g,
    carbs_g: profile.goal_carbs_g, fat_g: profile.goal_fat_g,
  } : { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }

  const activeQty = customQty ? +customQty : qty
  const preview = selected ? calcEntryMacros(selected, activeQty) : null

  function handleAdd() {
    if (!selected || !pickerSlot || activeQty <= 0) return
    const macros = calcEntryMacros(selected, activeQty)
    const newEntry = addEntry({
      date: today, meal_slot: pickerSlot,
      food_id: selected.id, food_name: selected.name_sr,
      quantity_g: activeQty, ...macros,
    })
    setEntries(prev => [...prev, newEntry])
    setSelected(null); setQuery(''); setResults([]); setQty(100); setCustomQty(''); setPickerSlot(null)
  }

  function handleRemove(id: string) {
    removeEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday:'long', day:'numeric', month:'long' })

  if (!profile) return <div className="min-h-screen bg-bg" />

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white capitalize">{dateLabel}</h1>
        <p className="text-muted text-sm mt-0.5">Zdravo, {profile.first_name}!</p>
      </div>

      {/* Macro summary */}
      <div className="bg-surface rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-secondary font-medium">Kalorije</span>
          <span className="text-white text-lg font-bold">
            {Math.round(totals.calories)}
            <span className="text-muted text-sm font-normal"> / {Math.round(goals.calories)} kcal</span>
          </span>
        </div>
        <ProgressBar value={totals.calories} max={goals.calories} color="bg-primary" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          <MacroBar label="Proteini" value={totals.protein_g} max={goals.protein_g} color="bg-protein" />
          <MacroBar label="Ugljeni h." value={totals.carbs_g} max={goals.carbs_g} color="bg-carbs" />
          <MacroBar label="Masti" value={totals.fat_g} max={goals.fat_g} color="bg-fat" />
        </div>
      </div>

      {/* Meal slots */}
      {MEAL_SLOTS.map(slot => {
        const slotEntries = entries.filter(e => e.meal_slot === slot.id)
        const slotCal = slotEntries.reduce((s, e) => s + e.calories, 0)
        return (
          <div key={slot.id} className="bg-surface rounded-2xl mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <div>
                <span className="font-semibold text-white">{slot.label}</span>
                {slotEntries.length > 0 && <span className="text-muted text-sm ml-2">{Math.round(slotCal)} kcal</span>}
              </div>
              <button onClick={() => { setPickerSlot(slot.id); setSelected(null); setQuery(''); setResults([]) }}
                className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center text-lg font-bold leading-none">+</button>
            </div>
            {slotEntries.length > 0 ? (
              <div className="divide-y divide-line">
                {slotEntries.map(e => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-white text-sm font-medium truncate">{e.food_name}</p>
                      <p className="text-muted text-xs">{e.quantity_g}g · {Math.round(e.calories)} kcal · B{Math.round(e.protein_g)}g U{Math.round(e.carbs_g)}g M{Math.round(e.fat_g)}g</p>
                    </div>
                    <button onClick={() => handleRemove(e.id)} className="text-muted hover:text-danger transition-colors text-lg px-1">×</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-sm px-4 py-3">Nema unetih namirnica</p>}
          </div>
        )
      })}

      {/* Food picker modal */}
      {pickerSlot && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg/80 backdrop-blur-sm" onClick={() => setPickerSlot(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-line rounded-full" /></div>
            {selected ? (
              <div className="px-5 pb-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)} className="text-muted hover:text-white text-2xl">‹</button>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selected.name_sr}</h3>
                    <p className="text-muted text-xs">na 100g: {selected.calories_kcal} kcal · B{selected.protein_g}g U{selected.carbs_g}g M{selected.fat_g}g</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setQty(a); setCustomQty('') }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeQty===a&&!customQty ? 'bg-primary border-primary text-white' : 'border-line text-secondary'}`}>
                      {a}g
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={customQty} onChange={e => setCustomQty(e.target.value)} placeholder="Druga količina..."
                    className="flex-1 bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm" />
                  <span className="text-muted text-sm">g</span>
                </div>
                {preview && (
                  <div className="bg-bg rounded-xl p-4 grid grid-cols-4 gap-2 text-center">
                    {[{l:'Kalorije',v:`${Math.round(preview.calories)} kcal`,a:true},{l:'Proteini',v:`${Math.round(preview.protein_g)}g`},{l:'Ugljeni h.',v:`${Math.round(preview.carbs_g)}g`},{l:'Masti',v:`${Math.round(preview.fat_g)}g`}].map(item => (
                      <div key={item.l}><p className={`text-sm font-bold ${item.a ? 'text-primary' : 'text-white'}`}>{item.v}</p><p className="text-muted text-xs mt-0.5">{item.l}</p></div>
                    ))}
                  </div>
                )}
                <button onClick={handleAdd} disabled={activeQty <= 0} className="w-full py-4 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors disabled:opacity-40">
                  Dodaj {activeQty}g
                </button>
              </div>
            ) : (
              <div className="flex flex-col px-5 pb-4 min-h-0">
                <h3 className="text-white font-semibold text-lg mb-3">Dodaj namirnicu</h3>
                <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Pretraži namirnice..."
                  className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm mb-3" />
                <div className="overflow-y-auto max-h-64">
                  {results.length > 0 ? (
                    <div className="divide-y divide-line">
                      {results.map(food => (
                        <button key={food.id} onClick={() => setSelected(food)}
                          className="w-full flex items-center justify-between px-2 py-3 hover:bg-surface-alt transition-colors text-left">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-white text-sm font-medium truncate">{food.name_sr}</p>
                            <p className="text-muted text-xs">{food.calories_kcal} kcal · B{food.protein_g}g U{food.carbs_g}g M{food.fat_g}g</p>
                          </div>
                          {food.type === 'user' && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full shrink-0">moja</span>}
                        </button>
                      ))}
                    </div>
                  ) : query ? <p className="text-muted text-sm py-4 text-center">Nema rezultata</p>
                    : <p className="text-muted text-sm py-4 text-center">Počni da kucaš...</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ value, max, color }: { value:number; max:number; color:string }) {
  const pct = max > 0 ? Math.min((value/max)*100, 100) : 0
  const over = max > 0 && value > max
  return <div className="h-2 bg-line rounded-full overflow-hidden"><div className={`h-2 rounded-full transition-all ${over ? 'bg-danger' : color}`} style={{ width:`${pct}%` }} /></div>
}

function MacroBar({ label, value, max, color }: { label:string; value:number; max:number; color:string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-muted text-xs">{label}</span>
        <span className="text-secondary text-xs">{Math.round(value)}g</span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
      <p className="text-muted text-xs mt-1">/ {Math.round(max)}g</p>
    </div>
  )
}
