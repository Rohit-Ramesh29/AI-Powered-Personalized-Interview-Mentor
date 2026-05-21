import { useEffect, useState } from 'react'
import { User, Target, Languages, Loader2, Save, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getProfile, updateProfile } from '../services/api'

export function Settings() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [targetCompanies, setTargetCompanies] = useState('')
  const [language, setLanguage] = useState('English')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile()
        setName(profile.name || '')
        setRole(profile.role || '')
        setTargetCompanies(profile.target_companies || '')
        setLanguage(profile.language || 'English')
      } catch (err: any) {
        setError('Failed to load profile. Are you logged in?')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateProfile({
        name,
        role,
        target_companies: targetCompanies,
        language,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError('Failed to update profile settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-200" size={36} />
        <p className="text-sm text-slate-400">Loading your profile configuration...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black text-white">Settings & Profile</h1>
      <p className="mt-2 text-slate-400">Manage your candidate identity, preferred target targets, and language models.</p>

      {error && (
        <div className="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle size={18} />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <div className="glass mt-6 space-y-6 rounded-xl border border-white/10 p-6 sm:p-8">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <User size={16} className="text-cyan-300" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Target size={16} className="text-cyan-300" />
            <span>Preferred Target Role</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition"
            placeholder="Software Engineer Intern"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Target size={16} className="text-cyan-300" />
            <span>Target Companies</span>
          </label>
          <input
            type="text"
            value={targetCompanies}
            onChange={(e) => setTargetCompanies(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition"
            placeholder="Google, Amazon, Microsoft"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Languages size={16} className="text-cyan-300" />
            <span>Interview Language</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            icon={<Save size={18} />}
            className="px-6 py-3.5 bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-bold border-0 rounded-lg shadow-lg flex items-center gap-2 transition duration-300"
          >
            {saving ? 'Saving...' : 'Save Profile Config'}
          </Button>
        </div>
      </div>
    </div>
  )
}
