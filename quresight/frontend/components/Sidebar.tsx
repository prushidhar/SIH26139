'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Atom, LayoutDashboard, Database, Sliders, Cpu, Activity, Zap, FileSearch, ShieldAlert, History, FileText, Book } from 'lucide-react'

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Data', path: '/data', icon: Database },
  { name: 'Preprocessing', path: '/preprocessing', icon: Sliders },
  { name: 'Model Lab', path: '/model-lab', icon: Cpu },
  { name: 'Benchmark', path: '/benchmark', icon: Activity },
  { name: 'Quantum Lab', path: '/quantum-lab', icon: Zap, quantum: true },
  { name: 'Explainability', path: '/explainability', icon: FileSearch },
  { name: 'Prediction', path: '/prediction', icon: ShieldAlert },
  { name: 'History', path: '/history', icon: History },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Docs', path: '/docs', icon: Book },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 h-full bg-[#111827] border-r border-[#1f2937] flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Atom className="w-8 h-8 text-[#8b5cf6]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">QureSight</h1>
          </div>
        </div>
        <p className="text-xs text-[#9ca3af] mt-1">Quantum Intelligence.</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const activeColor = item.quantum ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'bg-[#06b6d4]/10 text-[#06b6d4]'
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? activeColor 
                  : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1f2937]">
        <div className="text-xs text-center text-[#9ca3af]">
          v1.0 | SIH26139
        </div>
      </div>
    </aside>
  )
}
