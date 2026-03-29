import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import SakuraEasterEgg from './SakuraEasterEgg.jsx'
import SupportModal from './SupportModal.jsx'
import ReportModal from './ReportModal.jsx'

const navItems = [
  { to: '/', icon: '🏠', label: 'Главная' },
  { to: '/events', icon: '📋', label: 'Проекты' },
  { to: '/teams', icon: '👥', label: 'Команды' },
  { to: '/news', icon: '📢', label: 'Новости' },
  { to: '/profile', icon: '👤', label: 'Профиль' },
]

function Layout() {
  const { user, profile, loading } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()

  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'developer'

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-white card-shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="jas-brand-container flex items-center gap-2.5">
            <img src="/logo.png" alt="Jas Volunteers" className="jas-logo-img h-9 w-9 object-contain" />
            <span className="jas-brand-text font-brand text-lg text-[var(--color-text-heading)]">
              JAS <span className="jas-brand-highlight text-[var(--color-primary)]">VOLUNTEERS</span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]'}`}>
              {t('nav_home')}
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]'}`}>
              {t('nav_events')}
            </NavLink>
            <NavLink to="/teams" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]'}`}>
              {t('nav_teams')}
            </NavLink>
            <NavLink to="/news" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]'}`}>
              {t('nav_news')}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]'}`}>
              {t('nav_profile')}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200 border-2 ${isActive ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}>
                🛠️ DEV
              </NavLink>
            )}
          </nav>

          {/* Language & Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex text-xs font-medium text-[var(--color-text-body)] gap-1">
              <button onClick={() => setLang('KZ')} className={`px-1 transition-colors ${lang === 'KZ' ? 'text-[var(--color-primary)] font-semibold' : 'hover:text-[var(--color-primary)]'}`}>KZ</button>
              <span>|</span>
              <button onClick={() => setLang('RU')} className={`px-1 transition-colors ${lang === 'RU' ? 'text-[var(--color-primary)] font-semibold' : 'hover:text-[var(--color-primary)]'}`}>RU</button>
              <span>|</span>
              <button onClick={() => setLang('EN')} className={`px-1 transition-colors ${lang === 'EN' ? 'text-[var(--color-primary)] font-semibold' : 'hover:text-[var(--color-primary)]'}`}>EN</button>
            </div>

            {loading ? (
              <span className="loading loading-spinner loading-xs text-[var(--color-primary)]"></span>
            ) : user ? (
              <NavLink to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold">
                  {(profile?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-[var(--color-text-heading)]">
                  {profile?.first_name || 'Профиль'}
                </span>
              </NavLink>
            ) : (
              <NavLink to="/register" className="btn btn-sm btn-jas rounded-xl">
                {t('btn_register')}
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-100 py-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-body)] text-center md:text-left">
          <p className="flex items-center justify-center md:justify-start gap-1.5">{t('footer_rights')} <SakuraEasterEgg /></p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <NavLink to="/creator" className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform">✨ Создатель платформы</NavLink>
            <button onClick={() => setIsReportOpen(true)} className="btn-jas-ghost text-xs px-2 py-1">{t('footer_bug') || 'Сообщить об ошибке'}</button>
            <button onClick={() => setIsSupportOpen(true)} className="btn-jas-ghost text-xs px-2 py-1 font-bold text-[var(--color-primary)]">{t('footer_support') || 'Поддержать проект ❤️'}</button>
          </div>
        </div>
      </footer>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 card-shadow z-50">
        <div className="flex justify-around py-2">
            <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-colors ${isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-body)]'}`}>
              <span className="text-lg">🏠</span>
              <span>{t('nav_home')}</span>
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-colors ${isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-body)]'}`}>
              <span className="text-lg">📋</span>
              <span>{t('nav_events')}</span>
            </NavLink>
            <NavLink to="/teams" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-colors ${isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-body)]'}`}>
              <span className="text-lg">👥</span>
              <span>{t('nav_teams')}</span>
            </NavLink>
            <NavLink to="/news" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-colors ${isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-body)]'}`}>
              <span className="text-lg">📢</span>
              <span>{t('nav_news')}</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-colors ${isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-body)]'}`}>
              <span className="text-lg">👤</span>
              <span>{t('nav_profile')}</span>
            </NavLink>
        </div>
      </nav>

      {/* Modals */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

    </div>
  )
}

export default Layout
