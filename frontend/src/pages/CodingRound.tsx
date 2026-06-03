import Editor from '@monaco-editor/react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Loader2,
  MemoryStick,
  Play,
  SkipForward,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { evaluateCode, getCodingQuestion, getCodingQuestionsList, getCompletedQuestions } from '../services/api'
import type { CodingQuestion, EvaluationResult, QuestionListItem } from '../types'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp']
const CONCEPTS  = ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Graph', 'Tree', 'DP', 'OOP'] as const
type Concept    = typeof CONCEPTS[number]

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'LinkedIn', 'Adobe', 'Salesforce'] as const
type Company    = typeof COMPANIES[number] | ''

const DIFF = {
  0: { label: 'Easy',   cls: 'text-emerald-400' },
  1: { label: 'Medium', cls: 'text-amber-400'   },
  2: { label: 'Hard',   cls: 'text-rose-400'    },
} as const

type ResultTab = 'testcases' | 'result'

export function CodingRound() {
  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView]                       = useState<'list' | 'editor'>('list')

  // ── Completions ───────────────────────────────────────────────────────────
  const [completedKeys, setCompletedKeys]     = useState<Set<string>>(new Set())

  // ── List state ────────────────────────────────────────────────────────────
  const [filterConcept, setFilterConcept]     = useState<Concept | ''>('')
  const [filterCompany, setFilterCompany]     = useState<Company>('')
  const [questionList, setQuestionList]       = useState<QuestionListItem[]>([])
  const [loadingList, setLoadingList]         = useState(true)

  // ── Editor state ──────────────────────────────────────────────────────────
  const [activeConcept, setActiveConcept]     = useState('')
  const [activeCompany, setActiveCompany]     = useState('')
  const [questionIndex, setQuestionIndex]     = useState(0)
  const [language, setLanguage]               = useState('python')
  const [question, setQuestion]               = useState<CodingQuestion | null>(null)
  const [code, setCode]                       = useState('')
  const [result, setResult]                   = useState<EvaluationResult | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [evaluating, setEvaluating]           = useState(false)
  const [error, setError]                     = useState('')
  const [activeTab, setActiveTab]             = useState<ResultTab>('testcases')
  const [descTab, setDescTab]                 = useState<'description' | 'solution'>('description')

  // ── Load completed questions once ─────────────────────────────────────────
  useEffect(() => {
    getCompletedQuestions().then(list => {
      setCompletedKeys(new Set(list.map(c => `${c.topic}_${c.index}`)))
    })
  }, [])

  // ── Load question list ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingList(true)
    getCodingQuestionsList(filterConcept || undefined, filterCompany || undefined)
      .then(data => { if (!cancelled) setQuestionList(data) })
      .catch(()   => { if (!cancelled) setQuestionList([]) })
      .finally(() => { if (!cancelled) setLoadingList(false) })
    return () => { cancelled = true }
  }, [filterConcept, filterCompany])

  // ── Load specific question ────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'editor') return
    let cancelled = false
    setLoadingQuestion(true)
    setError('')
    setResult(null)
    setActiveTab('testcases')
    getCodingQuestion(questionIndex, language, activeConcept || undefined, activeCompany || undefined)
      .then(q => { if (!cancelled) { setQuestion(q); setCode(q.starter_code) } })
      .catch(() => { if (!cancelled) setError('Could not load question. Please sign in and upload a resume.') })
      .finally(() => { if (!cancelled) setLoadingQuestion(false) })
    return () => { cancelled = true }
  }, [view, questionIndex, language, activeConcept, activeCompany])

  function openQuestion(item: QuestionListItem) {
    setActiveConcept(item.topic)
    setActiveCompany(filterCompany)
    setQuestionIndex(item.index)
    setView('editor')
  }

  function goBack() {
    setView('list')
    setResult(null)
    setError('')
  }

  async function runCode() {
    if (!question || evaluating) return
    setEvaluating(true)
    setError('')
    setActiveTab('result')
    try {
      const evaluation = await evaluateCode({
        language,
        code,
        problem: question.title,
        test_cases: question.test_cases,
        topic: activeConcept,
        question_index: questionIndex,
      })
      setResult(evaluation)
      if (evaluation.tests_passed === evaluation.tests_total && evaluation.tests_total > 0) {
        setCompletedKeys(prev => new Set(prev).add(`${activeConcept}_${questionIndex}`))
      }
    } catch {
      setError('Could not evaluate your solution. Please try again.')
      setActiveTab('testcases')
    } finally {
      setEvaluating(false)
    }
  }

  const allPassed = result ? result.tests_passed === result.tests_total : false
  const diff      = question ? DIFF[question.difficulty as 0 | 1 | 2] : DIFF[0]

  // Group for "All" view
  const groups = filterConcept
    ? null
    : CONCEPTS
        .map(c => ({ concept: c, items: questionList.filter(q => q.topic === c) }))
        .filter(g => g.items.length > 0)

  /* ═══════════════════════════════════════════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════════════════════════════════════════ */
  if (view === 'list') {
    let rowNum = 0
    return (
      <div className="-mx-4 -my-5 flex h-screen flex-col overflow-hidden lg:-mx-8">

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/8 bg-slate-950/60 px-4 py-2 backdrop-blur">
          <Code2 size={18} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Coding Round</span>
          <ChevronRight size={14} className="text-slate-500" />
          <span className="text-sm text-slate-400">Question Bank</span>
          {!loadingList && (
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
              {questionList.length} problems
            </span>
          )}
        </div>

        {/* Concept pills */}
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/8 bg-slate-950/40 px-4 py-2 scrollbar-none">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">Topic:</span>
          {(['', ...CONCEPTS] as const).map(c => (
            <button
              key={c || 'all'}
              onClick={() => setFilterConcept(c as Concept | '')}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                filterConcept === c
                  ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {c || 'All'}
            </button>
          ))}
        </div>

        {/* Company pills */}
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/8 bg-slate-950/40 px-4 py-2 scrollbar-none">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">Company:</span>
          {(['', ...COMPANIES] as const).map(co => (
            <button
              key={co || 'any'}
              onClick={() => setFilterCompany(co as Company)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                filterCompany === co
                  ? 'border-violet-400/60 bg-violet-400/15 text-violet-300'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {co || 'Any'}
            </button>
          ))}
        </div>

        {/* Question list body */}
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24 text-slate-500">
              <Loader2 size={28} className="animate-spin text-cyan-400" />
              <p className="text-xs">Loading questions…</p>
            </div>
          ) : groups ? (
            /* ── All concepts grouped ── */
            <div className="divide-y divide-white/5">
              {groups.map(g => (
                <div key={g.concept}>
                  <div className="sticky top-0 z-10 border-b border-white/5 bg-slate-900/90 px-6 py-2 backdrop-blur">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{g.concept}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{g.items.length} problems</span>
                  </div>
                  {g.items.map(item => {
                    rowNum++
                    const d = DIFF[item.difficulty as 0 | 1 | 2]
                    const done = completedKeys.has(`${item.topic}_${item.index}`)
                    return (
                      <button
                        key={`${item.topic}-${item.index}`}
                        onClick={() => openQuestion(item)}
                        className="flex w-full items-center gap-4 border-b border-white/5 px-6 py-3.5 text-left transition hover:bg-white/[0.03] active:bg-white/5"
                      >
                        <span className="w-8 shrink-0 text-right text-[12px] text-slate-600">{rowNum}</span>
                        <span className={`w-14 shrink-0 text-[11px] font-bold ${d.cls}`}>{d.label}</span>
                        <span className="flex-1 text-[13px] font-medium text-white">{item.title}</span>
                        {done
                          ? <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                          : <ChevronRight size={14} className="shrink-0 text-slate-600" />
                        }
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* ── Single concept flat list ── */
            <div>
              <div className="sticky top-0 z-10 border-b border-white/5 bg-slate-900/90 px-6 py-2 backdrop-blur">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{filterConcept}</span>
                <span className="ml-2 text-[10px] text-slate-500">{questionList.length} problems</span>
              </div>
              {questionList.map((item, idx) => {
                const d = DIFF[item.difficulty as 0 | 1 | 2]
                const done = completedKeys.has(`${item.topic}_${item.index}`)
                return (
                  <button
                    key={item.index}
                    onClick={() => openQuestion(item)}
                    className="flex w-full items-center gap-4 border-b border-white/5 px-6 py-3.5 text-left transition hover:bg-white/[0.03] active:bg-white/5"
                  >
                    <span className="w-8 shrink-0 text-right text-[12px] text-slate-600">{idx + 1}</span>
                    <span className={`w-14 shrink-0 text-[11px] font-bold ${d.cls}`}>{d.label}</span>
                    <span className="flex-1 text-[13px] font-medium text-white">{item.title}</span>
                    {done
                      ? <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      : <ChevronRight size={14} className="shrink-0 text-slate-600" />
                    }
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     EDITOR VIEW
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="-mx-4 -my-5 flex h-screen flex-col overflow-hidden lg:-mx-8">

      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-slate-950/60 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-xs font-semibold text-cyan-400">{activeConcept}</span>
          {question && (
            <>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="max-w-[260px] truncate text-xs text-slate-300">{question.title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white outline-none focus:border-cyan-400/50"
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>

          <button
            onClick={() => setQuestionIndex(i => i + 1)}
            disabled={loadingQuestion || evaluating}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <SkipForward size={13} /> Next
          </button>

          <button
            onClick={runCode}
            disabled={evaluating || loadingQuestion || !code.trim()}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-lg transition hover:from-cyan-400 hover:to-emerald-400 active:scale-95 disabled:opacity-40"
          >
            {evaluating
              ? <><Loader2 size={13} className="animate-spin" /> Running…</>
              : <><Play size={13} /> Run Code</>
            }
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 flex shrink-0 items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main split */}
      <div className="flex min-h-0 flex-1 gap-0">

        {/* ── LEFT: Problem panel ─────────────────────────────────────────── */}
        <div className="flex w-[42%] shrink-0 flex-col border-r border-white/8">

          <div className="flex shrink-0 border-b border-white/8 bg-slate-950/40">
            {(['description', 'solution'] as const).map(t => (
              <button
                key={t}
                onClick={() => setDescTab(t)}
                className={`px-4 py-2.5 text-xs font-semibold capitalize transition ${
                  descTab === t
                    ? 'border-b-2 border-cyan-400 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 text-sm">
            {loadingQuestion ? (
              <div className="flex flex-col items-center justify-center gap-3 pt-20 text-slate-500">
                <Loader2 size={28} className="animate-spin text-cyan-400" />
                <p className="text-xs">Loading question…</p>
              </div>
            ) : question && descTab === 'description' ? (
              <>
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-bold ${diff.cls}`}>{diff.label}</span>
                    <span className="rounded border border-cyan-400/20 bg-cyan-400/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                      {question.topic}
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-bold text-white">{question.title}</h2>
                </div>

                <p className="leading-7 text-slate-300">{question.description}</p>

                <div className="mt-5 space-y-4">
                  {question.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-white/8 bg-slate-900/60">
                      <p className="border-b border-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Example {i + 1}
                      </p>
                      <div className="px-4 py-3 font-mono text-xs">
                        <div className="mb-1.5">
                          <span className="text-slate-500">Input:&nbsp;</span>
                          <span className="text-slate-200">{ex.input}</span>
                        </div>
                        <div className="mb-1.5">
                          <span className="text-slate-500">Output:&nbsp;</span>
                          <span className="text-emerald-300">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="mt-2 text-[11px] leading-5 text-slate-400">
                            <span className="font-semibold text-slate-500">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {question.constraints.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Constraints</p>
                    <ul className="space-y-1.5">
                      {question.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 font-mono text-xs text-slate-300">
                          <span className="mt-0.5 text-cyan-500">•</span>
                          <code>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-slate-900/60 px-3 py-2.5">
                    <Clock size={14} className="shrink-0 text-cyan-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Time</p>
                      <p className="font-mono text-xs text-slate-200">{question.time_complexity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-slate-900/60 px-3 py-2.5">
                    <MemoryStick size={14} className="shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Space</p>
                      <p className="font-mono text-xs text-slate-200">{question.space_complexity}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : question && descTab === 'solution' ? (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approach & Hints</p>
                <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-6 text-amber-200">
                  <p className="mb-2 font-semibold text-amber-300">💡 General Strategy</p>
                  <p>Use a <span className="font-bold text-white">hash map</span> for O(1) lookups to avoid nested loops.</p>
                  <p className="mt-2">Iterate once through the data, storing what you've seen so far. Return immediately when a match is found.</p>
                </div>
                <div className="rounded-lg border border-white/8 bg-slate-900/60 p-4 text-xs leading-6 text-slate-300">
                  <p className="mb-2 font-semibold text-slate-400">Edge Cases to Consider</p>
                  <ul className="space-y-1">
                    {['Empty input / empty array', 'Single-element input', 'All-negative numbers', 'Ties / duplicates', 'Very large inputs'].map(e => (
                      <li key={e} className="flex items-center gap-2">
                        <span className="text-cyan-500">→</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── RIGHT: Editor + Results ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={v => setCode(v ?? '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
              }}
            />
          </div>

          {/* Bottom panel */}
          <div className="flex h-[220px] shrink-0 flex-col border-t border-white/8 bg-slate-950/80">
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-0">
              <div className="flex">
                {(['testcases', 'result'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-2.5 text-xs font-semibold capitalize transition ${
                      activeTab === t
                        ? 'border-b-2 border-cyan-400 text-cyan-300'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t === 'testcases' ? 'Test Cases' : 'Result'}
                  </button>
                ))}
              </div>
              {result && (
                <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                  allPassed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}>
                  {allPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {result.tests_passed}/{result.tests_total} passed
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">

              {activeTab === 'testcases' && !loadingQuestion && question && (
                <div className="flex flex-wrap gap-2">
                  {question.test_cases.map((tc, i) => (
                    <div key={i} className="rounded-lg border border-white/8 bg-slate-900/60 px-3 py-2 text-xs">
                      <p className="mb-1 text-[10px] font-bold text-slate-500">Case {i + 1}</p>
                      <p className="font-mono text-slate-300">
                        <span className="text-slate-500">in: </span>{tc.input}
                      </p>
                      <p className="font-mono text-slate-300">
                        <span className="text-slate-500">→ </span>
                        <span className="text-emerald-300">{tc.expected}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'result' && evaluating && (
                <div className="flex items-center gap-2 pt-4 text-xs text-slate-400">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  Running test cases…
                </div>
              )}

              {activeTab === 'result' && result && !evaluating && (
                <div className="space-y-2">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-cyan-400" />
                      <span className="text-slate-500">Runtime:</span>
                      <span className="font-mono text-slate-200">{result.time_complexity}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MemoryStick size={11} className="text-emerald-400" />
                      <span className="text-slate-500">Memory:</span>
                      <span className="font-mono text-slate-200">{result.space_complexity}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu size={11} className="text-amber-400" />
                      <span className="text-slate-500">Score:</span>
                      <span className="font-mono font-bold text-amber-300">{result.correctness}%</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {result.test_results.map(r => (
                      <div
                        key={r.case}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs ${
                          r.passed
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-rose-500/20 bg-rose-500/5'
                        }`}
                      >
                        {r.passed
                          ? <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                          : <XCircle     size={13} className="shrink-0 text-rose-400" />
                        }
                        <span className={`w-14 font-bold ${r.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Case {r.case}
                        </span>
                        <span className="truncate font-mono text-slate-400">
                          <span className="text-slate-600">in:</span> {r.input}
                        </span>
                        <span className="ml-auto shrink-0 font-mono">
                          <span className="text-slate-600">exp:</span>
                          <span className="ml-1 text-slate-300">{r.expected}</span>
                        </span>
                        {!r.passed && (
                          <span className="shrink-0 font-mono">
                            <span className="text-slate-600">got:</span>
                            <span className="ml-1 text-rose-400">{r.actual}</span>
                          </span>
                        )}
                        {r.passed && r.runtime_ms !== null && (
                          <span className="shrink-0 font-mono text-slate-500">{r.runtime_ms} ms</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {result.optimization && (
                    <div className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-[11px] text-cyan-300">
                      💡 <span className="font-semibold">Tip:</span> {result.optimization}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
