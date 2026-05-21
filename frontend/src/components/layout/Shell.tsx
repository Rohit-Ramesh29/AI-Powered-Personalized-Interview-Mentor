import { BrainCircuit, Code2, FileUp, Gauge, Home, MessageSquare, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/resume', label: 'Resume', icon: FileUp },
  { to: '/interview', label: 'Interview', icon: MessageSquare },
  { to: '/coding', label: 'Coding', icon: Code2 },
  { to: '/analytics', label: 'Analytics', icon: BrainCircuit },
  { to: '/settings', label: 'Profile', icon: UserRound },
]

export function Shell() {
  return (
    <div className="min-h-screen soft-grid">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="rounded-md bg-cyan-300 p-2 text-slate-950"><BrainCircuit size={24} /></div>
          <div>
            <p className="font-bold text-white">Smart Mentor</p>
            <p className="text-xs text-slate-400">Interview AI Suite</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          LLM + RAG ready. Add API keys in `.env` to switch from local demo intelligence to model-backed answers.
        </div>
      </aside>
      <main className="px-4 py-5 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
