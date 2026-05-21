import { useEffect, useState } from 'react'
import { Mic, Send, Video, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { answerInterview, startInterview, getLatestResume } from '../services/api'
import type { ChatTurn, InterviewMode } from '../types'

const modes: InterviewMode[] = ['HR', 'Technical', 'Coding', 'System Design']

export function InterviewSession() {
  const [mode, setMode] = useState<InterviewMode>('Technical')
  const [company, setCompany] = useState('Amazon')
  const [topicsInput, setTopicsInput] = useState('React, Python, DSA')
  
  const [sessionId, setSessionId] = useState('')
  const [answer, setAnswer] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([])
  
  const [loadingResume, setLoadingResume] = useState(true)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResume() {
      try {
        const resumeAnalysis = await getLatestResume()
        if (resumeAnalysis && resumeAnalysis.topics && resumeAnalysis.topics.length > 0) {
          setTopicsInput(resumeAnalysis.topics.join(', '))
        }
      } catch (err) {
        console.error('Failed to prefill topics from resume:', err)
      } finally {
        setLoadingResume(false)
      }
    }
    loadResume()
  }, [])

  async function start() {
    setStarting(true)
    setError('')
    setTurns([])
    setSessionId('')
    
    const parsedTopics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      const data = await startInterview(mode, company, parsedTopics)
      setSessionId(data.session_id)
      setTurns([data.turn])
    } catch (err: any) {
      setError('Could not start mock session. Ensure backend is running.')
    } finally {
      setStarting(false)
    }
  }

  async function submit() {
    if (!answer.trim() || !sessionId || submitting) return
    setSubmitting(true)
    setError('')
    
    const candidate: ChatTurn = { role: 'candidate', content: answer }
    const currentAnswer = answer
    setAnswer('')
    
    setTurns((items) => [...items, candidate])

    try {
      const data = await answerInterview(sessionId, currentAnswer)
      setTurns((items) => [...items, { ...data.next_turn, feedback: data.feedback }])
    } catch (err: any) {
      setError('Failed to submit response. Please try again.')
      setAnswer(currentAnswer)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">AI Mock Interview</h1>
          <p className="mt-2 text-slate-400">Adaptive AI interviewer featuring context-aware RAG follow-ups and real-time response feedback.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Mic size={17} />}>Voice</Button>
          <Button variant="secondary" icon={<Video size={17} />}>Webcam</Button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[.35fr_.65fr]">
        <div className="glass rounded-xl p-5 border border-white/5 h-fit space-y-5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-300" />
            <span>Setup Session</span>
          </h2>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interview Mode</label>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-lg py-2.5 text-xs font-bold border transition ${
                    mode === item
                      ? 'bg-cyan-300 text-slate-950 border-cyan-300 shadow-md'
                      : 'bg-slate-950/40 text-slate-300 border-white/10 hover:bg-white/5'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition"
            >
              {['Google', 'Amazon', 'Microsoft', 'Infosys', 'TCS', 'Meta', 'Netflix'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interview Topics
            </label>
            {loadingResume ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="animate-spin text-cyan-200" size={14} />
                <span>Reading resume profile...</span>
              </div>
            ) : (
              <textarea
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="mt-2 w-full min-h-20 rounded-lg border border-white/10 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-slate-950/75 transition resize-none"
                placeholder="React, Python, DSA, Behavioral STAR"
              />
            )}
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              * Topics are dynamically populated from your uploaded resume. Feel free to customize or type any key concepts!
            </p>
          </div>

          <Button 
            className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 font-black text-slate-950 rounded-lg border-0 shadow-lg flex items-center justify-center gap-2 transition duration-300"
            onClick={start}
            disabled={starting}
          >
            {starting ? 'Initializing AI...' : 'Start Session'}
          </Button>
        </div>

        <div className="glass flex min-h-[620px] flex-col rounded-xl border border-white/5 p-5 shadow-inner">
          {turns.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
              <Sparkles className="text-cyan-300/40 mb-3 animate-pulse" size={42} />
              <h3 className="font-bold text-white text-lg">AI Interview Console Ready</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">Configure your target company, mode, and custom topics on the left, then click "Start Session" to launch the RAG-enabled interviewer!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-5 overflow-auto pr-1">
              {turns.map((turn, index) => (
                <div 
                  key={index} 
                  className={`max-w-[85%] rounded-xl p-4 shadow-lg transition-all duration-300 ${
                    turn.role === 'candidate' 
                      ? 'ml-auto bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 font-medium' 
                      : 'bg-white/5 border border-white/5 text-slate-100'
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-wider opacity-70">
                    {turn.role === 'candidate' ? 'You' : 'AI Interview Mentor'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{turn.content}</p>
                  
                  {turn.feedback && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-col gap-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                        AI Score Feedback:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                        <div>🎯 Accuracy: <span className="font-bold text-white">{turn.feedback.technical_accuracy}%</span></div>
                        <div>🗣️ Clarity: <span className="font-bold text-white">{turn.feedback.clarity}%</span></div>
                        <div>🤝 Confidence: <span className="font-bold text-white">{turn.feedback.confidence}%</span></div>
                        <div>📊 Communication: <span className="font-bold text-white">{turn.feedback.communication}%</span></div>
                      </div>
                      
                      {turn.feedback.suggestions && turn.feedback.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                            Growth Suggestions:
                          </p>
                          <ul className="list-disc list-inside text-xs text-slate-300 mt-1 space-y-1">
                            {turn.feedback.suggestions.map((s, sIdx) => (
                              <li key={sIdx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {submitting && (
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 max-w-[85%] flex items-center gap-2.5 text-xs text-slate-400">
                  <Loader2 className="animate-spin text-cyan-200" size={14} />
                  <span>AI Mentor is grading your answer and preparing follow-ups...</span>
                </div>
              )}
            </div>
          )}

          {sessionId && (
            <div className="mt-5 flex gap-3">
              <textarea 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                className="min-h-16 flex-1 rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-300 focus:bg-slate-950 transition-all resize-none" 
                placeholder="Type your structured answer here (Press Enter to send)..." 
              />
              <Button 
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                onClick={submit}
                disabled={submitting || !answer.trim()}
                className="px-5 bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-bold border-0 rounded-lg shadow-md flex items-center self-end h-12"
              >
                Send
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
