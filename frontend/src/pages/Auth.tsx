import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { login, register } from '../services/api'

type Tab = 'signin' | 'signup'

export function Auth() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (tab === 'signin') {
        if (!email || !password) throw new Error('Please fill in all fields')
        await login({ email, password })
        navigate('/dashboard')
      } else {
        if (!name || !email || !password) throw new Error('Please fill in all fields')
        await register({ name, email, password })
        setSuccessMessage('Account created successfully! Please sign in using your email and password.')
        setTab('signin')
        setPassword('') // Clear password so they enter it to login
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Could not connect to the backend. Please make sure the backend server is running.')
      } else {
        setError(err.response?.data?.detail || err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="glass relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 p-1 shadow-2xl backdrop-blur-2xl">
        <div className="absolute left-1/2 top-0 h-[2px] w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="px-6 py-8 sm:px-8">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <Sparkles size={24} />
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Smart Interview Mentor
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your AI-powered personalized path to ace tech and leadership interviews.
            </p>
          </div>

          <div className="mt-8 flex rounded-lg border border-white/5 bg-slate-950/80 p-1">
            <button
              onClick={() => { setTab('signin'); setError(''); setSuccessMessage('') }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                tab === 'signin'
                  ? 'bg-cyan-300 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setSuccessMessage('') }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                tab === 'signup'
                  ? 'bg-cyan-300 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          {successMessage && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-200">
              <Sparkles className="mt-0.5 shrink-0 text-emerald-400" size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 shrink-0 text-rose-400" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/75"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/75"
                placeholder="jane.doe@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/75"
                placeholder="Password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-0 bg-gradient-to-r from-cyan-400 to-emerald-400 py-3.5 font-bold text-slate-950 shadow-lg transition-all duration-300 hover:from-cyan-300 hover:to-emerald-300 active:scale-[0.98]"
            >
              {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
