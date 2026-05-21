import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Building2, Mic, ScanFace, LogIn, User, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function Landing() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/')
  }

  const cards = [
    { icon: Building2, title: 'Company Mode', text: 'Google, Amazon, Microsoft, Infosys, and TCS patterns.' },
    { icon: Mic, title: 'Voice Practice', text: 'Speech-to-text and AI interviewer hooks.' },
    { icon: ScanFace, title: 'Behavior Signals', text: 'Confidence, pauses, eye contact, and nervousness.' },
    { icon: Brain, title: 'RAG Retrieval', text: 'Resume, notes, DSA, HR, and system design context.' },
  ]

  return (
    <div className="min-h-[92vh] flex flex-col">
      {/* Home Screen Premium Header Top Bar */}
      <header className="flex w-full items-center justify-between py-4 border-b border-white/5 mb-6">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-cyan-300 p-2 text-slate-950 lg:hidden">
            <Brain size={18} />
          </div>
          <span className="font-extrabold text-white tracking-wide text-lg lg:hidden">Smart Mentor</span>
          <span className="hidden lg:block text-xs text-slate-400 font-semibold tracking-wider uppercase">
            ⚡ RAG-Enabled Interview Co-Pilot
          </span>
        </div>

        <div>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="secondary" className="text-xs py-2 px-4 flex items-center gap-1.5 border border-white/10 hover:border-cyan-300/30 transition duration-300">
                  <User size={14} className="text-cyan-300" /> 
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button 
                onClick={handleLogout} 
                className="text-xs py-2 px-4 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition duration-300 flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="text-xs py-2.5 px-5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 font-bold text-slate-950 border-0 rounded-lg shadow-lg flex items-center gap-2 transition duration-300 transform active:scale-95">
                <LogIn size={14} /> 
                <span>Sign In / Sign Up</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <section className="grid min-h-[72vh] items-center gap-10 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-200">
            Personalized AI interview preparation
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
            Smart Interview Preparation Mentor
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Upload a resume, practice HR, technical, coding, and system design rounds, retrieve company-specific questions with RAG, and turn every answer into measurable feedback.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard"><Button icon={<ArrowRight size={18} />}>Open Dashboard</Button></Link>
            <Link to="/interview"><Button variant="secondary" icon={<Brain size={18} />}>Start Mock Interview</Button></Link>
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <div className="rounded-lg border border-cyan-200/20 bg-slate-950/70 p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-slate-400">Live Interview Signal</span>
              <span className="rounded-md bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">Ready 86%</span>
            </div>
            {[
              ['RAG Match', 'Amazon SDE OA + Arrays', '92%'],
              ['Resume Topics', 'React, FastAPI, PostgreSQL', '18'],
              ['Confidence', 'Eye contact and answer clarity', '78%'],
            ].map(([a, b, c]) => (
              <div key={a} className="mb-4 rounded-md border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between text-sm"><span className="text-white">{a}</span><span className="text-cyan-200">{c}</span></div>
                <p className="mt-2 text-sm text-slate-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass rounded-lg p-5">
            <Icon className="text-cyan-200" />
            <h3 className="mt-4 font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
