export type InterviewMode = 'HR' | 'Technical' | 'Coding' | 'System Design'

export type Feedback = {
  technical_accuracy: number
  communication: number
  confidence: number
  clarity: number
  suggestions: string[]
}

export type ChatTurn = {
  role: 'interviewer' | 'candidate'
  content: string
  feedback?: Feedback
}

export type ResumeAnalysis = {
  skills: string[]
  technologies: string[]
  projects: string[]
  experience: string[]
  certifications: string[]
  topics: string[]
  ats_score: number
}

export type Analytics = {
  readiness_score: number
  mock_rounds: number
  coding_score: number
  weak_topics: { name: string; score: number }[]
  progress: { day: string; score: number }[]
  category_scores: { name: string; value: number }[]
}

export type ExampleCase = {
  input: string
  output: string
  explanation?: string
}

export type TestCase = {
  input: string
  expected: string
}

export type TestResult = {
  case: number
  input: string
  expected: string
  actual: string
  passed: boolean
  runtime_ms: number | null
}

export type QuestionListItem = {
  index: number
  title: string
  difficulty: number
  topic: string
}

export type CodingQuestion = {
  index: number
  topic: string
  title: string
  description: string
  examples: ExampleCase[]
  constraints: string[]
  time_complexity: string
  space_complexity: string
  test_cases: TestCase[]
  starter_code: string
  difficulty: number
}

export type EvaluationResult = {
  problem: string
  language: string
  correctness: number
  time_complexity: string
  space_complexity: string
  edge_cases: string[]
  optimization: string
  test_results: TestResult[]
  tests_passed: number
  tests_total: number
}
