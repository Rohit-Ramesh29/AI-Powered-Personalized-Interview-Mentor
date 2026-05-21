import { FileUp, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { uploadResume } from '../services/api'
import type { ResumeAnalysis } from '../types'

export function ResumeUpload() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onFile(file?: File) {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      setAnalysis(await uploadResume(file))
    } catch {
      setError('Could not analyze resume. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
      <p className="mt-2 text-slate-400">Upload PDF, DOCX, or TXT to extract skills, projects, experience, certifications, ATS score, and interview topics.</p>
      <label className="glass mt-6 flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-200/40 p-8 text-center">
        {loading ? <Loader2 className="animate-spin text-cyan-200" size={36} /> : <FileUp className="text-cyan-200" size={40} />}
        <span className="mt-4 font-semibold text-white">Drop resume or choose file</span>
        <span className="mt-1 text-sm text-slate-400">PDF, DOCX, TXT</span>
        <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {error && <p className="mt-4 text-rose-200">{error}</p>}
      {analysis && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(analysis).filter(([key]) => key !== 'ats_score').map(([key, values]) => (
            <div key={key} className="glass rounded-lg p-5">
              <h2 className="capitalize text-white">{key.replace('_', ' ')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(values as string[]).map((value) => <span key={value} className="rounded-md bg-white/8 px-3 py-1 text-sm text-slate-200">{value}</span>)}
              </div>
            </div>
          ))}
          <div className="glass rounded-lg p-5">
            <h2 className="text-white">ATS Resume Score</h2>
            <p className="mt-3 text-5xl font-black text-cyan-200">{analysis.ats_score}</p>
          </div>
        </div>
      )}
    </div>
  )
}
