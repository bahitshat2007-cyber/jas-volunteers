import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'
import TeamDetailsPage from './pages/TeamDetailsPage.jsx'

import AchievementsPage from './pages/AchievementsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CreatorPage from './pages/CreatorPage.jsx'
import RanksPage from './pages/RanksPage.jsx'
import NewsPage from './pages/NewsPage.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="team/:id" element={<TeamDetailsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="ranks" element={<RanksPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="creator" element={<CreatorPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
