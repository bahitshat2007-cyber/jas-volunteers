import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn({ email, password })

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Неверный email или пароль'
        : authError.message
      )
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Jas Volunteers" className="h-16 w-16 mx-auto mb-3 object-contain" />
          <h1 className="font-brand text-2xl text-[var(--color-text-heading)]">
            JAS <span className="text-[var(--color-primary)]">VOLUNTEERS</span>
          </h1>
          <p className="text-[var(--color-text-body)] mt-1">Войдите в свой аккаунт</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-[var(--color-text-heading)] mb-1 block" htmlFor="login-email">
              Email
            </label>
            <input
              type="email"
              id="login-email"
              placeholder="volunteer@example.com"
              className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200 focus:border-[var(--color-primary)] focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text-heading)] mb-1 block" htmlFor="login-password">
              Пароль
            </label>
            <input
              type="password"
              id="login-password"
              placeholder="••••••••"
              className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200 focus:border-[var(--color-primary)] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-jas w-full rounded-xl text-base"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-body)] mt-6">
          Нет аккаунта?{' '}
          <NavLink to="/register" className="text-[var(--color-primary)] font-medium hover:underline">
            Зарегистрироваться
          </NavLink>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
