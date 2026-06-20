import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RecipeDetailClient from './RecipeDetailClient'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: recipe }, { data: items }] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).eq('user_id', user.id).is('deleted_at', null).single(),
    supabase.from('recipe_items').select('*').eq('recipe_id', id).order('sort_order'),
  ])

  if (!recipe) notFound()

  return <RecipeDetailClient recipe={recipe} items={items ?? []} />
}
