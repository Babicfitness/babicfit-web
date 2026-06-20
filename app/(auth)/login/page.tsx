'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Profile row is created by trigger
        router.push('/onboarding')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Greška. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white tracking-wide">BABICFIT</h1>
        <p className="text-muted text-sm mt-1">Prati ishranu. Živi zdravo.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface rounded-2xl p-6 shadow-lg">
        {/* Tab toggle */}
        <div className="flex rounded-xl bg-bg p-1 mb-6">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {m === 'login' ? 'Prijavi se' : 'Registruj se'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-secondary text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ime@email.com"
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-secondary text-sm mb-1">Lozinka</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-white placeholder-muted text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-h text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Molimo sačekajte...' : mode === 'login' ? 'Prijavi se' : 'Kreiraj nalog'}
          </button>
        </form>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Pogrešan email ili lozinka.'
  if (msg.includes('User already registered')) return 'Nalog sa ovim emailom već postoji.'
  if (msg.includes('Password should be at least')) return 'Lozinka mora imati najmanje 6 karaktera.'
  if (msg.includes('Unable to validate email')) return 'Neispravan email format.'
  return 'Greška. Pokušajte ponovo.'
}
