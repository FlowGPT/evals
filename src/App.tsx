import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/Login'
import { HomeLayout } from './pages/HomeLayout'
import { ProtectedRoute } from './auth/ProtectedRoute'
import ChatTracingDetailPage from './pages/ChatTracing/Detail'
import HomeDashboard from './pages/HomeDashboard'
import SettingsPage from './pages/Settings'
import { ErrorRatePage } from './pages/ErrorRate'
import ScoreSummaryPage from './pages/ScoreSummary'
import { ConversationTracingPage } from './pages/ConversationTracing'
import { EngagementTracingPage } from './pages/EngagementTracing'
import EngagementContentDetailPage from './pages/EngagementTracing/Detail'
import ConversationDetailPage from './pages/ConversationTracing/Detail'
import { ChatTracingPage } from './pages/ChatTracing'
import SamplingJobsPage from './pages/SamplingJobs'
import SamplingTaskLogsPage from './pages/SamplingJobs/Detail'
import CreateSamplingTaskPage from './pages/SamplingJobs/Create'

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <ChatTracingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/engagement/:contentId"
          element={
            <ProtectedRoute>
              <EngagementContentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeDashboard />} />
          <Route path="error-rate" element={<ErrorRatePage />} />
          <Route path="score-summary" element={<ScoreSummaryPage />} />
          <Route path="conversation-tracing" element={<ConversationTracingPage />} />
          <Route path="engagement-tracing" element={<EngagementTracingPage />} />
          <Route path="chat-tracing" element={<ChatTracingPage />} />
          <Route path="sampling-jobs" element={<SamplingJobsPage />} />
          <Route path="sampling/create" element={<CreateSamplingTaskPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="/sampling/:taskId"
          element={
            <ProtectedRoute>
              <SamplingTaskLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/:convId"
          element={
            <ProtectedRoute>
              <ConversationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}


