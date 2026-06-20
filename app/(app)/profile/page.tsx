'use client'

import { useState, useEffect } from 'react'
import { getProfile, saveProfile } from '@/lib/localStore'
import type { Profile } from '@/lib/localStore'
import { calcUserTargets } from '@/lib/calculations'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cal, setCal]   = useState('')
  const [prot, setProt] = useState('')
  const [uh, setUh]     = useState('')
  const [mast, setMast] = useState('')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'goals' | 'info'>('goals')

  useEffect(() => {
    const p = getProfile()
    if (!p) return
    setProfile(p)
    setCal(String(p.goal_calories))
    setProt(String(p.goal_protein_g))
    setUh(String(p.goal_carbs_g))
    setMast(String(p.goal_fat_g))
  }, [])

  if (!profile) return <div className="min-h-screen bg-[#F0F4FA]" />

  function handleSave() {
    if (!profile) return
    const updated: Profile = {
      ...profile,
      goal_calories:  parseInt(cal)  || profile.goal_calories,
      goal_protein_g: parseInt(prot) || profile.goal_protein_g,
      goal_carbs_g:   parseInt(uh)   || profile.goal_carbs_g,
      goal_fat_g:     parseInt(mast) || profile.goal_fat_g,
    }
    saveProfile(updated)
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    if (!profile) return
    const targets = calcUserTargets({
      weightKg:      profile.weight_kg,
      heightCm:      profile.height_cm,
      birthYear:     profile.birth_year,
      gender:        profile.gender,
      activityLevel: profile.activity_level,
      goal:          profile.goal,
    })
    setCal(String(targets.calories))
    setProt(String(targets.protein_g))
    setUh(String(targets.carbs_g))
    setMast(String(targets.fat_g))
  }

  const GOAL_LABELS: Record<string, string> = {
    lose_weight: 'Mršavljenje', maintain: 'Održavanje', gain_muscle: 'Nabava mišića'
  }
  const ACT_LABELS: Record<string, string> = {
    sedentary: 'Uglavnom sedim', light: 'Malo se krećem',
    moderate: 'Vežbam redovno', active: 'Vežbam svaki dan'
  }

  const calCheck = parseInt(cal) || 0
  const calFromMacros = (parseInt(prot)||0)*4 + (parseInt(uh)||0)*4 + (parseInt(mast)||0)*9
  const diff = Math.abs(calCheck - calFromMacros)
  const showWarning = calCheck > 0 && calFromMacros > 0 && diff > 50

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-16">

      {/* Toast */}
      {saved && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg text-white bg-green-500">
          ✓ Sačuvano
        </div>
      )}

      {/* Avatar + ime */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black bg-[#4169E1]">
          {profile.first_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-[#1A2540] text-xl font-black">{profile.first_name} {profile.last_name}</p>
          <p className="text-[#8A9BBF] text-sm">{GOAL_LABELS[profile.goal]}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-white rounded-xl p-1 border border-[#E4EAF4]">
        {[{ id: 'goals', label: 'Moji ciljevi' }, { id: 'info', label: 'Profil' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={tab === t.id
              ? { background: '#4169E1', color: '#fff' }
              : { color: '#8A9BBF' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'goals' && (
        <div className="space-y-4">
          {/* Kalorije */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4EAF4] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[#1A2540] font-bold text-sm">Dnevne kalorije</p>
              <span className="text-[#4169E1] text-xs font-semibold">kcal/dan</span>
            </div>
            <input type="number" value={cal} onChange={e => setCal(e.target.value)}
              className="w-full text-[#1A2540] text-3xl font-black outline-none border-b-2 border-[#E4EAF4] focus:border-[#4169E1] pb-1 bg-transparent transition-colors" />
          </div>

          {/* Makroi */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4EAF4] shadow-sm space-y-4">
            <p className="text-[#1A2540] font-bold text-sm">Makronutrijenti</p>

            {[
              { label: 'Proteini', color: '#3B82F6', bg: '#EFF6FF', val: prot, set: setProt, unit: 'g' },
              { label: 'Ugljeni hidrati', color: '#22C55E', bg: '#F0FDF4', val: uh, set: setUh, unit: 'g' },
              { label: 'Masti', color: '#F59E0B', bg: '#FFFBEB', val: mast, set: setMast, unit: 'g' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3.5 border" style={{ background: item.bg, borderColor: item.color + '30' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-[#1A2540] text-sm font-bold">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: item.color }}>g/dan</span>
                </div>
                <input type="number" value={item.val} onChange={e => item.set(e.target.value)}
                  className="w-full text-2xl font-black outline-none bg-transparent border-b-2 border-transparent focus:border-current pb-0.5 transition-colors"
                  style={{ color: item.color }} />
              </div>
            ))}

            {/* Upozorenje ako makroi ne odgovaraju kalorijama */}
            {showWarning && (
              <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                <p className="text-amber-700 text-xs font-semibold">
                  ⚠️ Makroi daju {calFromMacros} kcal, a cilj je {calCheck} kcal (razlika {diff} kcal). Proveri brojeve.
                </p>
              </div>
            )}
          </div>

          {/* Akcije */}
          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl text-white font-bold text-base bg-[#4169E1] shadow-md hover:bg-[#2F56D0] transition-colors">
            Sačuvaj ciljeve
          </button>

          <button onClick={handleReset}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-[#8A9BBF] border border-[#E4EAF4] hover:text-[#4A5A7A] transition-colors">
            Vrati na auto-izračunato
          </button>
        </div>
      )}

      {tab === 'info' && (
        <div className="space-y-3">
          {[
            { label: 'Težina',     value: `${profile.weight_kg} kg` },
            { label: 'Visina',     value: `${profile.height_cm} cm` },
            { label: 'Aktivnost',  value: ACT_LABELS[profile.activity_level] },
            { label: 'Cilj',       value: GOAL_LABELS[profile.goal] },
          ].map(row => (
            <div key={row.label} className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-[#E4EAF4] shadow-sm">
              <span className="text-[#8A9BBF] text-sm">{row.label}</span>
              <span className="text-[#1A2540] font-bold text-sm">{row.value}</span>
            </div>
          ))}

          <div className="bg-white rounded-2xl px-5 py-4 border border-[#E4EAF4] shadow-sm">
            <p className="text-[#8A9BBF] text-xs mb-1">Za promenu ličnih podataka</p>
            <p className="text-[#4A5A7A] text-sm">Ponovo prođi onboarding ili kontaktiraj trenera.</p>
          </div>
        </div>
      )}
    </div>
  )
}
