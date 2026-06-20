import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FoodsClient from './FoodsClient'
import type { UserFood, FoodCategory } from '@/types/database'

export default async function FoodsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: foods }, { data: categories }] = await Promise.all([
    supabase
      .from('user_foods')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('food_categories').select('*').order('sort_order'),
  ])

  return (
    <FoodsClient
      initialFoods={(foods ?? []) as UserFood[]}
      categories={(categories ?? []) as FoodCategory[]}
    />
  )
}
