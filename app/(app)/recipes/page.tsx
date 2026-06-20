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
    <div className="max-w-lg mx-auto px-4 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A2540]">Moji recepti</h1>
        <Link href="/recipes/new"
          className="bg-[#4169E1] hover:bg-[#2F56D0] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
          + Novi
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-[#1A2540] font-semibold text-lg mb-1">Nema recepata</p>
          <p className="text-[#8A9BBF] text-sm">Kreiraj recept od više namirnica</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-[#E4EAF4] shadow-sm flex items-center px-4 py-4 gap-3">
              <Link href={`/recipes/${r.id}`} className="flex-1 min-w-0">
                <p className="text-[#1A2540] font-semibold truncate">{r.name}</p>
                <p className="text-[#8A9BBF] text-xs mt-0.5">{r.servings} porcija · {Math.round(r.total_calories/r.servings)} kcal/por.</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#3B82F6] text-xs font-semibold">P{Math.round(r.total_protein_g/r.servings)}g</span>
                  <span className="text-green-600 text-xs">UH{Math.round(r.total_carbs_g/r.servings)}g</span>
                  <span className="text-amber-600 text-xs">M{Math.round(r.total_fat_g/r.servings)}g</span>
                </div>
              </Link>
              <button onClick={() => handleDelete(r.id)}
                className="text-[#CBD5E1] hover:text-red-400 transition-colors text-2xl w-8 h-8 flex items-center justify-center shrink-0">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
