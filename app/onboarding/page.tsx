'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProfile } from '@/lib/localStore'
import { calcUserTargets, birthYearFromAge } from '@/lib/calculations'
import type { Gender, ActivityLevel, Goal } from '@/lib/calculations'

type Data = {
  first_name: string; last_name: string; gender: Gender | ''
  age: string; height_cm: string; weight_kg: string
  activity_level: ActivityLevel | ''; goal: Goal | ''
}

const TOTAL = 8

const STEPS = [
  { field: 'first_name', label: 'Kako se zoveš?', sub: 'Upiši kako da te zovemo — to je sve što nam treba za početak.', type: 'text', placeholder: 'Tvoje ime' },
  { field: 'last_name',  label: 'Koje je tvoje prezime?', sub: 'Koristimo ga da personalizujemo tvoj plan.', type: 'text', placeholder: 'Tvoje prezime' },
  { field: 'gender',     label: 'Koji je tvoj pol?', sub: 'Odaberi onaj koji odgovara tvojoj biologiji.', type: 'choice',
    options: [{ value: 'female', label: 'Žena', icon: '👩' }, { value: 'male', label: 'Muškarac', icon: '👨' }] },
  { field: 'age',        label: 'Koliko imaš godina?', sub: 'Tvoje godine utiču na metabolizam i dnevne kalorijske potrebe. Što je broj tačniji, plan je precizniji.', type: 'number', unit: 'god.', min: 10, max: 100, placeholder: '25' },
  { field: 'height_cm',  label: 'Koja je tvoja visina?', sub: 'Unesi svoju visinu u centimetrima — npr. ako si 178cm, ukucaj 178.', type: 'number', unit: 'cm', min: 100, max: 250, placeholder: '170' },
  { field: 'weight_kg',  label: 'Koja je tvoja trenutna težina?', sub: 'Unesi koliko si kilogram u ovom trenutku — npr. 82.', type: 'number', unit: 'kg', min: 30, max: 300, placeholder: '70' },
  { field: 'activity_level', label: 'Koliko si aktivan/na?', sub: 'Budi iskren/a — na osnovu ovoga ćemo izračunati koliko kalorija ti treba svaki dan.', type: 'choice',
    options: [
      { value: 'sedentary', label: 'Uglavnom sedim',    sub: 'Kancelarija, auto, sofa — malo se krećem tokom dana' },
      { value: 'light',     label: 'Malo se krećem',    sub: 'Pešačim, ponekad vežbam — 1 do 2 puta nedeljno' },
      { value: 'moderate',  label: 'Vežbam redovno',    sub: 'Idem na trening 3 do 5 puta nedeljno' },
      { value: 'active',    label: 'Vežbam svaki dan',  sub: 'Skoro svaki dan sam aktivan/na ili imam fizički posao' },
    ] },
  { field: 'goal', label: 'Koji je tvoj cilj?', sub: 'Izaberi šta želiš da postigneš, a mi ćemo ti izračunati sve ostalo.', type: 'choice',
    options: [
      { value: 'lose_weight',  label: 'Želim da smršam',         sub: 'Unosiću malo manje kalorija da gubim kilogram po kilogram' },
      { value: 'maintain',     label: 'Želim da zadržim težinu', sub: 'Unosiću onoliko kalorija koliko i trošim — bez promena' },
      { value: 'gain_muscle',  label: 'Želim da naberem mišiće', sub: 'Unosiću malo više kalorija da pomognem rastu mišića' },
    ] },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Data>({
    first_name:'', last_name:'', gender:'', age:'',
    height_cm:'', weight_kg:'', activity_level:'', goal:'',
  })

  const current = STEPS[step]

  function setField(v: string) {
    setData(p => ({ ...p, [current.field]: v }))
  }

  function canAdvance() {
    const val = data[current.field as keyof Data]
    if (!val) return false
    if (current.type === 'number') {
      const n = +val
      return n >= (current.min ?? 0) && n <= (current.max ?? 9999)
    }
    return val.toString().trim().length > 0
  }

  async function finish() {
    if (!canAdvance()) return
    setSaving(true)
    const targets = calcUserTargets({
      weightKg: +data.weight_kg, heightCm: +data.height_cm,
      birthYear: birthYearFromAge(+data.age),
      gender: data.gender as Gender,
      activityLevel: data.activity_level as ActivityLevel,
      goal: data.goal as Goal,
    })
    saveProfile({
      first_name: data.first_name.trim(), last_name: data.last_name.trim(),
      gender: data.gender as Gender, birth_year: birthYearFromAge(+data.age),
      height_cm: +data.height_cm, weight_kg: +data.weight_kg,
      activity_level: data.activity_level as ActivityLevel, goal: data.goal as Goal,
      goal_calories: targets.calories, goal_protein_g: targets.protein_g,
      goal_carbs_g: targets.carbs_g, goal_fat_g: targets.fat_g,
      onboarding_done: true,
    })
    router.push('/plan')
  }

  function next() {
    if (!canAdvance()) return
    if (step === TOTAL - 1) { finish(); return }
    setStep(s => s + 1)
  }

  function choiceSelect(val: string) {
    setData(p => ({ ...p, [current.field]: val }))
    if (current.field !== 'goal') {
      setTimeout(() => {
        if (step === TOTAL - 1) finish()
        else setStep(s => s + 1)
      }, 180)
    }
  }

  const progress = ((step + 1) / TOTAL) * 100
  const currentValue = data[current.field as keyof Data] as string

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col">
      {/* Logo */}
      <div className="pt-10 pb-6 flex flex-col items-center px-6">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="text-[#1A2540]">BABIC</span><span className="text-[#4169E1]">FIT</span>
        </h1>
        <p className="text-[#8A9BBF] text-sm mt-1">Personalizovani plan ishrane</p>
      </div>

      {/* Progress bar */}
      <div className="mx-6 h-1.5 bg-[#E4EAF4] rounded-full overflow-hidden">
        <div className="h-full bg-[#4169E1] rounded-full transition-all duration-400 ease-out"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-sm border border-[#E4EAF4]">
          <h2 className="text-2xl font-bold text-[#1A2540] mb-2">{current.label}</h2>
          <p className="text-[#4A5A7A] text-sm mb-6 leading-relaxed">{current.sub}</p>

          {current.type === 'text' && (
            <input
              autoFocus
              type="text"
              value={currentValue}
              onChange={e => setField(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && next()}
              placeholder={current.placeholder}
              className="w-full bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-4 py-4 text-[#1A2540] text-lg placeholder-[#8A9BBF] outline-none focus:border-[#4169E1] transition-colors mb-6"
            />
          )}

          {current.type === 'number' && (
            <div className="flex items-center gap-3 mb-6">
              <input
                autoFocus
                type="number"
                min={current.min}
                max={current.max}
                value={currentValue}
                onChange={e => setField(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                placeholder={current.placeholder}
                className="flex-1 bg-[#F8FAFF] border-2 border-[#E4EAF4] rounded-xl px-4 py-4 text-[#1A2540] text-2xl font-bold placeholder-[#8A9BBF] outline-none focus:border-[#4169E1] transition-colors text-center"
              />
              <span className="text-[#8A9BBF] text-base w-12">{current.unit}</span>
            </div>
          )}

          {current.type === 'choice' && (
            <div className="flex flex-col gap-3 mb-6">
              {current.options?.map((opt: { value: string; label: string; icon?: string; sub?: string }) => (
                <button
                  key={opt.value}
                  onClick={() => choiceSelect(opt.value)}
                  className={`w-full px-5 py-4 rounded-xl text-left transition-all border-2 ${
                    currentValue === opt.value
                      ? 'bg-[#EFF6FF] border-[#4169E1]'
                      : 'bg-[#F8FAFF] border-[#E4EAF4] hover:border-[#4169E1]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon && <span className="text-2xl">{opt.icon}</span>}
                    <div>
                      <p className={`font-semibold text-base ${currentValue === opt.value ? 'text-[#4169E1]' : 'text-[#1A2540]'}`}>
                        {opt.label}
                      </p>
                      {opt.sub && <p className="text-[#8A9BBF] text-xs mt-0.5">{opt.sub}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {(current.type !== 'choice' || current.field === 'goal') && (
            <button
              onClick={next}
              disabled={!canAdvance() || saving}
              className="w-full py-4 rounded-xl bg-[#4169E1] hover:bg-[#2F56D0] text-white font-bold text-base transition-colors disabled:opacity-30"
            >
              {step === TOTAL - 1 ? (saving ? 'Čuvam...' : 'Izračunaj moje ciljeve ✓') : 'Nastavi →'}
            </button>
          )}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-4 text-[#8A9BBF] text-sm text-center hover:text-[#4A5A7A] transition-colors"
          >
            ← Nazad
          </button>
        )}
      </div>

      <p className="text-center text-[#8A9BBF] text-xs pb-6">Korak {step + 1} od {TOTAL}</p>
    </div>
  )
}
