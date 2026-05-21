import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Analytics } from './pages/Analytics'
import { Auth } from './pages/Auth'
import { CodingRound } from './pages/CodingRound'
import { Dashboard } from './pages/Dashboard'
import { InterviewSession } from './pages/InterviewSession'
import { Landing } from './pages/Landing'
import { ResumeUpload } from './pages/ResumeUpload'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route element={<Shell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/interview" element={<InterviewSession />} />
        <Route path="/coding" element={<CodingRound />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
