'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcEntryMacros } from '@/lib/calculations'
import FoodPickerModal from '@/components/FoodPickerModal'
import type { DailyLog, MealEntry, Profile, FoodItem } from '@/types/database'

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Doručak' },
  { id: 'lunch',     label: 'Ručak' },
  { id: 'dinner',    label: 'Večera' },
  { id: 'snack1',    label: 'Užina' },
] as const

type MealSlot = typeof MEAL_SLOTS[number]['id']

type Props = {
  profile: Profile
  dailyLog: DailyLog
  initialEntries: MealEntry[]
}

export default function PlanClient({ profile, dailyLog, initialEntries }: Props) {
  const [entries, setEntries] = useState<MealEntry[]>(initialEntries)
  const [log, setLog] = useState<DailyLog>(dailyLog)
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null)

  const goals = {
    calories:  log.goal_calories,
    protein_g: log.goal_protein_g,
    carbs_g:   log.goal_carbs_g,
    fat_g:     log.goal_fat_g,
  }
  const totals = {
    calories:  entries.filter(e => !e.deleted_at).reduce((s, e) => s + e.entry_calories, 0),
    protein_g: entries.filter(e => !e.deleted_at).reduce((s, e) => s + e.entry_protein_g, 0),
    carbs_g:   entries.filter(e => !e.deleted_at).reduce((s, e) => s + e.entry_carbs_g, 0),
    fat_g:     entries.filter(e => !e.deleted_at).reduce((s, e) => s + e.entry_fat_g, 0),
  }

  const addEntry = useCallback(async (food: FoodItem, quantity: number, slot: MealSlot) => {
    const macros = calcEntryMacros(food, quantity)
    const supabase = createClient()

    const newEntry = {
      daily_log_id:       log.id,
      meal_slot:          slot,
      system_food_id:     food.type === 'system' ? food.id : null,
      user_food_id:       food.type === 'user'   ? food.id : null,
      recipe_id:          null,
      quantity_value:     quantity,
      quantity_unit:      'g',
      entry_calories:     macros.calories,
      entry_protein_g:    macros.protein_g,
      entry_carbs_g:      macros.carbs_g,
      entry_fat_g:        macros.fat_g,
      food_name_snapshot: food.name_sr,
      sort_order:         entries.filter(e => e.meal_slot === slot).length,
    }

    const { data, error } = await supabase
      .from('meal_entries')
      .insert(newEntry)
      .select()
      .single()

    if (error || !data) return

    const newEntries = [...entries, data as MealEntry]
    setEntries(newEntries)

    // Recalculate totals and update daily_log
    const newTotals = newEntries.reduce(
      (acc, e) => ({
        calories:  acc.calories  + e.entry_calories,
        protein_g: acc.protein_g + e.entry_protein_g,
        carbs_g:   acc.carbs_g   + e.entry_carbs_g,
        fat_g:     acc.fat_g     + e.entry_fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    )

    await supabase
      .from('daily_logs')
      .update({
        total_calories:  newTotals.calories,
        total_protein_g: newTotals.protein_g,
        total_carbs_g:   newTotals.carbs_g,
        total_fat_g:     newTotals.fat_g,
      })
      .eq('id', log.id)

    setLog(prev => ({ ...prev, ...newTotals.calories === undefined ? {} : {
      total_calories:  newTotals.calories,
      total_protein_g: newTotals.protein_g,
      total_carbs_g:   newTotals.carbs_g,
      total_fat_g:     newTotals.fat_g,
    }}))
    setPickerSlot(null)
  }, [entries, log.id])

  const removeEntry = useCallback(async (entryId: string) => {
    const supabase = createClient()
    await supabase
      .from('meal_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId)

    const remaining = entries.map(e =>
      e.id === entryId ? { ...e, deleted_at: new Date().toISOString() } : e,
    )
    setEntries(remaining)

    const newTotals = remaining
      .filter(e => !e.deleted_at)
      .reduce(
        (acc, e) => ({
          calories:  acc.calories  + e.entry_calories,
          protein_g: acc.protein_g + e.entry_protein_g,
          carbs_g:   acc.carbs_g   + e.entry_carbs_g,
          fat_g:     acc.fat_g     + e.entry_fat_g,
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      )

    await supabase
      .from('daily_logs')
      .update({
        total_calories:  newTotals.calories,
        total_protein_g: newTotals.protein_g,
        total_carbs_g:   newTotals.carbs_g,
        total_fat_g:     newTotals.fat_g,
      })
      .eq('id', log.id)
  }, [entries, log.id])

  const dateLabel = new Date().toLocaleDateString('sr-Latn-RS', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white capitalize">{dateLabel}</h1>
        <p className="text-muted text-sm mt-0.5">Zdravo, {profile.first_name}!</p>
      </div>

      {/* Macro summary card */}
      <div className="bg-surface rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-secondary font-medium">Kalorije</span>
          <span className="text-white text-lg font-bold">
            {Math.round(totals.calories)}
            <span className="text-muted text-sm font-normal"> / {Math.round(goals.calories)} kcal</span>
          </span>
        </div>
        {/* Calorie progress */}
        <ProgressBar value={totals.calories} max={goals.calories} color="bg-primary" />

        {/* Macros row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <MacroBar label="Proteini" value={totals.protein_g} max={goals.protein_g} color="bg-protein" unit="g" />
          <MacroBar label="Ugljeni h." value={totals.carbs_g} max={goals.carbs_g} color="bg-carbs" unit="g" />
          <MacroBar label="Masti" value={totals.fat_g} max={goals.fat_g} color="bg-fat" unit="g" />
        </div>
      </div>

      {/* Meal slots */}
      {MEAL_SLOTS.map(slot => {
        const slotEntries = entries.filter(e => e.meal_slot === slot.id && !e.deleted_at)
        const slotCal = slotEntries.reduce((s, e) => s + e.entry_calories, 0)
        return (
          <div key={slot.id} className="bg-surface rounded-2xl mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <div>
                <span className="font-semibold text-white">{slot.label}</span>
                {slotEntries.length > 0 && (
                  <span className="text-muted text-sm ml-2">{Math.round(slotCal)} kcal</span>
                )}
              </div>
              <button
                onClick={() => setPickerSlot(slot.id)}
                className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center text-lg font-bold leading-none transition-colors"
              >
                +
              </button>
            </div>

            {slotEntries.length > 0 ? (
              <div className="divide-y divide-line">
                {slotEntries.map(entry => (
                  <EntryRow key={entry.id} entry={entry} onRemove={removeEntry} />
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-muted text-sm">Nema unetih namirnica</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Food picker modal */}
      {pickerSlot && (
        <FoodPickerModal
          onClose={() => setPickerSlot(null)}
          onAdd={(food, qty) => addEntry(food, qty, pickerSlot)}
        />
      )}
    </div>
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const over = max > 0 && value > max
  return (
    <div className="h-2 bg-line rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all ${over ? 'bg-danger' : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function MacroBar({ label, value, max, color, unit }: {
  label: string; value: number; max: number; color: string; unit: string
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-muted text-xs">{label}</span>
        <span className="text-secondary text-xs">{Math.round(value)}{unit}</span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
      <p className="text-muted text-xs mt-1">/ {Math.round(max)}{unit}</p>
    </div>
  )
}

function EntryRow({ entry, onRemove }: { entry: MealEntry; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-white text-sm font-medium truncate">{entry.food_name_snapshot}</p>
        <p className="text-muted text-xs">
          {entry.quantity_value}{entry.quantity_unit} · {Math.round(entry.entry_calories)} kcal ·
          B:{Math.round(entry.entry_protein_g)}g U:{Math.round(entry.entry_carbs_g)}g M:{Math.round(entry.entry_fat_g)}g
        </p>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="text-muted hover:text-danger transition-colors text-lg px-1"
      >
        ×
      </button>
    </div>
  )
}
