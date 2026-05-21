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

export type CodingQuestion = {
  index: number
  topic: string
  title: string
  description: string
  starter_code: string
}
