'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/localStore'

export const dynamic = 'force-dynamic'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const profile = getProfile()
    if (!profile?.onboarding_done) {
      router.replace('/onboarding')
    } else {
      router.replace('/plan')
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-muted text-sm">Učitavanje...</p>
    </div>
  )
}
