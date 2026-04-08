import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import MascotCat from '../components/MascotCat.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import {
  RankNovice, RankVolunteer, RankActivist,
  RankVeteran, RankChampion, RankLegend,
  CategoryEcology, CategoryAnimals, CategoryEducation, CategoryCharity
} from '../components/Ornaments.jsx'

const getRankNameKey = (hours) => {
  const rs = [
    { key: 'rank_novice',    min: 0 },
    { key: 'rank_volunteer', min: 50 },
    { key: 'rank_activist',   min: 200 },
    { key: 'rank_veteran',    min: 500 },
    { key: 'rank_champion',    min: 1000 },
    { key: 'rank_legend',    min: 2500 }
  ];
  let idx = 0;
  for (let i = rs.length - 1; i >= 0; i--) {
    if (hours >= rs[i].min) { idx = i; break; }
  }
  return rs[idx].key;
}

const statsKeys = [
  { value: '10 000+', labelKey: 'stat_volunteers', icon: '🧑‍🤝‍🧑' },
  { value: '20', labelKey: 'stat_teams', icon: '🏆' },
  { value: '500+', labelKey: 'stat_events', icon: '📅' },
  { value: '100+', labelKey: 'stat_portfolios', icon: '📄' },
]

const portfolioPerksKeys = [
  { icon: '📄', titleKey: 'portfolio_perk1_title', descKey: 'portfolio_perk1_desc' },
  { icon: '⭐', titleKey: 'portfolio_perk2_title', descKey: 'portfolio_perk2_desc' },
  { icon: '🔗', titleKey: 'portfolio_perk3_title', descKey: 'portfolio_perk3_desc' },
  { icon: '📊', titleKey: 'portfolio_perk4_title', descKey: 'portfolio_perk4_desc' },
]



function HomePage() {
  const [events, setEvents] = useState([])
  const { user, profile } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*, teams(name), event_participants(id)')
        .eq('status', 'active')
        .order('event_date', { ascending: true })
        .limit(4)
      if (data && data.length > 0) setEvents(data)
    }
    fetchEvents()
  }, [])

  const displayEvents = events

  return (
    <div className="space-y-10">

      {/* ===== HERO ===== */}
      <section className="bg-white rounded-3xl card-shadow p-8 md:p-12 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            {!user ? (
              <>
                <div className="inline-flex items-center gap-2 bg-red-50 text-[var(--color-primary)] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                  {t('badge_volunteer_platform')}
                </div>
                <h1 className="font-brand text-4xl md:text-5xl text-[var(--color-text-heading)] mb-4 leading-tight">
                  {t('hero_title_1')}<br />
                  <span className="text-[var(--color-primary)]">{t('hero_title_2')}</span>
                </h1>
                <p className="text-[var(--color-text-body)] text-lg mb-8 max-w-xl leading-relaxed">
                  {t('hero_desc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <NavLink to="/register" className="btn btn-lg btn-jas rounded-2xl px-10 shadow-lg shadow-red-200 hover:scale-105 transition-transform">
                    {t('hero_btn_start')}
                  </NavLink>
                  <NavLink to="/login" className="btn btn-lg btn-ghost rounded-2xl px-10 border border-gray-100">
                    {t('hero_btn_login')}
                  </NavLink>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                  {t('welcome_back')}, {profile?.first_name || t('nav_profile')}!
                </div>
                <h1 className="font-brand text-4xl md:text-5xl text-[var(--color-text-heading)] mb-4">
                  {t('hero_ready_1')} <br />
                  <span className="text-[var(--color-primary)]">{t('hero_ready_2')}</span>
                </h1>
                <p className="text-[var(--color-text-body)] text-lg mb-8 max-w-xl">
                  {t('hero_rank_desc_1')} <span className="font-bold text-gray-800">{t(getRankNameKey(profile?.total_hours || 0))}</span>. 
                  {t('hero_rank_desc_2')}
                </p>
                <div className="flex gap-4">
                  <NavLink to="/events" className="btn btn-lg btn-jas rounded-2xl px-10 shadow-lg shadow-red-200">
                    {t('hero_btn_find_event')}
                  </NavLink>
                  <NavLink to="/profile" className="btn btn-lg btn-outline rounded-2xl px-10 border-gray-200">
                    {t('hero_btn_profile')}
                  </NavLink>
                </div>
              </>
            )}
          </div>

          {/* Mascot */}
          <div className="flex flex-col items-center group">
            <div className="relative">
               <div className="absolute inset-0 bg-red-100 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 opacity-50 blur-xl pointer-events-none z-0"></div>
               <div className="relative z-10">
                 <MascotCat />
               </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">{t('mascot_tooltip')}</p>
          </div>
        </div>
      </section>

      {/* ===== STATS (Hidden for logged users to keep concise) ===== */}
      {!user && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsKeys.map((s) => (
            <div key={s.labelKey} className="bg-white rounded-2xl card-shadow p-5 text-center card-hover">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-[var(--color-text-heading)]">{s.value}</div>
              <div className="text-sm text-[var(--color-text-body)]">{t(s.labelKey)}</div>
            </div>
          ))}
        </section>
      )}

      {/* ===== PORTFOLIO SECTION (Hidden for logged users) ===== */}
      {!user && (
        <section className="bg-white rounded-2xl card-shadow p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">
              {t('portfolio_section_title')}
            </h2>
            <p className="text-[var(--color-text-body)] max-w-xl mx-auto">
              {t('portfolio_section_desc')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {portfolioPerksKeys.map((p) => (
              <div key={p.titleKey} className="bg-[var(--color-surface)] rounded-2xl p-5 card-hover">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-semibold text-[var(--color-text-heading)] mb-1 text-sm">{t(p.titleKey)}</h3>
                <p className="text-xs text-[var(--color-text-body)]">{t(p.descKey)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== RANK SECTION ===== */}
      <section className="bg-white rounded-3xl card-shadow p-8 border-b-4 border-red-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-brand text-[var(--color-text-heading)]">{t('rank_system_title')}</h2>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('rank_system_subtitle')}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { rankKey: 'rank_novice', desc: `0–49 ${t('rank_hours')}`, color: 'bg-gray-50 border-gray-100 text-gray-500', icon: <RankNovice className="w-6 h-6 mb-2" /> },
            { rankKey: 'rank_volunteer', desc: `50–199 ${t('rank_hours')}`, color: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: <RankVolunteer className="w-6 h-6 mb-2" /> },
            { rankKey: 'rank_activist', desc: `200–499 ${t('rank_hours')}`, color: 'bg-blue-50 border-blue-100 text-blue-700', icon: <RankActivist className="w-6 h-6 mb-2" /> },
            { rankKey: 'rank_veteran', desc: `500–999 ${t('rank_hours')}`, color: 'bg-orange-50 border-orange-100 text-orange-700', icon: <RankVeteran className="w-6 h-6 mb-2" /> },
            { rankKey: 'rank_champion', desc: `1000–2499 ${t('rank_hours')}`, color: 'bg-purple-50 border-purple-100 text-purple-700', icon: <RankChampion className="w-6 h-6 mb-2" /> },
            { rankKey: 'rank_legend', desc: `2500+ ${t('rank_hours')}`, color: 'bg-red-50 border-red-100 text-[var(--color-primary)]', icon: <RankLegend className="w-6 h-6 mb-2" /> },
          ].map((r) => (
            <div key={r.rankKey} className={`flex flex-col items-center rounded-2xl p-4 border transition-all hover:scale-105 ${r.color}`}>
              {r.icon}
              <div className="text-xs font-bold uppercase tracking-tight">{t(r.rankKey)}</div>
              <div className="text-[10px] opacity-70 mt-1">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EVENT FEED ===== */}
      {displayEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">{t('events_upcoming')}</h2>
            <NavLink to="/events" className="btn-jas-ghost text-sm px-3 py-1.5 rounded-xl">
              {t('events_all')}
            </NavLink>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {displayEvents.map((event) => {
              const spots = event.event_participants?.length ?? event.spots ?? 0
              const maxSpots = event.max_participants ?? event.maxSpots ?? 30
              return (
                <div key={event.id} className="bg-white rounded-2xl card-shadow p-5 card-hover">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex items-center justify-center w-12 h-12 bg-[var(--color-surface)] rounded-xl">
                      {event.emoji || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-heading)] mb-1 text-base">{event.title}</h3>
                      <p className="text-xs text-[var(--color-text-body)] mb-2 text-gray-500">
                        👥 {event.teams?.name || event.team} • 📅 {event.event_date || event.date}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <div className="flex justify-between text-xs text-[var(--color-text-body)] mb-0.5">
                            <span>{t('event_enrolled')}</span><span>{spots}/{maxSpots}</span>
                          </div>
                          <progress className="progress progress-error w-full h-1.5" value={spots} max={maxSpots} />
                        </div>
                        <NavLink to="/events" className="btn btn-xs btn-jas rounded-lg whitespace-nowrap">
                          {t('event_btn_enroll')}
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}

export default HomePage
