'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/plan',     label: 'Moj plan',        icon: '🍽️' },
  { href: '/database', label: 'Baza namirnica',   icon: '🔍' },
  { href: '/foods',    label: 'Lične namirnice',  icon: '🥗' },
  { href: '/recipes',  label: 'Moji recepti',     icon: '📖' },
  { href: '/history',  label: 'Istorija',         icon: '📅' },
]

export default function TopNav() {
  const pathname = usePathname()
  return (
    <nav className="bg-white border-b border-[#E4EAF4]">
      <div className="flex overflow-x-auto scrollbar-hide max-w-3xl mx-auto">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap flex-shrink-0 border-b-2 transition-all ${
                active ? 'border-[#4169E1] text-[#4169E1]' : 'border-transparent text-[#8A9BBF] hover:text-[#4A5A7A]'
              }`}>
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
