import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Code2, FileText, TrendingUp, Loader2, ArrowUpRight } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MetricCard } from '../components/ui/MetricCard'
import { getAnalytics, getLatestResume, getRecommendations } from '../services/api'
import type { Analytics, ResumeAnalysis } from '../types'

export function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [resume, setResume] = useState<ResumeAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [aData, rData, recs] = await Promise.allSettled([
          getAnalytics(),
          getLatestResume(),
          getRecommendations(),
        ])

        if (aData.status === 'fulfilled') setAnalytics(aData.value)
        if (rData.status === 'fulfilled') setResume(rData.value)
        if (recs.status === 'fulfilled') setRecommendations(recs.value)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-200" size={36} />
        <p className="text-sm text-slate-400">Syncing with your dynamic mentor stats...</p>
      </div>
    )
  }

  const readinessValue = analytics && analytics.readiness_score > 0 ? `${analytics.readiness_score}%` : 'N/A'
  const atsValue = resume ? String(resume.ats_score) : 'N/A'
  const mockRoundsValue = analytics ? String(analytics.mock_rounds) : '0'
  const codingScoreValue = analytics && analytics.coding_score > 0 ? `${analytics.coding_score}%` : 'N/A'

  const hasProgress = analytics?.progress && analytics.progress.length > 0
  const progressData = hasProgress ? analytics.progress : []

  const planItems = recommendations?.daily_plan && recommendations.daily_plan.length > 0
    ? recommendations.daily_plan
    : ['Revise arrays and hashing', 'Practice 2 Amazon OA problems', 'Record one HR answer', 'Review system design tradeoffs']

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview Readiness Command Center</h1>
          <p className="mt-2 text-slate-400">Your resume, practice history, RAG matches, and feedback in one place.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Readiness" value={readinessValue} tone="bg-cyan-300/15 text-cyan-200" icon={<TrendingUp />} />
        <MetricCard 
          label="Resume ATS" 
          value={atsValue} 
          tone="bg-emerald-300/15 text-emerald-200" 
          icon={<FileText />} 
          subtitle={!resume ? "No resume uploaded" : undefined}
        />
        <MetricCard label="Mock Rounds" value={mockRoundsValue} tone="bg-amber-300/15 text-amber-200" icon={<BrainCircuit />} />
        <MetricCard label="Coding Score" value={codingScoreValue} tone="bg-rose-300/15 text-rose-200" icon={<Code2 />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <div className="glass rounded-lg p-5">
          <h2 className="font-bold text-white">Weekly Improvement</h2>
          <p className="text-xs text-slate-400 mt-1">Tracks your dynamic communication and tech scores over practice iterations.</p>
          <div className="mt-4 h-72">
            {hasProgress ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)' }} />
                  <Area dataKey="score" stroke="#67e8f9" fill="#67e8f933" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center border border-dashed border-white/5 rounded-xl bg-slate-950/20 p-6">
                <BrainCircuit className="text-slate-500 mb-2 animate-pulse" size={36} />
                <p className="text-sm font-bold text-slate-300">No Performance Data Yet</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">Start a coding challenge or a mock interview session to automatically generate and track your readiness progress!</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass rounded-lg p-5 flex-1">
            <h2 className="font-bold text-white">Today’s Plan</h2>
            <p className="text-xs text-slate-400 mt-1">Personalized action items recommended by AI.</p>
            <div className="mt-4 space-y-4">
              {planItems.map((item: string, index: number) => (
                <div key={item} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-300 text-sm font-bold text-slate-950">{index + 1}</span>
                  <p className="text-sm text-slate-300 self-center">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {!resume && (
            <div className="glass border border-dashed border-cyan-300/30 rounded-lg p-5 flex flex-col justify-center items-center text-center">
              <FileText className="text-cyan-300/50 mb-2" size={32} />
              <h3 className="font-bold text-white text-sm">Boost Readiness Score</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Upload a resume to automatically extract custom interview topics!</p>
              <Link to="/resume" className="mt-3 text-xs font-bold text-cyan-200 hover:text-cyan-100 flex items-center gap-1">
                Upload now <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
