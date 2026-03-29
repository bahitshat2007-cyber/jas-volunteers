import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import LoadingScreen from '../components/LoadingScreen.jsx'

function AchievementsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [allAchievements, setAllAchievements] = useState([])
  const [userAchievementIds, setUserAchievementIds] = useState(new Set())
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchAllAchievements()
    if (user) {
      fetchUserAchievements()
    }
  }, [user])

  async function fetchAllAchievements() {
    const { data } = await supabase
      .from('achievements_catalog')
      .select('*')
      .order('type', { ascending: true })
    if (data) setAllAchievements(data)
    setFetching(false)
  }

  async function fetchUserAchievements() {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)
    if (data) {
      setUserAchievementIds(new Set(data.map(a => a.achievement_id)))
    }
  }

  const getRarityStyles = (type) => {
    switch (type) {
      case 'specific': // Legendary/Gold
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-50',
          shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
          label: 'Легендарное',
          textColor: 'text-amber-700'
        }
      case 'event_based': // Rare/Purple
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-50',
          shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
          label: 'Редкое',
          textColor: 'text-purple-700'
        }
      default: // Classic/Common
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-50',
          shadow: '',
          label: 'Обычное',
          textColor: 'text-blue-700'
        }
    }
  }

  if (loading || fetching) {
    return <LoadingScreen message="Открываем книгу достижений..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-brand text-[var(--color-text-heading)]">Зал славы</h1>
        <p className="text-[var(--color-text-body)]">Твои достижения и будущие вершины</p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map((ach) => {
          const isUnlocked = userAchievementIds.has(ach.id)
          const styles = getRarityStyles(ach.type)
          
          return (
            <div 
              key={ach.id}
              className={`relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${
                isUnlocked 
                  ? `${styles.border} ${styles.bg} ${styles.shadow} scale-100` 
                  : 'border-gray-100 bg-gray-50/50 grayscale opacity-60'
              }`}
            >
              {/* Rarity Label */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-white ${styles.textColor} ${styles.border}`}>
                {styles.label}
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`text-5xl mb-1 ${isUnlocked ? 'animate-bounce-subtle' : ''}`}>
                  {ach.icon || '🏅'}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-heading)] leading-tight">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-body)] mt-2 line-clamp-2">
                    {ach.description}
                  </p>
                </div>

                {!isUnlocked && (
                  <div className="mt-2 text-[10px] font-medium text-gray-400 flex items-center gap-1">
                    <span>🔒 Не открыто</span>
                  </div>
                )}
                {isUnlocked && (
                  <div className={`mt-2 text-[10px] font-bold ${styles.textColor} flex items-center gap-1`}>
                    <span>✨ Получено!</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center pt-8">
        <button 
          onClick={() => navigate('/profile')}
          className="btn btn-jas-ghost rounded-xl"
        >
          ← Вернуться в профиль
        </button>
      </div>
    </div>
  )
}

export default AchievementsPage
