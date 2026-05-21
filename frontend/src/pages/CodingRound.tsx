import Editor from '@monaco-editor/react'
import { AlertCircle, Loader2, Play, SkipForward } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { evaluateCode, getCodingQuestion } from '../services/api'
import type { CodingQuestion } from '../types'

export function CodingRound() {
  const [language, setLanguage] = useState('python')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState<CodingQuestion | null>(null)
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadQuestion() {
      setLoadingQuestion(true)
      setError('')
      try {
        const nextQuestion = await getCodingQuestion(questionIndex, language)
        if (!cancelled) {
          setQuestion(nextQuestion)
          setCode(nextQuestion.starter_code)
          setResult(null)
        }
      } catch {
        if (!cancelled) setError('Could not load a coding question. Please upload a resume and make sure you are signed in.')
      } finally {
        if (!cancelled) setLoadingQuestion(false)
      }
    }

    loadQuestion()
    return () => {
      cancelled = true
    }
  }, [questionIndex, language])

  async function evaluateCurrentQuestion() {
    if (!question || evaluating) return
    setEvaluating(true)
    setError('')

    try {
      const evaluation = await evaluateCode({ language, code, problem: question.title })
      setResult(evaluation)
      window.setTimeout(() => {
        setQuestionIndex((current) => current + 1)
      }, 1800)
    } catch {
      setError('Could not evaluate this answer. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Coding Round Evaluation</h1>
          <p className="mt-2 text-slate-400">Resume-based coding questions that advance after each completed evaluation.</p>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white"
        >
          {['python', 'java', 'cpp', 'javascript'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[.65fr_.35fr]">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <Editor
            height="640px"
            theme="vs-dark"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
          />
        </div>
        <div className="glass rounded-lg p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Question {questionIndex + 1}</p>
              <h2 className="mt-1 font-bold text-white">{question?.title ?? 'Loading question...'}</h2>
            </div>
            <Button
              variant="ghost"
              icon={<SkipForward size={16} />}
              onClick={() => setQuestionIndex((current) => current + 1)}
              disabled={loadingQuestion || evaluating}
              aria-label="Next question"
            />
          </div>

          {loadingQuestion ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="animate-spin text-cyan-200" size={16} />
              <span>Building a resume-based problem...</span>
            </div>
          ) : (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Topic: {question?.topic}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{question?.description}</p>
              <Button
                className="mt-5 w-full"
                icon={evaluating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                onClick={evaluateCurrentQuestion}
                disabled={evaluating || !code.trim()}
              >
                {evaluating ? 'Evaluating...' : 'Evaluate'}
              </Button>
            </>
          )}

          {result && (
            <div className="mt-5 space-y-3 rounded-lg border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p><b className="text-white">Correctness:</b> {result.correctness}%</p>
              <p><b className="text-white">Time:</b> {result.time_complexity}</p>
              <p><b className="text-white">Space:</b> {result.space_complexity}</p>
              <p><b className="text-white">Edge cases:</b> {result.edge_cases.join(', ')}</p>
              <p><b className="text-white">Suggestion:</b> {result.optimization}</p>
              <p className="text-xs text-cyan-200">Next question loading automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
