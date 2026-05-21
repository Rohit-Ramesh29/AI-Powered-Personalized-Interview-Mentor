import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { Loader2, AlertCircle, ArrowUpRight, BarChart3 } from 'lucide-react'
import { getAnalytics } from '../services/api'
import type { Analytics as AnalyticsType } from '../types'

const COLORS = ['#67e8f9', '#34d399', '#f59e0b', '#f43f5e']

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getAnalytics()
        setAnalytics(data)
      } catch (err) {
        setError('Failed to load real-time analytics data.')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-200" size={36} />
        <p className="text-sm text-slate-400">Aggregating session feedback and scoring data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-slate-300">
        <AlertCircle className="text-rose-200 mt-0.5 shrink-0" size={18} />
        <span>{error}</span>
      </div>
    )
  }

  const weakData = analytics?.weak_topics && analytics.weak_topics.length > 0
    ? analytics.weak_topics
    : [
        { name: 'DP', score: 42 }, 
        { name: 'OS', score: 51 }, 
        { name: 'STAR', score: 57 }, 
        { name: 'SQL', score: 63 }
      ]

  const pieData = analytics?.category_scores && analytics.category_scores.length > 0
    ? analytics.category_scores
    : [
        { name: 'Technical', value: 76 }, 
        { name: 'Communication', value: 68 }
      ]

  const suggestions = []
  if (analytics && analytics.weak_topics.length > 0) {
    analytics.weak_topics.forEach((t) => {
      if (t.score < 60) {
        suggestions.push(`Urgent: Review logic and patterns for "${t.name}" (Current Accuracy: ${t.score}%).`)
      }
    })
  }
  if (suggestions.length === 0) {
    suggestions.push('Behavioral stories: add sharper STAR metrics to raise communication scores.')
    suggestions.push('Coding logic: verify edge cases (empty collections, duplicates) on coding mocks.')
    suggestions.push('System Design: clarify non-functional scalability and data consistency tradeoffs first.')
  }

  const hasData = analytics && analytics.mock_rounds > 0

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Weak Area Tracking</h1>
      <p className="mt-2 text-slate-400">Monitor failed topics, communication metrics, and coding evaluation history.</p>
      
      {hasData ? (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-lg p-5">
              <h2 className="font-bold text-white">Weak Concepts & Topic Performance</h2>
              <p className="text-xs text-slate-400 mt-1">Lower scores identify concepts requiring target revision.</p>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weakData}>
                    <CartesianGrid stroke="#ffffff12" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)' }} />
                    <Bar dataKey="score" fill="#67e8f9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-lg p-5 flex flex-col">
              <h2 className="font-bold text-white">Feedback Mix Breakdown</h2>
              <p className="text-xs text-slate-400 mt-1">Average proficiency scores across technical accuracy vs. clear speech.</p>
              <div className="mt-4 flex-1 h-80 min-h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-white mb-4">AI Practice Recommendations</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {suggestions.map((item, index) => (
                <div key={index} className="glass rounded-lg p-5 text-slate-300 border border-white/5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-cyan-400 to-emerald-400" />
                  <p className="text-sm font-semibold text-white mb-2">Recommendation #{index + 1}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8 glass border border-dashed border-cyan-300/20 rounded-xl p-12 text-center flex flex-col justify-center items-center">
          <BarChart3 className="text-cyan-300/40 mb-4 animate-pulse" size={48} />
          <h3 className="font-bold text-white text-xl">No Performance Analytics Yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
            Your dynamic weakness charts, performance categories, and AI-recommended actions will automatically generate and unlock here once you complete your first practice activity!
          </p>
          <div className="mt-6 flex gap-4">
            <Link to="/interview">
              <span className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200 transition-all shadow-lg flex items-center gap-1.5 active:scale-[0.98]">
                Start Mock Interview <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link to="/coding">
              <span className="rounded-lg bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-[0.98]">
                Coding Challenges <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
