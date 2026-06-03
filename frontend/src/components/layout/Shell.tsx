import { BrainCircuit, Code2, FileUp, Gauge, Home, LogOut, MessageSquare, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../../services/api'

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
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-hidden soft-grid">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="rounded-md bg-cyan-300 p-2 text-slate-950"><BrainCircuit size={24} /></div>
          <div>
            <p className="font-bold text-white">Smart Mentor</p>
            <p className="text-xs text-slate-400">Interview AI Suite</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
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

        <div className="mt-auto space-y-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={18} /> Sign Out
          </button>

          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            LLM + RAG ready. Add API keys in <code className="text-emerald-300">.env</code> to switch from local demo intelligence to model-backed answers.
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-5 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
