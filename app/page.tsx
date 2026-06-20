'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/localStore'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    const profile = getProfile()
    if (!profile?.onboarding_done) router.replace('/onboarding')
    else router.replace('/plan')
  }, [])
  return null
}
