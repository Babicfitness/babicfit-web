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

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Data>({
    first_name:'', last_name:'', gender:'', age:'',
    height_cm:'', weight_kg:'', activity_level:'', goal:'',
  })

  function set<K extends keyof Data>(k: K, v: Data[K]) {
    setData(p => ({ ...p, [k]: v }))
  }

  function canAdvance() {
    if (step === 1) return data.first_name.trim().length > 0
    if (step === 2) return data.last_name.trim().length > 0
    if (step === 3) return data.gender !== ''
    if (step === 4) return data.age !== '' && +data.age >= 10 && +data.age <= 100
    if (step === 5) return data.height_cm !== '' && +data.height_cm >= 100 && +data.height_cm <= 250
    if (step === 6) return data.weight_kg !== '' && +data.weight_kg >= 30 && +data.weight_kg <= 300
    if (step === 7) return data.activity_level !== ''
    if (step === 8) return data.goal !== ''
    return false
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

  function next() { if (canAdvance()) { if (step === TOTAL) finish(); else setStep(s => s + 1) } }
  function back() { if (step > 1) setStep(s => s - 1) }

  const isChoice = step === 3 || step === 7 || step === 8

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="h-1 bg-line">
        <div className="h-1 bg-primary transition-all duration-300" style={{ width: `${(step/TOTAL)*100}%` }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="text-muted text-sm mb-2">{step} od {TOTAL}</p>
          <div className="mb-8">
            {step === 1 && <StepText label="Kako se zoveš?" placeholder="Ime" value={data.first_name} onChange={v => set('first_name', v)} onEnter={next} />}
            {step === 2 && <StepText label="Prezime?" placeholder="Prezime" value={data.last_name} onChange={v => set('last_name', v)} onEnter={next} />}
            {step === 3 && <StepChoice label="Pol" options={[{value:'female',label:'Žena'},{value:'male',label:'Muškarac'}]} value={data.gender} onChange={v => { set('gender', v as Gender); setTimeout(next, 150) }} />}
            {step === 4 && <StepNumber label="Koliko imaš godina?" unit="god" min={10} max={100} value={data.age} onChange={v => set('age', v)} onEnter={next} />}
            {step === 5 && <StepNumber label="Visina?" unit="cm" min={100} max={250} value={data.height_cm} onChange={v => set('height_cm', v)} onEnter={next} />}
            {step === 6 && <StepNumber label="Težina?" unit="kg" min={30} max={300} value={data.weight_kg} onChange={v => set('weight_kg', v)} onEnter={next} />}
            {step === 7 && <StepChoice label="Koliko si aktivna/aktivan?" options={[{value:'sedentary',label:'Uglavnom sedim'},{value:'light',label:'Malo se krećem'},{value:'moderate',label:'Vežbam redovno'},{value:'active',label:'Vežbam svaki dan'}]} value={data.activity_level} onChange={v => { set('activity_level', v as ActivityLevel); setTimeout(next, 150) }} />}
            {step === 8 && <StepChoice label="Koji je tvoj cilj?" options={[{value:'lose_weight',label:'Želim da smršam'},{value:'maintain',label:'Održim težinu'},{value:'gain_muscle',label:'Naberem mišiće'}]} value={data.goal} onChange={v => set('goal', v as Goal)} />}
          </div>
          <div className="flex gap-3">
            {step > 1 && <button onClick={back} className="flex-1 py-3.5 rounded-xl border border-line text-secondary font-medium hover:bg-surface transition-colors">Nazad</button>}
            {!isChoice || step === 8 ? (
              <button onClick={next} disabled={!canAdvance() || saving} className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary-h text-white font-semibold transition-colors disabled:opacity-40">
                {step === TOTAL ? (saving ? 'Čuvam...' : 'Završi') : 'Dalje'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepText({ label, placeholder, value, onChange, onEnter }: { label:string; placeholder:string; value:string; onChange:(v:string)=>void; onEnter:()=>void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{label}</h2>
      <input autoFocus type="text" value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key==='Enter' && onEnter()} placeholder={placeholder}
        className="w-full bg-surface border border-line rounded-xl px-4 py-4 text-white text-lg placeholder-muted outline-none focus:border-primary transition-colors" />
    </div>
  )
}

function StepNumber({ label, unit, min, max, value, onChange, onEnter }: { label:string; unit:string; min:number; max:number; value:string; onChange:(v:string)=>void; onEnter:()=>void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{label}</h2>
      <div className="flex items-center gap-3">
        <input autoFocus type="number" min={min} max={max} value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key==='Enter' && onEnter()} placeholder="0"
          className="flex-1 bg-surface border border-line rounded-xl px-4 py-4 text-white text-lg placeholder-muted outline-none focus:border-primary transition-colors text-center" />
        <span className="text-muted text-lg w-12">{unit}</span>
      </div>
    </div>
  )
}

function StepChoice({ label, options, value, onChange }: { label:string; options:{value:string;label:string}[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{label}</h2>
      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`w-full py-4 px-5 rounded-xl text-left font-medium text-base transition-all border ${value===opt.value ? 'bg-primary border-primary text-white' : 'bg-surface border-line text-secondary hover:border-primary/50'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
