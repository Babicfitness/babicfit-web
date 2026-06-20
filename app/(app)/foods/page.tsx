'use client'

import { useState, useEffect } from 'react'
import { getUserFoods, addUserFood, deleteUserFood } from '@/lib/localStore'
import { toSearchName } from '@/lib/search'
import { CATEGORIES } from '@/lib/foodData'
import type { UserFood } from '@/lib/localStore'

type Form = { name:string; category_id:string; calories_kcal:string; protein_g:string; carbs_g:string; fat_g:string }
const EMPTY: Form = { name:'', category_id:'cat-mlecni', calories_kcal:'', protein_g:'', carbs_g:'', fat_g:'' }

const INPUT = 'w-full bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-3 py-2.5 text-[#1A2540] text-sm outline-none focus:border-[#4169E1] transition-colors placeholder-[#8A9BBF]'

export default function FoodsPage() {
  const [foods, setFoods] = useState<UserFood[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setFoods(getUserFoods()) }, [])

  function setField(k: keyof Form, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSave() {
    if (!form.name.trim() || !form.calories_kcal) { setError('Unesite ime i kalorije.'); return }
    const newFood = addUserFood({
      name: form.name.trim(), category_id: form.category_id,
      calories_kcal: +form.calories_kcal, protein_g: +(form.protein_g||0),
      carbs_g: +(form.carbs_g||0), fat_g: +(form.fat_g||0),
    })
    setFoods(prev => [newFood, ...prev])
    setForm(EMPTY); setShowForm(false); setError(null)
  }

  function handleDelete(id: string) {
    deleteUserFood(id)
    setFoods(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A2540]">Moje namirnice</h1>
        <button onClick={() => { setShowForm(!showForm); setError(null) }}
          className="bg-[#4169E1] hover:bg-[#2F56D0] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
          {showForm ? 'Otkaži' : '+ Dodaj'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 mb-5 border border-[#E4EAF4] shadow-sm">
          <h3 className="text-[#1A2540] font-bold mb-4">Nova namirnica <span className="text-[#8A9BBF] font-normal text-sm">(vrednosti na 100g)</span></h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[#8A9BBF] text-xs font-semibold uppercase tracking-widest mb-1.5">Naziv</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="npr. Bakina sarma" className={INPUT} />
            </div>
            <div>
              <label className="block text-[#8A9BBF] text-xs font-semibold uppercase tracking-widest mb-1.5">Kategorija</label>
              <select value={form.category_id} onChange={e => setField('category_id', e.target.value)}
                className="w-full bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-3 py-2.5 text-[#1A2540] text-sm outline-none focus:border-[#4169E1] transition-colors">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8A9BBF] text-xs font-semibold mb-1.5">Kalorije (kcal)</label>
                <input type="number" min={0} value={form.calories_kcal} onChange={e => setField('calories_kcal', e.target.value)} className={INPUT} placeholder="0" />
              </div>
              <div>
                <label className="block text-[#8A9BBF] text-xs font-semibold mb-1.5">Proteini (g)</label>
                <input type="number" min={0} value={form.protein_g} onChange={e => setField('protein_g', e.target.value)} className={INPUT} placeholder="0" />
              </div>
              <div>
                <label className="block text-[#8A9BBF] text-xs font-semibold mb-1.5">Ugljeni hidrati (g)</label>
                <input type="number" min={0} value={form.carbs_g} onChange={e => setField('carbs_g', e.target.value)} className={INPUT} placeholder="0" />
              </div>
              <div>
                <label className="block text-[#8A9BBF] text-xs font-semibold mb-1.5">Masti (g)</label>
                <input type="number" min={0} value={form.fat_g} onChange={e => setField('fat_g', e.target.value)} className={INPUT} placeholder="0" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSave}
              className="w-full py-3.5 bg-[#4169E1] hover:bg-[#2F56D0] text-white font-bold rounded-xl transition-colors shadow-md">
              Sačuvaj
            </button>
          </div>
        </div>
      )}

      {foods.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🥗</p>
          <p className="text-[#1A2540] font-semibold text-lg mb-1">Nema tvojih namirnica</p>
          <p className="text-[#8A9BBF] text-sm">Dodaj domaća jela koja nisu u bazi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {foods.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-[#E4EAF4] shadow-sm flex items-center px-4 py-3.5 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#1A2540] text-sm font-semibold truncate">{f.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#4169E1] text-xs font-bold">{f.calories_kcal} kcal</span>
                  <span className="text-[#3B82F6] text-xs font-semibold">P{f.protein_g}g</span>
                  <span className="text-green-600 text-xs">UH{f.carbs_g}g</span>
                  <span className="text-amber-600 text-xs">M{f.fat_g}g</span>
                </div>
              </div>
              <button onClick={() => handleDelete(f.id)}
                className="text-[#CBD5E1] hover:text-red-400 transition-colors text-2xl w-8 h-8 flex items-center justify-center shrink-0">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
