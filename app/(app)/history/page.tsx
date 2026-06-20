'use client'

import { useState, useEffect } from 'react'
import { getAllDates, getEntries } from '@/lib/localStore'
import type { MealEntry, MealSlot } from '@/lib/localStore'

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Doručak',
  lunch:     'Ručak',
  dinner:    'Večera',
  snack1:    'Užina',
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
    <div className="bg-surface rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <p className="text-white font-semibold capitalize">{formatDate(date)}</p>
          <p className="text-muted text-xs mt-0.5">{entries.length} namirnic{entries.length === 1 ? 'a' : 'e'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-primary font-bold text-sm">{Math.round(totals.cal)} kcal</p>
            <p className="text-muted text-xs">P{Math.round(totals.p)} UH{Math.round(totals.uh)} M{Math.round(totals.m)}</p>
          </div>
          <span className="text-muted text-lg">{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-line">
          {mealGroups.map(({ slot, items }) => {
            const mealCal = Math.round(items.reduce((s, e) => s + e.calories, 0))
            return (
              <div key={slot}>
                <div className="px-4 py-2 bg-bg/50 flex justify-between">
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide">{MEAL_LABELS[slot]}</p>
                  <p className="text-muted text-xs">{mealCal} kcal</p>
                </div>
                {items.map(e => (
                  <div key={e.id} className="flex items-center px-4 py-2.5 border-t border-line/50 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{e.food_name}</p>
                      <p className="text-muted text-xs">
                        {e.quantity_g}g ·{' '}
                        <span className="text-primary">{Math.round(e.calories)} kcal</span>
                        {' '}· P{Math.round(e.protein_g)} UH{Math.round(e.carbs_g)} M{Math.round(e.fat_g)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Day totals */}
          <div className="px-4 py-3 bg-bg/30 border-t border-line grid grid-cols-4 gap-2 text-center">
            {[
              { l: 'Kalorije', v: Math.round(totals.cal), u: 'kcal', c: 'text-primary' },
              { l: 'Proteini', v: Math.round(totals.p), u: 'g', c: 'text-green-400' },
              { l: 'Ugljeni h.', v: Math.round(totals.uh), u: 'g', c: 'text-yellow-400' },
              { l: 'Masti', v: Math.round(totals.m), u: 'g', c: 'text-orange-400' },
            ].map(item => (
              <div key={item.l}>
                <p className={`text-sm font-black ${item.c}`}>{item.v}<span className="text-xs font-normal ml-0.5">{item.u}</span></p>
                <p className="text-muted text-xs">{item.l}</p>
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
    // Exclude today (shown in Moj plan)
    const past = d.filter(date => date !== today)
    setDates(past)

    const entries: MealEntry[] = []
    past.forEach(date => entries.push(...getEntries(date)))
    setAllEntries(entries)
    setLoaded(true)
  }, [])

  if (!loaded) return <div className="min-h-screen bg-bg" />

  if (dates.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-4xl mb-4">📅</p>
        <p className="text-white font-semibold text-lg mb-2">Nema istorije</p>
        <p className="text-muted text-sm">Kada počneš da pratiš obroke, ovde ćeš videti šta si jeo/la.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-3 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">Istorija ishrane</h1>
      {dates.map(date => (
        <DayCard
          key={date}
          date={date}
          entries={allEntries.filter(e => e.date === date)}
        />
      ))}
    </div>
  )
}
