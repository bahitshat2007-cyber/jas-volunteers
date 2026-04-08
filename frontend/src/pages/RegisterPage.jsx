import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { useLanguage } from '../context/LanguageContext.jsx'

function RegisterPage() {
  const { signUp } = useAuth()
  const { t } = useLanguage()
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
      setError(t('err_fill_all_names'))
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError(t('err_pass_length'))
      setLoading(false)
      return
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password)) {
      setError(t('err_pass_chars'))
      setLoading(false)
      return
    }

    // Name Validations
    const cyrillicRegex = /^[А-Яа-яӘәІіҢңҒғҮүҰұҚқӨөҺһ\s-]+$/;
    const latinRegex = /^[A-Za-z\s-]+$/;

    if (!cyrillicRegex.test(firstName.trim()) || !cyrillicRegex.test(lastName.trim())) {
      setError(t('err_names_cyrillic'))
      setLoading(false)
      return
    }

    if (firstNameEn.trim() || lastNameEn.trim()) {
      if (!firstNameEn.trim() || !lastNameEn.trim()) {
        setError(t('err_names_latin_both'))
        setLoading(false)
        return
      }
      if (!latinRegex.test(firstNameEn.trim()) || !latinRegex.test(lastNameEn.trim())) {
        setError(t('err_names_latin_only'))
        setLoading(false)
        return
      }
    }

    let teamId = selectedTeam || null
    let finalRole = role === 'coordinator' ? adminPosition : role

    // If coordinator wants to create a new team
    if (role === 'coordinator' && teamAction === 'create') {
      if (!newTeamName.trim()) {
        setError(t('err_req_team_name'))
        setLoading(false)
        return
      }
      teamId = null 
      finalRole = 'coordinator' // Creator of a team is always the coordinator
    }

    // If volunteer, must select a team
    if (role === 'volunteer' && !selectedTeam) {
      setError(t('err_req_team_select'))
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

    setSuccess(t('success_register'))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Jas Volunteers" className="h-14 w-14 mx-auto mb-2 object-contain" />
          <h1 className="font-brand text-2xl text-[var(--color-text-heading)] uppercase">{t('register_title')}</h1>
        </div>

        {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
        {success && <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('label_fn_cyrillic')}</label>
              <input type="text" placeholder="Айдар" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('label_ln_cyrillic')}</label>
              <input type="text" placeholder="Касымов" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-600 font-bold">{t('label_fn_latin')}</label>
              <input type="text" placeholder="Aidar" value={firstNameEn} onChange={handleLatinChange(setFirstNameEn)} className="input input-bordered w-full rounded-xl bg-indigo-50 border-indigo-200" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-indigo-600 font-bold">{t('label_ln_latin')}</label>
              <input type="text" placeholder="Kasymov" value={lastNameEn} onChange={handleLatinChange(setLastNameEn)} className="input input-bordered w-full rounded-xl bg-indigo-50 border-indigo-200" required />
            </div>
            {latinError && (
              <div className="col-span-2 text-[10px] text-red-500 font-bold animate-pulse">
                {t('latin_warning')}
              </div>
            )}
          </div>

          <p className="text-[10px] text-indigo-400 font-medium mb-3 -mt-1 italic">
            {t('latin_note')}
          </p>

          <div>
            <label className="text-sm font-medium mb-1 block">{t('label_email')}</label>
            <input type="email" placeholder="volunteer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t('label_password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('placeholder_min_8')}
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
            <label className="text-sm font-medium mb-2 block">{t('label_register_as')}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('volunteer')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors text-xs ${role === 'volunteer' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {t('btn_role_vol')}
              </button>
              <button type="button" onClick={() => setRole('coordinator')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors text-xs ${role === 'coordinator' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {t('btn_role_coord')}
              </button>
            </div>
          </div>

          {/* Team Selection (Volunteer) */}
          {role === 'volunteer' && (
            <div>
              <label className="text-sm font-medium mb-1 block">{t('label_select_team')}</label>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required>
                <option value="">{t('option_select_team')}</option>
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
                  {t('btn_action_join')}
                </button>
                <button type="button" onClick={() => setTeamAction('create')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${teamAction === 'create' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {t('btn_action_create')}
                </button>
              </div>

              {teamAction === 'join' && (
                <div className="space-y-3">
                  <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200" required>
                    <option value="">{t('option_team')}</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select value={adminPosition} onChange={(e) => setAdminPosition(e.target.value)} className="select select-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200">
                    <option value="coordinator">{t('option_coord')}</option>
                    <option value="sub_coordinator">{t('option_sub_coord')}</option>
                  </select>
                </div>
              )}

              {teamAction === 'create' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('label_new_team')}</p>
                  <input type="text" placeholder={t('placeholder_team_name')} value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="input input-bordered w-full rounded-xl bg-white border-gray-200 text-sm" required />
                  <textarea placeholder={t('placeholder_team_desc')} value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} className="textarea textarea-bordered w-full rounded-xl bg-white border-gray-200 text-sm resize-none" rows="2" />
                  <input type="text" placeholder={t('placeholder_team_insta')} value={newTeamInsta} onChange={(e) => setNewTeamInsta(e.target.value)} className="input input-bordered w-full rounded-xl bg-white border-gray-200 text-sm" />
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-jas w-full rounded-xl text-base mt-2" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : t('btn_join_jas')}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-body)] mt-4">
          {t('already_have_account')} <NavLink to="/login" className="text-[var(--color-primary)] font-medium underline">{t('btn_login_link')}</NavLink>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
