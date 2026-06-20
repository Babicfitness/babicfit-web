'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRecipes, deleteRecipe } from '@/lib/localStore'
import type { Recipe } from '@/lib/localStore'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  useEffect(() => { setRecipes(getRecipes()) }, [])

  function handleDelete(id: string) {
    deleteRecipe(id)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Moji recepti</h1>
        <Link href="/recipes/new" className="bg-primary hover:bg-primary-h text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">+ Novi</Link>
      </div>
      {recipes.length === 0
        ? <div className="text-center py-16"><p className="text-muted text-4xl mb-3">📖</p><p className="text-secondary font-medium">Nema recepata</p><p className="text-muted text-sm mt-1">Kreiraj recept od više namirnica</p></div>
        : <div className="bg-surface rounded-2xl overflow-hidden"><div className="divide-y divide-line">
            {recipes.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-4">
                <Link href={`/recipes/${r.id}`} className="flex-1 min-w-0 mr-3">
                  <p className="text-white font-medium truncate">{r.name}</p>
                  <p className="text-muted text-xs mt-0.5">{r.servings} porcija · {Math.round(r.total_calories/r.servings)} kcal/porciji</p>
                  <p className="text-muted text-xs">B{Math.round(r.total_protein_g/r.servings)}g · U{Math.round(r.total_carbs_g/r.servings)}g · M{Math.round(r.total_fat_g/r.servings)}g</p>
                </Link>
                <button onClick={() => handleDelete(r.id)} className="text-muted hover:text-danger transition-colors text-lg px-1">×</button>
              </div>
            ))}
          </div></div>}
    </div>
  )
}
