import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { QRCodeSVG } from 'qrcode.react'
import {
  RankNovice, RankVolunteer, RankActivist,
  RankVeteran, RankChampion, RankLegend
} from '../components/Ornaments.jsx'

const RANKS_DATA = [
  { name: '╨Э╨╛╨▓╨╕╤З╨╛╨║',    min: 0,    color: '#9ca3af', Icon: RankNovice }, // gray-400
  { name: '╨Ф╨╛╨▒╤А╨╛╨▓╨╛╨╗╨╡╤Ж', min: 50,   color: '#10b981', Icon: RankVolunteer }, // emerald-500
  { name: '╨Р╨║╤В╨╕╨▓╨╕╤Б╤В',   min: 200,  color: '#3b82f6', Icon: RankActivist }, // blue-500
  { name: '╨Т╨╡╤В╨╡╤А╨░╨╜',    min: 500,  color: '#8b5cf6', Icon: RankVeteran }, // violet-500
  { name: '╨з╨╡╨╝╨┐╨╕╨╛╨╜',    min: 1000, color: '#f97316', Icon: RankChampion }, // orange-500
  { name: '╨Ы╨╡╨│╨╡╨╜╨┤╨░',    min: 2500, color: '#ef4444', Icon: RankLegend }, // red-500
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
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
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

        // 3. Fetch Events
        const { data: eventData } = await supabase
          .from('event_participants')
          .select('*, events(title, emoji, event_date, status, teams(name))')
          .eq('user_id', targetId)
          .order('registered_at', { ascending: false })
          .limit(10)
        
        // Filter out null events (deleted) and cancelled events
        const validEvents = (eventData || []).filter(ep => ep.events && ep.events.status !== 'cancelled')
        setRecentEvents(validEvents.slice(0, 5))

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
    volunteer: 'ЁЯЩЛ ╨Т╨╛╨╗╨╛╨╜╤В╨╡╤А',
    sub_coordinator: 'тЪЦя╕П ╨Ч╨░╨╝. ╨║╨╛╨╛╤А╨┤╨╕╨╜╨░╤В╨╛╤А╨░',
    coordinator: 'ЁЯЫбя╕П ╨Ъ╨╛╨╛╤А╨┤╨╕╨╜╨░╤В╨╛╤А',
    developer: 'ЁЯЫая╕П ╨а╨░╨╖╤А╨░╨▒╨╛╤В╤З╨╕╨║',
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
      alert('╨Ю╤И╨╕╨▒╨║╨░ ╨┐╤А╨╕ ╨╖╨░╨│╤А╤Г╨╖╨║╨╡ ╨░╨▓╨░╤В╨░╤А╨░: ' + error.message)
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
      alert('╨Ю╤И╨╕╨▒╨║╨░ ╨┐╤А╨╕ ╨╛╨▒╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╕ ╨┐╤А╨╛╤Д╨╕╨╗╤П: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const generatePDF = () => {
    window.print()
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-[var(--color-primary)]"></span>
      </div>
    )
  }

  if (!currentUser && isOwnProfile) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-10 text-center">
        <div className="text-5xl mb-4">ЁЯФР</div>
        <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">╨Т╨╛╨╣╨┤╨╕╤В╨╡ ╨▓ ╨░╨║╨║╨░╤Г╨╜╤В</h2>
        <p className="text-[var(--color-text-body)] mb-6">╨з╤В╨╛╨▒╤Л ╤Г╨▓╨╕╨┤╨╡╤В╤М ╤Б╨▓╨╛╨╣ ╨┐╤А╨╛╤Д╨╕╨╗╤М, ╨▓╨╛╨╣╨┤╨╕╤В╨╡ ╨╕╨╗╨╕ ╨╖╨░╤А╨╡╨│╨╕╤Б╤В╤А╨╕╤А╤Г╨╣╤В╨╡╤Б╤М</p>
        <button onClick={() => navigate('/login')} className="btn btn-jas rounded-xl">╨Т╨╛╨╣╤В╨╕</button>
      </div>
    )
  }

  if (!profile) {
     return <div className="text-center py-20">╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜</div>
  }

  const hours = Number(profile?.total_hours || 0)
  const events = Number(profile?.total_events || 0)
  const displayName = profile?.first_name || '╨Т╨╛╨╗╨╛╨╜╤В╨╡╤А'
  const displayLastName = profile?.last_name || ''

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl card-shadow p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-[var(--color-surface)] overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile?.first_name?.[0] || '?').toUpperCase()
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">
              {displayName} {displayLastName}
            </h1>
            <p className="text-[var(--color-text-body)] text-sm mb-1">{isOwnProfile ? currentUser?.email : '╨Р╨║╨║╨░╤Г╨╜╤В Jas Volunteers'}</p>
            {profile?.bio && (
              <p className="text-sm text-[var(--color-text-body)] italic mb-2 line-clamp-2 max-w-md mx-auto sm:mx-0">
                "{profile.bio}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <button 
                onClick={() => navigate('/ranks')}
                className="badge bg-[var(--color-surface-2)] text-[var(--color-text-heading)] border-0 rounded-lg font-medium hover:bg-indigo-100 transition-colors cursor-help"
                title="╨Ю ╤А╨╛╨╗╤П╤Е ╨╕ ╨┐╨╛╨╗╨╜╨╛╨╝╨╛╤З╨╕╤П╤Е"
              >
                {roleLabels[profile?.role] || 'ЁЯЩЛ ╨Т╨╛╨╗╨╛╨╜╤В╨╡╤А'}
              </button>
              {profile?.teams && (
                <button 
                  onClick={() => navigate(`/team/${profile.teams.id}`)}
                  className="badge bg-[var(--color-surface-2)] text-[var(--color-text-body)] border-0 rounded-lg hover:bg-[var(--color-primary)] hover:text-white cursor-pointer transition-colors"
                >
                  ЁЯСе {profile.teams.name}
                </button>
              )}
              <button 
                onClick={() => navigate('/ranks')}
                className="badge bg-[var(--color-surface-2)] text-[var(--color-text-body)] border-0 rounded-lg flex items-center pr-3 hover:bg-amber-100 transition-colors cursor-help"
                title="╨Ю ╤Б╨╕╤Б╤В╨╡╨╝╨╡ ╤А╨░╨╜╨│╨╛╨▓"
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
                  ЁЯУ╖ QR-╨║╨╛╨┤
                </button>
                <button 
                  onClick={generatePDF}
                  className="btn btn-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-none rounded-xl shadow-lg shadow-indigo-100"
                >
                  ЁЯУД PDF ╨Я╨╛╤А╤В╤Д╨╛╨╗╨╕╨╛
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-sm btn-outline border-gray-200 rounded-xl text-[var(--color-text-body)]"
                >
                  тЬПя╕П ╨а╨╡╨┤.
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                тЖР ╨Э╨░╨╖╨░╨┤
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{animatedHours}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">╨з╨░╤Б╨╛╨▓</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{events}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">╨Ь╨╡╤А╨╛╨┐╤А╨╕╤П╤В╨╕╨╣</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-primary)]">{achievements.length}</div>
          <div className="text-xs text-[var(--color-text-body)] mt-1">╨Р╤З╨╕╨▓╨╛╨║</div>
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
                    <div className="text-5xl mb-2 animate-bounce">тнР</div>
                    <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: rankInfo.color }}>╨Э╨Ю╨Т╨л╨Щ ╨а╨Р╨Э╨У!</h3>
                    <p className="text-sm font-bold text-gray-500 mt-1">{levelUpMessage}</p>
                 </div>
              </div>
            )}

            <h2 className="font-bold text-[var(--color-text-heading)] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">ЁЯПЕ <span className="uppercase tracking-widest text-xs">╨Я╤А╨╛╨│╤А╨╡╤Б╤Б ╤А╨░╨╜╨│╨░</span></span>
              {addedHours > 0 && (
                <div className="text-emerald-700 font-black text-sm float-up-fade drop-shadow-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  +{addedHours} ╤З╨░╤Б╨╛╨▓! ЁЯОЙ
                </div>
              )}
            </h2>

            <div className="flex items-center gap-4 relative z-10">
              {/* Current rank */}
              <button 
                onClick={() => navigate('/ranks')}
                className="flex flex-col items-center min-w-[70px] hover:scale-110 transition-transform"
                title="╨Я╨╛╨┤╤А╨╛╨▒╨╜╨╡╨╡ ╨╛ ╤А╨░╨╜╨│╨░╤Е"
              >
                <div className="p-2 bg-gray-50 rounded-2xl transition-all" style={{ boxShadow: `0 4px 15px ${rankInfo.color}33`, border: `1px solid ${rankInfo.color}22` }}>{rankInfo.icon}</div>
                <span className="text-[10px] font-bold mt-2 uppercase tracking-widest" style={{ color: rankInfo.color }}>{rankInfo.name}</span>
              </button>

              {/* Progress bar */}
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-[var(--color-text-body)] mb-2 font-black">
                  <span style={{ color: rankInfo.color }}>{animatedHours} ╤З.</span>
                  <span>{rankInfo.next ? `${rankInfo.hoursToNext} ╤З. ╨┤╨╛ ╤Б╨╗╨╡╨┤.` : '╨Ь╨Р╨Ъ╨б╨Ш╨Ь╨г╨Ь!'}</span>
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
                    <span className="text-xl">ЁЯСС</span>
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
        <h2 className="font-bold text-[var(--color-text-heading)] mb-3">ЁЯПЕ ╨Ф╨╛╤Б╤В╨╕╨╢╨╡╨╜╨╕╤П</h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="bg-[var(--color-surface)] rounded-xl p-3 text-center border border-gray-100">
                <span className="text-2xl">{a.achievements_catalog?.icon || 'ЁЯПЕ'}</span>
                <p className="text-xs text-[var(--color-text-heading)] mt-1 font-medium">{a.achievements_catalog?.title || '╨Ф╨╛╤Б╤В╨╕╨╢╨╡╨╜╨╕╨╡'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-body)]">
            ╨Ф╨╛╤Б╤В╨╕╨╢╨╡╨╜╨╕╨╣ ╨┐╨╛╨║╨░ ╨╜╨╡╤В ЁЯОп
          </p>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h2 className="font-bold text-[var(--color-text-heading)] mb-3">ЁЯУЛ ╨г╤З╨░╤Б╤В╨╕╨╡ ╨▓ ╨╝╨╡╤А╨╛╨┐╤А╨╕╤П╤В╨╕╤П╤Е</h2>
        {recentEvents.length > 0 ? (
          <div className="space-y-2">
            {recentEvents.map((ep) => (
              <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface)] transition-colors">
                <span className="text-2xl">{ep.events?.emoji || 'ЁЯУЛ'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-heading)]">{ep.events?.title}</p>
                  <p className="text-xs text-[var(--color-text-body)]">
                    {ep.events?.teams?.name} тАв {new Date(ep.events?.event_date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className={`badge border-0 rounded-lg text-xs ${
                  ep.status === 'attended' ? 'bg-green-50 text-green-700' :
                  ep.status === 'absent' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {ep.status === 'attended' ? 'тЬЕ ╨С╤Л╨╗' : ep.status === 'absent' ? 'тЭМ ╨Я╤А╨╛╨┐╤Г╤Б╨║' : 'тП│ ╨Ч╨░╨┐╨╕╤Б╨░╨╜'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-body)]">
            ╨Ь╨╡╤А╨╛╨┐╤А╨╕╤П╤В╨╕╨╣ ╨▓ ╤Б╨┐╨╕╤Б╨║╨╡ ╨╜╨╡╤В.
          </p>
        )}
      </div>

      {/* Modals only for own profile */}
      {isOwnProfile && isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">╨Э╨░╤Б╤В╤А╨╛╨╣╨║╨╕ ╨┐╤А╨╛╤Д╨╕╨╗╤П</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-gray-400">ЁЯСд</span>}
                </div>
                <label className="text-xs text-indigo-500 font-medium cursor-pointer">
                  {uploading ? '╨Ч╨░╨│╤А╤Г╨╖╨║╨░...' : '╨Ш╨╖╨╝╨╡╨╜╨╕╤В╤М ╤Д╨╛╤В╨╛'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">╨Ю ╤Б╨╡╨▒╨╡</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="textarea textarea-bordered w-full rounded-lg h-20 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn btn-jas flex-1 rounded-xl">{saving ? '...' : '╨б╨╛╤Е╤А╨░╨╜╨╕╤В╤М'}</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost flex-1 rounded-xl">╨Ю╤В╨╝╨╡╨╜╨░</button>
              </div>
            </form>
            <div className="mt-8 pt-4 border-t text-center">
              <button onClick={async () => { if(confirm('╨Т╤Л╨╣╤В╨╕?')){ await signOut(); navigate('/login') }}} className="text-sm text-red-500">ЁЯЪк ╨Т╤Л╨╣╤В╨╕ ╨╕╨╖ ╨░╨║╨║╨░╤Г╨╜╤В╨░</button>
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && isQRModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center relative">
            <button onClick={() => setIsQRModalOpen(false)} className="absolute top-4 right-4 text-gray-400">тЬХ</button>
            <h3 className="font-bold text-lg mb-4">╨Т╨░╤И Jas ID</h3>
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block mb-4">
              <QRCodeSVG value={currentUser.id} size={180} fgColor="#2E7D32" includeMargin={true} />
            </div>
            <p className="text-sm font-bold">{displayName} {displayLastName}</p>
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE - PREMIUM 10/10 DESIGN */}
      <div id="portfolio-template" style={{ 
        display: 'none', 
        width: '210mm', 
        minHeight: '297mm', 
        padding: '0', 
        background: '#ffffff', 
        color: '#1f2937', 
        fontFamily: "'Inter', 'Montserrat', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* BACKGROUND WATERMARK (Large Shanyrak) */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: '0.04', pointerEvents: 'none', zIndex: 0 }}>
          <svg width="400" height="400" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#9B111E" strokeWidth="1" />
            <path d="M50 2 L50 98 M2 50 L98 50 M15 15 L85 85 M15 85 L85 15" stroke="#9B111E" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* ORNAMENT CORNERS */}
        <div style={{ position: 'absolute', top: '10mm', left: '10mm', opacity: 0.8 }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="2" /><circle cx="4" cy="4" r="2" fill="#9B111E" /></svg></div>
        <div style={{ position: 'absolute', top: '10mm', right: '10mm', opacity: 0.8, transform: 'rotate(90deg)' }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="2" /><circle cx="4" cy="4" r="2" fill="#9B111E" /></svg></div>
        <div style={{ position: 'absolute', bottom: '10mm', left: '10mm', opacity: 0.8, transform: 'rotate(-90deg)' }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="2" /><circle cx="4" cy="4" r="2" fill="#9B111E" /></svg></div>
        <div style={{ position: 'absolute', bottom: '10mm', right: '10mm', opacity: 0.8, transform: 'rotate(180deg)' }}><svg width="40" height="40" viewBox="0 0 40 40"><path d="M0 40 L0 0 L40 0" fill="none" stroke="#9B111E" strokeWidth="2" /><circle cx="4" cy="4" r="2" fill="#9B111E" /></svg></div>

        <div style={{ position: 'relative', zIndex: 1, padding: '20mm' }}>
          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
            <p style={{ letterSpacing: '3px', fontSize: '9px', fontWeight: '800', color: '#9B111E', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Official Record of Volunteer Service</p>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '42px', fontWeight: '900', color: '#111827', margin: '0', letterSpacing: '-1.5px', lineHeight: '1' }}>
              JAS <span style={{ color: '#9B111E' }}>VOLUNTEERS</span>
            </h1>
            <div style={{ width: '60mm', height: '1.5pt', background: 'linear-gradient(90deg, transparent, #9B111E, transparent)', margin: '4mm auto' }}></div>
          </div>

          {/* USER PROFILE SECTION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10mm', marginBottom: '15mm', background: 'linear-gradient(135deg, #F9FAFB, #FFFFFF)', padding: '8mm', borderRadius: '10mm', border: '1px solid #F3F4F6' }}>
            <div style={{ position: 'relative' }}>
              {/* Avatar with Ornament Ring */}
              <div style={{ position: 'absolute', top: '-4mm', left: '-4mm', width: '48mm', height: '48mm', border: '1px dashed #9B111E', borderRadius: '50%', opacity: 0.3 }}></div>
              <div style={{ width: '40mm', height: '40mm', borderRadius: '50%', background: '#9B111E', border: '4mm solid #FFFFFF', overflow: 'hidden', boxShadow: '0 10px 25px rgba(155, 17, 30, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white' }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile?.first_name?.[0] || '?').toUpperCase()}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3mm', marginBottom: '2mm' }}>
                <span style={{ padding: '4px 12px', background: '#9B111E', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{getRankData(hours).name}</span>
                <span style={{ padding: '4px 12px', background: '#F3F4F6', color: '#4B5563', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>#{profile?.id?.slice(0, 8)}</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>{profile?.first_name} {profile?.last_name}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontStyle: 'italic', maxWidth: '100mm' }}>
                {profile?.bio || 'Dedicated member of the Jas Volunteers community, contributing to social growth and community development.'}
              </p>
            </div>
          </div>

          {/* STATISTICS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6mm', marginBottom: '15mm' }}>
            {[
              { label: 'Total Hours', val: hours, icon: 'тП▒я╕П', color: '#9B111E' },
              { label: 'Impact Projects', val: events, icon: 'ЁЯМЯ', color: '#111827' },
              { label: 'Achievements', val: achievements.length, icon: 'ЁЯПЖ', color: '#111827' }
            ].map((s, i) => (
              <div key={i} style={{ padding: '6mm', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8mm', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '24px', marginBottom: '2mm' }}>{s.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* EXPERIENCE TABLE */}
          {recentEvents.length > 0 && (
            <div style={{ marginBottom: '15mm' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#9B111E', borderBottom: '2mm solid #FEE2E2', paddingBottom: '2mm', marginBottom: '6mm' }}>
                Service History
              </h3>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 3mm' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '0 4mm' }}>Project Name</th>
                    <th style={{ padding: '0 4mm' }}>Date</th>
                    <th style={{ padding: '0 4mm', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((ep, idx) => (
                    <tr key={ep.id} style={{ background: idx % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                      <td style={{ padding: '4mm', borderTopLeftRadius: '6mm', borderBottomLeftRadius: '6mm' }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>{ep.events?.title}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{ep.events?.teams?.name}</div>
                      </td>
                      <td style={{ padding: '4mm', fontSize: '12px', color: '#4B5563' }}>
                        {new Date(ep.events?.event_date).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '4mm', textAlign: 'right', borderTopRightRadius: '6mm', borderBottomRightRadius: '6mm' }}>
                        <span style={{ 
                          padding: '2px 10px', 
                          background: ep.status === 'attended' ? '#D1FAE5' : '#F3F4F6', 
                          color: ep.status === 'attended' ? '#065F46' : '#6B7280', 
                          borderRadius: '100px', 
                          fontSize: '10px', 
                          fontWeight: '800' 
                        }}>
                          {ep.status === 'attended' ? 'VERIFIED' : 'PARTICIPATED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACHIEVEMENT SHIELDS */}
          {achievements.length > 0 && (
            <div style={{ marginBottom: '15mm' }}>
               <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#9B111E', borderBottom: '2mm solid #FEE2E2', paddingBottom: '2mm', marginBottom: '6mm' }}>
                Honors & Badges
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4mm' }}>
                {achievements.map(a => (
                  <div key={a.id} style={{ padding: '3mm 5mm', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '6mm', display: 'flex', alignItems: 'center', gap: '2mm' }}>
                    <span style={{ fontSize: '18px' }}>{a.achievements_catalog?.icon || 'ЁЯПЕ'}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#9A3412' }}>{a.achievements_catalog?.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER & SEAL */}
          <div style={{ marginTop: 'auto', paddingTop: '10mm', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
             <div style={{ maxWidth: '100mm' }}>
                <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '0 0 2mm 0', textTransform: 'uppercase', fontWeight: '800' }}>Verification Details</p>
                <p style={{ fontSize: '9px', color: '#4B5563', margin: 0, lineHeight: '1.5' }}>
                  This document serves as an official certification of volunteer hours performed within the Jas Volunteers platform. 
                  Digital verification available at: <span style={{ color: '#9B111E' }}>jasvolunteers.org/profile/{profile.id}</span>
                </p>
             </div>
             
             {/* THE OFFICIAL SEAL */}
             <div style={{ position: 'relative', width: '35mm', height: '35mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, border: '1.5mm double #9B111E', borderRadius: '50%', opacity: 0.8 }}></div>
                <div style={{ textAlign: 'center', transform: 'rotate(-15deg)' }}>
                  <div style={{ color: '#9B111E', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }}>OFFICIAL</div>
                  <div style={{ color: '#9B111E', fontSize: '14px', fontWeight: '900', letterSpacing: '1px' }}>VERIFIED</div>
                  <div style={{ color: '#9B111E', fontSize: '7px', fontWeight: '800' }}>JAS VOLUNTEERS</div>
                </div>
                {/* Micro shanyrak in seal */}
                <div style={{ position: 'absolute', bottom: '4mm', opacity: 0.5 }}>
                   <svg width="15" height="15" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#9B111E" strokeWidth="5"/><path d="M50 5 L50 95 M5 50 L95 50" stroke="#9B111E" strokeWidth="5"/></svg>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
) 
}

export default ProfilePage
