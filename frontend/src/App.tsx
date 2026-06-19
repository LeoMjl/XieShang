import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { apiSession } from '@/api/xieshang'
import ClosetPage from '@/pages/ClosetPage'
import DiscoverPage from '@/pages/DiscoverPage'
import HomePage from '@/pages/HomePage'
import LoadingPage from '@/pages/LoadingPage'
import ProfilePage from '@/pages/ProfilePage'
import ResultPage from '@/pages/ResultPage'
import { useAppStore } from '@/store'

function AppBootstrap() {
  const { userId, nickname, setSession } = useAppStore()

  useEffect(() => {
    let cancelled = false
    apiSession({ user_id: userId, nickname: nickname || '小鹿', gender: 'female' })
      .then((profile) => {
        if (!cancelled) setSession(profile)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [nickname, setSession, userId])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/closet" element={<ClosetPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
    </BrowserRouter>
  )
}

export default App
