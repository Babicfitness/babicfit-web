import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Recipe } from '@/types/database'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const list = (recipes ?? []) as Recipe[]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Moji recepti</h1>
        <Link
          href="/recipes/new"
          className="bg-primary hover:bg-primary-h text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Novi recept
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-4xl mb-3">📖</p>
          <p className="text-secondary font-medium">Nema recepata</p>
          <p className="text-muted text-sm mt-1">Kreiraj recept od više namirnica</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="divide-y divide-line">
            {list.map(recipe => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-surface-alt transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-white font-medium truncate">{recipe.name}</p>
                  <p className="text-muted text-xs mt-0.5">
                    {recipe.servings} porcija · {Math.round(recipe.total_calories / recipe.servings)} kcal/porciji
                  </p>
                  <p className="text-muted text-xs">
                    B{Math.round(recipe.total_protein_g / recipe.servings)}g ·
                    U{Math.round(recipe.total_carbs_g / recipe.servings)}g ·
                    M{Math.round(recipe.total_fat_g / recipe.servings)}g
                  </p>
                </div>
                <span className="text-muted text-lg">›</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
