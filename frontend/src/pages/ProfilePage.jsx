import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { supabase } from '../lib/supabase.js'
import { QRCodeSVG } from 'qrcode.react'
import LoadingScreen from '../components/LoadingScreen.jsx'
import {
  RankNovice, RankVolunteer, RankActivist,
  RankVeteran, RankChampion, RankLegend
} from '../components/Ornaments.jsx'

const RANKS_DATA = [
  { name: 'Новичок',    enName: 'Novice',        min: 0,    color: '#9ca3af', Icon: RankNovice },
  { name: 'Доброволец', enName: 'Volunteer',     min: 50,   color: '#10b981', Icon: RankVolunteer },
  { name: 'Активист',   enName: 'Activist',      min: 200,  color: '#3b82f6', Icon: RankActivist },
  { name: 'Ветеран',    enName: 'Veteran',       min: 500,  color: '#8b5cf6', Icon: RankVeteran },
  { name: 'Чемпион',    enName: 'Champion',      min: 1000, color: '#f97316', Icon: RankChampion },
  { name: 'Легенда',    enName: 'Legend',        min: 2500, color: '#ef4444', Icon: RankLegend },
]

const getRankData = (hours) => {
  let idx = 0
  for (let i = RANKS_DATA.length - 1; i >= 0; i--) {
    if (hours >= RANKS_DATA[i].min) { idx = i; break }
  }
  const current = RANKS_DATA[idx]
  const next = RANKS_DATA[idx + 1] || null
  const currentMin = current.min
  const nextMin = next ? next.min : current.min
  const progress = next ? Math.min(100, ((hours - currentMin) / (nextMin - currentMin)) * 100) : 100
  return {
    name: current.name,
    enName: current.enName,
    color: current.color,
    icon: <current.Icon className="w-5 h-5 mr-1 mb-0.5 inline-block" style={{ color: current.color }} />,
    IconComponent: current.Icon,
    next,
    progress,
    hoursToNext: next ? nextMin - hours : 0,
  }
}

function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser, profile: currentProfile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Epic Animation State
  const [animatedHours, setAnimatedHours] = useState(0)
  const [addedHours, setAddedHours] = useState(0)
  const [levelUpMessage, setLevelUpMessage] = useState(null)
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  
  // Form state
  const [editBio, setEditBio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const isOwnProfile = !id || id === currentUser?.id
  const targetId = id || currentUser?.id

  useEffect(() => {
    async function fetchProfileData() {
      if (!targetId) {
         setLoading(false)
         return
      }
      
      try {
        setLoading(true)
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, teams(id, name)')
          .eq('id', targetId)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)
        setEditBio(profileData.bio || '')

        // 2. Fetch Achievements
        const { data: achData } = await supabase
          .from('user_achievements')
          .select('*, achievements_catalog(title, description, type, icon)')
          .eq('user_id', targetId)
          .order('granted_at', { ascending: false })
          .limit(6)
        setAchievements(achData || [])

        // 3. Fetch Events (ALL for PDF, recent 5 for display)
        const { data: eventData } = await supabase
          .from('event_participants')
          .select('*, events(title, emoji, event_date, status, hours_multiplier, teams(name))')
          .eq('user_id', targetId)
          .order('registered_at', { ascending: false })
        
        // Filter out null events (deleted) and cancelled events
        const validEvents = (eventData || []).filter(ep => ep.events && ep.events.status !== 'cancelled')
        setAllEvents(validEvents)
        setRecentEvents(validEvents.slice(0, 5))

        // 4. Fetch Testimonials (for PDF appreciation letters)
        const { data: testimData } = await supabase
          .from('testimonials')
          .select('*, author:profiles!testimonials_author_id_fkey(first_name, last_name, first_name_en, last_name_en, role, teams(name))')
          .eq('user_id', targetId)
          .order('created_at', { ascending: false })
        setTestimonials(testimData || [])

      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [targetId, id])

  // Epic Rank Animation Logic
  useEffect(() => {
    if (isOwnProfile && profile?.total_hours !== undefined) {
      const currentHours = profile.total_hours
      const storageKey = `jas_vol_last_hours_${currentUser.id}`
      const lastSeenStr = localStorage.getItem(storageKey)
      const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : currentHours

      if (currentHours > lastSeen) {
        setAnimatedHours(lastSeen)
        setAddedHours(currentHours - lastSeen)

        let startTimestamp = null
        const duration = 2000 // 2 seconds animation
        let lastSeenRankName = getRankData(lastSeen).name

        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp
          const progress = Math.min((timestamp - startTimestamp) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 4) // easeOutQuart
          
          const currentAnimatingValue = Math.floor(lastSeen + (currentHours - lastSeen) * ease)
          setAnimatedHours(currentAnimatingValue)

          const currentAnimatingRankName = getRankData(currentAnimatingValue).name
          if (currentAnimatingRankName !== lastSeenRankName) {
             setLevelUpMessage(currentAnimatingRankName)
             lastSeenRankName = currentAnimatingRankName
          }

          if (progress < 1) {
            window.requestAnimationFrame(step)
          } else {
            setAnimatedHours(currentHours)
            localStorage.setItem(storageKey, currentHours.toString())
            setTimeout(() => setAddedHours(0), 4000)
            setTimeout(() => setLevelUpMessage(null), 6000)
          }
        }
        window.requestAnimationFrame(step)
      } else {
        setAnimatedHours(currentHours)
        localStorage.setItem(storageKey, currentHours.toString())
      }
    } else if (!isOwnProfile && profile?.total_hours !== undefined) {
      setAnimatedHours(profile.total_hours)
    }
  }, [profile?.total_hours, isOwnProfile, currentUser?.id])

  const roleLabels = {
    volunteer: t('role_volunteer'),
    sub_coordinator: t('role_sub_coordinator'),
    coordinator: t('role_coordinator'),
    developer: t('role_developer'),
  }

  async function handleAvatarUpload(e) {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id)

      if (updateError) throw updateError
      
      await refreshProfile()
      // Refresh current view too
      setProfile({...profile, avatar_url: publicUrl})
    } catch (error) {
      alert(t('err_avatar') + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({ bio: editBio })
        .eq('id', currentUser.id)

      if (error) throw error
      await refreshProfile()
      setProfile({...profile, bio: editBio})
      setIsEditModalOpen(false)
    } catch (error) {
      alert(t('err_profile_update') + error.message)
    } finally {
      setSaving(false)
    }
  }

  const generatePDF = () => {
    window.print()
  }

  if (authLoading || loading) {
    return <LoadingScreen message={t('loading_profile')} />
  }

  if (!currentUser && isOwnProfile) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-10 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">{t('auth_req_title')}</h2>
        <p className="text-[var(--color-text-body)] mb-6">{t('auth_req_desc')}</p>
        <button onClick={() => navigate('/login')} className="btn btn-jas rounded-xl">{t('auth_req_btn')}</button>
      </div>
    )
  }

  if (!profile) {
     return <div className="text-center py-20">{t('user_not_found')}</div>
  }

  const hours = Number(profile?.total_hours || 0)
  const events = Number(profile?.total_events || 0)
  const displayName = profile?.first_name || 'Волонтер'
  const displayLastName = profile?.last_name || ''

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className={`rounded-2xl card-shadow p-6 transition-all duration-700 ${profile?.is_supporter ? 'supporter-card-premium bg-white' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Area */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-[var(--color-surface)] overflow-hidden relative z-10 ${profile?.is_supporter ? 'supporter-aura-ring' : ''}`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile?.first_name?.[0] || '?').toUpperCase()
              )}
            </div>
            {profile?.is_supporter && (
              <div className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-yellow-400 opacity-40 blur-md animate-pulse z-0"></div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)] flex items-center justify-center sm:justify-start gap-2">
              <span className={profile?.is_supporter ? 'text-golden' : ''}>
                {displayName} {displayLastName}
              </span>
              {profile?.is_supporter && (
                <span className="verified-check w-5 h-5 text-[10px] animate-in zoom-in duration-500" title="Верифицированный меценат ✨">
                  ✓
                </span>
              )}
            </h1>
            <p className="text-[var(--color-text-body)] text-sm mb-1">{isOwnProfile ? currentUser?.email : t('jas_account')}</p>
            {profile?.bio && (
              <p className="text-sm text-[var(--color-text-body)] italic mb-2 line-clamp-2 max-w-md mx-auto sm:mx-0">
                "{profile.bio}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <button 
                onClick={() => navigate('/ranks')}
                className="badge bg-[var(--color-surface-2)] text-[var(--color-text-heading)] border-0 rounded-lg font-medium hover:bg-indigo-100 transition-colors cursor-help"
                title={t('about_roles')}
              >
                {roleLabels[profile?.role] || t('role_volunteer')}
              </button>
              {profile?.is_supporter && (
                <span className="badge bg-yellow-100 text-yellow-700 border-yellow-200 border rounded-lg font-bold text-[10px] animate-pulse">
                  {t('patron')}
                </span>
              )}
              {profile?.teams && (
                <button 
                  onClick={() => navigate(`/team/${profile.teams.id}`)}
                  className="badge bg-[var(--color-surface-2)] text-[var(--color-text-body)] border-0 rounded-lg hover:bg-[var(--color-primary)] hover:text-white cursor-pointer transition-colors"
                >
                  🏢 {profile.teams.name}
                </button>
              )}
              <button 
                onClick={() => navigate('/ranks')}
                className="badge bg-[var(--color-surface-2)] text-[var(--color-text-body)] border-0 rounded-lg flex items-center pr-3 hover:bg-amber-100 transition-colors cursor-help"
                title={t('about_ranks')}
              >
                {getRankData(hours).icon} {getRankData(hours).name}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setIsQRModalOpen(true)}
                  className="btn btn-sm btn-outline border-gray-200 rounded-xl text-[var(--color-text-body)]"
                >
                  {t('btn_qr')}
                </button>
                <button 
                  onClick={generatePDF}
                  className="btn btn-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-none rounded-xl shadow-lg shadow-indigo-100"
                >
                  {t('btn_pdf')}
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-sm btn-outline border-gray-200 rounded-xl text-[var(--color-text-body)]"
                >
                  {t('btn_edit_profile')}
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                {t('btn_back')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{animatedHours}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">{t('stat_hours')}</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{events}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">{t('stat_events_prof')}</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{achievements.length}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">{t('stat_achievements')}</div>
        </div>
      </div>

      {/* Rank Progress Bar */}
      {(() => {
        const rankInfo = getRankData(animatedHours)
        const NextIcon = rankInfo.next?.Icon
        return (
          <div className="bg-white rounded-2xl card-shadow p-6 relative overflow-hidden transition-all duration-500 hover:shadow-xl">
            {/* Epic Glow Background */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.1] pointer-events-none epic-glow-pulse" style={{ backgroundColor: rankInfo.color }}></div>
            
            {/* Level Up Overlay */}
            {levelUpMessage && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                 <div className="text-center float-up-fade">
                    <div className="text-5xl mb-2 animate-bounce">⭐</div>
                    <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: rankInfo.color }}>{t('new_rank')}</h3>
                    <p className="text-sm font-bold text-gray-500 mt-1">{levelUpMessage}</p>
                 </div>
              </div>
            )}

            <h2 className="font-bold text-[var(--color-text-heading)] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">🏅 <span className="uppercase tracking-widest text-xs">{t('rank_progress')}</span></span>
              {addedHours > 0 && (
                <div className="text-emerald-700 font-black text-sm float-up-fade drop-shadow-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {t('added_hours').replace('{hours}', addedHours)}
                </div>
              )}
            </h2>

            <div className="flex items-center gap-4 relative z-10">
              {/* Current rank */}
              <button 
                onClick={() => navigate('/ranks')}
                className="flex flex-col items-center min-w-[70px] hover:scale-110 transition-transform"
                title={t('rank_details')}
              >
                <div className="p-2 bg-gray-50 rounded-2xl transition-all" style={{ boxShadow: `0 4px 15px ${rankInfo.color}33`, border: `1px solid ${rankInfo.color}22` }}>{rankInfo.icon}</div>
                <span className="text-[10px] font-bold mt-2 uppercase tracking-widest" style={{ color: rankInfo.color }}>{rankInfo.name}</span>
              </button>

              {/* Progress bar */}
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-[var(--color-text-body)] mb-2 font-black">
                  <span style={{ color: rankInfo.color }}>{animatedHours} {t('stat_hours').toLowerCase()}</span>
                  <span>{rankInfo.next ? t('hours_to_next').replace('{hours}', rankInfo.hoursToNext) : t('max_rank')}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full rank-progress-bar-epic"
                    style={{
                      width: `${rankInfo.progress}%`,
                      background: rankInfo.progress === 100
                        ? 'linear-gradient(90deg, #FFD700, #FF8C00, #FFD700)'
                        : `linear-gradient(90deg, ${rankInfo.color}, ${rankInfo.next ? rankInfo.next.color : rankInfo.color})`,
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>
              </div>

              {/* Next rank */}
              {rankInfo.next ? (
                <div className="flex flex-col items-center min-w-[70px]">
                  <div 
                    className="p-2 bg-[var(--color-surface)] border-2 border-dashed rounded-2xl transition-all duration-300"
                    style={{ 
                      borderColor: rankInfo.next.color, 
                      opacity: 0.3 + (0.7 * (rankInfo.progress / 100)),
                      boxShadow: `0 0 ${rankInfo.progress / 5}px ${rankInfo.next.color}33`
                    }}
                  >
                    {NextIcon && <NextIcon className="w-5 h-5" style={{ filter: `drop-shadow(0 0 5px ${rankInfo.next.color})`, color: rankInfo.next.color }} />}
                  </div>
                  <span 
                    className="text-[10px] font-bold mt-2 uppercase tracking-widest transition-colors duration-300"
                    style={{ color: rankInfo.next.color, opacity: 0.5 + (0.5 * (rankInfo.progress / 100)) }}
                  >
                    {rankInfo.next.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center min-w-[70px]">
                  <div className="p-2 bg-gradient-to-tr from-amber-200 to-amber-500 rounded-2xl card-shadow">
                    <span className="text-xl">🌟</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-500 mt-2 uppercase tracking-widest">MAX</span>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-bold text-[var(--color-text-heading)] mb-3">{t('achievements_title')}</h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="bg-[var(--color-surface)] rounded-xl p-3 text-center border border-gray-100">
                <span className="text-2xl">{a.achievements_catalog?.icon || '🏅'}</span>
                <p className="text-xs text-[var(--color-text-heading)] mt-1 font-medium">{a.achievements_catalog?.title || t('achievement_default')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-body)]">
            {t('no_achievements')}
          </p>
        )}
      </div>

      {/* Appreciation Letters Section */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-bold text-[var(--color-text-heading)] mb-3 flex items-center gap-2">
          <span>{t('letters_title')}</span>
          <span className="badge badge-sm bg-indigo-50 text-indigo-600 border-0">{t('letter_new')}</span>
        </h2>
        <div className="space-y-3">
          {profile?.is_supporter && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 flex items-center gap-4 animate-in slide-in-from-left duration-700">
               <div className="text-3xl">📜</div>
               <div>
                 <p className="text-sm font-bold text-yellow-800">{t('letter_dev_title')}</p>
                 <p className="text-[10px] text-yellow-600 font-medium lowercase">{t('letter_dev_desc')}</p>
               </div>
               <div className="ml-auto text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Official</div>
            </div>
          )}
          {(!profile?.is_supporter) && (
            <div className="bg-slate-50 rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
               <div className="text-4xl mb-3">✉️</div>
               <p className="text-sm font-bold text-slate-500 mb-1">{t('no_letters_title')}</p>
               <p className="text-xs text-slate-400">{t('no_letters_desc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-bold text-[var(--color-text-heading)] mb-3">{t('participation_title')}</h2>
        {recentEvents.length > 0 ? (
          <div className="space-y-2">
            {recentEvents.map((ep) => (
              <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface)] transition-colors">
                <span className="text-2xl">{ep.events?.emoji || '📋'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-heading)]">{ep.events?.title}</p>
                  <p className="text-xs text-[var(--color-text-body)]">
                    {ep.events?.teams?.name} • {new Date(ep.events?.event_date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className={`badge border-0 rounded-lg text-xs ${
                  ep.status === 'attended' ? 'bg-green-50 text-green-700' :
                  ep.status === 'absent' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {ep.status === 'attended' ? t('status_attended') : ep.status === 'absent' ? t('status_absent') : t('status_enrolled')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-body)]">
            {t('no_participations')}
          </p>
        )}
      </div>

      {/* Modals only for own profile */}
      {isOwnProfile && isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-100 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-heading)]">{t('settings_title')}</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-2 ring-gray-50">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-gray-400">👤</span>}
                </div>
                <label className="text-xs text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 transition-colors">
                  {uploading ? t('img_uploading') : t('img_change')}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1">{t('about_me')}</label>
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  className="textarea textarea-bordered w-full rounded-2xl h-24 text-sm focus:border-indigo-500 transition-all" 
                  placeholder={t('about_me_placeholder')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex-1 rounded-2xl border-none shadow-lg shadow-indigo-100">
                  {saving ? <span className="loading loading-spinner loading-xs"></span> : t('btn_save')}
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost flex-1 rounded-2xl">{t('btn_cancel_edit')}</button>
              </div>
            </form>
            <div className="mt-8 pt-4 border-t border-gray-50 text-center">
              <button onClick={async () => { if(confirm(t('logout_confirm'))){ await signOut(); navigate('/login') }}} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">{t('btn_logout')}</button>
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && isQRModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full text-center relative shadow-2xl border border-gray-50 animate-modalfadein">
            <button onClick={() => setIsQRModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            <div className="pt-2">
              <h3 className="font-black text-xl mb-1 text-[var(--color-text-heading)]">{t('qr_title')}</h3>
              <p className="text-[10px] uppercase font-black text-gray-400 mb-6 tracking-widest">{t('qr_desc')}</p>
              <div className="bg-white p-5 rounded-[2rem] border-2 border-gray-100 inline-block mb-6 shadow-inner">
                <QRCodeSVG value={currentUser.id} size={180} fgColor="#3122b5" includeMargin={true} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-[var(--color-text-heading)]">{displayName} {displayLastName}</p>
                <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-500 bg-indigo-50 py-1 px-3 rounded-full inline-block">ID: {currentUser.id.slice(0, 13).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE — PROFESSIONAL MULTI-PAGE ENGLISH PORTFOLIO */}
      <div id="portfolio-template" style={{ display: 'none', fontFamily: "'Inter', 'Montserrat', sans-serif", color: '#1f2937', background: '#ffffff' }}>

        {/* ═══════════════ PAGE 1: COVER & SUMMARY ═══════════════ */}
        <div className="pdf-page" style={{ width: '210mm', minHeight: '297mm', padding: 0, position: 'relative', overflow: 'hidden', boxSizing: 'border-box', background: '#fff' }}>
          {/* Border frames */}
          <div style={{ position: 'absolute', top: '5mm', left: '5mm', right: '5mm', bottom: '5mm', border: '1px solid #E5E7EB', pointerEvents: 'none', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: '7mm', left: '7mm', right: '7mm', bottom: '7mm', border: '3px solid #9B111E', pointerEvents: 'none', zIndex: 1 }} />

          {/* Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: '0.03', pointerEvents: 'none', zIndex: 0 }}>
            <svg width="500" height="500" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="#9B111E" strokeWidth="0.4" /><path d="M50 2 L50 98 M2 50 L98 50 M15 15 L85 85 M15 85 L85 15" stroke="#9B111E" strokeWidth="0.4" strokeDasharray="1 1" /></svg>
          </div>

          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: '15mm', left: '10mm', opacity: 0.9, zIndex: 2 }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', top: '15mm', right: '10mm', opacity: 0.9, transform: 'rotate(90deg)', zIndex: 2 }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', bottom: '10mm', left: '10mm', opacity: 0.9, transform: 'rotate(-90deg)', zIndex: 2 }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', bottom: '10mm', right: '10mm', opacity: 0.9, transform: 'rotate(180deg)', zIndex: 2 }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '25mm', display: 'flex', flexDirection: 'column', zIndex: 5, boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src="/logo.png" alt="Jas Volunteers" style={{ height: '50px', objectFit: 'contain' }} />
                <div>
                  <p style={{ letterSpacing: '4px', fontSize: '10px', fontWeight: '800', color: '#9B111E', margin: '0 0 2px 0' }}>OFFICIAL VOLUNTEER PORTFOLIO</p>
                  <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#111827' }}>JAS <span style={{ color: '#9B111E' }}>VOLUNTEERS</span></h1>
                </div>
              </div>
              <div style={{ textAlign: 'right', border: '2px solid #E5E7EB', padding: '3mm 5mm', borderRadius: '3mm' }}>
                <p style={{ margin: 0, fontSize: '8px', color: '#6B7280', fontWeight: '800', letterSpacing: '1px' }}>DOCUMENT NO.</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', fontFamily: 'monospace', color: '#111827' }}>{profile?.id?.slice(0, 13).toUpperCase()}</p>
              </div>
            </div>

            <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, #9B111E 0%, #9B111E 30%, #E5E7EB 100%)', marginBottom: '12mm' }} />

            {/* Volunteer Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8mm', marginBottom: '12mm', padding: '8mm', border: '1px solid #F3F4F6', borderRadius: '4mm' }}>
              <div style={{ width: '35mm', height: '35mm', borderRadius: '50%', background: '#9B111E', border: '3mm solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.first_name_en?.[0] || profile?.first_name?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <div style={{ padding: '3px 12px', background: '#9B111E', color: 'white', borderRadius: '50px', fontSize: '9px', fontWeight: '800', display: 'inline-block', letterSpacing: '1.5px', marginBottom: '4px' }}>CERTIFIED VOLUNTEER</div>
                <h2 style={{ fontSize: '30px', fontWeight: '900', margin: '0', color: '#111827' }}>
                  {profile?.first_name_en || profile?.first_name} {profile?.last_name_en || profile?.last_name}
                </h2>
                {profile?.teams && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{profile.teams.name}</p>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4mm', marginBottom: '10mm' }}>
              <div style={{ padding: '5mm', background: '#FAFAFA', borderRadius: '3mm', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase' }}>Service Hours</p>
                <p style={{ margin: '2mm 0 0', fontSize: '24px', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{hours}</p>
              </div>
              <div style={{ padding: '5mm', background: '#FAFAFA', borderRadius: '3mm', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase' }}>Service Projects</p>
                <p style={{ margin: '2mm 0 0', fontSize: '24px', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{events}</p>
              </div>
              <div style={{ padding: '5mm', background: '#FAFAFA', borderRadius: '3mm', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase' }}>Awards Count</p>
                <p style={{ margin: '2mm 0 0', fontSize: '24px', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{achievements.length}</p>
              </div>
            </div>

            {/* Rank */}
            {(() => {
              const rankInfo = getRankData(hours)
              const RIcon = rankInfo.IconComponent
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5mm', padding: '5mm 6mm', background: '#FAFAFA', borderRadius: '4mm', border: '1px solid #E5E7EB', marginBottom: '12mm' }}>
                  <div style={{ width: '44px', height: '44px', background: 'white', border: `2px solid ${rankInfo.color}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', flexShrink: 0 }}>
                    <RIcon style={{ width: '28px', height: '28px', color: rankInfo.color }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '2px', textTransform: 'uppercase' }}>Volunteer Rank</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: rankInfo.color }}>{rankInfo.enName}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px' }}>PROGRESS</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: rankInfo.color }}>{Math.round(rankInfo.progress)}%</p>
                  </div>
                </div>
              )
            })()}

            {/* Bio */}
            {profile?.bio && (
              <div style={{ marginBottom: '12mm', padding: '5mm 6mm', background: '#FAFAFA', borderRadius: '4mm', border: '1px solid #E5E7EB' }}>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3mm' }}>Personal Statement</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#374151', lineHeight: '1.7' }}>{profile.bio}</p>
              </div>
            )}

            {/* Footer: Verification */}
            <div style={{ marginTop: 'auto', paddingTop: '8mm', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#111827', letterSpacing: '1px' }}>AUTHENTICITY VERIFICATION</p>
                <p style={{ margin: '2mm 0 0', fontSize: '8px', color: '#6B7280', lineHeight: '1.5', maxWidth: '100mm' }}>
                  This document is an official record of volunteer service within the Jas Volunteers network.
                  Verify online or scan the QR code.
                </p>
                <div style={{ marginTop: '4mm', display: 'flex', alignItems: 'center', gap: '3mm' }}>
                  <div style={{ padding: '1.5mm', border: '1.5px solid #E5E7EB', borderRadius: '2mm' }}>
                    <QRCodeSVG value={`${window.location.origin}/profile/${profile.id}`} size={48} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#111827' }}>SCAN TO VERIFY</p>
                    <p style={{ margin: 0, fontSize: '8px', color: '#9B111E', fontWeight: '600' }}>jasvolunteers.org/v/{profile.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '28mm', height: '28mm', border: '1.5mm double #9B111E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(-12deg)', textAlign: 'center' }}>
                    <div style={{ color: '#9B111E', fontSize: '7px', fontWeight: '800', letterSpacing: '1px' }}>OFFICIAL</div>
                    <div style={{ color: '#9B111E', fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>VERIFIED</div>
                  </div>
                </div>
                <p style={{ fontSize: '7px', color: '#9CA3AF', marginTop: '2mm', fontWeight: '600' }}>Issued: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ PAGE 2: RECORD OF VOLUNTEER SERVICE ═══════════════ */}
        <div className="pdf-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 25mm', position: 'relative', boxSizing: 'border-box', background: '#fff' }}>
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: '10mm', left: '10mm', opacity: 0.6, zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', top: '10mm', right: '10mm', opacity: 0.6, transform: 'rotate(90deg)', zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8mm' }}>
            <div>
              <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#9B111E', letterSpacing: '3px' }}>SECTION II</p>
              <h2 style={{ margin: '2mm 0 0', fontSize: '22px', fontWeight: '900', color: '#111827' }}>Record of Volunteer Service</h2>
            </div>
            <p style={{ margin: 0, fontSize: '8px', color: '#9CA3AF', fontWeight: '700' }}>JAS VOLUNTEERS — OFFICIAL PORTFOLIO</p>
          </div>
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg, #9B111E, #E5E7EB)', marginBottom: '8mm' }} />

          {/* Events Table */}
          {(() => {
            const attendedEvents = allEvents.filter(ep => ep.status === 'attended')
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8mm' }}>
                {/* IMPACT SCORES SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4mm', padding: '5mm', background: '#FAFAFA', borderRadius: '4mm', border: '1px solid #E5E7EB' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px' }}>ECOLOGY</p>
                    <p style={{ margin: '1mm 0 0', fontSize: '14px', fontWeight: '900', color: '#10B981' }}>{profile?.impact_score?.ecology || 0}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px' }}>CHARITY</p>
                    <p style={{ margin: '1mm 0 0', fontSize: '14px', fontWeight: '900', color: '#F59E0B' }}>{profile?.impact_score?.charity || 0}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px' }}>EDUCATION</p>
                    <p style={{ margin: '1mm 0 0', fontSize: '14px', fontWeight: '900', color: '#3B82F6' }}>{profile?.impact_score?.education || 0}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1px' }}>ANIMALS</p>
                    <p style={{ margin: '1mm 0 0', fontSize: '14px', fontWeight: '900', color: '#EF4444' }}>{profile?.impact_score?.animals || 0}</p>
                  </div>
                </div>

                {/* TABLE */}
                {attendedEvents.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #111827' }}>
                        <th style={{ textAlign: 'left', padding: '3mm 2mm', fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>No.</th>
                        <th style={{ textAlign: 'left', padding: '3mm 2mm', fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '3mm 2mm', fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Event</th>
                        <th style={{ textAlign: 'left', padding: '3mm 2mm', fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Team</th>
                        <th style={{ textAlign: 'center', padding: '3mm 2mm', fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendedEvents.map((ep, idx) => (
                        <tr key={ep.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '2.5mm 2mm', color: '#9CA3AF', fontWeight: '700', fontSize: '9px' }}>{idx + 1}</td>
                          <td style={{ padding: '2.5mm 2mm', color: '#374151', fontWeight: '600', fontSize: '9px', whiteSpace: 'nowrap' }}>
                            {new Date(ep.events?.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '2.5mm 2mm', color: '#111827', fontWeight: '700', fontSize: '10px' }}>{ep.events?.title}</td>
                          <td style={{ padding: '2.5mm 2mm', color: '#6B7280', fontSize: '9px' }}>{ep.events?.teams?.name || '—'}</td>
                          <td style={{ padding: '2.5mm 2mm', textAlign: 'center', color: '#047857', fontWeight: '700', fontSize: '9px' }}>Attended</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '11px', padding: '10mm 0' }}>No confirmed event participation on record.</p>
                )}
              </div>
            )
          })()}

          {/* Page footer */}
          <div style={{ position: 'absolute', bottom: '12mm', left: '25mm', right: '25mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '4mm' }}>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Jas Volunteers — Official Volunteer Portfolio</p>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Page 2</p>
          </div>
        </div>

        {/* ═══════════════ PAGE 3: LETTERS OF APPRECIATION ═══════════════ */}
        <div className="pdf-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 25mm', position: 'relative', boxSizing: 'border-box', background: '#fff' }}>
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: '10mm', left: '10mm', opacity: 0.6, zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', top: '10mm', right: '10mm', opacity: 0.6, transform: 'rotate(90deg)', zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8mm' }}>
            <div>
              <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#9B111E', letterSpacing: '3px' }}>SECTION III</p>
              <h2 style={{ margin: '2mm 0 0', fontSize: '22px', fontWeight: '900', color: '#111827' }}>Letters of Appreciation & Recommendations</h2>
            </div>
            <p style={{ margin: 0, fontSize: '8px', color: '#9CA3AF', fontWeight: '700' }}>JAS VOLUNTEERS — OFFICIAL PORTFOLIO</p>
          </div>
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg, #9B111E, #E5E7EB)', marginBottom: '8mm' }} />

          {testimonials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6mm' }}>
              {testimonials.map((t, idx) => {
                const authorName = (t.author?.first_name_en || t.author?.first_name || '') + ' ' + (t.author?.last_name_en || t.author?.last_name || '')
                const authorRole = t.author?.role === 'coordinator' ? 'Coordinator' : t.author?.role === 'sub_coordinator' ? 'Deputy Coordinator' : 'Team Member'
                return (
                  <div key={t.id || idx} style={{ padding: '6mm', border: '1px solid #E5E7EB', borderRadius: '3mm', borderLeft: '4px solid #9B111E' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#374151', lineHeight: '1.7', fontStyle: 'italic' }}>
                      "{t.content}"
                    </p>
                    <div style={{ marginTop: '4mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: '#111827' }}>{authorName.trim()}</p>
                        <p style={{ margin: 0, fontSize: '9px', color: '#6B7280' }}>{authorRole}{t.author?.teams?.name ? `, ${t.author.teams.name}` : ''}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: '8px', color: '#9CA3AF', fontWeight: '600' }}>
                        {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '25mm 0' }}>
              <p style={{ color: '#9CA3AF', fontSize: '11px', margin: '0 0 3mm' }}>No letters of appreciation have been issued for this volunteer yet.</p>
              <p style={{ color: '#D1D5DB', fontSize: '9px', margin: 0 }}>Appreciation letters from coordinators and supervisors will appear in this section when issued.</p>
            </div>
          )}

          {/* Page footer */}
          <div style={{ position: 'absolute', bottom: '12mm', left: '25mm', right: '25mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '4mm' }}>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Jas Volunteers — Official Volunteer Portfolio</p>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Page 3</p>
          </div>
        </div>

        {/* ═══════════════ PAGE 4: VERIFICATION & CLOSING ═══════════════ */}
        <div className="pdf-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 25mm', position: 'relative', boxSizing: 'border-box', background: '#fff' }}>
          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: '10mm', left: '10mm', opacity: 0.6, zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', top: '10mm', right: '10mm', opacity: 0.6, transform: 'rotate(90deg)', zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', bottom: '10mm', left: '10mm', opacity: 0.6, transform: 'rotate(-90deg)', zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>
          <div style={{ position: 'absolute', bottom: '10mm', right: '10mm', opacity: 0.6, transform: 'rotate(180deg)', zIndex: 2 }}><svg width="25" height="25" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="3" /><circle cx="5" cy="5" r="3" fill="#9B111E" /></svg></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8mm' }}>
            <div>
              <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#9B111E', letterSpacing: '3px' }}>SECTION IV</p>
              <h2 style={{ margin: '2mm 0 0', fontSize: '22px', fontWeight: '900', color: '#111827' }}>Authenticity & Verification</h2>
            </div>
            <p style={{ margin: 0, fontSize: '8px', color: '#9CA3AF', fontWeight: '700' }}>JAS VOLUNTEERS — OFFICIAL PORTFOLIO</p>
          </div>
          <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg, #9B111E, #E5E7EB)', marginBottom: '10mm' }} />

          {/* Verification block */}
          <div style={{ padding: '10mm', border: '2px solid #E5E7EB', borderRadius: '5mm', marginBottom: '10mm' }}>
            <h3 style={{ margin: '0 0 5mm', fontSize: '14px', fontWeight: '900', color: '#111827', letterSpacing: '0.5px' }}>Statement of Authenticity</h3>
            <p style={{ margin: 0, fontSize: '10px', color: '#4B5563', lineHeight: '1.8' }}>
              This document serves as an official portfolio and proof of volunteer service within the Jas Volunteers national network, Republic of Kazakhstan.
              All data reflected herein — including volunteer hours, event participation, and letters of appreciation — is maintained in a verified digital system
              and is subject to audit. Organizations and educational institutions may verify this record by scanning the QR code below or visiting our verification portal.
            </p>
          </div>

          {/* QR + Details */}
          <div style={{ display: 'flex', gap: '10mm', marginBottom: '15mm' }}>
            <div style={{ padding: '5mm', border: '2px solid #E5E7EB', borderRadius: '4mm', flexShrink: 0 }}>
              <QRCodeSVG value={`${window.location.origin}/profile/${profile.id}`} size={100} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3mm' }}>
              <div>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px' }}>VERIFICATION URL</p>
                <p style={{ margin: '1mm 0 0', fontSize: '11px', color: '#9B111E', fontWeight: '700' }}>{window.location.origin}/profile/{profile.id.slice(0, 8)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px' }}>DOCUMENT ID</p>
                <p style={{ margin: '1mm 0 0', fontSize: '11px', color: '#111827', fontWeight: '700', fontFamily: 'monospace' }}>{profile.id.toUpperCase()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '8px', fontWeight: '800', color: '#6B7280', letterSpacing: '1.5px' }}>DATE OF ISSUANCE</p>
                <p style={{ margin: '1mm 0 0', fontSize: '11px', color: '#111827', fontWeight: '700' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Official Seal */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15mm' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '40mm', height: '40mm', border: '2mm double #9B111E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <div style={{ transform: 'rotate(-12deg)', textAlign: 'center' }}>
                  <div style={{ color: '#9B111E', fontSize: '7px', fontWeight: '800', letterSpacing: '2px' }}>JAS VOLUNTEERS</div>
                  <div style={{ color: '#9B111E', fontSize: '18px', fontWeight: '900', letterSpacing: '1px', margin: '2px 0' }}>VERIFIED</div>
                  <div style={{ color: '#9B111E', fontSize: '7px', fontWeight: '800', letterSpacing: '2px' }}>OFFICIAL RECORD</div>
                </div>
              </div>
              <p style={{ fontSize: '8px', color: '#9CA3AF', marginTop: '4mm', fontWeight: '600' }}>Digital Verification Seal</p>
            </div>
          </div>

          {/* Organization info */}
          <div style={{ padding: '6mm', background: '#FAFAFA', borderRadius: '4mm', border: '1px solid #E5E7EB' }}>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#111827', letterSpacing: '1px', marginBottom: '3mm' }}>ISSUING ORGANIZATION</p>
            <p style={{ margin: 0, fontSize: '10px', color: '#374151', lineHeight: '1.6' }}>
              Jas Volunteers — National Volunteer Network<br />
              Republic of Kazakhstan<br />
              jasvolunteers.org
            </p>
          </div>

          {/* Page footer */}
          <div style={{ position: 'absolute', bottom: '12mm', left: '25mm', right: '25mm', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '4mm' }}>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Jas Volunteers — Official Volunteer Portfolio</p>
            <p style={{ margin: 0, fontSize: '7px', color: '#9CA3AF', fontWeight: '600' }}>Page 4</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
