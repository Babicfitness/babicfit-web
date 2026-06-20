'use client'

import { useState, useEffect } from 'react'
import { getAllDates, getEntries } from '@/lib/localStore'
import type { MealEntry, MealSlot } from '@/lib/localStore'

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Doručak', lunch: 'Ručak', dinner: 'Večera', snack1: 'Užina',
}
const MEAL_ORDER: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack1']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === today.toISOString().split('T')[0]) return 'Danas'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Juče'
  return d.toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })
}

function DayCard({ date, entries }: { date: string; entries: MealEntry[] }) {
  const [open, setOpen] = useState(false)
  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.calories, p: a.p + e.protein_g, uh: a.uh + e.carbs_g, m: a.m + e.fat_g }),
    { cal: 0, p: 0, uh: 0, m: 0 }
  )
  const mealGroups = MEAL_ORDER
    .map(slot => ({ slot, items: entries.filter(e => e.meal_slot === slot) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E4EAF4] shadow-sm">
      <button className="w-full flex items-center justify-between px-4 py-4 text-left" onClick={() => setOpen(o => !o)}>
        <div>
          <p className="text-[#1A2540] font-semibold capitalize">{formatDate(date)}</p>
          <p className="text-[#8A9BBF] text-xs mt-0.5">{entries.length} namirnic{entries.length === 1 ? 'a' : 'e'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[#4169E1] font-bold text-sm">{Math.round(totals.cal)} kcal</p>
            <p className="text-[#8A9BBF] text-xs">
              <span className="text-[#3B82F6]">P{Math.round(totals.p)}</span>
              {' '}<span className="text-green-600">UH{Math.round(totals.uh)}</span>
              {' '}<span className="text-amber-600">M{Math.round(totals.m)}</span>
            </p>
          </div>
          <span className="text-[#8A9BBF] text-lg">{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#E4EAF4]">
          {mealGroups.map(({ slot, items }) => {
            const mealCal = Math.round(items.reduce((s, e) => s + e.calories, 0))
            return (
              <div key={slot}>
                <div className="px-4 py-2 bg-[#F8FAFF] flex justify-between">
                  <p className="text-[#4A5A7A] text-xs font-bold uppercase tracking-wide">{MEAL_LABELS[slot]}</p>
                  <p className="text-[#8A9BBF] text-xs">{mealCal} kcal</p>
                </div>
                {items.map(e => (
                  <div key={e.id} className="flex items-center px-4 py-2.5 border-t border-[#F0F4FA] gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A2540] text-sm truncate">{e.food_name}</p>
                      <p className="text-[#8A9BBF] text-xs">
                        {e.quantity_g}g ·{' '}
                        <span className="text-[#4169E1] font-semibold">{Math.round(e.calories)} kcal</span>
                        {' · '}
                        <span className="text-[#3B82F6]">P{Math.round(e.protein_g)}</span>
                        {' '}
                        <span className="text-green-600">UH{Math.round(e.carbs_g)}</span>
                        {' '}
                        <span className="text-amber-600">M{Math.round(e.fat_g)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          <div className="px-4 py-3 bg-[#F8FAFF] border-t border-[#E4EAF4] grid grid-cols-4 gap-2 text-center">
            {[
              { l: 'Kalorije',   v: Math.round(totals.cal), u: 'kcal', c: '#4169E1' },
              { l: 'Proteini',   v: Math.round(totals.p),   u: 'g',    c: '#3B82F6' },
              { l: 'Ugljeni h.', v: Math.round(totals.uh),  u: 'g',    c: '#22C55E' },
              { l: 'Masti',      v: Math.round(totals.m),   u: 'g',    c: '#F59E0B' },
            ].map(item => (
              <div key={item.l}>
                <p className="text-sm font-black" style={{ color: item.c }}>{item.v}<span className="text-xs font-normal ml-0.5">{item.u}</span></p>
                <p className="text-[#8A9BBF] text-xs">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const [dates, setDates] = useState<string[]>([])
  const [allEntries, setAllEntries] = useState<MealEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const d = getAllDates()
    const today = new Date().toISOString().split('T')[0]
    const past = d.filter(date => date !== today)
    setDates(past)
    const entries: MealEntry[] = []
    past.forEach(date => entries.push(...getEntries(date)))
    setAllEntries(entries)
    setLoaded(true)
  }, [])

  if (!loaded) return <div className="min-h-screen bg-[#F0F4FA]" />

  if (dates.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-4xl mb-4">📅</p>
        <p className="text-[#1A2540] font-semibold text-lg mb-2">Nema istorije</p>
        <p className="text-[#8A9BBF] text-sm">Kada počneš da pratiš obroke, ovde ćeš videti šta si jeo/la.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-3 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[#1A2540] mb-4">Istorija ishrane</h1>
      {dates.map(date => (
        <DayCard key={date} date={date} entries={allEntries.filter(e => e.date === date)} />
      ))}
    </div>
  )
}
