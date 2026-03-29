import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstNameEn, setFirstNameEn] = useState('')
  const [lastNameEn, setLastNameEn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('volunteer')
  const [teamAction, setTeamAction] = useState('join')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [adminPosition, setAdminPosition] = useState('coordinator')
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [newTeamInsta, setNewTeamInsta] = useState('')
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [latinError, setLatinError] = useState(false)

  // Fetch approved teams from Supabase
  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('status', 'approved')
        .order('name')
      
      if (data && data.length > 0) {
        setTeams(data)
      } else if (error) {
        console.error('Error fetching teams:', error)
      } else {
        setTeams([])
      }
    }
    fetchTeams()
  }, [])

  const handleLatinChange = (setter) => (e) => {
    const val = e.target.value;
    if (/[^a-zA-Z\s-]/.test(val)) {
      setLatinError(true);
      setTimeout(() => setLatinError(false), 3000);
    }
    // Only allow Latin letters, spaces, and hyphens to enforce user requirement
    const filtered = val.replace(/[^a-zA-Z\s-]/g, '');
    setter(filtered);
  };

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validate
    if (!firstName.trim() || !lastName.trim() || !firstNameEn.trim() || !lastNameEn.trim()) {
      setError('Заполните все поля имен (кириллица и латинница)')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов')
      setLoading(false)
      return
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password)) {
      setError('Пароль должен содержать только латинские буквы, цифры и спецсимволы (без кириллицы)')
      setLoading(false)
      return
    }

    // Name Validations
    const cyrillicRegex = /^[А-Яа-яӘәІіҢңҒғҮүҰұҚқӨөҺһ\s-]+$/;
    const latinRegex = /^[A-Za-z\s-]+$/;

    if (!cyrillicRegex.test(firstName.trim()) || !cyrillicRegex.test(lastName.trim())) {
      setError('Имя и Фамилия должны быть написаны кириллицей (русские/казахские буквы)')
      setLoading(false)
      return
    }

    if (firstNameEn.trim() || lastNameEn.trim()) {
      if (!firstNameEn.trim() || !lastNameEn.trim()) {
        setError('Если заполняете английское имя, укажите и имя, и фамилию')
        setLoading(false)
        return
      }
      if (!latinRegex.test(firstNameEn.trim()) || !latinRegex.test(lastNameEn.trim())) {
        setError('Английское имя и фамилия должны быть написаны только латинскими буквами')
        setLoading(false)
        return
      }
    }

    let teamId = selectedTeam || null
    let finalRole = role === 'coordinator' ? adminPosition : role

    // If coordinator wants to create a new team
    if (role === 'coordinator' && teamAction === 'create') {
      if (!newTeamName.trim()) {
        setError('Укажите название команды')
        setLoading(false)
        return
      }
      teamId = null 
      finalRole = 'coordinator' // Creator of a team is always the coordinator
    }

    // If volunteer, must select a team
    if (role === 'volunteer' && !selectedTeam) {
      setError('Выберите команду')
      setLoading(false)
      return
    }

    const { data, error: authError } = await signUp({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      firstNameEn: firstNameEn.trim(),
      lastNameEn: lastNameEn.trim(),
      role: finalRole,
      teamId,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If coordinator creating new team, submit team request
    if (role === 'coordinator' && teamAction === 'create' && data?.user) {
      await supabase.from('team_requests').insert({
        team_name: newTeamName.trim(),
        description: newTeamDesc.trim(),
        instagram: newTeamInsta.trim(),
        requested_by: data.user.id,
      })
    }

    setSuccess('✅ Регистрация успешна! Проверьте почту для подтверждения.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Jas Volunteers" className="h-14 w-14 mx-auto mb-2 object-contain" />
          <h1 className="font-brand text-2xl text-[var(--color-text-heading)] uppercase">Регистрация</h1>
        </div>

        {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
        {success && <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Имя (кириллица)</label>
              <input type="text" placeholder="Айдар" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Фамилия (кириллица)</label>
              <input type="text" placeholder="Касымов" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-600 font-bold">First Name (Latin)</label>
              <input type="text" placeholder="Aidar" value={firstNameEn} onChange={handleLatinChange(setFirstNameEn)} className="input input-bordered w-full rounded-xl bg-indigo-50 border-indigo-200" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-600 font-bold">Last Name (Latin)</label>
              <input type="text" placeholder="Kasymov" value={lastNameEn} onChange={handleLatinChange(setLastNameEn)} className="input input-bordered w-full rounded-xl bg-indigo-50 border-indigo-200" required />
            </div>
            {latinError && (
              <div className="col-span-2 text-[10px] text-red-500 font-bold animate-pulse">
                ⚠️ Пишите только латинскими буквами (English/Latin only)
              </div>
            )}
          </div>

          <p className="text-[10px] text-indigo-400 font-medium mb-3 -mt-1 italic">
            * Латинские имена нужны для автоматического формирования вашего англоязычного портфолио для вузов
          </p>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input type="email" placeholder="volunteer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Минимум 8 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200 pr-12"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Я регистрируюсь как:</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('volunteer')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors text-xs ${role === 'volunteer' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                🙋 Волонтер
              </button>
              <button type="button" onClick={() => setRole('coordinator')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors text-xs ${role === 'coordinator' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                🛡️ Координатор
              </button>
            </div>
          </div>

          {/* Team Selection (Volunteer) */}
          {role === 'volunteer' && (
            <div>
              <label className="text-sm font-medium mb-1 block">Выберите команду</label>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required>
                <option value="">— Выберите команду —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Coordinator Logic */}
          {role === 'coordinator' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setTeamAction('join')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${teamAction === 'join' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  Присоединиться
                </button>
                <button type="button" onClick={() => setTeamAction('create')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${teamAction === 'create' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  ➕ Создать новую
                </button>
              </div>

              {teamAction === 'join' && (
                <div className="space-y-3">
                  <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required>
                    <option value="">— Команда —</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select value={adminPosition} onChange={(e) => setAdminPosition(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200">
                    <option value="coordinator">Координатор</option>
                    <option value="sub_coordinator">Зам. координатора</option>
                  </select>
                </div>
              )}

              {teamAction === 'create' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">📋 Новая команда</p>
                  <input type="text" placeholder="Название команды" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="input input-bordered w-full rounded-xl bg-white border-gray-200 text-sm" required />
                  <textarea placeholder="Описание проекта..." value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} className="textarea textarea-bordered w-full rounded-xl bg-white border-gray-200 text-sm resize-none" rows="2" />
                  <input type="text" placeholder="Instagram (@team)" value={newTeamInsta} onChange={(e) => setNewTeamInsta(e.target.value)} className="input input-bordered w-full rounded-xl bg-white border-gray-200 text-sm" />
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-jas w-full rounded-xl text-base mt-2" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Присоединиться к Jas Volunteers 🚀'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-body)] mt-4">
          Уже есть аккаунт? <NavLink to="/login" className="text-[var(--color-primary)] font-medium underline">Войти</NavLink>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
