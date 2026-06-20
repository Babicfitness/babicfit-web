'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/plan',     label: 'Moj plan',  icon: '📋' },
  { href: '/database', label: 'Baza',      icon: '🔍' },
  { href: '/foods',    label: 'Namirnice', icon: '🥗' },
  { href: '/recipes',  label: 'Recepti',   icon: '📖' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line z-50 safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted hover:text-secondary'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
