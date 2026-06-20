'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toLikePattern } from '@/lib/search'
import { calcEntryMacros } from '@/lib/calculations'
import type { FoodItem } from '@/types/database'

type Props = {
  onClose: () => void
  onAdd: (food: FoodItem, quantity: number) => void
}

const QUICK_AMOUNTS = [50, 100, 150, 200, 250]

export default function FoodPickerModal({ onClose, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [customQty, setCustomQty] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  async function search(q: string) {
    setLoading(true)
    const supabase = createClient()
    const pattern = toLikePattern(q)

    const [{ data: systemFoods }, { data: userFoods }] = await Promise.all([
      supabase
        .from('system_foods')
        .select('id, category_id, name_sr, search_name, calories_kcal, protein_g, carbs_g, fat_g, unit_type, unit_weight_g')
        .ilike('search_name', pattern)
        .eq('is_active', true)
        .limit(20),
      supabase
        .from('user_foods')
        .select('id, category_id, name_sr, search_name, calories_kcal, protein_g, carbs_g, fat_g, unit_type, unit_weight_g')
        .ilike('search_name', pattern)
        .is('deleted_at', null)
        .limit(10),
    ])

    const combined: FoodItem[] = [
      ...(userFoods ?? []).map(f => ({ ...f, type: 'user' as const })),
      ...(systemFoods ?? []).map(f => ({ ...f, type: 'system' as const })),
    ]
    setResults(combined)
    setLoading(false)
  }

  const activeQty = customQty ? +customQty : quantity
  const preview = selected ? calcEntryMacros(selected, activeQty) : null

  function handleAdd() {
    if (!selected || activeQty <= 0) return
    onAdd(selected, activeQty)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-line rounded-full" />
        </div>

        {selected ? (
          /* ── Quantity picker ─────────────── */
          <div className="px-5 pb-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="text-muted hover:text-white text-2xl">‹</button>
              <div>
                <h3 className="text-white font-semibold text-lg">{selected.name_sr}</h3>
                <p className="text-muted text-xs">na 100g: {selected.calories_kcal} kcal · B{selected.protein_g}g U{selected.carbs_g}g M{selected.fat_g}g</p>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => { setQuantity(amt); setCustomQty('') }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    activeQty === amt && !customQty
                      ? 'bg-primary border-primary text-white'
                      : 'border-line text-secondary hover:border-primary/50'
                  }`}
                >
                  {amt}g
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customQty}
                onChange={e => setCustomQty(e.target.value)}
                placeholder="Druga količina..."
                className="flex-1 bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm"
              />
              <span className="text-muted text-sm">g</span>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-bg rounded-xl p-4 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Kalorije', value: `${Math.round(preview.calories)} kcal`, accent: true },
                  { label: 'Proteini', value: `${Math.round(preview.protein_g)}g` },
                  { label: 'Ugljeni h.', value: `${Math.round(preview.carbs_g)}g` },
                  { label: 'Masti', value: `${Math.round(preview.fat_g)}g` },
                ].map(item => (
                  <div key={item.label}>
                    <p className={`text-sm font-bold ${item.accent ? 'text-primary' : 'text-white'}`}>{item.value}</p>
                    <p className="text-muted text-xs mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={activeQty <= 0}
              className="w-full py-4 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              Dodaj {activeQty}g
            </button>
          </div>
        ) : (
          /* ── Search ─────────────── */
          <div className="flex flex-col min-h-0 px-5 pb-4">
            <h3 className="text-white font-semibold text-lg mb-3">Dodaj namirnicu</h3>

            <div className="relative mb-3">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Pretraži namirnice..."
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm"
              />
              {loading && (
                <span className="absolute right-4 top-3.5 text-muted text-xs">...</span>
              )}
            </div>

            <div className="overflow-y-auto flex-1 max-h-64">
              {results.length > 0 ? (
                <div className="divide-y divide-line">
                  {results.map(food => (
                    <button
                      key={`${food.type}-${food.id}`}
                      onClick={() => setSelected(food)}
                      className="w-full flex items-center justify-between px-2 py-3 hover:bg-surface-alt transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-white text-sm font-medium truncate">{food.name_sr}</p>
                        <p className="text-muted text-xs">{food.calories_kcal} kcal · B{food.protein_g}g U{food.carbs_g}g M{food.fat_g}g</p>
                      </div>
                      {food.type === 'user' && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full shrink-0">moja</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : query.length > 0 && !loading ? (
                <p className="text-muted text-sm py-4 text-center">Nema rezultata za "{query}"</p>
              ) : (
                <p className="text-muted text-sm py-4 text-center">Počni da kucaš...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
