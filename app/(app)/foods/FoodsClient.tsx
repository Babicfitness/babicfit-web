'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toSearchName } from '@/lib/search'
import type { UserFood, FoodCategory } from '@/types/database'

type Props = {
  initialFoods: UserFood[]
  categories: FoodCategory[]
}

type FoodForm = {
  name_sr: string
  category_id: string
  calories_kcal: string
  protein_g: string
  carbs_g: string
  fat_g: string
}

const EMPTY_FORM: FoodForm = {
  name_sr: '', category_id: 'cat-protein',
  calories_kcal: '', protein_g: '', carbs_g: '', fat_g: '',
}

export default function FoodsClient({ initialFoods, categories }: Props) {
  const [foods, setFoods] = useState<UserFood[]>(initialFoods)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FoodForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(key: keyof FoodForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name_sr.trim() || !form.calories_kcal) {
      setError('Unesite ime i kalorije.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { data, error: err } = await supabase
      .from('user_foods')
      .insert({
        category_id:   form.category_id,
        name_sr:       form.name_sr.trim(),
        search_name:   toSearchName(form.name_sr),
        calories_kcal: +form.calories_kcal,
        protein_g:     +(form.protein_g || 0),
        carbs_g:       +(form.carbs_g || 0),
        fat_g:         +(form.fat_g || 0),
        unit_type:     'gram',
      })
      .select()
      .single()

    if (err || !data) {
      setError('Greška pri čuvanju.')
    } else {
      setFoods(prev => [data as UserFood, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('user_foods').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    setFoods(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Moje namirnice</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          className="bg-primary hover:bg-primary-h text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {showForm ? 'Otkaži' : '+ Dodaj'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-surface rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Nova namirnica (na 100g)</h3>
          <div className="flex flex-col gap-3">
            <Field label="Naziv">
              <input value={form.name_sr} onChange={e => setField('name_sr', e.target.value)}
                placeholder="npr. Bakina sarma" className={INPUT_CLS} />
            </Field>

            <Field label="Kategorija">
              <select value={form.category_id} onChange={e => setField('category_id', e.target.value)}
                className={INPUT_CLS + ' bg-bg'}>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name_sr}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Kalorije (kcal)">
                <input type="number" min={0} value={form.calories_kcal}
                  onChange={e => setField('calories_kcal', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Proteini (g)">
                <input type="number" min={0} value={form.protein_g}
                  onChange={e => setField('protein_g', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Ugljeni hidrati (g)">
                <input type="number" min={0} value={form.carbs_g}
                  onChange={e => setField('carbs_g', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Masti (g)">
                <input type="number" min={0} value={form.fat_g}
                  onChange={e => setField('fat_g', e.target.value)} className={INPUT_CLS} />
              </Field>
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-primary hover:bg-primary-h text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {saving ? 'Čuvam...' : 'Sačuvaj'}
            </button>
          </div>
        </div>
      )}

      {/* Food list */}
      {foods.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-4xl mb-3">🥗</p>
          <p className="text-secondary font-medium">Nema tvojih namirnica</p>
          <p className="text-muted text-sm mt-1">Dodaj domaća jela koja nije u bazi</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="divide-y divide-line">
            {foods.map(food => (
              <div key={food.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-white text-sm font-medium truncate">{food.name_sr}</p>
                  <p className="text-muted text-xs mt-0.5">
                    {food.calories_kcal} kcal · B{food.protein_g}g U{food.carbs_g}g M{food.fat_g}g
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(food.id)}
                  className="text-muted hover:text-danger transition-colors text-lg px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const INPUT_CLS = 'w-full bg-bg border border-line rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted text-xs mb-1">{label}</label>
      {children}
    </div>
  )
}
