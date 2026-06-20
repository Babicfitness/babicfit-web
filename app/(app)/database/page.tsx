'use client'

import { useState, useMemo } from 'react'
import { SYSTEM_FOODS, CATEGORIES } from '@/lib/foodData'
import { normalizeQuery } from '@/lib/search'

export default function DatabasePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = SYSTEM_FOODS
    if (activeCategory) list = list.filter(f => f.category_id === activeCategory)
    if (query.trim()) {
      const q = normalizeQuery(query)
      list = list.filter(f => f.search_name.includes(q))
    }
    return list
  }, [activeCategory, query])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4">Baza namirnica</h1>
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Pretraži..."
        className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-primary text-sm mb-4" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Chip label="Sve" active={!activeCategory} onClick={() => setActiveCategory(null)} />
        {CATEGORIES.map(cat => (
          <Chip key={cat.id} label={`${cat.icon} ${cat.name}`} active={activeCategory===cat.id} onClick={() => setActiveCategory(activeCategory===cat.id ? null : cat.id)} />
        ))}
      </div>
      <div className="bg-surface rounded-2xl overflow-hidden">
        {filtered.length === 0
          ? <p className="text-muted text-sm px-4 py-6 text-center">Nema rezultata</p>
          : <div className="divide-y divide-line">
              {filtered.map(food => (
                <div key={food.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-white text-sm font-medium truncate">{food.name_sr}</p>
                    <p className="text-muted text-xs mt-0.5">B{food.protein_g}g · U{food.carbs_g}g · M{food.fat_g}g</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-primary font-semibold text-sm">{food.calories_kcal} kcal</p>
                    <p className="text-muted text-xs">100g</p>
                  </div>
                </div>
              ))}
            </div>}
      </div>
      <p className="text-muted text-xs text-center mt-3">{filtered.length} namirnica</p>
    </div>
  )
}

function Chip({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${active ? 'bg-primary border-primary text-white' : 'border-line text-muted hover:border-primary/50 hover:text-secondary'}`}>
      {label}
    </button>
  )
}
