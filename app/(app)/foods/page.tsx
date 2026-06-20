'use client'

import { useState, useEffect } from 'react'
import { getUserFoods, addUserFood, deleteUserFood } from '@/lib/localStore'
import { toSearchName } from '@/lib/search'
import { CATEGORIES } from '@/lib/foodData'
import type { UserFood } from '@/lib/localStore'

type Form = { name:string; category_id:string; calories_kcal:string; protein_g:string; carbs_g:string; fat_g:string }
const EMPTY: Form = { name:'', category_id:'cat-protein', calories_kcal:'', protein_g:'', carbs_g:'', fat_g:'' }
const INPUT = 'w-full bg-bg border border-line rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary transition-colors'

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
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Moje namirnice</h1>
        <button onClick={() => { setShowForm(!showForm); setError(null) }}
          className="bg-primary hover:bg-primary-h text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          {showForm ? 'Otkaži' : '+ Dodaj'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Nova namirnica (na 100g)</h3>
          <div className="flex flex-col gap-3">
            <div><label className="block text-muted text-xs mb-1">Naziv</label><input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="npr. Bakina sarma" className={INPUT} /></div>
            <div><label className="block text-muted text-xs mb-1">Kategorija</label>
              <select value={form.category_id} onChange={e => setField('category_id', e.target.value)} className={INPUT + ' bg-bg'}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-muted text-xs mb-1">Kalorije (kcal)</label><input type="number" min={0} value={form.calories_kcal} onChange={e => setField('calories_kcal', e.target.value)} className={INPUT} /></div>
              <div><label className="block text-muted text-xs mb-1">Proteini (g)</label><input type="number" min={0} value={form.protein_g} onChange={e => setField('protein_g', e.target.value)} className={INPUT} /></div>
              <div><label className="block text-muted text-xs mb-1">Ugljeni hidrati (g)</label><input type="number" min={0} value={form.carbs_g} onChange={e => setField('carbs_g', e.target.value)} className={INPUT} /></div>
              <div><label className="block text-muted text-xs mb-1">Masti (g)</label><input type="number" min={0} value={form.fat_g} onChange={e => setField('fat_g', e.target.value)} className={INPUT} /></div>
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button onClick={handleSave} className="w-full py-3.5 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors">Sačuvaj</button>
          </div>
        </div>
      )}

      {foods.length === 0
        ? <div className="text-center py-12"><p className="text-muted text-4xl mb-3">🥗</p><p className="text-secondary font-medium">Nema tvojih namirnica</p><p className="text-muted text-sm mt-1">Dodaj domaća jela koja nije u bazi</p></div>
        : <div className="bg-surface rounded-2xl overflow-hidden"><div className="divide-y divide-line">
            {foods.map(f => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-white text-sm font-medium truncate">{f.name}</p>
                  <p className="text-muted text-xs mt-0.5">{f.calories_kcal} kcal · B{f.protein_g}g U{f.carbs_g}g M{f.fat_g}g</p>
                </div>
                <button onClick={() => handleDelete(f.id)} className="text-muted hover:text-danger transition-colors text-lg px-1">×</button>
              </div>
            ))}
          </div></div>}
    </div>
  )
}
