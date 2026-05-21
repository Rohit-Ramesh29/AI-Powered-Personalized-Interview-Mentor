import axios from 'axios'
import type { Analytics, ChatTurn, CodingQuestion, InterviewMode, ResumeAnalysis } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function login(payload: any) {
  const { data } = await api.post('/auth/login', payload)
  localStorage.setItem('token', data.access_token)
  return data
}

export async function register(payload: any) {
  const { data } = await api.post('/auth/register', payload)
  localStorage.setItem('token', data.access_token)
  return data
}

export async function getProfile() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateProfile(payload: { name: string; role: string; target_companies: string; language: string }) {
  const { data } = await api.put('/auth/me', payload)
  return data
}

export async function getLatestResume(): Promise<ResumeAnalysis | null> {
  try {
    const { data } = await api.get('/resumes/latest')
    return data
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return null
    }
    throw err
  }
}

export async function uploadResume(file: File): Promise<ResumeAnalysis> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/resumes/analyze', form)
  return data
}

export async function startInterview(mode: InterviewMode, company: string, topics: string[]) {
  const { data } = await api.post('/interviews/start', { mode, company, topics })
  return data as { session_id: string; turn: ChatTurn }
}

export async function answerInterview(sessionId: string, answer: string) {
  const { data } = await api.post(`/interviews/${sessionId}/answer`, { answer })
  return data as { next_turn: ChatTurn; feedback: ChatTurn['feedback'] }
}

export async function evaluateCode(payload: { language: string; code: string; problem: string }) {
  const { data } = await api.post('/coding/evaluate', payload)
  return data
}

export async function getCodingQuestion(index: number, language: string): Promise<CodingQuestion> {
  const { data } = await api.get('/coding/question', { params: { index, language } })
  return data
}

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await api.get('/analytics/me')
  return data
}

export async function getRecommendations() {
  const { data } = await api.get('/recommendations/today')
  return data
}

export default api
