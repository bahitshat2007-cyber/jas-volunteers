import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import TeamSwitchModal from '../components/TeamSwitchModal.jsx'

const medals = ['🥇', '🥈', '🥉']

function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [switchModal, setSwitchModal] = useState({ open: false, teamId: null, teamName: null, currentTeamName: '' })
  const { user, profile, refreshProfile } = useAuth()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    setLoading(true)
    const { data, error } = await supabase
      .from('teams')
      .select('*, profiles(id, total_hours, total_events)')
      .eq('status', 'approved')
      .order('name')

    if (!error && data) {
      // Calculate team stats from profiles
      const teamsWithStats = data.map(team => ({
        ...team,
        members: team.profiles?.length || 0,
        totalHours: team.profiles?.reduce((sum, p) => sum + (Number(p.total_hours) || 0), 0) || 0,
        totalEvents: team.profiles?.reduce((sum, p) => sum + (Number(p.total_events) || 0), 0) || 0,
      }))
      // Sort by total hours descending
      teamsWithStats.sort((a, b) => b.totalHours - a.totalHours)
      setTeams(teamsWithStats)
    }
    setLoading(false)
  }

  async function handleJoinTeam(e, teamId, teamName) {
    if (e) e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }

    const currentTeamId = profile?.team_id
    if (currentTeamId === teamId) {
       navigate(`/team/${teamId}`)
       return
    }

    const isCoordinator = profile?.role === 'coordinator'
    if (isCoordinator && currentTeamId) {
       alert('Вы являетесь координатором своей команды. Передайте лидерство прежде чем вступать в новую.')
       return
    }

    if (currentTeamId) {
      // Find current team name
      const currentTeam = teams.find(t => t.id === currentTeamId) || { name: 'своей текущей команды' }
      setSwitchModal({ 
        open: true, 
        teamId, 
        teamName, 
        currentTeamName: currentTeam.name 
      })
      return
    }

    // Direct join if no team
    confirmJoin(teamId)
  }

  async function confirmJoin(teamId) {
    setIsProcessing(true)
    try {
      const { error } = await supabase.rpc('join_team', { new_team_id: teamId })
      if (error) throw error
      
      await refreshProfile()
      navigate(`/team/${teamId}`)
    } catch (err) {
      alert('Ошибка: ' + err.message)
    } finally {
      setIsProcessing(false)
      setSwitchModal({ open: false, teamId: null, teamName: null, currentTeamName: '' })
    }
  }

  // Fallback mock data if no teams in DB yet
  const showMock = !loading && teams.length === 0
  const mockTeams = [
    { id: 1, name: 'Green Wave KZ', members: 520, totalHours: 3200, totalEvents: 45, instagram: '@greenwave_kz' },
    { id: 2, name: 'Paws & Hearts', members: 380, totalHours: 2800, totalEvents: 38, instagram: '@paws_hearts' },
    { id: 3, name: 'Bright Future', members: 610, totalHours: 2500, totalEvents: 32, instagram: '@bright_future_kz' },
    { id: 4, name: 'Helping Hand', members: 450, totalHours: 2100, totalEvents: 28, instagram: '@helping_hand_kz' },
    { id: 5, name: 'Eco Patrol', members: 300, totalHours: 1800, totalEvents: 24, instagram: '@eco_patrol' },
    { id: 6, name: 'Tech4Good', members: 200, totalHours: 1500, totalEvents: 20, instagram: '@tech4good_kz' },
    { id: 7, name: 'Youth Power', members: 700, totalHours: 1200, totalEvents: 18, instagram: '@youth_power_kz' },
    { id: 8, name: 'Kind Hearts', members: 480, totalHours: 1000, totalEvents: 15, instagram: '@kind_hearts_kz' },
  ]

  const displayTeams = showMock ? mockTeams : teams

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">🏆 Рейтинг команд</h1>
        <span className="text-sm text-[var(--color-text-body)]">Обновление: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      {loading && <LoadingScreen message="Ранжирование кланов..." />}

      {!loading && (
        <>
          {showMock && (
            <div className="bg-yellow-50 text-yellow-800 rounded-xl px-4 py-3 text-sm">
              ℹ️ База данных пока пуста. Показаны демо-данные. Данные появятся после того, как команды будут одобрены и волонтеры начнут регистрироваться.
            </div>
          )}

          {/* Top 3 Podium */}
          {displayTeams.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {displayTeams.slice(0, 3).map((team, i) => (
                <div 
                  key={team.id} 
                  onClick={() => navigate(`/team/${team.id}`)}
                  className={`bg-white rounded-2xl card-shadow p-5 text-center card-hover cursor-pointer card-h-podium ${i === 0 ? 'ring-2 ring-[var(--color-primary)] ring-opacity-30' : ''}`}
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-4xl mb-1">{medals[i]}</div>
                    <h3 className="font-bold text-[var(--color-text-heading)] text-sm md:text-base leading-tight">{team.name}</h3>
                    <div className="text-2xl font-bold text-[var(--color-primary)] mt-2">{team.totalHours.toLocaleString()}</div>
                    <div className="text-xs text-[var(--color-text-body)] mb-4">часов</div>
                  </div>
                  
                  <button 
                    disabled={isProcessing}
                    onClick={(e) => handleJoinTeam(e, team.id, team.name)}
                    className="w-full bg-[var(--color-primary)] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-700 disabled:opacity-50"
                  >
                    {profile?.team_id === team.id ? '📍 Внутри' : (profile?.team_id ? '🔄 Сменить' : '➕ Вступить')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-[var(--color-surface)] text-[var(--color-text-body)] text-sm">
                    <th className="font-medium">#</th>
                    <th className="font-medium">Команда</th>
                    <th className="font-medium text-center">Участников</th>
                    <th className="font-medium text-center">Часов</th>
                    <th className="font-medium text-center">Мероприятий</th>
                    <th className="font-medium">Instagram</th>
                    <th className="font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayTeams.map((team, i) => (
                    <tr 
                      key={team.id} 
                      onClick={() => navigate(`/team/${team.id}`)}
                      className="hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                    >
                      <td className="font-bold text-[var(--color-text-heading)]">
                        {i < 3 ? medals[i] : i + 1}
                      </td>
                      <td>
                        <span className="font-medium text-[var(--color-text-heading)]">{team.name}</span>
                      </td>
                      <td className="text-center text-[var(--color-text-body)]">{team.members}</td>
                      <td className="text-center font-semibold text-[var(--color-primary)]">{team.totalHours.toLocaleString()}</td>
                      <td className="text-center text-[var(--color-text-body)]">{team.totalEvents}</td>
                      <td className="text-[var(--color-text-body)] text-sm">{team.instagram || '—'}</td>
                      <td className="text-right">
                        <button 
                          disabled={isProcessing}
                          onClick={(e) => handleJoinTeam(e, team.id, team.name)}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                            profile?.team_id === team.id 
                            ? 'bg-gray-100 text-gray-500 border-gray-100' 
                            : 'bg-white text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                          }`}
                        >
                          {profile?.team_id === team.id ? 'УЖЕ ТУТ' : 'ВСТУПИТЬ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <TeamSwitchModal 
        isOpen={switchModal.open}
        onClose={() => setSwitchModal({ ...switchModal, open: false })}
        onConfirm={() => confirmJoin(switchModal.teamId)}
        teamName={switchModal.teamName}
        currentTeamName={switchModal.currentTeamName}
      />
    </div>
  )
}

export default TeamsPage
