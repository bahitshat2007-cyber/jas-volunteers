import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ volunteers: 0, teams: 0, reports: 0, events: 0, donations: 0 })
  const [reports, setReports] = useState([])
  const [donations, setDonations] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'developer')) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch Stats
        const [vCount, tCount, rCount, eCount, dCount] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        setStats({
          volunteers: vCount.count || 0,
          teams: tCount.count || 0,
          reports: rCount.count || 0,
          events: eCount.count || 0,
          donations: dCount.count || 0
        })

        // Fetch Reports
        const { data: repData } = await supabase
          .from('reports')
          .select('*, reporter:profiles!reporter_id(first_name, last_name)')
          .order('created_at', { ascending: false })
        setReports(repData || [])

        // Fetch Donations
        const { data: donData } = await supabase
          .from('donations')
          .select('*, user:profiles!user_id(first_name, last_name)')
          .order('created_at', { ascending: false })
        setDonations(donData || [])

        // Fetch Users
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('first_name', `%${search}%`)
          .limit(50)
        setUsers(userData || [])

      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profile, search])

  const updateRole = async (uid, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', uid)
    if (error) alert(error.message)
    else setSearch(search + ' ') // Trigger re-fetch
  }

  const resolveReport = async (rid) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'resolved' })
      .eq('id', rid)
    if (error) alert(error.message)
    else setReports(reports.map(r => r.id === rid ? { ...r, status: 'resolved' } : r))
  }

  const confirmDonation = async (did, uid) => {
    // 1. Mark donation as confirmed
    const { error: dError } = await supabase
      .from('donations')
      .update({ status: 'confirmed' })
      .eq('id', did)
    
    if (dError) {
      alert(dError.message)
      return
    }

    // 2. Mark user as supporter
    const { error: uError } = await supabase
      .from('profiles')
      .update({ is_supporter: true })
      .eq('id', uid)

    if (uError) alert(uError.message)
    else {
      setDonations(donations.map(d => d.id === did ? { ...d, status: 'confirmed' } : d))
      setStats({ ...stats, donations: stats.donations - 1 })
    }
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'developer')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">Доступ запрещен</h1>
        <button onClick={() => navigate('/')} className="btn btn-jas rounded-xl">На главную</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl card-shadow p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-red-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🛠️</div>
          <div>
            <h1 className="text-2xl font-brand text-gray-900">Developer Panel</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{profile.role.toUpperCase()} ACCESS</p>
          </div>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-2xl overflow-x-auto">
          {['stats', 'users', 'reports', 'donations'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'stats' && '📊 Инфо'}
              {tab === 'users' && '👥 Юзеры'}
              {tab === 'reports' && `📩 Жалобы (${stats.reports})`}
              {tab === 'donations' && `❤️ Донаты (${stats.donations})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Загрузка данных...</div>
      ) : (
        <>
          {/* Stats View */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
                <div className="text-3xl mb-2">🧑‍🤝‍🧑</div>
                <div className="text-2xl font-bold">{stats.volunteers}</div>
                <p className="text-xs text-gray-400 uppercase font-black">Волонтеров</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold">{stats.teams}</div>
                <p className="text-xs text-gray-400 uppercase font-black">Команд</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold">{stats.events}</div>
                <p className="text-xs text-gray-400 uppercase font-black">Ивентов</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow border-2 border-red-100">
                <div className="text-3xl mb-1 text-red-500">📩 {stats.reports}</div>
                <div className="text-3xl text-green-500">❤️ {stats.donations}</div>
                <p className="text-xs text-gray-400 uppercase font-black mt-2">Ожидают проверки</p>
              </div>
            </div>
          )}

          {/* Users View */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl card-shadow overflow-hidden">
               <div className="p-4 border-b">
                 <input 
                   type="text" 
                   placeholder="Поиск по имени..." 
                   className="w-full bg-gray-50 px-4 py-2 rounded-xl outline-none"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                     <tr>
                       <th className="px-6 py-4">Имя</th>
                       <th className="px-6 py-4">Роль</th>
                       <th className="px-6 py-4">Статус</th>
                       <th className="px-6 py-4">Действие</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {users.map(u => (
                       <tr key={u.id}>
                         <td className="px-6 py-4 text-sm font-semibold">
                            {u.first_name} {u.last_name}
                            {u.is_supporter && <span className="ml-2 text-xs">✨</span>}
                         </td>
                         <td className="px-6 py-4 text-sm font-medium text-gray-600">{u.role.toUpperCase()}</td>
                         <td className="px-6 py-4">
                            {u.is_supporter ? (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-bold uppercase">Supporter</span>
                            ) : (
                              <span className="text-[10px] text-gray-300">Regular</span>
                            )}
                         </td>
                         <td className="px-6 py-4">
                           <select 
                             className="text-xs bg-gray-50 p-1 rounded-md border"
                             value={u.role}
                             onChange={(e) => updateRole(u.id, e.target.value)}
                           >
                             <option value="volunteer">Volunteer</option>
                             <option value="manager">Manager</option>
                             <option value="admin">Admin</option>
                             <option value="developer">Developer</option>
                           </select>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* Reports View */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Жалоб пока нет ☕</div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className={`bg-white rounded-2xl p-6 card-shadow border-l-4 ${r.status === 'pending' ? 'border-red-500' : 'border-green-500 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${r.category === 'bug' ? 'text-blue-500' : 'text-red-500'}`}>
                             {r.category.toUpperCase()}
                           </span>
                           <span className="text-[10px] text-gray-400">• {new Date(r.created_at).toLocaleString()}</span>
                         </div>
                         <h3 className="font-bold text-gray-900">От: {r.reporter?.first_name} {r.reporter?.last_name}</h3>
                       </div>
                       {r.status === 'pending' && (
                         <button onClick={() => resolveReport(r.id)} className="bg-green-50 text-green-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white">Решено ✅</button>
                       )}
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl mb-4 italic">"{r.content}"</p>
                    {r.image_url && <a href={r.image_url} target="_blank" rel="noreferrer"><img src={r.image_url} alt="Proof" className="w-full max-w-sm rounded-xl border hover:opacity-80" /></a>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Donations View */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              {donations.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Донатов пока нет 😿</div>
              ) : (
                donations.map(d => (
                  <div key={d.id} className={`bg-white rounded-2xl p-6 card-shadow border-l-4 ${d.status === 'pending' ? 'border-green-500' : 'border-gray-300 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${d.method === 'da' ? 'text-orange-500' : 'text-green-600'}`}>
                             {d.method === 'da' ? '🌍 DonationAlerts' : '🇰🇿 Kaspi'}
                           </span>
                           <span className="text-[10px] text-gray-400">• {new Date(d.created_at).toLocaleString()}</span>
                         </div>
                         <h3 className="font-bold text-gray-900">Сумма: {d.amount} ₸</h3>
                         <p className="text-xs text-gray-500">От: {d.user?.first_name} {d.user?.last_name}</p>
                       </div>
                       {d.status === 'pending' && (
                         <button 
                           onClick={() => confirmDonation(d.id, d.user_id)}
                           className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                         >
                           Подтвердить ✨
                         </button>
                       )}
                    </div>
                    {d.comment && <p className="text-sm text-gray-700 bg-green-50 p-4 rounded-xl mb-4">💬 "{d.comment}"</p>}
                    {d.image_url && <a href={d.image_url} target="_blank" rel="noreferrer"><img src={d.image_url} alt="Receipt" className="w-full max-w-xs rounded-xl border border-green-100" /></a>}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
