import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'

function TeamDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  
  const { t } = useLanguage()

  const getRankName = (hours) => {
    if (hours >= 2500) return t('rank_legend')
    if (hours >= 1000) return t('rank_champion')
    if (hours >= 500) return t('rank_veteran')
    if (hours >= 200) return t('rank_activist')
    if (hours >= 50) return t('rank_volunteer')
    return t('rank_novice')
  }

  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [annError, setAnnError] = useState(null)

  // Management State
  const [showManageMenu, setShowManageMenu] = useState(null)
  const [transferTarget, setTransferTarget] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [myCurrentRole, setMyCurrentRole] = useState(null)

  // Award Hours State
  const [awardHoursTarget, setAwardHoursTarget] = useState(null)
  const [awardHoursAmount, setAwardHoursAmount] = useState('')
  const [awardHoursReason, setAwardHoursReason] = useState('')

  const fetchData = async () => {
    try {
      // 1. Fetch Team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()
      if (teamError) throw teamError

      // 2. Fetch Members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, total_hours, rank, avatar_url')
        .eq('team_id', id)
        .order('total_hours', { ascending: false })
      if (membersError) throw membersError

      // 3. Fetch My Latest Role
      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role, team_id')
          .eq('id', user.id)
          .single()
        if (myProfile) setMyCurrentRole(myProfile)
      }

      // 4. Fetch Announcements (Handle 404 gracefully)
      const { data: annData, error: annQueryError } = await supabase
        .from('team_announcements')
        .select('*, author:profiles(first_name, last_name, avatar_url)')
        .eq('team_id', id)
        .order('created_at', { ascending: false })
        .limit(15)
      
      if (annQueryError) {
         console.error('Announcements Error:', annQueryError)
         if (annQueryError.code === '42P01') {
            setAnnError(t('err_announcements_table'))
         } else {
            setAnnError(t('err_announcements_load'))
         }
      } else {
         setAnnouncements(annData || [])
         setAnnError(null)
      }

      setTeam(teamData)
      setMembers(membersData || [])
      setTeam(teamData)
      setMembers(membersData || [])
    } catch (err) {
      console.error(err)
      setError(t('err_team_load'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id, user])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Computed Roles
  const isMyTeam = myCurrentRole?.team_id === id
  const amICoordinator = isMyTeam && myCurrentRole?.role === 'coordinator'
  const amISub = isMyTeam && (myCurrentRole?.role === 'sub_coordinator' || myCurrentRole?.role === 'coordinator')
  const canPost = amISub 

  const handlePostAnnouncement = async (e) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return
    setIsPosting(true)
    try {
      const { data, error } = await supabase
        .from('team_announcements')
        .insert([{ team_id: id, author_id: user.id, content: newAnnouncement.trim() }])
        .select('*, author:profiles(first_name, last_name, avatar_url)')
      if (error) throw error
      setAnnouncements([data[0], ...announcements.slice(0, 14)])
      setNewAnnouncement('')
    } catch (err) {
      alert(t('err_publish'))
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm(t('confirm_delete_msg'))) return
    try {
      await supabase.from('team_announcements').delete().eq('id', annId)
      setAnnouncements(announcements.filter(a => a.id !== annId))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAction = async (action, targetId, role = '') => {
    setIsProcessing(true)
    try {
      if (action === 'kick') {
        if (!confirm(t('confirm_kick'))) return
        const { error } = await supabase.rpc('kick_team_member', { target_user_id: targetId })
        if (error) throw error
      } else if (action === 'promote') {
        const { error } = await supabase.rpc('update_member_role', { target_user_id: targetId, new_role: role })
        if (error) throw error
      } else if (action === 'transfer') {
        const { error } = await supabase.rpc('transfer_team_leadership', { new_leader_id: targetId })
        if (error) throw error
        setTransferTarget(null)
      }
      await fetchData()
      setShowManageMenu(null)
    } catch (err) {
      alert(t('err_default') + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAwardHours = async (e) => {
    e.preventDefault()
    if (!awardHoursAmount || isNaN(awardHoursAmount) || awardHoursAmount <= 0) return
    setIsProcessing(true)
    try {
      const amount = Number(awardHoursAmount)
      
      // 1. Insert into log
      const { error: logError } = await supabase.from('volunteer_hours_log').insert([{
        user_id: awardHoursTarget.id,
        team_id: id,
        hours: amount,
        reason: awardHoursReason,
        granted_by: user.id
      }])
      if (logError) throw logError

      // 2. Update profile total_hours (fallback to manual update if RPC fails/doesn't exist)
      const { data: profileData } = await supabase.from('profiles').select('total_hours').eq('id', awardHoursTarget.id).single()
      const newHours = (profileData?.total_hours || 0) + amount
      const { error: updateError } = await supabase.from('profiles').update({ total_hours: newHours }).eq('id', awardHoursTarget.id)
      
      if (updateError) throw updateError

      await fetchData()
      setAwardHoursTarget(null)
      setAwardHoursAmount('')
      setAwardHoursReason('')
    } catch (err) {
      alert(t('err_award') + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const startLeaveTeam = async () => {
    if (!confirm(t('confirm_leave_team'))) return
    setIsProcessing(true)
    try {
      const { error } = await supabase.rpc('leave_team')
      if (error) throw error
      
      await refreshProfile()
      navigate('/teams')
    } catch (err) {
      alert(t('err_default') + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const startTransfer = (m) => {
    setTransferTarget(m)
    setCountdown(5)
    setShowManageMenu(null)
  }
  if (loading) return <LoadingScreen message={t('loading_team')} />;
  if (error || !team) return <div className="text-center py-20"><h2 className="text-red-500 font-bold">{error || t('team_not_found')}</h2></div>

  const primaryColor = team.color_primary || '#1B4332'
  
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6 px-4">
      
      {/* BANNER */}
      <div className="rounded-[2.5rem] card-shadow overflow-hidden relative" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 p-10 md:p-16 flex flex-col items-center text-white text-center">
          
          {/* BIGGER AND MORE PROMINENT "YOUR TEAM" BADGE */}
          {isMyTeam && (
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="bg-white text-indigo-600 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-bounce-subtle border-b-4 border-indigo-200">
                 <span className="text-xl">⭐️</span> {t('your_clan')} <span className="text-xl">⭐️</span>
              </div>
              
              {!amICoordinator && (
                <button 
                  onClick={startLeaveTeam}
                  disabled={isProcessing}
                  className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? t('leaving_progress') : t('leave_team')}
                </button>
              )}
            </div>
          )}

          <div className="w-32 h-32 rounded-[2rem] border-4 border-white overflow-hidden bg-white mb-6 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300">
            {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <span className="text-5xl font-brand text-gray-300">{team.name[0]}</span>}
          </div>
          <h1 className="text-5xl md:text-6xl font-brand mb-4 text-shadow-lg">{team.name}</h1>
          {team.slogan && <p className="text-xl italic opacity-90 mb-8 max-w-3xl font-medium">"{team.slogan}"</p>}
          
          <div className="flex gap-8 bg-black/30 px-10 py-5 rounded-[2rem] border border-white/20 backdrop-blur-lg shadow-xl">
            <div className="text-center">
              <div className="text-4xl font-black leading-tight">{members.reduce((a, m) => a + (m.total_hours || 0), 0)}</div>
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">{t('stat_total_hours')}</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-4xl font-black leading-tight">{members.length}</div>
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">{t('stat_fighters')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: MAIN MEMBER LIST */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white rounded-[2rem] card-shadow">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 rounded-t-[2rem]">
              <h2 className="text-2xl font-brand flex items-center gap-3">
                <span className="bg-indigo-100 p-2 rounded-xl">👥</span> {t('clan_members')}
              </h2>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Hall of Fame</div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {members.map((member, index) => {
                const isAdmin = member.role === 'coordinator'
                const isSub = member.role === 'sub_coordinator'
                const isMe = member.id === user?.id
                const isTargeting = showManageMenu === member.id

                return (
                  <div key={member.id} className={`flex items-center p-6 hover:bg-gray-50/80 transition-all ${index < 3 ? 'bg-indigo-50/10' : ''} ${isMe ? 'border-l-8' : ''}`} style={isMe ? { borderColor: primaryColor } : {}}>
                    {/* Rank Number */}
                    <div className="w-12 font-brand text-3xl text-gray-200/80 italic">{index + 1}</div>
                    
                    {/* Avatar */}
                    <Link to={`/profile/${member.id}`} className="relative group flex-shrink-0 ml-2">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md transition-all group-hover:rounded-xl group-hover:scale-105">
                        {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                      </div>
                      {(isAdmin || isSub) && (
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs border-2 border-white shadow-indigo-100 shadow-lg ${isAdmin ? 'bg-red-500' : 'bg-indigo-500'} text-white`}>
                          {isAdmin ? '🛡️' : '⚖️'}
                        </div>
                      )}
                    </Link>

                    {/* Member Info */}
                    <div className="ml-5 flex-1 min-w-0">
                      <Link to={`/profile/${member.id}`} className="font-black text-gray-800 hover:text-indigo-600 transition-colors block truncate text-sm">
                        {member.first_name} {member.last_name} {isMe && <span className="text-[10px] text-indigo-400 font-bold ml-1 uppercase">{t('you')}</span>}
                      </Link>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* DISTINCT ROLE BADGES */}
                        {isAdmin && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border border-red-100">{t('role_coord_badge')}</span>}
                        {isSub && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border border-indigo-100">{t('role_sub_badge')}</span>}
                        {!isAdmin && !isSub && <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border border-gray-100">{t('role_vol_badge')}</span>}
                        
                        <span className="text-gray-400 text-[10px] font-medium">• {getRankName(member.total_hours || 0)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xl font-brand text-indigo-950 leading-none">{member.total_hours || 0}</div>
                        <div className="text-[9px] uppercase font-black text-gray-400 tracking-widest">{t('hours_unit')}</div>
                      </div>

                      {/* ACTIONS MENU */}
                      {(amICoordinator || (amISub && member.role === 'volunteer')) && !isMe && (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setShowManageMenu(isTargeting ? null : member.id);
                            }}
                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${isTargeting ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white hover:bg-gray-100 text-gray-400 border-gray-100'} active:scale-95 text-xl`}
                          >
                            ⋮
                          </button>
                          {isTargeting && (
                            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                              {/* ANY MANAGER can award hours to volunteers, only OWNER can award to SUBS */}
                              {(amICoordinator || (amISub && !isSub && !isAdmin)) && (
                                <>
                                  <button onClick={() => { setAwardHoursTarget(member); setShowManageMenu(null); }} className="w-full text-left px-4 py-3 text-xs text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-3 font-bold transition-colors">
                                    {t('action_award_hours')}
                                  </button>
                                  <div className="h-px bg-gray-50 my-2" />
                                </>
                              )}

                              <button onClick={() => handleAction('kick', member.id)} className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 font-black uppercase tracking-tighter transition-colors">
                                {t('action_kick')}
                              </button>
                              
                              {amICoordinator && (
                                <>
                                  <div className="h-px bg-gray-50 my-2" />
                                  {isSub ? (
                                    <button onClick={() => handleAction('promote', member.id, 'volunteer')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 rounded-xl flex items-center gap-3 font-bold transition-colors">
                                      {t('action_demote')}
                                    </button>
                                  ) : (
                                    <button onClick={() => handleAction('promote', member.id, 'sub_coordinator')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 rounded-xl flex items-center gap-3 font-bold transition-colors">
                                      {t('action_promote')}
                                    </button>
                                  )}
                                  {!isAdmin && (
                                    <button onClick={() => startTransfer(member)} className="w-full text-left px-4 py-3 text-xs text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-3 font-black uppercase tracking-tighter transition-all">
                                      {t('action_transfer')}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NEWS & ABOUT */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Post News Form */}
          {canPost && (
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-600 rounded-[2rem] p-8 shadow-2xl shadow-indigo-100 text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                <span className="bg-white/20 p-1.5 rounded-lg shadow-inner">✍️</span> {t('new_announcement_title')}
              </h3>
              <form onSubmit={handlePostAnnouncement}>
                <textarea 
                  className="w-full bg-white/10 border-white/20 rounded-2xl p-4 text-sm placeholder:text-white/40 focus:ring-4 focus:ring-white/20 border text-white min-h-[120px] transition-all resize-none"
                  placeholder={t('new_announcement_placeholder')}
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <button 
                  disabled={isPosting || !newAnnouncement.trim()}
                  className="w-full bg-white text-indigo-700 font-black py-4 rounded-xl mt-4 hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[11px]"
                >
                  {isPosting ? t('btn_publishing') : t('btn_publish')}
                </button>
              </form>
            </div>
          )}

          {/* COMPACT NEWS FEED */}
          <div className="bg-white rounded-[2rem] card-shadow overflow-hidden flex flex-col h-[550px] border border-gray-50">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-brand flex items-center gap-2">{t('news_title')}</h2>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">History</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {annError ? (
                 <div className="text-center py-20 px-6">
                    <div className="text-3xl mb-4">⚠️</div>
                    <p className="text-xs text-red-400 font-black uppercase leading-tight mb-2">{t('err_connection')}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">{annError}</p>
                 </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-24 text-gray-300">
                  <div className="text-3xl mb-4 opacity-30">📭</div>
                  <p className="text-xs italic">{t('no_news')}</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-gray-50/80 rounded-2xl p-4 border border-transparent hover:border-indigo-100 transition-all group hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50">
                    <div className="flex justify-between items-center mb-3">
                      <Link to={`/profile/${ann.author_id}`} className="flex items-center gap-2.5 group/author">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500 overflow-hidden shadow-sm ring-2 ring-white">
                          {ann.author?.avatar_url && <img src={ann.author.avatar_url} className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-[11px] font-black text-gray-700 group-hover/author:text-indigo-600 truncate max-w-[120px] transition-colors">
                          {ann.author?.first_name}
                        </span>
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-gray-300">{new Date(ann.created_at).toLocaleDateString()}</span>
                        {canPost && (
                           <button onClick={() => handleDeleteAnnouncement(ann.id)} className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-500 transition-all">🗑️</button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-[1.6] whitespace-pre-wrap font-medium">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ABOUT CARD */}
          <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100/50">
            <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-indigo-300 mb-4">{t('clan_manifesto')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              {team.description || t('no_manifesto')}
            </p>
          </div>

        </div>
      </div>

      {/* MODAL: TRANSFER LEADERSHIP */}
      {transferTarget && (
         <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500">
               <div className="text-6xl mb-8 filter drop-shadow-lg">👑</div>
               <h3 className="text-3xl font-brand mb-4 text-gray-900">{t('transfer_title')}</h3>
               <p className="text-sm text-gray-500 mb-10 leading-relaxed px-2">
                  {t('transfer_desc1')} <span className="font-black text-indigo-600">{transferTarget.first_name}</span>.<br /><br />
                  <span className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-red-100">
                    {t('transfer_desc2')}
                  </span>
               </p>
               
               <div className="space-y-4">
                  <button 
                    disabled={countdown > 0 || isProcessing}
                    onClick={() => handleAction('transfer', transferTarget.id)}
                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 transition-all text-xs uppercase tracking-[0.2em]"
                  >
                    {countdown > 0 ? t('btn_confirm_transfer_wait').replace('{seconds}', countdown) : t('btn_confirm_transfer')}
                  </button>
                  <button onClick={() => setTransferTarget(null)} className="w-full py-4 text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition-colors">
                    {t('btn_change_mind')}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL: AWARD HOURS */}
      {awardHoursTarget && (
         <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="text-xl font-bold flex items-center gap-2"><span>⏱</span> {t('award_title')}</h3>
                 <button onClick={() => setAwardHoursTarget(null)} className="text-gray-400 hover:text-gray-600">✕</button>
               </div>
               <p className="text-sm text-gray-500 mb-6">{t('volunteer')} <span className="font-bold text-indigo-600">{awardHoursTarget.first_name} {awardHoursTarget.last_name}</span></p>
               
               <form onSubmit={handleAwardHours} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('amount_hours')}</label>
                    <input type="number" step="0.5" min="0.5" max="10000" required value={awardHoursAmount} onChange={e => setAwardHoursAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold" placeholder={t('amount_placeholder')} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('award_reason')}</label>
                    <textarea required value={awardHoursReason} onChange={e => setAwardHoursReason(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24 text-sm" placeholder={t('award_reason_placeholder')} />
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 mt-2">
                    {isProcessing ? t('btn_saving') : t('btn_confirm_award')}
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  )
}

export default TeamDetailsPage
