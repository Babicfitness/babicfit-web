import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanClient from './PlanClient'
import type { DailyLog, MealEntry, Profile } from '@/types/database'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: profile }, { data: dailyLog }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
  ])

  if (!profile?.onboarding_done) redirect('/onboarding')

  // Create today's log if it doesn't exist
  let log: DailyLog | null = dailyLog
  if (!log) {
    const { data: newLog } = await supabase
      .from('daily_logs')
      .insert({
        user_id: user.id,
        log_date: today,
        goal_calories:   profile.goal_calories ?? 0,
        goal_protein_g:  profile.goal_protein_g ?? 0,
        goal_carbs_g:    profile.goal_carbs_g ?? 0,
        goal_fat_g:      profile.goal_fat_g ?? 0,
      })
      .select()
      .single()
    log = newLog
  }

  // Fetch entries for today's log
  let entries: MealEntry[] = []
  if (log) {
    const { data } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('daily_log_id', log.id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
    entries = data ?? []
  }

  return (
    <PlanClient
      profile={profile as Profile}
      dailyLog={log as DailyLog}
      initialEntries={entries}
    />
  )
}
