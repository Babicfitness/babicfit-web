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
    <div className="min-h-screen flex flex-col bg-[#F0F4FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E4EAF4] sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight">
            <span className="text-[#1A2540]">BABIC</span><span className="text-[#4169E1]">FIT</span>
          </span>
          {profile && (
            <div className="flex items-center gap-2.5 rounded-full px-3 py-1.5 bg-[#F0F4FA] border border-[#E4EAF4]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 bg-[#4169E1]">
                {profile.first_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-[#1A2540] text-xs font-bold leading-none">{profile.first_name}</p>
                <p className="text-[#8A9BBF] text-xs leading-none mt-0.5">
                  {GOAL_LABELS[profile.goal] ?? ''} · <span className="text-[#4169E1] font-semibold">{profile.goal_calories} kcal</span>
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
