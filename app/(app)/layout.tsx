'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/BottomNav'
import { getProfile } from '@/lib/localStore'
import type { Profile } from '@/lib/localStore'

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Mršavljenje',
  maintain: 'Održavanje',
  gain_muscle: 'Mišići',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setProfile(getProfile())
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-line">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight">
            <span className="text-white">BABIC</span><span className="text-primary">FIT</span>
          </span>
          {profile && (
            <div className="flex items-center gap-2 bg-bg border border-line rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {profile.first_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="text-right">
                <p className="text-white text-xs font-semibold leading-none">{profile.first_name}</p>
                <p className="text-muted text-xs leading-none mt-0.5">
                  {GOAL_LABELS[profile.goal] ?? ''} · {profile.goal_calories} kcal
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tab navigation */}
      <TopNav />

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
