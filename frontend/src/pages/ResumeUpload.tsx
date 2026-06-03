import { CheckCircle2, FileUp, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLatestResume, uploadResume } from '../services/api'
import type { ResumeAnalysis } from '../types'

const ANALYSIS_KEYS = ['skills', 'technologies', 'projects', 'experience', 'certifications', 'topics'] as const

export function ResumeUpload() {
  const [existing, setExisting]   = useState<ResumeAnalysis | null>(null)
  const [analysis, setAnalysis]   = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading]     = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    getLatestResume()
      .then(data => setExisting(data))
      .catch(() => setExisting(null))
      .finally(() => setLoadingExisting(false))
  }, [])

  async function onFile(file?: File) {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const result = await uploadResume(file)
      setAnalysis(result)
      setExisting(result)
    } catch {
      setError('Could not analyze resume. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const displayed = analysis ?? existing

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
      <p className="mt-2 text-slate-400">
        Upload PDF, DOCX, or TXT to extract skills, projects, experience, certifications, ATS score, and interview topics.
      </p>

      {/* Current resume status */}
      <div className="mt-5 flex items-center gap-3 rounded-lg border border-white/8 bg-slate-900/60 px-4 py-3 text-sm">
        {loadingExisting ? (
          <>
            <Loader2 size={15} className="animate-spin text-cyan-400" />
            <span className="text-slate-400">Checking profile for existing resume…</span>
          </>
        ) : existing ? (
          <>
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span className="text-slate-300">Resume on profile — <span className="font-semibold text-white">{existing.skills.slice(0, 3).join(', ')}{existing.skills.length > 3 ? '…' : ''}</span></span>
            <span className="ml-auto rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
              ATS {existing.ats_score}
            </span>
          </>
        ) : (
          <>
            <RefreshCw size={15} className="shrink-0 text-slate-500" />
            <span className="text-slate-500">No resume on profile yet — upload one below.</span>
          </>
        )}
      </div>

      {/* Upload area */}
      <label className="glass mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-200/40 p-8 text-center transition hover:border-cyan-200/70 hover:bg-white/[0.02]">
        {loading
          ? <Loader2 className="animate-spin text-cyan-200" size={36} />
          : <FileUp className="text-cyan-200" size={40} />
        }
        <span className="mt-4 font-semibold text-white">
          {existing ? 'Drop updated resume or choose file' : 'Drop resume or choose file'}
        </span>
        <span className="mt-1 text-sm text-slate-400">PDF, DOCX, TXT — replaces your current resume</span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={e => onFile(e.target.files?.[0])}
        />
      </label>

      {error && <p className="mt-4 text-rose-200">{error}</p>}

      {/* Analysis results */}
      {displayed && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ANALYSIS_KEYS.map(key => {
            const values = displayed[key] as string[]
            if (!values || values.length === 0) return null
            return (
              <div key={key} className="glass rounded-lg p-5">
                <h2 className="capitalize text-white">{key.replace('_', ' ')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {values.map(value => (
                    <span key={value} className="rounded-md bg-white/8 px-3 py-1 text-sm text-slate-200">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          <div className="glass rounded-lg p-5">
            <h2 className="text-white">ATS Resume Score</h2>
            <p className="mt-3 text-5xl font-black text-cyan-200">{displayed.ats_score}</p>
          </div>
        </div>
      )}
    </div>
  )
}
