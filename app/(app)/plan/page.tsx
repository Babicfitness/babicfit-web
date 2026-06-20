'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, getEntries, addEntry, removeEntry } from '@/lib/localStore'
import { calcEntryMacros } from '@/lib/calculations'
import { searchFoods } from '@/lib/foodData'
import type { MealEntry, MealSlot, Profile } from '@/lib/localStore'
import type { FoodItem } from '@/lib/foodData'

const MEALS: { id: MealSlot; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Doručak', icon: '🌅' },
  { id: 'lunch',     label: 'Ručak',   icon: '☀️' },
  { id: 'dinner',    label: 'Večera',  icon: '🌙' },
  { id: 'snack1',    label: 'Užina',   icon: '🍎' },
]

const MEAL_COLORS: Record<MealSlot, { bg: string; border: string; iconBg: string }> = {
  breakfast: { bg: '#FFF7ED', border: '#FED7AA', iconBg: '#FB923C' },
  lunch:     { bg: '#F0FDF4', border: '#BBF7D0', iconBg: '#22C55E' },
  dinner:    { bg: '#F5F3FF', border: '#DDD6FE', iconBg: '#8B5CF6' },
  snack1:    { bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#3B82F6' },
}

const today = new Date().toISOString().split('T')[0]

export default function PlanPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [activeSlot, setActiveSlot] = useState<MealSlot>('breakfast')
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const [addFood, setAddFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('100')

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

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 80)
  }, [showSearch])

  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.calories, p: a.p + e.protein_g, uh: a.uh + e.carbs_g, m: a.m + e.fat_g }),
    { cal: 0, p: 0, uh: 0, m: 0 }
  )

  const goals = profile
    ? { cal: profile.goal_calories, p: profile.goal_protein_g, uh: profile.goal_carbs_g, m: profile.goal_fat_g }
    : { cal: 2000, p: 150, uh: 200, m: 60 }

  const remaining = Math.max(0, Math.round(goals.cal - totals.cal))
  const slotEntries = entries.filter(e => e.meal_slot === activeSlot)
  const previewG = parseInt(grams) || 0
  const preview = addFood && previewG > 0 ? calcEntryMacros(addFood, previewG) : null

  function openAddFood(food: FoodItem) {
    const defaultG = food.serving_g ? String(food.serving_g) : '100'
    setAddFood(food); setGrams(defaultG); setShowSearch(false); setQuery(''); setResults([])
  }

  function confirmAdd(slot: MealSlot) {
    if (!addFood || previewG <= 0) return
    const macros = calcEntryMacros(addFood, previewG)
    const entry = addEntry({ date: today, meal_slot: slot, food_id: addFood.id, food_name: addFood.name_sr, quantity_g: previewG, ...macros })
    setEntries(p => [...p, entry])
    setActiveSlot(slot)
    setAddFood(null)
  }

  function handleRemove(id: string) {
    removeEntry(id); setEntries(p => p.filter(e => e.id !== id))
  }

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })

  if (!profile) return <div className="min-h-screen bg-[#F0F4FA]" />

  const calPct = Math.min((totals.cal / goals.cal) * 100, 100)
  const pPct   = Math.min((totals.p  / goals.p)   * 100, 100)
  const uhPct  = Math.min((totals.uh / goals.uh)  * 100, 100)
  const mPct   = Math.min((totals.m  / goals.m)   * 100, 100)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-16 space-y-4">
      <p className="text-[#8A9BBF] text-sm font-medium capitalize">{dateLabel}</p>

      {/* ── Daily overview card ───────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4EAF4]">
        {/* Calorie row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[#8A9BBF] text-xs font-semibold uppercase tracking-widest mb-1">Kalorije danas</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#1A2540] text-4xl font-black">{Math.round(totals.cal)}</span>
              <span className="text-[#8A9BBF] text-base">/ {Math.round(goals.cal)} kcal</span>
            </div>
          </div>
          <div className="text-right bg-[#F0F4FA] rounded-xl px-4 py-2.5">
            <p className="text-[#8A9BBF] text-xs mb-0.5">Preostalo</p>
            <p className={`text-2xl font-black ${totals.cal > goals.cal ? 'text-red-500' : 'text-[#4169E1]'}`}>
              {remaining}
            </p>
            <p className="text-[#8A9BBF] text-xs">kcal</p>
          </div>
        </div>

        {/* Calorie bar */}
        <div className="h-3 rounded-full bg-[#E4EAF4] mb-5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${calPct}%`, background: totals.cal > goals.cal ? '#EF4444' : 'linear-gradient(90deg, #4169E1, #6389FF)' }} />
        </div>

        {/* Proteini — hero */}
        <div className="rounded-xl p-4 mb-3 border border-blue-100" style={{ background: '#EFF6FF' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span className="text-[#1A2540] font-bold text-sm">Proteini</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-600">#1</span>
            </div>
            <span className="text-[#8A9BBF] text-xs font-medium">cilj: {Math.round(goals.p)}g</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[#3B82F6] text-3xl font-black">{Math.round(totals.p)}</span>
            <span className="text-[#8A9BBF] text-sm">g uneseno</span>
          </div>
          <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-[#3B82F6]"
              style={{ width: `${pPct}%`, backgroundColor: totals.p > goals.p ? '#EF4444' : '#3B82F6' }} />
          </div>
        </div>

        {/* UH + Masti */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 border border-green-100" style={{ background: '#F0FDF4' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-[#1A2540] text-xs font-bold">Ugljeni hidrati</span>
            </div>
            <p className="text-green-600 text-2xl font-black mb-1">
              {Math.round(totals.uh)}<span className="text-sm text-[#8A9BBF] font-medium"> / {Math.round(goals.uh)}g</span>
            </p>
            <div className="h-2 rounded-full bg-green-100 overflow-hidden">
              <div className="h-full rounded-full transition-all bg-green-500"
                style={{ width: `${uhPct}%`, backgroundColor: totals.uh > goals.uh ? '#EF4444' : '#22C55E' }} />
            </div>
          </div>
          <div className="rounded-xl p-3 border border-amber-100" style={{ background: '#FFFBEB' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[#1A2540] text-xs font-bold">Masti</span>
            </div>
            <p className="text-amber-600 text-2xl font-black mb-1">
              {Math.round(totals.m)}<span className="text-sm text-[#8A9BBF] font-medium"> / {Math.round(goals.m)}g</span>
            </p>
            <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${mPct}%`, backgroundColor: totals.m > goals.m ? '#EF4444' : '#F59E0B' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Meal tabs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {MEALS.map(meal => {
          const mealCal = Math.round(entries.filter(e => e.meal_slot === meal.id).reduce((s, e) => s + e.calories, 0))
          const active = activeSlot === meal.id
          const mc = MEAL_COLORS[meal.id]
          return (
            <button key={meal.id} onClick={() => setActiveSlot(meal.id)}
              className="rounded-xl py-3 px-2 text-center transition-all border-2"
              style={active
                ? { background: mc.bg, borderColor: mc.iconBg + '80' }
                : { background: '#fff', borderColor: '#E4EAF4' }}>
              <p className="text-xl mb-0.5">{meal.icon}</p>
              <p className="text-xs font-bold text-[#1A2540]">{meal.label}</p>
              <p className="text-[#8A9BBF] text-xs mt-0.5">{mealCal > 0 ? `${mealCal} kcal` : '—'}</p>
            </button>
          )
        })}
      </div>

      {/* ── Active meal card ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4EAF4]">
        <div className="px-4 py-3.5 border-b border-[#F0F4FA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{MEALS.find(m => m.id === activeSlot)?.icon}</span>
            <span className="text-[#1A2540] font-bold">{MEALS.find(m => m.id === activeSlot)?.label}</span>
            {slotEntries.length > 0 && (
              <span className="text-[#8A9BBF] text-xs">· {Math.round(slotEntries.reduce((s, e) => s + e.calories, 0))} kcal</span>
            )}
          </div>
          <button onClick={() => setShowSearch(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
            style={{ background: '#4169E1' }}>
            + Dodaj
          </button>
        </div>

        {slotEntries.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-[#8A9BBF] text-sm mb-4">Nema namirnica u ovom obroku</p>
            <button onClick={() => setShowSearch(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#4169E1' }}>
              + Dodaj namirnicu
            </button>
          </div>
        ) : (
          slotEntries.map(e => (
            <div key={e.id} className="flex items-center px-4 py-3 border-b border-[#F0F4FA] last:border-0 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#1A2540] text-sm font-semibold truncate">{e.food_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[#8A9BBF] text-xs">{e.quantity_g}g</span>
                  <span className="text-[#4169E1] text-xs font-bold">{Math.round(e.calories)} kcal</span>
                  <span className="text-[#3B82F6] text-xs font-semibold">P:{Math.round(e.protein_g)}g</span>
                  <span className="text-green-600 text-xs">UH:{Math.round(e.carbs_g)}g</span>
                  <span className="text-amber-600 text-xs">M:{Math.round(e.fat_g)}g</span>
                </div>
              </div>
              <button onClick={() => handleRemove(e.id)}
                className="text-[#CBD5E1] hover:text-red-400 text-xl transition-colors w-8 h-8 flex items-center justify-center shrink-0">×</button>
            </div>
          ))
        )}
      </div>

      {/* ── Search modal ─────────────────────────────────────── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
          <div className="w-full bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-[#E4EAF4] rounded-full" /></div>
            <div className="px-4 pb-3 flex items-center gap-3">
              <input ref={searchRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Pretraži namirnice..."
                className="flex-1 rounded-xl px-4 py-3 text-[#1A2540] text-sm outline-none border border-[#E4EAF4] bg-[#F0F4FA] focus:border-[#4169E1]"
              />
              <button onClick={() => setShowSearch(false)} className="text-[#8A9BBF] text-2xl w-9 h-9 flex items-center justify-center">×</button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-6">
              {results.length > 0 ? results.map(food => (
                <button key={food.id} onClick={() => openAddFood(food)}
                  className="w-full flex items-center justify-between py-3.5 border-b border-[#F0F4FA] last:border-0 text-left hover:bg-[#F8FAFF] rounded-lg px-2 -mx-2">
                  <div>
                    <p className="text-[#1A2540] text-sm font-semibold">{food.name_sr}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[#4169E1] text-xs font-bold">{food.calories_kcal} kcal</span>
                      <span className="text-[#3B82F6] text-xs font-semibold">P:{food.protein_g}g</span>
                      <span className="text-green-600 text-xs">UH:{food.carbs_g}g</span>
                      <span className="text-amber-600 text-xs">M:{food.fat_g}g</span>
                      <span className="text-[#CBD5E1] text-xs">/100g</span>
                    </div>
                  </div>
                  <span className="text-[#CBD5E1] text-xl ml-2">›</span>
                </button>
              )) : query.trim() ? (
                <p className="text-[#8A9BBF] text-sm text-center py-10">Nema rezultata za „{query}"</p>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-[#8A9BBF] text-sm">Počni da kucaš naziv namirnice</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add food modal ───────────────────────────────────── */}
      {addFood && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm" onClick={() => setAddFood(null)}>
          <div className="w-full bg-white rounded-t-3xl overflow-y-auto max-h-[92vh] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#E4EAF4] rounded-full" /></div>
            <div className="px-5 pt-4 pb-10">
              <p className="text-[#1A2540] font-black text-xl mb-0.5">Dodaj u obrok</p>
              <p className="text-[#3B82F6] font-bold text-sm mb-5">{addFood.name_sr}</p>

              <p className="text-[#8A9BBF] text-xs font-bold uppercase tracking-widest mb-2">Količina</p>
              <div className="flex items-center gap-3 mb-3">
                <input autoFocus type="number" value={grams} onChange={e => setGrams(e.target.value)} min="1"
                  className="flex-1 rounded-2xl px-4 py-4 text-[#1A2540] text-2xl font-black text-center outline-none border-2 border-[#E4EAF4] focus:border-[#4169E1] bg-[#F8FAFF]"
                />
                <span className="text-[#8A9BBF] text-xl font-semibold">g</span>
              </div>

              {/* Merice (ako namirnica ima serving_g) */}
              {addFood.serving_g && (
                <div className="mb-3">
                  <p className="text-[#8A9BBF] text-xs font-semibold mb-2">Merice ({addFood.serving_g}g / {addFood.serving_label})</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => {
                      const g = String(n * addFood.serving_g!)
                      return (
                        <button key={n} onClick={() => setGrams(g)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                          style={grams === g
                            ? { background: '#4169E1', borderColor: '#4169E1', color: '#fff' }
                            : { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#3B82F6' }}>
                          {n} {addFood.serving_label}<br />
                          <span className="font-normal opacity-75">{g}g</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Brze gramature */}
              <div className="flex gap-2 mb-4">
                {[50, 100, 150, 200, 250].map(a => (
                  <button key={a} onClick={() => setGrams(String(a))}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                    style={grams === String(a)
                      ? { background: '#4169E1', borderColor: '#4169E1', color: '#fff' }
                      : { background: '#F0F4FA', borderColor: '#E4EAF4', color: '#8A9BBF' }}>
                    {a}g
                  </button>
                ))}
              </div>

              {preview && (
                <div className="rounded-xl p-3.5 mb-5 grid grid-cols-4 gap-2 text-center bg-[#F8FAFF] border border-[#E4EAF4]">
                  {[
                    { l: 'kcal',  v: Math.round(preview.calories),          c: '#4169E1' },
                    { l: 'P (g)', v: preview.protein_g.toFixed(1),          c: '#3B82F6' },
                    { l: 'UH (g)',v: preview.carbs_g.toFixed(1),            c: '#22C55E' },
                    { l: 'M (g)', v: preview.fat_g.toFixed(1),              c: '#F59E0B' },
                  ].map(item => (
                    <div key={item.l}>
                      <p className="text-lg font-black" style={{ color: item.c }}>{item.v}</p>
                      <p className="text-xs text-[#8A9BBF]">{item.l}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[#8A9BBF] text-xs font-bold uppercase tracking-widest mb-3">Izaberi obrok:</p>
              <div className="space-y-2">
                {MEALS.map(meal => {
                  const mc = MEAL_COLORS[meal.id]
                  const mealCal = Math.round(entries.filter(e => e.meal_slot === meal.id).reduce((s, e) => s + e.calories, 0))
                  return (
                    <button key={meal.id} onClick={() => confirmAdd(meal.id)} disabled={previewG <= 0}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all disabled:opacity-40 hover:shadow-sm"
                      style={{ background: mc.bg, borderColor: mc.border }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        <div className="text-left">
                          <p className="text-[#1A2540] font-bold text-sm">{meal.label}</p>
                          <p className="text-[#8A9BBF] text-xs">{mealCal > 0 ? `${mealCal} kcal` : 'Prazan'}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ background: mc.iconBg }}>→</div>
                    </button>
                  )
                })}
              </div>

              <button onClick={() => setAddFood(null)}
                className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold text-[#8A9BBF] hover:text-[#4A5A7A] border border-[#E4EAF4] transition-colors">
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
