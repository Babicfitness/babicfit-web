import { createClient } from '@/lib/supabase/server'
import DatabaseClient from './DatabaseClient'
import type { FoodCategory, SystemFood } from '@/types/database'

export default async function DatabasePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: foods }] = await Promise.all([
    supabase.from('food_categories').select('*').order('sort_order'),
    supabase.from('system_foods').select('*').eq('is_active', true).order('name_sr'),
  ])

  return (
    <DatabaseClient
      categories={(categories ?? []) as FoodCategory[]}
      foods={(foods ?? []) as SystemFood[]}
    />
  )
}
