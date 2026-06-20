'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/plan',     label: 'Moj plan',  icon: '🍽️' },
  { href: '/database', label: 'Baza namirnica', icon: '🔍' },
  { href: '/foods',    label: 'Lične namirnice', icon: '🥗' },
  { href: '/recipes',  label: 'Moji recepti', icon: '📖' },
]

export default function TopNav() {
  const pathname = usePathname()
  return (
    <nav className="bg-surface border-b border-line">
      <div className="flex overflow-x-auto scrollbar-hide max-w-3xl mx-auto">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap flex-shrink-0 border-b-2 transition-all ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-secondary'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
